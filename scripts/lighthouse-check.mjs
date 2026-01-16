#!/usr/bin/env node

/**
 * Lighthouse CI Integration
 * Runs Lighthouse performance audits on key pages
 * Checks: LCP, CLS, FID, Performance score
 * Fails if Performance < 70, LCP > 2.5s
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_DIR = path.join(__dirname, '../reports/lighthouse');

// Key pages to audit
const KEY_PAGES = [
  { name: 'Home', url: 'http://localhost:4321', site: 'main' },
  { name: 'Fleet', url: 'http://localhost:4321/fleet', site: 'main' },
  { name: 'Pricing', url: 'http://localhost:4321/pricing', site: 'main' },
  { name: 'Chicago Airport', url: 'http://localhost:4321/chicago-airport-limo', site: 'city' },
];

// Quality thresholds
const THRESHOLDS = {
  performance: 70,
  lcp: 2.5, // seconds
  cls: 0.1,
  fid: 100, // milliseconds
  accessibility: 90,
  bestPractices: 80,
  seo: 90,
};

/**
 * Run Lighthouse on a URL
 */
function runLighthouse(url, name) {
  return new Promise((resolve, reject) => {
    console.log(`   Running Lighthouse on ${name}...`);
    
    const args = [
      url,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json',
      '--output-path=stdout',
      '--chrome-flags="--headless --no-sandbox --disable-gpu"',
      '--quiet'
    ];
    
    const lighthouse = spawn('npx', ['lighthouse', ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    lighthouse.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    lighthouse.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Lighthouse failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        // Extract JSON from stdout (may have other output)
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          reject(new Error('Could not parse Lighthouse JSON output'));
          return;
        }
        
        const results = JSON.parse(jsonMatch[0]);
        resolve(results);
      } catch (error) {
        reject(new Error(`Failed to parse Lighthouse results: ${error.message}`));
      }
    });
    
    lighthouse.on('error', (error) => {
      reject(new Error(`Failed to spawn Lighthouse: ${error.message}`));
    });
  });
}

/**
 * Extract key metrics from Lighthouse results
 */
function extractMetrics(results) {
  const { categories, audits } = results;
  
  return {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    lcp: audits['largest-contentful-paint']?.numericValue / 1000, // ms to seconds
    cls: audits['cumulative-layout-shift']?.numericValue,
    fid: audits['max-potential-fid']?.numericValue, // milliseconds
    tbt: audits['total-blocking-time']?.numericValue, // milliseconds
    tti: audits['interactive']?.numericValue / 1000, // ms to seconds
    speedIndex: audits['speed-index']?.numericValue / 1000, // ms to seconds
  };
}

/**
 * Check if metrics meet thresholds
 */
function checkThresholds(metrics) {
  const failures = [];
  
  if (metrics.performance < THRESHOLDS.performance) {
    failures.push({
      metric: 'Performance',
      value: metrics.performance,
      threshold: THRESHOLDS.performance,
      severity: 'critical'
    });
  }
  
  if (metrics.lcp > THRESHOLDS.lcp) {
    failures.push({
      metric: 'LCP',
      value: `${metrics.lcp.toFixed(2)}s`,
      threshold: `${THRESHOLDS.lcp}s`,
      severity: 'critical'
    });
  }
  
  if (metrics.cls > THRESHOLDS.cls) {
    failures.push({
      metric: 'CLS',
      value: metrics.cls.toFixed(3),
      threshold: THRESHOLDS.cls,
      severity: 'high'
    });
  }
  
  if (metrics.fid > THRESHOLDS.fid) {
    failures.push({
      metric: 'FID',
      value: `${metrics.fid}ms`,
      threshold: `${THRESHOLDS.fid}ms`,
      severity: 'high'
    });
  }
  
  if (metrics.accessibility < THRESHOLDS.accessibility) {
    failures.push({
      metric: 'Accessibility',
      value: metrics.accessibility,
      threshold: THRESHOLDS.accessibility,
      severity: 'medium'
    });
  }
  
  if (metrics.seo < THRESHOLDS.seo) {
    failures.push({
      metric: 'SEO',
      value: metrics.seo,
      threshold: THRESHOLDS.seo,
      severity: 'medium'
    });
  }
  
  return failures;
}

/**
 * Store results in Firestore (if configured)
 */
async function storeInFirestore(results) {
  // TODO: Implement Firestore integration
  // Collection: lighthouse_reports
  // Document: { timestamp, url, metrics, passed }
  
  console.log('⚠️  Firestore integration not implemented - skipping cloud storage');
  return null;
}

