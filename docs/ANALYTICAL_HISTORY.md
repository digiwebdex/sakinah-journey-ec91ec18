# Analytical History — RAHE KABA Tours & Travels

> Complete system analytics, performance metrics, data insights, and feature coverage
> **Last Updated:** March 26, 2026

---

## System Analytics Overview

### Application Metrics

| Metric | Value |
|--------|-------|
| Total Public Pages | 12 |
| Total Admin Pages | 22 |
| Admin Modules | 20 |
| Database Tables | 28 |
| Database Views | 3 |
| Database Functions | 3 |
| API Endpoints | 55+ |
| Translation Keys | 350+ |
| Components (Total) | 80+ |
| UI Components (shadcn) | 45+ |
| Custom Hooks | 6 |
| Edge Functions | 12 |
| Documentation Files | 10 |

### Page Inventory

#### Public Pages

| Page | Route | Component | Load Strategy |
|------|-------|-----------|---------------|
| Homepage | `/` | `Index.tsx` | Eager (critical path) |
| Packages | `/packages` | `Packages.tsx` | Lazy |
| Package Detail | `/packages/:id` | `PackageDetail.tsx` | Lazy |
| Hotels | `/hotels` | `Hotels.tsx` | Lazy |
| Hotel Detail | `/hotels/:id` | `HotelDetail.tsx` | Lazy |
| Booking | `/booking` | `Booking.tsx` | Lazy |
| Track Booking | `/track` | `TrackBooking.tsx` | Lazy |
| About | `/about` | `About.tsx` | Lazy |
| Contact | `/contact` | `Contact.tsx` | Lazy |
| Login/Register | `/auth` | `Auth.tsx` | Lazy |
| Customer Dashboard | `/dashboard` | `Dashboard.tsx` | Lazy |
| Invoice | `/invoice` | `InvoicePage.tsx` | Lazy |
| Verify Invoice | `/verify/:invoiceNumber` | `VerifyInvoice.tsx` | Lazy |
| Reset Password | `/reset-password` | `ResetPassword.tsx` | Lazy |

#### Admin Pages

| Page | Route | Component |
|------|-------|-----------|
| Dashboard | `/admin` | `AdminDashboardPage.tsx` |
| Bookings | `/admin/bookings` | `AdminBookingsPage.tsx` |
| Create Booking | `/admin/bookings/create` | `AdminCreateBookingPage.tsx` |
| Customers | `/admin/customers` | `AdminCustomersPage.tsx` |
| Packages | `/admin/packages` | `AdminPackagesPage.tsx` |
| Payments | `/admin/payments` | `AdminPaymentsPage.tsx` |
| Moallems | `/admin/moallems` | `AdminMoallemsPage.tsx` |
| Moallem Profile | `/admin/moallems/:id` | `AdminMoallemProfilePage.tsx` |
| Supplier Agents | `/admin/supplier-agents` | `AdminSupplierAgentsPage.tsx` |
| Supplier Profile | `/admin/supplier-agents/:id` | `AdminSupplierAgentProfilePage.tsx` |
| Accounting | `/admin/accounting` | `AdminAccountingPage.tsx` |
| Chart of Accounts | `/admin/chart-of-accounts` | `AdminChartOfAccountsPage.tsx` |
| Receivables | `/admin/receivables` | `AdminReceivablesPage.tsx` |
| Due Alerts | `/admin/due-alerts` | `AdminDueAlertsPage.tsx` |
| Refunds | `/admin/refunds` | `AdminRefundsPage.tsx` |
| Reports | `/admin/reports` | `AdminReportsPage.tsx` |
| Analytics | `/admin/analytics` | `AdminAnalyticsPage.tsx` |
| Calculator | `/admin/calculator` | `AdminCalculatorPage.tsx` |
| Hotels | `/admin/hotels` | `AdminHotelsPage.tsx` |
| Notifications | `/admin/notifications` | `AdminNotificationsPage.tsx` |
| CMS | `/admin/cms` | `AdminCmsPage.tsx` |
| SEO Settings | `/admin/seo` | `AdminSeoPage.tsx` |
| Settings | `/admin/settings` | `AdminSettingsPage.tsx` |

---

## Bundle Analysis

### Load Strategy

| Module | Strategy | Reason |
|--------|----------|--------|
| Homepage | Eagerly loaded | Critical path — first paint |
| Admin Panel | Lazy loaded (code-split) | Heavy libraries (recharts, xlsx, jspdf) |
| Auth Pages | Lazy loaded | Non-critical path |
| Dashboard | Lazy loaded | User-specific |
| Booking Flow | Lazy loaded | Multi-step form |
| Invoice/PDF | Lazy loaded | Heavy PDF generation |

