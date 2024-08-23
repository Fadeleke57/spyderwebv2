#!/bin/bash

echo "Using Python: $(which python3)"
echo "Python version: $(python3 --version)"
echo "Pip packages:"
pip show fastapi_login

cd "$(dirname "$0")"
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn src.main:app --reload --workers 1 --host 0.0.0.0 --port 8000