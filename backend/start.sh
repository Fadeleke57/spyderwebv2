#!/bin/bash
set -euo pipefail

echo "🚀 Starting backend server..."

# ensure we're in the app directory
cd "$(dirname "$0")"

# log current directory contents for debugging
echo "📁 Contents of working directory:"
ls -la

# start FastAPI app with Uvicorn
exec uvicorn src.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --reload