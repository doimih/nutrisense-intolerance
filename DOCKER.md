Docker setup for NutriAID (frontend + backend)

1) Prerequisites
- Docker Desktop / Docker Engine installed
- Docker Compose v2 available

2) Environment
- Copy docker.env.example to .env in project root
- Set BACKEND_URL for your environment
- For Traefik deployment, also set TRAEFIK_HOST/TRAEFIK_NETWORK/TRAEFIK_CERTRESOLVER

Local example:
BACKEND_URL=http://localhost:4028

Production example:
BACKEND_URL=https://api.your-domain.com

3) Build images
- docker compose build

4) Start containers
- docker compose up -d

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:4028
- Frontend redirect to backend: http://localhost:3000/backend

5) Stop containers
- docker compose down

6) Logs
- docker compose logs -f frontend
- docker compose logs -f backend

7) Rebuild after code changes
- docker compose up -d --build

8) Traefik deployment (without touching other services)
- This repo includes a dedicated file: docker-compose.traefik.yml
- It is standalone for server usage (no host port publishing), so it will not occupy ports used by other services.
- Required env vars in .env:
	- TRAEFIK_HOST=nustrisense-i.eu
	- TRAEFIK_HOST_ALT=nutriaid.eu
	- TRAEFIK_NETWORK=traefik
	- TRAEFIK_CERTRESOLVER=letsencrypt
	- TRAEFIK_ENTRYPOINT_HTTP=web,http
	- TRAEFIK_ENTRYPOINT_HTTPS=websecure,https
- SSL behavior in this setup:
	- HTTP (entrypoint web) is redirected to HTTPS
	- HTTPS (entrypoint websecure) uses Traefik certresolver for Let's Encrypt

Run with Traefik:
- docker compose -f docker-compose.traefik.yml up -d --build

Optional check:
- docker compose -f docker-compose.traefik.yml config

SSL prerequisites on the Traefik server:
- DNS A/AAAA for nustrisense-i.eu must point to the Traefik host
- Traefik must expose entrypoints `web` (:80) and `websecure` (:443)
- Traefik must have the certresolver configured with the same name as TRAEFIK_CERTRESOLVER

Quick SSL validation after deploy:
- curl -I http://nustrisense-i.eu
- curl -I https://nustrisense-i.eu

If you still get 404 from Traefik:
- Confirm the requested domain matches TRAEFIK_HOST or TRAEFIK_HOST_ALT
- Confirm Traefik entrypoint names match TRAEFIK_ENTRYPOINT_HTTP/HTTPS
- Confirm this container is on the same Docker network as Traefik (TRAEFIK_NETWORK)
