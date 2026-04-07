# Troubleshooting Guide & FAQ

## Overview

This document provides solutions for common issues and frequently asked questions about WithU247+.

---

## 1. Common Issues & Solutions

### 1.1 Backend Service Issues

#### Issue: Backend service won't start

**Symptoms**:
- Docker container exits immediately
- Port 3000 already in use
- Connection refused errors

**Solutions**:

```bash
# Check if port is in use
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Check logs
docker-compose logs backend

# Verify environment variables
env | grep MONGODB_URI
env | grep JWT_SECRET

# Restart service
docker-compose restart backend
```

#### Issue: Database connection failed

**Symptoms**:
- "MongooseError: Cannot connect to MongoDB"
- Connection timeout errors
- Authentication failed

**Solutions**:

```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"

# Check MongoDB service
docker-compose ps mongodb

# Verify credentials
# Check if user exists in MongoDB
mongosh admin --eval "db.getUser('username')"

# Restart MongoDB
docker-compose restart mongodb

# Check network connectivity
docker network ls
docker network inspect withu247_default
```

#### Issue: High memory usage

**Symptoms**:
- Container killed due to OOM
- Memory usage > 90%
- Slow performance

**Solutions**:

```bash
# Check memory usage
docker stats backend

# Check for memory leaks
node --inspect-brk server.js
# Visit chrome://inspect

# Increase heap size
export NODE_OPTIONS=--max-old-space-size=2048

# Restart with new heap size
docker-compose restart backend

# Check for large objects in memory
npm run profile:memory
```

### 1.2 AI Service Issues

#### Issue: AI service not responding

**Symptoms**:
- "Connection refused" when calling AI service
- Timeout errors
- 503 Service Unavailable

**Solutions**:

```bash
# Check AI service status
docker-compose ps ai-service

# Check logs
docker-compose logs ai-service

# Verify service is listening
curl http://localhost:8000/health

# Restart service
docker-compose restart ai-service

# Check Python environment
docker-compose exec ai-service python --version

# Verify models are loaded
docker-compose logs ai-service | grep "Loading"
```

#### Issue: Emotion detection failing

**Symptoms**:
- "DeepFace model not found"
- Image processing errors
- Timeout on emotion analysis

**Solutions**:

```bash
# Check DeepFace model
docker-compose exec ai-service python -c "from deepface import DeepFace; print('DeepFace OK')"

# Verify image format
# Ensure image is valid base64 JPEG

# Check model cache
docker-compose exec ai-service ls -la ~/.deepface/weights/

# Increase timeout
# In backend, increase AI service call timeout to 10 seconds

# Restart with model preload
docker-compose restart ai-service
```

#### Issue: RAG pipeline slow

**Symptoms**:
- Embedding generation takes > 1 second
- FAISS search slow
- High latency on chat endpoint

**Solutions**:

```bash
# Check embedding cache
docker-compose exec ai-service python -c "import pickle; print(len(pickle.load(open('embedding_cache.pkl', 'rb'))))"

# Clear cache if too large
docker-compose exec ai-service rm embedding_cache.pkl

# Check FAISS index size
docker-compose exec ai-service python -c "import faiss; index = faiss.read_index('medical_docs.index'); print(f'Index size: {index.ntotal}')"

# Rebuild index if corrupted
docker-compose exec ai-service python rebuild_faiss_index.py

# Monitor latency
docker-compose logs ai-service | grep "latency"
```

### 1.3 Database Issues

#### Issue: Database query slow

**Symptoms**:
- Response time > 1 second
- High database CPU usage
- Connection pool exhausted

**Solutions**:

```bash
# Check slow query log
mongosh "$MONGODB_URI" --eval "db.setProfilingLevel(1, { slowms: 100 })"

# View slow queries
mongosh "$MONGODB_URI" --eval "db.system.profile.find({ millis: { \$gt: 100 } }).pretty()"

# Check indexes
mongosh "$MONGODB_URI" --eval "db.chathistory.getIndexes()"

# Create missing indexes
npm run db:create-indexes

# Analyze query plan
mongosh "$MONGODB_URI" --eval "db.chathistory.find({ userId: 'test' }).explain('executionStats')"

# Optimize query
# Add index on frequently queried fields
```

#### Issue: Disk space running out

**Symptoms**:
- "No space left on device" errors
- Write operations failing
- MongoDB won't start

**Solutions**:

