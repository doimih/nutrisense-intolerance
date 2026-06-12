# NutriAID — Installation & Deployment Guide
### Complete installation and deployment guide

---

## Minimum System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker | 24.0+ | Latest |
| Docker Compose | 2.20+ | Latest |
| Node.js (local dev) | 20 LTS | 20 LTS |

---

## 1. Local Installation (Development)

### Step 1: Clone repository

```bash
git clone <repository-url> nutriaid
cd nutriaid
```

### Step 2: Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### Step 3: Configure environment variables

```bash
# Copy the template
cp .env.example .env
```

Edit `.env` with your values:

```env
# ─── Site URLs ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_URL=http://localhost:4028
NEXT_PUBLIC_ADMIN_CONSOLE_URL=http://localhost:4028

# ─── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql://nutriaid:nutriaid_pass@localhost:5432/nutriaid_db

# ─── Auth secrets (generate with: openssl rand -hex 32) ────
AUTH_SESSION_SECRET=<hex-secret-32-bytes>
SUPERADMIN_SESSION_SECRETS=<hex-secret-32-bytes>

# ─── Superadmin credentials ────────────────────────────────
FRONTEND_SUPERADMIN_EMAIL=admin@example.com
FRONTEND_SUPERADMIN_PASSWORD=<secure-password>
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=<secure-password>

# ─── AI (OpenAI or compatible) ────────────────────────────
AI_PRIMARY_MODEL=gpt-4o
AI_FALLBACK_MODEL=gemini-1.5-pro
AI_API_KEY=sk-...

# ─── Stripe (optional for dev) ─────────────────────────────
STRIPE_RESTRICTED_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_PLUS_MONTHLY=price_...

# ─── Internal security ─────────────────────────────────────
INTERNAL_SYNC_SECRET=<hex-secret-32-bytes>
```

### Step 4: Start local PostgreSQL

```bash
docker run -d \
  --name nutriaid-postgres-dev \
  -e POSTGRES_DB=nutriaid_db \
  -e POSTGRES_USER=nutriaid \
  -e POSTGRES_PASSWORD=nutriaid_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

### Step 5: Run DB migrations

```bash
npx drizzle-kit migrate
```

### Step 6: Start in development

```bash
# Both apps simultaneously
npm run dev:all

# Or separately:
npm run dev           # Frontend on port 3000
cd backend && npm run dev  # Backend on port 4028
```

---

## 2. Production Environment Configuration

### Generate secrets

```bash
# Auth session secret
openssl rand -hex 32

# Superadmin session secret
openssl rand -hex 32

# Internal sync secret
openssl rand -hex 32
```

### Production variables

```env
# ─── Site URLs ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://nutriaid.eu
BACKEND_URL=https://backend.nutriaid.eu
NEXT_PUBLIC_ADMIN_CONSOLE_URL=https://backend.nutriaid.eu

# ─── Database ──────────────────────────────────────────────
POSTGRES_DB=nutriaid_prod
POSTGRES_USER=nutriaid_prod
POSTGRES_PASSWORD=<strong-db-password>
DATABASE_URL=postgresql://nutriaid_prod:<password>@nutriaid-postgres:5432/nutriaid_prod

# ─── Auth ──────────────────────────────────────────────────
AUTH_SESSION_SECRET=<64-char-hex>
SUPERADMIN_SESSION_SECRETS=<64-char-hex>
INTERNAL_SYNC_SECRET=<64-char-hex>

# ─── Superadmin ────────────────────────────────────────────
FRONTEND_SUPERADMIN_EMAIL=admin@nutriaid.eu
FRONTEND_SUPERADMIN_PASSWORD=<complex-password>
SUPERADMIN_EMAIL=admin@nutriaid.eu
SUPERADMIN_PASSWORD=<complex-password>

# ─── AI ────────────────────────────────────────────────────
AI_PRIMARY_MODEL=gpt-4o
AI_FALLBACK_MODEL=gemini-1.5-pro
AI_API_KEY=<openai-api-key>

# ─── Stripe ────────────────────────────────────────────────
STRIPE_RESTRICTED_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_PLUS_MONTHLY=price_...

# ─── Traefik ───────────────────────────────────────────────
TRAEFIK_HOST=nutriaid.eu
TRAEFIK_NETWORK=traefik
TRAEFIK_CERTRESOLVER=letsencrypt

# ─── Optional: S3 Backup ───────────────────────────────────
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=eu-central-1
AWS_S3_BUCKET=nutriaid-backups
```

---

## 3. AI Configuration

### OpenAI (recommended for production)

1. Create an account at platform.openai.com
2. Generate API key from Settings → API Keys
3. Add to `.env`: `AI_API_KEY=sk-...`
4. Set `AI_PRIMARY_MODEL=gpt-4o`
5. Add billing limits (recommended: $50/month initial)

### Google Gemini (fallback)

1. Create project at console.cloud.google.com
2. Enable Generative Language API
3. Generate API key from Credentials
4. Set `AI_FALLBACK_MODEL=gemini-1.5-pro`
5. Use the same `AI_API_KEY` or a separate key

### Configuration from Admin Console (without restart)

Go to `backend.nutriaid.eu → Settings → AI Keys`:
- Primary Model: dropdown (gpt-4o, gpt-4-turbo, etc.)
- Fallback Model: dropdown
- API Key: secure field
- Temperature: slider 0–1
- Max Tokens: slider 512–2048

Changes apply immediately for new requests.

### Local model (Ollama)

```bash
# Install Ollama on server
curl -fsSL https://ollama.com/install.sh | sh

# Download model
ollama pull llama3

