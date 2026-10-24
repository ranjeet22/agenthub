import ast
import json

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, ToolMessage

from app.agents.runtime import create_research_agent


def parse_tool_result(content):
    """Convert supported tool-message formats into a dictionary."""
    if isinstance(content, dict):
        return content

    if isinstance(content, str):
        for parser in (json.loads, ast.literal_eval):
            try:
                parsed = parser(content)
                if isinstance(parsed, dict):
                    return parsed
            except (ValueError, SyntaxError, TypeError):
                continue
        return None

    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and isinstance(block.get("text"), str):
                parsed = parse_tool_result(block["text"])
                if parsed is not None:
                    return parsed

    return None


def readable_content(content):
    """Display message content without provider-specific wrappers."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        text_parts = [
            block["text"]
            for block in content
            if isinstance(block, dict)
            and block.get("type") == "text"
            and isinstance(block.get("text"), str)
        ]
        if text_parts:
            return "\n".join(text_parts)

    if isinstance(content, dict):
        return json.dumps(content, ensure_ascii=False, indent=2)

    return str(content)


def display_tool_activity(messages):
    tool_results = []
    called_tools = []

    for message in messages:
        if isinstance(message, AIMessage):
            for call in getattr(message, "tool_calls", []):
                name = call.get("name", "unknown")
                called_tools.append(name)
                print(f"  Tool called: {name}")
                print(f"  Arguments: {call.get('args', {})}")

        elif isinstance(message, ToolMessage):
            parsed = parse_tool_result(message.content)

            if parsed is not None:
                parsed.setdefault("source", message.name or "Unknown")
                tool_results.append(parsed)
            else:
                print(
                    f"  Could not parse structured output from "
                    f"{message.name or 'unknown tool'}."
                )

    if not called_tools:
        print("  No tool call was recorded.")

    return tool_results


def normalize_paper_records(value):
    """Return only paper records that can safely be displayed."""
    if isinstance(value, dict):
        value = [value]

    if not isinstance(value, list):
        return []

    records = []

    for item in value:
        if isinstance(item, dict):
            records.append(item)
            continue

        # Tolerate a JSON-encoded paper record, if a tool returns one.
        if isinstance(item, str):
            parsed = parse_tool_result(item)
            if parsed is not None:
                records.append(parsed)
            else:
                print(
                    "  Skipping an unexpected string-valued paper record."
                )
            continue

        print(
            f"  Skipping an unexpected paper record of type "
            f"{type(item).__name__}."
        )

    return records


def display_retrieved_evidence(tool_results):
    if not tool_results:
        print("No structured tool evidence was available.")
        return

    for result in tool_results:
        if not isinstance(result, dict):
            print(
                "\nSkipping unexpected tool-result type: "
                f"{type(result).__name__}"
            )
            continue

        source = result.get("source", "Unknown source")

        if result.get("ok") is False or result.get("error"):
            print(
                f"\n{source} error: "
                f"{result.get('error', 'Unknown error')}"
            )
            continue

        print(f"\n{source}")

        source_status = result.get("source_status")
        if isinstance(source_status, dict):
            for provider, status in source_status.items():
                print(f"  {provider}: {status}")

        source_errors = result.get("source_errors")
        if isinstance(source_errors, dict):
            for provider, error in source_errors.items():
                print(f"  {provider} error: {error}")

        raw_papers = result.get("papers", [])
        papers = normalize_paper_records(raw_papers)

        print(
            f"  {len(papers)} displayable record(s) "
            f"for query: {result.get('query', 'not provided')}"
        )

        if result.get("total_unique_count") is not None:
            print(
                "  Total unique records found: "
                f"{result['total_unique_count']}"
            )

        if not papers:
            print("  No displayable paper records.")
            continue

        for index, paper in enumerate(papers, start=1):
            title = paper.get("title") or "Untitled"
            print(f"\n  {index}. {title}")

            authors = paper.get("authors") or []
            if isinstance(authors, str):
                authors = [authors]

            print(
                "     Authors: "
                + (", ".join(str(author) for author in authors)
                   if authors else "Not listed")
            )
            print(f"     Year: {paper.get('year') or 'Not listed'}")
            print(f"     DOI: {paper.get('doi') or 'Not available'}")
            print(f"     URL: {paper.get('url') or 'Not available'}")

            sources = paper.get("sources") or [paper.get("source")]
            sources = [str(s) for s in sources if s]
            if sources:
                print(f"     Sources: {', '.join(sources)}")

            if paper.get("cited_by_count") is not None:
                print(f"     Citations: {paper['cited_by_count']}")

            categories = paper.get("categories") or []
            if categories:
                print(f"     Categories: {', '.join(map(str, categories))}")

            if paper.get("abstract"):
                print(f"     Abstract: {paper['abstract']}")

            source_urls = paper.get("source_urls") or []
            if source_urls:
                print(f"     Source URLs: {', '.join(source_urls)}")


def main():
    load_dotenv()

    try:
        agent = create_research_agent()
    except Exception as exc:
        print(f"Could not initialize AgentHub: {exc}")
        return

    print("AgentHub Research Assistant")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if question.lower() in {"exit", "quit"}:
            print("Goodbye.")
            break

        if not question:
            continue

        try:
            result = agent.invoke({
                "messages": [
                    {"role": "user", "content": question}
                ]
            })

            messages = result.get("messages", [])
            if not messages:
                print("\nAgentHub returned no messages.\n")
                continue

            print("\n--- Tool Activity ---")
            tool_results = display_tool_activity(messages)

            print("\n--- Assistant Answer ---")
            print(readable_content(messages[-1].content))

            print("\n--- Retrieved Evidence ---")
            display_retrieved_evidence(tool_results)

            print("\n" + "-" * 60 + "\n")

        except Exception as exc:
            print(f"\nAgentHub request failed: {exc}\n")


if __name__ == "__main__":
    main()
