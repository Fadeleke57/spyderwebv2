#!/bin/bash

pip install -r requirements.txt
python3 -m uvicorn src.main:app --reload --workers 1 --host 0.0.0.0 --port 8000