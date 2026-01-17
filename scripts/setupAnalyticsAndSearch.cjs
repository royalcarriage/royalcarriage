#!/usr/bin/env node

/**
 * Google Analytics & Search Console Setup Guide
 */

const SITES = [
  {
    id: "chicagoairportblackcar",
    domain: "chicagoairportblackcar.web.app",
    name: "Chicago Airport Black Car Service",
  },
  {
    id: "chicagoexecutivecarservice",
    domain: "chicagoexecutivecarservice.web.app",
    name: "Chicago Executive Car Service",
  },
  {
    id: "chicagoweddingtransportation",
    domain: "chicagoweddingtransportation.web.app",
    name: "Chicago Wedding Transportation",
  },
  {
    id: "chicago-partybus",
    domain: "chicago-partybus.web.app",
    name: "Chicago Party Bus",
  },
];

console.log("===========================================");
console.log("ANALYTICS & SEARCH CONSOLE SETUP");
console.log("===========================================\n");

console.log("--- STEP 1: Create Google Analytics 4 Properties ---");
console.log("Go to: https://analytics.google.com/\n");

for (const site of SITES) {
  console.log(`${site.name}:`);
  console.log(`  - Create property: "${site.name}"`);
  console.log(`  - Web stream URL: https://${site.domain}`);
  console.log(`  - Copy Measurement ID (G-XXXXXXX)\n`);
}

console.log("--- STEP 2: Add to Search Console ---");
console.log("Go to: https://search.google.com/search-console\n");

for (const site of SITES) {
  console.log(`Add property: https://${site.domain}`);
}

console.log("\n--- STEP 3: Submit Sitemaps ---");
console.log("In Search Console > Sitemaps, submit:\n");

for (const site of SITES) {
  console.log(`https://${site.domain}/sitemap.xml`);
}

console.log("\n--- STEP 4: Update Config ---");
console.log("Edit: packages/astro-utils/src/config.ts");
console.log("Replace G-XXXXXXXXXX with your Measurement IDs\n");

console.log("--- STEP 5: Rebuild & Deploy ---");
console.log("pnpm build && firebase deploy --only hosting");
