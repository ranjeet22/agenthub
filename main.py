from logging import exception
from dotenv import load_dotenv
from app.agents.runtime import create_research_agent

import traceback

load_dotenv()

agent = create_research_agent()
print("Research Agent ready. Type 'exit' to quit.\n")

while True:
    question = input("You: ").strip()

    if question.lower() in {"exit", "quit"}:
        break

    if not question:
        continue

    try:
        result = agent.invoke({
            "messages": [
                {"role": "user", "content": question}
            ]
        })

        print("\nAssistant:")
        print(result["messages"][-1].content)
        print()

    except Exception as exc:
        traceback.print_exc()
        print(f"\nAgent error: {exc}\n")