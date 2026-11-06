import re
import xml.etree.ElementTree as ET

import requests
from langchain_core.tools import tool


ARXIV_API_URL = "https://export.arxiv.org/api/query"
MAX_RESULTS = 10

NAMESPACES = {
    "atom": "http://www.w3.org/2005/Atom",
    "arxiv": "http://arxiv.org/schemas/atom",
}

STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "for", "of", "and",
    "or", "to", "with", "about", "using", "by", "from", "into",
}


def build_arxiv_query(query):
    """Build an arXiv all-fields query from a natural-language topic."""
    terms = re.findall(r"[A-Za-z0-9]+", query.lower())
    terms = [term for term in terms if term not in STOP_WORDS]

    if not terms:
        terms = re.findall(r"[A-Za-z0-9]+", query.lower())

    if not terms:
        return ""

    # AND gives multiword searches predictable, explicit semantics.
    return " AND ".join(f"all:{term}" for term in terms)


@tool
def search_arxiv_papers(query: str, limit: int = 5) -> dict:
    """Search arXiv for scientific preprints and research papers.

    Returns titles, authors, publication dates, abstracts, categories,
    arXiv URLs, arXiv identifiers, and DOI values when available.
    """
    query = query.strip()

    if not query:
        return {
            "ok": False,
            "source": "arXiv",
            "error": "Search query cannot be empty.",
            "papers": [],
        }

    try:
        limit = max(1, min(int(limit), MAX_RESULTS))
    except (TypeError, ValueError):
        limit = 5

    api_query = build_arxiv_query(query)

    if not api_query:
        return {
            "ok": False,
            "source": "arXiv",
            "error": "The query did not contain searchable terms.",
            "papers": [],
        }

    try:
        response = requests.get(
            ARXIV_API_URL,
            params={
                "search_query": api_query,
                "start": 0,
                "max_results": limit,
                "sortBy": "relevance",
                "sortOrder": "descending",
            },
            headers={"User-Agent": "AgentHub/1.0 (mailto:research@agenthub.dev)"},
            timeout=6,
        )
        response.raise_for_status()
        root = ET.fromstring(response.content)

    except requests.RequestException:
        return _fallback_openalex_arxiv_search(query, limit)
    except ET.ParseError:
        return {
            "ok": False,
            "source": "arXiv",
            "error": "arXiv returned an invalid XML response.",
            "papers": [],
        }

    papers = []

    for entry in root.findall("atom:entry", NAMESPACES):
        title = entry.findtext(
            "atom:title", default="", namespaces=NAMESPACES
        ).strip()
        if not title:
            continue

        authors = [
            author.findtext(
                "atom:name", default="", namespaces=NAMESPACES
            ).strip()
            for author in entry.findall("atom:author", NAMESPACES)
        ]
        authors = [author for author in authors if author]

        published = entry.findtext(
            "atom:published", default="", namespaces=NAMESPACES
        ).strip()

        arxiv_url = entry.findtext(
            "atom:id", default="", namespaces=NAMESPACES
        ).strip()

        arxiv_id = None
        match = re.search(
            r"arxiv\.org/(?:abs|pdf)/([^?#]+)",
            arxiv_url,
            flags=re.IGNORECASE,
        )
        if match:
            arxiv_id = re.sub(r"v\d+$", "", match.group(1))
            arxiv_id = re.sub(r"\.pdf$", "", arxiv_id)

        doi = entry.findtext(
            "arxiv:doi", default="", namespaces=NAMESPACES
        ).strip() or None

        abstract = entry.findtext(
            "atom:summary", default="", namespaces=NAMESPACES
        ).strip()

        categories = [
            category.get("term")
            for category in entry.findall("atom:category", NAMESPACES)
            if category.get("term")
        ]

        papers.append({
            "title": " ".join(title.split()),
            "authors": authors[:8],
            "year": published[:4] if published else None,
            "published": published or None,
            "doi": doi,
            "url": arxiv_url or None,
            "arxiv_id": arxiv_id,
            "abstract": " ".join(abstract.split())[:1200],
            "categories": categories,
            "source": "arXiv",
        })

    return {
        "ok": True,
        "source": "arXiv",
        "query": query,
        "api_query": api_query,
        "count": len(papers),
        "papers": papers,
    }


def _fallback_openalex_arxiv_search(query: str, limit: int = 5) -> dict:
    """Fall back to OpenAlex preprint search if arXiv export API is rate-limited (HTTP 429)."""
    try:
        url = "https://api.openalex.org/works"
        params = {"search": query, "per-page": limit}
        res = requests.get(
            url,
            params=params,
            headers={"User-Agent": "AgentHub/1.0 (mailto:research@agenthub.dev)"},
            timeout=15,
        )
        res.raise_for_status()
        data = res.json()
        papers = []
        for w in data.get("results", []):
            title = w.get("display_name") or w.get("title")
            if not title:
                continue
            authors = [
                a.get("author", {}).get("display_name")
                for a in w.get("authorships", [])
                if a.get("author", {}).get("display_name")
            ]
            oa = w.get("open_access", {})
            pdf_url = oa.get("oa_url")
            source_url = (
                w.get("doi")
                or (w.get("primary_location") or {}).get("landing_page_url")
                or w.get("id")
            )
            papers.append({
                "title": title.strip(),
                "authors": authors[:10],
                "published": w.get("publication_date") or str(w.get("publication_year", "")),
                "summary": None,
                "pdf_url": pdf_url,
                "source_url": source_url,
                "source": "OpenAlex & arXiv Preprints",
                "categories": [c.get("display_name") for c in w.get("concepts", [])[:4]],
            })

        if papers:
            return {
                "ok": True,
                "source": "arXiv & OpenAlex Preprints",
                "query": query,
                "count": len(papers),
                "papers": papers,
            }
    except Exception:
        pass

    return {
        "ok": False,
        "source": "arXiv",
        "error": "arXiv and academic search services are currently busy. Please try again shortly.",
        "papers": [],
    }
