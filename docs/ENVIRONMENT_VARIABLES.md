# WithU247+ Environment Variables Guide

Complete reference for all environment variables required for the WithU247+ system.

---

## 📋 Backend Environment Variables (Node.js)

### Server Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | Number | No | 5000 | Server port |
| `NODE_ENV` | String | No | development | Environment (development, production, test) |
| `HOST` | String | No | localhost | Server host |

**Example:**
```
PORT=5000
NODE_ENV=development
HOST=0.0.0.0
```

---

### Database Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `MONGODB_URI` | String | **Yes** | - | MongoDB connection string |
| `MONGODB_DB_NAME` | String | No | withu247-plus | Database name |
| `MONGODB_POOL_SIZE` | Number | No | 10 | Connection pool size |

**Example:**
```
# Local Development
MONGODB_URI=mongodb://localhost:27017/withu247-plus

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/withu247-plus?retryWrites=true&w=majority

# Docker
MONGODB_URI=mongodb://mongodb:27017/withu247-plus
```

---

### Authentication Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `JWT_SECRET` | String | **Yes** | - | Secret key for JWT signing |
| `JWT_EXPIRY` | String | No | 24h | Token expiration time |
| `JWT_REFRESH_EXPIRY` | String | No | 7d | Refresh token expiration |
| `BCRYPT_ROUNDS` | Number | No | 10 | Password hashing rounds |

**Example:**
```
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=10
```

**Security Note:** JWT_SECRET should be:
- At least 32 characters long
- Randomly generated
- Unique per environment
- Never committed to git

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### AI Service Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `AI_SERVICE_URL` | String | **Yes** | - | FastAPI AI service URL |
| `AI_SERVICE_TIMEOUT` | Number | No | 30000 | Request timeout (ms) |
| `AI_SERVICE_RETRY_ATTEMPTS` | Number | No | 3 | Retry attempts |

**Example:**
```
# Local Development
AI_SERVICE_URL=http://localhost:8000

# Docker
AI_SERVICE_URL=http://ai-service:8000

# Production
AI_SERVICE_URL=https://ai-service.example.com
```

---

### Google Maps API Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | String | No | - | Google Maps API key |
| `GOOGLE_MAPS_RADIUS` | Number | No | 5000 | Default search radius (meters) |
| `GOOGLE_MAPS_LANGUAGE` | String | No | en | Language for results |

**Example:**
```
GOOGLE_MAPS_API_KEY=AIzaSyD...your_api_key...
GOOGLE_MAPS_RADIUS=5000
GOOGLE_MAPS_LANGUAGE=en
```

**How to get Google Maps API Key:**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project
3. Enable "Places API" and "Maps JavaScript API"
4. Create an API key (Credentials → Create Credentials → API Key)
5. Restrict key to your domain
6. Copy the key to `GOOGLE_MAPS_API_KEY`

**Note:** If not provided, system uses fallback Delhi hospitals database.

---

### OpenAI Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `OPENAI_API_KEY` | String | No | - | OpenAI API key for LLM |
| `OPENAI_MODEL` | String | No | gpt-3.5-turbo | Model to use |
| `OPENAI_TEMPERATURE` | Number | No | 0.7 | Response creativity (0-1) |
| `OPENAI_MAX_TOKENS` | Number | No | 500 | Max response length |

**Example:**
```
OPENAI_API_KEY=sk-...your_api_key...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500
```

**How to get OpenAI API Key:**
1. Go to OpenAI: https://platform.openai.com
2. Sign up or login
3. Go to API Keys: https://platform.openai.com/account/api-keys
4. Create new secret key
5. Copy to `OPENAI_API_KEY`

**Note:** If not provided, system uses mock responses.

---

### PubMed Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PUBMED_API_KEY` | String | No | - | PubMed API key (optional) |
| `PUBMED_EMAIL` | String | No | - | Email for PubMed requests |

**Example:**
```
PUBMED_EMAIL=your_email@example.com
```

**Note:** PubMed API doesn't require key but email is recommended.

---

