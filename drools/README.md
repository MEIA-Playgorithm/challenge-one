# Drools recommendation engine

This module contains the Drools version of the movie recommendation engine.
It mirrors the Prolog recommendation logic with a forward-chaining Drools
knowledge base, explicit eligibility rules, scoring rules, explanation data, and
traceable rule execution.

## Run the automated tests

From this folder:

```bash
mvn test
```

## Try the interactive console

The console asks for the candidate profile, runs the Drools knowledge base, then
opens a small query shell over the inferred facts and trace events. It loads the
same `swi-prolog/knowledge_base_movies.csv` catalogue used by the Prolog module,
so the Drools demo can query the same 100 movie facts.

From this folder:

```bash
./run-console.sh
```

Example answers to see a recommendation quickly:

```text
Candidate age: 25
Minimum IMDb rating: 8
Is the rating mandatory?: n
Allowed rating tolerance: 0.5
Liked genres: Action
Mandatory genres:
Liked languages: English
Preferred directors: Christopher Nolan
Preferred actors:
Preferred themes: justice
```

Mandatory fields, such as mandatory genres, directors, actors, required
languages, and mandatory rating, discard movies when they do not match. Flexible
preferences increase the score and appear in the explanation.

After the recommendation run, use these commands:

```text
recommend
how Batman Begins
why-not Inception
trace
facts
exit
```

`how` corresponds to a "How?" explanation: it shows the inference path that
produced a recommendation. `why-not` corresponds to a "Why not?" explanation:
it shows the mandatory rules or rejection rules that prevented a movie from
becoming a recommendation. A strict "Why?" explanation is normally used when an
expert system explains why it is asking the user for a fact; this console asks
all candidate facts upfront, so the useful runtime explanations are `how`,
`why-not`, `trace`, and `facts`.

## Run the REST API

The REST API exposes the same Drools recommendation engine through HTTP. It also
loads the same Prolog CSV catalogue used by the console.

From this folder:

```bash
./run-api.sh
```

## Run the REST API with Docker

This follows the same module-level Docker pattern used by the Prolog and
frontend modules. The compose file builds from the repository root because the
Drools API needs the shared Prolog CSV catalogues at runtime.

From this folder:

```bash
docker compose up --build -d
```

