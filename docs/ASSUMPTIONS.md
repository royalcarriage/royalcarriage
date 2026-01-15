# Assumptions Log

This document tracks assumptions made during the CSV import system implementation for Royal Carriage Limousine.

## Data Format Assumptions

### CSV Export from Moovs

**Assumption**: Moovs exports will contain the following minimum required columns:
- Trip ID (or Reservation ID) - for unique booking identification
- Status or Status Slug - for booking status tracking
- Pickup Date - for scheduling
- Total Amount - for revenue tracking

**Rationale**: Without these fields, we cannot create meaningful booking records.

**Impact**: If exports lack these fields, import will fail with clear error messages.

**Validation**: Check sample CSV file `/mnt/data/all_reservations_table_2025-12-25T06_00_05.780798952Z.csv` when available.

---

### Money Format Variations

**Assumption**: Money values in CSV may appear in multiple formats:
- With dollar signs: `$125.00`
- With commas: `1,250.50`
- Negative with parentheses: `($25.00)`
- Negative with minus: `-25.00`
- Plain numbers: `125`
- Empty or blank: ``, `  `, `-`, `N/A`

**Rationale**: Accounting exports commonly use these formats.

**Implementation**: Parser handles all variants, treating empty/blank as `$0.00`.

---

### Duplicate Column Names

**Assumption**: Moovs exports may have duplicate column names with trailing spaces or numeric suffixes:
- `Pickup Date` vs `Pickup Date ` (trailing space)
- `Vehicle` vs `Vehicle.1`

**Rationale**: Observed in problem statement.

**Implementation**: Column normalizer strips spaces and handles `.N` suffixes.

---

### Date Formats

**Assumption**: Dates may appear as:
- ISO 8601: `2026-01-15`
- US format: `01/15/2026`
- European format: `15/01/2026`
- Long format: `Jan 15, 2026`

**Rationale**: Different systems export dates differently.

**Implementation**: Parser attempts multiple formats; throws error only if all fail.

---

## Business Logic Assumptions

### Pay Period Definition

**Assumption**: Driver pay periods run Monday-Sunday (ISO week).

**Rationale**: Common payroll practice; aligns with weekly reporting.

**Implementation**: `calculatePayPeriod()` uses ISO week numbering.

**Alternative**: If actual pay periods differ, function can be adjusted.

---

### Revenue Line Items

**Assumption**: Booking revenue breaks down into:
- Base Rate
- Meet & Greet
- Tolls
- Other fees (up to 3 categories)
- Tax
- Discount
- Promo Applied
- Refund
- Gratuity

**Rationale**: Based on problem statement line item types.

**Impact**: If Moovs includes additional fee types, they may be unmapped initially.

**Mitigation**: Unmapped columns logged to `unmapped` array with suggestions.

---

### Cancellation Handling

**Assumption**: Cancelled bookings (`cancelled = true` or `status = 'CANCELLED'`) are:
- Excluded from revenue totals
- Excluded from AR aging
- Included in import counts
- Driver payouts set to `$0`

**Rationale**: Cancelled trips do not generate revenue or driver pay.

**Exception**: Cancellation fees (if tracked) would be handled as separate line items.

---

### Attribution Logic

**Assumption**: Marketing attribution priority:
1. **Exact match**: `reqSource = 'google_ads'` → 100% attributed
2. **UTM match**: `utm_source=google` or `utm_medium=cpc` → attributed
3. **GCLID match**: `gclid` parameter present → attributed
4. **No match**: Marked as `organic/direct`

**Rationale**: Follows standard digital marketing attribution models.

**Limitation**: Does not handle multi-touch attribution or assisted conversions.

---

### Driver Payout Components

**Assumption**: Driver payouts may include:
- **Flat rate**: Fixed amount per trip
- **Hourly rate**: Rate × drive time
- **Gratuity**: Customer tip (if shared with driver)

**Total Payout**: `flat + hourly + gratuity`

**Rationale**: Common limousine driver compensation structures.

**Note**: If Moovs only provides `Driver Payout` (total), components will be `$0` except total.

---

### Affiliate Payables

**Assumption**: Affiliates (partners, referral sources) earn commissions on bookings.

**When created**: If `affiliate_name` present in CSV.

**Status**: Default to `unpaid` on import.

**Due date**: 30 days from pickup date (configurable).

**Rationale**: Standard Net 30 payment terms.

---

## Data Quality Assumptions

### Missing Data Handling

**Assumption**: Some fields may be missing or empty:
- Driver ID → Warning logged; manual assignment needed
- Vehicle ID → Warning logged; link to fleet registry
- Email/Phone → Optional; empty strings stored
- Pickup Time → Use `00:00:00` if missing