### Logging Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | String | No | info | Log level (error, warn, info, debug) |
| `LOG_FILE` | String | No | logs/app.log | Log file path |
| `LOG_MAX_SIZE` | String | No | 10m | Max log file size |
| `LOG_MAX_FILES` | Number | No | 14 | Max log files to keep |

**Example:**
```
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14
```

---

### CORS Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CORS_ORIGIN` | String | No | http://localhost:3000 | Allowed frontend URL |
| `CORS_CREDENTIALS` | Boolean | No | true | Allow credentials |

**Example:**
```
# Development
CORS_ORIGIN=http://localhost:3000

# Production
CORS_ORIGIN=https://withu247.example.com
```

---

### Risk Engine Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `RISK_ALPHA` | Number | No | 0.4 | Symptom weight |
| `RISK_BETA` | Number | No | 0.4 | Emotion weight |
| `RISK_GAMMA` | Number | No | 0.2 | Sentiment weight |
| `RISK_THRESHOLD_HIGH` | Number | No | 0.6 | High risk threshold |
| `RISK_THRESHOLD_CRITICAL` | Number | No | 0.8 | Critical risk threshold |

**Example:**
```
RISK_ALPHA=0.4
RISK_BETA=0.4
RISK_GAMMA=0.2
RISK_THRESHOLD_HIGH=0.6
RISK_THRESHOLD_CRITICAL=0.8
```

---

## 🐍 AI Service Environment Variables (Python)

### Server Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | Number | No | 8000 | FastAPI server port |
| `HOST` | String | No | 0.0.0.0 | Server host |
| `DEBUG` | Boolean | No | False | Debug mode |

**Example:**
```
PORT=8000
HOST=0.0.0.0
DEBUG=False
```

---

### Model Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `EMBEDDING_MODEL` | String | No | sentence-transformers/all-MiniLM-L6-v2 | Embedding model |
| `SENTIMENT_MODEL` | String | No | distilbert-base-uncased-finetuned-sst-2 | Sentiment model |
| `DEEPFACE_MODEL` | String | No | VGGFace | DeepFace model |
| `DEVICE` | String | No | cpu | Device (cpu, cuda) |

**Example:**
```
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2
DEEPFACE_MODEL=VGGFace
DEVICE=cpu
```

---

### RAG Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `RAG_TOP_K` | Number | No | 3 | Number of documents to retrieve |
| `RAG_CHUNK_SIZE` | Number | No | 500 | Document chunk size (tokens) |
| `RAG_CHUNK_OVERLAP` | Number | No | 50 | Chunk overlap (tokens) |
| `RAG_SIMILARITY_THRESHOLD` | Number | No | 0.3 | Minimum similarity score |

**Example:**
```
RAG_TOP_K=3
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=50
RAG_SIMILARITY_THRESHOLD=0.3
```

---

### OpenAI Configuration (AI Service)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `OPENAI_API_KEY` | String | No | - | OpenAI API key |
| `OPENAI_MODEL` | String | No | gpt-3.5-turbo | Model name |
| `OPENAI_TEMPERATURE` | Number | No | 0.7 | Temperature (0-1) |
| `OPENAI_MAX_TOKENS` | Number | No | 500 | Max tokens |

**Example:**
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500
```

---

### Cache Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CACHE_ENABLED` | Boolean | No | True | Enable response caching |
| `CACHE_TTL` | Number | No | 3600 | Cache time-to-live (seconds) |
| `EMBEDDING_CACHE_SIZE` | Number | No | 1000 | Max cached embeddings |

**Example:**
```
CACHE_ENABLED=True
CACHE_TTL=3600
EMBEDDING_CACHE_SIZE=1000
```

---

### Logging Configuration (AI Service)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | String | No | INFO | Log level |
| `LOG_FILE` | String | No | logs/ai_service.log | Log file path |

**Example:**
```
LOG_LEVEL=INFO
LOG_FILE=logs/ai_service.log
```

---

## 🐳 Docker Environment Variables

