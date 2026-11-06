import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawKey = body?.api_key || "";

    // 1. Sanitize quotes and whitespace
    let cleanKey = String(rawKey).trim();
    if (
      (cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
      (cleanKey.startsWith("'") && cleanKey.endsWith("'"))
    ) {
      cleanKey = cleanKey.slice(1, -1).trim();
    }

    if (!cleanKey) {
      return NextResponse.json({
        valid: false,
        status: "invalid_key",
        message: "Please enter a valid API key.",
      });
    }

    // 2. Test request to Google Gemini API
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const response = await fetch(testUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      return NextResponse.json({
        valid: true,
        status: "valid",
        clean_key: cleanKey,
        message: "API key verified and active.",
      });
    } else if (response.status === 429) {
      return NextResponse.json({
        valid: false,
        status: "quota_exceeded",
        clean_key: cleanKey,
        message:
          "Key is valid, but your Google AI Studio quota has been exceeded.",
      });
    } else if (response.status === 400 || response.status === 403) {
      return NextResponse.json({
        valid: false,
        status: "invalid_key",
        message: "Invalid API key. Please check your key from Google AI Studio.",
      });
    } else {
      return NextResponse.json({
        valid: false,
        status: "error",
        message: `Verification returned status ${response.status}.`,
      });
    }
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return NextResponse.json({
        valid: false,
        status: "timeout",
        message: "Connection to Google Gemini servers timed out.",
      });
    }
    return NextResponse.json({
      valid: false,
      status: "error",
      message: "Network error while validating key.",
    });
  }
}
