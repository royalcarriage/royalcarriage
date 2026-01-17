#!/usr/bin/env node

/**
 * Submit sites to Google Search Console and request indexing
 */

const { google } = require("googleapis");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

const SITES = [
  "https://chicagoairportblackcar.web.app",
  "https://chicagoexecutivecarservice.web.app",
  "https://chicagoweddingtransportation.web.app",
  "https://chicago-partybus.web.app",
];

const KEY_PAGES = ["/", "/sitemap.xml", "/fleet", "/contact", "/locations"];

async function getAccessToken() {
  try {
    const { stdout } = await execAsync("gcloud auth print-access-token");
    return stdout.trim();
  } catch (error) {
    console.error("Failed to get access token:", error.message);
    return null;
  }
}

async function addSiteToSearchConsole(siteUrl, accessToken) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`  ✓ Added to Search Console: ${siteUrl}`);
      return true;
    } else {
      const text = await response.text();
      console.log(`  ✗ Failed (${response.status}): ${text.substring(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return false;
  }
}

async function submitSitemap(siteUrl, sitemapUrl, accessToken) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`  ✓ Sitemap submitted: ${sitemapUrl}`);
      return true;
    } else {
      const text = await response.text();
      console.log(
        `  ✗ Sitemap failed (${response.status}): ${text.substring(0, 100)}`,
      );
      return false;
    }
  } catch (error) {
    console.log(`  ✗ Sitemap error: ${error.message}`);
    return false;
  }
}

async function requestIndexing(pageUrl, accessToken) {
  const url = "https://indexing.googleapis.com/v3/urlNotifications:publish";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: pageUrl,
        type: "URL_UPDATED",
      }),
    });

    if (response.ok) {
      console.log(`  ✓ Indexing requested: ${pageUrl}`);
      return true;
    } else {
      const text = await response.text();
      if (text.includes("Permission denied")) {
        console.log(`  ⚠ Indexing API requires site verification first`);
      } else {
        console.log(`  ✗ Indexing failed: ${text.substring(0, 100)}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`  ✗ Indexing error: ${error.message}`);
    return false;
  }
}

async function listSearchConsoleSites(accessToken) {
  const url = "https://searchconsole.googleapis.com/webmasters/v3/sites";

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.siteEntry || [];
    }
  } catch (error) {
    console.log("Error listing sites:", error.message);
  }
  return [];
}

async function main() {
  console.log("===========================================");
  console.log("GOOGLE SEARCH CONSOLE & INDEXING SETUP");
  console.log("===========================================\n");

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error("Cannot proceed without access token");
    process.exit(1);
  }

  console.log("Access token obtained ✓\n");

  // List existing sites
  console.log("--- Existing Search Console Sites ---");
  const existingSites = await listSearchConsoleSites(accessToken);
  if (existingSites.length > 0) {
    existingSites.forEach((site) => {
      console.log(`  ${site.siteUrl} (${site.permissionLevel})`);
    });
  } else {
    console.log("  No sites found");
  }

  // Add sites to Search Console
  console.log("\n--- Adding Sites to Search Console ---");
  for (const site of SITES) {
    await addSiteToSearchConsole(site, accessToken);
  }

  // Submit sitemaps
  console.log("\n--- Submitting Sitemaps ---");
  for (const site of SITES) {
    const sitemapUrl = `${site}/sitemap.xml`;
    await submitSitemap(site, sitemapUrl, accessToken);
  }

  // Request indexing for key pages
  console.log("\n--- Requesting Indexing ---");
  for (const site of SITES) {
    console.log(`\n${site}:`);
    for (const page of KEY_PAGES.slice(0, 2)) {
      // Limit to avoid rate limits
      await requestIndexing(`${site}${page}`, accessToken);
    }
  }

  console.log("\n===========================================");
  console.log("SETUP COMPLETE");
  console.log("===========================================");
  console.log("\nVerify at: https://search.google.com/search-console");
}

main().catch(console.error);
