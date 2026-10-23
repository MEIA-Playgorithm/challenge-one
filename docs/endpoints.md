# Endpoints by service

## All endpoints

X = the service implements the endpoint. The last column says whether the frontend calls it.

| Method | Endpoint | Prolog | Drools | Knowledge base | Frontend | Frontend calls it |
| --- | --- | :-: | :-: | :-: | :-: | :-: |
| GET | `/api/health` | X | X | — | — | — |
| GET | `/api/filmes` | X | X | — | — | — |
| GET | `/api/filme` | X | X | — | — | — |
| GET | `/api/recomendacoes` | X | X | — | — | — |
| GET | `/api/recomendacoes_utilizador` | X | X | — | — | X |
| POST | `/api/reload` | X | X | — | — | — |
| POST | `/api/reload/users` | X | X | — | — | X |
| POST | `/api/reload/movies` | X | X | — | — | — |
| POST | `/api/dialogo` | X | — | — | — | X |
| GET | `/api/how` | — | X | — | — | — |
| GET | `/api/why-not` | — | X | — | — | — |
| GET | `/api/trace` | — | X | — | — | — |
| POST | `/api/dialogue` | — | X | — | — | — |
| GET | `/docs` | — | X | X | — | — |
| GET | `/swagger-ui/index.html` | — | X | — | — | — |
| GET | `/redoc` | — | — | X | — | — |
| GET | `/openapi.json` | — | X | X | — | — |
| GET | `/health` | — | — | X | X | — |
| GET | `/users.csv` | — | — | X | — | X |
| GET | `/movies.csv` | — | — | X | — | X |
| POST | `/users` | — | — | X | — | X |
| GET | `/users/{user_id}` | — | — | X | — | — |
| PUT | `/users/{user_id}` | — | — | X | — | X |
| DELETE | `/users/{user_id}` | — | — | X | — | X |
| GET | `/config.json` | — | — | — | X | X |

## What the knowledge base already covers

For each engine endpoint: what it returns, and what the knowledge base returns that is equivalent. "Covers"
means it returns the same content, not only a similar route.

