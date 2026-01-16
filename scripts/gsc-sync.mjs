#!/usr/bin/env node

/**
 * Google Search Console Sync
 * Fetches indexed pages, crawl errors, canonical issues from GSC API
 * Stores results in Firestore and local JSON snapshots
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GSC_DATA_DIR = path.join(__dirname, '../data/gsc');
const REPORT_FILE = path.join(__dirname, '../reports/gsc-report.json');

/**
 * Mock GSC API client - Replace with actual Google Search Console API
 * See: https://developers.google.com/webmaster-tools/search-console-api-original
 */
async function fetchGSCData() {
  // TODO: Implement actual GSC API calls
  // Requires: google-auth-library, googleapis
  // Setup: Service account with GSC API access
  
  console.log('⚠️  Using mock GSC data - implement actual API integration');
  
  return {
    indexedPages: [],
    crawlErrors: [],
    canonicalIssues: [],
    impressionData: [],
    sitemapStatus: [],
  };
}

/**
 * Analyze GSC data for critical issues
 */
function analyzeIssues(currentData, previousData = null) {
  const flags = [];
  
  // Flag deindexed pages
  if (previousData && previousData.indexedPages) {
    const currentUrls = new Set(currentData.indexedPages.map(p => p.url));
    const deindexed = previousData.indexedPages.filter(p => !currentUrls.has(p.url));
    
    if (deindexed.length > 0) {
      flags.push({
        type: 'deindexed',
        severity: 'critical',
        count: deindexed.length,
        pages: deindexed.slice(0, 10).map(p => p.url),
        message: `${deindexed.length} pages deindexed since last sync`
      });
    }
  }
  
  // Flag impression drops (>50% decrease)
  if (previousData && previousData.impressionData) {
    const drops = currentData.impressionData.filter(current => {
      const previous = previousData.impressionData.find(p => p.url === current.url);
      if (!previous) return false;
      return (previous.impressions - current.impressions) / previous.impressions > 0.5;
    });
    
    if (drops.length > 0) {
      flags.push({
        type: 'impression_drop',
        severity: 'high',
        count: drops.length,
        pages: drops.slice(0, 10).map(p => ({ url: p.url, drop: p.impressions })),
        message: `${drops.length} pages with significant impression drops (>50%)`
      });
    }
  }
  
  // Flag cannibalization (multiple pages ranking for same keyword)
  const keywordPages = new Map();
  currentData.impressionData.forEach(page => {
    if (page.topKeyword) {
      if (!keywordPages.has(page.topKeyword)) {
        keywordPages.set(page.topKeyword, []);
      }
      keywordPages.get(page.topKeyword).push(page.url);
    }
  });
  
  const cannibalized = Array.from(keywordPages.entries())
    .filter(([_, urls]) => urls.length > 1)
    .map(([keyword, urls]) => ({ keyword, urls }));
  
  if (cannibalized.length > 0) {
    flags.push({
      type: 'cannibalization',
      severity: 'medium',
      count: cannibalized.length,
      keywords: cannibalized.slice(0, 10),
      message: `${cannibalized.length} keywords with multiple ranking pages`
    });
  }
  
  // Flag crawl errors
  if (currentData.crawlErrors.length > 0) {
    flags.push({
      type: 'crawl_errors',
      severity: 'high',
      count: currentData.crawlErrors.length,
      errors: currentData.crawlErrors.slice(0, 10),
      message: `${currentData.crawlErrors.length} crawl errors detected`
    });
  }
  
  // Flag canonical issues
  if (currentData.canonicalIssues.length > 0) {
    flags.push({
      type: 'canonical_issues',
      severity: 'medium',
      count: currentData.canonicalIssues.length,
      issues: currentData.canonicalIssues.slice(0, 10),
      message: `${currentData.canonicalIssues.length} canonical tag issues`
    });
  }
  
  return flags;
}

/**
 * Save data to local filesystem
 */
