# Frontend API Reference - WithU247+ v3

Complete API endpoint documentation for frontend development. All endpoints use **tRPC** protocol over HTTP POST to `/api/trpc`.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [OAuth2 Endpoints](#oauth2-endpoints)
3. [Multi-Tenancy Endpoints](#multi-tenancy-endpoints)
4. [GraphQL Endpoint](#graphql-endpoint)
5. [Health & System Endpoints](#health--system-endpoints)
6. [Error Handling](#error-handling)
7. [Request/Response Examples](#requestresponse-examples)

---

## Authentication Endpoints

### Base URL
```
tRPC: /api/trpc
REST: /api/v1
GraphQL: /graphql
```

### 1. Get Current User
**Endpoint**: `auth.me`
**Method**: GET (tRPC Query)
**Authentication**: Required (JWT Token)
**Description**: Retrieve current authenticated user information

**Request**:
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

**Response**:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "tenantId": "tenant-123",
  "createdAt": "2026-04-18T00:00:00Z"
}
```

**Error Response**:
```json
{
  "code": "UNAUTHORIZED",
  "message": "Not authenticated"
}
```

---

### 2. Logout
**Endpoint**: `auth.logout`
**Method**: POST (tRPC Mutation)
**Authentication**: Required
**Description**: Clear session and logout user

**Request**:
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

**Response**:
```json
{
  "success": true
}
```

---

## OAuth2 Endpoints

### 1. Initiate Google OAuth
**Endpoint**: `/api/auth/google`
**Method**: GET
**Authentication**: Not required
**Description**: Redirect to Google OAuth login

**Request**:
```html
<a href="/api/auth/google">Login with Google</a>
```

**Redirect**: Google OAuth consent screen

**Response**: Redirects to `/api/auth/google/callback`

---

### 2. Google OAuth Callback
**Endpoint**: `/api/auth/google/callback`
**Method**: GET
**Query Parameters**:
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection

**Description**: Handle Google OAuth callback

**Response**: 
- Success: Redirects to dashboard with session cookie
- Error: Redirects to login with error message

---

### 3. Initiate GitHub OAuth
**Endpoint**: `/api/auth/github`
**Method**: GET
**Authentication**: Not required
**Description**: Redirect to GitHub OAuth login

**Request**:
```html
<a href="/api/auth/github">Login with GitHub</a>
```

**Redirect**: GitHub OAuth consent screen

---

### 4. GitHub OAuth Callback
**Endpoint**: `/api/auth/github/callback`
**Method**: GET
**Query Parameters**:
- `code`: Authorization code from GitHub
- `state`: State parameter for CSRF protection

**Description**: Handle GitHub OAuth callback

**Response**: 
- Success: Redirects to dashboard with session cookie
- Error: Redirects to login with error message

---

## Multi-Tenancy Endpoints

### 1. Get Tenant Information
**Endpoint**: `tenant.info`
**Method**: GET (tRPC Query)
**Authentication**: Required
**Description**: Get current tenant information

**Request**:
```typescript
const { data: tenant } = trpc.tenant.info.useQuery();
```

**Response**:
```json
{
  "id": "tenant-123",
  "name": "Acme Corp",
  "domain": "acme.example.com",
  "plan": "pro",
  "rateLimit": 1000,
  "maxUsers": 100,
  "features": ["basic-analytics", "api-access", "advanced-analytics"],
  "createdAt": "2026-01-01T00:00:00Z",
  "isActive": true
}
```

---

### 2. Get Tenant Usage
**Endpoint**: `tenant.usage`
**Method**: GET (tRPC Query)
**Authentication**: Required
**Description**: Get current tenant usage statistics

**Request**:
```typescript
const { data: usage } = trpc.tenant.usage.useQuery();
```

**Response**:
```json
{
  "plan": "pro",
  "rateLimit": 1000,
  "currentUsage": 456,
  "percentageUsed": 45.6,
  "maxUsers": 100,
  "currentUsers": 12,
  "resetAt": "2026-05-18T00:00:00Z"
}
```

---

### 3. Check Feature Access
**Endpoint**: `tenant.hasFeature`
**Method**: GET (tRPC Query)
**Authentication**: Required
**Query Parameters**:
- `feature`: Feature name to check

**Description**: Check if tenant has access to a specific feature

**Request**:
```typescript
const { data: hasAccess } = trpc.tenant.hasFeature.useQuery({ 
  feature: 'advanced-analytics' 
});
```

**Response**:
```json
{
  "hasAccess": true,
  "feature": "advanced-analytics",
  "plan": "pro"
}
```

---

### 4. List Tenant Users
**Endpoint**: `tenant.users`
**Method**: GET (tRPC Query)
**Authentication**: Required (Admin)
**Query Parameters**:
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Description**: List all users in current tenant

**Request**:
```typescript
const { data: users } = trpc.tenant.users.useQuery({ 
  limit: 20, 
  offset: 0 
});
```

**Response**:
```json
{
  "users": [
    {
      "id": "user-1",
      "email": "user1@example.com",
      "name": "User One",
      "role": "admin",
      "createdAt": "2026-04-01T00:00:00Z"
    },
    {
      "id": "user-2",
      "email": "user2@example.com",
      "name": "User Two",
      "role": "user",
      "createdAt": "2026-04-05T00:00:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

### 5. Upgrade Tenant Plan
**Endpoint**: `tenant.upgradePlan`
**Method**: POST (tRPC Mutation)
**Authentication**: Required (Admin)
**Body**:
- `plan`: Target plan ("free" | "pro" | "enterprise")

**Description**: Upgrade or downgrade tenant plan

**Request**:
```typescript
const upgrade = trpc.tenant.upgradePlan.useMutation();
upgrade.mutate({ plan: 'enterprise' });
```

**Response**:
```json
{
  "success": true,
  "tenant": {
    "id": "tenant-123",
    "plan": "enterprise",
    "rateLimit": 10000,
    "maxUsers": 10000,
    "features": ["basic-analytics", "advanced-analytics", "sso", "audit-logs"]
  }
}
```

---

## GraphQL Endpoint

### Base URL
```
POST /graphql
```

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

### 1. Get Current User (GraphQL)
**Query**:
```graphql
query {
  me {
    id
    email
    name
    avatar
    role
  }
}
```

**Response**:
```json
{
  "data": {
    "me": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    }
  }
}
```

---

### 2. Get User by ID (GraphQL)
**Query**:
```graphql
query {
  user(id: "user-456") {
    id
    email
    name
    avatar
    role
  }
}
```

**Response**:
```json
{
  "data": {
    "user": {
      "id": "user-456",
      "email": "other@example.com",
      "name": "Jane Smith",
      "avatar": "https://example.com/jane.jpg",
      "role": "user"
    }
  }
}
```

---

### 3. List Users (GraphQL)
**Query**:
```graphql
query {
  users(limit: 10, offset: 0) {
    id
    email
    name
    role
  }
}
```

**Response**:
```json
{
  "data": {
    "users": [
      {
        "id": "user-1",
        "email": "user1@example.com",
        "name": "User One",
        "role": "user"
      },
      {
        "id": "user-2",
        "email": "user2@example.com",
        "name": "User Two",
        "role": "admin"
      }
    ]
  }
}
```

---

### 4. Search Users (GraphQL)
**Query**:
```graphql
query {
  searchUsers(query: "john") {
    id
    email
    name
    role
  }
}
```

**Response**:
```json
{
  "data": {
    "searchUsers": [
      {
        "id": "user-123",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "user"
      }
    ]
  }
}
```

---

### 5. Login Mutation (GraphQL)
**Mutation**:
```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "user-123",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

---

### 6. Register Mutation (GraphQL)
**Mutation**:
```graphql
mutation {
  register(
    email: "newuser@example.com"
    password: "securepass123"
    name: "New User"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "user-456",
        "email": "newuser@example.com",
        "name": "New User"
      }
    }
  }
}
```

---

### 7. Update Profile Mutation (GraphQL)
**Mutation**:
```graphql
mutation {
  updateProfile(
    name: "Updated Name"
    avatar: "https://example.com/new-avatar.jpg"
  ) {
    id
    email
    name
    avatar
  }
}
```

**Response**:
```json
{
  "data": {
    "updateProfile": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "Updated Name",
      "avatar": "https://example.com/new-avatar.jpg"
    }
  }
}
```

---

### 8. Logout Mutation (GraphQL)
**Mutation**:
```graphql
mutation {
  logout
}
```

**Response**:
```json
{
  "data": {
    "logout": true
  }
}
```

---

## Health & System Endpoints

### 1. Health Check
**Endpoint**: `health.status`
**Method**: GET (tRPC Query)
**Authentication**: Not required
**Description**: Check API health status

**Request**:
```typescript
const { data: health } = trpc.health.status.useQuery();
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-18T12:34:56Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

### 2. System Metrics
**Endpoint**: `system.metrics`
**Method**: GET (tRPC Query)
**Authentication**: Required (Admin)
**Description**: Get system performance metrics

**Request**:
```typescript
const { data: metrics } = trpc.system.metrics.useQuery();
```

**Response**:
```json
{
  "cpu": 45.2,
  "memory": 62.1,
  "requestsPerSecond": 234,
  "averageResponseTime": 45,
  "errorRate": 0.2,
  "activeConnections": 156
}
```

---

### 3. Notify Owner
**Endpoint**: `system.notifyOwner`
**Method**: POST (tRPC Mutation)
**Authentication**: Required
**Body**:
- `title`: Notification title
- `content`: Notification content

**Description**: Send notification to platform owner

**Request**:
```typescript
const notify = trpc.system.notifyOwner.useMutation();
notify.mutate({ 
  title: 'New Feedback', 
  content: 'User submitted feedback about the platform' 
});
```

**Response**:
```json
{
  "success": true,
  "notificationId": "notif-123"
}
```

---

## Error Handling

### Error Response Format

All endpoints return errors in this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "status": 400
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
try {
  const { data } = await trpc.auth.me.useQuery();
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Show rate limit message
    console.error('Too many requests, please try again later');
  }
}
```

---

## Request/Response Examples

### Example 1: Login Flow

**Step 1**: Redirect to OAuth
```html
<a href="/api/auth/google">Login with Google</a>
```

**Step 2**: OAuth callback redirects to dashboard with session cookie

**Step 3**: Fetch current user
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

**Step 4**: Check tenant access
```typescript
const { data: tenant } = trpc.tenant.info.useQuery();
```

---

### Example 2: Feature Access Check

```typescript
// Check if user has access to advanced analytics
const { data: hasAccess } = trpc.tenant.hasFeature.useQuery({ 
  feature: 'advanced-analytics' 
});

if (hasAccess) {
  // Show advanced analytics component
} else {
  // Show upgrade prompt
}
```

---

### Example 3: Pagination

```typescript
// Get first page of users
const { data: page1 } = trpc.tenant.users.useQuery({ 
  limit: 20, 
  offset: 0 
});

// Get second page
const { data: page2 } = trpc.tenant.users.useQuery({ 
  limit: 20, 
  offset: 20 
});
```

---

### Example 4: GraphQL Query

```typescript
// Using Apollo Client
import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      avatar
    }
  }
`;

function UserProfile({ userId }) {
  const { data, loading } = useQuery(GET_USER, { 
    variables: { id: userId } 
  });

  if (loading) return <div>Loading...</div>;
  return <div>{data.user.name}</div>;
}
```

---

## Rate Limiting

All endpoints are rate-limited based on tenant plan:

| Plan | Limit | Window |
|------|-------|--------|
| Free | 100 req/min | 1 minute |
| Pro | 1000 req/min | 1 minute |
| Enterprise | 10000 req/min | 1 minute |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1713436496
```

---

## Authentication

### JWT Token Format

Tokens are included in:
1. **HTTP Cookie**: `session` (httpOnly, secure)
2. **Authorization Header**: `Bearer <token>`

### Token Expiration

- Access Token: 7 days
- Refresh Token: 30 days

### Token Refresh

Tokens are automatically refreshed on each request if close to expiration.

---

## CORS Configuration

**Allowed Origins**:
- `http://localhost:3000` (development)
- `http://localhost:5173` (Vite dev)
- Production domain (configured in env)

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Content-Type, Authorization

---

## Webhooks (Future)

Webhooks for tenant events:
- `tenant.created`
- `tenant.upgraded`
- `user.created`
- `user.deleted`
- `quota.exceeded`

---

## API Versioning

Current API Version: **v1**

Future versions will be available at:
- `/api/v2/...`
- `/graphql/v2`

Deprecated endpoints will have a sunset date announced 3 months in advance.

---

## Support

For API issues or questions:
- Email: support@withu247plus.com
- Documentation: https://docs.withu247plus.com
- Status Page: https://status.withu247plus.com
