# Admin Dashboard Walkthrough

Royal Carriage Limousine Admin Dashboard for CSV Import, Accounting, Fleet, and Payroll Management.

## Table of Contents

1. [Getting Started](#getting-started)
2. [CSV Import Center](#csv-import-center)
3. [Bookings Ledger](#bookings-ledger)
4. [Driver Payroll](#driver-payroll)
5. [Affiliate Payables](#affiliate-payables)
6. [Accounts Receivable](#accounts-receivable)
7. [Fleet Utilization](#fleet-utilization)
8. [Marketing Attribution](#marketing-attribution)

---

## Getting Started

### Access the Dashboard

Navigate to: `https://your-domain.com/admin`

**Login**: Requires admin role credentials.

### Dashboard Overview

The admin dashboard provides:
- **Import Center**: Upload and manage CSV imports
- **Bookings**: View and search all reservations
- **Payroll**: Weekly driver payouts and reports
- **Payables**: Affiliate commissions due
- **Receivables**: AR aging and collections
- **Fleet**: Vehicle utilization metrics
- **Marketing**: Attribution and performance insights

---

## CSV Import Center

### Uploading a CSV File

1. Navigate to **Import Center** from the admin menu
2. Click **"New Import"** button
3. Follow the 4-step wizard:

#### Step 1: Select Data Type

Choose the type of data you're importing:
- **Trips/Reservations** (most common for Moovs exports)
- **Drivers**
- **Vehicles**
- **Customers**

**For Moovs exports**, select **"Trips/Reservations"**.

#### Step 2: Upload File

- **Drag and drop** your CSV file, or click **"Browse Files"**
- Supported format: CSV (max 10MB)
- File is uploaded to Firebase Storage
- SHA256 hash calculated to prevent duplicates

**Tip**: Name your files descriptively, e.g., `moovs_reservations_2026-01.csv`

#### Step 3: Map Fields

The system **auto-maps** Moovs columns to canonical fields using pattern matching.

**Review the mapping**:
- **Green checkmarks**: Successfully mapped
- **Yellow warnings**: Suggested mapping (review recommended)
- **Red X**: Unmapped column (will be saved to raw data)

**Preview shows first 3 rows** to verify mapping accuracy.

**Adjust mappings**:
- Click dropdown next to any column
- Select correct system field
- Or choose **"Skip this column"** if not needed

**Common mappings**:
- `Trip ID` → `Booking ID`
- `Total Amount` → `Total Amount`
- `Driver Name` → `Driver Name`
- `Pickup Date` → `Pickup Date`

#### Step 4: Review & Import

Summary displays:
- File name
- Total records
- Fields mapped
- Validation status

**Validation checks**:
- ✅ All required fields mapped
- ✅ Date formats valid
- ✅ Money values parseable
- ⚠️ Warnings (non-blocking)

Click **"Start Import"** to begin processing.

### Monitoring Import Progress

After starting import:
1. Import status shows **"Processing"**
2. Progress bar updates in real-time
3. Notification appears on completion

**View import details**:
- Click **eye icon** next to any import
- See: rows imported, skipped, failed
- Download error log if failures occurred

### Import History

**Import History** table shows:
- All past imports
- Status: Completed, Failed, Processing
- Record counts: Total, Created, Updated, Failed
- Upload date and user

**Filter by**:
- All, Completed, Pending, Failed

**Actions**:
- **View**: See detailed audit report
- **Download**: Export error log
- **Retry**: Re-process failed import

---

## Bookings Ledger

### Viewing All Bookings

Navigate to **Bookings** from the admin menu.

**Bookings table displays**:
- Booking ID
- Customer name
- Pickup date/time
- Pickup → Dropoff locations
- Vehicle type
- Status
- Total amount
- Payment status

### Searching Bookings

**Search by**:
- Booking ID
- Customer name
- Phone number
- Email
- Date range

**Filter by**:
- Status: Completed, Cancelled, Pending
- Vehicle type: Sedan, SUV, Sprinter, etc.
- Payment status: Paid, Unpaid, Partial

**Sort by**:
- Pickup date (newest/oldest)
- Total amount (high/low)
- Status

### Booking Detail View

Click any booking to view full details:

**Overview tab**:
- Booking ID, Status
- Created date, Pickup datetime
- Customer contact info
- Pickup/Dropoff addresses

**Service Details tab**:
- Trip type (Airport Transfer, Hourly Charter, etc.)
- Passengers, Stops
- Distance, Drive time
- Vehicle assigned

**Revenue Breakdown tab**:
- Base rate
- Meet & Greet
- Tolls
- Other fees
- **Subtotal**
- Tax
- Discount
- **Total Charged**
- Refund (if any)
- **Net Revenue**

**Payment Info tab**:
- Amount paid
- Amount due
- Payment method
- Payment status
- Due date

**Driver & Vehicle tab**:
- Driver name
- Driver ID
- Vehicle type
- Vehicle ID
- Driver payout

**Attribution tab**:
- Request source (google_ads, direct, etc.)
- UTM parameters
- Google Click ID (gclid)
- Query string

---

## Driver Payroll

### Weekly Payroll Summary

Navigate to **Payroll** → **Weekly Payroll**.

**Select pay period**:
- Current week (default)
- Previous week
- Custom week (date picker)

**Summary displays**:
- Pay period: `2026-W03` (Jan 12 - Jan 18, 2026)
- Total drivers: 15
- Total trips: 142
- Total payout: $12,450.00

### Payroll by Driver

**Driver list shows**:
- Driver name
- Driver ID
- Trip count
- Total payout
- Breakdown: Flat + Hourly + Gratuity
- Payment status: Pending, Approved, Paid

**Sort by**:
- Total payout (high/low)
- Trip count
- Driver name

### Driver Detail Drilldown

Click any driver to see:
- All trips for the pay period
- Payout per trip
- Total hours driven
- Total gratuity received

**Export options**:
- PDF pay stub
- CSV for payroll system
- Email to driver (if enabled)

### Approving Payouts

1. Review driver payouts for accuracy
2. Check **"Select all"** or individual drivers
3. Click **"Approve Payouts"**
4. Status changes to **"Approved"**

**Mark as Paid**:
After payment processed externally:
1. Select approved payouts
2. Click **"Mark as Paid"**
3. Enter payment date
4. Status changes to **"Paid"**

### Payroll Reports

**Export options**:
- Weekly summary (PDF/CSV)
- Driver detail report
- Year-to-date totals
- 1099 preparation data

---

## Affiliate Payables

### Viewing Affiliate Commissions

Navigate to **Payables** → **Affiliate Commissions**.

**Payables table shows**:
- Affiliate name
- Booking ID
- Commission amount
- Due date
- Status: Unpaid, Paid, Processing

**Filter by**:
- Status: Unpaid, Paid, All
- Date range
- Affiliate name

### Marking Commissions as Paid

1. Review unpaid commissions
2. Select commissions to mark paid
3. Click **"Mark as Paid"**
4. Enter payment date and method
5. Add notes (optional)

**Bulk actions**:
- Select multiple commissions
- Mark all as paid at once

### Affiliate Performance

**Metrics by affiliate**:
- Total bookings referred
- Total commission earned
- Average commission per booking
- Conversion rate (if tracked)

**Top affiliates**:
- Highest revenue contributors
- Most active referrers

---

## Accounts Receivable

### AR Aging Report

Navigate to **Receivables** → **AR Aging**.

**Aging buckets**:
- **Current**: 0-30 days overdue
- **31-60 Days**: 31-60 days overdue
- **61-90 Days**: 61-90 days overdue
- **90+ Days**: Over 90 days overdue

**Summary displays**:
- Total AR: $8,450.00
- Current: $5,200.00
- 31-60 Days: $2,100.00
- 61-90 Days: $950.00
- 90+ Days: $200.00

### Open AR List

**Receivables table shows**:
- Booking ID
- Customer name
- Pickup date
- Total charged
- Amount paid
- Amount due
- Due date
- Days overdue
- Aging bucket

**Filter by**:
- Aging bucket
- Customer name
- Amount due (min/max)

**Sort by**:
- Days overdue
- Amount due (high/low)

### Collections Actions

**For overdue receivables**:
1. Click booking to view details
2. Add collection notes
3. Mark as "In Collections"
4. Send payment reminder (if email available)
5. Update payment status when received

**Export options**:
- AR aging report (PDF/CSV)
- Open invoices list
- Collections report

---

## Fleet Utilization

### Fleet Overview

Navigate to **Fleet** → **Utilization**.

**Metrics displayed**:
- Total vehicles: 25
- Active vehicles: 22
- In maintenance: 3
- Average utilization: 78%

### Vehicle List

**Fleet table shows**:
- Vehicle ID
- Vehicle type (Sedan, SUV, Sprinter)
- Vehicle name
- Status: Active, Maintenance, Retired
- Trips this week
- Revenue this week
- All-time trips
- All-time revenue

### Vehicle Detail View

Click any vehicle to see:
- Full vehicle details (make, model, year, VIN, license plate)
- Usage statistics
- Revenue trends (chart)
- Maintenance history (if tracked)
- Assigned bookings

### Utilization Metrics

**Weekly metrics by vehicle type**:
- Trips per week
- Revenue per week
- Utilization rate (trips / capacity)

**Trends**:
- Most used vehicles
- Highest revenue vehicles
- Underutilized vehicles

**Export options**:
- Fleet utilization report (PDF/CSV)
- Vehicle performance summary

---

## Marketing Attribution

### Attribution Overview

Navigate to **Marketing** → **Attribution**.

**Summary displays**:
- Total bookings: 450
- Google Ads attributed: 180 (40%)
- Organic/Direct: 200 (44%)
- Other sources: 70 (16%)

### Bookings by Source

**Attribution table shows**:
- Source (google_ads, direct, referral, etc.)
- Booking count
- Total revenue
- Average booking value
- ROI (if ad spend tracked)

**Top campaigns** (Google Ads):
- Campaign name
- Bookings
- Revenue
- Ad spend
- ROAS (Return on Ad Spend)

### GA4 Integration

**Page performance**:
- Landing page URL
- Sessions
- Conversions
- Revenue
- Conversion rate

**Top pages**:
- Pages with highest conversions
- Pages with highest revenue

### Admin Pages

#### Pages to Recycle

Lists low-traffic or underperforming pages that may need updates or removal.

**Criteria**:
- Low traffic (< 10 sessions/month)
- Low conversion rate (< 1%)
- High bounce rate (> 80%)

#### Pages to Fix

Lists pages with issues affecting performance.

**Criteria**:
- High traffic but low conversions
- Slow load times
- High exit rates

#### Blog Ideas

Suggests content topics based on:
- High-performing keywords
- Popular landing pages
- Search query trends

---

## Best Practices

### Import Workflow

1. **Backup first**: Download your Moovs export before importing
2. **Test with small file**: Import a few rows first to verify mapping
3. **Review audit report**: Check for warnings/errors after each import
4. **Reconcile totals**: Verify revenue totals match your expectations
5. **Regular imports**: Import weekly to keep data current

### Data Quality

- **Fix missing data**: Assign drivers and vehicles to bookings without them
- **Update AR**: Mark invoices as paid when received
- **Approve payouts promptly**: Drivers expect timely payment
- **Review attribution**: Ensure UTM parameters are tracked in booking URLs

### Reporting Cadence

- **Daily**: Check import errors, new bookings
- **Weekly**: Approve driver payouts, review receivables
- **Monthly**: Generate financial reports, review fleet utilization
- **Quarterly**: Analyze marketing attribution, optimize campaigns

---

## Troubleshooting

### Import Failed

**Error: "Could not detect revenue column"**
- Solution: Ensure CSV has `Total Amount` or `Total` column
- Or map manually in Step 3

**Error: "Duplicate import detected"**
- Solution: File with same SHA256 hash already imported
- If re-import needed, modify CSV slightly (e.g., add comment column)

**Error: "Invalid date format in row X"**
- Solution: Review date format in CSV
- Supported: `YYYY-MM-DD`, `MM/DD/YYYY`
- Fix in CSV and re-upload

### Reconciliation Discrepancy

**Total Amount doesn't match revenue lines**
- Check: Are all fee columns mapped?
- Verify: Tax, discount, refunds properly calculated
- Review: Audit report for parsing errors

### Missing Attribution

**All bookings showing as "direct"**
- Check: Does Moovs export include `Req Source` or `Query String` columns?
- Workaround: Add UTM parameters to booking links on website

---

## Support

For questions or issues:
- Check [Accounting Import Spec](./ACCOUNTING_IMPORT_SPEC.md) for technical details
- Review [Assumptions](./ASSUMPTIONS.md) for data model logic
- Contact: support@royalcarriagelimo.com

---

**Last Updated**: 2026-01-15  
**Version**: 1.0