**Rationale**: Real-world exports often have incomplete data.

**Implementation**: Parsers return `undefined` or default values; warnings logged.

---

### Duplicate Detection

**Assumption**: Duplicate bookings detected by:
1. SHA256 hash of entire CSV file → prevents re-import
2. `booking_id` uniqueness → prevents duplicate booking records

**Rationale**: Prevents double-counting revenue and payouts.

**Behavior**: Duplicate imports return error; duplicate booking IDs within same import are skipped with warning.

---

### Timezone Handling

**Assumption**: All dates/times in CSV are in **America/Chicago** (Central Time).

**Rationale**: Royal Carriage operates in Chicago.

**Implementation**: Dates parsed as-is; stored in Firestore as UTC.

**Display**: Admin dashboard converts to local timezone for display.

---

## Reconciliation Assumptions

### Total Amount Reconciliation

**Assumption**: `Sum(Total Amount from CSV) ≈ Sum(revenue_lines.amount where isRevenue=true)`

**Tolerance**: Allow ±$0.01 per booking for rounding errors.

**Rationale**: Revenue line items should sum to total charged.

**Discrepancy handling**: Flag in audit report if difference > $0.01 × booking count.

---

### Payment Reconciliation

**Assumption**: `amount_paid + amount_due = total_charged`

**Rationale**: Total charged must equal sum of paid and due amounts.

**Exception**: Refunds reduce `amount_due`; `amount_paid` remains unchanged.

---

## Marketing Integration Assumptions

### GA4 Data API

**Assumption**: GA4 exports will provide:
- Landing page URL
- Source/Medium
- Session count
- Conversion events
- Revenue (e-commerce tracking)

**Rationale**: Standard GA4 metrics for attribution.

**Limitation**: Requires GA4 setup with enhanced e-commerce tracking.

---

### Google Ads API

**Assumption**: Google Ads API will provide:
- Campaign names
- Ad group names
- Keywords
- Cost
- Clicks/Impressions
- Conversions
- Conversion value

**Rationale**: Standard Google Ads performance metrics.

**Requirement**: API access with read permissions.

---

### Attribution Window

**Assumption**: Marketing attribution uses **7-day click** window.

**Rationale**: Industry standard for direct response advertising.

**Implementation**: Join bookings to ad clicks within 7 days prior to booking date.

**Alternative**: Configurable via admin settings.

---

## Performance Assumptions

### Import Batch Size

**Assumption**: Process CSV imports in batches of **100 rows**.

**Rationale**: Balance between performance and memory usage.

**Scalability**: For large imports (10,000+ rows), may need chunking.

---

### Firestore Write Limits

**Assumption**: Firestore write rate limits (10,000 writes/second) will not be exceeded.

**Rationale**: Typical import size < 1,000 rows.

**Mitigation**: Implement backoff and retry for large imports.

---

## Security Assumptions

### PII Handling

**Assumption**: Customer PII (emails, phones, names) is:
- Stored in Firestore with access control
- Not logged to console or error messages
- Redacted in audit reports

**Rationale**: Privacy compliance (GDPR, CCPA).

---

### Admin Access

**Assumption**: Only users with `admin` role can:
- Upload CSV files
- View import audit reports
- Access customer PII
- Modify bookings/receivables/payouts

**Rationale**: Role-based access control (RBAC).

---

## Future Considerations

### Items NOT Currently Implemented

1. **Multi-currency support**: Assumes all amounts in USD.
2. **Multi-company support**: Assumes single business entity.
3. **Custom fee types**: Limited to predefined line item types.
4. **Real-time sync**: Imports are manual uploads; no live API sync.
5. **Automated reconciliation**: Audit reports generated on import; no scheduled checks.

### Extensibility

The system is designed to be extended:
- Additional fee types can be added to `RevenueLineType` enum
- Custom column mappings can be configured per import
- New marketing channels can be added to attribution logic
- Additional metrics can be computed from canonical entities

---

## Validation Tasks

Before production deployment:

- [ ] Verify sample Moovs CSV contains expected columns
- [ ] Test money parser with actual CSV values
- [ ] Confirm timezone handling for Chicago-based dates
- [ ] Validate pay period calculation matches payroll system
- [ ] Test reconciliation with known totals
- [ ] Verify Firebase Storage permissions for CSV files
- [ ] Confirm admin role access restrictions
- [ ] Test large import (1,000+ rows) performance

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-15  
**Author**: CSV Import System Implementation  
**Review**: Pending user feedback on assumptions
