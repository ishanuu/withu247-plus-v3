# Release Guide & Deployment Instructions

## Overview

This document provides step-by-step instructions for releasing and deploying WithU247+ to production.

---

## 1. Pre-Release Checklist

### Code Quality

- [ ] All tests passing (unit, integration, security)
- [ ] Code coverage > 80%
- [ ] No linting errors
- [ ] No console.log statements
- [ ] All TODOs resolved
- [ ] Code reviewed by team
- [ ] Security audit completed

### Documentation

- [ ] API documentation complete
- [ ] Architecture documentation updated
- [ ] Deployment guide reviewed
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Environment variables documented
- [ ] Known issues documented

### Testing

- [ ] Unit tests: 100% pass
- [ ] Integration tests: 100% pass
- [ ] Performance tests: All targets met
- [ ] Security tests: All pass
- [ ] E2E tests: All pass
- [ ] Load testing: Completed
- [ ] Penetration testing: Completed

### Infrastructure

- [ ] Database backups configured
- [ ] Monitoring setup verified
- [ ] Logging configured
- [ ] Alerting rules set
- [ ] Scaling policies configured
- [ ] Disaster recovery tested
- [ ] SSL certificates valid

### Security

- [ ] No hardcoded credentials
- [ ] All API keys in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation complete
- [ ] Output encoding complete
- [ ] Security headers configured

---

## 2. Version Management

### Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Current Version**: 3.0.0

### Version Bumping

```bash
# Bump patch version (3.0.0 → 3.0.1)
npm version patch

# Bump minor version (3.0.0 → 3.1.0)
npm version minor

# Bump major version (3.0.0 → 4.0.0)
npm version major
```

---

## 3. Release Process

### Step 1: Prepare Release Branch

```bash
# Create release branch
git checkout -b release/v3.0.0

# Update version in package.json
npm version 3.0.0 --no-git-tag-v

# Update CHANGELOG
# Add release notes for v3.0.0
```

### Step 2: Create Release Commit

```bash
# Stage changes
git add package.json package-lock.json CHANGELOG.md

# Commit
git commit -m "chore: Release v3.0.0"

# Create tag
git tag -a v3.0.0 -m "Release v3.0.0"

# Push to GitHub
git push origin release/v3.0.0
git push origin v3.0.0
```

### Step 3: Create GitHub Release

```bash
# Using GitHub CLI
gh release create v3.0.0 \
  --title "WithU247+ v3.0.0" \
  --notes "Release notes here" \
  --draft

# Publish release
gh release publish v3.0.0
```

### Step 4: Build Docker Images

```bash
# Build backend image
docker build -t withu247-backend:3.0.0 ./backend-node
docker tag withu247-backend:3.0.0 withu247-backend:latest

# Build AI service image
docker build -t withu247-ai-service:3.0.0 ./ai-service
docker tag withu247-ai-service:3.0.0 withu247-ai-service:latest

# Push to registry
docker push withu247-backend:3.0.0
docker push withu247-backend:latest
docker push withu247-ai-service:3.0.0
docker push withu247-ai-service:latest
```

---

## 4. Deployment Steps

### Step 1: Pre-Deployment Verification

```bash
# Verify all services are healthy
curl http://localhost:3000/api/health
curl http://localhost:8000/health

# Verify database connectivity
npm run db:health-check

# Verify all tests pass
npm test
```

### Step 2: Backup Current State

```bash
# Backup database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/withu247" \
          --out=/backups/withu247-pre-v3.0.0-$(date +%Y%m%d-%H%M%S)

# Backup configuration
cp -r /etc/withu247 /backups/config-pre-v3.0.0-$(date +%Y%m%d-%H%M%S)
```

### Step 3: Deploy New Version

```bash
# Stop current services
docker-compose -f docker-compose.prod.yml down

# Pull new images
docker pull withu247-backend:3.0.0
docker pull withu247-ai-service:3.0.0

# Update docker-compose.yml with new version
sed -i 's/image: withu247-backend:.*/image: withu247-backend:3.0.0/' docker-compose.prod.yml
sed -i 's/image: withu247-ai-service:.*/image: withu247-ai-service:3.0.0/' docker-compose.prod.yml

# Start new services
docker-compose -f docker-compose.prod.yml up -d

# Verify services started
docker-compose ps
```

### Step 4: Run Migrations

```bash
# Run database migrations
npm run db:migrate

# Verify migrations completed
npm run db:verify-migrations

# Check data integrity
npm run db:integrity-check
```

### Step 5: Post-Deployment Verification

```bash
# Health checks
curl http://localhost:3000/api/health
curl http://localhost:8000/health

# Smoke tests
npm run test:smoke

# Verify critical endpoints
npm run test:critical-endpoints

# Check logs for errors
docker-compose logs -f backend
docker-compose logs -f ai-service
```

---

## 5. Rollback Procedure

### If Issues Occur

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/withu247" \
             /backups/withu247-pre-v3.0.0-YYYYMMDD-HHMMSS

# 3. Deploy previous version
docker pull withu247-backend:2.9.0
docker pull withu247-ai-service:2.9.0

sed -i 's/image: withu247-backend:.*/image: withu247-backend:2.9.0/' docker-compose.prod.yml
sed -i 's/image: withu247-ai-service:.*/image: withu247-ai-service:2.9.0/' docker-compose.prod.yml

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify services
docker-compose ps
curl http://localhost:3000/api/health

