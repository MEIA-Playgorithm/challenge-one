# Drools recommendation engine

A movie recommendation expert system built with Drools 10 rule units. It reads
the movie and user catalogs (`knowledge_base_movies.csv` and
`knowledge_base_users.csv`), infers a profile for every movie, works out why
each movie suits or does not suit each user, and explains its conclusions. An
optional dialogue asks the user what they feel like watching.

The knowledge base is split into three rule files:

| File | What the rules infer |
| --- | --- |
| `movies.drl` | What is known about each movie: content profile (pace, complexity, violence, humour, psychological intensity, emotional tone, themes, subgenres), audience, era, decade, popularity, and relations between movies (same genre, same director, ..., similarity score). |
| `users.drl` | For every user and movie: exclusion reasons (watched, disliked genre or language, age, explicit limits) and preference reasons with their weight (liked genre, wishlist, preferred director, pace, ...). |
| `dialogue/dialogue.drl` | The experience dialogue: questions to ask and the suggestions that follow from the answers. |

## Design

- **Rules only in DRL.** Java loads the data, runs the engine, and reads and
  explains the inferred facts; it makes no decisions.
- **Reference knowledge as facts.** The genre hints (which genres suggest each
  content level, tag and subgenre) and the weight of each kind of preference
  are data files in `knowledge/`, inserted as `GenreHint` and
  `PreferenceWeight` facts. One generic rule matches those facts instead of one
  rule per attribute, e.g. "Preferred inferred movie feature" handles every
  inferred movie attribute.
- **Immutable input facts.** The CSV data are records in
  `meia.playgorithm.facts`; rules never change them. Each inference is a new
  fact that records the rule that inserted it, which is what the explanations
  and the trace show.
- **Typed facts.** Attributes, categories, exclusions and limits are enums,
  not strings.
- **Helper functions in Java**, imported with `import function` from
  `RuleFunctions`. They only compute values (shared values, similarity, age
  policy); every decision is made in a rule.
- **No salience.** The conclusions are monotonic and recommendations are read
  only after every rule fired, so an exclusion always wins over a preference.
- **Recommendations are queries, not rules.** `RecommendationQueries` reads
  the exclusion and preference reasons and computes the score, status
  (main or alternative) and ranking of every movie that was not excluded.

## Run the automated tests

From this folder:

```bash
mvn test
```

## Try the interactive console

On start, the console loads both catalogs and runs the recommendation
knowledge base for every user straight away. Recommendations and explanations
can then be queried for any user.

The experience dialogue is optional and is never offered automatically. It only
starts with `dialogue-start <user>`. Running it again for another user starts a
fresh dialogue session.

From this folder:

```bash
./run-console.sh
```

On Windows (Command Prompt or PowerShell):

```bat
run-console.bat
```

Commands:

```text
users
recommend ines
how ana Batman Begins
why-not ana Psycho
trace ana
facts
dialogue-start ana
dialogue
dialogue-how sugerir_genero Comedy
dialogue-why-not sugerir_genero Adventure
exit
```

Explicit limits in each profile, such as required languages or a minimum
rating, exclude movies. Preferences add reasons and score. Every movie without
an exclusion reason is a recommendation.

`how` is a "How?" explanation: the preference reasons, the score and the rules
that inferred each reason. `why-not` is a "Why not?" explanation: the exclusion
reasons and the rules that inferred them.

## Experience dialogue and "Why?" explanations

`dialogue-start <user>` runs the experience dialogue:

| Choice | Initial suggestion | Follow-up question and result of `sim` |
| --- | --- | --- |
| `emocao` | Emotional branch | Emotional story → `perfil_sessao = emocional`; real-life themes → `Drama`; sad ending → `sugerir_tom = triste`. |
| `comedia` | `Comedy` | Romantic humour → `Romantic Comedy`. |
| `acao` | `Action` | Adventure → `Adventure`. |
| `misterio` | `Mystery` | Suspense → `Thriller`. |
| `terror` | `Horror` | Supernatural → `preferencia_sessao = sobrenatural`. |
| `ficcao_cientifica` | `SciFi` | Technological society → `Cyberpunk`. |
| `fantasia` | `Fantasy` | Quest or journey → `Quest`. |

The rules run in their own rule unit (`DialogueUnit`). A rule that needs an
answer from the user has an "Ask" rule: when the earlier conditions hold and
the answer is missing, it inserts a `DialogueQuestion`. `DialogueService` asks
the pending question, inserts the `DialogueAnswer`, and fires the rules again.

The explanations are written in Drools terms: rules of `dialogue.drl`, their
`when` conditions, and the objects in working memory. `DialogueRule` reads
every rule straight from `dialogue.drl` with the Drools DRL parser, so the
explanations use the real `when` patterns and the conclusion the `then`
inserts; nothing is written twice:

