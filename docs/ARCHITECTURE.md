# Project Architecture — RAHE KABA Tours & Travels

> Visual architecture guide, component relationships, and data flows
> **Last Updated:** March 26, 2026

---

## System Architecture

```
                    ┌──────────────┐
                    │   Internet   │
                    │  (Browser)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    Nginx     │
                    │  Port 80/443 │
                    │  (SSL + RP)  │
                    └──┬───────┬───┘
                       │       │
            Static     │       │  /api/*
            Files      │       │
            (dist/)    │       │  /uploads/*
                       │       │
               ┌───────▼──┐  ┌─▼──────────┐
               │  React   │  │  Express   │
               │  Build   │  │  API       │
               │  (SPA)   │  │  Port 3001 │
               └──────────┘  │  (PM2)     │
                             └─────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │ PostgreSQL  │
                            │ Port 5433   │
                            │ (Docker)    │
                            └─────────────┘
```

---

## Request Flow

```
Browser Request
  │
  ├── Static Assets (CSS, JS, images)
  │   └── Nginx → /var/www/.../dist/
  │
  ├── API Requests (/api/*)
  │   └── Nginx → proxy_pass → localhost:3001
  │       └── Express → PostgreSQL
  │
  ├── File Uploads (/uploads/*)
  │   └── Nginx → /var/www/.../server/uploads/
  │
  └── SPA Routes (/*) 
      └── Nginx → /var/www/.../dist/index.html (fallback)
```

---

## Frontend Component Tree

```
App
├── HelmetProvider (SEO)
├── QueryClientProvider (React Query)
│   └── TooltipProvider
│       └── BrowserRouter
│           └── Suspense (PageLoader)
│               └── Routes
│                   │
│                   ├── / → Index
│                   │   ├── SEOHead (dynamic meta tags)
│                   │   ├── Navbar (language toggle, auth links)
│                   │   ├── HeroSection (3-image carousel)
│                   │   ├── ServicesSection
│                   │   ├── FacilitiesSection (9 facility cards)
│                   │   ├── PackagesSection (DB-driven)
│                   │   ├── GuidelineSection
│                   │   ├── VideoGuideSection
│                   │   ├── GallerySection
│                   │   ├── TestimonialsSection
│                   │   ├── AboutSection
│                   │   ├── ContactSection
│                   │   ├── Footer
│                   │   ├── WhatsAppFloat (bottom-left)
│                   │   └── BackToTop (bottom-right)
│                   │
│                   ├── /auth → Auth (Login/Register)
│                   ├── /dashboard → Dashboard (Customer portal)
│                   ├── /packages → Packages (listing)
│                   ├── /packages/:id → PackageDetail
│                   ├── /hotels → Hotels (listing)
│                   ├── /hotels/:id → HotelDetail
│                   ├── /booking → Booking (multi-step)
│                   │   ├── BookingStepIndicator
│                   │   ├── PersonalDetailsStep
│                   │   ├── DocumentUploadStep
│                   │   └── BookingSuccess
│                   ├── /track → TrackBooking
│                   ├── /about → About
│                   ├── /contact → Contact
│                   ├── /invoice → InvoicePage
│                   ├── /verify/:invoiceNumber → VerifyInvoice
│                   ├── /reset-password → ResetPassword
│                   │
│                   └── /admin → AdminLayout
│                       ├── AdminSidebar (navigation)
│                       ├── /admin → AdminDashboardPage
│                       ├── /admin/bookings → AdminBookingsPage
│                       ├── /admin/bookings/create → AdminCreateBookingPage
│                       ├── /admin/customers → AdminCustomersPage
│                       ├── /admin/packages → AdminPackagesPage
│                       ├── /admin/payments → AdminPaymentsPage
│                       ├── /admin/moallems → AdminMoallemsPage
│                       ├── /admin/moallems/:id → AdminMoallemProfilePage
│                       ├── /admin/supplier-agents → AdminSupplierAgentsPage
│                       ├── /admin/supplier-agents/:id → AdminSupplierAgentProfilePage
│                       ├── /admin/accounting → AdminAccountingPage
│                       ├── /admin/chart-of-accounts → AdminChartOfAccountsPage
│                       ├── /admin/receivables → AdminReceivablesPage
│                       ├── /admin/due-alerts → AdminDueAlertsPage
│                       ├── /admin/refunds → AdminRefundsPage
│                       ├── /admin/reports → AdminReportsPage
│                       ├── /admin/analytics → AdminAnalyticsPage
│                       ├── /admin/calculator → AdminCalculatorPage
│                       ├── /admin/hotels → AdminHotelsPage
│                       ├── /admin/notifications → AdminNotificationsPage
│                       ├── /admin/cms → AdminCmsPage
│                       ├── /admin/seo → AdminSeoPage
│                       └── /admin/settings → AdminSettingsPage
│
├── Toaster (toast notifications)
└── Sonner (sonner notifications)
```

