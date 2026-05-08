# Environment Configuration Guide

This document explains all environment variables required to run WithU247+ v3.

## Quick Start

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in the required values (see sections below)

3. Start the application:
```bash
pnpm install
pnpm dev
```

---

## Environment Variables Reference

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | MySQL/TiDB connection string: `mysql://user:pass@host:port/dbname` |
| `DB_HOST` | ✅ | - | Database hostname |
| `DB_PORT` | ✅ | 3306 | Database port |
| `DB_USER` | ✅ | - | Database username |
| `DB_PASSWORD` | ✅ | - | Database password |
| `DB_NAME` | ✅ | - | Database name |
| `DB_POOL_MIN` | ❌ | 5 | Minimum connection pool size |
| `DB_POOL_MAX` | ❌ | 20 | Maximum connection pool size |

### Redis Cache Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | ❌ | localhost | Redis server hostname |
| `REDIS_PORT` | ❌ | 6379 | Redis server port |
| `REDIS_PASSWORD` | ❌ | - | Redis password (if required) |
| `REDIS_DB` | ❌ | 0 | Redis database number |

### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ❌ | 3000 | Server port (auto-finds available if in use) |
| `NODE_ENV` | ❌ | development | Environment: `development`, `staging`, `production` |

### Authentication & Security

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | **MUST CHANGE IN PRODUCTION** - JWT signing secret (min 32 chars) |
| `COOKIE_SECRET` | ✅ | - | **MUST CHANGE IN PRODUCTION** - Session cookie secret |
| `ENCRYPTION_KEY` | ✅ | - | **MUST CHANGE IN PRODUCTION** - 32-byte encryption key for AES-256 |

### OAuth2 Configuration

