import re
import xml.etree.ElementTree as ET
import requests
from langchain_core.tools import tool

ARXIV_API_URL = "https://export.arxiv.org/api/query"
NAMESPACES = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
_STOPWORDS = {"a", "an", "and", "for", "in", "of", "on", "or", "the", "to", "with"}

def build_arxiv_query(query):
    terms = [t for t in re.findall(r"[A-Za-z0-9]+", query.lower()) if t not in _STOPWORDS]
    return " AND ".join(f"all:{t}" for t in terms)

def _extract_arxiv_id(url):
    m = re.search(r"arxiv\.org/(?:abs|pdf)/((?:\d{4}\.\d{4,5})|(?:[a-z-]+/\d{7}))(?:v\d+)?(?:\.pdf)?", url or "", re.I)
    return m.group(1).lower() if m else None

@tool
def search_arxiv_papers(query: str, limit: int = 5) -> dict:
    """Search arXiv for scientific preprints and return metadata and abstracts."""
    query = query.strip()
    if not query: return {"ok": False, "source": "arXiv", "error": "Search query cannot be empty.", "papers": []}
    provider_query = build_arxiv_query(query)
    if not provider_query: return {"ok": False, "source": "arXiv", "error": "Search query must contain searchable terms.", "papers": []}
    try: limit = max(1, min(int(limit), 10))
    except (TypeError, ValueError): limit = 5
    try:
        response = requests.get(ARXIV_API_URL, params={"search_query": provider_query, "start": 0, "max_results": limit, "sortBy": "relevance", "sortOrder": "descending"}, headers={"User-Agent": "AgentHub/1.0"}, timeout=30)
        response.raise_for_status()
        root = ET.fromstring(response.content)
    except requests.RequestException as exc: return {"ok": False, "source": "arXiv", "error": f"arXiv request failed: {exc}", "papers": []}
    except ET.ParseError: return {"ok": False, "source": "arXiv", "error": "arXiv returned invalid XML.", "papers": []}
    papers = []
    for entry in root.findall("atom:entry", NAMESPACES):
        title = " ".join(entry.findtext("atom:title", default="", namespaces=NAMESPACES).split())
        if not title: continue
        authors = [a.findtext("atom:name", default="", namespaces=NAMESPACES).strip() for a in entry.findall("atom:author", NAMESPACES)]
        authors = [a for a in authors if a]
        published = entry.findtext("atom:published", default="", namespaces=NAMESPACES)
        url = entry.findtext("atom:id", default="", namespaces=NAMESPACES)
        doi = entry.findtext("arxiv:doi", default="", namespaces=NAMESPACES).strip() or None
        abstract = " ".join(entry.findtext("atom:summary", default="", namespaces=NAMESPACES).split())
        categories = [c.get("term") for c in entry.findall("atom:category", NAMESPACES) if c.get("term")]
        papers.append({"title": title, "authors": authors[:8], "year": published[:4] if published else None, "published": published or None, "doi": doi, "url": url or None, "arxiv_id": _extract_arxiv_id(url), "abstract": abstract[:1200], "categories": categories, "source": "arXiv"})
    return {"ok": True, "source": "arXiv", "query": query, "provider_query": provider_query, "count": len(papers), "papers": papers}
