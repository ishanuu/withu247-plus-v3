# Frontend Quick Start Guide

Quick reference for frontend developers integrating with WithU247+ v3 backend.

---

## Key Endpoints Summary

### Authentication
- **Login**: `/api/auth/google` or `/api/auth/github`
- **Get User**: `trpc.auth.me.useQuery()`
- **Logout**: `trpc.auth.logout.useMutation()`

### Tenant Management
- **Get Tenant Info**: `trpc.tenant.info.useQuery()`
- **Get Usage**: `trpc.tenant.usage.useQuery()`
- **Check Feature**: `trpc.tenant.hasFeature.useQuery({ feature: 'name' })`
- **List Users**: `trpc.tenant.users.useQuery({ limit, offset })`
- **Upgrade Plan**: `trpc.tenant.upgradePlan.useMutation()`

### GraphQL Queries
- **Get Me**: `query { me { id email name } }`
- **Get User**: `query { user(id: "123") { id email name } }`
- **Search Users**: `query { searchUsers(query: "john") { id email } }`

### GraphQL Mutations
- **Login**: `mutation { login(email: "x@y.com", password: "pass") { token user } }`
- **Register**: `mutation { register(email: "x@y.com", password: "pass", name: "John") { token user } }`
- **Update Profile**: `mutation { updateProfile(name: "New Name", avatar: "url") { id name } }`
- **Logout**: `mutation { logout }`

---

## Authentication Flow

```
1. User clicks "Login with Google/GitHub"
   ↓
2. Redirect to /api/auth/google or /api/auth/github
   ↓
3. OAuth provider redirect
   ↓
4. Callback to /api/auth/google/callback or /api/auth/github/callback
   ↓
5. Session cookie set (httpOnly, secure)
   ↓
6. Redirect to dashboard
   ↓
7. Fetch user with trpc.auth.me.useQuery()
```

---

## Rate Limits

| Plan | Limit |
|------|-------|
| Free | 100 req/min |
| Pro | 1000 req/min |
| Enterprise | 10000 req/min |

Check headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Error Codes

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Not logged in |
| `FORBIDDEN` | Don't have permission |
| `NOT_FOUND` | Resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `BAD_REQUEST` | Invalid parameters |

---

## Common Patterns

### Check if User is Authenticated
```typescript
const { data: user } = trpc.auth.me.useQuery();
if (!user) {
  // Redirect to login
}
```

### Check Feature Access
```typescript
const { data: hasFeature } = trpc.tenant.hasFeature.useQuery({ 
  feature: 'advanced-analytics' 
});
if (!hasFeature) {
  // Show upgrade prompt
}
```

### Handle Rate Limiting
```typescript
try {
  await mutation.mutateAsync();
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Show "too many requests" message
  }
}
```

### Paginate Results
```typescript
const [page, setPage] = useState(0);
const { data } = trpc.tenant.users.useQuery({ 
  limit: 20, 
  offset: page * 20 
});
```

---

## Environment Variables

```bash
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
VITE_FRONTEND_FORGE_API_KEY=your-api-key
```

---

## Useful Links

- **Full API Docs**: See `FRONTEND_API_REFERENCE.md`
- **Enterprise Features**: See `ENTERPRISE_IMPROVEMENTS_PHASE3.md`
- **Testing Guide**: See `ENTERPRISE_IMPROVEMENTS_PHASE4.md`

---

## Support

For questions about the API:
1. Check `FRONTEND_API_REFERENCE.md`
2. Check existing tests in `server/_core/*.test.ts`
3. Review GraphQL schema in `server/_core/graphql.ts`
4. Check tRPC routers in `server/routers.ts`
