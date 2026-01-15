#!/usr/bin/env node

/**
 * Royal Carriage Limousine - Metrics Import & ROI Analysis
 * 
 * This script imports and processes:
 * 1. Google Ads exports (keyword reports, campaigns, device/geo data)
 * 2. Moovs reservation exports (revenue, service mix, attribution)
 * 3. Keyword research data (search volume, competition, CPC)
 * 
 * Outputs:
 * - /reports/roi-report.md - Spend vs revenue analysis
 * - /reports/keyword-top100.md - Top 100 non-brand keywords with SCALE/FIX labels
 * - /packages/content/metrics/keyword_clusters.json - Intent-based keyword grouping
 * - /packages/content/metrics/moovs_service_mix.json - Service type distribution
 * - /packages/content/metrics/roi_summary.json - Machine-readable ROI data
 * - /packages/content/ads_landing_page_matrix.csv - Keyword → landing page recommendations
 * 
 * Resilience:
 * - Gracefully handles missing files (generates templates + warnings)
 * - Auto-detects CSV encoding (UTF-8, UTF-16 BOM, TSV)
 * - Skips header rows automatically
 * - Parses currency, percentages, commas
 * - Provides actionable error messages
 * 
 * Usage:
 *   node scripts/metrics-import.mjs
 *   npm run metrics:import
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Directories
const DATA_DIRS = {
  googleAds: path.join(ROOT, 'data', 'google-ads'),
  moovs: path.join(ROOT, 'data', 'moovs'),
  keywordResearch: path.join(ROOT, 'data', 'keyword-research'),
};

const OUTPUT_DIRS = {
  reports: path.join(ROOT, 'reports'),
  metrics: path.join(ROOT, 'packages', 'content', 'metrics'),
  content: path.join(ROOT, 'packages', 'content'),
};

// Ensure output directories exist
Object.values(OUTPUT_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse numeric value from string (handles currency, commas, percentages)
 */
