#!/usr/bin/env node

/**
 * Data Freshness Checker
 * CLI tool to check data freshness and display alerts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data sources configuration
const DATA_SOURCES = [
  {
    name: 'Moovs CSV',
    type: 'daily',
    path: 'data/moovs',
    description: 'Trip and revenue data from Moovs platform'
  },
  {
    name: 'Google Ads CSV',
    type: 'weekly',
    path: 'data/google-ads',
    description: 'Ad performance and spend data'
  },
  {
    name: 'GA4 Data',
    type: 'daily',
    path: 'packages/content/metrics',
    description: 'Google Analytics 4 engagement data'
  },
  {
    name: 'GSC Data',
    type: 'weekly',
    path: 'data/gsc',
    description: 'Google Search Console indexing and performance'
  },
  {
    name: 'SEO Bot Queue',
    type: 'daily',
    path: 'packages/content/seo-bot/queue',
    description: 'SEO content generation queue'
  }
];

function getThreshold(type) {
  return type === 'daily' ? 24 : 168; // 24 hours or 7 days
}

function getStatus(age, threshold) {
  if (age === null) return 'missing';
  if (age < threshold) return 'fresh';
  if (age < threshold * 2) return 'stale';
  return 'critical';
}

async function findMostRecentFile(dirPath) {
  try {
    const fullPath = path.join(__dirname, '..', dirPath);
    const files = await fs.readdir(fullPath);
    
    if (files.length === 0) return null;
    
    let mostRecent = null;
    
    for (const file of files) {
      try {
        const filePath = path.join(fullPath, file);
        const stats = await fs.stat(filePath);
        
        if (!mostRecent || stats.mtime > mostRecent) {
          mostRecent = stats.mtime;
        }
      } catch {
        continue;
      }
    }
    
    return mostRecent;
  } catch (error) {
    return null;
  }
}

async function checkDataSource(source) {
  const lastUpdated = await findMostRecentFile(source.path);
  const threshold = getThreshold(source.type);
  
  let age = null;
  if (lastUpdated) {
    age = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60); // Convert to hours
  }
  
  const status = getStatus(age, threshold);
  
  let message = '';
  if (status === 'missing') {
    message = `No data found in ${source.path}`;
  } else if (status === 'fresh') {
    message = `Updated ${Math.floor(age)} hours ago`;
  } else if (status === 'stale') {
    message = `Stale: ${Math.floor(age)} hours old (threshold: ${threshold}h)`;
  } else {
    message = `CRITICAL: ${Math.floor(age)} hours old (threshold: ${threshold}h)`;
  }
  
  return {
    source: source.name,
    lastUpdated,
    age: age || 0,
    status,
    threshold,
    message
  };
}

function formatStatus(status) {
  const icons = {
    fresh: '🟢',
    stale: '🟡',
    critical: '🔴',
    missing: '⚫'
  };
  
  return `${icons[status.status]} ${status.source}: ${status.message}`;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Data Freshness Checker

Usage: node check-data-freshness.mjs [options]

Options:
  --help, -h     Show this help message
  --json         Output as JSON

Description:
  Checks freshness of all data sources:
  - Moovs CSV (daily - should be < 24h old)
  - Google Ads CSV (weekly - should be < 7d old)
  - GA4 Data (daily - should be < 24h old)
  - GSC Data (weekly - should be < 7d old)
  - SEO Bot Queue (daily - should be < 24h old)

Status Indicators:
  🟢 Fresh - Updated within threshold
  🟡 Stale - Older than threshold but < 2x threshold
  🔴 Critical - Older than 2x threshold
  ⚫ Missing - No data found

Exit Codes:
  0 - All data fresh or stale (no critical)
  1 - One or more critical or missing data sources
    `);
    return;
  }
  
  console.log('🔍 Checking data freshness...\n');
  
  const statuses = [];
  for (const source of DATA_SOURCES) {
    const status = await checkDataSource(source);
    statuses.push(status);
  }
  
  // Calculate summary
  const summary = {
    fresh: statuses.filter(s => s.status === 'fresh').length,
    stale: statuses.filter(s => s.status === 'stale').length,
    critical: statuses.filter(s => s.status === 'critical').length,
    missing: statuses.filter(s => s.status === 'missing').length,
    alerts: statuses.filter(s => s.status === 'stale' || s.status === 'critical' || s.status === 'missing')
  };
  
  if (args.includes('--json')) {
    console.log(JSON.stringify({ statuses, summary }, null, 2));
    return;
  }
  
  // Display status for each source
  statuses.forEach(status => {
    console.log(formatStatus(status));
  });
  
  // Display summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`   🟢 Fresh: ${summary.fresh}`);
  console.log(`   🟡 Stale: ${summary.stale}`);
  console.log(`   🔴 Critical: ${summary.critical}`);
  console.log(`   ⚫ Missing: ${summary.missing}`);
  
  // Display alerts
  if (summary.alerts.length > 0) {
    console.log('\n⚠️  Alerts:\n');
    summary.alerts.forEach(alert => {
      console.log(`   ${formatStatus(alert)}`);
    });
  }
  
  // Exit code based on critical/missing
  if (summary.critical > 0 || summary.missing > 0) {
    console.log('\n❌ CRITICAL: Data freshness issues detected!');
    console.log('   Please update data sources immediately.\n');
    process.exit(1);
  } else if (summary.stale > 0) {
    console.log('\n⚠️  Warning: Some data sources are stale');
    console.log('   Consider updating soon.\n');
  } else {
    console.log('\n✅ All data sources are fresh!\n');
  }
}

main().catch(error => {
  console.error('❌ Error checking data freshness:', error.message);
  process.exit(1);
});