---

## Data Flow Diagrams

### Customer Booking Flow

```
Homepage → Select Package → /booking
  → Step 1: Personal Details (name, phone, passport)
  → Step 2: Package Selection + Number of Travelers
  → Step 3: Payment Plan (full/installment)
  → Step 4: Document Upload (passport, visa)
  → Step 5: Confirmation
  → API: POST /api/bookings
  → DB: Insert into bookings + booking_members
  → Response: tracking_id
  → Redirect: /dashboard
```

### Admin Booking Flow

```
Admin → /admin/bookings/create
  → Select Customer (existing) or Enter Guest Details
  → Select Package
  → Set pricing (cost per person, selling price, commission)
  → Assign Moallem (optional)
  → Assign Supplier Agent (optional)
  → Set Installment Plan (optional)
  → API: POST /api/bookings
  → DB: bookings + booking_members + payments (if installment)
```

### Payment Flow

```
Admin → /admin/payments
  → Select Booking
  → Enter Amount + Payment Method + Wallet Account
  → Upload Receipt (optional)
  → API: POST /api/payments
  → DB: payments table
  → Update: bookings.paid_amount, bookings.due_amount
  → Optional: Create transaction record
  → Optional: Send notification (SMS/Email)
```

### CMS Content Flow

```
Admin → /admin/cms
  → Select Section (hero, services, about, etc.)
  → Edit English + Bangla content
  → Save
  → API: PUT /api/site-content/:id
  → DB: Update site_content JSONB
  → DB: Insert cms_versions (for rollback)
  → Frontend: Reads content via useSiteContent() hook
```

### SEO Settings Flow

```
Admin → /admin/seo
  → Edit global meta (title, description, keywords)
  → Set per-page overrides
  → Configure tracking (GA4, Search Console, FB Pixel)
  → Save
  → DB: site_content (section_key = 'seo_settings')
  → Frontend: SEOHead reads from seo_settings
  → Dynamic <head> meta tags via react-helmet-async
```

---

## Third-Party Integrations

| Service | Purpose | Configuration |
|---------|---------|---------------|
| SMS API (BulkSMS BD) | Send booking/payment notifications | Admin → Settings → SMS Config |
| SMTP (Resend) | Send email notifications | Admin → Settings → Email Config |
| Google Analytics | Website analytics | Admin → SEO → GA4 ID |
| Google Search Console | Search indexing | Admin → SEO → Verification |
| Facebook Pixel | Social media tracking | Admin → SEO → Pixel ID |
| Google Drive | Backup storage | `server/backup-to-gdrive.sh` |

---

## File Storage Structure

```
server/uploads/
├── receipts/          # Payment receipt images
├── documents/         # Booking documents (passport, visa)
├── packages/          # Package images
├── hotels/            # Hotel images
└── backups/           # Database backup SQL files
```

---

## API Architecture

```
server/index.js
├── Middleware
│   ├── cors (FRONTEND_URL origin)
│   ├── express.json()
│   ├── express.urlencoded()
│   └── multer (file uploads)
│
├── Auth Routes (server/routes/auth.js)
│   ├── POST /api/auth/register
│   ├── POST /api/auth/login
│   ├── GET /api/auth/me
│   └── POST /api/auth/change-password
│
├── CRUD Routes (createCrudRoutes helper)
│   ├── 30+ table endpoints
│   └── Auto: GET, GET/:id, POST, PUT/:id, DELETE/:id
│
├── Special Routes
│   ├── POST /api/upload
│   ├── GET /api/backup
│   └── POST /api/backup/restore
│
└── Static Files
    └── /uploads → express.static
```