# Configure in admin
# Orchestrator URL: http://localhost:11434/v1
# Primary Model: llama3
```

---

## 4. Deploy on VPS (manual, without Docker)

### Server requirements
- Ubuntu 22.04 LTS
- Node.js 20 LTS
- PostgreSQL 16
- Nginx or Caddy

### Step 1: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER nutriaid WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE nutriaid_prod OWNER nutriaid;"
```

### Step 3: Build and deploy

```bash
# Frontend
npm install
npm run build
npm start  # runs on port 3000

# Backend
cd backend
npm install
npm run build
npm start  # runs on port 4028
```

### Step 4: Process manager (PM2)

```bash
npm install -g pm2

# Frontend
pm2 start npm --name "nutriaid-frontend" -- start

# Backend
cd backend && pm2 start npm --name "nutriaid-backend" -- start

# Auto-start on reboot
pm2 save && pm2 startup
```

### Step 5: Nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name nutriaid.eu;

    ssl_certificate /etc/letsencrypt/live/nutriaid.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nutriaid.eu/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name backend.nutriaid.eu;

    ssl_certificate /etc/letsencrypt/live/backend.nutriaid.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.nutriaid.eu/privkey.pem;

    location / {
        proxy_pass http://localhost:4028;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Deploy with Docker

### Step 1: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Configure .env

```bash
cp .env.example .env
# edit with production values
```

### Step 3: Build images

```bash
docker compose build
```

### Step 4: Start services

```bash
docker compose up -d
```

### Step 5: Run migrations

```bash
docker compose exec frontend npx drizzle-kit migrate
```

### Check status

```bash
docker compose ps
docker compose logs -f frontend
docker compose logs -f backend
```

### Stop and restart

```bash
docker compose down           # stop
docker compose up -d          # start
docker compose restart frontend  # restart a service
```

---

## 6. Deploy with Docker + Traefik (Production)

### Step 1: Install Traefik

```bash
# Create Docker network for Traefik
docker network create traefik

# traefik.yml
mkdir -p /opt/traefik/config
cat > /opt/traefik/traefik.yml << EOF
api:
  dashboard: true
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
  websecure:
    address: ":443"
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@nutriaid.eu
      storage: /acme.json
      httpChallenge:
        entryPoint: web
providers:
  docker:
    exposedByDefault: false
    network: traefik
EOF

docker run -d \
  --name traefik \
  --network traefik \
  -p 80:80 -p 443:443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/traefik/traefik.yml:/traefik.yml \
  -v /opt/traefik/acme.json:/acme.json \
  traefik:v2.11
```

### Step 2: Deploy NutriAID with Traefik

```bash
docker compose -f docker-compose.traefik.yml up -d
```

The `docker-compose.traefik.yml` file includes predefined Traefik labels:
- Automatic HTTP → HTTPS redirect
- Automatic Let's Encrypt certificates
- HSTS with preload
- Security headers

### Step 3: Verify HTTPS

```bash
curl -I https://nutriaid.eu
# Expected: HTTP/2 200
# Check: strict-transport-security header present
```

---

## 7. Deploy with Dokploy

Dokploy is an open-source self-hosting platform (Heroku/Vercel alternative).

### Step 1: Install Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Access the Dokploy UI at `http://<server-ip>:3000`.

### Step 2: Create NutriAID project

1. Dashboard → Create Project → "NutriAID"
2. Add Service → Docker Compose
3. Select repository or upload `docker-compose.yml`
4. Configure Environment Variables from interface

### Step 3: Configure domains

1. Service Frontend → Domains → Add Domain: `nutriaid.eu`
2. Service Backend → Domains → Add Domain: `backend.nutriaid.eu`
3. Enable SSL (Let's Encrypt automatic)

### Step 4: Deploy

Dokploy Dashboard → Deploy → Start.

Dokploy automatically handles: rebuild on push, rollback, logs, monitoring.

---

## 8. Scaling

### Vertical scaling (simple)

Upgrade VPS to more RAM/CPU. No code changes required.

Recommended for: 0–2,000 active users.

### Horizontal scaling (advanced)

For full horizontal scaling, required:
1. **PostgreSQL:** Migrate to managed DB (Supabase, Neon, RDS) or PostgreSQL with replication
2. **Frontend:** Multiple instances behind a load balancer (Traefik or nginx upstream)
3. **Backend AI:** Multiple instances possible; JSON file store → PostgreSQL store (change ~100 lines)
4. **Sessions:** Frontend uses stateless cookies (JWT) — compatible with multiple instances

### Capacity estimate per configuration

| VPS | RAM | Concurrent users | Monthly users |
|---|---|---|---|
| 2 vCPU, 2 GB | 2 GB | 50 | ~500 |
| 4 vCPU, 4 GB | 4 GB | 200 | ~2,000 |
| 8 vCPU, 8 GB | 8 GB | 500 | ~5,000 |
| Horizontal (3× 4 GB) | 12 GB | 1,500 | ~15,000 |

---

## 9. Backup and Recovery

### PostgreSQL Backup

```bash
# Manual
docker compose exec postgres pg_dump -U nutriaid_prod nutriaid_prod > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -i postgres psql -U nutriaid_prod nutriaid_prod < backup_20260611.sql
```

### Application Data Backup (backend JSON store)

```bash
# Copy backend volume
docker cp nutriaid-backend:/app/data/superadmin-db.json ./backup/

# Restore
docker cp ./backup/superadmin-db.json nutriaid-backend:/app/data/
docker compose restart backend
```

### Automatic Backup with Hetzner Object Storage

Configured from Admin Console → Settings → Backup:
- Schedule: daily / weekly / monthly
- Retention: 7 / 30 / 90 days
- Destination: S3-compatible (Hetzner, AWS, Cloudflare R2)

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
