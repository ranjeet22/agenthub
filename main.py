import json

from dotenv import load_dotenv

from app.pipeline import run_agent_query


def main():
    load_dotenv()

    print("AgentHub")
    print("Ask about books or academic research.")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            query = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if query.lower() in {"exit", "quit"}:
            print("Goodbye.")
            break

        if not query:
            continue

        result = run_agent_query(query)

        print(f"\n--- Agent: {result.get('route') or 'none'} ---")
        print("\n--- Answer ---")
        print(result.get("answer", "No answer returned."))

        calls = result.get("tool_calls", [])
        print("\n--- Tool Activity ---")
        if calls:
            for call in calls:
                print(f"Tool: {call.get('name', 'unknown')}")
                print(
                    "Arguments: "
                    + json.dumps(
                        call.get("arguments", {}),
                        ensure_ascii=False,
                    )
                )
        else:
            print("No tool calls recorded.")

        print("\n--- Structured Evidence ---")
        evidence = result.get("evidence", [])
        if evidence:
            for item in evidence:
                # Keep CLI output generic; frontend receives the full records.
                if "books" in item:
                    print(
                        f"Open Library: {item.get('count', len(item['books']))} "
                        "book(s) retrieved."
                    )
                elif "papers" in item:
                    print(
                        f"Research: {item.get('count', len(item['papers']))} "
                        "paper(s) retrieved."
                    )
                else:
                    print(json.dumps(item, ensure_ascii=False, indent=2))
        else:
            print("No structured evidence was captured.")

        print("\n" + "-" * 60 + "\n")


if __name__ == "__main__":
    main()