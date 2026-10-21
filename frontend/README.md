# Frontend

A React and Vite interface for the Playgorithm movie recommendation system. It lets you:

- create, select, edit and delete user profiles;
- set preferred and disliked genres and languages, and limits such as rating, year and duration;
- mark watched movies with a rating, and keep a wishlist;
- compare the recommendations from the Prolog and Drools engines.

The frontend has no data of its own. It reads and writes users through the knowledge base, and asks each
engine to reload them after every change.

---

## Run with Docker

You only need Docker Desktop. Run every command in a terminal opened at the **repository root** (the folder
that holds `docker-compose.yml`).

### Step 1. Open Docker Desktop

Check that it is open and running.

### Step 2. Start the frontend and the other services

```bash
docker compose up -d --build
```

This starts the frontend, the knowledge base and both engines. The first run takes a few minutes because it
builds the images. To start only the frontend, run `docker compose up -d --build frontend`: the interface
opens, but it has no users and no recommendations without the other services.

`deploy.sh` (Linux and macOS) and `deploy.bat` (Windows) run the same command.

### Step 3. Open the interface

Open [http://localhost:4173](http://localhost:4173). `GET /health` at the same address answers
`{"status": "ok"}`.

### Step 4. Stop

```bash
docker compose down
```

After you change the source code, go back to Step 2 to rebuild the image.

---

## Run manually

You need **Node.js 20 or newer**. The other services must be running for the interface to work, so start
them with Docker first:

```bash
docker compose up -d knowledge-base swi-prolog drools
```

### Step 1. Go to the folder

From the repository root:

```bash
cd frontend
```

### Step 2. Start the development server

Linux, macOS or Git Bash:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

The script installs the dependencies the first time (`npm ci`) and starts Vite. Vite prints the address,
normally [http://localhost:5173](http://localhost:5173).

### Step 3. Build for production (optional)

```bash
npm run build
```

---

## Configuration

The service addresses live in `public/config.json`. The frontend reads this file when it starts:

```json
{
  "knowledgeBaseUrl": "http://localhost:8090",
  "engines": {
    "prolog": { "label": "SWI-Prolog", "baseUrl": "http://localhost:8081" },
    "drools": { "label": "Drools", "baseUrl": "http://localhost:8082" }
  }
}
```

In Docker the file is mounted as a volume, so after editing it you only restart the container
(`docker compose restart frontend`), with no rebuild. Add an entry under `engines` to show another engine.

## Code organisation

```
src/
  main.tsx          starts the app: loads config.json, then renders
  App.tsx           page layout
  api/              one file per service; routes.ts lists every route the frontend calls
  context/          AppContext: the data shared by the whole app
  hooks/            logic without JSX: useUsers, useEngines, useRecommendations, useSave
  components/       user/, parameters/, preferences/, movies/, recommendations/, common/
  lib/              config, CSV parsing, option lists, theme, helpers
  types/            Movie, User, Recommendation
```

Rules of thumb:

- A component only draws; the logic goes in a hook.
- Every HTTP call goes through `api/`, and every route is written in `api/routes.ts`.
- `components/common/` holds the pieces that other folders reuse.