Open the API at [http://localhost:8082/api/health](http://localhost:8082/api/health)
or Swagger at [http://localhost:8082/docs](http://localhost:8082/docs).

To use another host port:

```bash
PORT=8083 docker compose up --build -d
```

To stop it:

```bash
docker compose down
```

The main contract follows the existing SWI-Prolog API, so clients can use the
same `/api/...` route names, query parameters, pagination envelope, and movie
field names.

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Checks that the API is running. |
| `/api/filmes` | `GET` | Lists movie facts with `genre`, `pace`, `complexity`, `limit`, and `offset`. |
| `/api/filme` | `GET` | Reads one movie by `id`. |
| `/api/recomendacoes` | `GET` | Lists similar movies for a source movie using `id`, `min_score`, and `limit`. |
| `/api/recomendacoes_utilizador` | `GET` | Runs the Drools recommendation engine for a CSV user profile using `user_id`, `limit`, and `offset`. |
| `/api/how` | `GET` | Explains how a recommendation conclusion was inferred for `user_id` and `movie`. |
| `/api/why-not` | `GET` | Explains why a movie was not recommended for `user_id` and `movie`. |
| `/api/why_not` | `GET` | Alias for `/api/why-not`. |
| `/api/trace` | `GET` | Returns rule trace events for `user_id`, optionally filtered by `movie`. |
| `/openapi.json` | `GET` | Serves the OpenAPI specification. |
| `/docs` | `GET` | Opens Swagger UI for trying the API in the browser. |

Example request:

```bash
curl 'http://localhost:8080/api/filmes?pace=fast&complexity=medium&limit=10'
curl 'http://localhost:8080/api/filme?id=tt0372784'
curl 'http://localhost:8080/api/recomendacoes?id=tt0372784&min_score=7&limit=5'
curl 'http://localhost:8080/api/recomendacoes_utilizador?user_id=ana&limit=10&offset=0'
```

Example explanation request:

```bash
curl 'http://localhost:8080/api/how?user_id=ana&movie=Batman%20Begins'
curl 'http://localhost:8080/api/why-not?user_id=ana&movie=Psycho'
```

The earlier JSON `POST` routes remain available as debugging aliases, but the
Prolog-compatible `GET /api/...` routes are the preferred integration surface.

## Course-material alignment

| Course topic / PDF | Implementation evidence |
| --- | --- |
| Expert-system architecture: knowledge base, working memory, inference engine, explanation module, and interface (`04-ArquitSP.pdf`) | `rules.drl` is the knowledge base; `MovieRecommendationUnit` exposes Drools working-memory data stores; `DroolsRecommendationService` runs the inference engine; `MovieRecommendationConsole` and `MovieRecommendationApi` are interfaces; `Recommendation`, `TraceEvent`, `how`, `why-not`, `trace`, and `facts` form the explanation module. |
| Forward chaining / data-driven inference (`05-EstratRac.pdf`) | Drools fires rules from inserted facts: user preferences and movie facts are inserted into `MovieRecommendationUnit`, then `instance.fire()` derives exclusions, preference reasons, recommendations, and trace events. |
| Conflict resolution and rule priority (`05-EstratRac.pdf`) | `rules.drl` uses `salience`: exclusion rules run first, preference rules run next, and the recommendation creation rule runs last. This keeps mandatory constraints ahead of scoring. |
| Separation between knowledge and control (`01-IntrodSBC_and_SP.pdf`, `03-ReprCon.pdf`) | Recommendation knowledge is declarative in `rules.drl`; Java classes hold facts and execution plumbing. Domain knowledge is not hard-coded inside the console. |
| Expert interview knowledge acquisition (`02-IntrodSP.pdf`, `Entrevista_Joao_Mota_Revista.pdf`) | The rules encode the expert decisions captured from the interview: mandatory limits discard movies; flexible preferences affect score; rejected genres/directors/actors exclude; recommendations expose satisfied and unmet preferences. |
| Drools working memory and rule execution (`Drools-HelloWorld.pdf`) | `MovieRecommendationUnit` contains `DataStore<Movie>`, `DataStore<UserPreferences>`, `DataStore<Recommendation>`, and `DataStore<TraceEvent>`. Rules combine working-memory facts with the knowledge base to create new facts. |
| Drools monitoring and queries (`Monitorização Drools.pdf`) | `rules.drl` defines `FindRecommendations` and `FindTraceEvents` queries. `TraceEvent` records rule firings for exclusions, preference matches, and recommendation creation. |
| Explanation types: How, Why, Why not (`04-ArquitSP.pdf`, `05-EstratRac.pdf`, `WhyNot.pdf`) | `how <movie>` and `POST /how` explain how a recommendation was produced; `why-not <movie>` and `POST /why-not` explain why it was not produced; `trace` and `POST /trace` show the fired-rule path; `facts` and `GET /facts` expose the known facts. |
| Truth Maintenance Systems (`12-SP-TMS.pdf`) | The current implementation stores explicit trace facts. A future improvement can use Drools `insertLogical` for conclusions that should be automatically retracted when their supporting facts stop being true. |
| Fuzzy reasoning (`07-SP-Fuzzy.pdf`) | Current scoring is weighted and deterministic. Fuzzy logic is a suitable future extension for vague concepts such as "short movie", "recent movie", "close to minimum rating", and "high popularity". |
| Bayesian reasoning (`09-SP-Bayes.pdf`) | Bayesian reasoning is not implemented because the current project has no reliable prior and conditional probabilities. It should only be added if the catalogue/user data supports probabilistic evidence. |
| Ontologies and knowledge reuse (`13-Ontologies_en.pdf`, `14-KnowledgeManagement_en.pdf`) | The current model uses Java facts and Drools rules. A future ontology layer could formalize concepts such as genre, subgenre, actor, director, audience, and platform availability for reuse and interoperability. |

## Code map

| File | Role |
| --- | --- |
| `src/main/resources/meia/playgorithm/rules.drl` | Drools knowledge base: exclusions, scoring reasons, recommendation creation, and queries. |
| `src/main/java/meia/playgorithm/MovieRecommendationUnit.java` | RuleUnit working memory: movies, preferences, recommendations, and trace events. |
| `src/main/java/meia/playgorithm/DroolsRecommendationService.java` | Executes the Drools inference engine and returns inferred results. |
| `src/main/java/meia/playgorithm/MovieRecommendationConsole.java` | Interactive interface for asking the knowledge base for recommendations and explanations. |
| `src/main/java/meia/playgorithm/MovieRecommendationApi.java` | REST interface with recommendations, fact inspection, health check, OpenAPI, Swagger UI, and explanation routes. |
| `src/main/java/meia/playgorithm/SampleMovieCatalog.java` | Loads the Prolog movie CSV into Drools movie facts. |
| `src/main/java/meia/playgorithm/TraceEvent.java` | Observable explanation fact emitted by rules. |
| `src/main/java/meia/playgorithm/Recommendation.java` | Final recommendation fact with score, status, reasons, unmet preferences, and score breakdown. |
| `src/test/java/meia/playgorithm/MovieRecommendationTest.java` | Automated validation of exclusions, alternatives, scoring, compatibility, and trace events. |
