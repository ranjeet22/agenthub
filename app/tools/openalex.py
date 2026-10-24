import requests
from langchain_core.tools import tool


OPENALEX_API_URL = "https://api.openalex.org/works"
MAX_RESULTS = 10


@tool
def search_openalex_papers(query: str, limit: int = 5) -> dict:
    """Search OpenAlex for academic papers on a topic.

    Returns paper titles, authors, publication years, DOI/source URLs,
    and citation counts taken from OpenAlex records.
    Use this tool when the user asks about research papers or
    academic literature.
    """
    query = query.strip()

    if not query:
        return {
            "ok": False,
            "source": "OpenAlex",
            "error": "Search query cannot be empty.",
            "papers": [],
        }

    try:
        limit = int(limit)
    except (TypeError, ValueError):
        limit = 5

    limit = max(1, min(limit, MAX_RESULTS))

    try:
        response = requests.get(
            OPENALEX_API_URL,
            params={
                "search": query,
                "per-page": limit,
            },
            headers={"User-Agent": "AgentHub/1.0"},
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()

    except requests.RequestException as exc:
        return {
            "ok": False,
            "source": "OpenAlex",
            "error": f"OpenAlex request failed: {exc}",
            "papers": [],
        }
    except ValueError:
        return {
            "ok": False,
            "source": "OpenAlex",
            "error": "OpenAlex returned an invalid JSON response.",
            "papers": [],
        }

    results = data.get("results", [])

    if not isinstance(results, list):
        return {
            "ok": False,
            "source": "OpenAlex",
            "error": "Unexpected response format from OpenAlex.",
            "papers": [],
        }

    papers = []

    for item in results:
        if not isinstance(item, dict):
            continue

        title = item.get("title")
        if not title:
            continue

        authorships = item.get("authorships") or []
        authors = []

        for authorship in authorships:
            if not isinstance(authorship, dict):
                continue

            author = authorship.get("author") or {}
            name = author.get("display_name")

            if name:
                authors.append(name)

        doi = item.get("doi")
        openalex_id = item.get("id")

        papers.append({
            "title": title,
            "authors": authors[:8],
            "year": item.get("publication_year"),
            "doi": doi,
            "url": doi or openalex_id,
            "openalex_id": openalex_id,
            "cited_by_count": item.get("cited_by_count"),
            "source": "OpenAlex",
        })

    return {
        "ok": True,
        "source": "OpenAlex",
        "query": query,
        "count": len(papers),
        "papers": papers,
    }
