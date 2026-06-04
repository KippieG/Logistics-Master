"""
tests/test_matcher.py
Unit tests for the Eco-Match Engine core logic.
"""

import sys
import os
import math

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

import pytest
from geo_utils import haversine, co2_saved_kg, cost_saved_eur
from matcher import Trip, ExportOrder, find_matches, _confidence_score


# ---------------------------------------------------------------------------
# geo_utils tests
# ---------------------------------------------------------------------------

class TestHaversine:
    def test_same_point_is_zero(self):
        assert haversine(51.33, 3.20, 51.33, 3.20) == pytest.approx(0.0, abs=0.01)

    def test_zeebrugge_to_duisburg(self):
        # Haversine (straight-line) distance ~247 km
        dist = haversine(51.3322, 3.2003, 51.4344, 6.7623)
        assert 230 < dist < 270

    def test_symmetry(self):
        a = haversine(51.33, 3.20, 51.43, 6.76)
        b = haversine(51.43, 6.76, 51.33, 3.20)
        assert a == pytest.approx(b, rel=1e-6)

    def test_nearby_points(self):
        # Two points ~50 km apart
        dist = haversine(51.33, 3.20, 51.33, 3.93)  # ~50 km west-east
        assert 40 < dist < 65


class TestCo2:
    def test_positive_saving(self):
        assert co2_saved_kg(100) > 0

    def test_zero_distance(self):
        assert co2_saved_kg(0) == 0.0

    def test_known_value(self):
        # 100 km × 0.62 kg/km = 62 kg
        assert co2_saved_kg(100) == pytest.approx(62.0, abs=1)


class TestCostSaved:
    def test_positive(self):
        assert cost_saved_eur(200) > 0

    def test_known_value(self):
        # 200 km × 0.52 = 104 EUR
        assert cost_saved_eur(200) == pytest.approx(104.0, abs=2)


# ---------------------------------------------------------------------------
# Matching engine tests
# ---------------------------------------------------------------------------

def _make_trip(**kwargs) -> Trip:
    defaults = dict(
        trip_id="TAS-TEST-001",
        trailer_id="ECS-TR-001",
        origin="Zeebrugge",
        origin_lat=51.3322,
        origin_lng=3.2003,
        destination="Duisburg",
        destination_lat=51.4344,
        destination_lng=6.7623,
        departure_dt="2024-07-15T06:00:00",
        arrival_dt="2024-07-15T14:30:00",
        load_type="FCL",
        container_ref="ECSU0000001",
        status="confirmed",
        return_load=None,
    )
    defaults.update(kwargs)
    return Trip(**defaults)


def _make_order(**kwargs) -> ExportOrder:
    defaults = dict(
        order_id="BC-EXP-0001",
        client="Test Client GmbH",
        pickup_location="Duisburg",
        pickup_lat=51.4344,
        pickup_lng=6.7623,
        destination="Zeebrugge",
        destination_lat=51.3322,
        destination_lng=3.2003,
        ready_from_dt="2024-07-15T15:00:00",
        deadline_dt="2024-07-16T06:00:00",
        load_type="FCL",
        weight_kg=18000,
        container_size="40HC",
        status="open",
        revenue_eur=1800,
    )
    defaults.update(kwargs)
    return ExportOrder(**defaults)


class TestFindMatches:
    def test_exact_match(self):
        trip = _make_trip()
        order = _make_order()
        results = find_matches([trip], [order], radius_km=50, time_window_h=6)
        assert len(results) == 1
        assert results[0].trip.trip_id == "TAS-TEST-001"
        assert results[0].order.order_id == "BC-EXP-0001"

    def test_no_match_when_too_far(self):
        trip = _make_trip()
        order = _make_order(pickup_lat=52.52, pickup_lng=13.40)  # Berlin
        results = find_matches([trip], [order], radius_km=50)
        assert len(results) == 0

    def test_no_match_when_too_late(self):
        trip = _make_trip()
        order = _make_order(
            ready_from_dt="2024-07-15T23:00:00",
            deadline_dt="2024-07-16T23:00:00",
        )
        results = find_matches([trip], [order], radius_km=50, time_window_h=6)
        assert len(results) == 0

    def test_skip_allocated_trip(self):
        trip = _make_trip(return_load="BC-EXP-9999")
        order = _make_order()
        results = find_matches([trip], [order])
        assert len(results) == 0

    def test_skip_non_open_order(self):
        trip = _make_trip()
        order = _make_order(status="allocated")
        results = find_matches([trip], [order])
        assert len(results) == 0

    def test_sorted_by_confidence(self):
        trip = _make_trip()
        order_near = _make_order(order_id="BC-EXP-NEAR", pickup_lat=51.4344, pickup_lng=6.7623)
        order_far = _make_order(order_id="BC-EXP-FAR", pickup_lat=51.50, pickup_lng=6.90)
        results = find_matches([trip], [order_near, order_far])
        if len(results) == 2:
            assert results[0].confidence_score >= results[1].confidence_score

    def test_confidence_between_0_and_100(self):
        trip = _make_trip()
        order = _make_order()
        results = find_matches([trip], [order])
        assert len(results) == 1
        assert 0 <= results[0].confidence_score <= 100


class TestConfidenceScore:
    def test_perfect_match(self):
        score = _confidence_score(0, 0, 50, 6)
        assert score == 100.0

    def test_worst_match(self):
        score = _confidence_score(50, 6, 50, 6)
        assert score == pytest.approx(0.0, abs=1)

    def test_mid_match(self):
        score = _confidence_score(25, 3, 50, 6)
        assert 40 < score < 60
