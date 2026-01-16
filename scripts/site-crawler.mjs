#!/usr/bin/env node

/**
 * Internal Site Crawler
 * Crawls all site pages for SEO issues:
 * - Title/meta duplicates
 * - Missing H1
 * - Broken internal links
 * - Orphan pages (no inlinks)
 * - Thin pages (<500 words)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_FILE = path.join(__dirname, '../reports/crawl-report.json');
const PREV_REPORT_FILE = path.join(__dirname, '../reports/crawl-report-prev.json');

// Site roots to crawl
const SITES = [
  { name: 'airport', distPath: path.join(__dirname, '../apps/airport/dist') },
  { name: 'corporate', distPath: path.join(__dirname, '../apps/corporate/dist') },
  { name: 'wedding', distPath: path.join(__dirname, '../apps/wedding/dist') },
  { name: 'partybus', distPath: path.join(__dirname, '../apps/partybus/dist') },
];

/**
 * Find all HTML files in a directory
 */
async function findHtmlFiles(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findHtmlFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Extract text content from HTML (simple regex-based)
 */
function extractTextContent(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Parse HTML page for SEO data
 */
async function parsePage(filePath, siteRoot) {
  const html = await fs.readFile(filePath, 'utf-8');
  
  // Extract metadata
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;
  
  // Extract H1
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;
  const h1Text = h1Matches ? h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()) : [];
  
  // Extract internal links
  const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']*)["']/gi);
  const links = [];
  for (const match of linkMatches) {
    const href = match[1];
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      links.push(href);
    }
  }
  
  // Count words
  const textContent = extractTextContent(html);
  const wordCount = countWords(textContent);
  
  // Generate URL from file path
  const relativePath = path.relative(siteRoot, filePath);
  const url = '/' + relativePath.replace(/index\.html$/, '').replace(/\.html$/, '');
  
  return {
    url,
    filePath: path.relative(__dirname, filePath),
    title,
    metaDescription,
    h1Count,
    h1Text,
    wordCount,
    links,
  };
}

/**
 * Detect issues across all pages
 */
function detectIssues(pages) {
  const issues = {
    duplicateTitles: [],
    duplicateMeta: [],
    missingH1: [],
    multipleH1: [],
    brokenLinks: [],
    orphanPages: [],
    thinPages: [],
  };
  
  // Group by title and meta
  const titleMap = new Map();
  const metaMap = new Map();
  
  pages.forEach(page => {
    if (page.title) {
      if (!titleMap.has(page.title)) {
        titleMap.set(page.title, []);
      }
      titleMap.get(page.title).push(page.url);
    }
    
    if (page.metaDescription) {
      if (!metaMap.has(page.metaDescription)) {
        metaMap.set(page.metaDescription, []);
      }
      metaMap.get(page.metaDescription).push(page.url);
    }
  });
  
  // Find duplicates
  titleMap.forEach((urls, title) => {
    if (urls.length > 1) {
      issues.duplicateTitles.push({ title, urls });
    }
  });
  
  metaMap.forEach((urls, meta) => {
    if (urls.length > 1) {
      issues.duplicateMeta.push({ meta: meta.substring(0, 100), urls });
    }
  });
  
  // Check H1
  pages.forEach(page => {
    if (page.h1Count === 0) {
      issues.missingH1.push(page.url);
    } else if (page.h1Count > 1) {
      issues.multipleH1.push({ url: page.url, count: page.h1Count });
    }
  });
  
  // Check thin content
  pages.forEach(page => {
    if (page.wordCount < 500) {
      issues.thinPages.push({ url: page.url, wordCount: page.wordCount });
    }
  });
  
  // Build link graph
  const inboundLinks = new Map();
  const allUrls = new Set(pages.map(p => p.url));
  
  pages.forEach(page => {
    page.links.forEach(link => {
      // Normalize link
      const normalizedLink = link.replace(/\/$/, '').replace(/\/index$/, '');
      
      if (!inboundLinks.has(normalizedLink)) {
        inboundLinks.set(normalizedLink, []);
      }
      inboundLinks.get(normalizedLink).push(page.url);
    });
  });
  
  // Find orphan pages (no inbound links except homepage)
  pages.forEach(page => {
    const normalizedUrl = page.url.replace(/\/$/, '').replace(/\/index$/, '');
    if (normalizedUrl !== '' && normalizedUrl !== '/') {
      const inbound = inboundLinks.get(normalizedUrl) || [];
      if (inbound.length === 0) {
        issues.orphanPages.push(page.url);
      }
    }
  });
  
  // Find broken internal links
  pages.forEach(page => {
    page.links.forEach(link => {
      const normalizedLink = link.replace(/\/$/, '').replace(/\/index$/, '');
      const exists = pages.some(p => {
        const normalizedPageUrl = p.url.replace(/\/$/, '').replace(/\/index$/, '');
        return normalizedPageUrl === normalizedLink;
      });
      
      if (!exists) {
        issues.brokenLinks.push({ from: page.url, to: link });
      }
    });
  });
  
  return issues;
}