# 6. Notify team
echo "Rollback completed. Investigating issue..."
```

---

## 6. Deployment Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Backup created
- [ ] Team notified
- [ ] Maintenance window scheduled

### During Deployment

- [ ] Monitor logs in real-time
- [ ] Check error rates
- [ ] Verify response times
- [ ] Monitor resource usage
- [ ] Test critical workflows
- [ ] Verify data integrity

### After Deployment

- [ ] Monitor for 24 hours
- [ ] Check error logs
- [ ] Verify all features working
- [ ] Confirm backup successful
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Document any issues

---

## 7. Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| Error Rate | > 1% | Investigate immediately |
| Response Time (P95) | > 1000ms | Check database/AI service |
| CPU Usage | > 85% | Scale up or optimize |
| Memory Usage | > 90% | Restart services or scale |
| Database Connections | > 20 | Check for connection leaks |
| Disk Usage | > 85% | Clean up logs/backups |

### Alert Configuration

```javascript
// Prometheus alerting rules
groups:
  - name: withu247
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate detected"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High response time detected"
```

---

## 8. Communication Plan

### Pre-Deployment

**Announcement** (24 hours before):
```
Subject: Scheduled Maintenance - WithU247+ v3.0.0 Deployment

Dear Users,

We will be deploying WithU247+ v3.0.0 on [DATE] at [TIME] UTC.

Expected downtime: 15-30 minutes
New features: [List key features]
Improvements: [List improvements]

We appreciate your patience.
```

### During Deployment

**Status Updates** (every 10 minutes):
```
[14:00 UTC] Deployment started
[14:10 UTC] Database migration in progress
[14:20 UTC] Services restarting
[14:30 UTC] Health checks running
[14:35 UTC] Deployment completed successfully
```

### Post-Deployment

**Announcement** (after deployment):
```
Subject: WithU247+ v3.0.0 Successfully Deployed

Dear Users,

WithU247+ v3.0.0 has been successfully deployed. All systems are operational.

New features:
- [Feature 1]
- [Feature 2]

Thank you for your patience.
```

---

## 9. Release Notes Template

```markdown
# WithU247+ v3.0.0

**Release Date**: [DATE]

## New Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Improvements

- Improvement 1
- Improvement 2
- Improvement 3

## Bug Fixes

- Bug 1: Fixed issue with [component]
- Bug 2: Fixed issue with [component]

## Security

- Security patch for [vulnerability]
- Updated dependencies for security

## Performance

- Improved response time by X%
- Reduced memory usage by X%
- Optimized database queries

## Breaking Changes

None

## Migration Guide

No database migrations required.

## Known Issues

- Issue 1: [Description] (Workaround: [Workaround])

## Deprecations

- Deprecated endpoint: [Endpoint] (Use [New Endpoint] instead)

## Contributors

- [Contributor 1]
- [Contributor 2]

## Download

- [Docker Image](https://hub.docker.com/r/withu247/backend)
- [GitHub Release](https://github.com/ishanuu/withu247-plus-v3/releases/tag/v3.0.0)
```

---

## 10. Post-Release Activities

### Immediate (First Day)

- [ ] Monitor error rates and response times
- [ ] Verify all critical workflows
- [ ] Check user feedback
- [ ] Review logs for warnings
- [ ] Confirm backups completed

### Short-term (First Week)

- [ ] Analyze performance metrics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Plan hotfixes if needed

### Medium-term (First Month)

- [ ] Conduct post-mortem (if issues occurred)
- [ ] Optimize based on metrics
- [ ] Plan next release
- [ ] Update documentation
- [ ] Train support team

---

## 11. Emergency Procedures

### Critical Issue Response

```
1. Assess severity
   - P1 (Critical): Service down or data loss
   - P2 (High): Major feature broken
   - P3 (Medium): Minor feature broken
   - P4 (Low): Cosmetic issue

2. Immediate action
   - P1: Initiate rollback
   - P2: Create hotfix branch
   - P3: Schedule for next release
   - P4: Document for next release

3. Communication
   - Notify team
   - Update status page
   - Inform users if necessary

4. Post-incident
   - Document root cause
   - Create action items
   - Prevent recurrence
```

### Hotfix Process

```bash
# Create hotfix branch
git checkout -b hotfix/v3.0.1

# Make fixes
# ... make changes ...

# Test thoroughly
npm test

# Update version
npm version patch

# Commit and push
git add -A
git commit -m "hotfix: Fix critical issue"
git push origin hotfix/v3.0.1

# Create pull request
gh pr create --title "Hotfix v3.0.1" --body "Fixes critical issue"

# After approval and merge
git checkout main
git pull
git tag v3.0.1
git push origin v3.0.1

# Deploy hotfix
# ... follow deployment steps ...
```

---

## 12. Release Calendar

**2026 Release Schedule**:
- v3.0.0: April 2026 ✅
- v3.1.0: May 2026
- v3.2.0: June 2026
- v4.0.0: Q3 2026

---

## 13. Contact Information

- **Release Manager**: [Contact]
- **DevOps Lead**: [Contact]
- **On-Call Engineer**: [Contact]
- **Product Manager**: [Contact]

---

## Approval Sign-off

- [ ] Product Manager: _______________
- [ ] DevOps Lead: _______________
- [ ] Security Lead: _______________
- [ ] Release Manager: _______________

**Release Date**: _______________
**Released By**: _______________
**Approved By**: _______________

---

**Last Updated**: April 2026
**Version**: 3.0.0
