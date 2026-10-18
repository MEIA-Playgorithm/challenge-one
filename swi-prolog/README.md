# Prolog engine

An inference engine in SWI-Prolog. It applies production rules to a base of movies and users and returns
recommendations through an HTTP API, or through an interactive console.

More documentation in this folder: [api/README.md](api/README.md) (the endpoints) and
[ENGINE.md](ENGINE.md) (the rules, the user CSV format and how the scores are calculated).

---

## Run with Docker

You only need Docker Desktop. Run every command in a terminal opened at the **repository root** (the folder
that holds `docker-compose.yml`).

### Step 1. Open Docker Desktop

Check that it is open and running.

### Step 2. Start the engine

```bash
docker compose up -d --build swi-prolog
```

This starts the Prolog engine and the knowledge base, where the engine reads the CSV files. The first run
takes a few minutes because it builds the images.

### Step 3. Check that it works

Wait about 30 seconds and open in the browser:

> http://localhost:8081/api/health

You should see `{"status":"ok"}`. If you get an error, wait a little longer and refresh the page.

### Step 4. Use the API

Open in the browser:

| What it shows | Address |
| --- | --- |
| The list of movies | http://localhost:8081/api/filmes |
| One movie | http://localhost:8081/api/filme?id=tt0372784 |
| Movies similar to that one | http://localhost:8081/api/recomendacoes?id=tt0372784 |
| Recommendations for the user `ana` | http://localhost:8081/api/recomendacoes_utilizador?user_id=ana |

### Step 5. Change the data

1. Edit `knowledge_base/users.csv` (or `movies.csv`) and save.
2. Ask the engine to read the files again. These are `POST` requests, so they do not work in the browser.
   Pick the one that matches what you changed:

   | What you changed | Command | Postman request |
   | --- | --- | --- |
   | Both files | `curl -X POST http://localhost:8081/api/reload` | Reload all |
   | Only `users.csv` | `curl -X POST http://localhost:8081/api/reload/users` | Reload users |
   | Only `movies.csv` | `curl -X POST http://localhost:8081/api/reload/movies` | Reload movies |

   In PowerShell, write `curl.exe` instead of `curl`.

3. If it worked, the answer has `"status":"ok"`. If a CSV has an error, the answer is `422` with a
   description and the engine keeps the previous data.

### Step 6. See the logs and stop

Follow the requests as they arrive (Ctrl+C to leave):

```bash
docker compose logs -f swi-prolog
```

Stop everything:

```bash
docker compose down
```

After you change a `.pl` file, go back to Step 2 to rebuild the image.

---

## Run manually

No Docker needed for the engine. You need **SWI-Prolog 9 or newer** installed (the `swipl` command must work
in the terminal).

### Step 1. Go to the folder

From the repository root:

```bash
cd swi-prolog
```

Every command below runs here.

### Step 2. Choose where the CSV files come from

**Option A: the files in the repository.** Do nothing. The engine reads `../knowledge_base/movies.csv`
and `../knowledge_base/users.csv`.

**Option B: the knowledge base service** (port 8090). This needs Docker:

1. From the repository root, start the service:

   ```bash
   docker compose up -d knowledge-base
   ```

2. In the terminal where you will run the engine, set the addresses of the files.

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

### Step 3. Load the knowledge base and start

Choose **one** of the three.

**Option 1: the API** (at http://localhost:8080). The knowledge base loads at startup.

Linux, macOS or Git Bash:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Wait about 30 seconds and open http://localhost:8080/api/health. To use another port, set `PORT` before you
run the script.

**Option 2: the console with engine 1** (`sp_exp1`):

```bash
swipl -q -s sp_exp1.pl
```

**Option 3: the console with engine 2** (`sp_exp2`, which also explains its conclusions):

```bash
swipl -q -s sp_exp2.pl
```

With options 2 and 3, when the `?-` prompt appears, load the knowledge base by typing these three lines,
**one at a time** (each ends with a full stop):

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.
```

- `carrega_bc.` asks for the name of the knowledge base.
- `'filmes_bc.pl'.` is the answer: it reads the CSV files and loads the rules.
- `arranca_motor.` runs the rules. It prints many "Foi concluído o facto..." lines, which is normal, and takes
  a few seconds.

### Step 4. Ask questions (console only)

The genres of Batman Begins (`;` shows the next answer, Enter stops):

```prolog
facto(_, genre(tt0372784, G)).
```

Engine 2 only: why does Batman Begins have a fast pace?

```prolog
facto(N, pace(tt0372784, fast)), como(N).
```

Leave the console with `halt.`

More queries are in [ENGINE.md](ENGINE.md).

### Step 5. After you change a CSV

- **API running:** no restart needed. Send one of these requests, depending on what you changed (in
  PowerShell, `curl.exe`):

  ```bash
  curl -X POST http://localhost:8080/api/reload          # both files
  curl -X POST http://localhost:8080/api/reload/users    # only users.csv
  curl -X POST http://localhost:8080/api/reload/movies   # only movies.csv
  ```

- **Console:** type `carrega_factos_filmes.` and then `arranca_motor.` (this reads both files again).

---

## Files

| File | What it does |
| --- | --- |
| `run.sh`, `run.bat` | Start the API without Docker |
| `api/` | The HTTP API, one file per area |
| `csv_source.pl` | Reads a CSV from a URL or from a file |
| `movies_loader.pl`, `user_bc.pl` | Turn the movies CSV and the users CSV into facts |
| `filmes_bc.pl` | Joins the facts and handles reloading |
| `rules_movies.pl` | Rules 1–33: classify the movies |
| `rules_users.pl` | Rules 34–69: user preferences, exclusions and limits |
| `user_constraints.pl` | Helper functions for the rules |
| `rules_dialog.pl` | Dialogue in engine 2: choose one of seven experiences, follow-up questions and "why?" |
| `sp_exp1.pl`, `sp_exp2.pl` | The two inference engines |
| `rules_user.pl` | Kept for compatibility only; it loads `rules_users.pl` |
