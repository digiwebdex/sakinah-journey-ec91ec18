# Change History — RAHE KABA Tours & Travels

> Complete log of all major changes, features, and fixes
> **Last Updated:** March 26, 2026

---

## March 2026

### Week 4 (March 24-26) — Latest

#### SEO System Implementation
- Added `react-helmet-async` for dynamic meta tags
- Created `SEOHead.tsx` component with Open Graph, Twitter Cards, JSON-LD
- Added SEO to all public pages (Index, About, Contact, Packages, Hotels, PackageDetail)
- Created `public/sitemap.xml` with all public routes
- Updated `public/robots.txt` with sitemap reference and crawl rules
- Created `scripts/generate-sitemap.cjs` for sitemap regeneration
- Added `AdminSeoPage.tsx` — full SEO settings management in admin panel
- SEO sidebar menu item added to admin panel

#### Admin SEO Settings Page
- Global meta data management (site title, description, keywords)
- Open Graph image URL configuration
- Per-page SEO overrides (title, description for each public page)
- Google Analytics (GA4) Measurement ID
- Google Search Console verification code
- Facebook Pixel ID
- Live SEO preview (Google search result simulation)

#### Full CMS System
- Created comprehensive CMS editor for ALL website sections
- 13 section editors: hero, navbar, services, about, packages, testimonials, facilities, gallery, guideline, video_guide, contact, whatsapp, footer
- Bilingual content editing (English + Bangla)
- Version history with rollback capability
- Section visibility toggle (show/hide sections)
- Real-time preview after save

#### Documentation Update
- Created/updated all documentation .md files
- Comprehensive A-Z developer documentation
- Complete analytical history
- GitHub setup & project transfer guide
- Security documentation

### Week 3 (March 17-23)

#### Admin Settings Enhancements
- SMS Configuration — API endpoint, API key, sender ID fields
- Email Configuration — SMTP host, port, user, password fields
- Admin Password Change — Accessible from Settings page
- Manual Backup/Restore — Database backup download and SQL restore upload
- Notification Settings Manager — Enable/disable per event type

#### Full Report System
- Added comprehensive reports for all sections:
  - Booking reports (PDF/Excel)
  - Customer financial reports
  - Package profit analysis
  - Moallem payment/commission reports
  - Supplier agent payment reports
  - Accounting ledger reports
  - Daily cashbook reports
  - Receivables tracking reports
  - Due alert reports
  - Refund reports
- PDF reports with company branding, QR codes, digital signatures
- Excel export for all report types

#### Notification System Fix
- Fixed "Failed to load notification settings" error
- Added proper fallback for missing notification_settings records
- Ensured notification settings CRUD works for all event types

#### Analytics Dashboard
- Created AdminAnalyticsPage with comprehensive visual analytics
- Revenue trends, booking distribution, package popularity charts
- Customer growth, payment method distribution
- Moallem performance, supplier contract analysis

### Week 2 (March 10-16)

#### ERP Admin Panel — English Migration
- All admin panel text migrated to English
- Currency symbol ৳ replaced with "BDT" globally
- Bengali retained only for user data entries
- PDF/Excel reports standardized in English

#### Financial System Enhancements
- Customer Financial Report component with detailed breakdown
- Daily Cashbook module (income/expense tracking)
- Supplier Contract Manager with payment tracking
- Chart of Accounts management (wallet/bank accounts)
- Receivables tracking with due date alerts
- Refund management with cancellation policies

#### Invoice System
- Invoice PDF generation with jsPDF + jspdf-autotable
- Bengali font support via custom font loader (`pdfFontLoader.ts`)
- QR code on invoices linking to verification URL (`pdfQrCode.ts`)
- Digital signature on invoices (`pdfSignature.ts`)
- Invoice verification page (`/verify/:invoiceNumber`)

### Week 1 (March 3-9)

