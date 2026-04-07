# Production Deployment Checklist

## Pre-Deployment Verification

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or API keys
- [ ] All environment variables documented
- [ ] No experimental or debug code
- [ ] Code follows linting standards
- [ ] No circular dependencies
- [ ] Error handling on all async operations

### Security

- [ ] JWT secret is strong and unique
- [ ] MongoDB credentials are secure
- [ ] API keys are stored in environment variables
- [ ] CORS is properly configured
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] SQL injection protection (N/A for MongoDB, but validate inputs)
- [ ] XSS protection headers set
- [ ] HTTPS enforced
- [ ] Sensitive data logging disabled
- [ ] Authentication tokens have expiration
- [ ] Password hashing uses bcrypt with proper rounds

### Performance

- [ ] Response times < 500ms (verified with load testing)
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] Compression enabled
- [ ] CDN configured for static assets
- [ ] Database connection pooling configured
- [ ] AI service models preloaded
- [ ] Embedding cache initialized

### Documentation

- [ ] API documentation complete
- [ ] Architecture documentation updated
- [ ] Environment variables documented
- [ ] Deployment guide written
- [ ] Rollback procedures documented
- [ ] Monitoring setup documented
- [ ] Troubleshooting guide created

### Database

- [ ] MongoDB backups configured
- [ ] Indexes created
- [ ] Data validation rules set
- [ ] Replication configured (if applicable)
- [ ] Backup retention policy defined
- [ ] Recovery procedure tested

### Monitoring & Logging

- [ ] Application logging configured
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Performance monitoring setup
- [ ] Health check endpoint created
- [ ] Alerting rules configured
- [ ] Log retention policy defined
- [ ] Metrics collection enabled

## Deployment Steps

### 1. Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/withu247
export JWT_SECRET=$(openssl rand -base64 32)
export OPENAI_API_KEY=sk-...
export GOOGLE_MAPS_API_KEY=AIza...
export AI_SERVICE_URL=http://ai-service:8000
export REDIS_URL=redis://redis:6379
```

### 2. Database Migration

```bash
# Backup existing database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/withu247" \
          --out=/backups/withu247-$(date +%Y%m%d)

# Run migrations
npm run db:migrate

# Verify data integrity
npm run db:verify
```

### 3. Build & Test

```bash
# Clean build
rm -rf node_modules dist
npm ci

# Run all tests
npm test

# Build for production
npm run build

# Verify build
npm run verify:build
```

### 4. Docker Deployment

```bash
# Build images
docker build -t withu247-backend:latest ./backend-node
docker build -t withu247-ai-service:latest ./ai-service

# Push to registry
docker push withu247-backend:latest
docker push withu247-ai-service:latest

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps
docker-compose logs -f
```

### 5. Health Checks

```bash
# Check backend health
curl http://localhost:3000/api/health

# Check AI service health
curl http://localhost:8000/health

# Check database connection
curl http://localhost:3000/api/db/health

# Check Redis connection
curl http://localhost:3000/api/cache/health
```

### 6. Smoke Tests

```bash
# Run critical workflows
npm run test:smoke

# Verify API endpoints
npm run test:api

# Check AI service responses
npm run test:ai-service
```

## Post-Deployment Verification

### Immediate (First Hour)

- [ ] All services running without errors
- [ ] API responding to requests
- [ ] Database queries working
- [ ] AI service processing requests
- [ ] Logs showing normal operation
- [ ] No spike in error rates
- [ ] Response times within acceptable range

### Short-term (First Day)

- [ ] Monitor error rate < 0.1%
- [ ] Monitor response times (P95 < 500ms)
- [ ] Check database performance
- [ ] Verify backup jobs running
- [ ] Review logs for warnings
- [ ] Confirm caching working
- [ ] Test failover procedures

### Medium-term (First Week)

- [ ] Analyze performance metrics
- [ ] Review error logs
- [ ] Verify all features working
- [ ] Check resource utilization
- [ ] Confirm monitoring alerts working
- [ ] Review user feedback
- [ ] Optimize based on metrics

## Rollback Procedure

### If Critical Issues Occur

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/withu247" \
             /backups/withu247-previous-date

# 3. Deploy previous version
docker pull withu247-backend:previous
docker pull withu247-ai-service:previous
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify services
docker-compose ps
curl http://localhost:3000/api/health

# 5. Notify team
# Send alert to team about rollback
```

## Scaling Configuration

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
  
  ai-service:
    deploy:
      replicas: 2
    environment:
      - WORKERS=4
```

### Load Balancer Configuration (nginx)

```nginx
upstream backend {
    server backend:3000;
    server backend:3000;
    server backend:3000;
}

server {
    listen 80;
    server_name api.withu247.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring Setup

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error Rate | < 0.1% | > 1% |
| Response Time (P95) | < 500ms | > 1000ms |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |
| Database Connections | < 10 | > 20 |
| Redis Memory | < 500MB | > 1GB |

### Monitoring Tools

- **Application Monitoring**: New Relic, DataDog, or Prometheus
- **Error Tracking**: Sentry, Rollbar, or LogRocket
- **Logging**: ELK Stack, Splunk, or CloudWatch
- **Uptime Monitoring**: Pingdom, Uptime Robot, or StatusPage

## Maintenance Schedule

### Daily

- [ ] Review error logs
- [ ] Check system health
- [ ] Verify backups completed

### Weekly

- [ ] Review performance metrics
- [ ] Check security logs
- [ ] Update dependencies (if needed)
- [ ] Test backup restoration

### Monthly

- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Disaster recovery drill

### Quarterly

- [ ] Major version updates
- [ ] Infrastructure review
- [ ] Cost optimization review
- [ ] Security assessment

## Troubleshooting

### High Error Rate

```bash
# Check logs
docker-compose logs backend | tail -100

# Check database connection
npm run test:db

# Check AI service
npm run test:ai-service

# Restart services
docker-compose restart backend
```

### Slow Response Times

```bash
# Check database performance
npm run db:analyze-slow-queries

# Check cache hit rate
curl http://localhost:3000/api/metrics/cache

# Check AI service latency
curl http://localhost:8000/metrics

# Increase resources if needed
docker-compose up -d --scale backend=5
```

### Database Issues

```bash
# Check connection pool
npm run db:check-connections

# Verify indexes
npm run db:verify-indexes

# Rebuild indexes if needed
npm run db:rebuild-indexes

# Check replication status
npm run db:check-replication
```

## Emergency Contacts

- **On-call Engineer**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **DevOps Lead**: [Contact Info]
- **Security Team**: [Contact Info]

## Approval Sign-off

- [ ] Backend Lead: _______________
- [ ] DevOps Lead: _______________
- [ ] Security Lead: _______________
- [ ] Product Manager: _______________

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________
