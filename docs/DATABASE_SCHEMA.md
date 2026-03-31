# Database Schema Reference — Manasik Travel Hub

> Complete database table reference, relationships, views, functions, and triggers
> **Last Updated:** March 26, 2026

---

## Overview

| Property | Value |
|----------|-------|
| **Engine** | PostgreSQL 14+ |
| **Host** | Docker container, port 5433 |
| **Extensions** | `uuid-ossp`, `pgcrypto` |
| **Schema File** | `server/schema.sql` (1268 lines) |
| **Tables** | 28 |
| **Views** | 3 |
| **Functions** | 3 |
| **Triggers** | 4 (security) |
| **Enums** | 1 (`app_role`) |

---

## Connection

```bash
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1
```

---

## Enum Types

### `app_role`

```sql
CREATE TYPE app_role AS ENUM (
  'admin', 'user', 'manager', 'staff', 
  'viewer', 'accountant', 'booking', 'cms'
);
```

---

## Tables

### `users`

Core authentication table.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Default: `uuid_generate_v4()` |
| email | VARCHAR(255) | Unique, NOT NULL |
| password_hash | TEXT | bcrypt hashed |
| is_banned | BOOLEAN | Default: false |
| created_at | TIMESTAMPTZ | Default: NOW() |
| updated_at | TIMESTAMPTZ | |

### `user_roles`

Role assignments.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | ON DELETE CASCADE |
| role | app_role ENUM | |

**Unique:** (user_id, role)

### `profiles`

Extended user information.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | NOT NULL |
| full_name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| passport_number | VARCHAR | |
| nid_number | VARCHAR | National ID |
| date_of_birth | DATE | |
| address | TEXT | |
| emergency_contact | VARCHAR | |
| notes | TEXT | |
| status | VARCHAR | Default: 'active' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `packages`

Hajj/Umrah/Tour packages.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | hajj, umrah, tour |
| price | DECIMAL | NOT NULL |
| description | TEXT | |
| duration_days | INTEGER | |
| start_date | DATE | |
| expiry_date | DATE | |
| features | JSONB | Array of feature strings |
| services | JSONB | |
| image_url | TEXT | |
| is_active | BOOLEAN | Default: true |
| show_on_website | BOOLEAN | Default: true |
| status | VARCHAR | Default: 'active' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `bookings`

Customer bookings (central business table).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| tracking_id | VARCHAR | Unique, auto-generated |
| user_id | UUID | Customer reference |
| package_id | UUID (FK → packages) | |
| moallem_id | UUID (FK → moallems) | Optional |
| supplier_agent_id | UUID (FK → supplier_agents) | Optional |
| installment_plan_id | UUID (FK → installment_plans) | Optional |
| booking_type | VARCHAR | Default: 'direct' |
| num_travelers | INTEGER | |
| total_amount | DECIMAL | |
| paid_amount | DECIMAL | Default: 0 |
| due_amount | DECIMAL | Computed |
| discount | DECIMAL | Default: 0 |
| status | VARCHAR | pending, confirmed, completed, cancelled |
| cost_price_per_person | DECIMAL | |
| selling_price_per_person | DECIMAL | |
| total_cost | DECIMAL | |
| profit_amount | DECIMAL | |
| extra_expense | DECIMAL | |
| commission_per_person | DECIMAL | |
| total_commission | DECIMAL | |
| commission_paid | DECIMAL | |
| commission_due | DECIMAL | |
| paid_by_moallem | DECIMAL | |
| moallem_due | DECIMAL | |
| paid_to_supplier | DECIMAL | |
| supplier_due | DECIMAL | |
| guest_name | VARCHAR | For guest bookings |
| guest_email | VARCHAR | |
| guest_phone | VARCHAR | |
| guest_passport | VARCHAR | |
| guest_address | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `booking_members`