```bash
# Check disk usage
df -h

# Check MongoDB data size
du -sh /var/lib/mongodb

# Clean up old logs
docker-compose exec mongodb mongosh --eval "db.system.profile.deleteMany({ ts: { \$lt: new Date(Date.now() - 7*24*60*60*1000) } })"

# Compact database
docker-compose exec mongodb mongosh --eval "db.runCommand({ compact: 'chathistory' })"

# Remove old backups
rm -rf /backups/withu247-*-7days-ago

# Increase volume size
# Update docker-compose.yml volume size
```

### 1.4 Authentication Issues

#### Issue: JWT token invalid

**Symptoms**:
- "Invalid token" errors
- 401 Unauthorized on all endpoints
- Token expired errors

**Solutions**:

```bash
# Verify JWT secret
echo $JWT_SECRET

# Check token expiration
# Decode JWT at jwt.io

# Generate new token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@withu247.com","password":"TestPassword123"}'

# Verify token format
# Should be: Bearer <token>

# Check token in logs
docker-compose logs backend | grep "token"
```

#### Issue: Login failing

**Symptoms**:
- "Invalid credentials" even with correct password
- "User not found"
- 401 Unauthorized

**Solutions**:

```bash
# Verify user exists
mongosh "$MONGODB_URI" --eval "db.users.findOne({ email: 'test@withu247.com' })"

# Check password hash
# Verify bcrypt hash is valid

# Reset password
npm run reset-password -- test@withu247.com

# Check email format
# Ensure email is lowercase and trimmed

# Verify authentication middleware
docker-compose logs backend | grep "auth"
```

### 1.5 API Issues

#### Issue: CORS errors

**Symptoms**:
- "Access to XMLHttpRequest blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header"
- Preflight request failing

**Solutions**:

```bash
# Check CORS configuration
echo $ALLOWED_ORIGINS

# Update CORS settings
# In server.js, update cors options

# Verify frontend origin is allowed
# Add to ALLOWED_ORIGINS environment variable

# Test CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000/api/chat/send

# Restart backend
docker-compose restart backend
```

#### Issue: Rate limiting too strict

**Symptoms**:
- "Too many requests" errors
- 429 status code
- Can't make more than 5 requests

**Solutions**:

```bash
# Check rate limiting configuration
grep -r "rateLimit" backend-node/

# Increase rate limit
# Update windowMs or max in rate limiter

# Whitelist IP address
// In rate limiter middleware
if (req.ip === '127.0.0.1') {
  return next(); // Skip rate limiting for localhost
}

# Restart backend
docker-compose restart backend
```

#### Issue: Endpoint returns 404

**Symptoms**:
- "Cannot POST /api/chat/send"
- "Route not found"
- 404 Not Found

**Solutions**:

```bash
# Verify endpoint exists
grep -r "'/api/chat/send'" backend-node/

# Check route registration
docker-compose logs backend | grep "route"

# Verify HTTP method
# Use POST, not GET

# Check API path
# Should be /api/chat/send, not /chat/send

# List all routes
npm run list-routes
```

---

## 2. Performance Issues

### 2.1 Slow Response Times

**Investigation**:

```bash
# Check response time distribution
docker-compose logs backend | grep "duration"

# Identify slow endpoints
npm run analyze-slow-endpoints

# Check database latency
npm run db:check-latency

# Check AI service latency
curl http://localhost:8000/metrics | grep ai_service_latency

# Check cache hit rate
npm run cache:stats
```

**Solutions**:

```bash
# Enable caching
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Add database indexes
npm run db:create-indexes

# Optimize queries
npm run db:analyze-queries

# Scale horizontally
docker-compose up -d --scale backend=3

# Increase resources
# Update docker-compose.yml resource limits
```

### 2.2 High CPU Usage

**Investigation**:

```bash
# Check CPU usage
docker stats backend

# Profile CPU
node --prof server.js
node --prof-process isolate-*.log > profile.txt

# Identify hot functions
npm run profile:cpu
```

**Solutions**:

```bash
# Optimize algorithms
# Review CPU-intensive operations

# Use caching
# Cache frequently computed values

# Batch operations
# Process requests in batches

# Scale horizontally
docker-compose up -d --scale backend=3
```

### 2.3 High Memory Usage

**Investigation**:

```bash
# Check memory usage
docker stats backend

# Identify memory leaks
npm run profile:memory

# Check heap size
node --expose-gc server.js
```

**Solutions**:

