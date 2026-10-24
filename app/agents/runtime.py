from langchain.agents import create_agent
from app.tools.research import search_research_papers

SYSTEM_PROMPT = """
You are a research assistant.

Rules:
1. Use search_research_papers for questions asking about academic
   papers, research literature, or published research.
2. Base claims about retrieved papers on the tool's results.
3. Never invent paper titles, authors, publication years, or URLs.
4. If the tool returns an error or no results, explain that clearly.
5. Summarize findings in a readable format.
6. Include source URLs when available.
"""

def create_research_agent():
    return create_agent(
        model="google_genai:gemini-2.5-flash",
        tools=[search_research_papers],
        system_prompt=SYSTEM_PROMPT
    )