### Large Chunks (Build Output)

| Chunk | Size | Gzipped |
|-------|------|---------|
| `index-*.js` (main) | 566 KB | 181 KB |
| `logo-nobg-*.js` | 446 KB | 145 KB |
| `AdminAnalyticsPage-*.js` | 434 KB | 115 KB |
| `reportExport-*.js` | 289 KB | 97 KB |
| `html2canvas.esm-*.js` | 201 KB | 48 KB |
| `index.es-*.js` (xlsx) | 150 KB | 51 KB |

### Performance Optimizations

1. **Lazy Loading:** All non-homepage routes use `React.lazy()` + `Suspense`
2. **Image Optimization:** Hero images with `fetchPriority="high"`, others with `loading="lazy"`
3. **Font Strategy:** Google Fonts (Playfair Display, Inter, Amiri) with `display=swap`
4. **CSS:** Tailwind CSS with purge — only used classes in production bundle
5. **State Management:** React Query with intelligent caching/refetching
6. **Code Splitting:** Admin pages individually chunked
7. **SEO:** react-helmet-async for dynamic meta tags, JSON-LD structured data

---

## Database Analytics

### Table Relationships

```
users ──┬── user_roles
        ├── profiles
        └── bookings ──┬── booking_members
                       ├── payments
                       ├── booking_documents
                       ├── expenses
                       ├── refunds
                       └── notification_logs

packages ──── bookings
           └── booking_members

moallems ──┬── bookings
           ├── moallem_payments
           ├── moallem_commission_payments
           └── moallem_items

supplier_agents ──┬── bookings
                  ├── supplier_agent_payments
                  ├── supplier_agent_items
                  ├── supplier_contracts ── supplier_contract_payments
                  └── accounts

hotels ──┬── hotel_rooms
         └── hotel_bookings

accounts ──── daily_cashbook
          └── (all payment tables via wallet_account_id)

site_content ──── cms_versions
company_settings
notification_settings ──── notification_logs
cancellation_policies ──── refunds
installment_plans ──── bookings
otp_codes
blog_posts
financial_summary
```

### Financial Analysis Views

| View | Purpose | Metrics |
|------|---------|---------|
| `v_booking_profit` | Per-booking profitability | Revenue, cost, expenses, commission, profit |
| `v_customer_profit` | Per-customer profitability | Total bookings, payments, expenses, profit |
| `v_package_profit` | Per-package profitability | Total bookings, revenue, expenses, profit |

### Database Functions

| Function | Purpose |
|----------|---------|
| `has_role(_user_id, _role)` | Check if user has specific role |
| `deactivate_expired_packages()` | Auto-deactivate expired packages |
| `generate_installment_schedule()` | Create installment payment schedule |

---

## Feature Usage Analytics

### Public Website Sections

| Section | Component | Data Source | CMS Editable |
|---------|-----------|-------------|--------------|
| Navbar | `Navbar.tsx` | CMS (`navbar`) + i18n | ✅ |
| Hero | `HeroSection.tsx` | CMS (`hero`) + static | ✅ |
| Services | `ServicesSection.tsx` | CMS (`services`) + i18n | ✅ |
| Facilities | `FacilitiesSection.tsx` | CMS (`facilities`) + i18n | ✅ |
| Packages | `PackagesSection.tsx` | Database (`packages` table) | Via Admin |
| Guidelines | `GuidelineSection.tsx` | CMS (`guideline`) | ✅ |
| Video Guide | `VideoGuideSection.tsx` | CMS (`video_guide`) | ✅ |
| Gallery | `GallerySection.tsx` | CMS (`gallery`) | ✅ |
| Testimonials | `TestimonialsSection.tsx` | CMS (`testimonials`) | ✅ |
| About | `AboutSection.tsx` | CMS (`about`) + i18n | ✅ |
| Contact | `ContactSection.tsx` | CMS (`contact`) + i18n | ✅ |
| WhatsApp | `WhatsAppFloat.tsx` | CMS (`whatsapp`) | ✅ |
| Footer | `Footer.tsx` | CMS (`footer`) + i18n | ✅ |

### Admin Module Usage

