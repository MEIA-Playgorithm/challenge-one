#!/usr/bin/env sh
# Runs the Prolog API (without Docker) at http://localhost:8080.
# Optional: PORT changes the port; MOVIES_CSV and USERS_CSV change where the CSV files come from.
set -eu
cd "$(dirname "$0")"

exec swipl -q -s api/server.pl -g "server:start(${PORT:-8080}), thread_get_message(stop)"
