import os
import unittest
from unittest.mock import Mock, patch

from app.pipeline import route_query
from app.tools.openaq import _normalize_location, _normalize_measurement, search_openaq_air_quality


class TestOpenAQNormalization(unittest.TestCase):
    def test_normalizes_location(self):
        location = _normalize_location({
            "id": 123,
            "name": "Central Station",
            "locality": "Delhi",
            "country": {"name": "India"},
            "coordinates": {"latitude": 28.6, "longitude": 77.2},
            "datetimeLast": {"utc": "2026-10-24T10:00:00Z"},
            "sensors": [{"id": 4, "parameter": {"name": "pm25", "units": "µg/m³"}}],
        })
        self.assertEqual(location["location_id"], 123)
        self.assertEqual(location["country"], "India")
        self.assertEqual(location["sensors"][0]["parameter"], "pm25")
        self.assertIn("/locations/123", location["source_url"])

    def test_normalizes_measurement(self):
        location = {"location_id": 123, "name": "Central Station", "locality": "Delhi",
                    "latitude": 28.6, "longitude": 77.2,
                    "source_url": "https://explore.openaq.org/locations/123"}
        measurement = _normalize_measurement({
            "value": 42.5, "parameter": {"name": "pm25", "units": "µg/m³"},
            "datetime": {"utc": "2026-10-24T10:00:00Z"}, "locationsId": 123,
        }, location)
        self.assertEqual(measurement["value"], 42.5)
        self.assertEqual(measurement["parameter"], "pm25")
        self.assertEqual(measurement["units"], "µg/m³")


class TestOpenAQTool(unittest.TestCase):
    def test_rejects_empty_city_without_network_call(self):
        with patch.dict(os.environ, {"OPENAQ_API_KEY": "test-key"}):
            with patch("app.tools.openaq.requests.get") as mock_get:
                result = search_openaq_air_quality.invoke({"city": "  "})
        self.assertFalse(result["ok"])
        self.assertEqual(result["measurements"], [])
        mock_get.assert_not_called()

    def test_reports_missing_api_key(self):
        with patch.dict(os.environ, {}, clear=True):
            result = search_openaq_air_quality.invoke({"city": "Delhi"})
        self.assertFalse(result["ok"])
        self.assertIn("OPENAQ_API_KEY", result["error"])

    @patch("app.tools.openaq._geocode_city")
    @patch("app.tools.openaq.requests.get")
    def test_returns_station_and_measurements(self, mock_get, mock_geocode):
        mock_geocode.return_value = {"latitude": 28.6, "longitude": 77.2, "display_name": "Delhi"}
        locations_response = Mock()
        locations_response.raise_for_status.return_value = None
        locations_response.json.return_value = {"results": [{
            "id": 123, "name": "Central Station", "locality": "Delhi",
            "country": {"name": "India"}, "coordinates": {"latitude": 28.6, "longitude": 77.2},
            "sensors": [{"id": 4, "parameter": {"name": "pm25", "units": "µg/m³"}}],
        }]}
        latest_response = Mock()
        latest_response.raise_for_status.return_value = None
        latest_response.json.return_value = {"results": [{
            "value": 42.5, "parameter": {"name": "pm25", "units": "µg/m³"},
            "datetime": {"utc": "2026-10-24T10:00:00Z"}, "locationsId": 123, "sensorsId": 4,
        }]}
        mock_get.side_effect = [locations_response, latest_response]

        with patch.dict(os.environ, {"OPENAQ_API_KEY": "test-key"}):
            result = search_openaq_air_quality.invoke({"city": "Delhi", "limit": 1})

        self.assertTrue(result["ok"])
        self.assertEqual(result["location_count"], 1)
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["measurements"][0]["value"], 42.5)
        self.assertEqual(mock_get.call_args_list[0].kwargs["headers"]["X-API-Key"], "test-key")


class TestOpenAQRouting(unittest.TestCase):
    def test_air_quality_queries_route_to_air_quality_agent(self):
        self.assertEqual(route_query("What is the air quality in Delhi?"), "air_quality")
        self.assertEqual(route_query("Show PM2.5 readings in Jaipur"), "air_quality")
        self.assertEqual(route_query("Check pollution levels in Mumbai"), "air_quality")

    def test_existing_routes_keep_priority(self):
        self.assertEqual(route_query("Find research papers about air pollution"), "research")
        self.assertEqual(route_query("Show me NASA images of Saturn"), "space")
        self.assertEqual(route_query("Find books about pollution"), "books")


if __name__ == "__main__":
    unittest.main()
