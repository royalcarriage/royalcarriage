# Keyword Research Data

This directory contains keyword research data from tools like Google Keyword Planner, SEMrush, Ahrefs, or manual research.

## Required Files

Place your keyword research data exports here. The metrics import script will process them for SEO content prioritization.

### 1. Keyword List with Search Volume
**File naming:** `keyword-research_*.xlsx` or `keywords_*.csv`

**Required Columns:**
- `Keyword` or `Search Term`
- `Search Volume` or `Avg. Monthly Searches`
- `Competition` or `Keyword Difficulty` (optional)
- `CPC` or `Suggested Bid` (optional)
- `Intent` or `Category` (optional: informational, commercial, transactional)

**How to Generate:**

#### Option 1: Google Keyword Planner
1. Google Ads → Tools → Keyword Planner
2. "Discover new keywords" OR "Get search volume"
3. Enter seed keywords:
   - chicago airport limo
   - ohare car service
   - midway transportation
   - executive black car
   - party bus rental chicago
   - wedding transportation chicago
4. Export results (CSV or Excel)

#### Option 2: SEMrush / Ahrefs
1. Enter competitor domain or seed keyword
2. Export "Keyword Magic Tool" or "Keyword Explorer" results
3. Filter to relevant keywords (location: Chicago/Illinois)

#### Option 3: Manual Research
Create CSV with keywords + estimated volume:
```csv
Keyword,Search Volume,Intent,Notes
"ohare airport limo",2400,transactional,High-intent airport keyword
"chicago black car service",1900,transactional,Corporate + airport
"party bus rental chicago",1600,transactional,Party bus specific
"wedding transportation chicago",880,transactional,Wedding specific
"limo service near me",8100,transactional,Generic but high volume
"chicago airport shuttle",3600,transactional,Lower-margin competitor
```

## Data Format Notes

### Expected Excel/CSV Format:
```csv
Keyword,Avg. monthly searches,Competition,Top of page bid (low range),Top of page bid (high range)
"ohare airport car service",720,Medium,$3.50,$8.20
"chicago limo",1300,High,$2.80,$7.50
"executive car service chicago",590,Medium,$4.10,$9.30
```

**Notes:**
- Excel (.xlsx) files are auto-detected and parsed
- CSV files work too
- Commas in numbers (1,300) are handled automatically
- Currency symbols are stripped

## Keyword Clustering

The importer automatically clusters keywords by intent:

### Cluster Categories:

1. **airport_ohare**
   - Keywords: "ohare airport limo", "ord car service", "ohare transportation"
   - Landing pages: chicagoairportblackcar.com → /ohare-airport-limo

2. **airport_midway**
   - Keywords: "midway airport limo", "mdw car service", "midway transportation"
   - Landing pages: chicagoairportblackcar.com → /midway-airport-limo

3. **airport_general**
   - Keywords: "chicago airport limo", "airport car service", "airport shuttle"
   - Landing pages: chicagoairportblackcar.com → / (home)

4. **hourly_chauffeur**
   - Keywords: "hourly chauffeur chicago", "black car by the hour", "executive car hourly"
   - Landing pages: chicagoexecutivecarservice.com → /hourly-chauffeur

5. **corporate_black_car**
   - Keywords: "corporate transportation", "executive black car", "business car service"
   - Landing pages: chicagoexecutivecarservice.com → /corporate-transportation

6. **sprinter_van**
   - Keywords: "sprinter van rental", "mercedes sprinter chicago", "group transportation"
   - Landing pages: chicagoairportblackcar.com → /fleet (sprinter section)

7. **party_bus**
   - Keywords: "party bus rental chicago", "party bus near me", "birthday party bus"
   - Landing pages: chicago-partybus.com → / (home)

8. **wedding_transport**
   - Keywords: "wedding transportation chicago", "wedding limo", "bridal party shuttle"
   - Landing pages: chicagoweddingtransportation.com → / (home)