#### Google OAuth2

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ❌ | - | Get from [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | ❌ | - | Get from Google Cloud Console |

**Setup Instructions:**
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Secret

#### GitHub OAuth2

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_CLIENT_ID` | ❌ | - | Get from [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | ❌ | - | Get from GitHub Developer Settings |

**Setup Instructions:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in application details
4. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
5. Copy Client ID and Secret

### Application URLs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_FRONTEND_URL` | ✅ | - | Frontend URL (for OAuth redirects) |
| `FRONTEND_URL` | ✅ | - | Alternative frontend URL |
| `APP_URL` | ✅ | - | Backend URL (for OAuth callbacks) |

**Examples:**
- Development: `http://localhost:5173` (frontend), `http://localhost:3000` (backend)
- Production: `https://app.withu247.com` (frontend), `https://api.withu247.com` (backend)

### Manus Platform Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_APP_ID` | ✅ | - | Manus application ID |
| `VITE_APP_TITLE` | ✅ | - | Application title displayed in UI |
| `VITE_APP_LOGO` | ✅ | - | Application logo URL |
| `OAUTH_SERVER_URL` | ✅ | - | Manus OAuth server URL |
| `VITE_OAUTH_PORTAL_URL` | ✅ | - | Manus OAuth portal URL |
| `OWNER_NAME` | ✅ | - | Owner/organization name |
| `OWNER_OPEN_ID` | ✅ | - | Owner's Manus OpenID |

### Forge API (LLM Service)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BUILT_IN_FORGE_API_URL` | ✅ | - | Manus Forge API endpoint |
| `BUILT_IN_FORGE_API_KEY` | ✅ | - | Forge API key (server-side) |
| `VITE_FRONTEND_FORGE_API_URL` | ✅ | - | Forge API endpoint for frontend |
| `VITE_FRONTEND_FORGE_API_KEY` | ✅ | - | Forge API key (frontend-safe) |

### External Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_SERVICE_URL` | ❌ | http://localhost:8000 | FastAPI AI service endpoint |
| `GOOGLE_MAPS_API_KEY` | ❌ | - | Google Maps API key for nearby doctors feature |

### Analytics & Monitoring

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_ANALYTICS_ENDPOINT` | ❌ | - | Analytics service endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | ❌ | - | Website ID for analytics |
| `PROMETHEUS_PORT` | ❌ | 9090 | Prometheus metrics port |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_EMOTION_DETECTION` | ❌ | true | Enable emotion detection feature |
| `ENABLE_SYMPTOM_ANALYSIS` | ❌ | true | Enable symptom analysis feature |
| `ENABLE_DOCTOR_RECOMMENDATION` | ❌ | true | Enable doctor recommendation |
| `ENABLE_NEARBY_DOCTORS` | ❌ | true | Enable nearby doctors search |
| `ENABLE_ADMIN_DASHBOARD` | ❌ | true | Enable admin dashboard |

### Logging & Debug

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | ❌ | info | Log level: `error`, `warn`, `info`, `debug`, `trace` |
| `DEBUG` | ❌ | false | Enable verbose debug logging |

### Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RATE_LIMIT_WINDOW` | ❌ | 900000 | Rate limit window in milliseconds (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | 100 | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | ❌ | 5 | Auth endpoint max requests per window |
| `SENSITIVE_RATE_LIMIT_MAX` | ❌ | 3 | Sensitive operations max per window |

### Security Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGINS` | ❌ | - | Comma-separated CORS allowed origins |
| `SECURE_COOKIES` | ❌ | false | Require HTTPS for cookies (production) |
| `SAME_SITE_COOKIES` | ❌ | lax | SameSite cookie policy: `strict`, `lax`, `none` |

---

## Development Setup

### 1. Local Development with Docker

```bash
# Start MySQL and Redis
docker-compose up -d

# Copy and configure environment
cp .env.example .env

# Install dependencies
pnpm install

# Run migrations
pnpm db:push

# Start dev server
pnpm dev
```

### 2. Local Development without Docker

```bash
# Ensure MySQL and Redis are running locally
mysql -u root -p
# Create database: CREATE DATABASE withu247;

redis-server

# Configure .env with local credentials
cp .env.example .env

# Install and run
pnpm install
pnpm db:push
pnpm dev
```

---

## Production Deployment

### 1. Set Required Secrets

```bash
# Generate strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For COOKIE_SECRET
openssl rand -hex 16     # For ENCRYPTION_KEY (32 chars)
```

### 2. Configure Environment

```bash
# Use secure secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
export NODE_ENV=production
export JWT_SECRET=<your-strong-secret>
export COOKIE_SECRET=<your-strong-secret>
export ENCRYPTION_KEY=<your-32-byte-key>

# Configure OAuth2
export GOOGLE_CLIENT_ID=<your-google-id>
export GOOGLE_CLIENT_SECRET=<your-google-secret>
export GITHUB_CLIENT_ID=<your-github-id>
export GITHUB_CLIENT_SECRET=<your-github-secret>

# Configure URLs (use HTTPS)
export VITE_FRONTEND_URL=https://app.withu247.com
export APP_URL=https://api.withu247.com

# Configure database
export DATABASE_URL=mysql://user:pass@prod-db:3306/withu247
export REDIS_HOST=prod-redis
```

### 3. Deploy

```bash
# Build
pnpm build

# Run migrations
pnpm db:push

# Start server
pnpm start
```

---

## Security Best Practices

1. **Never commit .env to version control** - Add to .gitignore
2. **Use strong secrets** - Minimum 32 characters, mix of upper/lower/numbers/symbols
3. **Rotate secrets regularly** - Every 90 days minimum
4. **Use HTTPS in production** - All URLs must use https://
5. **Secure storage** - Use AWS Secrets Manager, HashiCorp Vault, or similar
6. **Principle of least privilege** - Only grant necessary permissions
7. **Environment isolation** - Keep dev/staging/prod secrets separate
8. **Audit logging** - Monitor access to sensitive operations

---

## Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` is correct
- Check MySQL is running: `mysql -u root -p`
- Verify credentials: `mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST`

### "Redis connection refused"
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT`
- Redis is optional - app will work without it (with degraded performance)

### "OAuth callback fails"
- Verify `APP_URL` matches your server URL
- Check OAuth provider callback URL configuration
- Ensure `GOOGLE_CLIENT_ID` and `GITHUB_CLIENT_ID` are set

### "Port already in use"
- App will auto-find available port
- Or specify different port: `PORT=3001 pnpm dev`

---

## Support

For issues or questions:
- Check logs: `tail -f .manus-logs/devserver.log`
- Review documentation: `docs/` folder
- Submit issues on GitHub

