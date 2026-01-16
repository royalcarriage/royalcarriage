#!/usr/bin/env node

/**
 * Data Freshness Checker
 * CLI tool to check data freshness and display alerts
 */

import { checkAllDataSources, formatStatus, getAlertSummary } from '../shared/data-freshness.ts';

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
  
  const statuses = await checkAllDataSources();
  const summary = getAlertSummary(statuses);
  
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
