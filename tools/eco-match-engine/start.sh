#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pip3 install fastapi "uvicorn[standard]" pydantic pytest httpx -q

echo "🚀 Starting Eco-Match Engine on http://localhost:8000"
uvicorn main:app --reload --port 8000 --app-dir api