Individual travelers per booking.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| booking_id | UUID (FK → bookings) | ON DELETE CASCADE |
| package_id | UUID (FK → packages) | Optional |
| full_name | VARCHAR | NOT NULL |
| passport_number | VARCHAR | |
| selling_price | DECIMAL | Default: 0 |
| discount | DECIMAL | Default: 0 |
| final_price | DECIMAL | Default: 0 |
| created_at | TIMESTAMPTZ | |

### `payments`

Payment records.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| booking_id | UUID (FK → bookings) | |
| user_id | UUID | |
| customer_id | UUID | |
| amount | DECIMAL | |
| status | VARCHAR | pending, completed |
| payment_method | VARCHAR | cash, bank, bkash, nagad |
| installment_number | INTEGER | |
| due_date | DATE | |
| paid_at | TIMESTAMPTZ | |
| notes | TEXT | |
| receipt_file_path | TEXT | |
| transaction_id | VARCHAR | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `moallems`

Moallem (agent/referrer) management.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| phone | VARCHAR | |
| address | TEXT | |
| nid_number | VARCHAR | |
| contracted_hajji | INTEGER | Default: 0 |
| contracted_amount | DECIMAL | Default: 0 |
| total_deposit | DECIMAL | Default: 0 |
| total_due | DECIMAL | Default: 0 |
| contract_date | DATE | |
| status | VARCHAR | Default: 'active' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `moallem_payments`

Payments made by moallems.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| moallem_id | UUID (FK → moallems) | |
| booking_id | UUID (FK → bookings) | Optional |
| amount | DECIMAL | |
| date | DATE | |
| payment_method | VARCHAR | |
| notes | TEXT | |
| receipt_file_path | TEXT | |
| recorded_by | UUID | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `moallem_commission_payments`

Commission payments to moallems.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| moallem_id | UUID (FK → moallems) | |
| booking_id | UUID (FK → bookings) | Optional |
| amount | DECIMAL | |
| date | DATE | |
| payment_method | VARCHAR | |
| notes | TEXT | |
| recorded_by | UUID | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `moallem_items`

Items/services provided by moallems.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| moallem_id | UUID (FK → moallems) | |
| description | VARCHAR | NOT NULL |
| quantity | INTEGER | Default: 1 |
| unit_price | DECIMAL | Default: 0 |
| total_amount | DECIMAL | Default: 0 |
| created_at | TIMESTAMPTZ | |

### `supplier_agents`

Supplier agent management.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| agent_name | VARCHAR | NOT NULL |
| company_name | VARCHAR | |
| phone | VARCHAR | |
| address | TEXT | |
| contracted_hajji | INTEGER | Default: 0 |
| contracted_amount | DECIMAL | Default: 0 |
| contract_date | DATE | |
| status | VARCHAR | Default: 'active' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `supplier_agent_payments`

Payments to supplier agents.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| supplier_agent_id | UUID (FK → supplier_agents) | |
| booking_id | UUID (FK → bookings) | Optional |
| amount | DECIMAL | |
| date | DATE | |
| payment_method | VARCHAR | |
| notes | TEXT | |
| receipt_file_path | TEXT | |
| recorded_by | UUID | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `supplier_agent_items`

Items provided by supplier agents.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| supplier_agent_id | UUID (FK → supplier_agents) | |
| description | VARCHAR | NOT NULL |
| quantity | INTEGER | Default: 1 |
| unit_price | DECIMAL | Default: 0 |
| total_amount | DECIMAL | Default: 0 |
| created_at | TIMESTAMPTZ | |

### `supplier_contracts`

Supplier contracts.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| supplier_id | UUID (FK → supplier_agents) | |
| contract_amount | DECIMAL | Default: 0 |
| pilgrim_count | INTEGER | Default: 0 |
| total_paid | DECIMAL | Default: 0 |
| total_due | DECIMAL | Default: 0 |
| created_at | TIMESTAMPTZ | |

### `supplier_contract_payments`

Payments against supplier contracts.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| contract_id | UUID (FK → supplier_contracts) | |
| supplier_id | UUID (FK → supplier_agents) | |
| amount | DECIMAL | |
| payment_date | DATE | |
| payment_method | VARCHAR | |
| note | TEXT | |
| created_by | UUID | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `hotels`

