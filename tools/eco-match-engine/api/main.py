"""
main.py  —  ECS Eco-Match Engine · FastAPI application
"""

from __future__ import annotations

import os
from typing import List, Optional

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from matcher import find_matches, load_data, MatchResult
from geo_utils import co2_saved_kg, cost_saved_eur


# ---------------------------------------------------------------------------
# App init
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ECS Eco-Match Engine",
    description=(
        "Matches outbound ECS trips that would otherwise deadhead (return empty) "
        "to open export orders in the same region — reducing CO₂ and cost."
    ),
    version="1.0.0",
    contact={
        "name": "ECS European Containers",
        "url": "https://www.ecs.be",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Serve demo UI
# ---------------------------------------------------------------------------

DEMO_DIR = os.path.join(os.path.dirname(__file__), "..", "demo")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "mock_orders.json")

if os.path.isdir(DEMO_DIR):
    app.mount("/demo", StaticFiles(directory=DEMO_DIR, html=True), name="demo")

# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class MatchResponse(BaseModel):
    match_id: str
    trip_id: str
    trailer_id: str
    trip_destination: str
    trip_arrival_dt: str
    order_id: str
    client: str
    pickup_location: str
    container_size: str
    weight_kg: int
    revenue_eur: float
    pickup_distance_km: float
    time_gap_h: float
    return_distance_km: float
    confidence_score: float
    co2_saved_kg: float
    cost_saved_eur: float
    order_deadline: str


class SummaryResponse(BaseModel):
    total_matches: int
    total_revenue_eur: float
    total_co2_saved_kg: float
    total_cost_saved_eur: float
    avg_confidence: float


class HealthResponse(BaseModel):
    status: str
    version: str
    data_loaded: bool


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def root():
    """Redirect root to demo UI."""
    return FileResponse(os.path.join(DEMO_DIR, "index.html"))


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        data_loaded=os.path.exists(DATA_PATH),
    )


@app.get("/matches", response_model=List[MatchResponse], tags=["Matching"])
def get_matches(
    radius_km: float = Query(50.0, ge=1, le=500, description="Search radius in km"),
    time_window_h: float = Query(6.0, ge=0.5, le=48, description="Max time gap in hours"),
    min_confidence: float = Query(0.0, ge=0, le=100, description="Minimum confidence score"),
):
    """
    Return all viable trip-order matches within the given radius and time window.
    Results are sorted by confidence score (best first).
    """
    trips, orders = load_data(DATA_PATH)
    matches: List[MatchResult] = find_matches(
        trips, orders,
        radius_km=radius_km,
        time_window_h=time_window_h,
        min_confidence=min_confidence,
    )
    return [m.to_dict() for m in matches]


@app.get("/summary", response_model=SummaryResponse, tags=["Matching"])
def get_summary(
    radius_km: float = Query(50.0, ge=1, le=500),
    time_window_h: float = Query(6.0, ge=0.5, le=48),
):
    """
    Aggregate statistics across all matches: total revenue, CO₂ saved, cost saved.
    """
    trips, orders = load_data(DATA_PATH)
    matches = find_matches(trips, orders, radius_km=radius_km, time_window_h=time_window_h)

    if not matches:
        return SummaryResponse(
            total_matches=0,
            total_revenue_eur=0,
            total_co2_saved_kg=0,
            total_cost_saved_eur=0,
            avg_confidence=0,
        )

    return SummaryResponse(
        total_matches=len(matches),
        total_revenue_eur=round(sum(m.order.revenue_eur for m in matches), 2),
        total_co2_saved_kg=round(sum(m.co2_saved_kg for m in matches), 1),
        total_cost_saved_eur=round(sum(m.cost_saved_eur for m in matches), 2),
        avg_confidence=round(sum(m.confidence_score for m in matches) / len(matches), 1),
    )


@app.post("/confirm/{match_id}", tags=["Matching"])
def confirm_match(match_id: str):
    """
    Simulate confirming a match — in production this would update TAS and
    Business Central via their respective APIs and notify the driver.

    Returns a mock confirmation payload.
    """
    parts = match_id.replace("ECO-", "").split("-BC-EXP-")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid match_id format")

    trip_id = parts[0]
    order_id = "BC-EXP-" + parts[1]

    return {
        "status": "confirmed",
        "match_id": match_id,
        "trip_id": trip_id,
        "order_id": order_id,
        "actions_triggered": [
            f"TAS trip {trip_id} updated: return_load = {order_id}",
            f"Business Central order {order_id} status → 'allocated'",
            "Driver notification sent via ECS Fleet App",
            "Customer confirmation email queued",
        ],
        "message": "Match confirmed. TAS and Business Central have been updated.",
    }
