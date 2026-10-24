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
    """Display text content without exposing provider-specific wrappers."""
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


def display_retrieved_evidence(tool_results):
    if not tool_results:
        print("No structured tool evidence was available.")
        return

    for result in tool_results:
        source = result.get("source", "Unknown source")

        if result.get("ok") is False or result.get("error"):
            print(f"\n{source} error: {result.get('error', 'Unknown error')}")
            continue

        papers = result.get("papers", [])

        if not isinstance(papers, list):
            print(f"\n{source}: unexpected paper-result format.")
            continue

        print(
            f"\n{source}: {len(papers)} record(s) returned "
            f"for query: {result.get('query', 'not provided')}"
        )

        if not papers:
            print("  No matching records returned.")
            continue

        for index, paper in enumerate(papers, start=1):
            print(f"\n  {index}. {paper.get('title') or 'Untitled'}")

            authors = paper.get("authors") or []
            print(
                "     Authors: "
                + (", ".join(authors) if authors else "Not listed")
            )
            print(f"     Year: {paper.get('year') or 'Not listed'}")
            print(f"     DOI: {paper.get('doi') or 'Not available'}")
            print(f"     URL: {paper.get('url') or 'Not available'}")

            if paper.get("cited_by_count") is not None:
                print(f"     Citations: {paper['cited_by_count']}")

            if paper.get("categories"):
                print(f"     Categories: {', '.join(paper['categories'])}")

            if paper.get("abstract"):
                print(f"     Abstract: {paper['abstract']}")


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
