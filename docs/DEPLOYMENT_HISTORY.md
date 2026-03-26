# Deployment History — RAHE KABA Tours & Travels

> Complete deployment timeline, server operations, and infrastructure changes
> **Last Updated:** March 26, 2026

---

## Server Information

| Field | Value |
|-------|-------|
| **VPS Provider** | Hostinger Dedicated Server |
| **Server Hostname** | srv1468666 |
| **OS** | Ubuntu/Debian |
| **Project Path** | `/var/www/rahe-kaba-journeys-72ccca69` |
| **PM2 Process** | `rahekaba-api` (ID: 24) |
| **Repository** | https://github.com/digiwebdex/rahe-kaba-journeys-44e58262 |
| **Branch** | `main` |
| **Domain** | rahekabatravels.com |
| **API Port** | 3001 |
| **DB Port** | 5433 (Docker PostgreSQL) |
| **DB User** | digiwebdex |
| **DB Name** | rahekaba |

---

## Deployment Timeline

### Phase 1: Initial Setup (February 2026, Week 1)

- **Architecture:** React/Vite frontend + Supabase backend (Lovable Cloud)
- **Features:** Basic landing page, package listing, authentication
- **Database:** Supabase-hosted PostgreSQL (Lovable Cloud)
- **Hosting:** Lovable preview/published URLs

### Phase 2: Feature Development (February 2026, Weeks 2-4)

- Built customer portal (dashboard, booking, payments)
- Built admin ERP panel (bookings, customers, payments, moallems, suppliers)
- Added CMS content management system
- Added notification system (SMS + Email)
- Added hotel management module
- Added invoice generation with QR codes

### Phase 3: VPS Migration (March 2026, Week 1)

**Major Change:** Migrated from Supabase cloud to self-hosted PostgreSQL + Express

- **Server:** Node.js/Express API on VPS with PM2
- **Database:** PostgreSQL (initially native, later Dockerized on port 5433)
- **Web Server:** Nginx reverse proxy
- **SSL:** Certbot (Let's Encrypt)
- **Process Manager:** PM2 with auto-restart

**Files Created:**
- `server/index.js` — Main API server with CRUD generator
- `server/config/database.js` — PostgreSQL connection pool
- `server/middleware/auth.js` — JWT authentication
- `server/routes/auth.js` — Auth endpoints
- `server/schema.sql` — Complete database schema (1268 lines)
- `server/migrate-from-supabase.js` — Data migration script
- `server/migrate-payments.js` — Payment data migration
- `server/migrate.sh` — VPS migration automation
- `server/.env.example` — Environment variable template
- `server/DEPLOY.md` — Deployment guide

**Database Migration:**
- Exported all data from Supabase
- Created comprehensive schema with triggers, views, functions
- Imported data to local PostgreSQL
- Verified data integrity

### Phase 4: Admin ERP Expansion (March 2026, Week 2)

- English migration for admin panel
- Financial system: cashbook, accounting, chart of accounts
- Customer financial reports
- Supplier contract management
- Receivables tracking
- Invoice system with Bengali font support, QR codes, digital signatures
- Excel/PDF report exports

### Phase 5: Notification & Settings (March 2026, Week 3)

- SMS API integration (BulkSMS BD)
- SMTP email integration (Resend)
- Admin configurable notification settings
- Notification logging
- Admin password change
- Manual backup/restore system
- Notification settings manager with per-event toggle

### Phase 6: Frontend Redesign (March 2026, Week 4)

- **Theme:** Dark navy → Light cream/gold luxury theme
- **Hero:** Single image → 3-image auto-sliding carousel
- **Language:** Default English → Bangla
- **New:** Facilities section (9 cards)
- **Package Cards:** Image overlay, gradient, rating badges
- **WhatsApp:** Left side with Bengali label
- **Back to Top:** Animated scroll button
- **Islamic Design:** Geometric patterns, ornamental decorators

### Phase 7: CMS & SEO (March 2026, Week 4)

- Full CMS system for ALL 13 website sections
- Section visibility management
- Version history with rollback
- SEO system: react-helmet-async, meta tags, JSON-LD
- Admin SEO settings page
- Sitemap.xml and robots.txt
- Google Analytics, Search Console, Facebook Pixel support

### Phase 8: Reports & Analytics (March 2026, Week 4)

- Comprehensive report system for all modules
- Analytics dashboard with visual charts
- Refund management with cancellation policies
- Due alert system
- Calculator tool

---

## Port Configuration (VPS)

| Service | Port | Notes |
|---------|------|-------|
| Nginx | 80/443 | HTTP/HTTPS |
| rahekaba-api (PM2) | 3001 | Express API |
| PostgreSQL (Docker) | 5433 | Database |
| PostgreSQL (Host) | 5440 | Host native (unused) |
| sm-trade-backend | 3011 | Other project (migrated from 3001) |

---

## PM2 Process List (Current)

| ID | Name | Status |
|----|------|--------|
| 11 | masud-backend | online |
| 24 | rahekaba-api | online |
| 1 | saz-backend | online |
| 7 | sm-elite-api | online |
| 17 | sm-trade-backend | online |
| 16 | smtrade-api | online |

---

## Environment Protection

The following files are protected from `git reset --hard`:

```bash
git update-index --skip-worktree .env
# server/.env is .gitignored
```

This ensures deployment credentials and secrets are never overwritten during git operations.

---

## Infrastructure Notes

- **Nginx** serves the built frontend (`dist/`) and reverse-proxies `/api/*` to Express (port 3001)
- **Nginx** also serves `/uploads/*` directly from `server/uploads/`
- **PM2** manages the Node.js process with auto-restart on crash
- **PM2** is configured for auto-start on VPS reboot (`pm2 startup` + `pm2 save`)
- **PostgreSQL** runs in Docker container on port 5433
- **SSL** via Certbot (Let's Encrypt) with auto-renewal
- **GitHub** auto-sync with Lovable workspace

---

## Deployment Log (Recent)

### March 26, 2026
- Deployed SEO system (react-helmet-async, sitemap, robots.txt)
- Added AdminSeoPage to admin panel
- Installed `react-helmet-async` package on VPS
- Build successful: 4333 modules, 13.03s

### March 25, 2026
- Deployed full CMS system updates
- Deployed report system enhancements
- Deployed analytics dashboard

### March 24, 2026
- Deployed frontend redesign (light theme)
- Deployed facilities section
- Deployed WhatsApp + Back to Top components
