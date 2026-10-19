#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if [ -n "${MAVEN_BIN:-}" ]; then
  MVN="$MAVEN_BIN"
elif command -v mvn >/dev/null 2>&1; then
  MVN="mvn"
else
  echo "Maven was not found. Set MAVEN_BIN to the Maven executable path." >&2
  exit 1
fi

# Maven writes the runtime dependencies of pom.xml (no test jars) to classpath.txt.
# "< /dev/null" keeps Maven from consuming the console input.
"$MVN" -q compile dependency:build-classpath -DincludeScope=runtime -Dmdep.outputFile=target/classpath.txt < /dev/null

# Java on Windows (Git Bash) separates classpath entries with ";".
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) SEP=";" ;;
  *) SEP=":" ;;
esac

java -Dstdout.encoding=UTF-8 -Dstdin.encoding=UTF-8 -cp "target/classes$SEP$(cat target/classpath.txt)" meia.playgorithm.MovieRecommendationConsole
