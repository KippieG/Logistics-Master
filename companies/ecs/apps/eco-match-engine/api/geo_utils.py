"""
geo_utils.py
Haversine-based geographic utility functions for the Eco-Match Engine.
"""

import math
from typing import Tuple


EARTH_RADIUS_KM = 6371.0

# Average CO2 emission per km for a loaded 40-tonne truck (kg CO2/km)
CO2_KG_PER_KM_LOADED = 0.9
CO2_KG_PER_KM_EMPTY = 0.62

# Average diesel cost per km (EUR)
DIESEL_COST_EUR_PER_KM = 0.52


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth.

    Args:
        lat1, lng1: Coordinates of point A (decimal degrees)
        lat2, lng2: Coordinates of point B (decimal degrees)

    Returns:
        Distance in kilometres (float)
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS_KM * c


def co2_saved_kg(distance_km: float) -> float:
    """
    Calculate CO2 saved (kg) by filling an otherwise empty return trip.

    The delta is the difference between an empty trip and a loaded trip —
    loading the trailer doesn't meaningfully increase emissions on a trip
    that would happen regardless, so the full empty-trip emission is saved
    relative to sending a separate loaded truck.

    Args:
        distance_km: One-way distance of the return trip

    Returns:
        CO2 saved in kg (float)
    """
    return round(CO2_KG_PER_KM_EMPTY * distance_km, 1)


def cost_saved_eur(distance_km: float) -> float:
    """
    Estimate deadhead (empty-run) cost avoided in EUR.

    Args:
        distance_km: One-way distance of the empty return trip avoided

    Returns:
        Cost saving in EUR (float)
    """
    return round(DIESEL_COST_EUR_PER_KM * distance_km, 2)


def midpoint(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> Tuple[float, float]:
    """Return the geographic midpoint of two coordinates."""
    lat_m = (lat1 + lat2) / 2
    lng_m = (lng1 + lng2) / 2
    return round(lat_m, 6), round(lng_m, 6)
