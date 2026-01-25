# Docker Setup Guide

This guide explains how to run all backend services using Docker Compose.

## Services Included

1. **PostgreSQL** - User, project, role, and permission data
2. **MongoDB** - Code reviews, snippets, and comments
3. **Redis** - Caching and message queue
4. **Backend API** - Express + GraphQL API service
5. **Backend gRPC** - AI analysis microservice

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Create Environment File

Create `.env.docker.local` in the backend directory:

```bash
# Copy the template
cp .env.docker .env.docker.local

# Edit with your values
# Add your OPENAI_API_KEY if you have one
```

### 2. Start All Services (Development)

```bash
cd backend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Or in detached mode:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. Start All Services (Production)

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Stop All Services

```bash
docker-compose down
```

### 5. Stop and Remove Volumes

```bash
docker-compose down -v
```

## Service URLs

After starting services, they will be available at:

- **Backend API**: http://localhost:3001
- **Backend API Health**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **gRPC Service**: localhost:50051

## Database Access

### PostgreSQL

```bash
# Connect via Docker
docker exec -it code-review-postgres psql -U postgres -d code_review_db

# Or from host (if exposed)
psql -h localhost -p 5432 -U postgres -d code_review_db
```

### MongoDB

```bash
# Connect via Docker
docker exec -it code-review-mongodb mongosh -u mongoadmin -p mongopass

# Or from host
mongosh mongodb://mongoadmin:mongopass@localhost:27017/code_review_platform?authSource=admin
```

### Redis

```bash
# Connect via Docker
docker exec -it code-review-redis redis-cli -a redispass

# Or from host
redis-cli -h localhost -p 6379 -a redispass
```

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-api
docker-compose logs -f postgres
docker-compose logs -f mongodb
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend-api

# Rebuild without cache
docker-compose build --no-cache
```

### Execute Commands in Container

```bash
# Backend API container
docker exec -it code-review-backend-api sh

# Run npm commands
docker exec -it code-review-backend-api npm run build
docker exec -it code-review-backend-api npm run type-check
```

### Check Service Status

```bash
docker-compose ps
```

### View Resource Usage

```bash
docker stats
```

## Volumes

Data is persisted in Docker volumes:

- `postgres_data` - PostgreSQL data
- `mongodb_data` - MongoDB data
- `mongodb_config` - MongoDB config
- `redis_data` - Redis data

To backup/restore volumes, see Docker volume documentation.

## Health Checks

All services include health checks. Check status:

```bash
docker-compose ps
```

Healthy services will show `(healthy)` status.

## Troubleshooting

### Port Already in Use

If a port is already in use, either:
1. Stop the conflicting service
2. Change the port in `.env.docker.local`

### Database Connection Issues

Ensure services are healthy before starting the backend:

```bash
docker-compose ps
```

Wait for all services to show `(healthy)` status.

### Rebuild from Scratch

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose rm -f

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

## Development vs Production

- **Development** (`docker-compose.dev.yml`): Hot reload enabled, source code mounted
- **Production** (`docker-compose.prod.yml`): Optimized builds, logging configured

## Network

All services are on the `code-review-network` bridge network and can communicate using service names (e.g., `postgres`, `mongodb`, `redis`).
