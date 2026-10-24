import unittest
from unittest.mock import Mock, patch

from app.pipeline import route_query
from app.tools.books import search_open_library_books


class BooksToolTests(unittest.TestCase):
    @patch("app.tools.books.requests.get")
    def test_returns_book_metadata_and_cover_url(self, mock_get):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "docs": [
                {
                    "key": "/works/OL123W",
                    "title": "Example Book",
                    "author_name": ["A. Author"],
                    "first_publish_year": 2020,
                    "cover_i": 456,
                    "edition_count": 3,
                    "isbn": ["9780000000001"],
                    "publisher": ["Example Press"],
                    "subject": ["Artificial intelligence"],
                    "language": ["eng"],
                }
            ]
        }
        mock_get.return_value = response

        result = search_open_library_books.invoke({
            "query": "artificial intelligence",
            "limit": 5,
        })

        self.assertTrue(result["ok"])
        self.assertEqual(result["count"], 1)

        book = result["books"][0]
        self.assertEqual(book["title"], "Example Book")
        self.assertEqual(book["authors"], ["A. Author"])
        self.assertEqual(book["first_publish_year"], 2020)
        self.assertEqual(
            book["cover_image_url"],
            "https://covers.openlibrary.org/b/id/456-L.jpg?default=false",
        )
        self.assertEqual(
            book["source_url"],
            "https://openlibrary.org/works/OL123W",
        )

    @patch("app.tools.books.requests.get")
    def test_missing_cover_remains_none(self, mock_get):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "docs": [
                {
                    "key": "/works/OL456W",
                    "title": "Book Without a Cover",
                    "author_name": ["B. Author"],
                }
            ]
        }
        mock_get.return_value = response

        result = search_open_library_books.invoke({
            "query": "Book Without a Cover",
            "limit": 1,
        })

        self.assertTrue(result["ok"])
        self.assertIsNone(result["books"][0]["cover_image_url"])

    def test_empty_query_is_rejected(self):
        result = search_open_library_books.invoke({
            "query": "   ",
            "limit": 5,
        })

        self.assertFalse(result["ok"])
        self.assertEqual(result["books"], [])


class RoutingTests(unittest.TestCase):
    def test_book_queries_route_to_books(self):
        self.assertEqual(
            route_query("Find books about machine learning"),
            "books",
        )
        self.assertEqual(
            route_query("Find a textbook by ISBN"),
            "books",
        )

    def test_research_queries_route_to_research(self):
        self.assertEqual(
            route_query("Find research papers about machine learning"),
            "research",
        )
        self.assertEqual(
            route_query("Search arXiv for AI papers"),
            "research",
        )

    def test_ambiguous_queries_preserve_research_default(self):
        self.assertEqual(route_query("Explain machine learning"), "research")


if __name__ == "__main__":
    unittest.main()
