# Phase 2: Performance Optimization & Enterprise Features

## Overview

Phase 2 focuses on performance optimization, monitoring, and advanced enterprise features. This phase improves system responsiveness, provides visibility into performance metrics, and adds critical enterprise capabilities.

## New Modules

### 1. Monitoring & Metrics System (`monitoring.ts`)

**Purpose**: Track performance metrics and system health in real-time.

**Features**:
- Request duration tracking
- Memory usage monitoring
- Error rate calculation
- Percentile response time (p50, p95, p99)
- Slow request identification
- System metrics export

**Usage**:
```typescript
import { metricsMiddleware, getPerformanceStats } from './monitoring';

app.use(metricsMiddleware);

// Get performance statistics
const stats = getPerformanceStats();
console.log(`Average response time: ${stats.averageResponseTime}ms`);
console.log(`Error rate: ${stats.errorRate}%`);
console.log(`P95 response time: ${stats.p95ResponseTime}ms`);
```

**API Endpoints**:
- `GET /api/metrics` - Get current system metrics
- `GET /api/metrics/performance` - Get performance statistics
- `GET /api/metrics/export` - Export metrics as JSON

### 2. Query Optimization Utilities (`queryOptimization.ts`)

**Purpose**: Optimize database queries and prevent common performance issues.

**Features**:
- Pagination helpers
- Field selection optimization
- WHERE clause building
- ORDER BY optimization
- Cache key generation
- Batch query support
- N+1 query detection
- Query performance analysis
- Index recommendations

**Usage**:
```typescript
import { getPaginationParams, buildWhereClause, generateCacheKey } from './queryOptimization';

// Pagination
const { skip, take } = getPaginationParams(page, limit);

// WHERE clause building
const { clause, values } = buildWhereClause({ status: 'active', age: { operator: '>', value: 18 } });

// Cache key generation
const cacheKey = generateCacheKey('users', { status: 'active' }, { page: 1, limit: 20 });
```

**Best Practices**:
- Always use pagination for list endpoints
- Select only needed fields instead of SELECT *
- Use batch queries for bulk operations
- Monitor slow queries (>1s)
- Create indexes on frequently filtered fields

### 3. API Versioning (`apiVersioning.ts`)

**Purpose**: Manage multiple API versions for backward compatibility.

**Features**:
- Version detection from URL, headers, or Accept header
- Deprecation warnings
- Version-specific response transformation
- Compatibility checking
- Minimum version enforcement
- Sunset header support

**Usage**:
```typescript
import { apiVersionMiddleware, enforceMinimumVersion, addDeprecationWarning } from './apiVersioning';

app.use(apiVersionMiddleware);
app.use(enforceMinimumVersion('v1'));
app.use(addDeprecationWarning);

// Access version in route
app.get('/api/:version/users', (req, res) => {
  const version = (req as any).apiVersion;
  // Handle version-specific logic
});
```

**Version Management**:
- v1: Legacy API (deprecated after 2025-01-01)
- v2: Current stable API (recommended)
- v3: Future API (in development)

**Versioning Strategy**:
1. URL path: `/api/v1/users`, `/api/v2/users`
2. Accept header: `Accept: application/vnd.api+json;version=2`
3. Custom header: `X-API-Version: v2`

## Performance Improvements

### Before Phase 2
- No performance monitoring
- Query optimization left to developers
- Single API version (breaking changes)
- No caching strategy
- Memory leaks possible

### After Phase 2
- Real-time performance metrics
- Automated query optimization
- Multiple API versions with deprecation path
- Redis caching integrated
- Memory usage monitoring

## Metrics & Monitoring

### Key Metrics Tracked
- **Response Time**: p50, p95, p99 percentiles
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Memory Usage**: Heap, RSS, external
- **Slow Queries**: Requests >1s duration

### Accessing Metrics

