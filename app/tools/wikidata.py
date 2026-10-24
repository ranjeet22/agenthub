import requests
from langchain_core.tools import tool


WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php"
MAX_RESULTS = 10


def _text(value):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _normalize_entity(item):
    """Normalize one Wikidata entity-search result."""
    if not isinstance(item, dict):
        return None

    entity_id = _text(item.get("id"))
    label = _text(item.get("label"))
    if not entity_id or not label:
        return None

    aliases = item.get("aliases")
    if not isinstance(aliases, list):
        aliases = []

    match = item.get("match")
    match_type = match.get("type") if isinstance(match, dict) else None

    return {
        "entity_id": entity_id,
        "label": label,
        "description": _text(item.get("description")),
        "aliases": [
            alias.strip()
            for alias in aliases
            if isinstance(alias, str) and alias.strip()
        ][:10],
        "match_type": _text(match_type),
        "entity_url": _text(item.get("concepturi")) or f"https://www.wikidata.org/wiki/{entity_id}",
        "source": "Wikidata",
    }


@tool
def search_wikidata_entities(query: str, limit: int = 5) -> dict:
    """Search Wikidata for people, places, organizations, concepts, and other entities.

    Returns structured entity labels, descriptions, aliases, entity IDs,
    and source URLs. This public API does not require an API key.
    """
    query = (query or "").strip()
    if not query:
        return {
            "ok": False,
            "source": "Wikidata",
            "query": query,
            "error": "Wikidata search query cannot be empty.",
            "count": 0,
            "entities": [],
        }

    try:
        limit = max(1, min(int(limit), MAX_RESULTS))
    except (TypeError, ValueError):
        limit = 5

    try:
        response = requests.get(
            WIKIDATA_SEARCH_URL,
            params={
                "action": "wbsearchentities",
                "search": query,
                "language": "en",
                "uselang": "en",
                "format": "json",
                "limit": limit,
            },
            headers={"User-Agent": "AgentHub/1.0 (Wikidata entity search)"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        return {
            "ok": False,
            "source": "Wikidata",
            "query": query,
            "error": f"Wikidata search request failed: {exc}",
            "count": 0,
            "entities": [],
        }
    except ValueError:
        return {
            "ok": False,
            "source": "Wikidata",
            "query": query,
            "error": "Wikidata returned invalid JSON.",
            "count": 0,
            "entities": [],
        }

    raw_results = payload.get("search") if isinstance(payload, dict) else None
    if not isinstance(raw_results, list):
        return {
            "ok": False,
            "source": "Wikidata",
            "query": query,
            "error": "Unexpected response format from Wikidata.",
            "count": 0,
            "entities": [],
        }

    entities = []
    for item in raw_results:
        entity = _normalize_entity(item)
        if entity:
            entities.append(entity)
        if len(entities) >= limit:
            break

    return {
        "ok": True,
        "source": "Wikidata",
        "query": query,
        "count": len(entities),
        "entities": entities,
    }
