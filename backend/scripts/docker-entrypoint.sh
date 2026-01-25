#!/bin/sh
set -e

echo "🚀 Starting Backend Service..."

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-postgres} > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for MongoDB
echo "⏳ Waiting for MongoDB..."
until mongosh --host mongodb --port 27017 --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "MongoDB is unavailable - sleeping"
  sleep 1
done
echo "✅ MongoDB is ready"

# Wait for Redis
echo "⏳ Waiting for Redis..."
until redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD:-redispass} ping > /dev/null 2>&1; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done
echo "✅ Redis is ready"

# Run database migrations (if migration runner is set up)
# Uncomment when migrations are ready
# echo "🔄 Running database migrations..."
# npm run migrate:up

echo "✅ All services are ready!"
exec "$@"
