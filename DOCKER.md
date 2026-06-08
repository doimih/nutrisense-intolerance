Docker setup for NutriAID (frontend + backend)

1) Prerequisites
- Docker Desktop / Docker Engine installed
- Docker Compose v2 available

2) Environment
- Copy docker.env.example to .env in project root
- Set BACKEND_URL for your environment

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
