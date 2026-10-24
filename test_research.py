from app.tools.research import search_research_papers

result = search_research_papers.invoke({
    "query": "artificial intelligence in astronomy",
    "limit": 5
})

print(result)