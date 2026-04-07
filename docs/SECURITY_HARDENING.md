# Security Hardening Guide

## Overview

This document outlines comprehensive security hardening measures for WithU247+ to protect user data, prevent attacks, and ensure compliance with healthcare data protection standards.

---

## 1. Authentication & Authorization

### 1.1 JWT Implementation

**Configuration**:
```javascript
const jwt = require('jsonwebtoken');

// Generate token
const generateToken = (userId) => {
  return jwt.sign(
    { userId, role: 'user' },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h',
      algorithm: 'HS256',
      issuer: 'withu247',
      audience: 'withu247-app'
    }
  );
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'withu247',
      audience: 'withu247-app'
    });
  } catch (err) {
    throw new AppError('Invalid token', 401);
  }
};
```

**Best Practices**:
- ✅ Use strong secret (minimum 32 characters)
- ✅ Set appropriate expiration (24 hours)
- ✅ Include algorithm specification
- ✅ Validate issuer and audience
- ✅ Use HTTPS for token transmission
- ✅ Store tokens securely on client (HttpOnly cookies)

### 1.2 Password Security

**Requirements**:
```javascript
const validatePassword = (password) => {
  const rules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password)
  };
  
  return Object.values(rules).every(rule => rule);
};
```

**Password Hashing**:
```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // Recommended: 10 rounds
  return await bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

**Best Practices**:
- ✅ Minimum 8 characters
- ✅ Require uppercase, lowercase, numbers, special characters
- ✅ Use bcrypt with 10+ rounds
- ✅ Implement password reset with secure tokens
- ✅ Enforce password change on first login
- ✅ Prevent password reuse (last 5 passwords)
- ✅ Implement account lockout after 5 failed attempts

### 1.3 Role-Based Access Control (RBAC)

**Roles**:
```javascript
const roles = {
  USER: 'user',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  MODERATOR: 'moderator'
};

// Middleware for role checking
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

**Permission Matrix**:

| Action | User | Admin | Doctor | Moderator |
|--------|------|-------|--------|-----------|
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| View all users | ❌ | ✅ | ❌ | ✅ |
| Delete users | ❌ | ✅ | ❌ | ❌ |
| Moderate content | ❌ | ✅ | ❌ | ✅ |
| Access analytics | ❌ | ✅ | ❌ | ❌ |

---

## 2. Input Validation & Sanitization

### 2.1 Input Validation

**Validation Strategy**:
```javascript
const { body, validationResult } = require('express-validator');

// Validate email
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .trim();

// Validate password
const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);

// Validate message
const validateMessage = body('message')
  .trim()
  .isLength({ min: 1, max: 5000 })
  .escape();

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

### 2.2 Input Sanitization

**Sanitization Techniques**:
```javascript
const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');

// Sanitize HTML
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

