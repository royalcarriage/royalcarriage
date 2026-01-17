#!/usr/bin/env node

/**
 * Sitemap Generator for Royal Carriage Limousine Sites
 * Generates XML sitemaps for all 4 websites based on Firestore content
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "..", "service-account.json");
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} else {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

const db = admin.firestore();

// Site configurations
const SITES = {
  chicagoairportblackcar: {
    domain: "https://chicagoairportblackcar.com",
    outputDir: "apps/airport/public",
    name: "Airport Black Car",
  },
  chicagoexecutivecarservice: {
    domain: "https://chicagoexecutivecarservice.com",
    outputDir: "apps/corporate/public",
    name: "Executive Car Service",
  },
  chicagoweddingtransportation: {
    domain: "https://chicagoweddingtransportation.com",
    outputDir: "apps/wedding/public",
    name: "Wedding Transportation",
  },
  "chicago-partybus": {
    domain: "https://chicago-partybus.com",
    outputDir: "apps/partybus/public",
    name: "Party Bus",
  },
};

// Static pages for each site
const STATIC_PAGES = {
  chicagoairportblackcar: [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/ohare-airport-limo", priority: "0.9", changefreq: "weekly" },
    { url: "/midway-airport-limo", priority: "0.9", changefreq: "weekly" },
    { url: "/fleet", priority: "0.8", changefreq: "monthly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/locations", priority: "0.8", changefreq: "weekly" },
    { url: "/blog", priority: "0.7", changefreq: "weekly" },
  ],
  chicagoexecutivecarservice: [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/fleet", priority: "0.8", changefreq: "monthly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/locations", priority: "0.8", changefreq: "weekly" },
  ],
  chicagoweddingtransportation: [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/fleet", priority: "0.8", changefreq: "monthly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/locations", priority: "0.8", changefreq: "weekly" },
  ],
  "chicago-partybus": [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/fleet", priority: "0.8", changefreq: "monthly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/locations", priority: "0.8", changefreq: "weekly" },
  ],
};

function generateSitemapXML(domain, urls) {
  const today = new Date().toISOString().split("T")[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of urls) {
    xml += "  <url>\n";
    xml += `    <loc>${domain}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq || "weekly"}</changefreq>\n`;
    xml += `    <priority>${page.priority || "0.5"}</priority>\n`;
    xml += "  </url>\n";
  }

  xml += "</urlset>";
  return xml;
}

function generateRobotsTxt(domain, sitemapUrl) {
  return `# Royal Carriage Limousine - ${domain}
# https://royalcarriagelimo.com

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${sitemapUrl}

# Crawl-delay (optional, for politeness)
Crawl-delay: 1

# Disallow admin and private paths
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/
`;
}

async function generateSitemapsForSite(websiteId, siteConfig) {
  console.log(`\nGenerating sitemap for ${siteConfig.name}...`);

  const urls = [...STATIC_PAGES[websiteId]];

  // Get all service content for this site
  try {
    const contentSnap = await db
      .collection("service_content")
      .where("websiteId", "==", websiteId)
      .where("approvalStatus", "==", "approved")
      .get();

    console.log(`  Found ${contentSnap.size} service content pages`);

    contentSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.locationId && data.serviceId) {
        urls.push({
          url: `/service/${data.locationId}/${data.serviceId}`,
          priority: "0.6",
          changefreq: "monthly",
        });
      }
    });
  } catch (error) {
    console.warn(
      `  Warning: Could not fetch service content - ${error.message}`,
    );
  }

  // Get all locations for city pages
  try {
    const locSnap = await db.collection("locations").get();
    console.log(`  Found ${locSnap.size} location pages`);

    locSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        urls.push({
          url: `/city/${data.slug}`,
          priority: "0.7",
          changefreq: "monthly",
        });
      }
    });
  } catch (error) {
    console.warn(`  Warning: Could not fetch locations - ${error.message}`);
  }

  // Get blog posts (for airport site)
  if (websiteId === "chicagoairportblackcar") {
    try {
      const blogSnap = await db
        .collection("blog_posts")
        .where("status", "==", "published")
        .get();

      console.log(`  Found ${blogSnap.size} blog posts`);

      blogSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.slug) {
          urls.push({
            url: `/blog/${data.slug}`,
            priority: "0.6",
            changefreq: "monthly",
          });
        }
      });
    } catch (error) {
      console.warn(`  Warning: Could not fetch blog posts - ${error.message}`);
    }
  }

  // Generate sitemap XML
  const sitemapXML = generateSitemapXML(siteConfig.domain, urls);

  // Ensure output directory exists
  const outputPath = path.join(__dirname, "..", siteConfig.outputDir);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Write sitemap.xml
  const sitemapPath = path.join(outputPath, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemapXML);
  console.log(`  Written: ${sitemapPath} (${urls.length} URLs)`);

  // Write robots.txt
  const robotsTxt = generateRobotsTxt(
    siteConfig.domain,
    `${siteConfig.domain}/sitemap.xml`,
  );
  const robotsPath = path.join(outputPath, "robots.txt");
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log(`  Written: ${robotsPath}`);

  return urls.length;
}

async function main() {
  console.log("===========================================");
  console.log("SITEMAP GENERATOR - Royal Carriage Limousine");
  console.log("===========================================");

  let totalUrls = 0;

  for (const [websiteId, siteConfig] of Object.entries(SITES)) {
    const count = await generateSitemapsForSite(websiteId, siteConfig);
    totalUrls += count;
  }

  console.log("\n===========================================");
  console.log("SITEMAP GENERATION COMPLETE!");
  console.log(`Total URLs across all sites: ${totalUrls}`);
  console.log("===========================================");

  console.log("\nNext steps:");
  console.log("1. Build and deploy all sites");
  console.log("2. Submit sitemaps to Google Search Console:");
  for (const [websiteId, siteConfig] of Object.entries(SITES)) {
    console.log(`   - ${siteConfig.domain}/sitemap.xml`);
  }
  console.log("3. Verify robots.txt is accessible at /robots.txt");

  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
