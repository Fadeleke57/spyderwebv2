#!/bin/bash

cd "$(dirname "$0")"
source env/bin/activate
pip3 install -r requirements.txt
python3 -m uvicorn src.main:app --reload --workers 1 --host 0.0.0.0 --port 8000