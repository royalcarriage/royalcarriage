/**
 * XML Sitemap Generator
 * Dynamically generates sitemap.xml for all pages
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://chicagoairportblackcar.com";

// Define all pages with priority and change frequency
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

function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  // Write to dist/public (production build output)
  const distPath = path.join(__dirname, "../dist/public/sitemap.xml");
  const distDir = path.dirname(distPath);

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(distPath, xml);
  console.log(`✓ Sitemap generated: ${distPath}`);
  console.log(`  ${pages.length} pages included`);

  // Also write to client/public for dev server
  const devPath = path.join(__dirname, "../client/public/sitemap.xml");
  const devDir = path.dirname(devPath);

  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
  }

  fs.writeFileSync(devPath, xml);
  console.log(`✓ Sitemap also written to: ${devPath}`);

  return xml;
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