9. **limo_service_generic**
   - Keywords: "limo service chicago", "limousine rental", "limo near me"
   - Landing pages: chicagoairportblackcar.com → / (covers all services)

### Clustering Logic:
- **Manual tagging:** Add "Intent" column with cluster name
- **Automatic detection:** Script uses keyword patterns to infer intent
  - Contains "ohare" or "ord" → airport_ohare
  - Contains "party bus" → party_bus
  - Contains "hourly" or "by the hour" → hourly_chauffeur
  - etc.

## What Happens After Import

The `scripts/metrics-import.mjs` script generates:

1. **`/packages/content/metrics/keyword_clusters.json`**
   ```json
   {
     "airport_ohare": {
       "keywords": ["ohare airport limo", "ord car service", ...],
       "total_volume": 5400,
       "avg_cpc": 6.50,
       "priority": "high"
     },
     "party_bus": {
       "keywords": ["party bus rental chicago", ...],
       "total_volume": 3200,
       "avg_cpc": 4.20,
       "priority": "high"
     }
   }
   ```

2. **`/reports/keyword-top100.md`**
   - Top 100 non-brand keywords
   - Sorted by profit proxy (volume * CPC * estimated conversion rate)
   - Labeled SCALE (profitable) or FIX (low ROI)

3. **`/packages/content/ads_landing_page_matrix.csv`**
   ```csv
   Cluster,Top Keywords,Recommended Site,Landing Page,H1 Template,Priority
   airport_ohare,"ohare limo, ord car service",airport,/ohare-airport-limo,"O'Hare Airport Limo Service Chicago",high
   party_bus,"party bus rental chicago",partybus,/,"Party Bus Rental Chicago - Book Now",high
   ```

## Sample Keyword Research Data

If you don't have real keyword data yet, use this starter list:

**`keyword-research_sample.csv`:**
```csv
Keyword,Avg. monthly searches,Competition,CPC,Intent
"ohare airport limo",720,Medium,6.50,transactional
"midway airport car service",390,Medium,5.80,transactional
"chicago black car service",1300,High,7.20,transactional
"executive car service chicago",590,Medium,8.10,transactional
"hourly chauffeur chicago",260,Low,9.50,transactional
"party bus rental chicago",1600,High,4.20,transactional
"chicago wedding transportation",880,Medium,5.50,transactional
"sprinter van rental chicago",320,Medium,6.80,transactional
"limo service near me",8100,High,3.50,transactional
"corporate car service chicago",450,Medium,9.20,transactional
"airport shuttle chicago",3600,High,2.10,transactional
"black car service ohare",580,Medium,6.90,transactional
```

Then run:
```bash
npm run metrics:import
```

## Keyword Research Best Practices

### Seed Keywords to Start:
- **Airport:** ohare airport limo, midway airport limo, chicago airport car service
- **Corporate:** executive car service, corporate transportation, hourly chauffeur
- **Events:** party bus rental, wedding transportation, prom limo
- **Vehicle Types:** black car service, sprinter van, luxury sedan
- **Geographic:** chicago limo, naperville car service, schaumburg transportation

### Filters to Apply:
- **Location:** Chicago, Illinois, or remove location filter for broader view
- **Competition:** Medium to High (indicates commercial intent)
- **Search Volume:** >100/month (lower can still work for long-tail)
- **CPC:** >$2.00 (indicates commercial value)

### Avoid:
- ❌ Non-commercial keywords ("how to drive a limo")
- ❌ Too broad ("transportation")
- ❌ Competitor brand names (unless you're bidding on them)
- ❌ Irrelevant locations (NYC, LA, etc.)

## Privacy & Security

⚠️ **IMPORTANT:** 
- Keyword research data has no PII, safe to commit sample data
- Real exports may include your Google Ads account info (redact if needed)
- Do NOT commit API keys if using programmatic keyword tools

---

Last updated: January 15, 2026
