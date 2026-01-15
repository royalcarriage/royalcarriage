# Google Ads Export Data

This directory contains Google Ads performance data exports for ROI analysis and keyword intelligence.

## Required Export Files

Place your Google Ads CSV exports in this directory. The metrics import script will auto-detect and process them.

### 1. Search Keyword Report
**File naming:** `Search_keyword_report_*.csv` or `search-terms_*.csv`

**How to Export:**
1. Google Ads → Reports → Predefined reports (Dimensions)
2. Select "Search Terms" report
3. Date range: Last 30-90 days
4. Columns to include:
   - Search term
   - Match type
   - Campaign
   - Ad group
   - Cost
   - Clicks
   - Impressions
   - Conversions
   - Conversion value
   - CTR
   - CPC
5. Export as CSV (Download → CSV)

**Note:** Google Ads exports are often UTF-16 encoded TSV files with `.csv` extension and 2 header rows. The importer handles this automatically.

### 2. Campaign Performance Report
**File naming:** `Campaigns_*.csv` or `campaign-performance_*.csv`

**How to Export:**
1. Google Ads → Campaigns
2. Select date range (same as keyword report)
3. Columns to include:
   - Campaign
   - Status
   - Budget
   - Cost
   - Conversions
   - Conversion value
   - Impressions
   - Clicks
4. Download → CSV

### 3. Device Performance Report (Optional)
**File naming:** `Devices_*.csv` or `device-performance_*.csv`

**How to Export:**
1. Google Ads → Reports → Predefined reports
2. Select "Device" report
3. Export with Cost, Conversions, Conv. Value by device

### 4. Geographic Performance Report (Optional)
**File naming:** `Geographic_*.csv` or `geo-performance_*.csv`

**How to Export:**
1. Google Ads → Reports → Predefined reports
2. Select "Geographic" report
3. Export with location data + performance metrics

## Data Format Notes

### Expected CSV Format (Keyword Report):
```csv
Search term,Match type,Campaign,Ad group,Cost,Clicks,Impressions,Conversions,Conv. value
"ohare airport limo",Phrase,"Airport - Brand",ORD Service,$125.50,45,890,3,$450.00
"chicago black car",Broad,"Corporate - Generic",Black Car,$89.20,32,1200,1,$150.00
```

### Special Characters & Encoding:
- **UTF-16 with BOM:** Script auto-detects and converts
- **Tab-separated (TSV):** Script auto-detects (even with .csv extension)
- **Multiple header rows:** Script skips rows until numeric data found
- **Currency symbols:** $, € parsed automatically
- **Percentages:** 5.2% parsed as 0.052

## What Happens After Import

The `scripts/metrics-import.mjs` script processes these files and generates:

1. **`/reports/roi-report.md`** - Spend vs revenue analysis
2. **`/reports/keyword-top100.md`** - Top 100 non-brand keywords with SCALE/FIX labels
3. **`/packages/content/metrics/keyword_clusters.json`** - Keywords grouped by intent
4. **`/packages/content/ads_landing_page_matrix.csv`** - Keyword → landing page recommendations

## Sample Data (For Testing)

If you don't have real exports yet, create a sample file for testing:

**`Search_keyword_report_sample.csv`:**
```csv
Search term,Match type,Campaign,Cost,Clicks,Conversions,Conv. value
"ohare airport car service",Exact,"Airport - ORD",$45.00,12,2,$300.00
"midway limo",Phrase,"Airport - MDW",$23.50,8,1,$120.00
"chicago black car hourly",Broad,"Corporate - Hourly",$67.80,15,1,$250.00
```

Then run:
```bash
npm run metrics:import
```

The script will generate reports even with minimal data, and flag data quality issues.

## Troubleshooting

**Issue:** "No Google Ads files found"
- Solution: Ensure CSV files are in this directory
- Check file naming matches patterns above

**Issue:** "Could not parse Google Ads export"
- Solution: Open CSV in text editor, verify it has headers
- Check encoding (UTF-8 or UTF-16 with BOM)

**Issue:** "Conversion value is 0"
- Check: Did you enable conversion tracking in Google Ads?
- Check: Are conversions attributed correctly?

## Privacy & Security

⚠️ **IMPORTANT:** 
- Do NOT commit real data CSVs to git (they're in .gitignore)
- Data stays local or in your private Firebase project
- No data is sent to external APIs without explicit configuration

---

Last updated: January 15, 2026
