# Moovs Reservation Data

This directory contains Moovs platform reservation exports for revenue analysis and service mix optimization.

## Required Export Files

Export your Moovs reservation data and place CSV files in this directory.

### 1. All Reservations Table Export

**File naming:** `all_reservations_table_*.csv` or `moovs-reservations_*.csv`

**How to Export:**

1. Log into Moovs dispatch portal: https://portal.moovs.app
2. Navigate to Reports → Reservations
3. Select date range (match Google Ads date range for best ROI analysis)
4. Export all columns (or minimum required columns below)
5. Download as CSV

**Required Columns:**

- `Reservation ID` or `ID`
- `Date` or `Pickup Date`
- `Status` (DONE, CANCELLED, NO_SHOW, etc.)
- `Service Type` (Airport Transfer, Hourly Charter, Point-to-Point, etc.)
- `Vehicle Type` (Sedan, SUV, Sprinter, etc.)
- `Total Price` or `Revenue`
- `Driver Payout` (if available)
- `Tax Amount` (if available)
- `Request Source` (google_ads, direct, referral, etc.)
- `Pickup Location` or `Origin`
- `Dropoff Location` or `Destination`

**Optional but Helpful:**

- `Gratuity`
- `Booking Date` (vs Pickup Date)
- `Customer Name` or `Customer ID` (for repeat customer analysis)
- `Flight Number` (for airport pickups)
- `Campaign` or `UTM parameters` (if tracked)

### 2. Summary Reports (Optional)

**File naming:** `moovs-summary_*.csv`

If Moovs provides summary reports:

- Service type breakdown
- Revenue by vehicle type
- Top routes/destinations

## Data Format Notes

### Expected CSV Format:

```csv
ID,Date,Status,Service Type,Vehicle Type,Total Price,Driver Payout,Tax,Req Source,Origin,Destination
12345,2026-01-15,DONE,Airport Transfer,Sedan,$125.00,$65.00,$12.50,google_ads,O'Hare Airport,Downtown Chicago
12346,2026-01-15,DONE,Hourly Charter,SUV,$240.00,$120.00,$24.00,direct,Naperville,Multiple Stops
12347,2026-01-15,CANCELLED,Point-to-Point,Sedan,$85.00,$0.00,$0.00,google_ads,Midway Airport,Oak Brook
```

### Status Codes:

- **DONE** - Completed reservation (use for revenue)
- **CANCELLED** - Cancelled (exclude from revenue)
- **NO_SHOW** - Customer no-show (may have cancellation fee)
- **PENDING** - Future reservation (exclude from historical analysis)

### Request Source Mapping:

The importer looks for attribution in these fields:

- `Req Source` = `google_ads` → attributed to Google Ads
- `Req Source` = `website` → organic/direct traffic
- `Req Source` = `phone` → phone call
- UTM parameters (if tracked): `utm_source=google`, `utm_medium=cpc`

**If not tracked:** Importer will estimate based on booking date proximity to ad clicks (probabilistic attribution).

## What Happens After Import

The `scripts/metrics-import.mjs` script processes Moovs data and generates:

1. **`/reports/roi-report.md`**
   - Total revenue from DONE reservations
   - Google-Ads-attributed revenue (if tracked)
   - ROAS (Return on Ad Spend) = Revenue / Ad Spend
   - Profit proxy = Revenue - Tax - Driver Payout - Ad Spend

2. **`/packages/content/metrics/moovs_service_mix.json`**
   - Service type distribution (Airport: 60%, Hourly: 25%, etc.)
   - Vehicle type popularity
   - Top routes (ORD→Downtown, MDW→Suburbs, etc.)
   - Average revenue by service/vehicle type

3. **Service-Level Profitability Analysis**
   - Airport transfers: margin estimate
   - Corporate hourly: margin estimate
   - Special events: margin estimate

## Profit Model Assumptions

If Moovs doesn't provide driver payout or tax data, the importer uses these defaults (editable in `/packages/content/profit_model.json`):

