import requests
from langchain_core.tools import tool


MET_API_BASE_URL = "https://collectionapi.metmuseum.org/public/collection"
MAX_RESULTS = 5


def _text(value):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _normalize_artwork(item):
    """Normalize a Met object record without inventing missing metadata."""
    if not isinstance(item, dict) or not isinstance(item.get("objectID"), int):
        return None

    constituents = item.get("constituents")
    if not isinstance(constituents, list):
        constituents = []

    tags = item.get("tags")
    if not isinstance(tags, list):
        tags = []

    return {
        "object_id": item["objectID"],
        "title": _text(item.get("title")) or "Untitled",
        "artist": _text(item.get("artistDisplayName")),
        "artist_bio": _text(item.get("artistDisplayBio")),
        "artist_nationality": _text(item.get("artistNationality")),
        "object_date": _text(item.get("objectDate")),
        "culture": _text(item.get("culture")),
        "period": _text(item.get("period")),
        "dynasty": _text(item.get("dynasty")),
        "medium": _text(item.get("medium")),
        "dimensions": _text(item.get("dimensions")),
        "object_name": _text(item.get("objectName")),
        "classification": _text(item.get("classification")),
        "department": _text(item.get("department")),
        "is_highlight": item.get("isHighlight"),
        "is_public_domain": item.get("isPublicDomain"),
        "primary_image": _text(item.get("primaryImage")),
        "primary_image_small": _text(item.get("primaryImageSmall")),
        "additional_images": [
            image for image in item.get("additionalImages", [])
            if isinstance(image, str) and image.startswith("https://")
        ][:5] if isinstance(item.get("additionalImages"), list) else [],
        "tags": [
            {"term": tag.get("term"), "url": tag.get("AAT_URL")}
            for tag in tags if isinstance(tag, dict) and _text(tag.get("term"))
        ][:10],
        "constituents": [
            {"name": person.get("name"), "role": person.get("role")}
            for person in constituents
            if isinstance(person, dict) and _text(person.get("name"))
        ][:10],
        "object_url": _text(item.get("objectURL")) or _text(item.get("linkResource")),
        "metadata_date": _text(item.get("metadataDate")),
        "credit_line": _text(item.get("creditLine")),
        "source": "The Metropolitan Museum of Art",
        "source_url": _text(item.get("objectURL")) or f"https://www.metmuseum.org/art/collection/search/{item['objectID']}",
    }


@tool
def search_met_collection(query: str, limit: int = 3, has_images: bool = True) -> dict:
    """Search The Metropolitan Museum of Art's public collection for artworks.

    Returns structured artwork records including title, artist, date, medium,
    department, public-domain status, image URLs, and Met source links.
    This public API does not require an API key.
    """
    query = (query or "").strip()
    if not query:
        return {
            "ok": False, "source": "The Metropolitan Museum of Art", "query": query,
            "error": "Please provide an artwork, artist, culture, material, or subject to search for.",
            "count": 0, "total_matches": 0, "artworks": [],
        }

    try:
        limit = max(1, min(int(limit), MAX_RESULTS))
    except (TypeError, ValueError):
        limit = 3

    params = {"q": query, "limit": limit, "offset": 0}
    if has_images:
        params["hasImages"] = "true"

    try:
        response = requests.get(
            f"{MET_API_BASE_URL}/v1.1/search",
            params=params,
            headers={"User-Agent": "AgentHub/1.0 (Met collection search)"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        return {
            "ok": False, "source": "The Metropolitan Museum of Art", "query": query,
            "error": f"Met collection search failed: {type(exc).__name__}: {exc}",
            "count": 0, "total_matches": 0, "artworks": [],
        }
    except ValueError:
        return {
            "ok": False, "source": "The Metropolitan Museum of Art", "query": query,
            "error": "The Met API returned invalid JSON during search.",
            "count": 0, "total_matches": 0, "artworks": [],
        }

    if not isinstance(payload, dict) or not isinstance(payload.get("objectIDs"), list):
        return {
            "ok": False, "source": "The Metropolitan Museum of Art", "query": query,
            "error": "Unexpected response format from the Met search endpoint.",
            "count": 0, "total_matches": 0, "artworks": [],
        }

    object_ids = [value for value in payload["objectIDs"] if isinstance(value, int)][:limit]
    total_matches = payload.get("total", 0)
    artworks, errors = [], []

    # Fetch a small, bounded number of records to avoid excessive API traffic.
    for object_id in object_ids:
        try:
            object_response = requests.get(
                f"{MET_API_BASE_URL}/v1/objects/{object_id}",
                headers={"User-Agent": "AgentHub/1.0 (Met collection search)"},
                timeout=20,
            )
            object_response.raise_for_status()
            object_payload = object_response.json()
            artwork = _normalize_artwork(object_payload)
            if artwork:
                artworks.append(artwork)
            else:
                errors.append(f"Object {object_id}: missing or invalid object metadata.")
        except requests.RequestException as exc:
            errors.append(f"Object {object_id}: {type(exc).__name__}: {exc}")
        except ValueError:
            errors.append(f"Object {object_id}: invalid JSON response.")

    return {
        "ok": True,
        "source": "The Metropolitan Museum of Art",
        "query": query,
        "total_matches": total_matches if isinstance(total_matches, int) else 0,
        "count": len(artworks),
        "artworks": artworks,
        "errors": errors,
        "note": "Search results are paginated. Image availability and public-domain status are properties of each returned artwork; check is_public_domain before treating an image as CC0/open access.",
    }
