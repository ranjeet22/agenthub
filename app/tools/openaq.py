import os
import requests
from langchain_core.tools import tool

OPENAQ_BASE_URL = "https://api.openaq.org/v3"
GEOCODING_URL = "https://nominatim.openstreetmap.org/search"
OPEN_METEO_AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
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


def _fetch_open_meteo_air_quality(city: str, coordinates: dict) -> dict:
    """Fetch real-time air quality from the public Open-Meteo Air Quality service without requiring an API key."""
    try:
        params = {
            "latitude": coordinates["latitude"],
            "longitude": coordinates["longitude"],
            "current": "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
        }
        res = requests.get(OPEN_METEO_AQ_URL, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()
        current = data.get("current", {})

        us_aqi = current.get("us_aqi")
        eu_aqi = current.get("european_aqi")
        aqi_val = us_aqi if us_aqi is not None else eu_aqi

        if aqi_val is not None:
            if aqi_val <= 50:
                category = "Good"
            elif aqi_val <= 100:
                category = "Moderate"
            elif aqi_val <= 150:
                category = "Unhealthy for Sensitive Groups"
            elif aqi_val <= 200:
                category = "Unhealthy"
            elif aqi_val <= 300:
                category = "Very Unhealthy"
            else:
                category = "Hazardous"
        else:
            category = "Report"

        pollutants = {}
        if current.get("pm2_5") is not None:
            pollutants["PM2.5"] = f"{current['pm2_5']} µg/m³"
        if current.get("pm10") is not None:
            pollutants["PM10"] = f"{current['pm10']} µg/m³"
        if current.get("nitrogen_dioxide") is not None:
            pollutants["NO2"] = f"{current['nitrogen_dioxide']} µg/m³"
        if current.get("sulphur_dioxide") is not None:
            pollutants["SO2"] = f"{current['sulphur_dioxide']} µg/m³"
        if current.get("ozone") is not None:
            pollutants["O3"] = f"{current['ozone']} µg/m³"
        if current.get("carbon_monoxide") is not None:
            pollutants["CO"] = f"{current['carbon_monoxide']} µg/m³"

        measurements = []
        for param, val in pollutants.items():
            measurements.append({
                "parameter": param,
                "value": val,
                "units": "µg/m³",
                "station": coordinates.get("display_name", city),
                "locality": city,
                "latitude": coordinates["latitude"],
                "longitude": coordinates["longitude"],
                "source": "Open-Meteo & Copernicus Atmosphere Service",
                "source_url": "https://open-meteo.com/en/docs/air-quality-api",
            })

        return {
            "ok": True,
            "source": "Open-Meteo / Copernicus Atmosphere Service",
            "query": city,
            "city": city,
            "resolved_location": coordinates,
            "aqi": aqi_val,
            "category": category,
            "pollutants": pollutants,
            "count": len(measurements),
            "measurements": measurements,
            "locations": [{
                "name": coordinates.get("display_name", city),
                "latitude": coordinates["latitude"],
                "longitude": coordinates["longitude"],
                "aqi": aqi_val,
                "category": category,
            }],
            "note": "Real-time atmospheric sensor data provided by Open-Meteo & Copernicus.",
        }
    except Exception as exc:
        return {
            "ok": False,
            "source": "Open-Meteo",
            "query": city,
            "error": f"Failed to retrieve air quality data: {exc}",
            "count": 0,
            "measurements": [],
            "locations": [],
        }


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
    """Look up recent air-quality measurements from environmental monitoring stations for a city.

    Resolves the city to coordinates, and retrieves live sensor measurements (AQI, PM2.5,
    PM10, NO2, SO2, CO, Ozone). Does not require an API key by defaulting to public Open-Meteo
    atmospheric sensors.
    """
    city = (city or "").strip()
    if not city:
        return {"ok": False, "source": "Air Quality Service", "query": city,
                "error": "Please provide a city or location.", "count": 0,
                "locations": [], "measurements": []}

    try:
        coordinates = _geocode_city(city)
        if coordinates is None:
            return {"ok": False, "source": "Air Quality Service", "query": city,
                    "error": f"Could not resolve '{city}'. Try a more specific city name.",
                    "count": 0, "locations": [], "measurements": []}
    except Exception as exc:
        return {"ok": False, "source": "Air Quality Service", "query": city,
                "error": f"Geocoding service error: {exc}", "count": 0,
                "locations": [], "measurements": []}

    api_key = os.getenv("OPENAQ_API_KEY")

    # If OPENAQ_API_KEY is not configured in .env, automatically use free public Open-Meteo
    if not api_key:
        return _fetch_open_meteo_air_quality(city, coordinates)

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
        response = requests.get(
            f"{OPENAQ_BASE_URL}/locations",
            params={"coordinates": f"{coordinates['latitude']:.4f},{coordinates['longitude']:.4f}",
                    "radius": radius_meters, "limit": 100, "page": 1},
            headers=headers, timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        # Fall back to Open-Meteo if OpenAQ API fails
        return _fetch_open_meteo_air_quality(city, coordinates)
    except ValueError:
        return _fetch_open_meteo_air_quality(city, coordinates)

    results = payload.get("results") if isinstance(payload, dict) else None
    if not isinstance(results, list) or len(results) == 0:
        return _fetch_open_meteo_air_quality(city, coordinates)

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
                continue
            for item in latest_items:
                measurement = _normalize_measurement(item, location)
                if measurement:
                    measurements.append(measurement)
        except Exception:
            continue

    if not measurements:
        return _fetch_open_meteo_air_quality(city, coordinates)

    return {
        "ok": bool(locations), "source": "OpenAQ", "query": city,
        "resolved_location": coordinates, "radius_meters": radius_meters,
        "count": len(measurements), "location_count": len(locations),
        "locations": locations, "measurements": measurements, "errors": errors,
        "note": "Provider-reported pollutant measurements. Coverage and reporting times vary by station.",
    }
