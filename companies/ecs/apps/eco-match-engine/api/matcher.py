"""
matcher.py
Core matching algorithm for the ECS Eco-Match Engine.

Matches outbound trips that would return empty (deadhead) to open export
orders in the same geographic area and compatible time window.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from geo_utils import haversine, co2_saved_kg, cost_saved_eur


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_RADIUS_KM: float = 50.0        # Max pickup distance from drop-off point
DEFAULT_TIME_WINDOW_H: float = 6.0    # Hours the order must be ready within after trip arrival
MIN_CONFIDENCE: float = 0.0           # 0–100 confidence score threshold


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class Trip:
    trip_id: str
    trailer_id: str
    origin: str
    origin_lat: float
    origin_lng: float
    destination: str
    destination_lat: float
    destination_lng: float
    departure_dt: str
    arrival_dt: str
    load_type: str
    container_ref: str
    status: str
    return_load: Optional[str]

    @property
    def arrival(self) -> datetime:
        return datetime.fromisoformat(self.arrival_dt)


@dataclass
class ExportOrder:
    order_id: str
    client: str
    pickup_location: str
    pickup_lat: float
    pickup_lng: float
    destination: str
    destination_lat: float
    destination_lng: float
    ready_from_dt: str
    deadline_dt: str
    load_type: str
    weight_kg: int
    container_size: str
    status: str
    revenue_eur: float

    @property
    def ready_from(self) -> datetime:
        return datetime.fromisoformat(self.ready_from_dt)

    @property
    def deadline(self) -> datetime:
        return datetime.fromisoformat(self.deadline_dt)


@dataclass
class MatchResult:
    trip: Trip
    order: ExportOrder
    pickup_distance_km: float
    time_gap_h: float
    confidence_score: float
    co2_saved_kg: float
    cost_saved_eur: float
    return_distance_km: float

    def to_dict(self) -> dict:
        return {
            "match_id": f"ECO-{self.trip.trip_id}-{self.order.order_id}",
            "trip_id": self.trip.trip_id,
            "trailer_id": self.trip.trailer_id,
            "trip_destination": self.trip.destination,
            "trip_arrival_dt": self.trip.arrival_dt,
            "order_id": self.order.order_id,
            "client": self.order.client,
            "pickup_location": self.order.pickup_location,
            "container_size": self.order.container_size,
            "weight_kg": self.order.weight_kg,
            "revenue_eur": self.order.revenue_eur,
            "pickup_distance_km": round(self.pickup_distance_km, 1),
            "time_gap_h": round(self.time_gap_h, 1),
            "return_distance_km": round(self.return_distance_km, 1),
            "confidence_score": round(self.confidence_score, 1),
            "co2_saved_kg": self.co2_saved_kg,
            "cost_saved_eur": self.cost_saved_eur,
            "order_deadline": self.order.deadline_dt,
        }


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _confidence_score(
    pickup_distance_km: float,
    time_gap_h: float,
    radius_km: float,
    time_window_h: float,
) -> float:
    """
    Heuristic confidence score (0–100).
    Rewards proximity and tight time gaps. Both dimensions contribute equally.
    """
    distance_score = max(0.0, 1.0 - pickup_distance_km / radius_km)
    time_score = max(0.0, 1.0 - time_gap_h / time_window_h)
    return round((distance_score * 0.5 + time_score * 0.5) * 100, 1)


# ---------------------------------------------------------------------------
# Matching engine
# ---------------------------------------------------------------------------

def find_matches(
    trips: List[Trip],
    orders: List[ExportOrder],
    radius_km: float = DEFAULT_RADIUS_KM,
    time_window_h: float = DEFAULT_TIME_WINDOW_H,
    min_confidence: float = MIN_CONFIDENCE,
) -> List[MatchResult]:
    """
    Find all viable (trip, order) pairs within the configured radius and
    time window, ranked by confidence score descending.

    Args:
        trips:          List of outbound trips (that would otherwise deadhead)
        orders:         List of open export orders awaiting collection
        radius_km:      Maximum distance (km) between trip drop-off and order pickup
        time_window_h:  Maximum hours between trip arrival and order ready_from
        min_confidence: Minimum confidence score to include in results

    Returns:
        Sorted list of MatchResult objects (best match first)
    """
    results: List[MatchResult] = []

    eligible_trips = [t for t in trips if t.return_load is None]
    eligible_orders = [o for o in orders if o.status == "open"]

    for trip in eligible_trips:
        for order in eligible_orders:
            # Geo filter
            pickup_dist = haversine(
                trip.destination_lat, trip.destination_lng,
                order.pickup_lat, order.pickup_lng,
            )
            if pickup_dist > radius_km:
                continue

            # Time filter: order must be ready within [arrival, arrival + window]
            time_gap_h = (order.ready_from - trip.arrival).total_seconds() / 3600
            if not (0 <= time_gap_h <= time_window_h):
                continue

            # Also verify trailer can still make the deadline
            if order.deadline < trip.arrival:
                continue

            score = _confidence_score(pickup_dist, time_gap_h, radius_km, time_window_h)
            if score < min_confidence:
                continue

            return_dist = haversine(
                order.pickup_lat, order.pickup_lng,
                order.destination_lat, order.destination_lng,
            )

            results.append(
                MatchResult(
                    trip=trip,
                    order=order,
                    pickup_distance_km=pickup_dist,
                    time_gap_h=time_gap_h,
                    confidence_score=score,
                    co2_saved_kg=co2_saved_kg(return_dist),
                    cost_saved_eur=cost_saved_eur(return_dist),
                    return_distance_km=return_dist,
                )
            )

    results.sort(key=lambda r: r.confidence_score, reverse=True)

    # Greedy 1-to-1 deduplication: each trip and each order appears at most once.
    # Best-scoring match wins when there is a conflict.
    used_trips: set[str] = set()
    used_orders: set[str] = set()
    deduped: list[MatchResult] = []
    for r in results:
        if r.trip.trip_id not in used_trips and r.order.order_id not in used_orders:
            deduped.append(r)
            used_trips.add(r.trip.trip_id)
            used_orders.add(r.order.order_id)
    return deduped


# ---------------------------------------------------------------------------
# Data loader (JSON → dataclass)
# ---------------------------------------------------------------------------

def load_data(path: str) -> tuple[List[Trip], List[ExportOrder]]:
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    trips = [Trip(**t) for t in raw["outbound_trips"]]
    orders = [ExportOrder(**o) for o in raw["export_orders"]]
    return trips, orders


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_orders.json")
    trips, orders = load_data(data_path)

    matches = find_matches(trips, orders, radius_km=50, time_window_h=6)

    print(f"\n{'='*60}")
    print(f"  ECS Eco-Match Engine — {len(matches)} match(es) found")
    print(f"{'='*60}\n")

    for m in matches:
        d = m.to_dict()
        print(f"  ✅ {d['match_id']}")
        print(f"     Trailer   : {d['trailer_id']} arriving {d['trip_arrival_dt']}")
        print(f"     Client    : {d['client']} ({d['pickup_location']})")
        print(f"     Pickup Δ  : {d['pickup_distance_km']} km | {d['time_gap_h']}h wait")
        print(f"     Revenue   : €{d['revenue_eur']} | Confidence: {d['confidence_score']}%")
        print(f"     CO₂ saved : {d['co2_saved_kg']} kg | Cost saved: €{d['cost_saved_eur']}")
        print()
