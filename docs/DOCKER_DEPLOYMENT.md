# WithU247+ Docker Deployment Guide

Complete guide for deploying WithU247+ using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- 4GB RAM minimum
- 10GB disk space

**Install Docker:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# macOS
brew install docker docker-compose
```

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ishanuu/withu247-plus-v3.git
cd withu247-plus-v3
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# Required
MONGODB_URI=mongodb://admin:password@mongodb:27017/withu247-plus?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
MONGO_INITDB_ROOT_PASSWORD=your_secure_password

# Optional
GOOGLE_MAPS_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Verify Services
```bash
# Check service status
docker-compose ps

# Test backend
curl http://localhost:5000/health

# Test AI service
curl http://localhost:8000/health

# Test MongoDB
docker-compose exec mongodb mongosh -u admin -p password
```

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Backend    │  │  AI Service  │    │
│  │  Port 5000   │  │  Port 8000   │    │
│  └──────────────┘  └──────────────┘    │
│         │                  │             │
│         └──────────┬───────┘             │
│                    │                     │
│              ┌──────────────┐            │
│              │   MongoDB    │            │
│              │  Port 27017  │            │
│              └──────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password@mongodb:27017/withu247-plus?authSource=admin
JWT_SECRET=your_super_secret_key_here
AI_SERVICE_URL=http://ai-service:8000
GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

**AI Service (.env):**
```bash
PORT=8000
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2
DEVICE=cpu
OPENAI_API_KEY=your_key
```

**MongoDB (.env):**
```bash
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
MONGO_INITDB_DATABASE=withu247-plus
```

---

## 📝 Docker Compose Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d backend
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs ai-service
docker-compose logs mongodb

# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Services
```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

### Execute Commands
```bash
# Run command in container
docker-compose exec backend npm run test

# Open shell
docker-compose exec backend sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password
```

---

## 🏥 Health Checks

### Automatic Health Checks
Each service has built-in health checks:

```bash
# View health status
docker-compose ps

# Check specific service
docker inspect withu247-backend | grep -A 10 '"Health"'
```

### Manual Health Checks
```bash
# Backend
curl http://localhost:5000/health

# AI Service
curl http://localhost:8000/health

# MongoDB
docker-compose exec mongodb mongosh -u admin -p password --eval "db.adminCommand('ping')"
```

---

## 📦 Building Images

### Build All Images
```bash
docker-compose build
```

### Build Specific Image
```bash
docker-compose build backend
docker-compose build ai-service
```

### Build Without Cache
```bash
docker-compose build --no-cache
```

### Build and Push to Registry
```bash
# Tag images
docker tag withu247-backend:latest your-registry/withu247-backend:latest
docker tag withu247-ai-service:latest your-registry/withu247-ai-service:latest

# Push
docker push your-registry/withu247-backend:latest
docker push your-registry/withu247-ai-service:latest
```

---

## 💾 Data Persistence

### MongoDB Volumes
```bash
# View volumes
docker volume ls | grep withu247

# Inspect volume
docker volume inspect withu247-plus_mongodb_data

# Backup data
docker run --rm -v withu247-plus_mongodb_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore data
docker run --rm -v withu247-plus_mongodb_data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/mongodb_backup.tar.gz -C /data
```

### AI Service Cache
```bash
# Cache is stored in volume: ai_service_cache
# Persists between restarts
# Clear cache: docker volume rm withu247-plus_ai_service_cache
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# Never commit .env
echo ".env" >> .gitignore

# Use strong passwords
MONGO_INITDB_ROOT_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 32)
```

### 2. Network Isolation
```bash
# Services only communicate within network
# MongoDB is not exposed to host (no port mapping)
# Only backend and ai-service are exposed
```

### 3. Container Security
```bash
# Run as non-root
# Use read-only filesystems where possible
# Limit resource usage
```

### 4. Image Security
```bash
# Use specific versions, not latest
# Scan images for vulnerabilities
docker scan withu247-backend:latest
```

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port already in use: change PORT in .env
# - MongoDB connection failed: check MONGODB_URI
# - Out of memory: increase Docker memory limit
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check credentials
docker-compose exec mongodb mongosh -u admin -p $MONGO_INITDB_ROOT_PASSWORD

# Reset MongoDB
docker-compose down -v
docker-compose up -d mongodb
```

### AI Service Timeout
```bash
# Check if service is running
docker-compose ps ai-service

# Check logs
docker-compose logs ai-service

# Restart service
docker-compose restart ai-service
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Limit resources in docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           cpus: '1'
#           memory: 512M
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Change port in .env
PORT=5001

# Restart services
docker-compose down
docker-compose up -d
```

---

## 📈 Performance Optimization

### 1. Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### 2. Caching
```bash
# Enable Redis for caching
# Add to docker-compose.yml:
# redis:
#   image: redis:7-alpine
#   ports:
#     - "6379:6379"
```

### 3. Database Optimization
```bash
# Create indexes
docker-compose exec mongodb mongosh -u admin -p password <<EOF
use withu247-plus
db.chat_history.createIndex({ userId: 1, timestamp: -1 })
db.emotion_logs.createIndex({ userId: 1, timestamp: -1 })
db.symptom_records.createIndex({ userId: 1, timestamp: -1 })
db.risk_logs.createIndex({ userId: 1, timestamp: -1 })
EOF
```

---

## 🔄 Scaling

### Horizontal Scaling with Load Balancer
```yaml
# Add nginx load balancer
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
```

### Multiple Backend Instances
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Load balancer distributes traffic
```

---

## 📋 Production Checklist

- [ ] All environment variables set
- [ ] MongoDB password changed from default
- [ ] JWT_SECRET is strong and unique
- [ ] API keys configured (Google Maps, OpenAI)
- [ ] CORS_ORIGIN set to production domain
- [ ] LOG_LEVEL set to warn or error
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Health checks passing
- [ ] Load testing completed

---

## 🔗 Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Python Docker Best Practices](https://docs.docker.com/language/python/)

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review environment variables: `cat .env`
3. Verify services running: `docker-compose ps`
4. Check GitHub issues: https://github.com/ishanuu/withu247-plus-v3/issues

---

**Last Updated:** January 2024
**Version:** 1.0.0