```text
rule "dialogo_comedia_2"
when
    $premise : /conclusions[ type == "experiencia_sessao", value == "comedia" ]
    /answers[ key == "prefere_romance_com_humor", affirmative ]
    ...
```

The explanations can therefore also inspect rules that never fired:

| Explanation | Command | What it shows |
| --- | --- | --- |
| Why? | Answer `porque` to a question | The rule being evaluated, which `when` conditions already match working memory, the answer that is missing, and the object the rule inserts. |
| How? | `dialogue-how <#N or fact>` | The rule that inserted the object and, recursively, the objects that matched its conditions. |
| Why not? | `dialogue-why-not <fact>` | Every rule that could insert the object and its first unmet condition, explained recursively down to the user's answers. |
| Working memory | `dialogue` | The numbered objects, in insertion order. |

Facts are written as a conclusion type and value, or as a question key and
answer (the answer defaults to `sim`):

```text
dialogue
dialogue-how 4
dialogue-how sugerir_genero Comedy
dialogue-why-not sugerir_genero Romantic Comedy
dialogue-why-not procura_aventura
```

Example of a "why not?" explanation:

```text
DialogueConclusion(type == "sugerir_genero", value == "Adventure") não está na memória de trabalho.
A regra "dialogo_acao_2" podia inseri-lo, mas a condição DialogueConclusion(type == "experiencia_sessao", value == "acao") não foi satisfeita:
   DialogueConclusion(type == "experiencia_sessao", value == "acao") não está na memória de trabalho.
   A regra "dialogo_experiencia" podia inseri-lo, mas a condição DialogueAnswer(key == "experiencia", value == "acao") não foi satisfeita:
      DialogueAnswer(key == "experiencia", value == "acao") não está na memória de trabalho.
      Nenhuma regra o insere: depende da resposta do utilizador, que foi "comedia" (DialogueAnswer(key == "experiencia", value == "comedia")).
```

A `nao` answer stays in working memory as a `DialogueAnswer`, so "why not?"
can say which answer stopped a rule.

The dialogue suggestions do not change the recommendation score yet.

## Run the REST API

The REST API exposes the same recommendation engine through HTTP, over the
same catalogs as the console.

From this folder:

```bash
./run-api.sh
```

On Windows:

```bat
run-api.bat
```

## Run the REST API with Docker

The compose file builds from the repository root because the API reads the
CSV catalogs at runtime.

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

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Checks that the API is running. |
| `/api/filmes` | `GET` | Lists movie facts with `genre`, `pace`, `complexity`, `limit`, and `offset`. |
| `/api/filme` | `GET` | Reads one movie by `id`. |
| `/api/recomendacoes` | `GET` | Lists similar movies for a source movie using `id`, `min_score`, and `limit`. |
| `/api/recomendacoes_utilizador` | `GET` | Runs the recommendation engine for a CSV user profile using `user_id`, `limit`, and `offset`. |
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

The JSON `POST` routes remain available for debugging: they run the knowledge
base for the profile in the request body. The `GET /api/...` routes are the
preferred integration surface.

## Course-material alignment

