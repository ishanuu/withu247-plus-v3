# Performance Optimization & Caching Strategy

## Overview

This document outlines performance optimization strategies for WithU247+ to ensure sub-500ms response times and efficient resource utilization.

## 1. Response Caching Strategy

### 1.1 Cache Layers

```
Request → Redis Cache (L1) → Database (L2) → AI Service (L3)
```

**L1: Redis Cache (5-60 minutes)**
- User chat history summaries
- Emotion statistics
- Doctor/hospital search results
- Medical research summaries

**L2: Database Indexes**
- userId + createdAt on ChatHistory
- userId on EmotionLog, SymptomRecord, RiskLog
- specialty + location on DoctorQuery

**L3: AI Service Caching**
- Embedding cache (FAISS)
- Model preloading
- Batch inference

### 1.2 Cache Implementation

```javascript
// Example: Cache chat history
const getChatHistory = async (userId, page = 1, limit = 10) => {
  const cacheKey = `chat:${userId}:${page}:${limit}`;
  
  // Check Redis
  let cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const data = await ChatHistory.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  // Cache for 30 minutes
  await redis.setex(cacheKey, 1800, JSON.stringify(data));
  
  return data;
};
```

### 1.3 Cache Invalidation

```javascript
// Invalidate on new message
const sendMessage = async (userId, message) => {
  // ... process message
  
  // Invalidate related caches
  await redis.del(`chat:${userId}:*`);
  await redis.del(`stats:${userId}:*`);
  
  return result;
};
```

## 2. Database Query Optimization

### 2.1 Index Strategy

```javascript
// Create indexes on frequently queried fields
db.chathistory.createIndex({ userId: 1, createdAt: -1 });
db.emotionlog.createIndex({ userId: 1, createdAt: -1 });
db.symptomrecord.createIndex({ userId: 1, createdAt: -1 });
db.risklog.createIndex({ userId: 1, createdAt: -1 });
db.doctorquery.createIndex({ userId: 1, specialty: 1 });
```

### 2.2 Query Optimization

```javascript
// ❌ Bad: N+1 queries
const users = await User.find({});
for (let user of users) {
  user.chatCount = await ChatHistory.countDocuments({ userId: user._id });
}

// ✅ Good: Aggregation pipeline
const users = await User.aggregate([
  {
    $lookup: {
      from: 'chathistories',
      localField: '_id',
      foreignField: 'userId',
      as: 'chats'
    }
  },
  {
    $addFields: {
      chatCount: { $size: '$chats' }
    }
  }
]);
```

### 2.3 Projection for Performance

```javascript
// Only fetch required fields
const getUser = async (userId) => {
  return await User.findById(userId)
    .select('email name role createdAt') // Exclude password, etc.
    .lean(); // Return plain JS object
};
```

## 3. AI Service Optimization

### 3.1 Model Preloading

```python
# Load models at startup (already implemented)
from transformers import pipeline

# Preload all models
sentiment_model = pipeline("sentiment-analysis", 
                          model="distilbert-base-uncased-finetuned-sst-2-english")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
emotion_model = DeepFace  # Preloaded

# Models stay in memory for fast inference
```

### 3.2 Batch Processing

```python
# Process multiple requests together
@app.post("/batch-analyze")
async def batch_analyze(requests: List[AnalyzeRequest]):
    # Batch embeddings
    texts = [r.text for r in requests]
    embeddings = embedding_model.encode(texts, batch_size=32)
    
    # Batch sentiment
    sentiments = sentiment_model(texts)
    
    return [
        {
            "embedding": emb,
            "sentiment": sent
        }
        for emb, sent in zip(embeddings, sentiments)
    ]
```

### 3.3 Embedding Caching

```python
# Cache embeddings to avoid recomputation
embedding_cache = {}

def get_embedding(text):
    if text in embedding_cache:
        return embedding_cache[text]
    
    embedding = embedding_model.encode(text)
    embedding_cache[text] = embedding
    
    return embedding
```

