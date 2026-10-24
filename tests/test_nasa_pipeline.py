import unittest
from unittest.mock import Mock, patch

from app.pipeline import route_query
from app.tools.nasa import _normalize_item, search_nasa_images


class TestNasaImageNormalization(unittest.TestCase):
    def test_normalizes_image_metadata_and_links(self):
        item = {
            "data": [{
                "nasa_id": "PIA123",
                "title": "Mars at Sunset",
                "description": "A rover image of the Martian horizon.",
                "date_created": "2024-04-02T10:00:00Z",
                "media_type": "image",
                "center": "JPL",
                "photographer": "NASA/JPL",
                "keywords": ["Mars", "Rover"],
            }],
            "links": [{
                "rel": "preview",
                "href": "https://images-assets.nasa.gov/image/PIA123/PIA123~thumb.jpg",
            }],
        }

        result = _normalize_item(item)

        self.assertEqual(result["title"], "Mars at Sunset")
        self.assertEqual(result["date_created"], "2024-04-02T10:00:00Z")
        self.assertEqual(result["explanation"], "A rover image of the Martian horizon.")
        self.assertEqual(result["image_url"], item["links"][0]["href"])
        self.assertEqual(result["source_url"], "https://images.nasa.gov/details/PIA123")
        self.assertEqual(result["keywords"], ["Mars", "Rover"])

    def test_ignores_malformed_item(self):
        self.assertIsNone(_normalize_item({"data": []}))


class TestNasaImageTool(unittest.TestCase):
    @patch("app.tools.nasa.requests.get")
    def test_returns_multiple_structured_images(self, mock_get):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "collection": {
                "items": [
                    {
                        "data": [{"nasa_id": "A1", "title": "Moon", "description": "The Moon."}],
                        "links": [{"rel": "preview", "href": "https://example.com/moon.jpg"}],
                    },
                    {
                        "data": [{"nasa_id": "A2", "title": "Earth", "description": "Earth from space."}],
                        "links": [{"rel": "preview", "href": "https://example.com/earth.jpg"}],
                    },
                ]
            }
        }
        mock_get.return_value = mock_response

        result = search_nasa_images.invoke({"query": "Earth and Moon", "limit": 2})

        self.assertTrue(result["ok"])
        self.assertEqual(result["count"], 2)
        self.assertEqual([item["title"] for item in result["images"]], ["Moon", "Earth"])
        self.assertEqual(mock_get.call_args.kwargs["params"]["media_type"], "image")
        self.assertEqual(mock_get.call_args.kwargs["params"]["page_size"], 2)

    def test_rejects_empty_query_without_network_call(self):
        result = search_nasa_images.invoke({"query": "   "})
        self.assertFalse(result["ok"])
        self.assertEqual(result["images"], [])


class TestNasaRouting(unittest.TestCase):
    def test_nasa_queries_route_to_space_agent(self):
        self.assertEqual(route_query("Show me NASA images of Saturn"), "space")
        self.assertEqual(route_query("Find pictures of the James Webb telescope"), "space")
        self.assertEqual(route_query("Show Mars rover images"), "space")

    def test_books_and_research_keep_their_routes(self):
        self.assertEqual(route_query("Find books about NASA"), "books")
        self.assertEqual(route_query("Find research papers about astronomy"), "research")


if __name__ == "__main__":
    unittest.main()
