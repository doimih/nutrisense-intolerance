# NutriAID — Scaling Guide

**FILE PATH:** NutriAID-Acquisition-Portal/Installation-and-Deployment/Scaling-Guide.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Scaling-Guide.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

NutriAID is built for horizontal and vertical scalability. The platform is stateless at the application layer — session state lives in JWT cookies, and all persistent state is in PostgreSQL or Docker volumes. This document describes scaling strategies from a single-server setup to a multi-region, enterprise-grade deployment.

---

## Scaling Tiers

### Tier 1 — Single Server (Current Default)

```
1 VPS (4 vCPU / 8 GB RAM)
  ├── Traefik
  ├── Frontend (1 instance)
  ├── Backend (1 instance)
  └── PostgreSQL (local)

Capacity: ~500 concurrent users, ~5,000 monthly active users
```

This is the reference architecture documented in the Installation Guide.

---

### Tier 2 — Optimised Single Server

Add resources without changing architecture:

```
1 VPS (8 vCPU / 16 GB RAM)
  ├── Traefik
  ├── Frontend (2 replicas — Docker Compose scale)
  ├── Backend (1 instance — admin panel, low traffic)
  └── PostgreSQL (local, tuned)

Capacity: ~2,000 concurrent users, ~20,000 MAU
```

**Scale frontend replicas:**
```bash
docker compose up -d --scale frontend=2
```

**PostgreSQL tuning** for 16 GB RAM (`postgresql.conf`):
```
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 20MB
```

---

### Tier 3 — Managed Database + Multiple App Servers

```
Load Balancer (e.g. Hetzner LB, AWS ALB)
  ├── App Server 1 (Traefik + Frontend + Backend)
  ├── App Server 2 (Traefik + Frontend + Backend)
  └── Managed PostgreSQL (Supabase / Neon / RDS)

Capacity: ~10,000 concurrent users, ~100,000 MAU
```

**Required changes for multi-server:**
1. Move PostgreSQL to a managed service
2. Move `data/acquisition-downloads.json` to a shared storage volume (NFS, S3) or migrate tracking to the database
3. Ensure `INTERNAL_SYNC_SECRET` is identical across all app servers

---

### Tier 4 — Kubernetes / Enterprise

```
Kubernetes cluster (e.g. GKE, EKS, k3s)
  ├── frontend Deployment (3+ replicas, HPA)
  ├── backend Deployment (2 replicas)
  ├── Ingress Controller (Traefik or NGINX)
  ├── PostgreSQL (managed: Cloud SQL, RDS, or Supabase)
  └── Redis (optional: rate limiting, session store)

Capacity: Unlimited (scales with cluster)
```

---

## Stateless Architecture

The frontend and backend are fully stateless at the process level:

| State | Storage | Scaling implication |
|---|---|---|
| User sessions | JWT cookies (client-side) | None — no shared session store needed |
| User data | PostgreSQL | Scale the database, not the app |
| Admin config | `superadmin-db.json` (volume) | Single backend replica, or move to DB |
| Acquisition logs | `acquisition-downloads.json` (volume) | Move to DB for multi-server |
| AI model calls | OpenAI API (external) | Scale via API key rate limits |
| File uploads | Docker volume | Move to S3 for multi-server |

---

## AI API Scaling

The primary scaling constraint for the AI guidance feature is the OpenAI API rate limit.

### Rate Limit Strategies

| Strategy | Implementation |
|---|---|
| Per-user hourly limit | `MAX_REQUESTS_PER_HOUR` env variable |
| Queue AI requests | Add a Redis-backed job queue (Bull/BullMQ) |
| Use multiple API keys | Rotate keys per request using a key pool |
| Use cheaper workers | Route low-stakes workers to `gpt-4o-mini` |
| Enable stub mode | Disable AI API key for demo/dev servers |

### Cost Estimation by Scale

| MAU | Avg requests/user/day | Monthly AI API cost (est.) |
|---|---|---|
| 1,000 | 3 | ~$150 |
| 5,000 | 3 | ~$750 |
| 20,000 | 3 | ~$3,000 |
| 100,000 | 3 | ~$15,000 |

*Estimates based on GPT-4o pricing at $5/1M input tokens, $15/1M output tokens, average 6 workers per request.*

The rule-based auto-corrector (no AI cost) significantly reduces correction API spend.

---

## Database Scaling

### Connection Pooling

For Tier 3+, add PgBouncer in front of PostgreSQL:

```bash
docker run -d \
  --name pgbouncer \
  -e DATABASE_URL="postgresql://nutriaid:password@postgres:5432/nutriaid" \
  -e POOL_MODE=transaction \
  -e MAX_CLIENT_CONN=1000 \
  bitnami/pgbouncer
```

Update `DATABASE_URL` in frontend env to point to PgBouncer.

### Read Replicas

For read-heavy workloads (monitoring journal queries, analytics):

```env
DATABASE_URL=postgresql://primary:5432/nutriaid
DATABASE_READ_URL=postgresql://replica:5432/nutriaid
```

Drizzle ORM supports separate read/write connections natively.

---

## CDN and Static Assets

For Tier 2+, serve Next.js static assets via CDN:

```nginx
# Cloudflare: cache all /_next/static/* assets
Cache-Control: public, max-age=31536000, immutable
```

The acquisition portal page and all document download links benefit from Cloudflare's global edge network.

---

## Monitoring at Scale

| Tool | Purpose |
|---|---|
| Docker stats | Per-container CPU/RAM |
| Traefik dashboard | Request rate, error rate, latency |
| Grafana + Prometheus | Long-term metrics, alerting |
| Sentry | Application error tracking |
| Uptime Robot / BetterStack | External availability monitoring |

**Recommended alert thresholds:**

| Metric | Warning | Critical |
|---|---|---|
| CPU usage | > 70% | > 90% |
| Memory usage | > 75% | > 90% |
| PostgreSQL connections | > 80% of max | > 95% of max |
| AI API error rate | > 5% | > 20% |
| Response time (P95) | > 2,000ms | > 5,000ms |

---

## Migration Path to Managed PostgreSQL

Migrating from a local Docker PostgreSQL to a managed service (e.g. Supabase):

```bash
# 1. Dump current database
docker compose exec postgres pg_dump -U nutriaid nutriaid > migration.sql

# 2. Update DATABASE_URL in app/.env.production to managed service URL

# 3. Import dump to managed service
psql "postgresql://user:pass@db.supabase.co:5432/postgres" < migration.sql

# 4. Run migrations to ensure schema is up-to-date
docker compose exec frontend npm run db:migrate

# 5. Stop local postgres service
docker compose stop postgres
```

---

*NutriAID Acquisition Portal — Confidential — June 2026*
