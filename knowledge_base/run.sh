#!/usr/bin/env sh
# Runs the knowledge base (without Docker) at http://localhost:8090.
# Optional: PORT changes the port, DATA_DIR changes the folder that holds the CSV files.
set -eu
cd "$(dirname "$0")"

# python3 can be a stub (for example on Windows), so try to run it before choosing it.
if python3 -c "" >/dev/null 2>&1; then PYTHON=python3; else PYTHON=python; fi

"$PYTHON" -m pip install -q -r requirements.txt
DATA_DIR="${DATA_DIR:-$(pwd)}" PORT="${PORT:-8090}" exec "$PYTHON" server.py
