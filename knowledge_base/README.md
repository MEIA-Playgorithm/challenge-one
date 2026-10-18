# Knowledge base

The CSV files (`movies.csv` and `users.csv`) and the service that serves them. Neither the frontend nor the
engines (Prolog and Drools) read these files directly: they use this service over HTTP.

The service stores text only. It does not check what a column contains. The engines do that when they reload
the CSV, and `POST /api/reload/users` answers `422` if the file is invalid.

---

## Endpoints

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/health` | Checks that the service is running (`{"status": "ok"}`) |
| GET | `/movies.csv` | Returns the movies file, exactly as it is on disk |
| GET | `/users.csv` | Returns the users file, exactly as it is on disk |
| GET | `/users/{user_id}` | Returns one user |
| POST | `/users` | Creates a user (`201`; `409` if the `user_id` already exists) |
| PUT | `/users/{user_id}` | Replaces a user (the `user_id` can change) |
| DELETE | `/users/{user_id}` | Deletes a user (`204`) |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc documentation |
| GET | `/openapi.json` | OpenAPI specification |

- The body of `POST` and `PUT` is a JSON object whose keys are the CSV column names and whose values are
  text. Lists are separated by `|`.
- Errors always have the shape `{"error": "message"}`.
- After a write, ask each engine to reload the users (`POST /api/reload/users`). The frontend does this
  for you.

The engines read the CSV from the addresses in `MOVIES_CSV` and `USERS_CSV`, for example
`http://knowledge-base:8090/users.csv`. A file path also works.

---

## Run with Docker

Run every command in a terminal opened at the **repository root** (the folder that holds
`docker-compose.yml`).

### Step 1. Open Docker Desktop

Check that it is open and running.

### Step 2. Start the service

```bash
docker compose up -d --build knowledge-base
```

### Step 3. Check that it works

Open [http://localhost:8090/users.csv](http://localhost:8090/users.csv) to see the file, or
[http://localhost:8090/docs](http://localhost:8090/docs) to try the endpoints in Swagger.

### Step 4. Stop

```bash
docker compose down
```

The compose file mounts this folder as the service's data directory, so editing `users.csv` or `movies.csv`
takes effect on the next request, with no restart.

---

## Run manually

You need **Python 3.10 or newer**.

### Step 1. Go to the folder

From the repository root:

```bash
cd knowledge_base
```

### Step 2. Start the service

Linux, macOS or Git Bash:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

The script installs the dependencies (`pip install -r requirements.txt`) and starts the service at
[http://localhost:8090](http://localhost:8090), reading the CSV files in this folder. To change the port or
the folder, set `PORT` or `DATA_DIR` before you run the script.

---

## Files

The service is built with FastAPI, with one controller per area and one repository per CSV file.

| File | What it does |
| --- | --- |
| `run.sh`, `run.bat` | Install the dependencies and start the service without Docker |
| `server.py` | Starts the app: CORS, error handlers and controllers |
| `app/config.py` | `DATA_DIR` (where the CSV files are) and `PORT` |
| `app/dependencies.py` | Creates one repository of each kind and injects it into the controllers |
| `app/core/errors.py` | `ApiError` and the handlers that turn every error into `{"error": ...}` |
| `app/repositories/csv_repository.py` | Reads a CSV file (the base of the other two repositories) |
| `app/repositories/movies_repository.py` | The movies file, read only |
| `app/repositories/users_repository.py` | The users file: read, create, replace and delete, with atomic writes |
| `app/controllers/health_controller.py` | `GET /health` |
| `app/controllers/files_controller.py` | `GET /movies.csv` and `GET /users.csv` |
| `app/controllers/users_controller.py` | The `/users` endpoints |
