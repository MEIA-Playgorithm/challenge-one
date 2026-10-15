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

The deployment scripts build the frontend image and start it in the
background. Run the commands from this directory.

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

Once the container is running, open [http://localhost:8080](http://localhost:8080).

To stop the container:

```bash
docker compose down
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