| Engine endpoint | What it returns | Does the knowledge base cover it? | Equivalent in the knowledge base | What the knowledge base does not give | Engine values compared with the CSV |
| --- | --- | :-: | --- | --- | --- |
| `GET /api/health` | `{"status": "ok"}` | No | — (`GET /health` on the knowledge base is its own healthcheck, not the engine's) | The state of the service | — |
| `GET /api/filmes` | A page of movies (`total`, `offset`, `limit`, `items`) with 28 fields; filters `genre`, `pace`, `complexity` | **Partly** | `GET /movies.csv`: the 100 movies, with 19 fields, as CSV | 9 inferred fields (`pace`, `complexity`, `violence`, `humor`, `audience`, `psychological_intensity`, `emotional_tone`, `themes`, `subgenre`), filters, pagination and JSON | Prolog equals the CSV in 1897 of 1900 values; Drools in 1193 of 1900 |
| `GET /api/filme` | One movie, with 28 fields | **Partly** | The movie's row in `GET /movies.csv` (there is no `/movies/{id}`) | The same 9 inferred fields and the search by `id` | same as above |
| `GET /api/recomendacoes` | Movies similar to a movie, with a `score` from 0 to 11 | No | — | The similarity calculation | — |
| `GET /api/recomendacoes_utilizador` | Recommendations for a user (`score`, `status`, `reasons`, `score_breakdown`...) | No | `GET /users/{user_id}` returns the profile (34 columns as text), not recommendations | The whole calculation | — |
| `POST /api/reload` | Reads both CSV files again | Not applicable | — (the knowledge base reads the file on every request and keeps no copy) | — | — |
| `POST /api/reload/users` | Reads the users CSV again | Not applicable | — (same) | — | — |
| `POST /api/reload/movies` | Reads the movies CSV again | Not applicable | — (same) | — | — |
| `GET /api/how` | How a recommendation was reached | No | — | The explanation | — |
| `GET /api/why-not` | Why a movie was not recommended | No | — | The explanation | — |
| `GET /api/trace` | The rule events that fired | No | — | The events | — |
| `POST /api/dialogue` | The next dialogue question with its why, or the conclusions | No | — | The dialogue | — |
| `GET /docs`, `/swagger-ui/index.html`, `/openapi.json` | The engine's own documentation | No | `GET /docs` and `/openapi.json` of the knowledge base document only the knowledge base | The documentation of the engines | — |

Of the 15 Drools endpoints and the 8 Prolog endpoints, the knowledge base **partly covers 2**
(`/api/filmes` and `/api/filme`), and only in the 19 CSV fields. The others depend on the engines'
calculation or on their state. In those 19 fields, Prolog returns the CSV values; Drools changes the
duration and the rating, and leaves 7 fields empty (`vote`, `budget`, `win`, `nomination`, `oscar`,
`filming_location`, `production_company`).

## By service

The **Frontend** column says whether the frontend calls the endpoint.

### Prolog (`:8081`)

| Method | Endpoint | What it does | Parameters | Frontend |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Service state | — | — |
| GET | `/api/filmes` | Lists movies, with filters and pagination | `genre`, `pace`, `complexity`, `limit` (1–100, 20), `offset` (0) | — |
| GET | `/api/filme` | One movie | `id` | — |
| GET | `/api/recomendacoes` | Movies similar to a movie | `id`, `min_score` (0–11, 0), `limit` (1–100, 10) | — |
| GET | `/api/recomendacoes_utilizador` | Recommendations for a user | `user_id`, `limit` (1–100, 10), `offset` (0) | calls it |
| POST | `/api/reload` | Reads both CSV files again | — | — |
| POST | `/api/reload/users` | Reads the users CSV again | — | calls it |
| POST | `/api/reload/movies` | Reads the movies CSV again | — | — |
| POST | `/api/dialogo` | Runs the dialogue for a user up to the next question, with its "why" | JSON: `user_id`, `answers` | calls it |

### Drools (`:8082`)

| Method | Endpoint | What it does | Parameters | Frontend |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Service state | — | — |
| GET | `/api/filmes` | Lists movies, with filters and pagination | `genre`, `pace`, `complexity`, `limit` (1–100, 20), `offset` (0) | — |
| GET | `/api/filme` | One movie | `id` | — |
| GET | `/api/recomendacoes` | Movies similar to a movie | `id`, `min_score` (0–11, 0), `limit` (1–100, 10) | — |
| GET | `/api/recomendacoes_utilizador` | Recommendations for a user | `user_id`, `limit` (1–100, 10), `offset` (0) | calls it |
| POST | `/api/reload` | Reads both CSV files again | — | — |
| POST | `/api/reload/users` | Reads the users CSV again | — | calls it |
| POST | `/api/reload/movies` | Reads the movies CSV again | — | — |
| GET | `/api/how` | How a recommendation was reached | `user_id`, `movie` | — |
| GET | `/api/why-not` | Why a movie was not recommended | `user_id`, `movie` | — |
| GET | `/api/trace` | The rule events that fired | `user_id`, `movie` (optional) | — |
| POST | `/api/dialogue` | Experience dialogue up to the next unanswered question | JSON body: `user_id`, `answers` | — |
| GET | `/docs` | Swagger UI (redirects) | — | — |
| GET | `/swagger-ui/index.html` | Swagger UI | — | — |
| GET | `/openapi.json` | OpenAPI specification | — | — |

### Knowledge base (`:8090`)

| Method | Endpoint | What it does | Parameters | Frontend |
| --- | --- | --- | --- | --- |
| GET | `/health` | Service state | — | — |
| GET | `/users.csv` | The users CSV | — | calls it |
| GET | `/movies.csv` | The movies CSV | — | calls it |
| POST | `/users` | Creates a user | JSON body with the columns | calls it |
| GET | `/users/{user_id}` | One user | `user_id` in the path | — |
| PUT | `/users/{user_id}` | Replaces a user (the id can change) | `user_id` in the path, JSON body | calls it |
| DELETE | `/users/{user_id}` | Deletes a user | `user_id` in the path | calls it |
| GET | `/docs` | Swagger UI | — | — |
| GET | `/redoc` | ReDoc documentation | — | — |
| GET | `/openapi.json` | OpenAPI specification | — | — |

### Frontend (`:4173`)

| Method | Endpoint | What it does | Parameters | Frontend |
| --- | --- | --- | --- | --- |
| GET | `/health` | Service state | — | — |
| GET | `/config.json` | The service addresses; the frontend reads it at startup | — | reads it |

## Summary

| Service | Endpoints | Only in this service | The frontend uses |
| --- | :-: | --- | :-: |
| Prolog | 9 | `/api/dialogo` | 3 |
| Drools | 15 | `/api/how`, `/api/why-not`, `/api/trace`, `/api/dialogue`, `/docs`, `/swagger-ui/index.html`, `/openapi.json` | 2 |
| Knowledge base | 10 | all | 5 |
| Frontend | 2 | `/health`, `/config.json` | 1 |

Both engines have the same 8 data endpoints. Prolog adds the dialogue; Drools adds the 3 explanations, its own dialogue
and the documentation. The frontend uses 11 of the 36 endpoints (counting each service separately): `/api/recomendacoes_utilizador` and
`/api/reload/users` (in both engines), `/api/dialogo` (Prolog only), 5 from the knowledge base (`/users.csv`, `/movies.csv`, and `POST`,
`PUT` and `DELETE` on `/users`) and its own `/config.json`.
