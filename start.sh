#!/usr/bin/env bash
set -e

echo "Starting AgentHub FastAPI Backend on port 8000..."
uvicorn api:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Next.js Frontend on port ${PORT:-3000}..."
npm run start &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait -n