/**
 * Main audit function
 */
async function audit(pageUrl = null) {
  console.log('🔦 Starting Lighthouse CI checks...\n');
  
  const pagesToAudit = pageUrl 
    ? KEY_PAGES.filter(p => p.url === pageUrl) 
    : KEY_PAGES;
  
  if (pagesToAudit.length === 0) {
    console.error(`❌ Page not found: ${pageUrl}`);
    process.exit(1);
  }
  
  const results = [];
  let hasFailures = false;
  
  for (const page of pagesToAudit) {
    console.log(`\n📄 Auditing: ${page.name} (${page.url})`);
    
    try {
      const lighthouseResults = await runLighthouse(page.url, page.name);
      const metrics = extractMetrics(lighthouseResults);
      const failures = checkThresholds(metrics);
      
      const pageResult = {
        name: page.name,
        url: page.url,
        site: page.site,
        metrics,
        failures,
        passed: failures.filter(f => f.severity === 'critical').length === 0,
        timestamp: new Date().toISOString()
      };
      
      results.push(pageResult);
      
      // Display metrics
      console.log(`   ✅ Performance: ${metrics.performance}`);
      console.log(`   ✅ Accessibility: ${metrics.accessibility}`);
      console.log(`   ✅ Best Practices: ${metrics.bestPractices}`);
      console.log(`   ✅ SEO: ${metrics.seo}`);
      console.log(`   📊 LCP: ${metrics.lcp.toFixed(2)}s`);
      console.log(`   📊 CLS: ${metrics.cls.toFixed(3)}`);
      console.log(`   📊 FID: ${metrics.fid}ms`);
      
      // Display failures
      if (failures.length > 0) {
        console.log(`\n   ⚠️  Issues detected:`);
        failures.forEach(f => {
          const icon = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟡' : '🟢';
          console.log(`   ${icon} ${f.metric}: ${f.value} (threshold: ${f.threshold})`);
        });
        
        if (failures.some(f => f.severity === 'critical')) {
          hasFailures = true;
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Failed to audit ${page.name}:`, error.message);
      results.push({
        name: page.name,
        url: page.url,
        site: page.site,
        error: error.message,
        passed: false,
        timestamp: new Date().toISOString()
      });
      hasFailures = true;
    }
  }
  
  // Save report
  await fs.mkdir(REPORT_DIR, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const reportFile = path.join(REPORT_DIR, `lighthouse-${timestamp}.json`);
  
  const report = {
    generatedAt: new Date().toISOString(),
    results,
    summary: {
      totalPages: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      criticalIssues: results.reduce((sum, r) => 
        sum + (r.failures?.filter(f => f.severity === 'critical').length || 0), 0)
    }
  };
  
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n💾 Report saved: ${reportFile}`);
  
  // Store in Firestore
  await storeInFirestore(report);
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Pages audited: ${report.summary.totalPages}`);
  console.log(`   Passed: ${report.summary.passed}`);
  console.log(`   Failed: ${report.summary.failed}`);
  console.log(`   Critical issues: ${report.summary.criticalIssues}`);
  
  if (hasFailures) {
    console.log('\n❌ Lighthouse CI failed - performance thresholds not met');
    process.exit(1);
  } else {
    console.log('\n✅ All pages meet performance thresholds!');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Lighthouse CI Integration

Usage: node lighthouse-check.mjs [options]

Options:
  --url <url>    Audit specific URL only
  --help, -h     Show this help message

Description:
  Runs Lighthouse audits on key pages and checks:
  - Performance score (threshold: ${THRESHOLDS.performance})
  - LCP - Largest Contentful Paint (threshold: ${THRESHOLDS.lcp}s)
  - CLS - Cumulative Layout Shift (threshold: ${THRESHOLDS.cls})
  - FID - First Input Delay (threshold: ${THRESHOLDS.fid}ms)
  - Accessibility score (threshold: ${THRESHOLDS.accessibility})
  - SEO score (threshold: ${THRESHOLDS.seo})

Exit Codes:
  0 - All pages pass thresholds
  1 - One or more pages fail critical thresholds

Note: Requires local dev server running (default: http://localhost:4321)
    `);
    return;
  }
  
  const urlIndex = args.indexOf('--url');
  const pageUrl = urlIndex !== -1 ? args[urlIndex + 1] : null;
  
  await audit(pageUrl);
}

main().catch(error => {
  console.error('❌ Lighthouse CI failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
