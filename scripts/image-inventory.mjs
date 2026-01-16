#!/usr/bin/env node

/**
 * Image Inventory System
 * Scans all pages for image references and tracks issues
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_FILE = path.join(__dirname, '../reports/image-inventory.json');

// Sites to scan
const SITES = [
  { name: 'airport', distPath: path.join(__dirname, '../apps/airport/dist'), publicPath: path.join(__dirname, '../apps/airport/public') },
  { name: 'corporate', distPath: path.join(__dirname, '../apps/corporate/dist'), publicPath: path.join(__dirname, '../apps/corporate/public') },
  { name: 'wedding', distPath: path.join(__dirname, '../apps/wedding/dist'), publicPath: path.join(__dirname, '../apps/wedding/public') },
  { name: 'partybus', distPath: path.join(__dirname, '../apps/partybus/dist'), publicPath: path.join(__dirname, '../apps/partybus/public') },
];

/**
 * Find all HTML files
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
 * Extract image references from HTML
 */
function extractImages(html) {
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const src = match[1];
    
    // Extract alt text
    const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : null;
    
    // Extract dimensions
    const widthMatch = fullTag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = fullTag.match(/height=["']?(\d+)["']?/i);
    const width = widthMatch ? parseInt(widthMatch[1]) : null;
    const height = heightMatch ? parseInt(heightMatch[1]) : null;
    
    images.push({ src, alt, width, height });
  }
  
  return images;
}

/**
 * Check if image file exists
 */
async function imageExists(imagePath) {
  try {
    await fs.access(imagePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image dimensions from file
 */
async function getImageDimensions(imagePath) {
  // TODO: Implement actual dimension reading using sharp or similar
  // For now, return null
  return null;
}

/**
 * Scan a single page for images
 */
async function scanPage(filePath, siteRoot, publicPath) {
  const html = await fs.readFile(filePath, 'utf-8');
  const images = extractImages(html);
  
  const relativePath = path.relative(siteRoot, filePath);
  const pageUrl = '/' + relativePath.replace(/index\.html$/, '').replace(/\.html$/, '');
  
  const imageData = [];
  
  for (const img of images) {
    // Skip external images
    if (img.src.startsWith('http://') || img.src.startsWith('https://') || 
        img.src.startsWith('//') || img.src.startsWith('data:')) {
      continue;
    }
    
    // Resolve image path
    const imagePath = path.join(publicPath, img.src);
    const exists = await imageExists(imagePath);
    
    let aspectRatio = null;
    if (img.width && img.height) {
      aspectRatio = img.width / img.height;
    }
    
    imageData.push({
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height,
      aspectRatio,
      exists,
      page: pageUrl
    });
  }
  
  return imageData;
}

/**
 * Analyze inventory for issues
 */
function analyzeInventory(inventory) {
  const issues = {
    missingImages: [],
    poorAspectRatios: [],
    overusedImages: [],
    pagesWithNoImages: [],
    missingAltText: []
  };
  
  // Track image usage
  const imageUsage = new Map();
  const pageImages = new Map();
  
  inventory.forEach(item => {
    // Track usage per image
    if (!imageUsage.has(item.src)) {
      imageUsage.set(item.src, []);
    }
    imageUsage.get(item.src).push(item.page);
    
    // Track images per page
    if (!pageImages.has(item.page)) {
      pageImages.set(item.page, []);
    }
    pageImages.get(item.page).push(item);
    
    // Check for missing images
    if (!item.exists) {
      issues.missingImages.push({
        image: item.src,
        page: item.page
      });
    }
    
    // Check for poor aspect ratios (too wide or too tall)
    if (item.aspectRatio) {
      if (item.aspectRatio < 0.5 || item.aspectRatio > 3) {
        issues.poorAspectRatios.push({
          image: item.src,
          page: item.page,
          aspectRatio: item.aspectRatio.toFixed(2)
        });
      }
    }
    
    // Check for missing alt text
    if (!item.alt || item.alt.trim().length === 0) {
      issues.missingAltText.push({
        image: item.src,
        page: item.page
      });
    }
  });
  
  // Find overused images (same image on 5+ pages)
  imageUsage.forEach((pages, image) => {
    if (pages.length >= 5) {
      issues.overusedImages.push({
        image,
        usageCount: pages.length,
        pages: pages.slice(0, 5) // Sample
      });
    }
  });
  
  // Find pages with no images
  const allPages = new Set(inventory.map(i => i.page));
  allPages.forEach(page => {
    const images = pageImages.get(page) || [];
    if (images.length === 0) {
      issues.pagesWithNoImages.push(page);
    }
  });
  
  return { issues, imageUsage, pageImages };
}

/**
 * Main inventory function
 */
async function inventory() {
  console.log('📸 Starting image inventory...\n');
  
  const allImages = [];
  
  for (const site of SITES) {
    console.log(`📂 Scanning ${site.name}...`);
    
    const htmlFiles = await findHtmlFiles(site.distPath);
    console.log(`   Found ${htmlFiles.length} HTML files`);
    
    let imageCount = 0;
    
    for (const file of htmlFiles) {
      try {
        const images = await scanPage(file, site.distPath, site.publicPath);
        allImages.push(...images.map(img => ({ ...img, site: site.name })));
        imageCount += images.length;
      } catch (error) {
        console.warn(`   ⚠️  Error scanning ${file}:`, error.message);
      }
    }
    
    console.log(`   Found ${imageCount} image references\n`);
  }
  
  console.log(`✅ Scanned ${allImages.length} total image references\n`);
  
  // Analyze inventory
  console.log('🔍 Analyzing inventory...');
  const { issues, imageUsage, pageImages } = analyzeInventory(allImages);
  
  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    totalImages: imageUsage.size,
    totalReferences: allImages.length,
    inventory: allImages,
    imageUsage: Array.from(imageUsage.entries()).map(([image, pages]) => ({
      image,
      usageCount: pages.length,
      pages
    })),
    issues,
    summary: {
      missingImages: issues.missingImages.length,
      poorAspectRatios: issues.poorAspectRatios.length,
      overusedImages: issues.overusedImages.length,
      pagesWithNoImages: issues.pagesWithNoImages.length,
      missingAltText: issues.missingAltText.length
    }
  };
  
  // Save report
  await fs.mkdir(path.dirname(REPORT_FILE), { recursive: true });
  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`💾 Saved report: ${REPORT_FILE}\n`);
  
  // Display summary
  console.log('📊 Inventory Summary:\n');
  console.log(`   Unique images: ${report.totalImages}`);
  console.log(`   Total references: ${report.totalReferences}`);
  console.log(`   Missing images (404): ${report.summary.missingImages}`);
  console.log(`   Poor aspect ratios: ${report.summary.poorAspectRatios}`);
  console.log(`   Overused images (5+ pages): ${report.summary.overusedImages}`);
  console.log(`   Pages with no images: ${report.summary.pagesWithNoImages}`);
  console.log(`   Missing alt text: ${report.summary.missingAltText}`);
  
  if (report.summary.missingImages > 0) {
    console.log('\n⚠️  Warning: Missing images detected!');
    console.log('   Sample missing images:');
    issues.missingImages.slice(0, 5).forEach(item => {
      console.log(`   - ${item.image} (on ${item.page})`);
    });
  }
  
  console.log('\n✅ Inventory complete!');
  
  // Exit with error if critical issues
  if (report.summary.missingImages > 0) {
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Image Inventory System

Usage: node image-inventory.mjs [options]

Options:
  --help, -h     Show this help message

Description:
  Scans all built pages for image references and detects:
  - Missing images (404s)
  - Poor aspect ratios (too wide/tall)
  - Overused images (same image on 5+ pages)
  - Pages with no images
  - Missing alt text
  
  Outputs to: /reports/image-inventory.json

Exit Codes:
  0 - Success (no missing images)
  1 - Missing images detected
    `);
    return;
  }
  
  await inventory();
}

main().catch(error => {
  console.error('❌ Inventory failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
