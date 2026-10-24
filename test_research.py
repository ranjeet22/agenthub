from app.tools.openalex import search_openalex_papers

result = search_openalex_papers.invoke({
    "query": "artificial intelligence in astronomy",
    "limit": 5
})

print(result)