# HTTP API

The API of the Prolog engine. It always answers JSON.

- **Base address:** `http://localhost:8081` with Docker, `http://localhost:8080` when you run it manually.
  The examples below use 8081. How to start it: [README](../README.md).
- **Queries** are `GET` requests. **Reloading the data** is a `POST` request.
- There is no authentication and CORS is open: this is a development API.

## Summary

| Request | What it does |
| --- | --- |
| `GET /api/health` | Checks that the API is running |
| `GET /api/filmes` | Lists movies, with filters |
| `GET /api/filme?id=` | Returns one movie |
| `GET /api/recomendacoes?id=` | Lists movies similar to a movie |
| `GET /api/recomendacoes_utilizador?user_id=` | Recommends movies to a user |
| `POST /api/reload` | Reads both CSV files again |
| `POST /api/reload/users` | Reads only `users.csv` again |
| `POST /api/reload/movies` | Reads only `movies.csv` again |

---

## Queries

### `GET /api/health`

```json
{ "status": "ok" }
```

### `GET /api/filmes`

Lists movies in loading order. Every parameter is optional.

| Parameter | Values | Default |
| --- | --- | --- |
| `genre` | The exact genre name, for example `Action` or `Dark Comedy` | all |
| `pace` | `slow`, `medium`, `fast`, `unknown` | all |
| `complexity` | `low`, `medium`, `high`, `unknown` | all |
| `limit` | 1 to 100 | 20 |
| `offset` | 0 or more | 0 |

Filters combine: a movie must meet all of them. Example:

```text
GET /api/filmes?pace=fast&complexity=high&limit=10
```

Response (`total` is the number of movies that meet the filters, before `limit` is applied):

```json
{
  "total": 100,
  "offset": 0,
  "limit": 10,
  "items": [ { "id": "tt0372784", "title": "Batman Begins", "...": "..." } ]
}
```

### `GET /api/filme?id=tt0372784`

| Parameter | Value |
| --- | --- |
| `id` | **Required.** The movie id |

Response (shortened):

```json
{
  "id": "tt0372784",
  "title": "Batman Begins",
  "year": 2017,
  "duration": "2h 20m",
  "genre": ["Action", "Action Epic", "Drama", "Epic", "Superhero", "Tragedy"],
  "pace": "fast",
  "complexity": "medium",
  "rating_imdb": "8,2",
  "rating_mpa": "PG-13"
}
```

A movie also has directors, actors, languages, countries, awards, budget and the ratings inferred by the
engine (pace, complexity, violence, humor, themes, emotional tone and audience).

- Fields that can hold several values (`genre`, `director`, `star`, `language`, ...) are always lists, even
  when they hold only one.
- A simple field with no value is `null`. A rating without enough data is `"unknown"`.
- Values come as they are in the CSV: for example, `rating_imdb` is the text `"8,2"`.

### `GET /api/recomendacoes?id=tt0372784`

Movies similar to a movie, from the most similar to the least.

| Parameter | Values | Default |
| --- | --- | --- |
| `id` | **Required.** The movie id | |
| `min_score` | 0 to 11. Only movies with at least this similarity are returned | 0 |
| `limit` | 1 to 100 | 10 |

```json
{
  "source_id": "tt0372784",
  "total": 99,
  "items": [
    { "score": 6, "movie": { "id": "tt0057242", "title": "Ladybug Ladybug", "...": "..." } }
  ]
}
```

The movie itself never appears. Movies with the same similarity are ordered by id.

### `GET /api/recomendacoes_utilizador?user_id=ana`

Recommendations for a user, with the reasons for each one.

| Parameter | Values | Default |
| --- | --- | --- |
| `user_id` | **Required.** The user (the `user_id` column of `users.csv`) | |
| `limit` | 1 to 100 | 10 |
| `offset` | 0 or more | 0 |

Response (one item, shortened):