| Module | Primary Tables | Reports/Exports |
|--------|---------------|-----------------|
| Dashboard | All tables | Charts (recharts) |
| Bookings | bookings, booking_members | PDF invoice, Excel export |
| Customers | profiles, bookings, payments | Financial report PDF |
| Packages | packages | — |
| Payments | payments | Receipt PDF |
| Moallems | moallems, moallem_payments, moallem_commission_payments | Profile report PDF |
| Suppliers | supplier_agents, supplier_agent_payments, supplier_contracts | Profile report PDF |
| Accounting | transactions, expenses | Ledger report |
| Cashbook | daily_cashbook | Daily report |
| Chart of Accounts | accounts | — |
| Receivables | bookings, payments | Due report |
| Due Alerts | bookings, payments | Alert report |
| Refunds | refunds, cancellation_policies | Refund report |
| Reports | All financial tables | PDF/Excel comprehensive |
| Analytics | All tables | Visual charts (recharts) |
| Hotels | hotels, hotel_rooms, hotel_bookings | — |
| Notifications | notification_settings, notification_logs | — |
| CMS | site_content, cms_versions | — |
| SEO | site_content (seo_settings) | — |
| Calculator | — (client-side) | — |
| Settings | company_settings | Backup SQL download |

---

## Security Analysis

### Authentication Flow

```
User → POST /api/auth/login
     → Server validates credentials (bcrypt, 10 rounds)
     → Server issues JWT (24h expiry)
     → Client stores in localStorage
     → All API calls include Bearer token
     → Server validates JWT on protected routes
     → Server checks user role for admin routes
     → Session timeout via useSessionTimeout hook
```

### Role-Based Access Control (RBAC)

| Role | Dashboard | Bookings | Payments | Accounting | Reports | CMS | Settings |
|------|-----------|----------|----------|------------|---------|-----|----------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| staff | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| accountant | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| booking | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| cms | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| viewer | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| user | Customer portal only | — | — | — | — | — | — |

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| JWT Expiry | 24 hours |
| Admin Protection | DB triggers prevent admin role changes |
| CORS | Configured per environment |
| File Upload Limit | 5MB max |
| SQL Injection | Parameterized queries |
| Rate Limiting | Nginx level |
| Env Protection | `git update-index --skip-worktree` |
| Session Timeout | Auto-logout after inactivity |

---

## Internationalization Coverage

| Section | English | Bangla | Admin Panel |
|---------|---------|--------|-------------|
| Navbar | ✅ | ✅ | English only |
| Hero | ✅ | ✅ | — |
| Services | ✅ | ✅ | — |
| Facilities | ✅ | ✅ | — |
| Packages | ✅ | ✅ | — |
| Guidelines | ✅ | ✅ | — |
| About | ✅ | ✅ | — |
| Contact | ✅ | ✅ | — |
| Auth | ✅ | ✅ | — |
| Booking | ✅ | ✅ | — |
| Dashboard | ✅ | ✅ | — |
| Hotels | ✅ | ✅ | — |
| Footer | ✅ | ✅ | — |
| Track Booking | ✅ | ✅ | — |

**Default Language:** Bangla (bn)
**Storage:** `localStorage` key `rk_language`

---

## SEO Analytics

### Implementation

| Feature | Status |
|---------|--------|
| Meta Tags (Title, Description) | ✅ Dynamic per page |
| Open Graph Tags | ✅ All pages |
| Twitter Cards | ✅ All pages |
| JSON-LD Structured Data | ✅ TravelAgency + BreadcrumbList |
| Sitemap.xml | ✅ Auto-generated |
| Robots.txt | ✅ Configured |
| Canonical URLs | ✅ Per page |
| Semantic HTML (H1) | ✅ Single H1 per page |
| Image Alt Text | ✅ |
| Lazy Loading | ✅ Non-critical images |
| Admin SEO Settings | ✅ Dynamic meta/tracking management |

### Tracking Integrations

| Service | Admin Configurable |
|---------|-------------------|
| Google Analytics | ✅ (GA4 Measurement ID) |
| Google Search Console | ✅ (Verification meta tag) |
| Facebook Pixel | ✅ (Pixel ID) |

---

## Technology Dependencies

### Production Dependencies (Key)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-router-dom | ^6.30.1 | Routing |
| @tanstack/react-query | ^5.83.0 | Data fetching/caching |
| @supabase/supabase-js | ^2.97.0 | API client (proxied) |
| framer-motion | ^12.34.3 | Animations |
| recharts | ^2.15.4 | Charts |
| jspdf | ^4.2.0 | PDF generation |
| xlsx | ^0.18.5 | Excel export |
| qrcode | ^1.5.4 | QR codes |
| react-helmet-async | 2.0.5 | SEO meta tags |
| zod | ^3.25.76 | Validation |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.21.0 | HTTP server |
| pg | ^8.13.0 | PostgreSQL client |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT auth |
| multer | ^1.4.5 | File upload |
| cors | ^2.8.5 | CORS middleware |
