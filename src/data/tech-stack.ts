export interface TechItem {
  name: string;
  category: "Language" | "Framework" | "Model" | "Data Source" | "API";
}

export const TECH_ROW_1: TechItem[] = [
  { name: "Python", category: "Language" },
  { name: "LangChain", category: "Framework" },
  { name: "LangGraph", category: "Framework" },
  { name: "Google Gemini", category: "Model" },
  { name: "OpenAlex", category: "Data Source" },
  { name: "arXiv", category: "Data Source" },
  { name: "FastAPI", category: "Framework" },
];

export const TECH_ROW_2: TechItem[] = [
  { name: "NASA Image Library", category: "API" },
  { name: "Wikidata", category: "Data Source" },
  { name: "OpenAQ", category: "API" },
  { name: "OpenStreetMap", category: "API" },
  { name: "The Metropolitan Museum of Art", category: "API" },
  { name: "Open Library", category: "Data Source" },
  { name: "Next.js & TypeScript", category: "Framework" },
];
