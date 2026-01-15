# Accounting Import Specification

## Overview

This document specifies the CSV import system for Royal Carriage Limousine, providing comprehensive accounting, fleet management, payroll, affiliate tracking, and marketing attribution from Moovs reservation exports.

## Architecture

```
CSV Upload → Storage → Raw Import → Column Mapping → Normalization → Canonical Entities → Reporting
```

### Data Flow

1. **Upload**: User uploads CSV via admin dashboard
2. **Storage**: Original file stored in Firebase Storage with SHA256 hash
3. **Raw Import**: File metadata saved to `raw_import_batches` collection
4. **Parsing**: Each row saved to `raw_import_rows` with original data
5. **Mapping**: Auto-mapper matches CSV columns to canonical fields
6. **Normalization**: Data parsed and cleaned (money, dates, phones, etc.)
7. **Entity Creation**: Canonical entities created (bookings, revenue_lines, etc.)
8. **Audit**: Reconciliation report generated with totals and error tracking

## Collections Schema

### raw_import_batches

Immutable record of each CSV import.

```typescript
{
  id: string;
  filename: string;                // User-provided name
  originalFilename: string;        // Original file name
  storageUrl: string;              // Firebase Storage gs:// URL
  sha256Hash: string;              // For duplicate detection
  fileSize: number;                // Bytes
  rowCount: number;                // Total rows in CSV
  uploadedAt: Date;
  uploadedBy: string;              // User ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  errorMessage?: string;
}
```

### raw_import_rows

One row per CSV line, preserving original data.

```typescript
{
  id: string;
  batchId: string;                 // FK to raw_import_batches
  rowNumber: number;               // Line number in CSV (1-indexed)
  rawData: Record<string, any>;   // Original CSV row as JSON
  normalizedData?: Record<string, any>;  // After column mapping
  status: 'pending' | 'processed' | 'skipped' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}
```

### bookings

Canonical booking/reservation entity.

```typescript
{
  id: string;
  bookingId: string;               // From Trip ID (unique identifier)
  
  // Status
  status: {
    statusSlug: string;            // 'completed', 'cancelled', 'pending'
    closedStatus?: string;
    cancelled: boolean;
  };
  
  // Timestamps
  createdAt: Date;                 // Booking created date
  pickupDatetime: Date;            // Pickup date + time
  
  // Locations
  pickupAddress?: string;
  dropoffAddress?: string;
  
  // Service details
  service: {
    tripType?: string;             // 'Airport Transfer', 'Hourly Charter'
    orderType?: string;
    classification?: string;
    passengers?: number;
    stops: number;
    distance?: number;             // miles
    driveTime?: number;            // minutes
  };
  
  // Vehicle
  vehicle: {
    vehicleId?: string;
    vehicleType?: string;          // 'Sedan', 'SUV', 'Sprinter'
    vehicleName?: string;
  };
  
  // Contacts
  contacts: {
    bookingContact?: string;
    passengerName?: string;
    emails: string[];
    phones: string[];
  };
  
  // Marketing attribution
  attribution: {
    reqSource?: string;            // 'google_ads', 'direct', 'referral'
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    gclid?: string;                // Google Click ID
    wbraid?: string;               // Google Ads iOS web-to-app
    gbraid?: string;               // Google Ads iOS app-to-web
    queryString?: string;          // Full query string
  };
  
  // Import metadata
  importBatchId: string;
  importRowId: string;
  
  updatedAt: Date;
}
```

### revenue_lines

Per-booking line items for revenue accounting.

```typescript
{
  id: string;
  bookingId: string;               // FK to bookings
  
  lineType: 'base_rate' | 'meet_greet' | 'tolls' | 'other1' | 'other2' | 
            'other3' | 'tax' | 'discount' | 'promo_applied' | 'refund' | 'gratuity';
  description?: string;
  amount: number;                  // USD, can be negative for discounts/refunds
  
  isRevenue: boolean;              // false for discounts/refunds
  
  createdAt: Date;
}
```

### receivables

Accounts receivable tracking.

