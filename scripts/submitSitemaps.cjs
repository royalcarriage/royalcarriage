#!/usr/bin/env node

const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

const SITES = [
  {
    domain: "sc-domain:chicago-partybus.com",
    sitemap: "https://chicago-partybus.web.app/sitemap.xml",
  },
  {
    domain: "sc-domain:chicagoairportblackcar.com",
    sitemap: "https://chicagoairportblackcar.web.app/sitemap.xml",
  },
  {
    domain: "sc-domain:chicagoexecutivecarservice.com",
    sitemap: "https://chicagoexecutivecarservice.web.app/sitemap.xml",
  },
  {
    domain: "sc-domain:chicagoweddingtransportation.com",
    sitemap: "https://chicagoweddingtransportation.web.app/sitemap.xml",
  },
];

async function getAccessToken() {
  const { stdout } = await execAsync("gcloud auth print-access-token");
  return stdout.trim();
}

async function submitSitemap(siteUrl, sitemapUrl, accessToken) {
  const apiUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      console.log(`✓ Submitted: ${sitemapUrl}`);
      return true;
    } else {
      const text = await response.text();
      console.log(
        `✗ Failed (${response.status}): ${siteUrl} - ${text.substring(0, 100)}`,
      );
      return false;
    }
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("===========================================");
  console.log("SUBMITTING SITEMAPS TO SEARCH CONSOLE");
  console.log("===========================================\n");

  const accessToken = await getAccessToken();

  for (const site of SITES) {
    console.log(`\n${site.domain}:`);
    await submitSitemap(site.domain, site.sitemap, accessToken);
  }

  console.log("\n===========================================");
  console.log("DONE - Check Search Console for status");
  console.log("===========================================");
}

main().catch(console.error);
