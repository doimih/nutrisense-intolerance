# NutriAID — Installation & Deployment Guide
### Ghid complet de instalare și deployment

---

## Cerințe minime de sistem

| Component | Minim | Recomandat |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker | 24.0+ | Latest |
| Docker Compose | 2.20+ | Latest |
| Node.js (dev local) | 20 LTS | 20 LTS |

---

## 1. Instalare Locală (Development)

### Pas 1: Clonare repository

```bash
git clone <repository-url> nutriaid
cd nutriaid
```

### Pas 2: Instalare dependențe

```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### Pas 3: Configurare variabile de mediu

```bash
# Copiază template-ul
cp .env.example .env
```

Editează `.env` cu valorile tale:

```env
# ─── Site URLs ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_URL=http://localhost:4028
NEXT_PUBLIC_ADMIN_CONSOLE_URL=http://localhost:4028

# ─── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql://nutriaid:nutriaid_pass@localhost:5432/nutriaid_db

# ─── Auth secrets (generează cu: openssl rand -hex 32) ─────
AUTH_SESSION_SECRET=<hex-secret-32-bytes>
SUPERADMIN_SESSION_SECRETS=<hex-secret-32-bytes>

# ─── Superadmin credentials ────────────────────────────────
FRONTEND_SUPERADMIN_EMAIL=admin@example.com
FRONTEND_SUPERADMIN_PASSWORD=<parola-sigura>
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=<parola-sigura>

# ─── AI (OpenAI sau compatibil) ────────────────────────────
AI_PRIMARY_MODEL=gpt-4o
AI_FALLBACK_MODEL=gemini-1.5-pro
AI_API_KEY=sk-...

# ─── Stripe (opțional pentru dev) ─────────────────────────
STRIPE_RESTRICTED_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_PLUS_MONTHLY=price_...

# ─── Internal security ─────────────────────────────────────
INTERNAL_SYNC_SECRET=<hex-secret-32-bytes>
```

### Pas 4: Pornire PostgreSQL local

```bash
docker run -d \
  --name nutriaid-postgres-dev \
  -e POSTGRES_DB=nutriaid_db \
  -e POSTGRES_USER=nutriaid \
  -e POSTGRES_PASSWORD=nutriaid_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

### Pas 5: Rulare migrații DB

```bash
npx drizzle-kit migrate
```

### Pas 6: Pornire în development

```bash
# Ambele aplicații simultan
npm run dev:all

# Sau separat:
npm run dev           # Frontend pe port 3000
cd backend && npm run dev  # Backend pe port 4028
```

---

## 2. Configurare Environment Producție

### Generare secrete

```bash
# Auth session secret
openssl rand -hex 32

# Superadmin session secret
openssl rand -hex 32

# Internal sync secret
openssl rand -hex 32
```

### Variabile de producție

```env
# ─── Site URLs ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://nutriaid.eu
BACKEND_URL=https://backend.nutriaid.eu
NEXT_PUBLIC_ADMIN_CONSOLE_URL=https://backend.nutriaid.eu

# ─── Database ──────────────────────────────────────────────
POSTGRES_DB=nutriaid_prod
POSTGRES_USER=nutriaid_prod
POSTGRES_PASSWORD=<parola-puternica-db>
DATABASE_URL=postgresql://nutriaid_prod:<parola>@nutriaid-postgres:5432/nutriaid_prod

# ─── Auth ──────────────────────────────────────────────────
AUTH_SESSION_SECRET=<64-char-hex>
SUPERADMIN_SESSION_SECRETS=<64-char-hex>
INTERNAL_SYNC_SECRET=<64-char-hex>

# ─── Superadmin ────────────────────────────────────────────
FRONTEND_SUPERADMIN_EMAIL=admin@nutriaid.eu
FRONTEND_SUPERADMIN_PASSWORD=<parola-complexa>
SUPERADMIN_EMAIL=admin@nutriaid.eu
SUPERADMIN_PASSWORD=<parola-complexa>

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

# ─── Opțional: Backup S3 ───────────────────────────────────
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=eu-central-1
AWS_S3_BUCKET=nutriaid-backups
```

---

## 3. Configurare AI

### OpenAI (recomandat pentru producție)

1. Creează cont pe platform.openai.com
2. Generează API key din Settings → API Keys
3. Adaugă în `.env`: `AI_API_KEY=sk-...`
4. Setează `AI_PRIMARY_MODEL=gpt-4o`
5. Adaugă billing limits (recomandat: $50/lună inițial)

### Google Gemini (fallback)

1. Creează proiect pe console.cloud.google.com
2. Activează Generative Language API
3. Generează API key din Credentials
4. Setează `AI_FALLBACK_MODEL=gemini-1.5-pro`
5. Folosește același `AI_API_KEY` sau un key separat

### Configurare din Admin Console (fără restart)

Mergi la `backend.nutriaid.eu → Settings → AI Keys`:
- Primary Model: dropdown (gpt-4o, gpt-4-turbo, etc.)
- Fallback Model: dropdown
- API Key: câmp securizat
- Temperature: slider 0–1
- Max Tokens: slider 512–2048

Modificările sunt aplicate imediat pentru noile cereri.

### Model local (Ollama)

```bash
# Instalare Ollama pe server
curl -fsSL https://ollama.com/install.sh | sh

# Descărcare model
ollama pull llama3

# Configurare în admin
# Orchestrator URL: http://localhost:11434/v1
# Primary Model: llama3
```

