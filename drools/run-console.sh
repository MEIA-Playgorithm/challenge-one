#!/usr/bin/env sh
# Runs the Drools console (without Docker).
set -eu
exec "$(dirname "$0")/run.sh" console
