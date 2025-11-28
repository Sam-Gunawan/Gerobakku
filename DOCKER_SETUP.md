# 🐳 Docker Setup Guide - Gerobakku

This guide will help you run the Gerobakku application using Docker Compose.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- At least 4GB of free disk space

## Quick Start (3 Steps)

### 1. Clone and Navigate to the Project

```bash
git clone <repository-url>
cd Gerobakku
```

### 2. Create Environment File

Copy the example environment file and customize if needed:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On macOS/Linux
cp .env.example .env
```

**Optional:** Edit `.env` file to change database credentials or ports.

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

That's it! 🎉

## Access the Application

Once all containers are running:

- **Frontend (Angular)**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432 (if you need to connect directly)

## Useful Docker Commands

### View Running Containers

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop the Application

```bash
# Stop containers but keep data
docker-compose stop

# Stop and remove containers (data in volumes is preserved)
docker-compose down

# Stop, remove containers, AND delete all data
docker-compose down -v
```

### Restart a Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend
```

## Environment Variables Explained

The `.env` file contains the following variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `DB_USER` | Database username | `gerobakku_admin` |
| `DB_PASS` | Database password | `admin123` |
| `DB_HOST` | Database host (container name) | `db` |
| `DB_PORT` | Database port (internal) | `5432` |
| `DB_DATABASE` | Database name | `gerobakku_db` |
| `BACKEND_PORT` | Backend port on host machine | `8000` |
| `FRONTEND_PORT` | Frontend port on host machine | `4200` |
| `POSTGRES_EXTERNAL_PORT` | PostgreSQL port on host machine | `5434` |

> **Note:** The `.env` file is gitignored and will not be committed to the repository. Always use `.env.example` as a template.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│             Docker Compose Network              │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐         │
│  │   Frontend   │─────>│   Backend    │         │
│  │   (nginx)    │      │  (FastAPI)   │         │
│  │   Port 80    │      │  Port 8000   │         │
│  └──────────────┘      └──────┬───────┘         │
│         │                     │                 │
│         │                     ▼                 │
│         │              ┌──────────────┐         │
│         │              │  PostgreSQL  │         │
│         │              │   Port 5432  │         │
│         │              └──────────────┘         │
└─────────│───────────────────────────────────────┘
          │
          ▼
   Host: localhost:4200
```

## Health Checks

All services have health checks configured:

- **Database**: Checks if PostgreSQL is ready to accept connections
- **Backend**: Checks the `/health` endpoint
- **Frontend**: Checks if nginx is serving content

You can see health status with:

```bash
docker-compose ps
```

## Troubleshooting

### Port Already in Use

If you get an error about ports being in use, you can:

1. Stop other services using those ports, OR
2. Change the ports in your `.env` file:

```env
FRONTEND_PORT=8080      # Instead of 4200
BACKEND_PORT=8001       # Instead of 8000
POSTGRES_EXTERNAL_PORT=5435  # Instead of 5434
```

### Database Connection Errors

If the backend can't connect to the database:

1. Check that all services are running: `docker-compose ps`
2. View backend logs: `docker-compose logs backend`
3. Ensure the database is healthy: `docker-compose ps db`
4. Try restarting: `docker-compose restart backend`

### Frontend Not Loading

1. Clear browser cache and reload
2. Check frontend logs: `docker-compose logs frontend`
3. Verify the backend is running: `docker-compose ps backend`

### Changes Not Reflected

After making code changes:

```bash
# Stop everything
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Complete Reset

To start fresh (⚠️ This will delete all data):

```bash
docker-compose down -v
docker-compose up --build
```

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`. This means:

- ✅ Data persists between container restarts
- ✅ Data survives `docker-compose down`
- ❌ Data is deleted with `docker-compose down -v`

## Production Deployment Notes

For production deployment:

1. Change database credentials in `.env`
2. Use strong passwords
3. Consider using Docker secrets for sensitive data
4. Set up proper nginx SSL/TLS configuration
5. Configure proper CORS origins in backend
6. Use environment-specific configurations

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all containers are healthy: `docker-compose ps`
3. Try a clean rebuild: `docker-compose down && docker-compose up --build`
4. Check Docker Desktop is running and has enough resources

---

**Made with ❤️ for easy deployment**
