

## PDF Invoice and Payment Receipt Generator

### Overview
Create a new utility module that generates professional PDF invoices and payment receipts using `jsPDF` + `jspdf-autotable` (already installed). The PDFs will include the company logo, customer details, package info, payment history, and due amounts. Both admin and customer dashboards will get download buttons.

### PDF Documents

**1. Invoice** -- Full booking invoice with all details
- Company header with logo, name ("RAHE KABA"), and contact info (from CMS `contact` section)
- Invoice number (derived from tracking ID), date
- Customer details: name, phone, passport, address
- Package details: name, type, duration, travelers, total amount
- Payment schedule table: installment #, amount, due date, status, paid date
- Summary box: Total Amount, Total Paid, Total Due

**2. Payment Receipt** -- Receipt for a specific completed payment
- Same company header with logo
- Receipt number (derived from payment ID)
- Customer details
- Payment details: amount, date paid, method, installment #, booking tracking ID
- Running balance: total paid so far, remaining due

### New File: `src/lib/invoiceGenerator.ts`

Two exported functions:

```
generateInvoice(booking, customer, payments, companyInfo) -> triggers PDF download
generateReceipt(payment, booking, customer, companyInfo) -> triggers PDF download
```

**Logo handling**: The logo image (`src/assets/logo.jpg`) will be embedded as a base64 data URL into the PDF using `doc.addImage()`. A helper will convert the imported image to base64 via a canvas element.

**Company info**: Pulled from CMS `contact` section content (company name, phone, email, address) and passed into the generator functions.

### Integration Points

**A. Admin Bookings Page (`AdminBookingsPage.tsx`)**
- Add "Download Invoice" button per booking card
- Fetches related payments + profile on click, then calls `generateInvoice`

**B. Admin Payments Page (`AdminPaymentsPage.tsx`)**
- Add "Receipt" button per completed payment row
- Calls `generateReceipt` for that payment

**C. Customer Dashboard (`Dashboard.tsx`)**
- Add "Download Invoice" button in each expanded booking section
- Add "Receipt" button next to each completed payment in the payment table

**D. Customer Financial Report (`CustomerFinancialReport.tsx`)**
- Add "Download Invoice" button next to each booking row
- Add "Download Receipt" for completed payments

### PDF Layout (Invoice)

```text
+-----------------------------------------------+
|  [LOGO]  RAHE KABA                             |
|          Hajj & Umrah Services                 |
|          Phone: xxx | Email: xxx               |
+-----------------------------------------------+
|  INVOICE                                       |
|  Invoice #: RK-XXXXXXXX   Date: dd MMM yyyy   |
+-----------------------------------------------+
|  Bill To:                                      |
|  Customer Name | Phone | Passport | Address    |
+-----------------------------------------------+
|  Package: Umrah Premium | 14 Days | 2 travelers|
|  Total Amount: ৳1,50,000                       |
+-----------------------------------------------+
|  PAYMENT SCHEDULE                              |
|  # | Amount | Due Date | Status | Paid Date   |
|  1 | ৳50k   | 01 Jan   | Paid   | 02 Jan     |
|  2 | ৳50k   | 01 Feb   | Pending| --          |
|  3 | ৳50k   | 01 Mar   | Pending| --          |
+-----------------------------------------------+
|  SUMMARY                                       |
|  Total: ৳1,50,000  Paid: ৳50,000  Due: ৳1,00k |
+-----------------------------------------------+
```

### Files Changed

| File | Action |
|------|--------|
| `src/lib/invoiceGenerator.ts` | New -- PDF invoice + receipt generation |
| `src/pages/admin/AdminBookingsPage.tsx` | Add "Download Invoice" button |
| `src/pages/admin/AdminPaymentsPage.tsx` | Add "Receipt" button for completed payments |
| `src/pages/Dashboard.tsx` | Add invoice + receipt download buttons |
| `src/components/admin/CustomerFinancialReport.tsx` | Add invoice + receipt buttons |

### Technical Notes

- Uses `jsPDF` and `jspdf-autotable` (already installed, no new dependencies)
- Logo embedded via `doc.addImage()` with base64-encoded `logo.jpg`
- Company contact info fetched from `site_content` CMS table (`contact` section) so it stays in sync with admin CMS edits
- Currency formatted as BDT with `৳` symbol
- File names follow pattern: `Invoice_RK-XXXXXXXX.pdf` and `Receipt_RK-XXXXXXXX_1.pdf`