```bash
# Increase heap size
export NODE_OPTIONS=--max-old-space-size=2048

# Fix memory leaks
# Remove circular references

# Limit cache size
redis-cli CONFIG SET maxmemory 1gb

# Restart services
docker-compose restart backend
```

---

## 3. Frequently Asked Questions

### Q1: How do I reset the database?

**Answer**:

```bash
# WARNING: This will delete all data

# Stop services
docker-compose down

# Remove MongoDB volume
docker volume rm withu247_mongodb_data

# Start services
docker-compose up -d

# Seed initial data
npm run db:seed
```

### Q2: How do I change the JWT secret?

**Answer**:

```bash
# Generate new secret
openssl rand -base64 32

# Update environment variable
export JWT_SECRET=<new-secret>

# Restart backend
docker-compose restart backend

# Note: Existing tokens will become invalid
```

### Q3: How do I add a new API endpoint?

**Answer**:

```bash
# 1. Create controller
touch backend-node/controllers/newController.js

# 2. Add route
// In server.js
app.post('/api/new/endpoint', newController.handler);

# 3. Add tests
touch backend-node/tests/newController.test.js

# 4. Update documentation
# Add to API_DOCUMENTATION.md

# 5. Restart backend
docker-compose restart backend
```

### Q4: How do I enable debug logging?

**Answer**:

```bash
# Set log level to debug
export LOG_LEVEL=debug

# Or for verbose logging
export LOG_LEVEL=trace

# Restart backend
docker-compose restart backend

# View logs
docker-compose logs -f backend
```

### Q5: How do I backup the database?

**Answer**:

```bash
# Create backup
mongodump --uri="$MONGODB_URI" --out=/backups/withu247-$(date +%Y%m%d-%H%M%S)

# List backups
ls -la /backups/

# Restore from backup
mongorestore --uri="$MONGODB_URI" /backups/withu247-YYYYMMDD-HHMMSS
```

### Q6: How do I monitor the system?

**Answer**:

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Check metrics
curl http://localhost:3000/metrics

# Check health
curl http://localhost:3000/api/health

# Monitor resources
docker stats
```

### Q7: How do I scale the application?

**Answer**:

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale AI service instances
docker-compose up -d --scale ai-service=2

# Verify scaling
docker-compose ps

# Load balance with nginx
# Configure nginx upstream
```

### Q8: How do I update dependencies?

**Answer**:

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm install package@latest

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Restart backend
docker-compose restart backend
```

### Q9: How do I deploy to production?

**Answer**:

```bash
# Follow RELEASE_GUIDE.md
# 1. Prepare release branch
# 2. Run all tests
# 3. Create release commit
# 4. Build Docker images
# 5. Deploy to production
# 6. Run smoke tests
# 7. Monitor for issues
```

### Q10: How do I report a bug?

**Answer**:

```bash
# 1. Check existing issues
# Visit: https://github.com/ishanuu/withu247-plus-v3/issues

# 2. Create new issue with:
# - Title: Clear description
# - Description: Steps to reproduce
# - Expected behavior
# - Actual behavior
# - Environment: OS, Node version, etc.
# - Logs: Relevant error messages

# 3. Attach files if needed
# - Screenshots
# - Log files
# - Minimal reproduction case
```

---

## 4. Getting Help

### Support Channels

- **GitHub Issues**: https://github.com/ishanuu/withu247-plus-v3/issues
- **Email**: support@withu247.com
- **Slack**: #withu247-support
- **Documentation**: https://docs.withu247.com

### Providing Debug Information

When reporting issues, include:

```bash
# System information
uname -a
node --version
npm --version
docker --version

# Application logs
docker-compose logs backend > backend.log
docker-compose logs ai-service > ai-service.log

# Environment variables (sanitized)
env | grep -E "NODE_ENV|LOG_LEVEL"

# Docker status
docker-compose ps
docker stats

# Health check
curl http://localhost:3000/api/health
```

---

## 5. Additional Resources

- **API Documentation**: See API_DOCUMENTATION.md
- **Architecture Guide**: See ARCHITECTURE.md
- **Deployment Guide**: See DOCKER_DEPLOYMENT.md
- **Security Guide**: See SECURITY_HARDENING.md
- **Performance Guide**: See PERFORMANCE_OPTIMIZATION.md
- **Testing Guide**: See TESTING_STRATEGY.md

---

**Last Updated**: April 2026
**Version**: 3.0.0
