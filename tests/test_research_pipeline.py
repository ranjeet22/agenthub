import unittest
from unittest.mock import patch

from app.research.deduplication import (
    deduplicate_papers,
    normalize_arxiv_id,
    normalize_doi,
    papers_match,
)
from app.tools.research import search_all_research_papers


class DeduplicationTests(unittest.TestCase):
    def test_normalizes_doi_url(self):
        self.assertEqual(
            normalize_doi("https://doi.org/10.1234/ABC.567"),
            "10.1234/abc.567",
        )

    def test_normalizes_arxiv_version(self):
        self.assertEqual(
            normalize_arxiv_id({
                "url": "https://arxiv.org/abs/2212.01493v2"
            }),
            "2212.01493",
        )

    def test_matches_expanded_and_initialed_author_names(self):
        openalex = {
            "title": "Applications of AI in Astronomy",
            "authors": ["Stanislav George Djorgovski"],
            "year": 2023,
            "source": "OpenAlex",
        }
        arxiv = {
            "title": "Applications of AI in Astronomy",
            "authors": ["S. G. Djorgovski"],
            "year": 2022,
            "url": "https://arxiv.org/abs/2212.01493v1",
            "source": "arXiv",
        }

        self.assertTrue(papers_match(openalex, arxiv))

        merged = deduplicate_papers([openalex, arxiv])
        self.assertEqual(len(merged), 1)
        self.assertEqual(set(merged[0]["sources"]), {"OpenAlex", "arXiv"})

    def test_does_not_merge_conflicting_authors(self):
        first = {
            "title": "Applications of AI in Astronomy",
            "authors": ["Alice Smith"],
            "year": 2023,
        }
        second = {
            "title": "Applications of AI in Astronomy",
            "authors": ["Bob Jones"],
            "year": 2023,
        }

        self.assertFalse(papers_match(first, second))
        self.assertEqual(len(deduplicate_papers([first, second])), 2)

    def test_same_doi_merges_and_preserves_both_sources(self):
        first = {
            "title": "Paper A",
            "doi": "10.1234/example",
            "url": "https://doi.org/10.1234/example",
            "source": "OpenAlex",
        }
        second = {
            "title": "Paper A",
            "doi": "https://doi.org/10.1234/EXAMPLE",
            "url": "https://arxiv.org/abs/2401.01234",
            "source": "arXiv",
        }

        merged = deduplicate_papers([first, second])

        self.assertEqual(len(merged), 1)
        self.assertEqual(set(merged[0]["sources"]), {"OpenAlex", "arXiv"})
        self.assertIn(
            "https://arxiv.org/abs/2401.01234",
            merged[0]["source_urls"],
        )

    def test_empty_input(self):
        self.assertEqual(deduplicate_papers([]), [])


class CombinedSearchTests(unittest.TestCase):
    @patch("app.tools.research.search_arxiv_papers")
    @patch("app.tools.research.search_openalex_papers")
    def test_combined_results_include_both_sources(
        self, mock_openalex, mock_arxiv
    ):
        mock_openalex.invoke.return_value = {
            "ok": True,
            "source": "OpenAlex",
            "papers": [
                {
                    "title": "OpenAlex Paper",
                    "authors": ["A. Author"],
                    "year": 2024,
                    "url": "https://openalex.org/W1",
                }
            ],
        }
        mock_arxiv.invoke.return_value = {
            "ok": True,
            "source": "arXiv",
            "papers": [
                {
                    "title": "arXiv Paper",
                    "authors": ["B. Author"],
                    "year": 2025,
                    "url": "https://arxiv.org/abs/2501.01234",
                }
            ],
        }

        result = search_all_research_papers.invoke({
            "query": "AI in astronomy",
            "limit": 2,
        })

        self.assertTrue(result["ok"])
        self.assertEqual(result["count"], 2)
        self.assertEqual(
            {source for paper in result["papers"]
             for source in paper["sources"]},
            {"OpenAlex", "arXiv"},
        )
        mock_openalex.invoke.assert_called_once()
        mock_arxiv.invoke.assert_called_once()

    @patch("app.tools.research.search_arxiv_papers")
    @patch("app.tools.research.search_openalex_papers")
    def test_reports_provider_failure_without_hiding_other_results(
        self, mock_openalex, mock_arxiv
    ):
        mock_openalex.invoke.return_value = {
            "ok": True,
            "papers": [
                {
                    "title": "Available Paper",
                    "authors": ["A. Author"],
                    "year": 2024,
                    "url": "https://openalex.org/W1",
                }
            ],
        }
        mock_arxiv.invoke.return_value = {
            "ok": False,
            "error": "Simulated provider failure",
            "papers": [],
        }

        result = search_all_research_papers.invoke({
            "query": "AI",
            "limit": 3,
        })

        self.assertTrue(result["ok"])
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["source_status"]["OpenAlex"], "ok")
        self.assertEqual(result["source_status"]["arXiv"], "error")
        self.assertIn("arXiv", result["source_errors"])


if __name__ == "__main__":
    unittest.main()