Hotel listings.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| location | VARCHAR | NOT NULL |
| city | VARCHAR | Default: 'Makkah' |
| description | TEXT | |
| star_rating | INTEGER | |
| distance_to_haram | VARCHAR | |
| image_url | TEXT | |
| gallery | JSONB | Array of image URLs |
| amenities | JSONB | |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `hotel_rooms`

Room details per hotel.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| hotel_id | UUID (FK → hotels) | |
| name | VARCHAR | NOT NULL |
| price_per_night | DECIMAL | NOT NULL |
| capacity | INTEGER | Default: 2 |
| description | TEXT | |
| image_url | TEXT | |
| amenities | JSONB | |
| is_available | BOOLEAN | Default: true |
| created_at | TIMESTAMPTZ | |

### `hotel_bookings`

Hotel reservation records.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| hotel_id | UUID (FK → hotels) | |
| room_id | UUID (FK → hotel_rooms) | |
| user_id | UUID | |
| check_in | DATE | |
| check_out | DATE | |
| guests | INTEGER | Default: 1 |
| total_price | DECIMAL | |
| status | VARCHAR | Default: 'pending' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `accounts`

Chart of accounts (wallets/banks).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | cash, bank, mobile_banking |
| balance | DECIMAL | Default: 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `transactions`

Financial transaction ledger.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | |
| booking_id | UUID (FK → bookings) | Optional |
| customer_id | UUID | |
| type | VARCHAR | income, expense |
| category | VARCHAR | |
| amount | DECIMAL | |
| debit | DECIMAL | Default: 0 |
| credit | DECIMAL | Default: 0 |
| date | DATE | |
| source_type | VARCHAR | |
| source_id | UUID | |
| payment_method | VARCHAR | |
| reference | VARCHAR | |
| note | TEXT | |
| created_at | TIMESTAMPTZ | |

### `expenses`

Expense records.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| title | VARCHAR | NOT NULL |
| amount | DECIMAL | NOT NULL |
| category | VARCHAR | |
| expense_type | VARCHAR | |
| date | DATE | |
| booking_id | UUID (FK → bookings) | Optional |
| package_id | UUID (FK → packages) | Optional |
| customer_id | UUID | |
| note | TEXT | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |

### `daily_cashbook`

Daily cash entries.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| date | DATE | |
| type | VARCHAR | income, expense |
| amount | DECIMAL | NOT NULL |
| category | VARCHAR | |
| description | VARCHAR | NOT NULL |
| payment_method | VARCHAR | |
| notes | TEXT | |
| wallet_account_id | UUID (FK → accounts) | |
| created_by | UUID | |
| created_at | TIMESTAMPTZ | |

### `financial_summary`

Aggregated financial data.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| total_income | DECIMAL | Default: 0 |
| total_expense | DECIMAL | Default: 0 |
| net_profit | DECIMAL | Default: 0 |
| updated_at | TIMESTAMPTZ | |

### `site_content`

CMS content storage.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| section_key | VARCHAR | Unique (hero, navbar, services, etc.) |
| content | JSONB | `{ "en": {...}, "bn": {...} }` |
| updated_by | UUID | |
| updated_at | TIMESTAMPTZ | |

### `cms_versions`

CMS version history for rollback.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| section_key | VARCHAR | |
| content | JSONB | Snapshot of content |
| note | TEXT | |
| updated_by | UUID | |
| created_at | TIMESTAMPTZ | |

### `blog_posts`

Blog content management.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| title | VARCHAR | NOT NULL |
| slug | VARCHAR | Unique |
| content | TEXT | |
| excerpt | TEXT | |
| image_url | TEXT | |
| author_id | UUID | |
| status | VARCHAR | Default: 'draft' |
| tags | TEXT[] | Array |
| published_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `notification_settings`

