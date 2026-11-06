import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Sanitize the api_key if present
    if (body.api_key) {
      let k = String(body.api_key).trim();
      if (
        (k.startsWith('"') && k.endsWith('"')) ||
        (k.startsWith("'") && k.endsWith("'"))
      ) {
        k = k.slice(1, -1).trim();
      }
      body.api_key = k;
    }

    // Call FastAPI backend (configurable via BACKEND_URL, default 127.0.0.1:8000)
    const backendBase = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const backendUrl = `${backendBase.replace(/\/+$/, "")}/api/chat`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // Agents with external tool calls can take a few seconds
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error_type: "backend_error",
        answer: "The agent backend returned an error. Please try again.",
        evidence: [],
        tool_calls: [],
        follow_ups: [],
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return NextResponse.json({
        ok: false,
        error_type: "timeout",
        answer: "The request timed out while waiting for external archive tools. Please retry.",
        evidence: [],
        tool_calls: [],
        follow_ups: [],
      });
    }

    return NextResponse.json({
      ok: false,
      error_type: "connection_error",
      answer: "AgentHub backend service is initializing. Please verify that the Python backend is running on port 8000.",
      evidence: [],
      tool_calls: [],
      follow_ups: [],
    });
  }
}
