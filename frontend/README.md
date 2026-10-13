# Frontend

The frontend is a React and Vite interface for the Playgorithm movie
recommendation experience. It lets users:

- create, select, and edit user profiles;
- define preferred and excluded languages and genres;
- set rating, year, and duration preferences; and
- mark movies and movie credits as liked, disliked, wanted, or skipped.


## Requirements

- Docker Desktop with Docker Compose

## Setup with Docker

The deployment scripts run the root `docker-compose.yml`, which builds and
starts the frontend (port 4173), the knowledge base (port 8090) and the Prolog API
(port 8081) in the background. The frontend reads its settings (service URLs, default
engine) from `public/config.json` at runtime; in Docker that file is mounted as a
volume, so editing it needs only a container restart, not a rebuild.

### Unix (Linux/macOS)

```bash
cd frontend
./deploy.sh
```

If the script is not executable, run:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows

```bat
cd frontend
deploy.bat
```

Once the container is running, open [http://localhost:4173](http://localhost:4173).

To stop the container:

```bash
docker compose down   # from the repository root
```

## Local development

Node.js 20 or newer is recommended for running Vite without Docker.

```bash
cd frontend
npm ci
npm run dev
```

Vite will print the local development URL, normally
[http://localhost:5173](http://localhost:5173).

To create a production build locally:

```bash
npm run build
```
