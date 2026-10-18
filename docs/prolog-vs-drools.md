# Prolog vs Drools: what differs and why

The two engines do the same job: the same exclusions, the same 19 kinds of preference reasons, the same
scoring and the same `main` / `alternative` status. They also have the same endpoints, parameters,
pagination, and `400` and `404` errors. The table below lists only what differs. The frontend decides the
contract, so the last column says whether the frontend is already affected.

Measured by sending the same requests to both running engines (100 movies, 10 users) and by reading the
rules and the frontend code.

| What differs | Endpoint | Prolog | Drools | Why | Frontend |
| --- | --- | --- | --- | --- | --- |
| A user with no preferences (or very few) | `GET /api/recomendacoes_utilizador` | 100 recommendations | 0 (only movies with some preference reason) | The Drools rule needs at least one preference reason | Affected now: every new user |
| Reload with an invalid CSV | `POST /api/reload/users` | `422` with the message; the previous base is kept | `200`, accepts the CSV | Drools does not validate the CSV | Affected now: the frontend shows the reload error |
| `rating_imdb` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | the text `"8,2"` or the integer `7` | the number `8.2` | Prolog returns what is in the CSV; Drools converts it | Affected now: the frontend declares `string` |
| Titles with accents (2 movies) | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | broken (`Ãducation`) | correct | Prolog reads the HTTP stream as `octet` (Latin-1) and ignores the `charset=utf-8` that the knowledge base sends | Affected now: they appear in the list |
| Order of ties in `score` | `GET /api/recomendacoes_utilizador` | by rating and id | no rule (varies between requests) | Drools defines no tie-breaker | Affected now: the order of the list |
| Score of `Smash Palace` (carla) | `GET /api/recomendacoes_utilizador` | 30 | 28 | The `secondary` group is 9 against 7; cause still to investigate | Affected now: `score` |
| `reasons` | `GET /api/recomendacoes_utilizador` | the actual value (`genre: "Action"`) and `rating` | `"preferred"`, with no `rating` | Drools does not keep the value of the reason | Will need it |
| `satisfied_requirements` | `GET /api/recomendacoes_utilizador` | filled in | always `[]` | Not implemented in Drools | Will need it |
| `unmet_preferences` | `GET /api/recomendacoes_utilizador` | filled in | always `[]` | Not implemented in Drools | Will need it |
| Explanation of how a recommendation was reached | `GET /api/how` | console only | in the API | Only Drools exposes it over HTTP | Will need it |
| Explanation of why a movie was not recommended | `GET /api/why-not` | console only | in the API | Only Drools exposes it over HTTP | Will need it |
| Events of the rules that fired | `GET /api/trace` | — | in the API | Only Drools has them | Will need it |
| `duration` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | `"2h 20m"` | `140` | Different formats | Does not use it |
| `vote`, `budget`, `win`, `nomination`, `oscar` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | the CSV value | always `null` | Drools does not read these columns | Does not use them |
| `filming_location`, `production_company` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | the list from the CSV | an empty list for most movies | Drools does not read these columns | Does not use them |
| `rating_mpa` with no value | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | `""` | `null` | Different formats | Does not use it |
| Order of `country_origin`, `director`, `emotional_tone`, `genre`, `language`, `star`, `themes` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | one order | another order, with the same elements | Each engine sorts in its own way | Does not use it |
| Filter `genre=Sword Sandal` | `GET /api/filmes?genre=` | 1 movie | 0 | Prolog normalises spaces; the CSV has two | Does not use it |
| Unknown route | `GET /api/nao_existe` | `404` with `{"code": 404, "location": ..., "message": "Path not found: ..."}` | `404` with `{"error": "Route not found"}` | Prolog uses the SWI-Prolog error format for unknown routes | Does not use it |
| Wrong method (`405`) | `GET /api/reload`<br>`POST /api/health` | with CORS | without CORS | | Does not use it |
| `OPTIONS` without `Access-Control-Request-Method` | `OPTIONS /api/filmes` | `200` | `403` | A real browser preflight gets `200` from both | Does not use it |
| API documentation | `GET /docs`<br>`GET /openapi.json`<br>`GET /swagger-ui/index.html` | — | yes | Only Drools generates OpenAPI | Does not use it |
| "Why?" dialogue | — (console only) | yes | — | It exists only in Prolog | Does not use it (no API) |
| Mandatory genre, director and actor rules | — (console only) | — | yes | They exist only in Drools | Does not use them (no API) |
