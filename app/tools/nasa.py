import requests
from langchain_core.tools import tool


NASA_IMAGE_SEARCH_URL = "https://images-api.nasa.gov/search"
NASA_DETAILS_BASE_URL = "https://images.nasa.gov/details"
MAX_RESULTS = 10


def _first_text(value):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _normalize_item(item):
    """Normalize one NASA Image and Video Library search result."""
    if not isinstance(item, dict):
        return None

    data_items = item.get("data")
    if not isinstance(data_items, list) or not data_items:
        return None

    metadata = data_items[0]
    if not isinstance(metadata, dict):
        return None

    nasa_id = _first_text(metadata.get("nasa_id"))
    title = _first_text(metadata.get("title"))
    if not title:
        return None

    links = item.get("links")
    image_url = None
    if isinstance(links, list):
        for link in links:
            if not isinstance(link, dict):
                continue
            href = _first_text(link.get("href"))
            if href and link.get("rel") in ("preview", "image"):
                image_url = href
                break
        if image_url is None:
            for link in links:
                if isinstance(link, dict):
                    image_url = _first_text(link.get("href"))
                    if image_url:
                        break

    description = _first_text(metadata.get("description"))
    keywords = metadata.get("keywords")
    if not isinstance(keywords, list):
        keywords = []

    return {
        "nasa_id": nasa_id,
        "title": title,
        "description": description,
        "explanation": description,
        "date_created": _first_text(metadata.get("date_created")),
        "image_url": image_url,
        "thumbnail_url": image_url,
        "source_url": (
            f"{NASA_DETAILS_BASE_URL}/{nasa_id}" if nasa_id else None
        ),
        "media_type": _first_text(metadata.get("media_type")),
        "center": _first_text(metadata.get("center")),
        "photographer": _first_text(metadata.get("photographer")),
        "secondary_creator": _first_text(metadata.get("secondary_creator")),
        "keywords": [
            str(keyword).strip()
            for keyword in keywords
            if keyword is not None and str(keyword).strip()
        ][:15],
        "source": "NASA Image and Video Library",
    }


@tool
def search_nasa_images(query: str, limit: int = 5) -> dict:
    """Search NASA's public Image and Video Library for multiple images.

    Use for topics such as planets, galaxies, missions, astronauts,
    telescopes, Earth, spacecraft, and space exploration. Returns
    structured results with title, description/explanation, creation
    date, image URL, NASA detail page, NASA ID, keywords, and creator
    or NASA center metadata when available. This API needs no API key.
    """
    query = (query or "").strip()
    if not query:
        return {
            "ok": False,
            "source": "NASA Image and Video Library",
            "query": query,
            "error": "NASA image search query cannot be empty.",
            "count": 0,
            "images": [],
        }

    try:
        limit = max(1, min(int(limit), MAX_RESULTS))
    except (TypeError, ValueError):
        limit = 5

    try:
        response = requests.get(
            NASA_IMAGE_SEARCH_URL,
            params={
                "q": query,
                "media_type": "image",
                "page_size": limit,
            },
            headers={"User-Agent": "AgentHub/1.0"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        return {
            "ok": False,
            "source": "NASA Image and Video Library",
            "query": query,
            "error": f"NASA image search request failed: {exc}",
            "count": 0,
            "images": [],
        }
    except ValueError:
        return {
            "ok": False,
            "source": "NASA Image and Video Library",
            "query": query,
            "error": "NASA image search returned invalid JSON.",
            "count": 0,
            "images": [],
        }

    collection = payload.get("collection") if isinstance(payload, dict) else None
    items = collection.get("items") if isinstance(collection, dict) else None
    if not isinstance(items, list):
        return {
            "ok": False,
            "source": "NASA Image and Video Library",
            "query": query,
            "error": "Unexpected response format from NASA.",
            "count": 0,
            "images": [],
        }

    images = []
    for item in items:
        normalized = _normalize_item(item)
        if normalized:
            images.append(normalized)
        if len(images) >= limit:
            break

    return {
        "ok": True,
        "source": "NASA Image and Video Library",
        "query": query,
        "count": len(images),
        "images": images,
    }