function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (!value || value === '' || value === '--' || value === 'N/A') return 0;
  
  // Remove currency symbols, commas, spaces
  let cleaned = value.toString()
    .replace(/[$€£,\s]/g, '')
    .replace(/<[^>]*>/g, ''); // Remove HTML tags if any
  
  // Handle percentages
  if (cleaned.includes('%')) {
    cleaned = cleaned.replace('%', '');
    return parseFloat(cleaned) / 100;
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Detect CSV encoding and parse
 */
function parseCSV(filePath) {
  try {
    // Read file as buffer to detect encoding
    const buffer = fs.readFileSync(filePath);
    
    // Check for UTF-16 BOM
    let content;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      // UTF-16 LE BOM
      content = buffer.toString('utf16le');
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      // UTF-16 BE BOM
      content = buffer.toString('utf16le'); // Most systems use LE
    } else {
      content = buffer.toString('utf8');
    }
    
    // Detect delimiter (tab or comma)
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Check first few lines for tabs
    const firstLines = lines.slice(0, 5).join('\n');
    const tabCount = (firstLines.match(/\t/g) || []).length;
    const commaCount = (firstLines.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    // Parse lines
    const parsed = lines.map(line => line.split(delimiter).map(v => v.trim()));
    
    // Find header row (first row with non-numeric data)
    let headerIndex = 0;
    for (let i = 0; i < Math.min(5, parsed.length); i++) {
      const row = parsed[i];
      const hasText = row.some(cell => cell && isNaN(parseNumber(cell)));
      if (hasText) {
        headerIndex = i;
        break;
      }
    }
    
    const headers = parsed[headerIndex].map(h => h.replace(/"/g, '').trim());
    const dataRows = parsed.slice(headerIndex + 1).filter(row => {
      // Filter out empty rows and non-data rows
      return row.length > 1 && row.some(cell => cell && cell !== '');
    });
    
    return { headers, rows: dataRows };
    
  } catch (error) {
    console.error(`❌ Error parsing CSV ${path.basename(filePath)}:`, error.message);
    return { headers: [], rows: [] };
  }
}

/**
 * Load profit model
 */
function loadProfitModel() {
  const profitModelPath = path.join(OUTPUT_DIRS.content, 'profit_model.json');
  try {
    return JSON.parse(fs.readFileSync(profitModelPath, 'utf8'));
  } catch (error) {
    console.warn('⚠️  Could not load profit_model.json, using defaults');
    return {
      service_margins: {
        airport_transfer: { margin: 0.28, driver_payout_pct: 0.52, tax_pct: 0.10 },
        corporate_hourly: { margin: 0.30, driver_payout_pct: 0.50, tax_pct: 0.10 },
        wedding_event: { margin: 0.33, driver_payout_pct: 0.47, tax_pct: 0.10 },
        party_bus: { margin: 0.35, driver_payout_pct: 0.45, tax_pct: 0.10 },
      },
      default_assumptions: {
        driver_payout_rate: 0.55,
        tax_rate: 0.10,
      },
      roas_thresholds: {
        excellent: 5.0,
        good: 3.0,
        acceptable: 2.0,
        break_even: 1.0,
      }
    };
  }
}

// ============================================================================
// GOOGLE ADS IMPORT
// ============================================================================

function importGoogleAds() {
  console.log('\n📊 Importing Google Ads data...');
  
  const files = fs.readdirSync(DATA_DIRS.googleAds).filter(f => 
    f.endsWith('.csv') && !f.startsWith('.') && f !== 'README.md'
  );
  
  if (files.length === 0) {
    console.log('⚠️  No Google Ads CSV files found in data/google-ads/');
    console.log('   See data/google-ads/README.md for export instructions');
    return {
      keywords: [],
      campaigns: [],
      totalSpend: 0,
      totalConversions: 0,
      totalConversionValue: 0,
      dataQuality: 'missing',
    };
  }
  
  console.log(`   Found ${files.length} file(s): ${files.join(', ')}`);
  
  const allKeywords = [];
  const allCampaigns = [];
  let totalSpend = 0;
  let totalConversions = 0;
  let totalConversionValue = 0;
  
  // Process each CSV file
  for (const file of files) {
    const filePath = path.join(DATA_DIRS.googleAds, file);
    console.log(`   Processing: ${file}`);
    
    const { headers, rows } = parseCSV(filePath);
    
    if (headers.length === 0) {
      console.log(`   ⚠️  Could not parse ${file} (empty or invalid format)`);
      continue;
    }
    
    // Detect file type by headers
    const isKeywordReport = headers.some(h => 
      h.toLowerCase().includes('search term') || 
      h.toLowerCase().includes('keyword')
    );
    
    const isCampaignReport = headers.some(h => 
      h.toLowerCase().includes('campaign') && !h.toLowerCase().includes('search')
    );
    
    if (isKeywordReport) {
      // Parse keyword data
      for (const row of rows) {
        const keyword = extractValue(row, headers, ['search term', 'keyword']);
        const matchType = extractValue(row, headers, ['match type']);
        const campaign = extractValue(row, headers, ['campaign']);
        const cost = parseNumber(extractValue(row, headers, ['cost']));
        const clicks = parseNumber(extractValue(row, headers, ['clicks']));
        const impressions = parseNumber(extractValue(row, headers, ['impressions', 'impr.']));
        const conversions = parseNumber(extractValue(row, headers, ['conversions', 'conv.']));
        const convValue = parseNumber(extractValue(row, headers, ['conv. value', 'conversion value', 'total conv. value']));
        
        if (keyword && (cost > 0 || clicks > 0)) {
          allKeywords.push({
            keyword,
            matchType,
            campaign,
            cost,
            clicks,
            impressions,
            conversions,
            conversionValue: convValue,
            ctr: impressions > 0 ? clicks / impressions : 0,
            cpc: clicks > 0 ? cost / clicks : 0,
            cpa: conversions > 0 ? cost / conversions : 0,
            roas: convValue > 0 ? convValue / cost : 0,
          });
          
          totalSpend += cost;
          totalConversions += conversions;
          totalConversionValue += convValue;
        }
      }
      
      console.log(`   ✓ Imported ${allKeywords.length} keywords from ${file}`);
      
    } else if (isCampaignReport) {
      // Parse campaign data
      for (const row of rows) {
        const campaign = extractValue(row, headers, ['campaign']);
        const status = extractValue(row, headers, ['status', 'campaign status']);
        const budget = parseNumber(extractValue(row, headers, ['budget']));
        const cost = parseNumber(extractValue(row, headers, ['cost']));
        const conversions = parseNumber(extractValue(row, headers, ['conversions', 'conv.']));
        const convValue = parseNumber(extractValue(row, headers, ['conv. value', 'conversion value']));
        
        if (campaign) {
          allCampaigns.push({
            campaign,
            status,
            budget,
            cost,
            conversions,
            conversionValue: convValue,
          });
        }
      }
      
      console.log(`   ✓ Imported ${allCampaigns.length} campaigns from ${file}`);
    } else {
      console.log(`   ⚠️  Could not detect report type for ${file} (unsupported format)`);
    }
  }
  
  return {
    keywords: allKeywords,
    campaigns: allCampaigns,
    totalSpend,
    totalConversions,
    totalConversionValue,
    dataQuality: allKeywords.length > 0 ? 'good' : 'partial',
  };
}

/**
 * Extract value from row by trying multiple possible column names
 */
function extractValue(row, headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
    if (index !== -1 && row[index]) {
      return row[index];
    }
  }
  return '';
}

// ============================================================================
// MOOVS IMPORT
// ============================================================================

function importMoovs() {
  console.log('\n🚗 Importing Moovs reservation data...');
  
  const files = fs.readdirSync(DATA_DIRS.moovs).filter(f => 
    f.endsWith('.csv') && !f.startsWith('.') && f !== 'README.md'
  );
  
  if (files.length === 0) {
    console.log('⚠️  No Moovs CSV files found in data/moovs/');
    console.log('   See data/moovs/README.md for export instructions');
    return {
      reservations: [],
      totalRevenue: 0,
      googleAdsRevenue: 0,
      serviceMix: {},
      dataQuality: 'missing',
    };
  }
  
  console.log(`   Found ${files.length} file(s): ${files.join(', ')}`);
  
  const allReservations = [];
  let totalRevenue = 0;
  let googleAdsRevenue = 0;
  const serviceMix = {};
  
  for (const file of files) {
    const filePath = path.join(DATA_DIRS.moovs, file);
    console.log(`   Processing: ${file}`);
    
    const { headers, rows } = parseCSV(filePath);
    
    if (headers.length === 0) {
      console.log(`   ⚠️  Could not parse ${file} (empty or invalid format)`);
      continue;
    }
    
    for (const row of rows) {
      const id = extractValue(row, headers, ['id', 'reservation id']);
      const date = extractValue(row, headers, ['date', 'pickup date', 'service date']);
      const status = extractValue(row, headers, ['status']);
      const serviceType = extractValue(row, headers, ['service type', 'service', 'type']);
      const vehicleType = extractValue(row, headers, ['vehicle type', 'vehicle']);
      const revenue = parseNumber(extractValue(row, headers, ['total price', 'revenue', 'amount', 'price']));
      const driverPayout = parseNumber(extractValue(row, headers, ['driver payout', 'driver pay']));
      const tax = parseNumber(extractValue(row, headers, ['tax', 'tax amount']));
      const reqSource = extractValue(row, headers, ['req source', 'source', 'request source', 'utm_source']);
      const origin = extractValue(row, headers, ['origin', 'pickup', 'pickup location']);
      const destination = extractValue(row, headers, ['destination', 'dropoff', 'dropoff location']);
      
      if (status && status.toUpperCase() === 'DONE' && revenue > 0) {
        const isGoogleAds = reqSource.toLowerCase().includes('google') || 
                            reqSource.toLowerCase().includes('cpc') ||
                            reqSource.toLowerCase().includes('ads');
        
        allReservations.push({
          id,
          date,
          status,
          serviceType: serviceType || 'Unknown',
          vehicleType: vehicleType || 'Unknown',
          revenue,
          driverPayout,
          tax,
          isGoogleAds,
          origin,
          destination,
        });
        
        totalRevenue += revenue;
        if (isGoogleAds) {
          googleAdsRevenue += revenue;
        }
        
        // Service mix tracking
        const service = serviceType || 'Unknown';
        serviceMix[service] = (serviceMix[service] || 0) + 1;
      }
    }
  }
  
  console.log(`   ✓ Imported ${allReservations.length} completed reservations`);
  console.log(`   ✓ Total revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   ✓ Google Ads attributed revenue: $${googleAdsRevenue.toFixed(2)}`);
  
  return {
    reservations: allReservations,
    totalRevenue,
    googleAdsRevenue,
    serviceMix,
    dataQuality: allReservations.length > 0 ? 'good' : 'missing',
  };
}

// ============================================================================
// KEYWORD RESEARCH IMPORT
// ============================================================================

function importKeywordResearch() {
  console.log('\n🔍 Importing keyword research data...');
  
  const files = fs.readdirSync(DATA_DIRS.keywordResearch).filter(f => 
    (f.endsWith('.csv') || f.endsWith('.xlsx')) && !f.startsWith('.') && f !== 'README.md'
  );
  
  if (files.length === 0) {
    console.log('⚠️  No keyword research files found in data/keyword-research/');
    console.log('   See data/keyword-research/README.md for export instructions');
    return {
      keywords: [],
      dataQuality: 'missing',
    };
  }
  
  console.log(`   Found ${files.length} file(s): ${files.join(', ')}`);
  
  const allKeywords = [];
  
  for (const file of files) {
    const filePath = path.join(DATA_DIRS.keywordResearch, file);
    
    // For now, only handle CSV files
    // TODO: Add XLSX parsing with xlsx library if needed
    if (!file.endsWith('.csv')) {
      console.log(`   ⚠️  Skipping ${file} (XLSX parsing not implemented yet)`);
      continue;
    }
    
    console.log(`   Processing: ${file}`);
    
    const { headers, rows } = parseCSV(filePath);
    
    if (headers.length === 0) {
      console.log(`   ⚠️  Could not parse ${file} (empty or invalid format)`);
      continue;
    }
    
    for (const row of rows) {
      const keyword = extractValue(row, headers, ['keyword', 'search term']);
      const volume = parseNumber(extractValue(row, headers, ['search volume', 'avg. monthly searches', 'volume']));
      const competition = extractValue(row, headers, ['competition', 'keyword difficulty']);
      const cpc = parseNumber(extractValue(row, headers, ['cpc', 'suggested bid', 'top of page bid']));
      const intent = extractValue(row, headers, ['intent', 'category']);
      
      if (keyword && volume > 0) {
        allKeywords.push({
          keyword: keyword.toLowerCase().replace(/"/g, ''),
          volume,
          competition,
          cpc: cpc || 0,
          intent: intent || inferIntent(keyword),
        });
      }
    }
  }
  
  console.log(`   ✓ Imported ${allKeywords.length} keywords`);
  
  return {
    keywords: allKeywords,
    dataQuality: allKeywords.length > 0 ? 'good' : 'missing',
  };
}

/**
 * Infer intent from keyword text
 */
function inferIntent(keyword) {
  const kw = keyword.toLowerCase();
  
  if (kw.includes('ohare') || kw.includes('ord') || kw.includes('o\'hare')) {
    return 'airport_ohare';
  }
  if (kw.includes('midway') || kw.includes('mdw')) {
    return 'airport_midway';
  }
  if (kw.includes('airport') && !kw.includes('ohare') && !kw.includes('midway')) {
    return 'airport_general';
  }
  if (kw.includes('hourly') || kw.includes('by the hour')) {
    return 'hourly_chauffeur';
  }
  if (kw.includes('corporate') || kw.includes('executive') || kw.includes('business')) {
    return 'corporate_black_car';
  }
  if (kw.includes('sprinter') || kw.includes('van')) {
    return 'sprinter_van';
  }
  if (kw.includes('party bus')) {
    return 'party_bus';
  }
  if (kw.includes('wedding') || kw.includes('bridal')) {
    return 'wedding_transport';
  }
  
  return 'limo_service_generic';
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Royal Carriage Limousine - Metrics Import & ROI Analysis     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Load profit model
  const profitModel = loadProfitModel();
  
  // Import all data sources
  const googleAdsData = importGoogleAds();
  const moovsData = importMoovs();
  const keywordData = importKeywordResearch();
  
  console.log('\n📈 Generating outputs...');
  
  // Generate keyword clusters
  generateKeywordClusters(keywordData, googleAdsData, profitModel);
  
  // Generate service mix report
  generateServiceMix(moovsData, profitModel);
  
  // Generate ROI report
  generateROIReport(googleAdsData, moovsData, profitModel);
  
  // Generate top 100 keywords
  generateTop100Keywords(googleAdsData, keywordData, profitModel);
  
  // Generate landing page matrix
  generateLandingPageMatrix(keywordData, googleAdsData);
  
  // Generate summary JSON
  generateROISummary(googleAdsData, moovsData, profitModel);
  
  console.log('\n✅ Metrics import complete!');
  console.log('\n📊 Generated files:');
  console.log('   - reports/roi-report.md');
  console.log('   - reports/keyword-top100.md');
  console.log('   - packages/content/metrics/keyword_clusters.json');
  console.log('   - packages/content/metrics/moovs_service_mix.json');
  console.log('   - packages/content/metrics/roi_summary.json');
  console.log('   - packages/content/ads_landing_page_matrix.csv');
  console.log('');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// ============================================================================
// OUTPUT GENERATORS (to be continued in next section)
// ============================================================================

function generateKeywordClusters(keywordData, googleAdsData, profitModel) {
  // TODO: Implement clustering logic
  console.log('   ✓ Generated keyword_clusters.json (placeholder)');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIRS.metrics, 'keyword_clusters.json'),
    JSON.stringify({ message: 'Clustering logic to be implemented' }, null, 2)
  );
}

function generateServiceMix(moovsData, profitModel) {
  // TODO: Implement service mix analysis
  console.log('   ✓ Generated moovs_service_mix.json (placeholder)');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIRS.metrics, 'moovs_service_mix.json'),
    JSON.stringify({ serviceMix: moovsData.serviceMix }, null, 2)
  );
}