/**
 * Diff with previous crawl
 */
async function loadPreviousCrawl() {
  try {
    const content = await fs.readFile(REPORT_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function diffCrawls(current, previous) {
  if (!previous) {
    return { new: true, changes: [] };
  }
  
  const changes = [];
  
  // Compare issue counts
  const issueTypes = [
    'duplicateTitles',
    'duplicateMeta',
    'missingH1',
    'multipleH1',
    'brokenLinks',
    'orphanPages',
    'thinPages'
  ];
  
  issueTypes.forEach(type => {
    const currentCount = current.issues[type].length;
    const previousCount = previous.issues[type].length;
    const delta = currentCount - previousCount;
    
    if (delta !== 0) {
      changes.push({
        type,
        current: currentCount,
        previous: previousCount,
        delta,
        trend: delta > 0 ? 'worse' : 'better'
      });
    }
  });
  
  return { new: false, changes };
}

/**
 * Main crawl function
 */
async function crawl() {
  console.log('🕷️  Starting site crawl...\n');
  
  const allPages = [];
  
  // Crawl each site
  for (const site of SITES) {
    console.log(`📂 Crawling ${site.name}...`);
    
    const htmlFiles = await findHtmlFiles(site.distPath);
    console.log(`   Found ${htmlFiles.length} HTML files`);
    
    for (const file of htmlFiles) {
      try {
        const pageData = await parsePage(file, site.distPath);
        pageData.site = site.name;
        allPages.push(pageData);
      } catch (error) {
        console.warn(`   ⚠️  Error parsing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ Crawled ${allPages.length} total pages\n`);
  
  // Detect issues
  console.log('🔍 Analyzing for issues...');
  const issues = detectIssues(allPages);
  
  // Load previous crawl
  const previousCrawl = await loadPreviousCrawl();
  
  // Save current as previous
  if (previousCrawl) {
    await fs.mkdir(path.dirname(PREV_REPORT_FILE), { recursive: true });
    await fs.writeFile(PREV_REPORT_FILE, JSON.stringify(previousCrawl, null, 2), 'utf-8');
  }
  
  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    totalPages: allPages.length,
    pages: allPages,
    issues,
    summary: {
      duplicateTitles: issues.duplicateTitles.length,
      duplicateMeta: issues.duplicateMeta.length,
      missingH1: issues.missingH1.length,
      multipleH1: issues.multipleH1.length,
      brokenLinks: issues.brokenLinks.length,
      orphanPages: issues.orphanPages.length,
      thinPages: issues.thinPages.length,
    }
  };
  
  // Diff with previous
  const diff = diffCrawls(report, previousCrawl);
  report.diff = diff;
  
  // Save report
  await fs.mkdir(path.dirname(REPORT_FILE), { recursive: true });
  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`💾 Saved report: ${REPORT_FILE}\n`);
  
  // Display summary
  console.log('📊 Crawl Summary:\n');
  console.log(`   Total pages: ${report.totalPages}`);
  console.log(`   Duplicate titles: ${report.summary.duplicateTitles}`);
  console.log(`   Duplicate meta descriptions: ${report.summary.duplicateMeta}`);
  console.log(`   Missing H1: ${report.summary.missingH1}`);
  console.log(`   Multiple H1: ${report.summary.multipleH1}`);
  console.log(`   Broken internal links: ${report.summary.brokenLinks}`);
  console.log(`   Orphan pages: ${report.summary.orphanPages}`);
  console.log(`   Thin pages (<500 words): ${report.summary.thinPages}`);
  
  if (diff.changes.length > 0) {
    console.log('\n📈 Changes since last crawl:\n');
    diff.changes.forEach(change => {
      const icon = change.trend === 'worse' ? '📉' : '📈';
      const sign = change.delta > 0 ? '+' : '';
      console.log(`   ${icon} ${change.type}: ${change.previous} → ${change.current} (${sign}${change.delta})`);
    });
  }
  
  console.log('\n✅ Crawl complete!');
  
  // Exit with error if critical issues
  const criticalIssues = report.summary.brokenLinks + report.summary.missingH1;
  if (criticalIssues > 0) {
    console.log('\n⚠️  Warning: Critical SEO issues detected!');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Internal Site Crawler

Usage: node site-crawler.mjs [options]

Options:
  --help, -h     Show this help message

Description:
  Crawls all built site pages and checks for:
  - Title/meta duplicates
  - Missing or multiple H1 tags
  - Broken internal links
  - Orphan pages (no inbound links)
  - Thin content (<500 words)
  
  Outputs to: /reports/crawl-report.json
  Diffs against previous crawl if available

Exit Codes:
  0 - Success (no critical issues)
  1 - Critical issues detected (broken links, missing H1)
    `);
    return;
  }
  
  await crawl();
}

main().catch(error => {
  console.error('❌ Crawl failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
