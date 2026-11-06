export interface EvidenceMock {
  title: string;
  authors: string;
  source: string;
  domain: string;
  url: string;
  metadata: string;
}

export type AgentId = "orby" | "biblio" | "cosmo" | "atlas" | "breeze" | "palette";

export interface Agent {
  id: AgentId;
  name: string;
  domain: string;
  behavior: string;
  tools: string[];
  exampleQuery: string;
  examplePrompts: string[];
  accent: string;
  accentTint: string;
  avatar: string;
  alt: string;
  evidenceVariant: "paper" | "book" | "image" | "entity" | "measurement" | "artwork";
  evidence: EvidenceMock;
  tracePreview: {
    tool: string;
    duration: string;
    resultCount: number;
    args: Record<string, any>;
  };
}

export const AGENTS: Agent[] = [
  {
    id: "orby",
    name: "Orby",
    domain: "Academic Research",
    behavior: "Discovers academic research papers and provides evidence-based summaries from multiple scholarly sources.",
    tools: ["OpenAlex API", "arXiv API"],
    exampleQuery: "Find recent research papers on carbon capture optimization.",
    examplePrompts: [
      "Find recent research papers on carbon capture optimization.",
      "Summarize key findings in quantum error correction literature.",
      "Search arXiv for transformer attention pruning methods.",
    ],
    accent: "#2F6BFF",
    accentTint: "#EAF0FF",
    avatar: "/assets/avatars/avatar_orby.png",
    alt: "Orby, the academic research agent mascot",
    evidenceVariant: "paper",
    evidence: {
      title: "Direct Air Capture with Solid Sorbents: A Comprehensive Review",
      authors: "Chen, L., Wang, Y., & Martinez, R. (2024)",
      source: "arXiv:2403.11982 [cond-mat.mtrl-sci]",
      domain: "arxiv.org",
      url: "https://arxiv.org/abs/2403.11982",
      metadata: "Cited by 142 · Open Access · Peer-reviewed preprint",
    },
    tracePreview: {
      tool: "search_arxiv_and_openalex",
      duration: "340ms",
      resultCount: 8,
      args: { query: "carbon capture optimization", min_citations: 20 },
    },
  },
  {
    id: "biblio",
    name: "Biblio",
    domain: "Books and Reading",
    behavior: "Helps readers explore books, including authors, publication details, editions, and other available information.",
    tools: ["Open Library Search API"],
    exampleQuery: "Recommend beginner-friendly books on machine learning.",
    examplePrompts: [
      "Recommend beginner-friendly books on machine learning.",
      "Who wrote 'The Left Hand of Darkness' and what are its editions?",
      "Find classic sci-fi novels exploring time dilation.",
    ],
    accent: "#FF7A3D",
    accentTint: "#FFF0E8",
    avatar: "/assets/avatars/avatar_biblio.png",
    alt: "Biblio, the books and literature agent mascot",
    evidenceVariant: "book",
    evidence: {
      title: "Pattern Recognition and Machine Learning",
      authors: "Christopher M. Bishop",
      source: "Open Library Work OL2275685W",
      domain: "openlibrary.org",
      url: "https://openlibrary.org/works/OL2275685W",
      metadata: "Springer (2006) · 738 pages · ISBN 9780387310732",
    },
    tracePreview: {
      tool: "open_library_search",
      duration: "210ms",
      resultCount: 5,
      args: { subject: "machine_learning", level: "beginner" },
    },
  },
  {
    id: "cosmo",
    name: "Cosmo",
    domain: "Space Exploration",
    behavior: "Answers space-related queries and fetches relevant space images directly from NASA's database.",
    tools: ["NASA Image and Video Library API"],
    exampleQuery: "Show me images of the James Webb Space Telescope.",
    examplePrompts: [
      "Show me images of the James Webb Space Telescope.",
      "Fetch high-resolution pictures of Jupiter's Great Red Spot.",
      "What are the latest visual observations of the Pillars of Creation?",
    ],
    accent: "#6D4AFF",
    accentTint: "#F0ECFF",
    avatar: "/assets/avatars/avatar_cosmo.png",
    alt: "Cosmo, the space exploration agent mascot",
    evidenceVariant: "image",
    evidence: {
      title: "Webb's First Deep Field (SMACS 0723)",
      authors: "NASA, ESA, CSA, STScI",
      source: "NASA Image ID: GSFC_20171208_archive_e001435",
      domain: "images.nasa.gov",
      url: "https://images.nasa.gov/details/GSFC_20171208_archive_e001435",
      metadata: "NIRCam composite · July 12, 2022 · 4537 × 4630 px",
    },
    tracePreview: {
      tool: "nasa_image_library_search",
      duration: "410ms",
      resultCount: 12,
      args: { q: "James Webb Space Telescope deep field", media_type: "image" },
    },
  },
  {
    id: "atlas",
    name: "Atlas",
    domain: "Knowledge and Entities",
    behavior: "Looks up people, places, organizations, and concepts, returning relevant entity information and source links.",
    tools: ["Wikidata API"],
    exampleQuery: "Find information about the European Space Agency.",
    examplePrompts: [
      "Find information about the European Space Agency.",
      "Look up the history and coordinates of the Large Hadron Collider.",
      "What are the key entities connected to Alan Turing on Wikidata?",
    ],
    accent: "#1FB5F0",
    accentTint: "#E6F7FE",
    avatar: "/assets/avatars/avatar_atlas.png",
    alt: "Atlas, the knowledge and entities agent mascot",
    evidenceVariant: "entity",
    evidence: {
      title: "European Space Agency (Q4226)",
      authors: "Wikidata Entity Statement",
      source: "Wikidata Entity Q4226",
      domain: "wikidata.org",
      url: "https://www.wikidata.org/wiki/Q4226",
      metadata: "HQ: Paris, France · Founded: 30 May 1975 · 22 Member States",
    },
    tracePreview: {
      tool: "wikidata_entity_lookup",
      duration: "180ms",
      resultCount: 1,
      args: { entity: "European Space Agency", language: "en" },
    },
  },
  {
    id: "breeze",
    name: "Breeze",
    domain: "Air Quality",
    behavior: "Retrieves recent air-quality measurements from nearby monitoring stations and reports pollutant levels with units and timestamps.",
    tools: ["OpenAQ API", "OpenStreetMap Nominatim API"],
    exampleQuery: "Show recent air-quality measurements in Delhi.",
    examplePrompts: [
      "Show recent air-quality measurements in Delhi.",
      "Check PM2.5 and PM10 particulate levels in London stations.",
      "Retrieve pollutant concentrations from monitoring sensors near Tokyo.",
    ],
    accent: "#3FCB6B",
    accentTint: "#E8F9EE",
    avatar: "/assets/avatars/avatar_breeze.png",
    alt: "Breeze, the environmental air quality agent mascot",
    evidenceVariant: "measurement",
    evidence: {
      title: "Station: Anand Vihar, Delhi (DPCC)",
      authors: "OpenAQ Monitoring Feed",
      source: "Sensor ID: 8114 · Lat: 28.6508, Lon: 77.3152",
      domain: "openaq.org",
      url: "https://openaq.org",
      metadata: "PM2.5: 84.2 µg/m³ · PM10: 168.0 µg/m³ · Timestamp: 14m ago",
    },
    tracePreview: {
      tool: "openaq_latest_measurements",
      duration: "290ms",
      resultCount: 6,
      args: { city: "Delhi", coordinates: [28.6508, 77.3152], radius: 10000 },
    },
  },
  {
    id: "palette",
    name: "Palette",
    domain: "Art and Culture",
    behavior: "Discovers artworks and artists from The Met's collection, providing artwork details, images, and museum source links.",
    tools: ["The Metropolitan Museum of Art Collection API"],
    exampleQuery: "Show me paintings by Vincent van Gogh in The Met collection.",
    examplePrompts: [
      "Show me paintings by Vincent van Gogh in The Met collection.",
      "Find Renaissance oil paintings on wood in The Met collection.",
      "Explore sculptures from ancient Egyptian art in the museum archives.",
    ],
    accent: "#C23DE0",
    accentTint: "#F9EAFD",
    avatar: "/assets/avatars/avatar_palette.png",
    alt: "Palette, the art and culture agent mascot",
    evidenceVariant: "artwork",
    evidence: {
      title: "Wheat Field with Cypresses (1889)",
      authors: "Vincent van Gogh (Dutch, 1853–1890)",
      source: "The Met Object ID: 436535",
      domain: "metmuseum.org",
      url: "https://www.metmuseum.org/art/collection/search/436535",
      metadata: "Oil on canvas · 73.2 × 93.4 cm · Gallery 822",
    },
    tracePreview: {
      tool: "met_museum_search_objects",
      duration: "320ms",
      resultCount: 9,
      args: { artistOrCulture: "Vincent van Gogh", hasImages: true },
    },
  },
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((agent) => agent.id === id);
}