// Prevent NoSQL injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Potential NoSQL injection attempt: ${key}`);
  }
}));
```

### 2.3 Output Encoding

```javascript
// Encode output for safe display
const encodeOutput = (data) => {
  return JSON.stringify(data)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

---

## 3. CORS & Headers Security

### 3.1 CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};

app.use(cors(corsOptions));
```

### 3.2 Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com']
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## 4. Rate Limiting & DDoS Protection

### 4.1 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body.email // Rate limit by email
});

app.use('/api/', limiter);
app.post('/api/auth/login', authLimiter, loginController);
app.post('/api/auth/register', authLimiter, registerController);
```

### 4.2 DDoS Protection

```javascript
// Implement request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  next();
});

// Implement request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));

// Implement connection limits
const server = app.listen(3000);
server.maxConnections = 1000;
```

---

## 5. Data Protection

### 5.1 Encryption at Rest

```javascript
const crypto = require('crypto');

// Encrypt sensitive data
const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt sensitive data
const decryptData = (encryptedData, key) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### 5.2 Encryption in Transit

```javascript
// Use HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 5.3 Data Masking

```javascript
// Mask sensitive data in logs
const maskSensitiveData = (data) => {
  const sensitiveFields = ['password', 'token', 'apiKey', 'ssn', 'creditCard'];
  
  const masked = { ...data };
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  });
  
  return masked;
};
```

---

## 6. Audit Logging

### 6.1 Security Event Logging

```javascript
const logSecurityEvent = async (event) => {
  const securityLog = {
    timestamp: new Date(),
    eventType: event.type,
    userId: event.userId,
    action: event.action,
    resource: event.resource,
    result: event.result,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    details: event.details
  };
  
  await SecurityLog.create(securityLog);
  
  // Alert on suspicious activity
  if (event.result === 'FAILED' && event.type === 'LOGIN') {
    await notifySecurityTeam(securityLog);
  }
};

// Log security events
logSecurityEvent({
  type: 'LOGIN',
  userId: user._id,
  action: 'USER_LOGIN',
  resource: 'AUTH',
  result: 'SUCCESS',
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

### 6.2 Audit Trail

```javascript
const createAuditEntry = async (userId, action, resource, changes) => {
  const auditEntry = {
    userId,
    action,
    resource,
    changes,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  };
  
  await AuditLog.create(auditEntry);
};
```

---

## 7. Vulnerability Management

### 7.1 Dependency Scanning

```bash
# Regular dependency audits
npm audit
npm audit fix

# Check for vulnerabilities
npm outdated

# Use security scanning tools
snyk test
```

### 7.2 Security Scanning

```bash
# SAST (Static Application Security Testing)
npm install --save-dev eslint-plugin-security
npm install --save-dev sonarqube-scanner

# DAST (Dynamic Application Security Testing)
npm install --save-dev owasp-zap-cli

# Dependency checking
npm install --save-dev npm-check-updates
```

### 7.3 Patch Management

```javascript
// Automated patch management
const schedule = require('node-schedule');

schedule.scheduleJob('0 2 * * 0', async () => {
  // Check for security updates every Sunday at 2 AM
  await checkForSecurityUpdates();
  await applySecurityPatches();
  await runSecurityTests();
});
```

---

## 8. Incident Response

### 8.1 Incident Response Plan

**Procedures**:
1. **Detection**: Monitor logs and alerts for suspicious activity
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze logs and gather evidence
4. **Remediation**: Fix vulnerabilities and restore systems
5. **Recovery**: Restore services and data
6. **Post-Incident**: Review and improve processes

### 8.2 Breach Notification

```javascript
const notifyBreach = async (breachDetails) => {
  // Notify affected users
  const affectedUsers = await User.find({ 
    _id: { $in: breachDetails.userIds } 
  });
  
  for (const user of affectedUsers) {
    await sendBreachNotification(user.email, breachDetails);
  }
  
  // Notify authorities (if required)
  await notifyRegulatoryAuthorities(breachDetails);
  
  // Log incident
  await createIncidentReport(breachDetails);
};
```

---

## 9. Compliance & Standards

### 9.1 HIPAA Compliance

**Requirements**:
- ✅ Encryption of PHI (Protected Health Information)
- ✅ Access controls and audit logs
- ✅ Data integrity checks
- ✅ Secure authentication
- ✅ Breach notification procedures
- ✅ Business Associate Agreements (BAAs)

### 9.2 GDPR Compliance

**Requirements**:
- ✅ Data subject rights (access, deletion, portability)
- ✅ Privacy by design
- ✅ Data protection impact assessments
- ✅ Consent management
- ✅ Breach notification within 72 hours
- ✅ Data Processing Agreements (DPAs)

### 9.3 OWASP Top 10

| Vulnerability | Mitigation |
|---------------|-----------|
| Injection | Input validation, parameterized queries |
| Broken Authentication | JWT, bcrypt, MFA |
| Sensitive Data Exposure | Encryption, HTTPS, masking |
| XML External Entities | Disable XML parsing |
| Broken Access Control | RBAC, JWT validation |
| Security Misconfiguration | Secure defaults, env vars |
| XSS | Input sanitization, output encoding |
| Insecure Deserialization | JSON schema validation |
| Using Components with Known Vulnerabilities | Dependency scanning |
| Insufficient Logging | Comprehensive audit logging |

---

## 10. Security Testing

### 10.1 Penetration Testing

```bash
# Test for common vulnerabilities
npm install --save-dev owasp-zap-cli

# Run penetration tests
zap-cli quick-scan --self-contained http://localhost:3000
```

### 10.2 Security Test Cases

```javascript
describe('Security Tests', () => {
  test('Should prevent SQL injection', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "'; DROP TABLE users; --",
        password: 'password'
      });
    
    expect(response.status).toBe(400);
  });
  
  test('Should prevent XSS attacks', async () => {
    const response = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: '<script>alert("XSS")</script>'
      });
    
    expect(response.body.data.message).not.toContain('<script>');
  });
  
  test('Should enforce rate limiting', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });
    }
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    
    expect(response.status).toBe(429); // Too Many Requests
  });
});
```

---

## 11. Security Checklist

### Pre-Deployment

- [ ] All dependencies updated and audited
- [ ] No hardcoded credentials or API keys
- [ ] All environment variables documented
- [ ] HTTPS configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Output encoding implemented
- [ ] Security headers configured
- [ ] Logging and monitoring enabled
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented

### Post-Deployment

- [ ] Monitor security logs regularly
- [ ] Review access logs for suspicious activity
- [ ] Perform weekly security scans
- [ ] Update dependencies monthly
- [ ] Conduct quarterly security audits
- [ ] Perform annual penetration testing
- [ ] Review and update security policies
- [ ] Train team on security best practices

---

## 12. Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/
- **Express.js Security**: https://expressjs.com/en/advanced/best-practice-security.html

---

## Contact

For security concerns or vulnerability reports, contact: **security@withu247.com**

**Responsible Disclosure**: Please report security vulnerabilities responsibly and do not publicly disclose until a fix is available.