### Docker Compose

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `COMPOSE_PROJECT_NAME` | String | No | withu247 | Project name |
| `MONGO_INITDB_ROOT_USERNAME` | String | No | admin | MongoDB admin user |
| `MONGO_INITDB_ROOT_PASSWORD` | String | **Yes** | - | MongoDB admin password |
| `MONGO_INITDB_DATABASE` | String | No | withu247-plus | Initial database |

**Example:**
```
COMPOSE_PROJECT_NAME=withu247
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password_here
MONGO_INITDB_DATABASE=withu247-plus
```

---

## 📝 Complete .env File Template

### Backend (.env)
```bash
# Server
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/withu247-plus
MONGODB_DB_NAME=withu247-plus
MONGODB_POOL_SIZE=10

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=10

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000
AI_SERVICE_RETRY_ATTEMPTS=3

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyD...your_api_key...
GOOGLE_MAPS_RADIUS=5000
GOOGLE_MAPS_LANGUAGE=en

# OpenAI
OPENAI_API_KEY=sk-...your_api_key...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500

# PubMed
PUBMED_EMAIL=your_email@example.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Risk Engine
RISK_ALPHA=0.4
RISK_BETA=0.4
RISK_GAMMA=0.2
RISK_THRESHOLD_HIGH=0.6
RISK_THRESHOLD_CRITICAL=0.8
```

### AI Service (.env)
```bash
# Server
PORT=8000
HOST=0.0.0.0
DEBUG=False

# Models
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2
DEEPFACE_MODEL=VGGFace
DEVICE=cpu

# RAG
RAG_TOP_K=3
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=50
RAG_SIMILARITY_THRESHOLD=0.3

# OpenAI
OPENAI_API_KEY=sk-...your_api_key...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500

# Cache
CACHE_ENABLED=True
CACHE_TTL=3600
EMBEDDING_CACHE_SIZE=1000

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/ai_service.log
```

---

## 🚀 Environment Setup by Deployment Type

### Local Development

```bash
# Backend
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/withu247-plus
JWT_SECRET=dev_secret_key_here
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

### Docker Compose

```bash
# Backend
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/withu247-plus
JWT_SECRET=docker_secret_key_here
AI_SERVICE_URL=http://ai-service:8000
CORS_ORIGIN=http://localhost:3000

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=secure_password
```

### Production

```bash
# Backend
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/withu247-plus
JWT_SECRET=production_secret_key_here_very_secure
AI_SERVICE_URL=https://api.example.com/ai-service
GOOGLE_MAPS_API_KEY=production_api_key
OPENAI_API_KEY=production_openai_key
CORS_ORIGIN=https://withu247.example.com
LOG_LEVEL=warn
```

---

## ✅ Validation Checklist

Before running the application, verify:

- [ ] `JWT_SECRET` is set and at least 32 characters
- [ ] `MONGODB_URI` is valid and database is accessible
- [ ] `AI_SERVICE_URL` points to running FastAPI service
- [ ] `NODE_ENV` is set correctly (development/production)
- [ ] `CORS_ORIGIN` matches frontend URL
- [ ] API keys (Google Maps, OpenAI) are valid (if used)
- [ ] `.env` file is in `.gitignore`
- [ ] No secrets are committed to git

---

## 🔒 Security Best Practices

1. **Never commit .env files** - Add to `.gitignore`
2. **Use strong secrets** - Generate with crypto
3. **Rotate keys regularly** - Especially in production
4. **Use different keys per environment** - Dev, staging, prod
5. **Restrict API keys** - Use IP whitelisting, domain restrictions
6. **Monitor API usage** - Set up alerts for unusual activity
7. **Use environment-specific values** - Don't reuse across environments

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running and `MONGODB_URI` is correct

### JWT Secret Too Short
```
Error: JWT_SECRET must be at least 32 characters
```
**Solution:** Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### AI Service Timeout
```
Error: AI service request timeout
```
**Solution:** Check `AI_SERVICE_URL` is correct and service is running

### Google Maps API Error
```
Error: Invalid API key
```
**Solution:** Verify `GOOGLE_MAPS_API_KEY` is valid and has required permissions

---

## 📚 References

- [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** January 2024
**Version:** 1.0.0
