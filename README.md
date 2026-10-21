# Playgorithm - Challenge One

A movie recommendation system built on two inference engines, Prolog and Drools. Both read the same
movies and users from a knowledge base service and answer the same HTTP API. A React frontend lets you
edit user profiles and compare the recommendations from each engine.

## Services

| Service | Folder | Port | What it does |
| --- | --- | --- | --- |
| Frontend | `frontend/` | 4173 | React interface to edit users and see recommendations |
| Knowledge base | `knowledge_base/` | 8090 | Serves `movies.csv` and `users.csv` and manages users |
| Prolog engine | `swi-prolog/` | 8081 | SWI-Prolog rules and HTTP API |
| Drools engine | `drools/` | 8082 | Drools rules and HTTP API |

The knowledge base is the single source of data. The engines load its CSV files at startup and again on
every reload request. The frontend reads and writes users through the knowledge base, then asks each
engine to reload them.

## Run everything with Docker

You only need Docker Desktop. Run every command in a terminal opened at the **repository root** (the folder
that holds `docker-compose.yml`).

### Step 1. Open Docker Desktop

Check that it is open and running.

### Step 2. Start the services

```bash
docker compose up -d --build
```

The first run takes a few minutes because it builds the four images.

### Step 3. Open the frontend

Open [http://localhost:4173](http://localhost:4173) in the browser. The engines take about 30 seconds (max) to
load their rules, so wait a moment if the recommendations show an error.

### Step 4. Check each service

| Service | Address |
| --- | --- |
| Frontend | http://localhost:4173 |
| Knowledge base (Swagger) | http://localhost:8090/docs |
| Prolog engine | http://localhost:8081/api/health |
| Drools engine (Swagger) | http://localhost:8082/docs |

### Step 5. Stop

```bash
docker compose down
```

To run a single service, name it: `docker compose up -d --build drools`. To run a service without
Docker, use the `run.sh` (Linux, macOS, Git Bash) or `run.bat` (Windows) script in its folder; its README
explains the steps.

## Documentation

Each service has its own README. The documents in `docs/` explain the design and compare the engines.

| Document | What it covers |
| --- | --- |
| [Frontend](frontend/README.md) | Run, develop and configure the interface |
| [Knowledge base](knowledge_base/README.md) | The CSV files, the users CRUD and how to run it |
| [Prolog engine](swi-prolog/README.md) | Run the engine, the API and the console |
| [Prolog API](swi-prolog/api/README.md) | Every endpoint, with parameters and responses |
| [Prolog rules and scoring](swi-prolog/ENGINE.md) | The rules, the user CSV format and how scores are calculated |
| [Drools engine](drools/README.md) | Run the engine, the API and the console |
| [Endpoints](docs/endpoints.md) | Every endpoint of every service, and what the knowledge base already covers |
| [Prolog vs Drools](docs/prolog-vs-drools.md) | What differs between the two engines, and why |
| [Rules: Prolog vs Drools](docs/rules-prolog-vs-drools.md) | The 69 rules side by side |
| [Implementation vs interview](docs/implementation-vs-interview.md) | What the expert interview asked for and what is still missing |
| [Expert decisions flowchart](docs/expert-decisions-flowchart.md) | The expert's decision process |
| [Recommendation flowchart](docs/movie-recommendation-flowchart.md) | The proposed recommendation flow |
| [Branch management](docs/branch-management.md) | How to work with branches |
| [Conventional Commits](docs/conventional-commits.md) | The commit message format |

## Branch policy

- **main** is production. Changes arrive through Pull Requests only.
- **development** is for testing. Changes arrive through Pull Requests only.
- **feature/** and **bugfix/** branches are created from `development` and merged back into `development`.
- Name them `feature/issueid_branch-name` or `bugfix/issueid_branch-name`, for example
  `feature/123_social-login`. The issue ID comes from the GitHub Issue Board.
- Merge `development` into `main` weekly, through a Pull Request.

See [Branch management](docs/branch-management.md) for the full workflow.