#### VPS Migration (Supabase → Self-Hosted)
- Migrated from Supabase cloud to self-hosted PostgreSQL + Express
- Created complete `server/schema.sql` (1268 lines)
- JWT authentication system (bcrypt + jsonwebtoken)
- Generic CRUD route generator (`createCrudRoutes()`)
- Data migration scripts (`migrate-from-supabase.js`, `migrate-payments.js`)
- PM2 process management setup
- Nginx reverse proxy configuration
- SSL via Certbot (Let's Encrypt)

#### Backend Files Created
- `server/index.js` — Main API server with 30+ CRUD routes
- `server/config/database.js` — PostgreSQL connection pool
- `server/middleware/auth.js` — JWT authentication middleware
- `server/routes/auth.js` — Auth endpoints (register, login, me, change-password)
- `server/schema.sql` — Complete database schema with triggers
- `server/migrate.sh` — VPS migration automation script
- `server/DEPLOY.md` — Deployment guide
- `server/.env.example` — Environment variable template

---

## February 2026

### Week 4 (Feb 24-28)

#### Admin ERP Panel
- Dashboard with charts (recharts) — bookings, revenue, payments overview
- Bookings management — CRUD, status management, member management
- Customer management — profiles, booking history, financial reports
- Payment management — record payments, receipt upload, installments
- Moallem management — agent CRUD, payment tracking, commission system
- Supplier agent management — contracts, payments, items tracking
- Accounting module — transactions ledger, expense tracking
- Hotel management — hotel CRUD, room management, bookings

### Week 3 (Feb 17-23)

#### Booking System
- Multi-step booking flow (Personal Details → Package → Payment → Confirmation)
- Booking step indicator component
- Document upload during booking (passport, visa)
- Installment plan support
- Guest booking (without account)
- Booking success page with tracking ID

#### Payment System
- Payment recording with multiple methods (cash, bank, bkash, nagad)
- Wallet account integration
- Receipt file upload
- Installment schedule generation
- Payment status tracking (pending → completed)

### Week 2 (Feb 10-16)

#### Customer Portal
- Customer dashboard with booking overview
- Payment history with status indicators
- Invoice download capability
- Document management
- Profile editing

#### CMS Content Management
- `site_content` table with JSONB storage
- `cms_versions` for version history
- Section-based content editing
- Bilingual content support (en/bn)

### Week 1 (Feb 3-9)

#### Initial Project Setup
- React 18 + Vite + TypeScript project creation
- Supabase integration (later migrated to self-hosted)
- shadcn/ui component library integration
- Tailwind CSS theming with custom design tokens
- Route structure with React Router v6
- Lazy loading for all non-homepage routes

#### Public Website Sections
- Navbar with language toggle
- Hero section with Kaaba imagery
- Services section
- Packages section (database-driven)
- About section
- Contact section with form
- Testimonials section
- Gallery section
- Footer with company info

#### Authentication
- Login/Register pages
- JWT-based authentication
- Role-based access control (admin, user, manager, staff, viewer, accountant, booking, cms)
- Session timeout with auto-logout

#### Internationalization
- Bilingual support (English + Bangla)
- Translation file (`src/i18n/translations.ts`) with 350+ keys
- Language context provider
- localStorage persistence

---

## Design Evolution

### Phase 1: Initial (Feb 2026)
- Dark navy blue theme
- Single hero image
- Basic card layouts

### Phase 2: Light Theme Redesign (March 2026)
- Light cream/gold luxury aesthetic
- Updated CSS tokens: background, foreground, primary, secondary, muted, accent
- Playfair Display + Inter font pairing
- `.shadow-luxury`, `.shadow-soft` utilities
- Islamic geometric pattern overlays

### Phase 3: Enhanced UI (March 2026)
- 3-image auto-sliding hero carousel (5-second interval)
- Package cards with image overlay, gradient fade, pricing on image
- Star rating badges, type badges
- Gold gradient border-top dividers
- Section ornament decorators
- WhatsApp button (left side) with Bengali label
- Animated Back to Top button (right side)
- Framer Motion entry/exit animations
