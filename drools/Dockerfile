FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /workspace/drools

COPY drools/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY drools .
RUN mvn -q -DskipTests package dependency:copy-dependencies -DincludeScope=runtime

FROM eclipse-temurin:17-jre

WORKDIR /app/drools
RUN groupadd --system app && useradd --system --gid app --home-dir /app app

COPY --chown=app:app --from=builder /workspace/drools/target/classes ./target/classes
COPY --chown=app:app --from=builder /workspace/drools/target/dependency ./target/dependency
COPY --chown=app:app swi-prolog/knowledge_base_movies.csv /app/swi-prolog/knowledge_base_movies.csv
COPY --chown=app:app swi-prolog/knowledge_base_users.csv /app/swi-prolog/knowledge_base_users.csv

EXPOSE 8080

USER app

CMD ["java", "-cp", "target/classes:target/dependency/*", "meia.playgorithm.MovieRecommendationApi"]