```json
{
  "user_id": "ana",
  "total": 1,
  "offset": 0,
  "limit": 10,
  "items": [
    {
      "score": 93.6,
      "status": "main",
      "movie": { "id": "tt0372784", "title": "Batman Begins", "...": "..." },
      "reasons": [ { "type": "rating", "value": 8.2 }, { "type": "wishlist" } ],
      "satisfied_requirements": [ { "type": "duration", "arguments": [140, 150] } ],
      "unmet_preferences": [ { "type": "genre", "arguments": ["Adventure"] } ],
      "score_breakdown": { "genre": 40, "rating": 24.6, "director": 10, "star": 10, "secondary": 9 }
    }
  ]
}
```

| Field | What it is |
| --- | --- |
| `score` | The movie's score for this user |
| `status` | `main` meets everything that was asked; `alternative` fails only the minimum rating, within the user's tolerance |
| `reasons` | Why the movie was recommended |
| `satisfied_requirements` | The user's limits that the movie meets (duration, language, age...) |
| `unmet_preferences` | The preferences that the movie does not meet |
| `score_breakdown` | How the `score` was reached. The values add up to the `score` |

- The order is: `main` first, then `alternative`. Inside each group, the higher `score` comes first, then the
  higher rating, then the id.
- An empty list (`"items": []`) means that no movie is eligible for this user (for example, the user has
  already watched every movie that meets the limits).
- Do not add the rule weights on the client: use `score_breakdown`.
- How the score is calculated: [ENGINE.md](../ENGINE.md).

---

## Reloading the data

After you change a CSV file, these requests make the engine read it again, with no restart. They take no
body.

| Request | Reads again |
| --- | --- |
| `POST /api/reload` | `movies.csv` and `users.csv` |
| `POST /api/reload/users` | only `users.csv` |
| `POST /api/reload/movies` | only `movies.csv` |

Response:

```json
{ "status": "ok", "reloaded": "users", "movies": 100, "users": 10 }
```

- It takes about 2 seconds, because the engine runs all the rules again. This happens every time, because
  the conclusions depend on both files.
- **Everything changes or nothing does.** Queries that arrive during a reload see the old data. If a CSV has
  an error, the answer is `422` and the engine keeps the previous data.
- Two reloads at the same time run one after the other.

---

## Errors

Errors always have the same shape, with the message in `error`:

```json
{ "error": "Filme não encontrado" }
```

| Code | When |
| --- | --- |
| `400` | A parameter is missing or invalid (for example `limit=0` or `pace=xpto`) |
| `404` | The movie or the user does not exist |
| `405` | Wrong method (for example `GET /api/reload`) |
| `422` | A reload found an invalid CSV |
| `500` | Unexpected error in Prolog (it is written to the logs) |

---

## For whoever changes the API

### Code organisation

| File | What it does |
| --- | --- |
| `server.pl` | Entry point: loads the engine, registers the controllers, and defines `start/0,1` and `stop/0` |
| `http_common.pl` | CORS, HTTP method, JSON errors, pagination and logs |
| `health_controller.pl` | `/api/health` |
| `movies_controller.pl` | `/api/filmes`, `/api/filme` and `/api/recomendacoes` (and how a movie is serialised) |
| `users_controller.pl` | `/api/recomendacoes_utilizador` |
| `reload_controller.pl` | `/api/reload`, `/api/reload/users` and `/api/reload/movies` |

A new controller is a module with its own `http_handler` declarations, in the form
`api_handle(get, handler)`, loaded in `server.pl`. The reload logic (`recarrega_base/1`) is in
`../filmes_bc.pl`, next to the code that loads the facts.

### Logs

Each request writes one line (`docker compose logs -f swi-prolog`):

```text
GET /api/filme?id=x -> 404 (1 ms)
POST /api/reload -> 200 (1672 ms)
```

### Tests

Inside `swi-prolog/`:

```bash
python api/test_http.py
```

It starts a temporary server, sends real HTTP requests (queries, filters, errors, CORS and reloads) and shuts
it down.
