/**
 * XML Sitemap Generator
 * Dynamically generates sitemap.xml or sitemap index for >50k URLs
 * Supports sitemap index with multiple sitemap files for large sites
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://chicagoairportblackcar.com";
const MAX_URLS_PER_SITEMAP = 50000;

// Define all pages with priority and change frequency
// TODO: Pull from Firestore collections (pages, cities, services, fleet, blog)
const pages = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/ohare-airport-limo", priority: 0.9, changefreq: "weekly" },
  { path: "/midway-airport-limo", priority: 0.9, changefreq: "weekly" },
  { path: "/downtown-chicago", priority: 0.8, changefreq: "weekly" },
  { path: "/chicago-suburbs", priority: 0.8, changefreq: "weekly" },
  { path: "/fleet", priority: 0.7, changefreq: "monthly" },
  { path: "/pricing", priority: 0.8, changefreq: "weekly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
];

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function generateSingleSitemap(urls, lastmod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}

function generateSitemapIndex(sitemapFiles, lastmod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles
  .map(
    (filename) => `  <sitemap>
    <loc>${SITE_URL}/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>`;
}

function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];
  const totalUrls = pages.length;

  console.log(`\n🗺️  Generating sitemap for ${totalUrls} URLs...`);

  // Determine paths
  const distDir = path.join(__dirname, "../dist/public");
  const devDir = path.join(__dirname, "../client/public");

  // Create directories if they don't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
  }

  if (totalUrls <= MAX_URLS_PER_SITEMAP) {
    // Generate single sitemap
    const xml = generateSingleSitemap(pages, now);

    const distPath = path.join(distDir, "sitemap.xml");
    const devPath = path.join(devDir, "sitemap.xml");

    fs.writeFileSync(distPath, xml);
    fs.writeFileSync(devPath, xml);

    console.log(`✓ Single sitemap generated`);
    console.log(`  ${totalUrls} URLs included`);
    console.log(`  Production: ${distPath}`);
    console.log(`  Development: ${devPath}`);
  } else {
    // Generate sitemap index with multiple sitemaps
    const chunks = chunkArray(pages, MAX_URLS_PER_SITEMAP);
    const sitemapFiles = [];

    console.log(`⚠️  URL count (${totalUrls}) exceeds ${MAX_URLS_PER_SITEMAP}`);
    console.log(`📦 Splitting into ${chunks.length} sitemap files...`);

    chunks.forEach((chunk, index) => {
      const filename = `sitemap-${index + 1}.xml`;
      const xml = generateSingleSitemap(chunk, now);

      fs.writeFileSync(path.join(distDir, filename), xml);
      fs.writeFileSync(path.join(devDir, filename), xml);

      sitemapFiles.push(filename);
      console.log(`  ✓ ${filename}: ${chunk.length} URLs`);
    });

    // Generate sitemap index
    const indexXml = generateSitemapIndex(sitemapFiles, now);

    const distIndexPath = path.join(distDir, "sitemap.xml");
    const devIndexPath = path.join(devDir, "sitemap.xml");

    fs.writeFileSync(distIndexPath, indexXml);
    fs.writeFileSync(devIndexPath, indexXml);

    console.log(`\n✓ Sitemap index generated: sitemap.xml`);
    console.log(`  ${sitemapFiles.length} sitemap files`);
    console.log(`  ${totalUrls} total URLs`);
    console.log(`  Production: ${distIndexPath}`);
    console.log(`  Development: ${devIndexPath}`);
  }

  return true;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    generateSitemap();
    process.exit(0);
  } catch (error) {
    console.error("❌ Sitemap generation failed:", error.message);
    process.exit(1);
  }
}

export { generateSitemap };
