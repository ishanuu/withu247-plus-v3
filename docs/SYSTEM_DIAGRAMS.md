# System Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Web["React Frontend<br/>(Port 5173)"]
        Mobile["Mobile App<br/>(Future)"]
    end
    
    subgraph API["API Gateway Layer"]
        Express["Express.js Server<br/>(Port 3000)"]
        tRPC["tRPC Router<br/>(Type-Safe RPC)"]
        GraphQL["GraphQL Endpoint<br/>(/graphql)"]
    end
    
    subgraph Auth["Authentication Layer"]
        OAuth2["OAuth2 Provider<br/>(Google, GitHub)"]
        JWT["JWT Session<br/>Management"]
        Passport["Passport.js<br/>Strategy"]
    end
    
    subgraph Data["Data Layer"]
        MySQL["MySQL Database<br/>(Primary Storage)"]
        Redis["Redis Cache<br/>(Performance)"]
        Prometheus["Prometheus<br/>(Metrics)"]
    end
    
    subgraph Middleware["Middleware Stack"]
        RateLimit["Rate Limiting<br/>(5-tier)"]
        Validation["Input Validation<br/>& Sanitization"]
        Encryption["Data Encryption<br/>(AES-256)"]
        Audit["Audit Logging<br/>& Tracking"]
    end
    
    Web -->|tRPC/REST/GraphQL| Express
    Mobile -->|tRPC/REST/GraphQL| Express
    Express --> tRPC
    Express --> GraphQL
    Express --> OAuth2
    OAuth2 --> JWT
    JWT --> Passport
    Express --> RateLimit
    Express --> Validation
    Express --> Encryption
    Express --> Audit
    Express --> MySQL
    Express --> Redis
    Express --> Prometheus
    
    style Web fill:#4CAF50
    style Express fill:#2196F3
    style MySQL fill:#FF9800
    style Redis fill:#F44336
    style OAuth2 fill:#9C27B0
```

## 2. Data Flow: Authentication

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Frontend as React Frontend
    participant Backend as Express Backend
    participant OAuth as OAuth Provider
    participant DB as MySQL Database
    
    User->>Frontend: Click "Login with Google"
    Frontend->>OAuth: Redirect to OAuth provider
    OAuth->>User: Show consent screen
    User->>OAuth: Approve access
    OAuth->>Backend: Redirect with auth code
    Backend->>OAuth: Exchange code for token
    OAuth->>Backend: Return access token
    Backend->>DB: Check if user exists
    alt User exists
        DB->>Backend: Return user record
    else New user
        Backend->>DB: Create new user
        DB->>Backend: Return created user
    end
    Backend->>Frontend: Set JWT cookie
    Frontend->>User: Redirect to dashboard
```

## 3. Data Flow: API Request

```mermaid
sequenceDiagram
    participant Client as Client
    participant Express as Express.js
    participant Middleware as Middleware Stack
    participant Router as tRPC Router
    participant DB as Database
    participant Cache as Redis Cache
    
    Client->>Express: POST /api/trpc/tenant.info
    Express->>Middleware: Rate Limiting Check
    Middleware->>Middleware: Input Validation
    Middleware->>Middleware: Auth Verification
    Middleware->>Router: Pass to Router
    Router->>Cache: Check cache
    alt Cache Hit
        Cache->>Router: Return cached data
    else Cache Miss
        Router->>DB: Query database
        DB->>Router: Return data
        Router->>Cache: Store in cache
    end
    Router->>Middleware: Response
    Middleware->>Middleware: Audit Log
    Middleware->>Express: Return response
    Express->>Client: 200 OK + JSON
```

## 4. Multi-Tenancy Architecture

```mermaid
graph TB
    subgraph Tenants["Tenant Isolation"]
        T1["Tenant 1<br/>(Free Plan)<br/>100 req/min"]
        T2["Tenant 2<br/>(Pro Plan)<br/>1000 req/min"]
        T3["Tenant 3<br/>(Enterprise)<br/>10000 req/min"]
    end
    
    subgraph Shared["Shared Infrastructure"]
        API["Unified API<br/>Gateway"]
        Auth["Auth Service"]
        DB["Shared Database<br/>(Tenant-Isolated)"]
        Cache["Shared Cache<br/>(Tenant-Isolated)"]
    end
    
    subgraph Monitoring["Monitoring"]
        Metrics["Prometheus<br/>Metrics"]
        Logs["Audit Logs"]
        Alerts["Alerts &<br/>Notifications"]
    end
    
    T1 -->|Rate Limited| API
    T2 -->|Rate Limited| API
    T3 -->|Rate Limited| API
    API --> Auth
    API --> DB
    API --> Cache
    API --> Metrics
    API --> Logs
    Metrics --> Alerts
    
    style T1 fill:#4CAF50
    style T2 fill:#2196F3
    style T3 fill:#FF9800
```

## 5. Security Architecture

