#!/usr/bin/env sh
# Runs the Drools API (without Docker) at http://localhost:8080. Extra arguments go to the application:
# "./run.sh console" starts the console instead (see run-console.sh).
# Optional: PORT changes the port; MOVIES_CSV and USERS_CSV change where the CSV files come from;
# MAVEN_BIN is the path to Maven if it is not on the PATH.
set -eu
cd "$(dirname "$0")"

MVN="${MAVEN_BIN:-mvn}"
"$MVN" -q -DskipTests package dependency:copy-dependencies
# The classpath separator is ";" for the Java of Windows (Git Bash) and ":" elsewhere.
case "$(uname -s)" in MINGW* | MSYS* | CYGWIN*) SEP=";" ;; *) SEP=":" ;; esac
exec java -cp "target/classes${SEP}target/dependency/*" meia.playgorithm.Application "$@"
