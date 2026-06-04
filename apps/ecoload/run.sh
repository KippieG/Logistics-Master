#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     ECS EcoLoad & Temp Optimizer — Dev Startup       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check dependencies
command -v dotnet >/dev/null 2>&1 || { echo "❌  dotnet CLI niet gevonden. Installeer .NET 10 SDK."; exit 1; }
command -v node   >/dev/null 2>&1 || { echo "❌  Node.js niet gevonden. Installeer Node 20+."; exit 1; }
command -v npm    >/dev/null 2>&1 || { echo "❌  npm niet gevonden."; exit 1; }

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Install frontend deps if needed
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "📦  npm install (frontend)..."
  cd "$ROOT/frontend" && npm install --silent
fi

# Run tests
echo "🧪  Unit tests draaien..."
cd "$ROOT/backend"
dotnet test --nologo --verbosity quiet 2>&1 | tail -5
echo ""

# Start backend
echo "🚀  Backend starten op http://localhost:5000 ..."
cd "$ROOT/backend/src/ECS.EcoLoad.API"
dotnet run --no-build &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "🌐  Frontend starten op http://localhost:4200 ..."
cd "$ROOT/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "✅  Beide services draaien:"
echo "   Dashboard : http://localhost:4200"
echo "   API       : http://localhost:5000"
echo "   Swagger   : http://localhost:5000/swagger"
echo ""
echo "   Druk Ctrl+C om alles te stoppen."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Gestopt.'" INT TERM
wait $BACKEND_PID $FRONTEND_PID