```typescript
{
  id: string;
  bookingId: string;
  
  amountPaid: number;
  amountDue: number;
  paymentMethod?: string;          // 'credit_card', 'invoice', 'cash'
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'overdue';
  
  dueDate?: Date;
  paidAt?: Date;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### driver_payouts

Driver compensation by trip.

```typescript
{
  id: string;
  bookingId: string;
  
  driverId?: string;
  driverName?: string;
  
  // Payout components
  payoutFlat: number;              // Flat rate per trip
  payoutHourly: number;            // Hourly rate × hours
  payoutGratuity: number;          // Gratuity amount
  totalDriverPayout: number;       // Sum of above
  
  // Status
  earningStatus: 'pending' | 'approved' | 'paid';
  payPeriod: string;               // '2026-W03' (ISO week)
  payPeriodStart: Date;            // Monday of week
  payPeriodEnd: Date;              // Sunday of week
  
  paidAt?: Date;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### affiliate_payables

Affiliate/partner commissions.

```typescript
{
  id: string;
  bookingId: string;
  
  affiliateName: string;
  affiliateId?: string;
  
  payableAmount: number;
  
  payableStatus: 'unpaid' | 'paid' | 'processing' | 'disputed';
  
  dueDate?: Date;
  paidAt?: Date;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### fleet

Vehicle registry and metrics.

```typescript
{
  id: string;
  vehicleId: string;               // Unique vehicle identifier
  
  vehicleType: string;             // 'Sedan', 'SUV', 'Sprinter'
  vehicleName?: string;
  make?: string;
  model?: string;
  year?: number;
  
  licensePlate?: string;
  vin?: string;
  
  status: 'active' | 'maintenance' | 'retired';
  
  // Computed metrics
  totalTrips: number;
  totalRevenue: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### marketing_daily_ga4

Daily GA4 analytics snapshots.

```typescript
{
  id: string;
  date: string;                    // 'YYYY-MM-DD'
  
  landingPage: string;
  pagePath: string;
  source?: string;
  medium?: string;
  
  sessions: number;
  conversions: number;
  revenue: number;
  
  createdAt: Date;
}
```

### marketing_daily_google_ads

Daily Google Ads performance snapshots.

```typescript
{
  id: string;
  date: string;                    // 'YYYY-MM-DD'
  
  campaign: string;
  adGroup?: string;
  keyword?: string;
  
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  
  createdAt: Date;
}
```

## Column Mappings

### Moovs Export → Canonical Fields

The system auto-maps Moovs CSV columns to canonical fields. Supported patterns:

| Canonical Field | Moovs Columns (any match) |
|----------------|---------------------------|
| `booking_id` | Trip ID, TripID, Reservation ID |
| `status_slug` | Status Slug, Status |
| `cancelled` | Cancelled, Is Cancelled |
| `created_at` | Created At, Booking Date |
| `pickup_date` | Pickup Date, Date |
| `pickup_time` | Pickup Time, Time |
| `pickup_address` | Pickup Address, Pickup Location, Origin |
| `dropoff_address` | Dropoff Address, Dropoff Location, Destination |
| `trip_type` | Trip Type, Service Type |
| `passengers` | Passengers, Passenger Count, Pax |
| `vehicle_id` | Vehicle ID, Vehicle, Vehicle.1 |
| `vehicle_type` | Vehicle Type, Type of Vehicle |
| `email` | Email, Email Address |
| `phone` | Phone, Phone Number |
| `req_source` | Req Source, Request Source, Source |
| `query_string` | Query String, URL Parameters |
| `base_rate` | Base Rate, Base Price |
| `meet_greet` | Meet & Greet, Meet and Greet |
| `tolls` | Tolls, Toll Fees |
| `tax` | Tax, Tax Amount, Sales Tax |
| `discount` | Discount, Discount Amount |
| `refund` | Refund, Refund Amount |
| `gratuity` | Gratuity, Tip |
| `total_amount` | Total Amount, Total, Total Price |
| `amount_paid` | Amount Paid, Paid |
| `amount_due` | Amount Due, Balance Due |
| `payment_method` | Payment Method, Payment Type |
| `driver_id` | Driver ID, Driver |
| `driver_name` | Driver Name, Chauffeur |
| `driver_payout` | Driver Payout, Driver Pay |
| `affiliate_name` | Affiliate Name, Affiliate, Partner |
| `affiliate_payable` | Affiliate Payable, Affiliate Fee, Commission |

**Note**: Column names are matched case-insensitively with fuzzy matching for typos and variations.

## Data Transformations

### Money Format

**Input**: `$125.00`, `1,250.50`, `125`, `($25.00)`, ``, `-`

**Output**: Numeric USD (125.00, 1250.50, 125, -25.00, 0, 0)

**Rules**:
- Remove `$`, `,`, whitespace
- Handle parentheses as negative
- Empty/blank/"-"/"N/A" → 0
- Throw error on invalid format

### Percent Format

**Input**: `25%`, `0.25%`, `0.25`, `25`, ``

**Output**: Decimal (0.25, 0.0025, 0.25, 0.25, 0)

**Rules**:
- Remove `%`
- If value > 1, divide by 100 (assume percentage form)
- If value ≤ 1, use as-is (assume decimal form)
- Empty/blank → 0

### Date Format

**Input**: `2026-01-15`, `01/15/2026`, `Jan 15, 2026`

**Output**: Date object

**Rules**:
- Parse ISO format first
- Try MM/DD/YYYY, DD/MM/YYYY, other common formats
- Throw error on invalid date

### DateTime Format

**Input**: Date: `2026-01-15`, Time: `10:30 AM` or `14:30`

**Output**: Date object with time

**Rules**:
- Parse date first
- Parse time (HH:MM or HH:MM AM/PM)
- Combine into single Date object

### Phone Format

**Input**: `(312) 555-1234`, `312-555-1234`, `+1-312-555-1234`

**Output**: Normalized string (`3125551234`, `+13125551234`)

**Rules**:
- Remove all non-digits except leading `+`
- Preserve international prefix

### Email Format

**Input**: `  Test@Example.COM  `

**Output**: Lowercase, trimmed (`test@example.com`)

**Rules**:
- Trim whitespace
- Convert to lowercase
- Validate format (basic regex)

## Revenue Calculations

### Subtotal

```
subtotal = base_rate + meet_greet + tolls + other1 + other2 + other3 + gratuity
```

### Total Charged

```
total_charged = subtotal + tax - discount - promo_applied
```

### Net Revenue

```
net_revenue = total_charged - refund
```

## AR Aging Buckets

Receivables are aged based on `dueDate`:

- **Current**: 0-30 days overdue
- **31-60 Days**: 31-60 days overdue
- **61-90 Days**: 61-90 days overdue
- **90+ Days**: Over 90 days overdue

**Formula**:
```
days_overdue = TODAY() - dueDate
if amountDue > 0 and cancelled = false
```

## Pay Period Calculation

Driver payouts are grouped by ISO week (Monday-Sunday).

**Example**: Pickup date `2026-01-15` (Thursday)
- ISO Week: `2026-W03`
- Pay Period Start: `2026-01-12` (Monday)
- Pay Period End: `2026-01-18` (Sunday)

## Marketing Attribution

### Query String Parsing

From `Query String` column, extract:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `gclid` (Google Ads Click ID)
- `wbraid`, `gbraid` (Google Ads app tracking)

### Attribution Logic

1. **Direct Match**: If `reqSource` = `google_ads` → 100% attributed
2. **UTM Match**: If `utm_source=google` or `utm_medium=cpc` → attributed
3. **GCLID Match**: If `gclid` present → attributed to Google Ads

## Reconciliation

### Import Audit Report

For each batch, generate:

```typescript
{
  rowsTotal: number;               // Total rows in CSV
  rowsImported: number;            // Successfully imported
  rowsSkipped: number;             // Duplicate or invalid
  rowsDuplicate: number;           // SHA256 hash match
  rowsFailed: number;              // Parse errors
  
  parseErrors: [{
    rowNumber: number;
    field: string;
    value: any;
    error: string;
  }];
  
  warnings: [{
    type: 'missing_driver_id' | 'missing_vehicle_id' | 'bad_money_format';
    count: number;
    examples: [...];
  }];
  
  reconciliation: {
    totalAmountSum: number;        // Sum(Total Amount) from CSV
    revenueLinesTotal: number;     // Computed from revenue_lines
    amountPaidSum: number;         // Sum(Amount Paid)
    amountDueSum: number;          // Sum(Amount Due)
    refundSum: number;             // Sum(Refund)
    
    discrepancies: [{
      field: string;
      expected: number;
      actual: number;
      difference: number;
    }];
  };
  
  fixSuggestions: [{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    affectedRows: number;
    suggestion: string;
  }];
}
```

### Reconciliation Checks

1. **Total Amount Check**: `Sum(Total Amount from CSV) = Sum(revenue_lines.amount where isRevenue=true)`
2. **Payment Check**: `amountPaid + amountDue = totalCharged`
3. **Refund Check**: `refund ≤ totalCharged`

## Error Handling

### Parse Errors

If a field fails parsing:
1. Log error to `parseErrors` array
2. Set row status to `failed`
3. Continue processing other rows
4. Include in audit report

### Validation Warnings

Non-critical issues:
- Missing driver_id
- Missing vehicle_id
- Bad money format (recovered)
- Missing attribution data

Logged to `warnings` array for review.

### Fix Suggestions

Based on warnings, generate suggestions:
- "X rows missing driver_id - assign drivers manually"
- "Y rows have invalid money format - verify totals"
- "Z rows missing vehicle - link to fleet registry"

## API Endpoints

### Import CSV

```
POST /api/import/csv
Content-Type: multipart/form-data

Request:
- file: CSV file
- importType: 'moovs' | 'custom'

Response:
{
  batchId: string;
  status: 'processing';
  rowCount: number;
}
```

### Get Import Status

```
GET /api/import/{batchId}

Response:
{
  batch: RawImportBatch;
  progress: {
    processed: number;
    total: number;
    percentComplete: number;
  };
  auditReport?: ImportAuditReport;
}
```

### Get Bookings

```
GET /api/bookings
Query: ?status=completed&startDate=2026-01-01&endDate=2026-01-31&page=1

Response:
{
  bookings: Booking[];
  total: number;
  page: number;
  perPage: number;
}
```

### Get Driver Payroll

```
GET /api/payroll/weekly
Query: ?payPeriod=2026-W03

Response: WeeklyPayrollSummary
```

### Get AR Aging

```
GET /api/receivables/aging

Response: ARAgingReport
```

### Get Fleet Utilization

```
GET /api/fleet/utilization
Query: ?vehicleId=V123&startDate=2026-01-01

Response: FleetUtilizationMetrics[]
```

## Scripts

### Import Local CSV

```bash
npm run import:local -- --file=./data/moovs/reservations.csv
```

Options:
- `--file`: Path to CSV file
- `--dry-run`: Preview import without saving
- `--batch-size`: Rows per batch (default: 100)

## Security

- CSV files stored in Firebase Storage with access control
- Import restricted to admin role
- PII (emails, phones) handled per privacy policy
- SHA256 hashes prevent duplicate imports
- Audit logs track all import actions
