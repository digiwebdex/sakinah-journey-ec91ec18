# RAHE KABA Tours & Travels — Developer Documentation (A-Z)

> **Last Updated:** March 26, 2026
> **Version:** 2.x
> **Repository:** https://github.com/digiwebdex/rahe-kaba-journeys-44e58262

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Directory Structure](#4-directory-structure)
5. [Frontend](#5-frontend)
6. [Backend (Server)](#6-backend-server)
7. [Database](#7-database)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [CMS System](#10-cms-system)
11. [SEO System](#11-seo-system)
12. [Notification System](#12-notification-system)
13. [PDF & Report Generation](#13-pdf--report-generation)
14. [Admin ERP Panel](#14-admin-erp-panel)
15. [Deployment](#15-deployment)
16. [Environment Variables](#16-environment-variables)
17. [API Reference](#17-api-reference)
18. [Security](#18-security)
19. [Testing](#19-testing)
20. [GitHub & Project Transfer](#20-github--project-transfer)
21. [Troubleshooting](#21-troubleshooting)

---

## 1. Project Overview

RAHE KABA Tours & Travels is a full-stack Hajj & Umrah travel management ERP system. It features:

- **Public Website** — Bilingual (Bangla/English) landing page with packages, hotels, services, testimonials, guideline sections, SEO optimized
- **Customer Portal** — Booking, payment tracking, invoice downloads, document uploads
- **Admin ERP** — Complete business management: bookings, payments, customers, moallems, supplier agents, accounting, reports, CMS, SEO, notifications, settings
- **Self-Hosted** — Runs entirely on a VPS with PostgreSQL, Node.js/Express, Nginx

---

## 2. Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  React/Vite (SPA)   │────▶│  Node.js/Express API │────▶│  PostgreSQL DB  │
│  Port: 80/443       │     │  Port: 3001          │     │  Port: 5433     │
│  (Nginx reverse)    │     │  (PM2 managed)       │     │  (Docker)       │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
```

### Component Overview

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express (self-hosted on VPS)
- **Database:** PostgreSQL (Dockerized on VPS, port 5433)
- **Process Manager:** PM2 (`rahekaba-api`)
- **Web Server:** Nginx (serves static build + reverse proxy to API)
- **SSL:** Certbot (Let's Encrypt)

### Request Flow

```
Browser → Nginx (port 80/443)
  ├── Static files → /var/www/.../dist/
  ├── /api/* → proxy to localhost:3001
  └── /uploads/* → serve from server/uploads/
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React + TypeScript | 18.3.1 |
| Build Tool | Vite | 5.4.19 |
| Styling | Tailwind CSS + shadcn/ui | 3.4.17 |
| State Management | React Query (TanStack) | 5.83.0 |
| Routing | React Router | 6.30.1 |
| Animation | Framer Motion | 12.34.3 |
| Charts | Recharts | 2.15.4 |
| PDF Generation | jsPDF + jspdf-autotable | 4.2.0 |
| Excel Export | xlsx (SheetJS) | 0.18.5 |
| QR Code | qrcode | 1.5.4 |
| SEO | react-helmet-async | 2.0.5 |
| Validation | Zod + react-hook-form | 3.25.76 |
| Backend | Node.js + Express | 4.21.0 |
| Database | PostgreSQL | 14+ |
| Auth | JWT (bcrypt + jsonwebtoken) | — |
| File Upload | Multer | 1.4.5 |
| Process Manager | PM2 | latest |

---

## 4. Directory Structure

```
/
├── docs/                           # Documentation files
│   ├── ANALYTICAL_HISTORY.md
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── CHANGE_HISTORY.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_COMMANDS.md
│   ├── DEPLOYMENT_HISTORY.md
│   ├── DEVELOPER_DOCUMENTATION.md
│   ├── GITHUB_SETUP.md
│   ├── SECURITY.md
│   └── TROUBLESHOOTING.md
├── public/
│   ├── robots.txt                  # SEO crawl rules
│   ├── sitemap.xml                 # SEO sitemap
│   └── placeholder.svg
├── scripts/
│   └── generate-sitemap.cjs        # Sitemap generator script
├── server/                         # Backend Express API
│   ├── config/database.js          # PostgreSQL connection pool
│   ├── middleware/auth.js          # JWT authentication middleware
│   ├── routes/auth.js              # Authentication routes
│   ├── index.js                    # Main API server (all routes)
│   ├── schema.sql                  # Complete database schema (1268 lines)
│   ├── migrate.sh                  # VPS migration script
│   ├── migrate-from-supabase.js    # Data migration from Supabase
│   ├── migrate-payments.js         # Payment data migration
│   ├── backup-to-gdrive.sh         # Google Drive backup script
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Environment variable template
│   ├── DEPLOY.md                   # VPS deployment guide
│   ├── MIGRATION_NOTES.md          # Migration notes
│   └── uploads/                    # File upload storage
│       ├── receipts/
│       ├── documents/
│       ├── packages/
│       ├── hotels/
│       └── backups/
├── src/
│   ├── assets/                     # Images, logos, fonts
│   ├── components/
│   │   ├── admin/                  # Admin panel components (15+ files)
│   │   ├── booking/                # Booking flow components
│   │   ├── ui/                     # shadcn/ui components (45+ files)
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx         # 3-image carousel
│   │   ├── ServicesSection.tsx
│   │   ├── FacilitiesSection.tsx
│   │   ├── PackagesSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── GuidelineSection.tsx
│   │   ├── VideoGuideSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── Footer.tsx
│   │   ├── WhatsAppFloat.tsx
│   │   ├── BackToTop.tsx
│   │   ├── SEOHead.tsx             # Dynamic SEO meta tags
│   │   ├── AdminCmsEditor.tsx
│   │   └── DocumentUpload.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useSectionVisibility.ts
│   │   ├── useSessionTimeout.ts
│   │   ├── useSiteContent.ts
│   │   └── useUserRole.ts
│   ├── i18n/
│   │   ├── LanguageContext.tsx      # Language provider + hook
│   │   └── translations.ts         # All translation strings (350+ keys)
│   ├── lib/
│   │   ├── api.ts                  # API client (Supabase proxy to self-hosted)
│   │   ├── invoiceGenerator.ts     # PDF invoice generation
│   │   ├── entityPdfGenerator.ts   # PDF for moallem/supplier reports
│   │   ├── reportExport.ts         # Excel export utility
│   │   ├── pdfFontLoader.ts        # Bengali font loading for PDFs
│   │   ├── pdfSignature.ts         # Digital signature for invoices
│   │   ├── pdfQrCode.ts            # QR code generation
│   │   ├── phoneValidation.ts      # Phone number validation
│   │   └── utils.ts                # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── admin/                  # 22 admin page components
│   │   ├── Index.tsx               # Homepage
│   │   ├── Auth.tsx                # Login/Register
│   │   ├── Dashboard.tsx           # Customer dashboard
│   │   ├── Booking.tsx             # Booking flow
│   │   ├── Packages.tsx
│   │   ├── PackageDetail.tsx
│   │   ├── Hotels.tsx
│   │   ├── HotelDetail.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── TrackBooking.tsx
│   │   ├── InvoicePage.tsx
│   │   ├── VerifyInvoice.tsx
│   │   ├── ResetPassword.tsx
│   │   └── NotFound.tsx
│   └── integrations/
│       └── supabase/
│           ├── client.ts           # Auto-generated (DO NOT EDIT)
│           └── types.ts            # Auto-generated (DO NOT EDIT)
├── supabase/
│   ├── config.toml                 # Supabase project config
│   └── functions/                  # Edge functions (12 functions)
├── index.html                      # HTML entry point with SEO meta
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

---

## 5. Frontend

### Key Patterns

- **Lazy Loading:** All non-homepage routes use `React.lazy()` + `Suspense`
- **Design System:** All colors use semantic HSL tokens in `index.css` + `tailwind.config.ts`
- **Component Library:** shadcn/ui with custom variants
- **API Client:** `src/lib/api.ts` exports `supabase` client that proxies to self-hosted backend

### Important Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API client, Supabase proxy, `getUser()` helper |
| `src/lib/invoiceGenerator.ts` | PDF invoice generation |
| `src/lib/entityPdfGenerator.ts` | PDF generation for moallem/supplier reports |
| `src/lib/reportExport.ts` | Excel export utility |
| `src/lib/pdfFontLoader.ts` | Bengali font loading for PDFs |
| `src/lib/pdfSignature.ts` | Digital signature for invoices |
| `src/lib/pdfQrCode.ts` | QR code generation for invoices |
| `src/components/SEOHead.tsx` | Dynamic SEO meta tag component |

### Hero Section

- 3 auto-sliding images (Kaaba, Medina, Hotel) with 5-second interval
- Navigation arrows and dot indicators
- Quranic verse with Arabic + Bengali translation

### Language System

- Default language: **Bangla (bn)**
- Toggle: English ↔ Bangla via Globe button in navbar
- Stored in `localStorage` key `rk_language`
- All translations in `src/i18n/translations.ts`

### Design Tokens

All colors defined as HSL in `index.css`:

```css
:root {
  --background: 40 30% 96%;
  --foreground: 30 20% 15%;
  --primary: 36 70% 50%;
  --secondary: 30 15% 90%;
  --muted: 30 10% 92%;
  --accent: 36 60% 45%;
  /* ... etc */
}
```

---

## 6. Backend (Server)

### Location: `server/`

### Entry Point: `server/index.js`

The backend uses a generic CRUD helper pattern:

```javascript
const createCrudRoutes = (tableName, options = {}) => { ... }
```

This generates standard REST endpoints for any table:
- `GET /api/{table}` — List with filters, pagination, ordering
- `GET /api/{table}/:id` — Get single record
- `POST /api/{table}` — Create
- `PUT /api/{table}/:id` — Update
- `DELETE /api/{table}/:id` — Delete

### Custom Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login (JWT) |
| `/api/auth/me` | GET | Get current user + role + profile |
| `/api/auth/change-password` | POST | Admin password change |
| `/api/upload` | POST | File upload (multipart) |
| `/api/backup` | GET | Download database backup |
| `/api/backup/restore` | POST | Restore from SQL backup |

### CRUD Resources (30+)

`packages`, `hotels`, `hotel-rooms`, `bookings`, `booking-members`, `payments`, `profiles`, `moallems`, `moallem-payments`, `moallem-commission-payments`, `moallem-items`, `supplier-agents`, `supplier-agent-payments`, `supplier-agent-items`, `supplier-contracts`, `supplier-contract-payments`, `accounts`, `transactions`, `expenses`, `daily-cashbook`, `financial-summary`, `notification-settings`, `notification-logs`, `site-content`, `cms-versions`, `blog-posts`, `company-settings`, `installment-plans`, `booking-documents`, `hotel-bookings`, `refunds`, `cancellation-policies`, `otp-codes`, `user-roles`

### Database Connection

```javascript
// server/config/database.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

---

## 7. Database

### Engine: PostgreSQL (Dockerized, port 5433)

### Connection

```bash
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1
```

### Schema: `server/schema.sql` (1268 lines)

### Tables (28)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Authentication | email, password_hash, is_banned |
| `user_roles` | Role assignments | user_id, role (enum) |
| `profiles` | User profile data | full_name, phone, passport, NID |
| `packages` | Hajj/Umrah/Tour packages | name, type, price, features (JSONB) |
| `bookings` | Customer bookings | tracking_id, package_id, total_amount, status |
| `booking_members` | Travelers per booking | full_name, passport, selling_price |
| `payments` | Payment records | amount, method, status, wallet_account_id |
| `moallems` | Moallem agents | name, contracted_hajji, total_deposit, total_due |
| `moallem_payments` | Payments to moallems | amount, booking_id |
| `moallem_commission_payments` | Commission payments | amount, booking_id |
| `moallem_items` | Moallem items/services | description, quantity, unit_price |
| `supplier_agents` | Supplier agents | agent_name, contracted_amount |
| `supplier_agent_payments` | Payments to suppliers | amount, booking_id |
| `supplier_agent_items` | Supplier items | description, quantity |
| `supplier_contracts` | Supplier contracts | contract_amount, pilgrim_count |
| `supplier_contract_payments` | Contract payments | amount, payment_date |
| `hotels` | Hotel listings | name, city, star_rating, gallery (JSONB) |
| `hotel_rooms` | Room details | name, price_per_night, capacity |
| `hotel_bookings` | Hotel reservations | check_in, check_out, total_price |
| `accounts` | Chart of accounts | name, type, balance |
| `transactions` | Financial ledger | type, debit, credit, category |
| `expenses` | Expense records | title, amount, category |
| `daily_cashbook` | Daily cash entries | type, amount, category, wallet_account_id |
| `financial_summary` | Aggregated financials | total_income, total_expense, net_profit |
| `site_content` | CMS content (JSONB) | section_key, content |
| `cms_versions` | CMS version history | section_key, content, note |
| `blog_posts` | Blog content | title, slug, content, status |
| `notification_settings` | Notification config | event_key, sms_enabled, email_enabled |
| `notification_logs` | Notification history | channel, status, message |
| `company_settings` | App-wide settings | setting_key, setting_value (JSONB) |
| `booking_documents` | Uploaded documents | document_type, file_path |
| `installment_plans` | Installment definitions | name, num_installments |
| `cancellation_policies` | Cancellation rules | refund_type, refund_value |
| `refunds` | Refund records | refund_amount, deduction_amount |
| `otp_codes` | OTP verification | phone, code, expires_at |

### Views (3)

| View | Purpose |
|------|---------|
| `v_booking_profit` | Booking profit analysis (joins bookings + packages + expenses) |
| `v_customer_profit` | Customer profitability (aggregates per user) |
| `v_package_profit` | Package profitability (aggregates per package) |

### Security Triggers

| Trigger | Purpose |
|---------|---------|
| `protect_admin_role_insert` | Prevents assigning admin role to non-primary admin |
| `protect_admin_role_update` | Prevents changing primary admin's role |
| `protect_admin_role_delete` | Prevents deleting primary admin's role |
| `protect_admin_user` | Prevents deleting/banning primary admin user |

---

## 8. Authentication & Authorization

### Flow

1. User registers via `POST /api/auth/register` (email + password + phone)
2. Password is hashed with `bcrypt` (10 rounds)
3. JWT token issued on login (24h expiry)
4. Frontend stores token in `localStorage`
5. All protected API calls include `Authorization: Bearer <token>` header
6. Server validates JWT on protected routes
7. Server checks user role for admin routes

### Roles (8 total)

| Role | Dashboard | Bookings | Payments | Accounting | Reports | CMS | Settings |
|------|-----------|----------|----------|------------|---------|-----|----------|
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manager` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `staff` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `accountant` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `booking` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `cms` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `viewer` | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| `user` | Customer portal only |

### Session Timeout

- Configured via `useSessionTimeout` hook
- Auto-logout after inactivity period
- Tracks mouse, keyboard, scroll, touch events

---

## 9. Internationalization (i18n)

### Files

- `src/i18n/LanguageContext.tsx` — Provider + `useLanguage()` hook
- `src/i18n/translations.ts` — All translation strings (350+ keys)

### Default Language: **Bangla (bn)**

### Usage

```tsx
const { t, language, setLanguage } = useLanguage();
// t("nav.home") → "হোম" (in Bangla) or "Home" (in English)
```

### CMS Override Priority

1. Language-specific CMS data from database
2. Hardcoded Bangla/English translations
3. English fallback

### Admin Panel

Admin ERP is **English-only** (data entries may be in Bengali).

---

## 10. CMS System

### Storage: `site_content` table

Content is stored as JSONB with `en` and `bn` keys:

```json
{
  "en": { "heading": "Welcome", "description": "..." },
  "bn": { "heading": "স্বাগতম", "description": "..." }
}
```

### Managed Sections (13)

| Section Key | Component | Editable Fields |
|-------------|-----------|-----------------|
| `hero` | HeroSection | Title, subtitle, CTA, images |
| `navbar` | Navbar | Phone number, branding |
| `services` | ServicesSection | Service cards (title, description, icon) |
| `about` | AboutSection | About content, mission, values |
| `packages` | PackagesSection | Package display settings |
| `testimonials` | TestimonialsSection | Customer reviews |
| `facilities` | FacilitiesSection | Facility cards |
| `gallery` | GallerySection | Gallery images |
| `guideline` | GuidelineSection | Guidelines content |
| `video_guide` | VideoGuideSection | Video URLs, descriptions |
| `contact` | ContactSection | Contact info, form settings |
| `whatsapp` | WhatsAppFloat | WhatsApp number, label |
| `footer` | Footer | Footer content, links |

### Version History

Every CMS update creates a record in `cms_versions` for rollback capability.

### Section Visibility

Sections can be shown/hidden via `SectionVisibilityManager` component.

---

## 11. SEO System

### Components

- `src/components/SEOHead.tsx` — Dynamic meta tags per page
- `src/pages/admin/AdminSeoPage.tsx` — Admin SEO settings management

### Features

| Feature | Implementation |
|---------|----------------|
| Page Titles | Dynamic via react-helmet-async |
| Meta Descriptions | Per-page, customizable from admin |
| Open Graph Tags | Title, description, image, URL |
| Twitter Cards | Summary large image |
| JSON-LD | TravelAgency + BreadcrumbList |
| Sitemap | `public/sitemap.xml` |
| Robots.txt | `public/robots.txt` |
| Canonical URLs | Per page |
| Google Analytics | GA4 configurable from admin |
| Search Console | Verification meta tag from admin |
| Facebook Pixel | Configurable from admin |

### Admin SEO Settings

Stored in `site_content` table with `section_key = 'seo_settings'`:

```json
{
  "siteTitle": "...",
  "siteDescription": "...",
  "siteKeywords": "...",
  "ogImage": "...",
  "googleAnalyticsId": "G-XXXXXXX",
  "googleVerification": "...",
  "facebookPixelId": "...",
  "pageOverrides": {
    "/packages": { "title": "...", "description": "..." }
  }
}
```

---

## 12. Notification System

### Channels

- **SMS** — Via configured SMS API (BulkSMS BD or similar)
- **Email** — Via SMTP/Resend configuration

### Configuration

Admin → Settings → SMS/Email Configuration:
- SMTP: host, port, user, password
- SMS: API endpoint, API key, sender ID

### Notification Events

| Event | SMS | Email |
|-------|-----|-------|
| Booking Created | ✅ | ✅ |
| Payment Received | ✅ | ✅ |
| Payment Due Reminder | ✅ | ✅ |
| Booking Status Update | ✅ | ✅ |

### Logs

All notifications logged in `notification_logs` table with delivery status.

---

## 13. PDF & Report Generation

### Invoice PDF

- Generated via `jsPDF` + `jspdf-autotable`
- Includes: company logo, QR code, digital signature
- Bengali font support via custom font loader
- QR code links to verification URL (`/verify/:invoiceNumber`)

### Report Types

| Report | Format | Source |
|--------|--------|--------|
| Booking Report | PDF/Excel | bookings, booking_members |
| Customer Financial Report | PDF | profiles, bookings, payments |
| Moallem Payment Report | PDF | moallems, moallem_payments |
| Supplier Payment Report | PDF | supplier_agents, supplier_agent_payments |
| Accounting Ledger | PDF/Excel | transactions, expenses |
| Daily Cashbook | PDF/Excel | daily_cashbook |
| Receivables Report | PDF/Excel | bookings (due_amount > 0) |
| Package Profit Analysis | PDF/Excel | v_package_profit view |
| Refund Report | PDF/Excel | refunds |

---

## 14. Admin ERP Panel

### URL: `/admin`

### Modules (22)

| Module | Route | Features |
|--------|-------|----------|
| Dashboard | `/admin` | Charts, stats, recent activity, revenue overview |
| Bookings | `/admin/bookings` | CRUD, status management, invoice generation |
| Create Booking | `/admin/bookings/create` | Multi-step form, guest/member booking |
| Customers | `/admin/customers` | Profiles, booking history, financial reports |
| Packages | `/admin/packages` | CRUD, image upload, website visibility toggle |
| Payments | `/admin/payments` | Record payments, receipt upload, status tracking |
| Moallems | `/admin/moallems` | Agent CRUD, payment/commission tracking |
| Moallem Profile | `/admin/moallems/:id` | Detailed profile with items/payments/commissions |
| Supplier Agents | `/admin/supplier-agents` | Supplier CRUD, contract management |
| Supplier Profile | `/admin/supplier-agents/:id` | Detailed profile with contracts/payments/items |
| Accounting | `/admin/accounting` | Transactions, expenses, cashbook tabs |
| Chart of Accounts | `/admin/chart-of-accounts` | Wallet/bank account management |
| Receivables | `/admin/receivables` | Due payment tracking |
| Due Alerts | `/admin/due-alerts` | Overdue payment alerts |
| Refunds | `/admin/refunds` | Refund management with cancellation policies |
| Reports | `/admin/reports` | Comprehensive financial/business reports |
| Analytics | `/admin/analytics` | Visual analytics with charts |
| Calculator | `/admin/calculator` | Profit calculator tool |
| Hotels | `/admin/hotels` | Hotel/room management, gallery |
| Notifications | `/admin/notifications` | Notification logs & settings |
| CMS | `/admin/cms` | Full website content management |
| SEO | `/admin/seo` | SEO settings, meta tags, tracking codes |
| Settings | `/admin/settings` | Password, backup/restore, SMS/Email config |

---

## 15. Deployment

### VPS Information

| Field | Value |
|-------|-------|
| Server | srv1468666 (Hostinger) |
| Project Path | `/var/www/rahe-kaba-journeys-72ccca69` |
| PM2 Process | `rahekaba-api` |
| API Port | 3001 |
| DB Port | 5433 (Docker) |
| Repository | https://github.com/digiwebdex/rahe-kaba-journeys-44e58262 |

### Quick Deploy

```bash
cd /var/www/rahe-kaba-journeys-72ccca69 && git pull origin main && npm run build && pm2 restart rahekaba-api
```

### Full Deploy (with new packages)

```bash
cd /var/www/rahe-kaba-journeys-72ccca69 && git pull origin main && npm install && npm run build && pm2 restart rahekaba-api
```

After deploy, hard refresh browser: `Ctrl + Shift + R`

---

## 16. Environment Variables

### Frontend (`.env`) — Auto-managed, DO NOT EDIT

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | API base URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | API key |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |

> On VPS, `.env` is overridden to: `VITE_API_URL=/api`

### Backend (`server/.env`) — Manual, Git-ignored

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `JWT_EXPIRES_IN` | Token expiry (default: 1h) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `PORT` | API server port (default: 3001) |
| `FRONTEND_URL` | CORS origin URL |
| `UPLOAD_DIR` | File upload directory |
| `BULKSMSBD_API_KEY` | SMS API key |
| `BULKSMSBD_SENDER_ID` | SMS sender ID |
| `RESEND_API_KEY` | Email API key |
| `NOTIFICATION_FROM_EMAIL` | From email address |

> ⚠️ `.env` files are git-ignored and protected with `git update-index --skip-worktree`

---

## 17. API Reference

See `docs/API_REFERENCE.md` for complete endpoint documentation.

### Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | No | User registration |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/change-password` | POST | Yes | Change password |
| `/api/{resource}` | GET | Varies | List records |
| `/api/{resource}/:id` | GET | Varies | Get single record |
| `/api/{resource}` | POST | Yes | Create record |
| `/api/{resource}/:id` | PUT | Yes | Update record |
| `/api/{resource}/:id` | DELETE | Yes | Delete record |
| `/api/upload` | POST | Yes | File upload |
| `/api/backup` | GET | Admin | Download backup |
| `/api/backup/restore` | POST | Admin | Restore backup |

---

## 18. Security

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| JWT Token | 24h expiry, signed with secret |
| Admin Protection | DB triggers prevent role changes |
| CORS | Environment-specific origin |
| File Upload | 5MB max size limit |
| SQL Injection | Parameterized queries only |
| Rate Limiting | Nginx level |
| Env Protection | `git update-index --skip-worktree` |
| Session Timeout | Auto-logout after inactivity |
| Input Validation | Zod schemas on frontend |

---

## 19. Testing

### Framework: Vitest

### Test Files

- `src/test/example.test.ts` — Basic tests
- `src/test/financial.test.ts` — Financial calculation tests

### Running Tests

```bash
npm test
# or
npx vitest
```

---

## 20. GitHub & Project Transfer

### Repository

- **URL:** https://github.com/digiwebdex/rahe-kaba-journeys-44e58262
- **Branch:** `main`
- **Connected to:** Lovable workspace + VPS auto-deploy

### Project Transfer Between Workspaces

When transferring the project to another Lovable workspace:

1. The GitHub connection **remains intact** — the repository stays connected
2. The new workspace owner gets full access to the code
3. The VPS deployment continues to work (pulls from same GitHub repo)
4. Environment variables on VPS are unaffected

### Transfer Steps

1. In Lovable: Right-click project → "Transfer to workspace"
2. Select target workspace
3. Confirm transfer
4. GitHub link remains connected — no need to reconnect

### Important Notes

- The GitHub repository URL does NOT change on transfer
- VPS deployment commands remain the same
- `server/.env` on VPS is independent of Lovable
- Edge functions (if any) continue to work under Lovable Cloud

---

## 21. Troubleshooting

See `docs/TROUBLESHOOTING.md` for the complete troubleshooting guide.

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Blank page | `npm run build && pm2 restart rahekaba-api` + hard refresh |
| API 500 | `pm2 logs rahekaba-api --lines 50` |
| DB error | `systemctl status postgresql` or check Docker |
| Login fails | Check `server/.env` JWT_SECRET and DATABASE_URL |
| Build fails | `npm install` then `npm run build` |
| Missing package | `npm install <package-name>` on VPS |
