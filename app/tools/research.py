from app.research.deduplication import deduplicate_papers
from app.tools.arxiv import search_arxiv_papers
from app.tools.openalex import search_openalex_papers
from langchain_core.tools import tool


@tool
def search_all_research_papers(query: str, limit: int = 5) -> dict:
    """Search OpenAlex and arXiv together for research papers.

    Returns a balanced, deduplicated list of up to `limit` papers,
    source status for each provider, and source URLs when available.
    Use this for broad research discovery or when the user requests
    multiple academic sources.
    """
    query = (query or "").strip()

    try:
        limit = int(limit)
    except (TypeError, ValueError):
        limit = 5

    limit = max(1, min(limit, 10))

    if not query:
        return {
            "ok": False,
            "source": "AgentHub research search",
            "query": query,
            "error": "Search query cannot be empty.",
            "papers": [],
        }

    providers = [
        ("OpenAlex", search_openalex_papers),
        ("arXiv", search_arxiv_papers),
    ]

    source_status = {}
    source_errors = {}
    provider_papers = {}

    for source_name, provider_tool in providers:
        try:
            result = provider_tool.invoke({
                "query": query,
                "limit": limit,
            })

            if not isinstance(result, dict):
                raise ValueError("Provider returned an unexpected response.")

            if result.get("ok") is False or result.get("error"):
                source_status[source_name] = "error"
                source_errors[source_name] = result.get(
                    "error", "Provider search failed."
                )
                provider_papers[source_name] = []
                continue

            papers = result.get("papers", [])
            if not isinstance(papers, list):
                raise ValueError("Provider returned an invalid papers list.")

            cleaned = []

            for original in papers:
                if not isinstance(original, dict):
                    continue

                paper = dict(original)
                paper["source"] = source_name

                urls = paper.get("source_urls") or []
                if paper.get("url"):
                    urls = list(urls) + [paper["url"]]
                paper["source_urls"] = list(dict.fromkeys(urls))

                cleaned.append(paper)

            provider_papers[source_name] = cleaned
            source_status[source_name] = "ok"

        except Exception as exc:
            source_status[source_name] = "error"
            source_errors[source_name] = (
                f"{type(exc).__name__}: {exc}"
            )
            provider_papers[source_name] = []

    # Interleave before deduplication so the first provider cannot
    # dominate the combined list just because it was queried first.
    interleaved = []
    max_provider_length = max(
        (len(items) for items in provider_papers.values()),
        default=0,
    )

    for index in range(max_provider_length):
        for source_name, _ in providers:
            papers = provider_papers.get(source_name, [])
            if index < len(papers):
                interleaved.append(papers[index])

    unique_papers = deduplicate_papers(interleaved)

    # Select a balanced subset when both sources have usable results.
    # Merged duplicates count as one paper with multiple sources.
    selected = []
    selected_ids = set()

    def paper_sources(paper):
        return set(paper.get("sources") or [paper.get("source")])

    # First, try to represent each successful source in the returned
    # subset when unique records from that source are available.
    successful_sources = [
        name for name, status in source_status.items()
        if status == "ok"
    ]

    for source_name in successful_sources:
        for paper in unique_papers:
            if source_name in paper_sources(paper):
                identity = (
                    paper.get("doi")
                    or paper.get("url")
                    or paper.get("title")
                )
                if identity not in selected_ids:
                    selected.append(paper)
                    selected_ids.add(identity)
                break

    for paper in unique_papers:
        if len(selected) >= limit:
            break

        identity = paper.get("doi") or paper.get("url") or paper.get("title")
        if identity not in selected_ids:
            selected.append(paper)
            selected_ids.add(identity)

    selected = selected[:limit]

    return {
        "ok": any(status == "ok" for status in source_status.values()),
        "source": "AgentHub research search",
        "query": query,
        "sources_searched": list(source_status.keys()),
        "successful_sources": [
            name for name, status in source_status.items()
            if status == "ok"
        ],
        "source_status": source_status,
        "source_errors": source_errors,
        "count": len(selected),
        "total_unique_count": len(unique_papers),
        "papers": selected,
    }