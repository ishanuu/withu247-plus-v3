# WithU247+ v3 - Complete Startup & Walkthrough Guide

Welcome to WithU247+ v3! This guide will walk you through setting up and running the complete application.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Feature Walkthrough](#feature-walkthrough)
6. [API Testing](#api-testing)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## System Requirements

### Minimum Requirements

- **Node.js**: v18.0.0 or higher
- **npm/pnpm**: v8.0.0 or higher
- **MySQL**: v8.0.0 or higher (or TiDB compatible)
- **Redis**: v6.0.0 or higher (optional, for caching)

### Recommended Setup

- **OS**: Linux (Ubuntu 22.04+) or macOS 12+
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 10GB free space
- **Docker**: For containerized setup

### Check Installed Versions

```bash
node --version      # Should be v18+
npm --version       # Should be v8+
pnpm --version      # Should be v8+
mysql --version     # Should be v8+
redis-cli --version # Should be v6+
```

---

## Quick Start (5 minutes)

### For Development (Recommended for First-Time Users)

```bash
# 1. Clone the repository
git clone https://github.com/ishanuu/withu247-plus-v3.git
cd withu247-plus-v3

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp ENV_SETUP.md .env.example  # Reference guide
# Edit .env with your local settings (see ENV_SETUP.md)

# 4. Start development servers (automatic setup)
pnpm dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### For Docker Setup (Recommended for Production)

```bash
# 1. Clone repository
git clone https://github.com/ishanuu/withu247-plus-v3.git
cd withu247-plus-v3

# 2. Start all services
docker-compose up -d

# 3. Run migrations
docker exec withu247-backend pnpm db:push

# 4. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## Detailed Setup

### Step 1: Prerequisites Installation

#### On Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server

# Install Redis
sudo apt install -y redis-server

# Verify installations
node --version
pnpm --version
mysql --version
redis-cli --version
```

#### On macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install pnpm
npm install -g pnpm

# Install MySQL
brew install mysql

# Install Redis
brew install redis

# Verify installations
node --version
pnpm --version
mysql --version
redis-cli --version
```

#### On Windows

1. **Node.js**: Download from https://nodejs.org/ (v18+)
2. **pnpm**: `npm install -g pnpm`
3. **MySQL**: Download from https://dev.mysql.com/downloads/mysql/
4. **Redis**: Use Windows Subsystem for Linux (WSL) or Docker

### Step 2: Database Setup

#### Start MySQL

```bash
# On Linux/macOS
mysql.server start

# On Windows (if installed as service)
# Services will auto-start

# Verify MySQL is running
mysql -u root -p
# Enter password (default: empty or your set password)
```

#### Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE withu247;
CREATE USER 'withu247'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON withu247.* TO 'withu247'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Start Redis

```bash
# On Linux/macOS
redis-server

# On Windows (in WSL or Docker)
# Use Docker: docker run -d -p 6379:6379 redis:latest
```

### Step 3: Clone & Setup Repository

```bash
# Clone repository
git clone https://github.com/ishanuu/withu247-plus-v3.git
cd withu247-plus-v3

# Install dependencies
pnpm install

# This may take 2-3 minutes
```

### Step 4: Environment Configuration

```bash
# Copy environment template
cp ENV_SETUP.md .env.example

# Create .env file (DO NOT COMMIT THIS)
cat > .env << 'EOF'
# Database
DATABASE_URL=mysql://withu247:your_password_here@localhost:3306/withu247
DB_HOST=localhost
DB_PORT=3306
DB_USER=withu247
DB_PASSWORD=your_password_here
DB_NAME=withu247

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
NODE_ENV=development

# Security (CHANGE THESE IN PRODUCTION)
JWT_SECRET=dev-secret-key-change-in-production-12345
COOKIE_SECRET=dev-cookie-secret-change-in-production-12345
ENCRYPTION_KEY=dev-encryption-key-32-bytes-long-change-prod

# OAuth2 (Optional - for testing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# URLs
VITE_FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:3000

# Manus Platform (Required)
VITE_APP_ID=your-manus-app-id
VITE_APP_TITLE=WithU247+ - Your Health Companion
VITE_APP_LOGO=https://example.com/logo.png
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-owner-id

# Forge API
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
EOF
```

### Step 5: Database Migrations

```bash
# Run database migrations
pnpm db:push

# This creates all required tables:
# - users (authentication)
# - chat_history (conversation logs)
# - emotion_logs (emotion detection results)
# - symptom_records (symptom analysis)
# - doctor_mappings (doctor recommendations)
# - tenants (multi-tenancy)
# - api_keys (API access)
```

---

## Running the Application

### Development Mode (Recommended)

```bash
# Start both frontend and backend in development mode
pnpm dev

# This will:
# 1. Start Vite dev server (frontend) on http://localhost:5173
# 2. Start Express server (backend) on http://localhost:3000
# 3. Enable hot-reload for code changes
# 4. Show debug information in console
```

### Production Build

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start

# Server will run on http://localhost:3000
```

### Run Tests

```bash
# Run all tests (62 tests, 100% pass rate)
pnpm test

# Run specific test file
pnpm test server/_core/oauth2.test.ts

# Watch mode (re-run on file changes)
pnpm test --watch
```

### Run Linter & Type Check

```bash
# Type check
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

---

## Feature Walkthrough

### 1. Authentication (OAuth2)

**Access**: http://localhost:5173/login

**Features**:
- Google OAuth2 login
- GitHub OAuth2 login
- JWT-based session management
- Automatic token refresh

**Test Flow**:
```bash
1. Click "Login with Google" or "Login with GitHub"
2. Authorize application
3. Redirected to dashboard
4. Session stored in httpOnly cookie
```

### 2. Dashboard

**Access**: http://localhost:5173/dashboard

**Features**:
- User profile display
- API usage statistics
- Real-time notifications
- Quick action buttons

**Components**:
- Clay-morphism UI design
- Responsive grid layout
- Dark theme with warm clay tones

### 3. Tenant Management

**Access**: http://localhost:5173/dashboard (after login)

**Features**:
- Create new tenants
- Manage tenant settings
- View tenant usage
- Upgrade plans (Free → Pro → Enterprise)

**API Endpoints**:
```
GET    /api/trpc/tenant.info
GET    /api/trpc/tenant.usage
POST   /api/trpc/tenant.upgradePlan
GET    /api/trpc/tenant.users
POST   /api/trpc/tenant.inviteUser
```

### 4. User Management

**Access**: http://localhost:5173/users

**Features**:
- View all users in tenant
- Invite new users
- Manage user roles
- Remove users

**API Endpoints**:
```
GET    /api/trpc/tenant.users
POST   /api/trpc/tenant.inviteUser
DELETE /api/trpc/tenant.removeUser
```

### 5. Analytics Dashboard

**Access**: http://localhost:5173/analytics

**Features**:
- API usage tracking
- Error rate monitoring
- Response time metrics
- Request volume graphs

**Metrics Tracked**:
- Total requests
- Successful requests
- Failed requests
- Average response time
- Peak usage times

### 6. Settings & API Keys

**Access**: http://localhost:5173/settings

**Features**:
- Generate API keys
- Manage API key permissions
- View API key usage
- Revoke API keys

**API Endpoints**:
```
GET    /api/trpc/tenant.apiKeys
POST   /api/trpc/tenant.generateApiKey
DELETE /api/trpc/tenant.revokeApiKey
```

### 7. Admin Dashboard

**Access**: http://localhost:5173/admin (admin only)

**Features**:
- System-wide analytics
- Tenant management
- User monitoring
- System health checks

**Admin Endpoints**:
```
GET    /api/trpc/admin.systemStats
GET    /api/trpc/admin.tenants
GET    /api/trpc/admin.users
POST   /api/trpc/admin.suspendTenant
```

---

## API Testing

### Using cURL

#### 1. Health Check

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2026-05-08T..."}
```

#### 2. Get Current User

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/trpc/auth.me
```

#### 3. Get Tenant Info

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/trpc/tenant.info
```

#### 4. Get Analytics

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/trpc/tenant.usage
```

### Using Postman

1. Import collection: `docs/postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `token`: Your JWT token
3. Run requests from collection

### Using GraphQL

```bash
# Query user info
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ user { id email name } }"}'

# Mutation: Login
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(email: \"user@example.com\" password: \"pass\") { token user { id } } }"
  }'
```

---

## Troubleshooting

### "Cannot connect to database"

```bash
# Check MySQL is running
mysql -u root -p

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Verify DATABASE_URL in .env
# Format: mysql://user:password@host:port/database
```

### "Redis connection refused"

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# If not running, start it:
redis-server

# Redis is optional - app works without it (slower performance)
```

### "Port 3000 already in use"

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### "Module not found errors"

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "TypeScript compilation errors"

```bash
# Type check
pnpm type-check

# Fix errors
pnpm lint --fix
```

### "Tests failing"

```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run specific test
pnpm test server/_core/oauth2.test.ts
```

---

## Production Deployment

### 1. Prepare for Production

```bash
# Generate strong secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # COOKIE_SECRET
openssl rand -hex 16     # ENCRYPTION_KEY

# Update .env with production values
NODE_ENV=production
JWT_SECRET=<strong-secret>
COOKIE_SECRET=<strong-secret>
ENCRYPTION_KEY=<32-byte-key>

# Use HTTPS URLs
VITE_FRONTEND_URL=https://app.withu247.com
APP_URL=https://api.withu247.com
```

### 2. Build for Production

```bash
# Build
pnpm build

# Test build locally
pnpm start

# Check build output
ls -la dist/
```

### 3. Deploy to Server

#### Using Docker

```bash
# Build image
docker build -t withu247:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name withu247 \
  withu247:latest
```

#### Using PM2 (Node Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name "withu247" -- start

# Monitor
pm2 monit

# View logs
pm2 logs withu247
```

#### Using systemd

```bash
# Create service file
sudo tee /etc/systemd/system/withu247.service << EOF
[Unit]
Description=WithU247+ Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/withu247
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable withu247
sudo systemctl start withu247
```

### 4. Setup Monitoring

```bash
# View logs
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log

# Monitor system
htop

# Check application health
curl https://api.withu247.com/health
```

### 5. Setup SSL/TLS

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d api.withu247.com -d app.withu247.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/withu247
```

---

## Next Steps

1. **Read Documentation**
   - `ENV_SETUP.md` - Environment variables reference
   - `docs/ENTERPRISE_IMPROVEMENTS_SUMMARY.md` - Architecture overview
   - `docs/FRONTEND_API_REFERENCE.md` - API endpoints

2. **Run Examples**
   - Test OAuth2 flow
   - Create a tenant
   - Invite users
   - Generate API keys

3. **Customize**
   - Update branding (logo, colors, title)
   - Configure OAuth2 providers
   - Add custom features

4. **Deploy**
   - Follow production deployment guide
   - Setup monitoring and alerts
   - Configure backups

---

## Support & Resources

- **GitHub**: https://github.com/ishanuu/withu247-plus-v3
- **Documentation**: `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@withu247.com

---

## Quick Commands Reference

```bash
# Development
pnpm dev              # Start dev servers
pnpm test             # Run tests
pnpm type-check       # Type checking
pnpm lint             # Lint code
pnpm format           # Format code

# Database
pnpm db:push          # Run migrations
pnpm db:studio        # Open database UI

# Production
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build

# Utilities
pnpm clean            # Clean build artifacts
pnpm help             # Show all commands
```

---

**Happy coding! 🚀**