```typescript
// Get system metrics
const systemMetrics = getSystemMetrics();
console.log(`Uptime: ${systemMetrics.uptime}s`);
console.log(`Memory: ${systemMetrics.memoryUsage.heapUsed / 1024 / 1024}MB`);

// Get performance stats
const perfStats = getPerformanceStats();
console.log(`Average response: ${perfStats.averageResponseTime}ms`);
console.log(`Error rate: ${perfStats.errorRate}%`);

// Detect N+1 queries
const n1Issues = detectN1Queries(queryLog);
if (n1Issues.detected) {
  console.warn('N+1 query patterns detected:', n1Issues.suggestions);
}
```

## API Versioning Examples

### Version Detection
```typescript
// Automatically detect version from multiple sources
const version = getApiVersion(req); // Returns 'v1', 'v2', etc.

// Check if version is deprecated
if (isVersionDeprecated(version)) {
  const warning = getDeprecationWarning(version);
  res.set('Deprecation', 'true');
  res.set('Warning', `299 - "${warning}"`);
}
```

### Version-Specific Responses
```typescript
const response = transformResponse(data, version);

// v1 response
// { data: {...}, status: 'success' }

// v2 response
// { success: true, data: {...}, timestamp: '2024-01-01T00:00:00Z', version: 'v2' }
```

## Configuration

### Environment Variables
```bash
# Monitoring
METRICS_ENABLED=true
METRICS_EXPORT_INTERVAL=60000  # Export every 60 seconds

# Query Optimization
QUERY_TIMEOUT=30000  # 30 seconds
SLOW_QUERY_THRESHOLD=1000  # 1 second

# API Versioning
DEFAULT_API_VERSION=v2
MINIMUM_API_VERSION=v1
DEPRECATION_NOTICE_DAYS=30
```

## Integration with Phase 1

Phase 2 builds on Phase 1 features:
- Uses **Caching** from Phase 1 for query results
- Uses **Rate Limiting** from Phase 1 to prevent abuse
- Uses **Error Handling** from Phase 1 for consistent errors
- Uses **Audit Logging** from Phase 1 to track API usage

## Testing

### Performance Testing
```bash
# Load test with 100 concurrent users
npm run test:load -- --users 100 --duration 60

# Stress test to find breaking point
npm run test:stress -- --ramp-up 10

# Benchmark specific endpoints
npm run test:benchmark -- /api/v2/users
```

### Metrics Validation
```typescript
// Verify metrics are being collected
const stats = getPerformanceStats();
assert(stats.totalRequests > 0, 'No requests tracked');
assert(stats.averageResponseTime > 0, 'No response time data');
```

## Migration Guide

### From Single Version to Versioned API

1. **Add versioning middleware**:
```typescript
app.use(apiVersionMiddleware);
```

2. **Update routes**:
```typescript
// Before
app.get('/api/users', handler);

// After
app.get('/api/v1/users', handler);
app.get('/api/v2/users', handler);
```

3. **Transform responses**:
```typescript
const response = transformResponse(data, version);
res.json(response);
```

4. **Add deprecation warnings**:
```typescript
app.use(addDeprecationWarning);
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Average Response Time | <100ms | ~150ms |
| P95 Response Time | <500ms | ~800ms |
| P99 Response Time | <1000ms | ~1500ms |
| Error Rate | <0.1% | ~0.5% |
| Throughput | >1000 req/s | ~500 req/s |

## Troubleshooting

### High Response Times
1. Check `getPerformanceStats()` for slow requests
2. Review query logs for N+1 patterns
3. Verify database indexes are created
4. Check Redis cache hit rate

### High Memory Usage
1. Monitor `getSystemMetrics().memoryUsage`
2. Check for memory leaks in long-running processes
3. Verify cache eviction policy
4. Review connection pool settings

### API Version Issues
1. Verify version detection with `getApiVersion(req)`
2. Check Accept header format
3. Review deprecation warnings
4. Test backward compatibility

## Next Steps

- **Phase 3**: Enterprise Features (OAuth2, Multi-tenancy, GraphQL)
- **Phase 4**: Testing & Validation
- **Phase 5**: Final Review & Production Deployment
