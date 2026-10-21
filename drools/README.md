# Drools engine

The Drools version of the movie recommendation engine. It follows the same logic as the Prolog engine, using
forward chaining over a Drools knowledge base with exclusion rules, scoring rules, explanations and a
rule trace. It answers the same HTTP API as the Prolog engine.

---

## Run with Docker

Run every command in a terminal opened at the **repository root** (the folder that holds
`docker-compose.yml`).

### Step 1. Open Docker Desktop

Check that it is open and running.

### Step 2. Start the engine

```bash
docker compose up -d --build drools
```

This starts the Drools engine and the knowledge base, where the engine reads the CSV files. The first run
takes a few minutes because it builds the images.

### Step 3. Check that it works

Open [http://localhost:8082/api/health](http://localhost:8082/api/health). You should see
`{"status":"ok"}`. Swagger is at [http://localhost:8082/docs](http://localhost:8082/docs).

### Step 4. Change the data

1. Edit `knowledge_base/users.csv` (or `movies.csv`) and save.
2. Ask the engine to read the files again. These are `POST` requests, so they do not work in the browser.
   Pick the one that matches what you changed:

   | What you changed | Command |
   | --- | --- |
   | Both files | `curl -X POST http://localhost:8082/api/reload` |
   | Only `users.csv` | `curl -X POST http://localhost:8082/api/reload/users` |
   | Only `movies.csv` | `curl -X POST http://localhost:8082/api/reload/movies` |

   In PowerShell, write `curl.exe` instead of `curl`.

3. The answer has `"status":"ok"`, the scope and the counts of movies and users. If a CSV cannot be read (for
   example, it has no `id` column), the answer is `422` and the engine keeps the previous data. The engine does
   not check the other columns.

### Step 5. See the logs and stop

Follow the requests as they arrive (Ctrl+C to leave):

```bash
docker compose logs -f drools
```

Stop everything:

```bash
docker compose down
```

After you change the source code, go back to Step 2 to rebuild the image.

---

## Run manually

You need **JDK 17 or newer** and **Maven 3.9 or newer**. The commands run inside the `drools` folder.

### Step 1. Go to the folder

From the repository root:

```bash
cd drools
```

### Step 2. Choose where the CSV files come from

**Option A: the files in the repository.** Do nothing. The engine reads `../knowledge_base/movies.csv`
and `../knowledge_base/users.csv`.

**Option B: the knowledge base service** (port 8090). Start it with Docker from the repository root:

```bash
docker compose up -d knowledge-base
```

Then, in the terminal where you will run the engine, set the addresses.

Linux, macOS or Git Bash:

```bash
export MOVIES_CSV=http://localhost:8090/movies.csv
export USERS_CSV=http://localhost:8090/users.csv
```

PowerShell:

```powershell
$env:MOVIES_CSV = "http://localhost:8090/movies.csv"
$env:USERS_CSV = "http://localhost:8090/users.csv"
```

### Step 3. Start

Choose **one**.

**Option 1: the API** (at http://localhost:8080).

Linux, macOS or Git Bash:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Open [http://localhost:8080/api/health](http://localhost:8080/api/health). To use another port, set `PORT`
before you run the script.

**Option 2: the console**, an interactive shell (see "The console" below):

```bash
./run-console.sh
```

On Windows, run `run-console.bat`.

**Option 3: the tests**:

```bash
mvn test
```

The scripts build the project first (`mvn package`), so they need Maven on the `PATH`, or its location in
`MAVEN_BIN`.

---

## Endpoints

The API uses the same route names, query parameters, pagination and field names as the Prolog engine.
Errors always have the shape `{"error": "message"}`.

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/api/health` | Checks that the API is running |
| GET | `/api/filmes` | Lists movies, with `genre`, `pace`, `complexity`, `limit` and `offset` |
| GET | `/api/filme` | Returns one movie, by `id` |
| GET | `/api/recomendacoes` | Lists movies similar to a movie, with `id`, `min_score` and `limit` |
| GET | `/api/recomendacoes_utilizador` | Recommends movies to a user, with `user_id`, `limit` and `offset` |
| POST | `/api/reload` | Reads both CSV files again |
| POST | `/api/reload/users` | Reads only `users.csv` again |
| POST | `/api/reload/movies` | Reads only `movies.csv` again |
| GET | `/api/how` | Explains how a recommendation was reached, with `user_id` and `movie` |
| GET | `/api/why-not` | Explains why a movie was not recommended, with `user_id` and `movie` |
| GET | `/api/trace` | Returns the rule trace for `user_id`, optionally filtered by `movie` |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | OpenAPI specification, generated from the controllers |

The last three explanation endpoints exist only in the Drools engine.

Examples (port 8082 with Docker, 8080 when run manually):

```bash
curl 'http://localhost:8082/api/filmes?pace=fast&complexity=medium&limit=10'
curl 'http://localhost:8082/api/filme?id=tt0372784'
curl 'http://localhost:8082/api/recomendacoes?id=tt0372784&min_score=7&limit=5'
curl 'http://localhost:8082/api/recomendacoes_utilizador?user_id=ana&limit=10&offset=0'
curl 'http://localhost:8082/api/how?user_id=ana&movie=Batman%20Begins'
curl 'http://localhost:8082/api/why-not?user_id=ana&movie=Psycho'
```

---

## The console

The console loads `movies.csv` and `users.csv` (the same files as the API), runs the knowledge base for every
user straight away, then opens a small query shell over the inferred facts.

| Command | What it does |
| --- | --- |
| `users` | Lists the users of the knowledge base |
| `recommend ana` | Shows the recommendations of a user |
| `how ana Batman Begins` | The rules that produced a recommendation |
| `why-not ana Psycho` | The exclusion rules that left a movie out |
| `trace ana [movie]` | The rules that fired for a user, optionally for one movie |
| `facts` | The movie facts and the profile the movie rules inferred |
| `exit` | Leaves the console |

---

## Code map

Java packages under `src/main/java/meia/playgorithm`:

| Package or file | Role |
| --- | --- |
| `model/` | Facts. Input: `Movie` (the raw CSV row), `User`, `Likes`, `Dislikes`, `Prefers`, `Wishlist`, `Watched`, `UserLimit`, grouped per user in `UserProfile`. Reference knowledge: `GenreHint`, `PreferenceWeight`. Inferred: `MovieFeature`, `MovieClass`, `MovieRelation`, `SimilarityScore`, `PreferenceReason`, `ExclusionReason`, `MatchesPreferences`, `ExcludedMovie`. Results: `Recommendation` and `TraceEvent` |
| `engine/` | `RecommendationUnit` (the rule unit and its working memory), `DroolsRecommendationService` (runs the inference), `RuleFunctions` (helper functions the rules call), `KnowledgeTables` (loads the reference knowledge), `KnowledgeBaseResult` (every fact after the run), `RecommendationQueries` (reads the recommendations, scores and unmet preferences from the inferred facts) and `RecommendationResult` (one user's view) |
| `src/main/resources/meia/playgorithm/engine/` | The knowledge base: `movies.drl` (the profile of each movie and the relations between movies), `users.drl` (exclusion and preference reasons) and `queries.drl`. `knowledge/genre-hints.csv` and `knowledge/preference-weights.csv` hold the reference knowledge, so it can change without editing rules |
| `catalog/` | `MovieCatalog` and `UserCatalog` (Spring beans) keep the CSV data in memory (`reload()` reads it again). `CsvSource` reads a URL or a file and `CsvParser` splits a line |
| `api/controller/` | Thin controllers (`MovieController`, `UserRecommendationController`, `ExplanationController`, `ReloadController`, `HealthController`). They declare their routes with annotations, validate the parameters and call a service |
| `api/dto/` | The response records, one per response shape, with snake_case JSON |
| `api/` | `ApiErrors` turns every error into `{"error": "..."}`, `Validation` holds the parameter limits and `WebConfig` opens CORS |
| `service/` | `KnowledgeBaseService` runs the engine once over every movie and user and runs it again after a reload. `MovieService` (listing, filters, similar movies) and `RecommendationService` (recommendations and the how, why-not and trace explanations) read that result |
| `console/` | `MovieRecommendationConsole`, the interactive interface |
| `run.sh`, `run.bat`, `run-console.sh`, `run-console.bat` | Build and start the API or the console without Docker |
| `Application` | Entry point. It starts the API, and `Application console` starts the console |
| `src/test/java/.../engine/` | `MovieRecommendationTest` compares the recommendations and exclusions of every user with `expected-recommendations.csv` and `expected-exclusions.csv`, generated from the Prolog engine. `RuleFunctionsTest` and `RuleParityTest` check the helper functions and the rule files |

---

## Course material alignment

| Course topic | Where it is in the implementation |
| --- | --- |
| Expert-system architecture: knowledge base, working memory, inference engine, explanation module and interface | `movies.drl` and `users.drl` are the knowledge base. `RecommendationUnit` is the working memory. `DroolsRecommendationService` is the inference engine. The console and the API are the interfaces. `Recommendation`, `TraceEvent` and the how, why-not and trace explanations are the explanation module |
| Forward chaining | Drools fires rules from the inserted facts. The movies, the user facts and the reference knowledge go into `RecommendationUnit`, then `instance.fire()` derives the movie profile, the relations between movies, and the exclusion and preference reasons. The recommendations are read from those reasons afterwards, so an exclusion always wins |
| Conflict resolution and rule priority | No rule needs `salience`: every rule only adds facts, and the recommendation is read once the rules have stopped, so the order in which they fire does not change the result |
| Knowledge separated from control | The recommendation knowledge is declarative in `movies.drl` and `users.drl`, and the weights and genre hints are data. The Java classes only hold facts and run the engine |
| Knowledge acquisition from an expert interview | The rules encode the interview: mandatory limits discard movies, flexible preferences change the score, rejected genres, directors and actors exclude, and recommendations list the satisfied and unmet preferences |
| Drools working memory and rule execution | `RecommendationUnit` holds one `DataStore` per kind of fact: input, reference knowledge and inferred facts. The rules combine them to create new facts |
| Drools monitoring and queries | `queries.drl` reads each kind of inferred fact. Each inferred fact keeps the name of the rule that created it, which the trace shows |
| Explanation types: how, why and why not | `how` and `GET /api/how` explain how a recommendation was produced. `why-not` and `GET /api/why-not` explain why it was not. `trace` and `GET /api/trace` show the rules that fired. `facts` shows the known facts |
| Truth maintenance | The implementation stores explicit trace facts. A future version could use `insertLogical` for conclusions that should disappear when their supporting facts stop being true |
| Fuzzy reasoning | The scoring is weighted and deterministic. Fuzzy logic would suit vague ideas such as "short movie", "recent movie" or "close to the minimum rating" |
| Bayesian reasoning | Not implemented, because the project has no reliable prior or conditional probabilities |
| Ontologies and knowledge reuse | The model uses Java facts and Drools rules. An ontology could formalise genre, subgenre, actor, director, audience and platform availability |
