import requests
from langchain_core.tools import tool

@tool
def search_research_papers(query: str, limit: int = 5) -> dict:
    """Search OpenAlex for scholarly papers about a research topic.
    Returns paper titles, publication years, authors, and source URLs.
    Use for questions requiring academic research literature.
    """

    query = query.strip()

    if not query:
        return {"error": "Search query cannot be empty."}

    limit = max(1, min(limit, 10))

    try:
        response = requests.get(
            "https://api.openalex.org/works",
            params={"search": query, "per-page": limit},
            timeout=20
        )
        response.raise_for_status()
        data = response.json()

    except requests.RequestException as exc:
        return {"error": f"OpenAlex request failed: {exc}"}

    papers = []
    for item in data.get("results", []):
        authors = [
            authorship.get("author", {}).get("display_name", "Unknown")
            for authorship in item.get("authorships", [])
        ]

        papers.append({
            "title": item.get("title"),
            "year": item.get("publication_year"),
            "authors": authors[:8],
            "url": item.get("doi") or item.get("id")
        })

    return {
        "source": "OpenAlex",
        "query": query,
        "count": len(papers),
        "papers": papers
    }
    