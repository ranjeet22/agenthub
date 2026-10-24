from langchain_core.tools import tool
from app.research.deduplication import deduplicate_papers
from app.tools.arxiv import search_arxiv_papers
from app.tools.openalex import search_openalex_papers

def _run(tool_obj, query, limit):
    try: result = tool_obj.invoke({"query": query, "limit": limit})
    except Exception as exc: return {"ok": False, "error": f"Provider tool failed: {exc}", "papers": []}
    return result if isinstance(result, dict) else {"ok": False, "error": "Unexpected provider result format.", "papers": []}

def _balanced(papers):
    both, oa, ax, other = [], [], [], []
    for p in papers:
        sources = {str(s).casefold() for s in (p.get("sources") or [])}
        if {"openalex", "arxiv"} <= sources: both.append(p)
        elif "openalex" in sources: oa.append(p)
        elif "arxiv" in sources: ax.append(p)
        else: other.append(p)
    out = list(both)
    while oa or ax:
        if oa: out.append(oa.pop(0))
        if ax: out.append(ax.pop(0))
    return out + other

@tool
def search_all_research_papers(query: str, limit: int = 5) -> dict:
    \"\"\"Search OpenAlex and arXiv, deduplicate overlaps, and return a balanced shortlist. Limit is the total number of unique records returned.\"\"\"
    query = query.strip()
    if not query: return {"ok": False, "source": "AgentHub research search", "error": "Search query cannot be empty.", "papers": [], "count": 0}
    try: limit = max(1, min(int(limit), 10))
    except (TypeError, ValueError): limit = 5
    results = {"OpenAlex": _run(search_openalex_papers, query, limit), "arXiv": _run(search_arxiv_papers, query, limit)}
    records, status, errors = [], {}, {}
    for source, result in results.items():
        papers = result.get("papers") if isinstance(result.get("papers"), list) else []
        ok = result.get("ok") is True and not result.get("error")
        status[source] = {"ok": ok, "count": len(papers)}
        if result.get("error"): errors[source] = str(result["error"]); status[source]["error"] = str(result["error"])
        records.extend(papers)
    unique = deduplicate_papers(records)
    shortlist = _balanced(unique)[:limit]
    return {"ok": any(s["ok"] for s in status.values()), "source": "AgentHub research search", "query": query, "sources_searched": list(results), "successful_sources": [k for k,v in status.items() if v["ok"]], "source_status": status, "source_errors": errors, "count": len(shortlist), "total_unique_count": len(unique), "papers": shortlist}
