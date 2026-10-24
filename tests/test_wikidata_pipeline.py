import unittest
from unittest.mock import Mock, patch

from app.pipeline import route_query
from app.tools.wikidata import _normalize_entity, search_wikidata_entities


class TestWikidataNormalization(unittest.TestCase):
    def test_normalizes_entity_metadata(self):
        result = _normalize_entity({
            "id": "Q7259",
            "label": "Ada Lovelace",
            "description": "English mathematician and writer",
            "aliases": ["Augusta Ada King"],
            "match": {"type": "label"},
            "concepturi": "http://www.wikidata.org/entity/Q7259",
        })

        self.assertEqual(result["entity_id"], "Q7259")
        self.assertEqual(result["label"], "Ada Lovelace")
        self.assertEqual(result["description"], "English mathematician and writer")
        self.assertEqual(result["aliases"], ["Augusta Ada King"])
        self.assertEqual(result["entity_url"], "http://www.wikidata.org/entity/Q7259")

    def test_ignores_malformed_entity(self):
        self.assertIsNone(_normalize_entity({"id": "Q1"}))


class TestWikidataTool(unittest.TestCase):
    @patch("app.tools.wikidata.requests.get")
    def test_returns_multiple_structured_entities(self, mock_get):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "search": [
                {"id": "Q7259", "label": "Ada Lovelace", "description": "Mathematician"},
                {"id": "Q100", "label": "Example entity", "description": "An example"},
            ]
        }
        mock_get.return_value = response

        result = search_wikidata_entities.invoke({"query": "Ada Lovelace", "limit": 2})

        self.assertTrue(result["ok"])
        self.assertEqual(result["count"], 2)
        self.assertEqual(result["entities"][0]["label"], "Ada Lovelace")
        self.assertEqual(mock_get.call_args.kwargs["params"]["action"], "wbsearchentities")
        self.assertEqual(mock_get.call_args.kwargs["params"]["limit"], 2)

    def test_rejects_empty_query_without_network_call(self):
        result = search_wikidata_entities.invoke({"query": "   "})
        self.assertFalse(result["ok"])
        self.assertEqual(result["entities"], [])


class TestWikidataRouting(unittest.TestCase):
    def test_knowledge_queries_route_to_wikidata(self):
        self.assertEqual(route_query("Who is Ada Lovelace?"), "wikidata")
        self.assertEqual(route_query("Tell me about the Eiffel Tower"), "wikidata")

    def test_existing_routes_keep_priority(self):
        self.assertEqual(route_query("Show me NASA images of Saturn"), "space")
        self.assertEqual(route_query("Find books about NASA"), "books")
        self.assertEqual(route_query("Find research papers about astronomy"), "research")


if __name__ == "__main__":
    unittest.main()
