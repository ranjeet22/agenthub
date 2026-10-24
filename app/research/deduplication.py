import re
import unicodedata
from urllib.parse import unquote

_DOI = re.compile(r"^(?:https?://(?:dx\\.)?doi\\.org/|doi:\\s*)", re.I)
_ARXIV = re.compile(r"(?:arxiv\\.org/(?:abs|pdf)/)?(\\d{4}\\.\\d{4,5}|[a-z-]+/\\d{7})(?:v\\d+)?(?:\\.pdf)?", re.I)

def normalize_doi(value):
    return _DOI.sub("", unquote(str(value)).strip()).rstrip(" .;,").lower() if value else ""

def normalize_arxiv_id(paper):
    value = str(paper.get("arxiv_id") or paper.get("url") or "").strip()
    match = _ARXIV.search(value) if value else None
    return match.group(1).lower() if match else ""

def normalize_title(title):
    if not title: return ""
    value = unicodedata.normalize("NFKC", str(title)).casefold()
    return " ".join(re.sub(r"[^\\w\\s]", " ", value).split())

def _author(paper):
    authors = paper.get("authors") or []
    if not authors or not authors[0]: return None
    tokens = re.findall(r"[\\w]+", unicodedata.normalize("NFKC", str(authors[0])).casefold())
    return (tokens[-1], "".join(t[0] for t in tokens[:-1])) if tokens else None

def _authors_match(a, b):
    a, b = _author(a), _author(b)
    if not a or not b or a[0] != b[0]: return False
    x, y = a[1], b[1]
    return (x == y) if not x or not y else (x.startswith(y) or y.startswith(x))

def _years_match(a, b):
    x, y = a.get("year"), b.get("year")
    if not x or not y: return True
    try: return abs(int(str(x)[:4]) - int(str(y)[:4])) <= 1
    except (TypeError, ValueError): return True

def papers_match(a, b):
    da, db = normalize_doi(a.get("doi")), normalize_doi(b.get("doi"))
    if da and db and da == db: return True
    aa, ab = normalize_arxiv_id(a), normalize_arxiv_id(b)
    if aa and ab and aa == ab: return True
    title = normalize_title(a.get("title"))
    return bool(title and title == normalize_title(b.get("title")) and _authors_match(a, b) and _years_match(a, b))

def _unique(values):
    result, seen = [], set()
    for value in values:
        if value and value not in seen: seen.add(value); result.append(value)
    return result

def merge_papers(a, b):
    merged = dict(a)
    for key, value in b.items():
        if value in (None, "", [], {}): continue
        old = merged.get(key)
        if old in (None, "", [], {}) or (key == "abstract" and len(str(value)) > len(str(old))): merged[key] = value
    merged["sources"] = _unique(list(a.get("sources") or []) + list(b.get("sources") or []) + ([a["source"]] if a.get("source") else []) + ([b["source"]] if b.get("source") else []))
    merged["source_urls"] = _unique(list(a.get("source_urls") or []) + list(b.get("source_urls") or []) + ([a["url"]] if a.get("url") else []) + ([b["url"]] if b.get("url") else []))
    merged["categories"] = _unique(list(a.get("categories") or []) + list(b.get("categories") or []))
    if merged.get("doi"): merged["url"] = merged["doi"]
    return merged

def deduplicate_papers(papers):
    unique = []
    for item in papers:
        if not isinstance(item, dict): continue
        paper = dict(item)
        paper["sources"] = _unique(list(paper.get("sources") or []) + ([paper["source"]] if paper.get("source") else []))
        paper["source_urls"] = _unique(list(paper.get("source_urls") or []) + ([paper["url"]] if paper.get("url") else []))
        idx = next((i for i, old in enumerate(unique) if papers_match(old, paper)), None)
        if idx is None: unique.append(paper)
        else: unique[idx] = merge_papers(unique[idx], paper)
    return unique