---

## 4. Deploy pe VPS (manual, fără Docker)

### Cerințe server
- Ubuntu 22.04 LTS
- Node.js 20 LTS
- PostgreSQL 16
- Nginx sau Caddy

### Pas 1: Instalare Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Pas 2: Instalare PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER nutriaid WITH PASSWORD 'parola';"
sudo -u postgres psql -c "CREATE DATABASE nutriaid_prod OWNER nutriaid;"
```

### Pas 3: Build și deploy

```bash
# Frontend
npm install
npm run build
npm start  # rulează pe port 3000

# Backend
cd backend
npm install
npm run build
npm start  # rulează pe port 4028
```

### Pas 4: Process manager (PM2)

```bash
npm install -g pm2

# Frontend
pm2 start npm --name "nutriaid-frontend" -- start

# Backend
cd backend && pm2 start npm --name "nutriaid-backend" -- start

# Auto-start la reboot
pm2 save && pm2 startup
```

### Pas 5: Nginx reverse proxy

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

## 5. Deploy cu Docker

### Pas 1: Instalare Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Pas 2: Configurare .env

```bash
cp .env.example .env
# editează cu valorile de producție
```

### Pas 3: Build imagini

```bash
docker compose build
```

### Pas 4: Pornire servicii

```bash
docker compose up -d
```

### Pas 5: Rulare migrații

```bash
docker compose exec frontend npx drizzle-kit migrate
```

### Verificare status

```bash
docker compose ps
docker compose logs -f frontend
docker compose logs -f backend
```

### Oprire și restart

```bash
docker compose down           # oprire
docker compose up -d          # pornire
docker compose restart frontend  # restart un serviciu
```

---

## 6. Deploy cu Docker + Traefik (Producție)

### Pas 1: Instalare Traefik

```bash
# Creează rețea Docker pentru Traefik
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

### Pas 2: Deploy NutriAID cu Traefik

```bash
docker compose -f docker-compose.traefik.yml up -d
```

Fișierul `docker-compose.traefik.yml` include label-urile Traefik predefinite:
- Redirect HTTP → HTTPS automat
- Certificate Let's Encrypt automat
- HSTS cu preload
- Headers de securitate

### Pas 3: Verificare HTTPS

```bash
curl -I https://nutriaid.eu
# Așteptat: HTTP/2 200
# Verifică: strict-transport-security header prezent
```

---

## 7. Deploy cu Dokploy

Dokploy este o platformă open-source de self-hosting (alternativă Heroku/Vercel).

### Pas 1: Instalare Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Accesează Dokploy UI la `http://<ip-server>:3000`.

### Pas 2: Creare proiect NutriAID

1. Dashboard → Create Project → "NutriAID"
2. Add Service → Docker Compose
3. Selectează repository sau upload `docker-compose.yml`
4. Configurează Environment Variables din interfață

### Pas 3: Configurare domenii

1. Service Frontend → Domains → Add Domain: `nutriaid.eu`
2. Service Backend → Domains → Add Domain: `backend.nutriaid.eu`
3. Enable SSL (Let's Encrypt automat)

### Pas 4: Deploy

Dokploy Dashboard → Deploy → Start.

Dokploy gestionează automat: rebuild la push, rollback, logs, monitoring.

---

## 8. Scaling

### Vertical scaling (simplu)

Upgrade VPS la mai mult RAM/CPU. Nu necesită modificări în cod.

Recomandat pentru: 0–2.000 utilizatori activi.

### Horizontal scaling (avansat)

Pentru scalare orizontală, trebuie:
1. **PostgreSQL:** Migrare la managed DB (Supabase, Neon, RDS) sau PostgreSQL cu replication
2. **Frontend:** Multiple instanțe în spatele unui load balancer (Traefik sau nginx upstream)
3. **Backend AI:** Multiple instanțe posibile; JSON file store → PostgreSQL store (modificare ~100 linii)
4. **Sessions:** Frontend folosește cookies stateless (JWT) — compatibil cu multiple instanțe

### Estimare capacitate per configurație

| VPS | RAM | Utilizatori simultani | Utilizatori/lună |
|---|---|---|---|
| 2 vCPU, 2 GB | 2 GB | 50 | ~500 |
| 4 vCPU, 4 GB | 4 GB | 200 | ~2.000 |
| 8 vCPU, 8 GB | 8 GB | 500 | ~5.000 |
| Horizontal (3× 4 GB) | 12 GB | 1.500 | ~15.000 |

---

## 9. Backup și Recovery

### Backup PostgreSQL

```bash
# Manual
docker compose exec postgres pg_dump -U nutriaid_prod nutriaid_prod > backup_$(date +%Y%m%d).sql

# Restaurare
docker compose exec -i postgres psql -U nutriaid_prod nutriaid_prod < backup_20260611.sql
```

### Backup date aplicație (JSON store backend)

```bash
# Copierea volumului backend
docker cp nutriaid-backend:/app/data/superadmin-db.json ./backup/

# Restaurare
docker cp ./backup/superadmin-db.json nutriaid-backend:/app/data/
docker compose restart backend
```

### Backup automat cu Hetzner Object Storage

Configurat din Admin Console → Settings → Backup:
- Schedule: zilnic / săptămânal / lunar
- Retenție: 7 / 30 / 90 zile
- Destinație: S3-compatible (Hetzner, AWS, Cloudflare R2)

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
