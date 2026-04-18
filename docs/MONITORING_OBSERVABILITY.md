# Monitoring & Observability Guide

## Overview

This document outlines the monitoring, logging, and observability strategy for WithU247+ to ensure system health, performance, and quick incident response.

---

## 1. Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  (Node.js Backend, FastAPI AI Service, MongoDB)         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │Metrics │  │ Logs   │  │ Traces   │
    │Collection│ │Collection│ │Collection│
    └────────┘  └────────┘  └──────────┘
        │            │            │
        ▼            ▼            ▼
    ┌────────────────────────────────────┐
    │    Data Aggregation & Storage      │
    │  (Prometheus, ELK, Jaeger)         │
    └────────────────────────────────────┘
        │
        ▼
    ┌────────────────────────────────────┐
    │    Visualization & Alerting        │
    │  (Grafana, Kibana, PagerDuty)      │
    └────────────────────────────────────┘
```

---

## 2. Metrics Collection

### 2.1 Application Metrics

**Prometheus Metrics**:

```javascript
// metrics.js
const prometheus = require('prom-client');

// HTTP request metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Database metrics
const dbQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const dbConnectionsActive = new prometheus.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

// AI service metrics
const aiServiceLatency = new prometheus.Histogram({
  name: 'ai_service_latency_seconds',
  help: 'Latency of AI service calls',
  labelNames: ['endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Business metrics
const riskScoresCalculated = new prometheus.Counter({
  name: 'risk_scores_calculated_total',
  help: 'Total number of risk scores calculated',
  labelNames: ['risk_level']
});

const emotionsDetected = new prometheus.Counter({
  name: 'emotions_detected_total',
  help: 'Total number of emotions detected',
  labelNames: ['emotion']
});

// Export metrics endpoint
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

module.exports = {
  httpRequestDuration,
  httpRequestsTotal,
  dbQueryDuration,
  dbConnectionsActive,
  aiServiceLatency,
  riskScoresCalculated,
  emotionsDetected,
  register
};
```

### 2.2 Middleware for Metrics Collection

```javascript
// metricsMiddleware.js
const { httpRequestDuration, httpRequestsTotal } = require('./metrics');

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = metricsMiddleware;
```

### 2.3 Metrics Endpoint

```javascript
// server.js
const { register } = require('./metrics');

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 3. Logging Strategy

### 3.1 Structured Logging

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'withu247' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File output
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

module.exports = logger;
```

### 3.2 Contextual Logging

```javascript
// Example: Log with context
logger.info('User login successful', {
  userId: user._id,
  email: user.email,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
});

// Example: Log errors with stack trace
logger.error('Database query failed', {
  error: err.message,
  stack: err.stack,
  query: sanitizedQuery,
  collection: 'users',
  duration: queryDuration
});

// Example: Log business events
logger.info('Risk score calculated', {
  userId: user._id,
  riskScore: 0.75,
  riskLevel: 'HIGH',
  signals: {
    symptomSeverity: 0.7,
    negativeEmotionScore: 0.3,
    sentimentScore: 0.4
  }
});
```

### 3.3 Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Critical errors | Database connection failed |
| WARN | Warnings | Slow query detected |
| INFO | Important events | User login, API call |
| DEBUG | Debugging info | Variable values |
| TRACE | Detailed trace | Function entry/exit |

---

## 4. Distributed Tracing

### 4.1 Trace Instrumentation

```javascript
// tracing.js
const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');

const jaegerExporter = new JaegerExporter({
  serviceName: 'withu247-backend',
  host: process.env.JAEGER_HOST || 'localhost',
  port: process.env.JAEGER_PORT || 6831
});

const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

opentelemetry.trace.setGlobalTracerProvider(tracerProvider);

module.exports = opentelemetry.trace.getTracer('withu247');
```

### 4.2 Tracing Spans

```javascript
// Example: Trace API endpoint
const tracer = require('./tracing');

app.post('/api/chat/send', async (req, res) => {
  const span = tracer.startSpan('chat.send');
  
  try {
    span.setAttributes({
      'user.id': req.user.id,
      'message.length': req.body.message.length
    });
    
    // Call AI service
    const aiSpan = tracer.startSpan('ai_service.call', { parent: span });
    const response = await callAIService(req.body.message);
    aiSpan.end();
    
    // Save to database
    const dbSpan = tracer.startSpan('db.save', { parent: span });
    await saveChatHistory(req.user.id, req.body.message, response);
    dbSpan.end();
    
    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    res.json({ success: true, data: response });
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
    res.status(500).json({ error: err.message });
  } finally {
    span.end();
  }
});
```

---

## 5. Health Checks

### 5.1 Health Check Endpoint

```javascript
// healthCheck.js
const healthCheck = async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    checks: {}
  };
  
  try {
    // Check database
    const dbCheck = await checkDatabaseHealth();
    health.checks.database = dbCheck;
    
    // Check Redis
    const redisCheck = await checkRedisHealth();
    health.checks.redis = redisCheck;
    
    // Check AI service
    const aiCheck = await checkAIServiceHealth();
    health.checks.ai_service = aiCheck;
    
    // Overall status
    const allHealthy = Object.values(health.checks).every(check => check.status === 'UP');
    health.status = allHealthy ? 'UP' : 'DEGRADED';
    
    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    
    return {
      status: 'UP',
      latency: `${latency}ms`,
      connections: mongoose.connection.collection.client.topology.s.pool.totalConnectionCount
    };
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
};

const checkRedisHealth = async () => {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    
    return {
      status: 'UP',
      latency: `${latency}ms`,
      memory: await redis.info('memory')
    };
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
};

const checkAIServiceHealth = async () => {
  try {
    const start = Date.now();
    const response = await axios.get('http://ai-service:8000/health');
    const latency = Date.now() - start;
    
    return {
      status: response.status === 200 ? 'UP' : 'DOWN',
      latency: `${latency}ms`
    };
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
};

app.get('/api/health', healthCheck);

module.exports = { healthCheck, checkDatabaseHealth, checkRedisHealth, checkAIServiceHealth };
```

### 5.2 Liveness & Readiness Probes

```javascript
// Kubernetes probes
app.get('/health/live', (req, res) => {
  // Simple liveness check
  res.json({ status: 'alive' });
});

app.get('/health/ready', async (req, res) => {
  // Readiness check - verify dependencies
  try {
    await checkDatabaseHealth();
    await checkRedisHealth();
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});
```

---

## 6. Alerting Rules

### 6.1 Prometheus Alert Rules

```yaml
# alerts.yml
groups:
  - name: withu247
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High response time detected"
          description: "P95 latency is {{ $value }}s"
      
      # High CPU usage
      - alert: HighCPUUsage
        expr: process_resident_memory_bytes > 1073741824  # 1GB
        for: 5m
        annotations:
          summary: "High CPU usage detected"
      
      # Database connection pool exhausted
      - alert: DBConnectionPoolExhausted
        expr: db_connections_active > 20
        for: 2m
        annotations:
          summary: "Database connection pool nearly exhausted"
      
      # AI service latency high
      - alert: AIServiceLatencyHigh
        expr: histogram_quantile(0.95, ai_service_latency_seconds) > 2
        for: 5m
        annotations:
          summary: "AI service latency is high"
```

### 6.2 Alert Routing

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  
  routes:
    # Critical alerts
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    
    # High priority alerts
    - match:
        severity: high
      receiver: 'slack'
      continue: true
    
    # Low priority alerts
    - match:
        severity: low
      receiver: 'email'

receivers:
  - name: 'default'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
  
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
  
  - name: 'slack'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#incidents'
  
  - name: 'email'
    email_configs:
      - to: 'alerts@withu247.com'
        from: 'alertmanager@withu247.com'
```

---

## 7. Dashboards

### 7.1 Grafana Dashboard

**Key Panels**:

1. **Request Rate**: Requests per second
2. **Error Rate**: Percentage of failed requests
3. **Response Time**: P50, P95, P99 latencies
4. **Database Performance**: Query duration, connection count
5. **AI Service Latency**: Average latency by endpoint
6. **Resource Usage**: CPU, memory, disk
7. **Business Metrics**: Risk scores, emotions detected
8. **Uptime**: Service availability percentage

### 7.2 Dashboard JSON

```json
{
  "dashboard": {
    "title": "WithU247+ Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[1m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[1m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## 8. Log Aggregation (ELK Stack)

### 8.1 Elasticsearch Configuration

```yaml
# elasticsearch.yml
cluster.name: withu247
node.name: node-1
discovery.type: single-node
xpack.security.enabled: true
xpack.security.enrollment.enabled: true
```

### 8.2 Logstash Pipeline

```conf
# logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  mutate {
    add_field => { "[@metadata][index_name]" => "withu247-%{+YYYY.MM.dd}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index_name]}"
    user => "elastic"
    password => "${ELASTIC_PASSWORD}"
  }
}
```

### 8.3 Kibana Queries

```
# Find errors by endpoint
status: error AND path: "/api/chat/*"

# Find slow queries
duration > 1000

# Find by user
userId: "user123"

# Find by time range
@timestamp: [2026-04-01 TO 2026-04-07]
```

---

## 9. Performance Monitoring

### 9.1 Key Performance Indicators (KPIs)

| KPI | Target | Alert |
|-----|--------|-------|
| Uptime | > 99.5% | < 99% |
| Error Rate | < 0.1% | > 1% |
| P95 Latency | < 500ms | > 1000ms |
| Database Latency | < 100ms | > 500ms |
| AI Service Latency | < 300ms | > 1000ms |
| Cache Hit Rate | > 80% | < 70% |

### 9.2 Performance Profiling

```javascript
// profiling.js
const profiler = require('v8-profiler-next');

// Start profiling
profiler.startProfiling('withu247');

// ... run code ...

// Stop profiling and save
const profile = profiler.stopProfiling();
profile.export((err, result) => {
  if (!err) {
    fs.writeFileSync('profile.cpuprofile', result);
  }
});
```

---

## 10. Incident Response

### 10.1 On-Call Procedures

```
1. Alert received
   ↓
2. Assess severity
   ├─ P1 (Critical): Immediate action
   ├─ P2 (High): Within 15 minutes
   └─ P3 (Medium): Within 1 hour
   ↓
3. Investigate
   ├─ Check logs
   ├─ Check metrics
   └─ Check traces
   ↓
4. Mitigate
   ├─ Scale up resources
   ├─ Restart services
   └─ Rollback if necessary
   ↓
5. Resolve
   ├─ Fix root cause
   └─ Deploy fix
   ↓
6. Post-incident
   ├─ Document incident
   ├─ Update runbooks
   └─ Prevent recurrence
```

### 10.2 Runbooks

**Runbook: High Error Rate**

```
Symptom: Error rate > 1%

Investigation:
1. Check error logs: grep "ERROR" logs/combined.log
2. Check affected endpoints: Check metrics dashboard
3. Check recent deployments: git log --oneline -10
4. Check database: npm run db:health-check
5. Check AI service: curl http://ai-service:8000/health

Mitigation:
1. Restart backend service: docker-compose restart backend
2. Clear cache: redis-cli FLUSHALL
3. Scale up: docker-compose up -d --scale backend=3

Resolution:
1. Identify root cause
2. Deploy fix
3. Monitor error rate
4. Update documentation
```

---

## 11. Monitoring Checklist

- [ ] Prometheus configured and scraping metrics
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Alertmanager routing configured
- [ ] ELK stack deployed
- [ ] Jaeger tracing enabled
- [ ] Health check endpoints working
- [ ] On-call procedures documented
- [ ] Runbooks created
- [ ] Team trained on monitoring

---

## References

- **Prometheus**: https://prometheus.io/
- **Grafana**: https://grafana.com/
- **ELK Stack**: https://www.elastic.co/what-is/elk-stack
- **Jaeger**: https://www.jaegertracing.io/
- **OpenTelemetry**: https://opentelemetry.io/