```mermaid
graph TB
    subgraph Input["Input Security"]
        Sanitize["Input Sanitization"]
        Validate["Schema Validation"]
        Escape["SQL Escape"]
    end
    
    subgraph Auth["Authentication"]
        OAuth["OAuth2 Providers"]
        JWT["JWT Tokens"]
        Session["Session Management"]
    end
    
    subgraph Encryption["Data Protection"]
        Transit["HTTPS/TLS<br/>In Transit"]
        Rest["AES-256-GCM<br/>At Rest"]
        Hash["Bcrypt<br/>Passwords"]
    end
    
    subgraph Access["Access Control"]
        RateLimit["Rate Limiting"]
        RBAC["Role-Based<br/>Access"]
        TenantIso["Tenant<br/>Isolation"]
    end
    
    subgraph Audit["Audit & Monitoring"]
        Logging["Comprehensive<br/>Logging"]
        Tracking["Action Tracking"]
        Alerts["Security Alerts"]
    end
    
    Sanitize --> Validate
    Validate --> Escape
    OAuth --> JWT
    JWT --> Session
    Transit --> Rest
    Rest --> Hash
    RateLimit --> RBAC
    RBAC --> TenantIso
    Logging --> Tracking
    Tracking --> Alerts
    
    Input --> Auth
    Auth --> Encryption
    Encryption --> Access
    Access --> Audit
```

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph Dev["Development"]
        DevApp["Local App<br/>(Port 5173)"]
        DevServer["Local Server<br/>(Port 3000)"]
        DevDB["Local MySQL"]
    end
    
    subgraph Staging["Staging Environment"]
        StageApp["Staging Frontend<br/>(Vercel)"]
        StageServer["Staging Backend<br/>(Railway)"]
        StageDB["Staging Database"]
        StageCache["Staging Redis"]
    end
    
    subgraph Prod["Production"]
        ProdApp["Production Frontend<br/>(CDN)"]
        ProdServer["Production Backend<br/>(Kubernetes)"]
        ProdDB["Production Database<br/>(Replicated)"]
        ProdCache["Production Redis<br/>(Cluster)"]
        Monitor["Prometheus<br/>+ Grafana"]
    end
    
    DevApp -->|git push| StageApp
    DevServer -->|git push| StageServer
    StageApp -->|Approved| ProdApp
    StageServer -->|Approved| ProdServer
    ProdServer --> Monitor
    
    style Dev fill:#E8F5E9
    style Staging fill:#FFF3E0
    style Prod fill:#FFEBEE
```

## 7. Component Hierarchy

```mermaid
graph TD
    App["App.tsx<br/>(Root)"]
    
    subgraph Layout["Layout Components"]
        NotifProvider["NotificationProvider"]
        ThemeProvider["ThemeProvider"]
        Router["Router"]
    end
    
    subgraph Pages["Page Components"]
        Login["Login.tsx"]
        Dashboard["Dashboard.tsx"]
        Users["Users.tsx"]
        Analytics["Analytics.tsx"]
        AdminDash["AdminDashboard.tsx"]
    end
    
    subgraph Components["UI Components"]
        ClayCard["ClayCard"]
        ClayButton["ClayButton"]
        ClayInput["ClayInput"]
        Toast["Toast"]
    end
    
    subgraph Hooks["Custom Hooks"]
        UseAuth["useAuth()"]
        UseTenant["useTenant()"]
        UseNotification["useNotification()"]
    end
    
    App --> Layout
    Layout --> Router
    Router --> Pages
    Pages --> Components
    Pages --> Hooks
    Components --> Hooks
    
    style App fill:#2196F3
    style Layout fill:#4CAF50
    style Pages fill:#FF9800
    style Components fill:#9C27B0
    style Hooks fill:#F44336
```

## 8. Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ AUDIT_LOG : creates
    TENANT ||--o{ USER : contains
    TENANT ||--o{ API_KEY : has
    USER ||--o{ WEBHOOK_EVENT : triggers
    TENANT ||--o{ WEBHOOK_ENDPOINT : manages
    WEBHOOK_EVENT ||--o{ WEBHOOK_DELIVERY : creates
    TENANT ||--o{ USAGE_QUOTA : tracks
    
    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role "admin|user"
        uuid tenantId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    TENANT {
        uuid id PK
        string name UK
        enum plan "free|pro|enterprise"
        int usageQuota
        timestamp createdAt
        timestamp updatedAt
    }
    
    SESSION {
        uuid id PK
        uuid userId FK
        string token
        timestamp expiresAt
        timestamp createdAt
    }
    
    AUDIT_LOG {
        uuid id PK
        uuid userId FK
        string action
        string resource
        enum status "success|failure"
        string ipAddress
        string userAgent
        timestamp createdAt
    }
    
    API_KEY {
        uuid id PK
        uuid tenantId FK
        string keyHash
        timestamp createdAt
        timestamp expiresAt
    }
    
    WEBHOOK_ENDPOINT {
        uuid id PK
        uuid tenantId FK
        string url
        string secret
        boolean active
        timestamp createdAt
    }
    
    WEBHOOK_EVENT {
        uuid id PK
        uuid tenantId FK
        string eventType
        json payload
        timestamp createdAt
    }
    
    WEBHOOK_DELIVERY {
        uuid id PK
        uuid eventId FK
        uuid endpointId FK
        int httpStatus
        int retryCount
        timestamp createdAt
    }
    
    USAGE_QUOTA {
        uuid id PK
        uuid tenantId FK
        int apiCallsUsed
        int apiCallsLimit
        timestamp resetAt
        timestamp createdAt
    }
```

---

**All diagrams are created using Mermaid.js and can be rendered in any Markdown viewer or GitHub.**

