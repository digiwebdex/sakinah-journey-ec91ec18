# API Reference — RAHE KABA Tours & Travels

> Complete API endpoint documentation for the Express backend
> **Last Updated:** March 26, 2026

---

## Base URL

```
Production: https://rahekabatravels.com/api
Local:      http://localhost:3001/api
```

## Authentication

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST `/api/auth/register`

Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+8801XXXXXXXXX"
}
```

**Response:** `201`
```json
{
  "token": "jwt_token_here",
  "user": { "id": "uuid", "email": "...", "role": "user" }
}
```

### POST `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200`
```json
{
  "token": "jwt_token_here",
  "user": { "id": "uuid", "email": "...", "role": "admin" }
}
```

### GET `/api/auth/me`

Get current authenticated user with role and profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200`
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "profile": { "full_name": "Admin", "phone": "..." }
  }
}
```

### POST `/api/auth/change-password`

Change password (authenticated users).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

## CRUD Endpoints (Generic Pattern)

All resource endpoints follow this pattern:

### GET `/api/{resource}`

List all records with optional filters.

**Query Parameters:**
- `limit` — Max records (default: 1000)
- `offset` — Pagination offset
- `order` — Column to order by
- `ascending` — `true` or `false` (default: true)
- Any column name as filter: `?status=active&type=hajj`
- `select` — Column selection (comma-separated)

### GET `/api/{resource}/:id`

Get single record by ID.

### POST `/api/{resource}`

Create new record. Body: JSON object with column values.

### PUT `/api/{resource}/:id`

Update existing record. Body: JSON object with updated columns.

### DELETE `/api/{resource}/:id`

Delete record by ID.

---

## Available Resources

### Public (No Auth for Read)

| Endpoint | Notes |
|----------|-------|
| `/api/packages` | Write requires auth |
| `/api/hotels` | Write requires auth |
| `/api/hotel-rooms` | Write requires auth |
| `/api/site-content` | CMS content; write requires auth |
| `/api/blog-posts` | Write requires auth |

### Authenticated

| Endpoint | Notes |
|----------|-------|
| `/api/bookings` | Customer + admin |
| `/api/booking-members` | Linked to bookings |
| `/api/payments` | Payment records |
| `/api/profiles` | User profiles |
| `/api/booking-documents` | Uploaded documents |
| `/api/hotel-bookings` | Hotel reservations |
| `/api/installment-plans` | Payment plan definitions |

### Admin Only

| Endpoint | Notes |
|----------|-------|
| `/api/moallems` | Moallem agent management |
| `/api/moallem-payments` | Payments to moallems |
| `/api/moallem-commission-payments` | Commission payments |
| `/api/moallem-items` | Moallem items/services |
| `/api/supplier-agents` | Supplier agent management |
| `/api/supplier-agent-payments` | Payments to suppliers |
| `/api/supplier-agent-items` | Supplier items |
| `/api/supplier-contracts` | Supplier contracts |
| `/api/supplier-contract-payments` | Contract payments |
| `/api/accounts` | Chart of accounts (wallets) |
| `/api/transactions` | Financial transaction ledger |
| `/api/expenses` | Expense tracking |
| `/api/daily-cashbook` | Daily cash entries |
| `/api/financial-summary` | Aggregated financial data |
| `/api/notification-settings` | Notification config |
| `/api/notification-logs` | Notification history |
| `/api/cms-versions` | CMS version history |
| `/api/company-settings` | App-wide settings |
| `/api/refunds` | Refund management |
| `/api/cancellation-policies` | Cancellation rules |
| `/api/user-roles` | Role assignments |
| `/api/otp-codes` | OTP verification |

---

## Special Endpoints

### POST `/api/upload`

Upload a file (image, document).

**Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`

**Body:** FormData with `file` field

**Response:**
```json
{
  "url": "/uploads/1234567890-filename.jpg"
}
```

### GET `/api/backup`

Download database backup (admin only).

**Response:** SQL file download

### POST `/api/backup/restore`

Restore from backup SQL file (admin only).

**Body:** FormData with SQL backup file

---

## Views (Read-Only)

These are database views accessible via the standard GET pattern:

| View | Purpose |
|------|---------|
| `/api/v-booking-profit` | Booking profit analysis |
| `/api/v-customer-profit` | Customer profitability |
| `/api/v-package-profit` | Package profitability |

---

## Error Responses

```json
{
  "error": "Error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Not authenticated (missing/invalid token) |
| 403 | Not authorized (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate entry) |
| 413 | Payload too large (file > 5MB) |
| 500 | Internal server error |

---

## Request Examples

### Create a Package

```bash
curl -X POST https://rahekabatravels.com/api/packages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Umrah 2026",
    "type": "umrah",
    "price": 250000,
    "duration_days": 14,
    "description": "Premium Umrah package",
    "is_active": true,
    "show_on_website": true
  }'
```

### List Bookings (with filters)

```bash
curl "https://rahekabatravels.com/api/bookings?status=confirmed&limit=10&order=created_at&ascending=false" \
  -H "Authorization: Bearer <token>"
```

### Upload a File

```bash
curl -X POST https://rahekabatravels.com/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@receipt.jpg"
```
