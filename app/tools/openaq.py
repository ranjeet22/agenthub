import os

import requests
from langchain_core.tools import tool


OPENAQ_BASE_URL = "https://api.openaq.org/v3"
GEOCODING_URL = "https://nominatim.openstreetmap.org/search"
MAX_LOCATIONS = 10
DEFAULT_RADIUS_METERS = 10000


def _geocode_city(city):
    """Resolve a city name to coordinates using the public Nominatim service."""
    response = requests.get(
        GEOCODING_URL,
        params={"q": city, "format": "jsonv2", "limit": 1},
        headers={"User-Agent": "AgentHub/1.0 (air quality lookup)"},
        timeout=15,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list) or not payload:
        return None
    item = payload[0]
    try:
        return {
            "latitude": float(item["lat"]),
            "longitude": float(item["lon"]),
            "display_name": item.get("display_name") or city,
        }
    except (KeyError, TypeError, ValueError):
        return None


def _normalize_location(location):
    if not isinstance(location, dict) or not isinstance(location.get("id"), int):
        return None
    coordinates = location.get("coordinates")
    if not isinstance(coordinates, dict):
        coordinates = {}
    sensors = location.get("sensors")
    if not isinstance(sensors, list):
        sensors = []
    country = location.get("country")
    last_reported = location.get("datetimeLast")
    return {
        "location_id": location["id"],
        "name": location.get("name") or "Unnamed monitoring station",
        "locality": location.get("locality"),
        "country": country.get("name") if isinstance(country, dict) else None,
        "latitude": coordinates.get("latitude"),
        "longitude": coordinates.get("longitude"),
        "last_reported": last_reported.get("utc") if isinstance(last_reported, dict) else None,
        "sensors": [
            {
                "sensor_id": sensor.get("id"),
                "parameter": sensor.get("parameter", {}).get("name")
                if isinstance(sensor.get("parameter"), dict) else None,
                "units": sensor.get("parameter", {}).get("units")
                if isinstance(sensor.get("parameter"), dict) else None,
            }
            for sensor in sensors if isinstance(sensor, dict)
        ],
        "source_url": f"https://explore.openaq.org/locations/{location['id']}",
        "source": "OpenAQ",
    }


def _normalize_measurement(item, location):
    if not isinstance(item, dict):
        return None
    parameter = item.get("parameter")
    if not isinstance(parameter, dict):
        parameter = {}
    datetime = item.get("datetime")
    if not isinstance(datetime, dict):
        datetime = {}
    value = item.get("value")
    if not isinstance(value, (int, float)):
        return None
    coordinates = item.get("coordinates")
    if not isinstance(coordinates, dict):
        coordinates = {}
    return {
        "parameter": parameter.get("name") or "unknown",
        "value": value,
        "units": parameter.get("units"),
        "datetime_utc": datetime.get("utc"),
        "datetime_local": datetime.get("local"),
        "sensor_id": item.get("sensorsId"),
        "location_id": item.get("locationsId") or location["location_id"],
        "station": location["name"],
        "locality": location.get("locality"),
        "latitude": coordinates.get("latitude", location.get("latitude")),
        "longitude": coordinates.get("longitude", location.get("longitude")),
        "source_url": location["source_url"],
        "source": "OpenAQ",
    }


@tool
def search_openaq_air_quality(city: str, limit: int = 5, radius_meters: int = DEFAULT_RADIUS_METERS) -> dict:
    """Look up recent air-quality measurements from OpenAQ monitoring stations near a city.

    Requires OPENAQ_API_KEY in the environment. Resolves the city to coordinates,
    searches nearby OpenAQ monitoring locations, then retrieves each location's
    latest sensor measurements. Values are provider-reported; this tool does not calculate an AQI.
    """
    city = (city or "").strip()
    if not city:
        return {"ok": False, "source": "OpenAQ", "query": city,
                "error": "Please provide a city or location.", "count": 0,
                "locations": [], "measurements": []}
    api_key = os.getenv("OPENAQ_API_KEY")
    if not api_key:
        return {"ok": False, "source": "OpenAQ", "query": city,
                "error": "OPENAQ_API_KEY is missing. Add it to .env and restart the application.",
                "count": 0, "locations": [], "measurements": []}
    try:
        limit = max(1, min(int(limit), MAX_LOCATIONS))
    except (TypeError, ValueError):
        limit = 5
    try:
        radius_meters = max(1000, min(int(radius_meters), 25000))
    except (TypeError, ValueError):
        radius_meters = DEFAULT_RADIUS_METERS

    headers = {"X-API-Key": api_key, "User-Agent": "AgentHub/1.0"}
    try:
        coordinates = _geocode_city(city)
        if coordinates is None:
            return {"ok": False, "source": "OpenAQ", "query": city,
                    "error": f"Could not resolve '{city}'. Try a more specific city name.",
                    "count": 0, "locations": [], "measurements": []}
        response = requests.get(
            f"{OPENAQ_BASE_URL}/locations",
            params={"coordinates": f"{coordinates['latitude']:.4f},{coordinates['longitude']:.4f}",
                    "radius": radius_meters, "limit": 100, "page": 1},
            headers=headers, timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        return {"ok": False, "source": "OpenAQ", "query": city,
                "error": f"Air-quality location search failed: {exc}",
                "count": 0, "locations": [], "measurements": []}
    except ValueError:
        return {"ok": False, "source": "OpenAQ", "query": city,
                "error": "An API returned invalid JSON during location lookup.",
                "count": 0, "locations": [], "measurements": []}

    results = payload.get("results") if isinstance(payload, dict) else None
    if not isinstance(results, list):
        return {"ok": False, "source": "OpenAQ", "query": city,
                "error": "Unexpected response format from OpenAQ locations endpoint.",
                "count": 0, "locations": [], "measurements": []}
    locations = []
    for item in results:
        normalized = _normalize_location(item)
        if normalized:
            locations.append(normalized)
        if len(locations) >= limit:
            break

    measurements, errors = [], []
    for location in locations:
        try:
            latest_response = requests.get(
                f"{OPENAQ_BASE_URL}/locations/{location['location_id']}/latest",
                params={"limit": 100, "page": 1}, headers=headers, timeout=20,
            )
            latest_response.raise_for_status()
            latest_payload = latest_response.json()
            latest_items = latest_payload.get("results") if isinstance(latest_payload, dict) else None
            if not isinstance(latest_items, list):
                errors.append(f"{location['name']}: unexpected latest-measurements response")
                continue
            for item in latest_items:
                measurement = _normalize_measurement(item, location)
                if measurement:
                    measurements.append(measurement)
        except requests.RequestException as exc:
            errors.append(f"{location['name']}: {type(exc).__name__}: {exc}")
        except ValueError:
            errors.append(f"{location['name']}: invalid JSON response")

    return {
        "ok": bool(locations), "source": "OpenAQ", "query": city,
        "resolved_location": coordinates, "radius_meters": radius_meters,
        "count": len(measurements), "location_count": len(locations),
        "locations": locations, "measurements": measurements, "errors": errors,
        "note": "Provider-reported pollutant measurements, not a calculated AQI. Coverage and reporting times vary by station.",
    }
