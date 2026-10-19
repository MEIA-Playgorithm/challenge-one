#!/usr/bin/env sh
# Runs the frontend in development mode (without Docker) at http://localhost:5173.
set -eu
cd "$(dirname "$0")"

[ -d node_modules ] || npm ci
npm run dev
