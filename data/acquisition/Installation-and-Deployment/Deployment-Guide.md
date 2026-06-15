# NutriAID — Deployment Guide

**FILE PATH:** NutriAID-Acquisition-Portal/Installation-and-Deployment/Deployment-Guide.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Deployment-Guide.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

This guide covers the production deployment architecture of NutriAID and the procedures for deploying updates, rolling back, and managing runtime configuration. The platform uses a Docker + Traefik stack with separate service volumes and automated TLS.

---

## Deployment Architecture

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  Traefik (reverse proxy + TLS)          │
│  Port 80 (redirect) + Port 443 (HTTPS)  │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│  Frontend    │  │  Backend         │
│  Next.js 14  │  │  Next.js 15      │
│  :3000       │  │  :3001           │
│  nutriaid.eu │  │  backend.        │
│              │  │  nutriaid.eu     │
└──────┬───────┘  └──────┬───────────┘
       │                 │
       │  ┌──────────────┘
       │  │
       ▼  ▼
┌──────────────┐
│  PostgreSQL  │
│  :5432       │
└──────────────┘

Volumes:
  frontend_data  → /app/data  (frontend-only: acquisition logs, app data)
  backend_data   → /app/data  (backend-only: superadmin-db.json)
  postgres_data  → PostgreSQL data directory
```

---

## Service Topology

| Service | Image | Internal Port | Public Domain |
|---|---|---|---|
| `traefik` | traefik:v3.0 | 80, 443 | (proxy only) |
| `postgres` | postgres:15-alpine | 5432 | (internal only) |
| `frontend` | custom build | 3000 | nutriaid.eu |
| `backend` | custom build | 3001 | backend.nutriaid.eu |

---

## Deploying Updates

### Full Deployment (with downtime < 5 seconds)

```bash
cd /opt/nutriaid

# 1. Pull latest code
git pull origin main

# 2. Rebuild affected images
docker compose build frontend backend

# 3. Restart with zero-downtime (Traefik buffers in-flight requests)
docker compose up -d --no-deps frontend backend

# 4. Apply any new migrations
docker compose exec frontend npm run db:migrate

# 5. Verify health
docker compose ps
curl -I https://nutriaid.eu
curl -I https://backend.nutriaid.eu/admin
```

### Frontend-Only Update

```bash
docker compose build frontend
docker compose up -d --no-deps frontend
```

### Backend-Only Update

```bash
docker compose build backend
docker compose up -d --no-deps backend
```

---

## Environment Variable Updates

Environment variables are loaded from `.env.production` files at container start. To update:

```bash
# Edit the env file
nano app/.env.production

# Restart only the affected service (30-second downtime window)
docker compose up -d --no-deps frontend
```

**Hot-reloadable settings** (no restart required):
- AI Brain model, temperature, max tokens
- Per-worker prompts and enable/disable toggles
- Global system prompt
- reCAPTCHA threshold
- Platform name and colours

These are stored in `data/superadmin-db.json` and read at request time.

---

## Database Migrations

```bash
# Generate a new migration after schema changes
docker compose exec frontend npm run db:generate

# Apply pending migrations (safe to run on live DB — Drizzle uses transactions)
docker compose exec frontend npm run db:migrate

# Inspect current schema state
docker compose exec frontend npm run db:studio
```

**Migration safety:** Drizzle ORM wraps each migration in a transaction. If a migration fails, the database rolls back automatically.

---

## Backup Procedures

### PostgreSQL Backup

```bash
# Full database dump
docker compose exec postgres pg_dump -U nutriaid nutriaid > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U nutriaid nutriaid < backup-20260612.sql
```

Recommended: automate with a daily cron job or use a managed PostgreSQL provider (Supabase, Neon, Railway).

### JSON Store Backup

```bash
# Backend admin state
docker compose cp backend:/app/data/superadmin-db.json ./backup-superadmin-$(date +%Y%m%d).json

# Frontend acquisition log
docker compose cp frontend:/app/data/acquisition-downloads.json ./backup-acquisition-$(date +%Y%m%d).json
```

---

## Rollback Procedure

```bash
# Tag the current working image before deploying
docker tag nutriaid-frontend:latest nutriaid-frontend:stable
docker tag nutriaid-backend:latest nutriaid-backend:stable

# If deployment fails, restore
docker compose down frontend backend
docker tag nutriaid-frontend:stable nutriaid-frontend:latest
docker tag nutriaid-backend:stable nutriaid-backend:latest
docker compose up -d frontend backend
```

---

## Monitoring and Logs

### Container Logs

```bash
# Real-time logs (all services)
docker compose logs -f

# Frontend only
docker compose logs -f frontend

# Last 100 lines of backend
docker compose logs --tail=100 backend
```

### Health Checks

```bash
# Frontend
curl https://nutriaid.eu/api/health

# Backend
curl https://backend.nutriaid.eu/api/health
```

**Expected response:**
```json
{ "status": "ok", "timestamp": "2026-06-12T10:00:00Z" }
```

### AI Test Lab Platform Check

Access `https://backend.nutriaid.eu/admin/ai-test-lab` → Platform tab.

Checks connectivity for: AI API, PostgreSQL, email, Stripe, and frontend internal API.

---

## TLS Certificate Management

Certificates are managed automatically by Traefik + Let's Encrypt:

- Issued on first request after DNS propagation
- Renewed automatically 30 days before expiry
- Stored in `traefik/acme.json` (bind-mounted, not a Docker volume)

```bash
# Verify certificate validity
openssl s_client -connect nutriaid.eu:443 -servername nutriaid.eu < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## CI/CD Integration

### GitHub Actions (example workflow)

```yaml
name: Deploy NutriAID

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/nutriaid
            git pull origin main
            docker compose build frontend backend
            docker compose up -d --no-deps frontend backend
            docker compose exec -T frontend npm run db:migrate
```

---

## Production Checklist

- [ ] All environment variables set (no `.env.example` values remain)
- [ ] PostgreSQL password is strong and not default
- [ ] Superadmin default password changed
- [ ] Superadmin TOTP 2FA enabled
- [ ] JWT secrets are unique per service and at least 64 characters
- [ ] INTERNAL_SYNC_SECRET is identical in both services
- [ ] Stripe webhooks configured and secret set
- [ ] DNS records pointed and propagated
- [ ] TLS certificates issued and valid
- [ ] Backups configured and tested
- [ ] AI Test Lab Platform tab shows all green

---

*NutriAID Acquisition Portal — Confidential — June 2026*