async function saveLocalSnapshot(data, flags) {
  // Ensure directories exist
  await fs.mkdir(GSC_DATA_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_FILE), { recursive: true });
  
  // Save daily snapshot
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const snapshotFile = path.join(GSC_DATA_DIR, `gsc-${timestamp}.json`);
  
  await fs.writeFile(snapshotFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Saved snapshot: ${snapshotFile}`);
  
  // Save latest report with flags
  const report = {
    generatedAt: new Date().toISOString(),
    timestamp,
    data,
    flags,
    summary: {
      totalIndexedPages: data.indexedPages.length,
      totalCrawlErrors: data.crawlErrors.length,
      totalCanonicalIssues: data.canonicalIssues.length,
      totalFlags: flags.length,
      criticalFlags: flags.filter(f => f.severity === 'critical').length,
      highFlags: flags.filter(f => f.severity === 'high').length
    }
  };
  
  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📊 Saved report: ${REPORT_FILE}`);
  
  return report;
}

/**
 * Store data in Firestore (if configured)
 */
async function storeInFirestore(data, flags) {
  // TODO: Implement Firestore integration
  // Requires: firebase-admin initialized
  // Collection: gsc_reports
  // Document: { timestamp, data, flags }
  
  console.log('⚠️  Firestore integration not implemented - skipping cloud storage');
  return null;
}

/**
 * Load previous snapshot for comparison
 */
async function loadPreviousSnapshot() {
  try {
    const files = await fs.readdir(GSC_DATA_DIR);
    const jsonFiles = files.filter(f => f.startsWith('gsc-') && f.endsWith('.json')).sort().reverse();
    
    if (jsonFiles.length > 1) {
      // Get second most recent (most recent is current)
      const previousFile = path.join(GSC_DATA_DIR, jsonFiles[1]);
      const content = await fs.readFile(previousFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('ℹ️  No previous snapshot found for comparison');
  }
  return null;
}

/**
 * Main sync function
 */
async function sync() {
  console.log('🔄 Starting GSC sync...\n');
  
  try {
    // Fetch data from GSC
    console.log('📡 Fetching data from Google Search Console...');
    const data = await fetchGSCData();
    console.log(`✅ Fetched ${data.indexedPages.length} indexed pages`);
    console.log(`✅ Fetched ${data.crawlErrors.length} crawl errors`);
    console.log(`✅ Fetched ${data.canonicalIssues.length} canonical issues\n`);
    
    // Load previous data for comparison
    console.log('📂 Loading previous snapshot...');
    const previousData = await loadPreviousSnapshot();
    
    // Analyze for issues
    console.log('🔍 Analyzing for issues...');
    const flags = analyzeIssues(data, previousData);
    console.log(`🚩 Found ${flags.length} flags\n`);
    
    // Display flags
    if (flags.length > 0) {
      console.log('⚠️  Issues detected:\n');
      flags.forEach(flag => {
        const icon = flag.severity === 'critical' ? '🔴' : flag.severity === 'high' ? '🟡' : '🟢';
        console.log(`${icon} ${flag.message} [${flag.severity}]`);
      });
      console.log('');
    }
    
    // Save data locally
    const report = await saveLocalSnapshot(data, flags);
    
    // Store in Firestore
    await storeInFirestore(data, flags);
    
    console.log('\n✅ GSC sync completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Indexed pages: ${report.summary.totalIndexedPages}`);
    console.log(`   Crawl errors: ${report.summary.totalCrawlErrors}`);
    console.log(`   Canonical issues: ${report.summary.totalCanonicalIssues}`);
    console.log(`   Flags raised: ${report.summary.totalFlags} (${report.summary.criticalFlags} critical, ${report.summary.highFlags} high)`);
    
    // Exit with error code if critical issues found
    if (report.summary.criticalFlags > 0) {
      console.log('\n❌ Critical issues detected! Please review immediately.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ GSC sync failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Google Search Console Sync Tool

Usage: node gsc-sync.mjs [options]

Options:
  --help, -h     Show this help message

Description:
  Fetches data from Google Search Console API and:
  - Saves daily snapshots to /data/gsc/
  - Detects deindexed pages, impression drops, cannibalization
  - Stores results in Firestore (gsc_reports collection)
  - Generates report at /reports/gsc-report.json

Exit Codes:
  0 - Success
  1 - Critical issues detected or sync failed

Setup Required:
  1. Enable GSC API in Google Cloud Console
  2. Create service account with GSC permissions
  3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
  4. Verify site ownership in GSC
    `);
    return;
  }
  
  await sync();
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
