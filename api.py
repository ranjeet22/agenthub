import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.pipeline import run_agent_query, _clean_api_key

app = FastAPI(title="AgentHub Backend Service")

# Allow requests from Next.js (port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    agent_id: Optional[str] = None
    api_key: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None


class ValidateKeyRequest(BaseModel):
    api_key: str


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AgentHub Backend"}


@app.post("/api/validate-key")
def validate_key(req: ValidateKeyRequest):
    clean_key = _clean_api_key(req.api_key)
    if not clean_key:
        return {
            "valid": False,
            "status": "invalid_key",
            "message": "Please enter an API key.",
        }

    try:
        # Lightweight test request directly to Google Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={clean_key}"
        res = requests.get(url, timeout=8)

        if res.status_code == 200:
            return {
                "valid": True,
                "status": "valid",
                "clean_key": clean_key,
                "message": "API key verified and active.",
            }
        elif res.status_code == 429:
            return {
                "valid": False,
                "status": "quota_exceeded",
                "message": "Key is valid, but your Google AI Studio quota has been exceeded.",
            }
        elif res.status_code in (400, 403):
            return {
                "valid": False,
                "status": "invalid_key",
                "message": "Invalid API key. Please check your key from Google AI Studio.",
            }
        else:
            return {
                "valid": False,
                "status": "error",
                "message": f"Verification returned status {res.status_code}.",
            }
    except requests.exceptions.Timeout:
        return {
            "valid": False,
            "status": "timeout",
            "message": "Connection to Google Gemini servers timed out. Check your connection.",
        }
    except Exception as exc:
        return {
            "valid": False,
            "status": "error",
            "message": f"Validation error: {exc}",
        }


@app.post("/api/chat")
def chat(req: ChatRequest):
    result = run_agent_query(
        query=req.query,
        agent_id=req.agent_id,
        api_key=req.api_key,
        history=req.history,
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