## 4. Response Optimization

### 4.1 Pagination

```javascript
// Always paginate large result sets
const getHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatHistory.countDocuments({ userId })
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
```

### 4.2 Field Selection

```javascript
// Return only necessary fields
const response = {
  success: true,
  data: {
    id: chat._id,
    message: chat.message,
    response: chat.aiResponse,
    timestamp: chat.createdAt
    // Exclude: sentiment, sources, metadata if not needed
  }
};
```

### 4.3 Compression

```javascript
// Enable gzip compression
const compression = require('compression');
app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024 // Only compress > 1KB
}));
```

## 5. API Response Time Targets

| Endpoint | Target | Strategy |
|----------|--------|----------|
| /auth/login | < 200ms | Cache user lookup, optimize password check |
| /chat/send | < 500ms | Async AI service call, cache embeddings |
| /emotion/analyze | < 300ms | Preload DeepFace model |
| /medisync/analyze-symptoms | < 400ms | Cache symptom mappings |
| /risk/calculate | < 100ms | In-memory calculation |
| /maps/nearby-hospitals | < 300ms | Cache results, use fallback DB |
| /chat/history | < 200ms | Paginate, use indexes |

## 6. Monitoring & Metrics

### 6.1 Performance Metrics

```javascript
// Track response times
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordLatency(req.path, duration);
    
    if (duration > 500) {
      logger.warn(`Slow endpoint: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

### 6.2 Database Query Monitoring

```javascript
// Log slow queries
mongoose.set('debug', (coll, method, query, doc) => {
  const start = Date.now();
  
  return (err, result) => {
    const duration = Date.now() - start;
    if (duration > 100) {
      logger.warn(`Slow query: ${coll}.${method}`, { duration, query });
    }
  };
});
```

## 7. Load Testing

### 7.1 Load Test Script

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# Using wrk
wrk -t4 -c100 -d30s http://localhost:3000/api/health
```

### 7.2 Expected Results

- **Throughput**: > 100 requests/second
- **P95 Latency**: < 500ms
- **P99 Latency**: < 1000ms
- **Error Rate**: < 0.1%

## 8. Production Deployment Optimization

### 8.1 Environment Variables

```bash
# Node.js optimization
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=2048

# Database connection pooling
MONGODB_POOL_SIZE=10
MONGODB_MAX_IDLE_TIME=60000

# Redis configuration
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000
```

### 8.2 Scaling Strategy

```
Vertical Scaling:
- Increase Node.js heap size
- Add more CPU cores
- Increase database connection pool

Horizontal Scaling:
- Deploy multiple Node.js instances
- Use load balancer (nginx)
- Shared Redis instance
- Replicated MongoDB
```

## 9. Best Practices

1. **Always use indexes** on frequently queried fields
2. **Cache aggressively** but invalidate correctly
3. **Paginate large result sets** (default limit: 20)
4. **Use lean()** for read-only queries
5. **Batch AI service calls** when possible
6. **Monitor response times** continuously
7. **Set appropriate cache TTLs** (5-60 minutes)
8. **Use connection pooling** for databases
9. **Compress responses** for large payloads
10. **Profile regularly** to identify bottlenecks

## 10. Troubleshooting

### Slow Chat Response

```
Check:
1. AI service latency (should be < 300ms)
2. Database query time (should be < 100ms)
3. Cache hit rate (should be > 80%)
4. Network latency between services
```

### High Memory Usage

```
Check:
1. Embedding cache size (limit to 10MB)
2. Model memory footprint
3. Database connection pool size
4. Node.js heap size
```

### Database Bottleneck

```
Check:
1. Query execution plans (use explain())
2. Index usage
3. Connection pool saturation
4. Slow query log
```

## References

- MongoDB Performance: https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/
- Node.js Performance: https://nodejs.org/en/docs/guides/nodejs-performance/
- Redis Caching: https://redis.io/topics/optimization
