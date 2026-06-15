# NutriAID — Installation Guide

**FILE PATH:** NutriAID-Acquisition-Portal/Installation-and-Deployment/Installation-Guide.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Installation-Guide.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

This guide covers the complete installation of NutriAID on a fresh Linux server. The platform runs as two Docker containers (frontend + backend) behind a Traefik reverse proxy with automatic TLS. Total installation time for an experienced operator: approximately 30 minutes.

---

## Prerequisites

### Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Network | 100 Mbps | 1 Gbps |

### Required Software

```bash
# Docker Engine 24+
curl -fsSL https://get.docker.com | sh

# Docker Compose v2
docker compose version  # must be 2.x

# Git
apt-get install -y git

# (Optional) Node.js 20+ for local development
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### Required External Services

| Service | Purpose | Required |
|---|---|---|
| Domain name (e.g. nutriaid.eu) | TLS + routing | Yes |
| PostgreSQL 15+ | User data | Yes (can be Docker) |
| OpenAI API key | AI workers | Yes (or compatible) |
| Stripe account | Billing | Yes (test keys work) |
| SendGrid / SES / SMTP | Email delivery | Yes |
| Google reCAPTCHA v3 | Bot protection | Recommended |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/nutriaid.git /opt/nutriaid
cd /opt/nutriaid
```

The repository contains:

```
/opt/nutriaid/
├── app/                  # Next.js 14 frontend
├── backend/              # Next.js 15 backend admin
├── docker-compose.yml    # Production compose file
├── traefik/              # Traefik configuration
│   ├── traefik.yml
│   └── dynamic/
└── .env.example          # Environment template
```

---

## Step 2 — Configure Environment Variables

### Frontend (`app/.env.production`)

```bash
cp app/.env.example app/.env.production
nano app/.env.production
```

```env
# Application
NEXT_PUBLIC_APP_URL=https://nutriaid.eu
NODE_ENV=production

# Database
DATABASE_URL=postgresql://nutriaid:password@postgres:5432/nutriaid

# JWT Session (generate: openssl rand -base64 32)
JWT_SECRET=your-64-char-random-secret

# Internal API sync (shared with backend)
INTERNAL_SYNC_SECRET=your-32-char-random-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@nutriaid.eu
EMAIL_FROM_NAME=NutriAID

# reCAPTCHA
RECAPTCHA_SECRET_KEY=6L...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6L...

# TOTP Encryption
TOTP_ENCRYPTION_KEY=your-32-char-random-key
```

### Backend (`backend/.env.production`)

```bash
cp backend/.env.example backend/.env.production
nano backend/.env.production
```

```env
# Application
NEXT_PUBLIC_BACKEND_URL=https://backend.nutriaid.eu
NODE_ENV=production

# JWT Session (different from frontend)
JWT_SECRET=your-other-64-char-random-secret

# Frontend internal URL (Docker internal network)
FRONTEND_INTERNAL_URL=http://frontend:3000

# Internal API sync (same as frontend)
INTERNAL_SYNC_SECRET=your-32-char-random-secret

# AI Brain defaults
AI_PRIMARY_MODEL=gpt-4o
AI_FALLBACK_MODEL=gpt-4o-mini
AI_API_KEY=sk-...
```

---

## Step 3 — Configure DNS

Point the following DNS A records to your server's public IP:

```
nutriaid.eu          A  <server-ip>
www.nutriaid.eu      A  <server-ip>
backend.nutriaid.eu  A  <server-ip>
```

Traefik will automatically obtain and renew Let's Encrypt certificates once DNS propagates.

---

## Step 4 — Configure Traefik

```bash
# Create the Docker network Traefik uses
docker network create traefik-public

# Create the ACME certificate store
touch traefik/acme.json
chmod 600 traefik/acme.json
```

Edit `traefik/traefik.yml` and set your Let's Encrypt email:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@nutriaid.eu   # ← your email
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

---

## Step 5 — Configure Docker Compose

The default `docker-compose.yml` includes all services. Review and adjust:

```yaml
services:
  traefik:
    image: traefik:v3.0
    # ...

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: nutriaid
      POSTGRES_USER: nutriaid
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  frontend:
    build:
      context: ./app
      dockerfile: Dockerfile
    env_file: ./app/.env.production
    volumes:
      - frontend_data:/app/data
    labels:
      - "traefik.http.routers.frontend.rule=Host(`nutriaid.eu`) || Host(`www.nutriaid.eu`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file: ./backend/.env.production
    volumes:
      - backend_data:/app/data
    labels:
      - "traefik.http.routers.backend.rule=Host(`backend.nutriaid.eu`)"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

volumes:
  postgres_data:
  frontend_data:
  backend_data:
```

---

## Step 6 — Build and Start

```bash
cd /opt/nutriaid

# Build all images
docker compose build

# Start all services
docker compose up -d

# Verify all containers are running
docker compose ps
```

Expected output:

```
NAME        STATUS      PORTS
traefik     Up          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
postgres    Up          5432/tcp
frontend    Up          3000/tcp
backend     Up          3001/tcp
```

---

## Step 7 — Run Database Migrations

```bash
# Run Drizzle migrations inside the frontend container
docker compose exec frontend npm run db:migrate
```

---

## Step 8 — Create Superadmin Account

On first start, the backend seeds a default superadmin:

```json
{
  "email": "admin@nutriaid.eu",
  "password": "ChangeMe123!"
}
```

**Immediately change the password:**

1. Visit `https://backend.nutriaid.eu/admin`
2. Log in with the default credentials
3. Go to Settings → Security → Change Password
4. Set a strong password and enable TOTP

---

## Step 9 — Verify Installation

| Check | URL | Expected |
|---|---|---|
| Frontend | `https://nutriaid.eu` | Landing page loads |
| Backend admin | `https://backend.nutriaid.eu/admin` | Login page loads |
| AI Test Lab | `https://backend.nutriaid.eu/admin/ai-test-lab` | Platform tab shows all green |
| TLS certificate | Browser padlock | Valid, Let's Encrypt |

---

## Troubleshooting

### Containers not starting

```bash
docker compose logs frontend
docker compose logs backend
```

### Database connection failed

```bash
# Verify PostgreSQL is reachable from the frontend container
docker compose exec frontend npx drizzle-kit check
```

### TLS certificate not issued

- Verify DNS propagation: `dig nutriaid.eu A`
- Check Traefik logs: `docker compose logs traefik`
- Ensure port 80 is open for the ACME HTTP challenge

### Email not sending

Go to Settings → Email in the admin console and use the "Send test email" button.

---

*NutriAID Acquisition Portal — Confidential — June 2026*
