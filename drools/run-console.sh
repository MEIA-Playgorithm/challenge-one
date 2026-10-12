#!/usr/bin/env sh
set -eu

if [ -n "${MAVEN_BIN:-}" ]; then
  MVN="$MAVEN_BIN"
elif command -v mvn >/dev/null 2>&1; then
  MVN="mvn"
elif [ -x "/Users/allen/Downloads/apache-maven-3.9.0/bin/mvn" ]; then
  MVN="/Users/allen/Downloads/apache-maven-3.9.0/bin/mvn"
else
  echo "Maven was not found. Set MAVEN_BIN to the Maven executable path." >&2
  exit 1
fi

M2_REPO="${M2_REPO:-$HOME/.m2/repository}"
if [ ! -d "$M2_REPO/org/drools" ] && [ -d "/tmp/playgorithm-m2" ]; then
  M2_REPO="/tmp/playgorithm-m2"
fi

"$MVN" -Dmaven.repo.local="$M2_REPO" -q test-compile

CP="target/classes"
for jar in $(find "$M2_REPO" -name '*.jar'); do
  case "$jar" in
    */org/slf4j/slf4j-api/1.*) continue ;;
  esac
  CP="$CP:$jar"
done

java -cp "$CP" meia.playgorithm.MovieRecommendationConsole
