# Docker Setup Guide

Quick guide to run Consultor.AI with Docker.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Configure Environment Variables

Edit the `.env` file and replace the placeholder values:

```bash
# Required - Get from https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Required - Get from https://ai.google.dev
GOOGLE_AI_API_KEY=your-actual-google-ai-key

# Required - Generate encryption key
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Optional - Meta WhatsApp (for production)
NEXT_PUBLIC_META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
# ... etc
```

### 2. Generate Encryption Key

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste it as the value for `ENCRYPTION_KEY` in `.env`.

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access Application

Open your browser and go to:
- Application: http://localhost:3000
- Health Check: http://localhost:3000/api/health

### 5. Stop Services

```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Remove everything including data
docker-compose down -v
```

## Troubleshooting

### Build Fails with "husky not found"

This is now fixed. If you still see this error, make sure you're using the latest Dockerfile:

```dockerfile
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force
```

### Environment Variables Not Set

Make sure your `.env` file exists and contains all required variables. Check with:

```bash
# Linux/Mac
cat .env

# Windows
type .env
```

### Port Already in Use

If port 3000 or 6379 is already in use, modify `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "3001:3000"  # Change 3000 to 3001
```

### Container Keeps Restarting

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing or invalid environment variables
- Database connection failed
- Build errors

### Redis Connection Failed

Check if Redis is running:
```bash
docker-compose ps redis
```

Test Redis connection:
```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

## Development vs Production

### For Development

Use `docker-compose.dev.yml` instead:

```bash
docker-compose -f docker-compose.dev.yml up
```

This provides:
- Hot reload
- Development tools
- Verbose logging

### For Production

Use the default `docker-compose.yml`:

```bash
docker-compose up -d
```

This provides:
- Optimized builds
- Health checks
- Auto-restart
- Production mode

## Useful Commands

```bash
# View logs for specific service
docker-compose logs -f app
docker-compose logs -f redis

# Restart specific service
docker-compose restart app

# Rebuild after code changes
docker-compose up -d --build

# Execute command in container
docker-compose exec app sh

# Check resource usage
docker stats

# Clean up everything
docker-compose down -v
docker system prune -a
```

## Next Steps

Once the app is running:

1. **Create an account**: Go to http://localhost:3000 and sign up
2. **Configure Supabase**: Set up your Supabase project
3. **Add API keys**: Configure Google AI and Meta WhatsApp
4. **Test the flow**: Try the conversation flow prototypes

See the main [README.md](README.md) for more information.

## Getting Help

- Check logs: `docker-compose logs -f`
- View documentation: [docs/README.md](docs/README.md)
- Verify environment: Make sure all required env vars are set
