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
opens a small query shell over the inferred facts and trace events.

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
why Batman Begins
why-not Inception
trace
facts
exit
```

`why` corresponds to a "How?" explanation: it shows the path that produced a
recommendation. `why-not` corresponds to a "Why not?" explanation: it shows the
mandatory rules or rejection rules that prevented a movie from becoming a
recommendation.

## Course-material alignment

| Course topic / PDF | Implementation evidence |
| --- | --- |
| Expert-system architecture: knowledge base, working memory, inference engine, explanation module, and interface (`04-ArquitSP.pdf`) | `rules.drl` is the knowledge base; `MovieRecommendationUnit` exposes Drools working-memory data stores; `DroolsRecommendationService` runs the inference engine; `MovieRecommendationConsole` is the user interface; `Recommendation`, `TraceEvent`, `why`, and `why-not` form the explanation module. |
| Forward chaining / data-driven inference (`05-EstratRac.pdf`) | Drools fires rules from inserted facts: user preferences and movie facts are inserted into `MovieRecommendationUnit`, then `instance.fire()` derives exclusions, preference reasons, recommendations, and trace events. |
| Conflict resolution and rule priority (`05-EstratRac.pdf`) | `rules.drl` uses `salience`: exclusion rules run first, preference rules run next, and the recommendation creation rule runs last. This keeps mandatory constraints ahead of scoring. |
| Separation between knowledge and control (`01-IntrodSBC_and_SP.pdf`, `03-ReprCon.pdf`) | Recommendation knowledge is declarative in `rules.drl`; Java classes hold facts and execution plumbing. Domain knowledge is not hard-coded inside the console. |
| Expert interview knowledge acquisition (`02-IntrodSP.pdf`, `Entrevista_Joao_Mota_Revista.pdf`) | The rules encode the expert decisions captured from the interview: mandatory limits discard movies; flexible preferences affect score; rejected genres/directors/actors exclude; recommendations expose satisfied and unmet preferences. |
| Drools working memory and rule execution (`Drools-HelloWorld.pdf`) | `MovieRecommendationUnit` contains `DataStore<Movie>`, `DataStore<UserPreferences>`, `DataStore<Recommendation>`, and `DataStore<TraceEvent>`. Rules combine working-memory facts with the knowledge base to create new facts. |
| Drools monitoring and queries (`Monitorização Drools.pdf`) | `rules.drl` defines `FindRecommendations` and `FindTraceEvents` queries. `TraceEvent` records rule firings for exclusions, preference matches, and recommendation creation. |
| Explanation types: How, Why, Why not (`04-ArquitSP.pdf`, `05-EstratRac.pdf`, `WhyNot.pdf`) | `why <movie>` explains why a recommendation was produced; `why-not <movie>` explains why it was not produced; `trace` shows the fired-rule path. |
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
| `src/main/java/meia/playgorithm/TraceEvent.java` | Observable explanation fact emitted by rules. |
| `src/main/java/meia/playgorithm/Recommendation.java` | Final recommendation fact with score, status, reasons, unmet preferences, and score breakdown. |
| `src/test/java/meia/playgorithm/MovieRecommendationTest.java` | Automated validation of exclusions, alternatives, scoring, compatibility, and trace events. |
