#!/usr/bin/env node

/**
 * Cron Jobs Configuration
 * Defines scheduled automation tasks
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Job definitions
const JOBS = {
  daily: [
    {
      name: 'Check Data Freshness',
      script: 'check-data-freshness.mjs',
      description: 'Alert if data sources are stale'
    },
    {
      name: 'Import Moovs Data',
      script: 'metrics-import.mjs',
      description: 'Import latest Moovs CSV (if available)',
      disabled: true // Enable when API ready
    },
    {
      name: 'Import GA4 Data',
      description: 'Fetch latest GA4 engagement data',
      disabled: true // Enable when GA4 API ready
    },
    {
      name: 'Sync GSC Data',
      script: 'gsc-sync.mjs',
      description: 'Sync Google Search Console data',
      disabled: true // Enable when GSC API configured
    }
  ],
  
  weekly: [
    {
      name: 'Run SEO Proposer',
      script: 'seo-propose.mjs',
      args: ['--auto'],
      description: 'Auto-generate content proposals from revenue data'
    },
    {
      name: 'Site Crawler',
      script: 'site-crawler.mjs',
      description: 'Crawl sites for SEO issues'
    },
    {
      name: 'Lighthouse Checks',
      script: 'lighthouse-check.mjs',
      description: 'Run performance audits',
      disabled: true // Requires dev server
    },
    {
      name: 'Image Inventory',
      script: 'image-inventory.mjs',
      description: 'Check for missing/overused images'
    }
  ],
  
  biweekly: [
    {
      name: 'Review Proposals',
      description: 'Human reviews proposed content (manual step)',
      manual: true
    },
    {
      name: 'Publish Content',
      description: 'Publish 3-10 approved pages via PR (manual step)',
      manual: true
    },
    {
      name: 'Re-index Pages',
      description: 'Submit sitemap to GSC for re-indexing',
      manual: true
    }
  ],
  
  monthly: [
    {
      name: 'Prune Underperforming',
      description: 'Identify and remove low-value pages (manual step)',
      manual: true
    },
    {
      name: 'Merge Cannibalized',
      description: 'Merge duplicate/competing content (manual step)',
      manual: true
    },
    {
      name: 'Refresh Top Pages',
      description: 'Update high-value pages with fresh content (manual step)',
      manual: true
    }
  ]
};

/**
 * Run a single job
 */
function runJob(job) {
  return new Promise((resolve, reject) => {
    if (job.disabled) {
      console.log(`⏭️  Skipping: ${job.name} (disabled)`);
      resolve({ job: job.name, status: 'skipped', reason: 'disabled' });
      return;
    }
    
    if (job.manual) {
      console.log(`📋 Manual task: ${job.name}`);
      console.log(`   ${job.description}`);
      resolve({ job: job.name, status: 'manual' });
      return;
    }
    
    if (!job.script) {
      console.log(`⏭️  Skipping: ${job.name} (no script defined)`);
      resolve({ job: job.name, status: 'skipped', reason: 'no_script' });
      return;
    }
    
    console.log(`\n🚀 Running: ${job.name}`);
    console.log(`   ${job.description}`);
    
    const scriptPath = path.join(__dirname, job.script);
    const args = job.args || [];
    
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Completed: ${job.name}\n`);
        resolve({ job: job.name, status: 'success', exitCode: code });
      } else {
        console.log(`❌ Failed: ${job.name} (exit code: ${code})\n`);
        resolve({ job: job.name, status: 'failed', exitCode: code });
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Error running ${job.name}:`, error.message);
      reject(error);
    });
  });
}

/**
 * Run all jobs in a schedule
 */
async function runSchedule(schedule) {
  const jobs = JOBS[schedule];
  
  if (!jobs) {
    console.error(`❌ Unknown schedule: ${schedule}`);
    process.exit(1);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📅 Running ${schedule.toUpperCase()} schedule`);
  console.log(`   ${jobs.length} jobs scheduled`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const job of jobs) {
    try {
      const result = await runJob(job);
      results.push(result);
    } catch (error) {
      console.error(`Fatal error running ${job.name}:`, error);
      results.push({ job: job.name, status: 'error', error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Schedule Summary\n');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const manual = results.filter(r => r.status === 'manual').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📋 Manual: ${manual}`);
  console.log(`   ⚠️  Errors: ${errors}`);
  
  if (failed > 0 || errors > 0) {
    console.log('\n❌ Some jobs failed');
    console.log('\nFailed jobs:');
    results.filter(r => r.status === 'failed' || r.status === 'error').forEach(r => {
      console.log(`   - ${r.job}${r.error ? ': ' + r.error : ''}`);
    });
    process.exit(1);
  }
  
  console.log('\n✅ Schedule completed successfully!');
}

/**
 * List all schedules and jobs
 */
function listSchedules() {
  console.log('\n📅 Scheduled Jobs Configuration\n');
  
  Object.entries(JOBS).forEach(([schedule, jobs]) => {
    console.log(`\n${schedule.toUpperCase()} (${jobs.length} jobs):`);
    console.log('─'.repeat(60));
    
    jobs.forEach((job, idx) => {
      const icon = job.disabled ? '⏭️ ' : job.manual ? '📋' : '🔄';
      const status = job.disabled ? ' [DISABLED]' : job.manual ? ' [MANUAL]' : '';
      console.log(`\n${idx + 1}. ${icon} ${job.name}${status}`);
      console.log(`   ${job.description}`);
      if (job.script) {
        console.log(`   Script: ${job.script}`);
      }
    });
  });
  
  console.log('\n\nUsage:');
  console.log('  node cron-jobs.mjs daily     # Run daily jobs');
  console.log('  node cron-jobs.mjs weekly    # Run weekly jobs');
  console.log('  node cron-jobs.mjs biweekly  # Run bi-weekly jobs');
  console.log('  node cron-jobs.mjs monthly   # Run monthly jobs');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === '--list') {
    listSchedules();
    return;
  }
  
  const schedule = args[0];
  await runSchedule(schedule);
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
