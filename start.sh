#!/bin/bash
set -e

# Start bot in background
cd /app/bot && python main.py &

# Start API in foreground
cd /app/api && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
