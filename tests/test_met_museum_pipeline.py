import unittest
from unittest.mock import Mock, patch

from app.pipeline import route_query
from app.tools.met_museum import _normalize_artwork, search_met_collection


class TestMetArtworkNormalization(unittest.TestCase):
    def test_normalizes_artwork_metadata(self):
        artwork = _normalize_artwork({
            "objectID": 123,
            "title": "Example Painting",
            "artistDisplayName": "Example Artist",
            "objectDate": "1888",
            "medium": "Oil on canvas",
            "department": "European Paintings",
            "isPublicDomain": True,
            "primaryImage": "https://images.example.org/art.jpg",
            "objectURL": "https://www.metmuseum.org/art/collection/search/123",
            "tags": [{"term": "Landscape", "AAT_URL": "https://example.org/tag"}],
        })
        self.assertEqual(artwork["object_id"], 123)
        self.assertEqual(artwork["artist"], "Example Artist")
        self.assertTrue(artwork["is_public_domain"])
        self.assertEqual(artwork["tags"][0]["term"], "Landscape")
        self.assertEqual(artwork["source"], "The Metropolitan Museum of Art")

    def test_rejects_invalid_artwork(self):
        self.assertIsNone(_normalize_artwork({"title": "No object ID"}))


class TestMetCollectionTool(unittest.TestCase):
    def test_rejects_empty_query_without_network_call(self):
        with patch("app.tools.met_museum.requests.get") as mock_get:
            result = search_met_collection.invoke({"query": " "})
        self.assertFalse(result["ok"])
        self.assertEqual(result["artworks"], [])
        mock_get.assert_not_called()

    @patch("app.tools.met_museum.requests.get")
    def test_searches_and_fetches_artwork_records(self, mock_get):
        search_response = Mock()
        search_response.raise_for_status.return_value = None
        search_response.json.return_value = {"total": 1, "objectIDs": [123]}
        object_response = Mock()
        object_response.raise_for_status.return_value = None
        object_response.json.return_value = {
            "objectID": 123, "title": "Example Painting",
            "artistDisplayName": "Example Artist", "isPublicDomain": True,
            "objectURL": "https://www.metmuseum.org/art/collection/search/123",
        }
        mock_get.side_effect = [search_response, object_response]

        result = search_met_collection.invoke({"query": "example painting", "limit": 1})

        self.assertTrue(result["ok"])
        self.assertEqual(result["total_matches"], 1)
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["artworks"][0]["title"], "Example Painting")
        self.assertIn("/v1.1/search", mock_get.call_args_list[0].args[0])
        self.assertEqual(mock_get.call_args_list[0].kwargs["params"]["hasImages"], "true")
        self.assertIn("/v1/objects/123", mock_get.call_args_list[1].args[0])

    @patch("app.tools.met_museum.requests.get")
    def test_handles_empty_search_results(self, mock_get):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {"total": 0, "objectIDs": []}
        mock_get.return_value = response

        result = search_met_collection.invoke({"query": "nonexistent artwork"})

        self.assertTrue(result["ok"])
        self.assertEqual(result["total_matches"], 0)
        self.assertEqual(result["artworks"], [])
        mock_get.assert_called_once()


class TestMetMuseumRouting(unittest.TestCase):
    def test_art_queries_route_to_met_museum(self):
        self.assertEqual(route_query("Find paintings by Claude Monet"), "met_museum")
        self.assertEqual(route_query("Search the Met Museum collection for Egyptian sculpture"), "met_museum")
        self.assertEqual(route_query("Show me artwork from Japanese culture"), "met_museum")

    def test_existing_routes_keep_priority(self):
        self.assertEqual(route_query("Find research papers about museum collections"), "research")
        self.assertEqual(route_query("Find books about art history"), "books")
        self.assertEqual(route_query("Show me NASA images of Saturn"), "space")


if __name__ == "__main__":
    unittest.main()
