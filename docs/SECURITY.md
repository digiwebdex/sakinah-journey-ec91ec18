# Security Documentation — RAHE KABA Tours & Travels

> Security measures, authentication, authorization, and best practices
> **Last Updated:** March 26, 2026

---

## Authentication

### JWT-Based Authentication

| Parameter | Value |
|-----------|-------|
| Algorithm | HS256 |
| Token Expiry | 1 hour (configurable) |
| Refresh Token Expiry | 7 days (configurable) |
| Password Hashing | bcrypt (10 rounds) |
| Storage | localStorage (frontend) |

### Auth Flow

```
1. POST /api/auth/login { email, password }
2. Server: bcrypt.compare(password, hash)
3. Server: jwt.sign({ userId, email }, JWT_SECRET, { expiresIn })
4. Client: localStorage.setItem('token', token)
5. Client: All API calls → Authorization: Bearer <token>
6. Server: jwt.verify(token, JWT_SECRET) on protected routes
7. Server: Check user role for admin routes
```

### Session Management

- `useSessionTimeout` hook tracks user activity
- Auto-logout after configurable inactivity period
- Monitors: mouse, keyboard, scroll, touch events

---

## Authorization (RBAC)

### Role Types (8)

| Role | Level | Description |
|------|-------|-------------|
| `admin` | Full | Complete system access, settings, user management |
| `manager` | High | Booking + financial management |
| `staff` | Medium | Booking operations, basic payments |
| `accountant` | Medium | Financial modules only |
| `booking` | Low | Booking module only |
| `cms` | Low | CMS content management only |
| `viewer` | Read-only | View all admin modules, no edits |
| `user` | Customer | Customer portal only |

### Access Matrix

| Module | admin | manager | staff | accountant | booking | cms | viewer |
|--------|-------|---------|-------|------------|---------|-----|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Bookings | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 👁️ |
| Payments | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 👁️ |
| Customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 👁️ |
| Accounting | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 👁️ |
| Reports | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 👁️ |
| CMS | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | 👁️ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User Mgmt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Database Security

### Admin Protection Triggers

| Trigger | Purpose |
|---------|---------|
| `protect_admin_role_insert` | Prevents assigning admin role to non-primary admin |
| `protect_admin_role_update` | Prevents modifying primary admin's role |
| `protect_admin_role_delete` | Prevents removing primary admin's role |
| `protect_admin_user` | Prevents deleting or banning the primary admin user |

### SQL Injection Prevention

- All database queries use **parameterized queries** (pg library `$1, $2` syntax)
- No raw string interpolation in SQL
- Input validation on frontend (Zod schemas)

---

## API Security

| Measure | Implementation |
|---------|----------------|
| Authentication | JWT Bearer token on all protected routes |
| Authorization | Role check middleware for admin routes |
| CORS | Configured with `FRONTEND_URL` origin |
| File Upload Limit | 5MB maximum via Multer |
| Rate Limiting | Nginx level (`limit_req`) |
| HTTPS | SSL via Certbot (Let's Encrypt) |
| Input Validation | Zod schemas on frontend, parameterized queries on backend |

---

## Environment Security

### Protected Files

| File | Protection Method |
|------|-------------------|
| `.env` (root) | `git update-index --skip-worktree` |
| `server/.env` | `.gitignore` (never tracked) |

### Sensitive Variables

| Variable | Location | Notes |
|----------|----------|-------|
| `JWT_SECRET` | server/.env | Never expose publicly |
| `JWT_REFRESH_SECRET` | server/.env | Never expose publicly |
| `DATABASE_URL` | server/.env | Contains DB password |
| `BULKSMSBD_API_KEY` | server/.env | SMS service key |
| `RESEND_API_KEY` | server/.env | Email service key |

---

## Infrastructure Security

### Nginx

- HTTP → HTTPS redirect
- SSL/TLS with modern ciphers
- `client_max_body_size` limited
- Reverse proxy headers set (`X-Real-IP`, `X-Forwarded-For`)

### PM2

- Process auto-restart on crash
- Memory limit monitoring
- Log rotation

### PostgreSQL

- Dockerized (isolated from host)
- Custom port (5433, not default 5432)
- Password-protected access
- Local connections only (127.0.0.1)

---

## Best Practices

1. **Never commit secrets** — All API keys and passwords in `server/.env`
2. **Rotate JWT secrets** periodically
3. **Monitor logs** — `pm2 logs rahekaba-api` for suspicious activity
4. **Keep dependencies updated** — `npm audit` regularly
5. **Backup database** regularly — `pg_dump` to secure storage
6. **SSL renewal** — Certbot auto-renews, verify with `certbot certificates`
7. **Principle of least privilege** — Assign minimum required role to users