function generateROIReport(googleAdsData, moovsData, profitModel) {
  // TODO: Implement ROI report markdown
  console.log('   ✓ Generated roi-report.md (placeholder)');
  
  const report = `# ROI Report

**Generated:** ${new Date().toISOString()}

## Summary
- Total Ad Spend: $${googleAdsData.totalSpend.toFixed(2)}
- Total Revenue: $${moovsData.totalRevenue.toFixed(2)}
- Google Ads Revenue: $${moovsData.googleAdsRevenue.toFixed(2)}

_Full implementation coming next..._
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIRS.reports, 'roi-report.md'), report);
}

function generateTop100Keywords(googleAdsData, keywordData, profitModel) {
  console.log('   ✓ Generated keyword-top100.md (placeholder)');
  
  const report = `# Top 100 Keywords

_Implementation coming next..._
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIRS.reports, 'keyword-top100.md'), report);
}

function generateLandingPageMatrix(keywordData, googleAdsData) {
  console.log('   ✓ Generated ads_landing_page_matrix.csv (placeholder)');
  
  const csv = `Cluster,Top Keywords,Recommended Site,Landing Page,H1 Template,Priority
airport_ohare,"ohare limo",airport,/ohare-airport-limo,"O'Hare Airport Limo",high
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIRS.content, 'ads_landing_page_matrix.csv'), csv);
}

function generateROISummary(googleAdsData, moovsData, profitModel) {
  console.log('   ✓ Generated roi_summary.json');
  
  const summary = {
    generated: new Date().toISOString(),
    googleAds: {
      totalSpend: googleAdsData.totalSpend,
      totalConversions: googleAdsData.totalConversions,
      totalConversionValue: googleAdsData.totalConversionValue,
    },
    moovs: {
      totalRevenue: moovsData.totalRevenue,
      googleAdsRevenue: moovsData.googleAdsRevenue,
      reservationCount: moovsData.reservations.length,
    },
    roas: moovsData.googleAdsRevenue > 0 ? moovsData.googleAdsRevenue / googleAdsData.totalSpend : 0,
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIRS.metrics, 'roi_summary.json'),
    JSON.stringify(summary, null, 2)
  );
}
