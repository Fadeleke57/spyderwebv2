#!/bin/bash

cd "$(dirname "$0")"
pip install -r requirements.txt --break-system-packages
python3 -m uvicorn src.main:app --reload --workers 1 --host 0.0.0.0 --port 8000