# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a full-stack e-commerce platform ("ShareSomething") with:
- **Backend**: Python/FastAPI at `/workspace/backend/` (port 8000)
- **Admin Web**: React/Vite at `/workspace/admin-web/` (port 3000)
- **Mobile**: Flutter at `/workspace/mobile/` (optional, needs Flutter SDK)
- **WeChat Mini Program**: at `/workspace/wechat-delivery-app/` (standalone, optional)

### Infrastructure (Docker)

Required services run via Docker Compose from the workspace root:

```bash
# Start infrastructure (Docker daemon must be running first)
sudo dockerd &>/tmp/dockerd.log &
sleep 3
docker compose up -d postgres redis minio
```

- PostgreSQL 15 on port 5432 (user: `postgres`, password: `postgres`, db: `share_something`)
- Redis 7 on port 6379
- MinIO on port 9000 (API) / 9001 (console), credentials: `minioadmin`/`minioadmin`

### Backend

```bash
cd /workspace/backend
# Run migrations (needed after fresh DB)
alembic upgrade head
# Start dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Tests use SQLite in-memory + FakeRedis (no external services needed): `python3 -m pytest tests/ -v`
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Admin Web

```bash
cd /workspace/admin-web
VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 3000
```

- Lint: `npx eslint .`
- Type check: `npx tsc -b`
- Tests: `npm run test`

### Key Gotchas

- Docker daemon must be started manually in cloud VM: `sudo dockerd &>/tmp/dockerd.log &` (wait ~3s before using).
- Docker needs `fuse-overlayfs` storage driver and `iptables-legacy` in the cloud VM (nested container environment).
- Backend config defaults point to `localhost` for all services, matching docker compose port mappings — no `.env` file needed for local dev.
- The `alembic upgrade head` command must run from `/workspace/backend` directory.
- Backend tests (`pytest`) do NOT require running Docker services; they use SQLite in-memory and a FakeRedis stub.
- Admin-web needs `VITE_API_BASE_URL=http://localhost:8000` env var at dev time to connect to the backend (or configure a Vite proxy).