Per-event notification configuration.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| event_key | VARCHAR | e.g., 'booking_created' |
| event_label | VARCHAR | Human-readable label |
| enabled | BOOLEAN | Default: true |
| sms_enabled | BOOLEAN | Default: true |
| email_enabled | BOOLEAN | Default: true |
| updated_by | UUID | |
| updated_at | TIMESTAMPTZ | |

### `notification_logs`

Notification delivery history.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | Recipient user |
| booking_id | UUID (FK → bookings) | Optional |
| payment_id | UUID (FK → payments) | Optional |
| event_type | VARCHAR | |
| channel | VARCHAR | sms, email |
| recipient | VARCHAR | Phone or email |
| subject | VARCHAR | Email subject |
| message | TEXT | |
| status | VARCHAR | sent, failed |
| error_detail | TEXT | Error message if failed |
| sent_by | UUID | |
| created_at | TIMESTAMPTZ | |

### `company_settings`

App-wide configuration.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| setting_key | VARCHAR | Unique |
| setting_value | JSONB | |
| updated_by | UUID | |
| updated_at | TIMESTAMPTZ | |

### `booking_documents`

Uploaded booking documents.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| booking_id | UUID (FK → bookings) | |
| user_id | UUID | |
| document_type | VARCHAR | passport, visa, etc. |
| file_name | VARCHAR | |
| file_path | VARCHAR | |
| file_size | INTEGER | |
| created_at | TIMESTAMPTZ | |

### `installment_plans`

Installment plan definitions.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| num_installments | INTEGER | |
| description | TEXT | |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMPTZ | |

### `cancellation_policies`

Cancellation and refund rules.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | NOT NULL |
| description | TEXT | |
| refund_type | VARCHAR | Default: 'percentage' |
| refund_value | DECIMAL | Default: 0 |
| min_days_before_departure | INTEGER | |
| is_default | BOOLEAN | Default: false |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `refunds`

Refund records.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| booking_id | UUID (FK → bookings) | |
| policy_id | UUID (FK → cancellation_policies) | Optional |
| original_amount | DECIMAL | Default: 0 |
| deduction_amount | DECIMAL | Default: 0 |
| refund_amount | DECIMAL | Default: 0 |
| refund_method | VARCHAR | |
| reason | TEXT | |
| status | VARCHAR | Default: 'pending' |
| processed_by | UUID | |
| processed_at | TIMESTAMPTZ | |
| wallet_account_id | UUID (FK → accounts) | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `otp_codes`

OTP verification codes.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| phone | VARCHAR | |
| code | VARCHAR | |
| verified | BOOLEAN | Default: false |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

---

## Views

### `v_booking_profit`

Joins bookings with packages, expenses, and payments to calculate per-booking profit.

**Key Columns:** booking_id, guest_name, package_name, total_amount, total_payments, total_expenses, profit_amount

### `v_customer_profit`

Aggregates total bookings, payments, expenses, and profit per customer.

**Key Columns:** customer_id, full_name, phone, total_bookings, total_payments, total_expenses, profit

### `v_package_profit`

Aggregates total bookings, revenue, expenses, and profit per package.

**Key Columns:** package_id, package_name, package_type, total_bookings, total_revenue, total_expenses, profit

---

## Functions

### `has_role(_user_id UUID, _role app_role) → BOOLEAN`

Security definer function to check if a user has a specific role. Used in RLS policies.

### `deactivate_expired_packages() → VOID`

Automatically deactivates packages where `expiry_date < NOW()`.

### `generate_installment_schedule(p_booking_id, p_num_installments, p_total_amount, p_user_id) → VOID`

Creates installment payment records for a booking.

---

## Security Triggers

| Trigger | Table | Event | Purpose |
|---------|-------|-------|---------|
| `protect_admin_role_insert` | user_roles | BEFORE INSERT | Prevents admin role assignment |
| `protect_admin_role_update` | user_roles | BEFORE UPDATE | Prevents admin role modification |
| `protect_admin_role_delete` | user_roles | BEFORE DELETE | Prevents admin role removal |
| `protect_admin_user` | users | BEFORE UPDATE/DELETE | Prevents admin user ban/deletion |
