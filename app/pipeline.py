import ast
import json
import re

from langchain_core.messages import AIMessage, ToolMessage

from app.agents.books_agent import create_books_agent
from app.agents.research_agent import create_research_agent
from app.agents.space_agent import create_space_agent
from app.agents.wikidata_agent import create_wikidata_agent


RESEARCH_TERMS = re.compile(
    r"\b("
    r"research papers?|academic papers?|scholarly articles?|"
    r"arxiv|openalex|citation count|literature review|"
    r"scientific publications?"
    r")\b",
    re.IGNORECASE,
)

BOOK_TERMS = re.compile(
    r"\b("
    r"books?|book recommendations?|novels?|textbooks?|"
    r"isbn|open library|editions?|"
    r"find me a book|recommend me a book|"
    r"author of|books to read"
    r")\b",
    re.IGNORECASE,
)

WIKIDATA_TERMS = re.compile(
    r"\b("
    r"wikidata|who is|what is|tell me about|facts about|"
    r"entity lookup|look up entity|capital of|population of|"
    r"born in|founded in|founder of|official website|where is"
    r")\b",
    re.IGNORECASE,
)


SPACE_TERMS = re.compile(
    r"\b("
    r"nasa|space images?|space photos?|astronomical images?|"
    r"galax(?:y|ies)|nebulae?|planets?|mars rover|moon photos?|"
    r"james webb|hubble telescope|apollo mission|astronauts?|"
    r"space exploration|spacecraft|solar system"
    r")\b",
    re.IGNORECASE,
)


def route_query(query: str) -> str:
    """Choose an agent without making an additional LLM call."""
    normalized = (query or "").strip()

    # Explicit research and book intents take priority over broad space terms.
    if RESEARCH_TERMS.search(normalized):
        return "research"
    elif BOOK_TERMS.search(normalized):
        return "books"
    elif SPACE_TERMS.search(normalized):
        return "space"
    elif WIKIDATA_TERMS.search(normalized):
        return "wikidata"
    else:
        # Preserve the existing research-first default.
        return "research"


def _parse_payload(content):
    """Parse structured tool output without assuming one content format."""
    if isinstance(content, dict):
        return content

    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and isinstance(block.get("text"), str):
                parsed = _parse_payload(block["text"])
                if isinstance(parsed, dict):
                    return parsed
        return None

    if isinstance(content, str):
        for parser in (json.loads, ast.literal_eval):
            try:
                parsed = parser(content)
                if isinstance(parsed, dict):
                    return parsed
            except (ValueError, SyntaxError, TypeError):
                continue

    return None


def _message_text(content):
    """Convert common LangChain message content formats to readable text."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = [
            block["text"]
            for block in content
            if isinstance(block, dict)
            and isinstance(block.get("text"), str)
        ]
        if parts:
            return "\\n".join(parts)

    if isinstance(content, dict):
        return json.dumps(content, ensure_ascii=False)

    return str(content)


def _run_agent(agent, query, route):
    result = agent.invoke({
        "messages": [
            {"role": "user", "content": query}
        ]
    })

    messages = result.get("messages", [])
    if not messages:
        return {
            "ok": False,
            "route": route,
            "answer": "The agent returned no messages.",
            "evidence": [],
            "tool_calls": [],
        }

    tool_calls = []
    evidence = []

    for message in messages:
        if isinstance(message, AIMessage):
            for call in getattr(message, "tool_calls", []):
                tool_calls.append({
                    "name": call.get("name", "unknown"),
                    "arguments": call.get("args", {}),
                })

        elif isinstance(message, ToolMessage):
            payload = _parse_payload(message.content)
            if payload is not None:
                payload.setdefault("tool", message.name or "unknown")
                evidence.append(payload)

    answer = _message_text(messages[-1].content)

    return {
        "ok": True,
        "route": route,
        "answer": answer,
        "evidence": evidence,
        "tool_calls": tool_calls,
    }


def run_agent_query(query: str) -> dict:
    """Route a query to its dedicated agent and return a common response."""
    query = (query or "").strip()

    if not query:
        return {
            "ok": False,
            "route": None,
            "answer": "Please enter a question.",
            "evidence": [],
            "tool_calls": [],
        }

    route = route_query(query)

    if route == "books":
        agent = create_books_agent()
    elif route == "research":
        agent = create_research_agent()
    elif route == "space":
        agent = create_space_agent()
    elif route == "wikidata":
        agent = create_wikidata_agent()
    else:
        return {
            "ok": False,
            "route": route,
            "answer": "No agent is configured for this category yet.",
            "evidence": [],
            "tool_calls": [],
        }

    try:
        return _run_agent(agent, query, route)
    except Exception as exc:
        # Keep provider/model errors visible to the caller.
        return {
            "ok": False,
            "route": route,
            "answer": f"The {route} agent failed: {type(exc).__name__}: {exc}",
            "evidence": [],
            "tool_calls": [],
        }
