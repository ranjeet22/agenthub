import requests
from langchain_core.tools import tool


OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVER_URL = "https://covers.openlibrary.org/b/id"
MAX_RESULTS = 10

SEARCH_FIELDS = ",".join([
    "key",
    "title",
    "author_name",
    "first_publish_year",
    "cover_i",
    "edition_count",
    "isbn",
    "publisher",
    "subject",
    "language",
])


def _clean_list(value, limit=None):
    """Normalize a provider field that may be missing or malformed."""
    if not isinstance(value, list):
        return []

    cleaned = [
        str(item).strip()
        for item in value
        if item is not None and str(item).strip()
    ]

    return cleaned[:limit] if limit else cleaned


def _normalize_book(item):
    """Convert one Open Library search document to AgentHub's schema."""
    if not isinstance(item, dict):
        return None

    title = item.get("title")
    if not isinstance(title, str) or not title.strip():
        return None

    key = item.get("key")
    source_url = (
        f"https://openlibrary.org{key}"
        if isinstance(key, str) and key.startswith("/")
        else None
    )

    cover_id = item.get("cover_i")
    cover_url = None

    if isinstance(cover_id, int) and cover_id > 0:
        cover_url = (
            f"{OPEN_LIBRARY_COVER_URL}/{cover_id}-L.jpg?default=false"
        )

    year = item.get("first_publish_year")
    if not isinstance(year, int):
        year = None

    edition_count = item.get("edition_count")
    if not isinstance(edition_count, int):
        edition_count = None

    return {
        "title": title.strip(),
        "authors": _clean_list(item.get("author_name"), limit=10),
        "first_publish_year": year,
        "edition_count": edition_count,
        "isbn": _clean_list(item.get("isbn"), limit=5),
        "publishers": _clean_list(item.get("publisher"), limit=5),
        "subjects": _clean_list(item.get("subject"), limit=8),
        "languages": _clean_list(item.get("language"), limit=5),
        "cover_id": cover_id if isinstance(cover_id, int) else None,
        "cover_image_url": cover_url,
        "source_url": source_url,
        "source": "Open Library",
        "open_library_key": key if isinstance(key, str) else None,
    }


@tool
def search_open_library_books(query: str, limit: int = 5) -> dict:
    """Search Open Library for books by topic, title, author, or keyword.

    Returns structured book metadata, including title, authors,
    first publication year, ISBNs, publishers, cover image URL, and
    the Open Library source URL. Missing metadata remains null or empty.
    Use this tool for book discovery, book details, and textbook searches.
    """
    query = (query or "").strip()

    if not query:
        return {
            "ok": False,
            "source": "Open Library",
            "query": query,
            "error": "Book search query cannot be empty.",
            "count": 0,
            "books": [],
        }

    try:
        limit = max(1, min(int(limit), MAX_RESULTS))
    except (TypeError, ValueError):
        limit = 5

    try:
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL,
            params={
                "q": query,
                "limit": limit,
                "fields": SEARCH_FIELDS,
            },
            headers={"User-Agent": "AgentHub/1.0"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()

    except requests.RequestException as exc:
        return {
            "ok": False,
            "source": "Open Library",
            "query": query,
            "error": f"Open Library request failed: {exc}",
            "count": 0,
            "books": [],
        }
    except ValueError:
        return {
            "ok": False,
            "source": "Open Library",
            "query": query,
            "error": "Open Library returned invalid JSON.",
            "count": 0,
            "books": [],
        }

    if not isinstance(payload, dict) or not isinstance(
        payload.get("docs"), list
    ):
        return {
            "ok": False,
            "source": "Open Library",
            "query": query,
            "error": "Unexpected response format from Open Library.",
            "count": 0,
            "books": [],
        }

    books = []
    for item in payload["docs"]:
        book = _normalize_book(item)
        if book:
            books.append(book)

    return {
        "ok": True,
        "source": "Open Library",
        "query": query,
        "count": len(books),
        "books": books,
    }
