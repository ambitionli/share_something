# Phase 5 — Polish & deployment

**Last updated:** 2026-04-16

## Docker — development

From the repository root, create a `.env` file (copy from `.env.example`) and adjust secrets and service URLs.

Start infrastructure, API, and admin UI:

```bash
docker compose up -d --build
```

- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`
- **MinIO:** API `localhost:9000`, console `localhost:9001`
- **Backend (FastAPI / Uvicorn with reload):** `http://localhost:8000` — OpenAPI at `/docs`, health at `GET /health`
- **Admin web (nginx serving the Vite build):** `http://localhost:3000`

The dev stack overrides the backend command to use `uvicorn` with `--reload`. Point `DATABASE_URL`, `REDIS_URL`, and `MINIO_*` at the Docker service hostnames when running everything in Compose (see `.env.example`).

## Docker — production

Production uses **Gunicorn** with **Uvicorn worker processes**, **DEBUG=false**, and a single **edge nginx** that:

- Proxies **`/api/`** to the backend (FastAPI under `API_V1_PREFIX`, e.g. `/api/v1/...`)
- Proxies **`/uploads/`** to the backend (mounted file storage)
- Proxies **`/`** to the **admin-web** container (static SPA with client-side routing)

Build and run with both compose files:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- **Public entrypoint:** `http://localhost:80` (map host port 80 to nginx)
- **Backend** is not published on the host in the prod overlay (internal only on port 8000)
- **Admin static build** uses an empty `VITE_API_BASE_URL` so the browser calls the same origin; nginx forwards `/api` and `/uploads` to the API

Restart policy on production services is **`unless-stopped`**. Health checks are defined for **backend**, **admin-web**, and **nginx**.

### Operational notes

- Run database migrations before or right after upgrading the backend image (e.g. `alembic upgrade head` inside the backend container or your release pipeline).
- Replace `SECRET_KEY` and MinIO credentials in real deployments; restrict MinIO and Postgres exposure to trusted networks.
- For TLS, terminate HTTPS at a load balancer or add a TLS-enabled reverse proxy in front of this nginx.


## WeChat native mini-program delivery addendum

A new self-contained native WeChat mini-program delivery project was added under `wechat-miniprogram/`.

### Highlights
- Tourist AppID project config for direct import in WeChat DevTools
- Demo mode with local persistence for offline acceptance and walkthroughs
- Self-contained cloud function folders (`cloudfunctions/*/lib`) so deployment does not depend on project-root shared files
- Importable archive generated at `/workspace/wechat-miniprogram.zip`

### Verification notes
- Business engine tests and acceptance scripts live in `wechat-miniprogram/tests/`
- Cloud function packaging risk was removed by vendoring `engine.js`, `seed.js`, and `constants.js` into each cloud function folder

**Modification timestamp:** 2026-04-16 16:15 UTC
