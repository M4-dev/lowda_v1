Docker setup for local MongoDB (replica-set) — WindowShop

This project includes a `docker-compose.yml` that runs a local single-node MongoDB replica set (`rs0`) suitable for local development with Prisma.

Files added:
- `docker-compose.yml` — runs `mongo` and a short `mongo-init` job which calls `rs.initiate()`.
- `scripts/start-mongo.ps1` — PowerShell helper to bring up the compose stack and show logs.

Prerequisites
- Docker Desktop for Windows installed and running (https://www.docker.com/products/docker-desktop).
- Optionally `mongosh` installed, or use the `mongosh` bundled in the `mongo` image via `docker compose exec`.

Quick start (PowerShell)
1. From project root, start Docker Desktop.
2. Run the helper script (make sure you run PowerShell as a normal user; Administrator not required for Docker Desktop):

```powershell
Set-Location 'C:\Users\olaba\Desktop\millionare-ecom-lifeplan'
.
\scripts\start-mongo.ps1
```

3. Verify replica set status:

```powershell
mongosh --host 127.0.0.1 --port 27017 --eval "rs.status()"
```

You can also check the init logs:

```powershell
docker compose logs mongo-init
```

4. When `rs.status()` shows a `PRIMARY`, run Prisma schema push:

```powershell
npx prisma db push
```

Notes
- If Docker CLI is not available, you can install Docker Desktop on Windows using:

```powershell
# Using winget (Windows 10/11 with App Installer)
winget install --id Docker.DockerDesktop -e
```

Follow the Docker Desktop installer, then sign-in/start Docker Desktop before running `docker compose`.

- Alternative (no Docker): you can run `mongod` directly on the host with `--replSet rs0` and then run `rs.initiate()` in `mongosh`. If you choose this path, make sure the Windows `MongoDB` service is stopped so it doesn't clash with the manual `mongod`.

- Production: use a managed DB (MongoDB Atlas) and set `DATABASE_URL` in Vercel to the Atlas connection string. Do NOT run MongoDB in Vercel.

If you want, I can:
- Try to install Docker via `winget` from here (requires that `winget` and elevated permissions are available), or
- Provide step-by-step screenshots/commands for manual Docker Desktop installation.
