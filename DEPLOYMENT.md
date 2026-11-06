# AgentHub - Multi-Agent AI Workspace

A multi-agent AI assistant platform where 6 specialized domain agents retrieve live sources, verify citations, and display rich interactive evidence.

## Architecture

- **Frontend & API Gateway:** Next.js 14 (App Router, Tailwind CSS, TypeScript)
- **Backend & Specialist Agents:** FastAPI + LangChain + LangGraph
- **Domain Tools:**
  - **Cosmo:** NASA Image & Video Library (Interactive multi-photo gallery & zoom)
  - **Biblio:** Open Library (Book jackets, ISBNs, publishers, publication dates)
  - **Palette:** The Metropolitan Museum of Art (Artworks, medium, department)
  - **Orby:** OpenAlex & arXiv (Scholarly papers, preprints, DOI/PDF links)
  - **Breeze:** Open-Meteo & Copernicus (Real-time AQI, PM2.5, PM10, NO2, SO2, CO, Ozone)
  - **Atlas:** Wikidata Knowledge Graph (Entities, claims, descriptions)

---

## Deploying to Render

You can deploy AgentHub to Render using **Blueprint (Infrastructure as Code)** or as **Two Web Services**.

### Option A: 1-Click Blueprint (Recommended)

1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Select your `agenthub` repository.
4. Render will read `render.yaml` and automatically configure both:
   - `agenthub-api` (Python FastAPI service)
   - `agenthub-ui` (Node.js Next.js service linked to `agenthub-api`)
5. Click **Apply**.

---

### Option B: Deploy Manually as Two Web Services

#### Service 1: Python Backend (`agenthub-api`)
- **Environment:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
- **Plan:** Free
- Note the generated internal/external URL (e.g. `https://agenthub-api.onrender.com`).

#### Service 2: Next.js Frontend (`agenthub-ui`)
- **Environment:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Plan:** Free
- **Environment Variable:**
  - `BACKEND_URL`: `https://agenthub-api.onrender.com` (your backend service URL)

---

## Local Development

### 1. Python Backend
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Next.js Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