```json
{
  "airport_margin": 0.28,
  "corporate_margin": 0.3,
  "wedding_margin": 0.33,
  "partybus_margin": 0.35,
  "default_tax_rate": 0.1,
  "default_driver_payout_rate": 0.55
}
```

**Contribution Margin Calculation:**

```
Contribution = Revenue * (1 - tax_rate - driver_payout_rate) - Ad Spend Allocated
```

For airport sedan at $125:

- Revenue: $125
- Tax (10%): -$12.50
- Driver (55%): -$68.75
- Gross profit: $43.75 (35% margin)
- Ad spend allocated: -$15 (example)
- **Net contribution: $28.75**

## Sample Data (For Testing)

If you don't have real Moovs exports yet, create a sample file:

**`all_reservations_table_sample.csv`:**

```csv
ID,Date,Status,Service Type,Vehicle Type,Total Price,Driver Payout,Tax,Req Source,Origin,Destination
1001,2026-01-10,DONE,Airport Transfer,Sedan,$125.00,$65.00,$12.50,google_ads,O'Hare Airport,Downtown Chicago
1002,2026-01-10,DONE,Hourly Charter,SUV,$240.00,$130.00,$24.00,website,Naperville,Chicago
1003,2026-01-11,DONE,Airport Transfer,Sedan,$95.00,$50.00,$9.50,google_ads,Midway Airport,Schaumburg
1004,2026-01-11,CANCELLED,Point-to-Point,Sedan,$85.00,$0.00,$0.00,google_ads,Downtown,O'Hare
1005,2026-01-12,DONE,Airport Transfer,SUV,$150.00,$80.00,$15.00,phone,O'Hare Airport,Naperville
```

Then run:

```bash
npm run metrics:import
```

## ROI Attribution Methodology

### Attribution Approach:

1. **Exact Match (Best):**
   - Moovs `Req Source` = `google_ads` → 100% attributed

2. **UTM Parameter Match:**
   - Booking URL contains `utm_source=google` or `utm_medium=cpc` → attributed

3. **Time-Window Probabilistic (Fallback):**
   - If no attribution field, importer looks at:
     - Ad clicks in past 7 days before booking
     - Assumes conversion rate based on industry benchmarks
     - Probabilistically assigns revenue

4. **No Attribution:**
   - If can't attribute, marked as "organic/direct"
   - Still counts in total revenue for ROAS calculation

### Data Quality Warnings:

The importer flags:

- ⚠️ "Missing driver payout data - using estimates"
- ⚠️ "No attribution field - using probabilistic attribution"
- ⚠️ "Date range mismatch with Google Ads data"
- ⚠️ "Unusually high cancellation rate"

## Connecting Moovs to Google Ads

**To enable automatic attribution:**

1. **Add UTM parameters to booking links on your site:**

   ```
   https://customer.moovs.app/royal-carriage-limousine/new/info?
     utm_source=google&
     utm_medium=cpc&
     utm_campaign=airport-ohare&
     utm_content=hero-cta
   ```

2. **Pass UTM parameters to Moovs in reservation data**
   (Check if Moovs captures UTM params in booking metadata)

3. **Alternative: Use phone tracking numbers**
   - Different numbers for Google Ads vs organic
   - Track calls → attribute revenue

## Privacy & Security

⚠️ **IMPORTANT:**

- Do NOT commit real customer data to git (files are in .gitignore)
- Remove or redact customer names/emails if exporting manually
- Data stays local or in your private Firebase project
- PII is not used in reports (only aggregated revenue data)

## Troubleshooting

**Issue:** "No Moovs files found"

- Solution: Ensure CSV files are in this directory
- Check file naming matches patterns

**Issue:** "Could not detect revenue column"

- Solution: Rename column to "Total Price" or "Revenue"
- Or update parser in metrics-import.mjs

**Issue:** "All reservations showing as unattributed"

- Check: Is `Req Source` field populated in Moovs export?
- Workaround: Use time-window probabilistic attribution

---

Last updated: January 15, 2026