| Course topic / PDF | Implementation evidence |
| --- | --- |
| Expert-system architecture: knowledge base, working memory, inference engine, explanation module, and interface (`04-ArquitSP.pdf`) | `movies.drl`, `users.drl` and `dialogue.drl` (with the reference facts in `knowledge/`) are the knowledge base; `RecommendationUnit` and `DialogueUnit` are the working memory; `DroolsRecommendationService` and `DialogueService` run the inference engine; `MovieRecommendationConsole` and `MovieRecommendationApi` are interfaces; `RecommendationResult`, `DialogueResult` and `DialogueQuestion` form the explanation module. |
| Forward chaining / data-driven inference (`05-EstratRac.pdf`) | Movie and user facts are inserted into `RecommendationUnit`; `instance.fire()` derives movie features, relations, exclusion reasons and preference reasons until nothing new is inferred. |
| Conflict resolution and rule priority (`05-EstratRac.pdf`) | The conclusions are monotonic, so no `salience` is needed: recommendations are read only after every rule has fired, so an exclusion always wins over a preference. |
| Separation between knowledge and control (`01-IntrodSBC_and_SP.pdf`, `03-ReprCon.pdf`) | Every rule is declarative in the `.drl` files and the reference knowledge is data in `knowledge/`; Java holds the facts, the CSV loading, helper functions and the execution plumbing. |
| Expert interview knowledge acquisition (`02-IntrodSP.pdf`, `Entrevista_Joao_Mota_Revista.pdf`) | The rules encode the expert decisions captured from the interview: explicit limits exclude movies; preferences add weighted reasons; recommendations expose satisfied and unmet preferences. |
| Drools working memory and rule execution (`Drools-HelloWorld.pdf`) | `RecommendationUnit` holds one `DataStore` per fact type, input and inferred. Rules join working-memory facts and insert new facts. |
| Drools monitoring and queries (`Monitorização Drools.pdf`) | `queries.drl` defines one query per inferred fact type. Every inferred fact records the rule that inserted it, which the `trace` command and route show. |
| Explanation types: How, Why, Why not (`04-ArquitSP.pdf`, `05-EstratRac.pdf`, `WhyNot.pdf`) | `how <movie>` and `POST /how` explain how a recommendation was produced; `why-not <movie>` and `POST /why-not` explain why it was not produced; `trace` and `POST /trace` show the fired-rule path; `facts` and `GET /facts` expose the known facts. In the experience dialogue, `porque` explains why a question is asked, and `dialogue-how` / `dialogue-why-not` explain dialogue conclusions over the rules read from `dialogue.drl` with the DRL parser. |
| Truth Maintenance Systems (`12-SP-TMS.pdf`) | The current implementation stores explicit trace facts. A future improvement can use Drools `insertLogical` for conclusions that should be automatically retracted when their supporting facts stop being true. |
| Fuzzy reasoning (`07-SP-Fuzzy.pdf`) | Current scoring is weighted and deterministic. Fuzzy logic is a suitable future extension for vague concepts such as "short movie", "recent movie", "close to minimum rating", and "high popularity". |
| Bayesian reasoning (`09-SP-Bayes.pdf`) | Bayesian reasoning is not implemented because the current project has no reliable prior and conditional probabilities. It should only be added if the catalogue/user data supports probabilistic evidence. |
| Ontologies and knowledge reuse (`13-Ontologies_en.pdf`, `14-KnowledgeManagement_en.pdf`) | The current model uses Java facts and Drools rules. A future ontology layer could formalize concepts such as genre, subgenre, actor, director, audience, and platform availability for reuse and interoperability. |

## Code map

| File | Role |
| --- | --- |
| `src/main/resources/meia/playgorithm/movies.drl` | Movie rules. |
| `src/main/resources/meia/playgorithm/users.drl` | User rules: exclusion and preference reasons. |
| `src/main/resources/meia/playgorithm/queries.drl` | Queries that read the inferred facts. |
| `src/main/resources/meia/playgorithm/knowledge/` | Reference knowledge: genre hints and preference weights. |
| `src/main/resources/meia/playgorithm/dialogue/dialogue.drl` | Experience dialogue rules. |
| `src/main/java/meia/playgorithm/facts/` | Fact records and enums: reference knowledge, CSV input facts and inferred facts. |
| `src/main/java/meia/playgorithm/RecommendationUnit.java` | Rule unit working memory of the recommendation knowledge base. |
| `src/main/java/meia/playgorithm/RuleFunctions.java` | Helper functions the rules import. |
| `src/main/java/meia/playgorithm/KnowledgeTables.java` | Loads the reference knowledge tables. |
| `src/main/java/meia/playgorithm/DroolsRecommendationService.java` | Inserts the facts, fires the rules and returns `KnowledgeBaseResult`. |
| `src/main/java/meia/playgorithm/KnowledgeBaseResult.java` | Every inferred fact, with lookups per movie and per user. |
| `src/main/java/meia/playgorithm/RecommendationQueries.java` | Recommendations of a user: score, status, ranking and unmet preferences. |
| `src/main/java/meia/playgorithm/RecommendationResult.java` | One user's recommendations and their explanations. |
| `src/main/java/meia/playgorithm/SampleMovieCatalog.java` / `SampleUserCatalog.java` / `UserProfile.java` | Load the CSV files into facts. |
| `src/main/java/meia/playgorithm/dialogue/` | Dialogue rule unit, its facts, the service that asks the questions, and the explanations. |
| `src/main/java/meia/playgorithm/MovieRecommendationConsole.java` | Interactive interface for recommendations, explanations and the dialogue. |
| `src/main/java/meia/playgorithm/MovieRecommendationApi.java` | REST interface with recommendations, fact inspection, health check, OpenAPI, Swagger UI, and explanation routes. |
| `src/test/java/meia/playgorithm/RuleParityTest.java` | Checks that the rule files parse, the number of rules in each file, and that rule names are unique. |
| `src/test/java/meia/playgorithm/RuleFunctionsTest.java` | Tests the helper functions and the parsing of the raw movie data. |
| `src/test/java/meia/playgorithm/MovieRecommendationTest.java` | Compares recommendations and exclusion reasons with the expected results, and checks the inferred movie profile. |
| `src/test/java/meia/playgorithm/dialogue/DialogueTest.java` | Automated validation of the dialogue branches, questions, and explanations. |
