# Security Best Practices

## Overview
This document outlines the security measures implemented in the Diet Management System API.

## Security Features

### 1. Helmet - Security Headers
Helmet helps secure the app by setting various HTTP headers:

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filter

### 2. Input Sanitization
All user input is sanitized to prevent:
- **XSS Attacks**: HTML/JavaScript injection
- **SQL Injection**: Malicious SQL queries (also prevented by Prisma)
- **NoSQL Injection**: MongoDB-style injection

### 3. Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Role-Based Access Control (RBAC)**: Admin, Dietitian roles
- **Policy-Based Authorization**: Fine-grained access control

### 4. Data Encryption
- **At Rest**: AES-256-GCM encryption for sensitive data
- **In Transit**: TLS/SSL for all connections (production)
- **Password Hashing**: bcrypt with salt rounds

### 5. CSRF Protection
- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Origin validation

### 6. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- DDoS mitigation

### 7. SQL Injection Prevention
- **Prisma ORM**: Parameterized queries
- **Input Validation**: class-validator decorators
- **Input Sanitization**: Remove SQL keywords

## Environment Variables

### Required Secrets
```bash
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=            # JWT signing key (min 32 chars)
JWT_REFRESH_SECRET=    # Refresh token key (min 32 chars)
ENCRYPTION_KEY=        # Data encryption key (32 chars)
```

### Security Settings
```bash
ENABLE_CSRF=true
ENABLE_HELMET=true
CORS_ORIGIN=           # Allowed origins
```

## Secret Management

### Development
- Use `.env` file (never commit!)
- Use strong, random keys
- Rotate secrets regularly

### Production
Integrate with secret management services:
- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**
- **Google Secret Manager**

## TLS/SSL Configuration

### Development
```bash
# Use self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### Production
- Use Let's Encrypt for free SSL
- Configure reverse proxy (nginx/Apache)
- Enable HSTS
- Use TLS 1.2+ only

## Data Encryption

### Encrypting Sensitive Fields
```typescript
import { EncryptionService } from '@infrastructure/security';

// Encrypt
const encrypted = encryptionService.encrypt('sensitive-data');

// Decrypt
const decrypted = encryptionService.decrypt(encrypted);
```

### Fields to Encrypt
- Social Security Numbers
- Credit Card Numbers
- Medical Records
- Personal Health Information

## Security Checklist

### Before Deployment
- [ ] Change all default secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up secret management
- [ ] Enable security headers (Helmet)
- [ ] Configure CSRF protection
- [ ] Set up monitoring/alerting
- [ ] Run security audit (npm audit)
- [ ] Perform penetration testing

### Regular Maintenance
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Monitor failed login attempts
- [ ] Audit user permissions
- [ ] Review security policies

## Common Vulnerabilities

### Prevented
✅ SQL Injection (Prisma + sanitization)
✅ XSS (Input sanitization + CSP)
✅ CSRF (CSRF tokens)
✅ Clickjacking (X-Frame-Options)
✅ MIME Sniffing (X-Content-Type-Options)
✅ Brute Force (Rate limiting)
✅ Session Hijacking (Secure cookies + HTTPS)

### Additional Considerations
⚠️ DDoS - Use CDN/WAF (Cloudflare, AWS Shield)
⚠️ API Abuse - Implement API keys for third-party access
⚠️ Data Leakage - Minimize logged sensitive data

## Incident Response

### In Case of Security Breach
1. **Isolate**: Disconnect affected systems
2. **Assess**: Determine scope and impact
3. **Contain**: Stop the breach
4. **Eradicate**: Remove threat
5. **Recover**: Restore services
6. **Review**: Post-incident analysis

### Contact
Security issues: security@dietapp.com
