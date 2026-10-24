import xml.etree.ElementTree as ET

import requests
from langchain_core.tools import tool


ARXIV_API_URL = "https://export.arxiv.org/api/query"

NAMESPACES = {
    "atom": "http://www.w3.org/2005/Atom",
    "arxiv": "http://arxiv.org/schemas/atom",
}


@tool
def search_arxiv_papers(query: str, limit: int = 5) -> dict:
    """Search arXiv for scientific preprints and research papers.

    Returns titles, authors, publication dates, abstracts, categories,
    arXiv URLs, and DOI values when available. Use for scientific
    literature, especially computer science, AI, physics, astronomy,
    mathematics, and related technical fields.
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
        limit = int(limit)
    except (TypeError, ValueError):
        limit = 5

    limit = max(1, min(limit, 10))

    try:
        response = requests.get(
            ARXIV_API_URL,
            params={
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": limit,
                "sortBy": "relevance",
                "sortOrder": "descending",
            },
            headers={"User-Agent": "AgentHub/1.0"},
            timeout=30,
        )
        response.raise_for_status()
        root = ET.fromstring(response.content)

    except requests.RequestException as exc:
        return {
            "ok": False,
            "source": "arXiv",
            "error": f"arXiv request failed: {exc}",
            "papers": [],
        }
    except ET.ParseError:
        return {
            "ok": False,
            "source": "arXiv",
            "error": "arXiv returned an invalid XML response.",
            "papers": [],
        }

    entries = root.findall("atom:entry", NAMESPACES)
    papers = []

    for entry in entries:
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
        )
        arxiv_url = entry.findtext(
            "atom:id", default="", namespaces=NAMESPACES
        )

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
            "abstract": " ".join(abstract.split())[:1200],
            "categories": categories,
            "source": "arXiv",
        })

    return {
        "ok": True,
        "source": "arXiv",
        "query": query,
        "count": len(papers),
        "papers": papers,
    }
