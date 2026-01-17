#!/usr/bin/env node
/**
 * Export Google Ads Performance Max Assets
 *
 * Generates CSV files for bulk upload to Google Ads Editor
 *
 * Usage: node scripts/exportGoogleAdsAssets.cjs
 */

const fs = require('fs');
const path = require('path');

// Performance Max Assets for all Royal Carriage sites
const ASSETS = {
  airport: {
    campaignName: "Performance Max - Airport",
    assetGroupName: "Airport Transportation - Chicago",
    finalUrl: "https://chicagoairportblackcar.com",
    headlines: [
      "Chicago Airport Car Service",
      "O'Hare Black Car Service",
      "Midway Airport Limo",
      "24/7 Airport Transfers",
      "Professional Airport Pickup",
      "Flight Tracking Included",
      "Meet & Greet Service",
      "Luxury Airport Transport",
      "Reliable O'Hare Service",
      "Book Airport Ride Now",
      "Premium Black Car Service",
      "Chicago Airport Limo",
      "ORD & MDW Transfers",
      "On-Time Guarantee",
      "Corporate Airport Service"
    ],
    longHeadlines: [
      "Professional Chicago Airport Transportation with Flight Tracking",
      "Luxury Black Car Service to O'Hare and Midway Airports",
      "Premium Airport Transfers with Meet & Greet Service",
      "Reliable 24/7 Chicago Airport Car Service - Book Now",
      "Executive Airport Transportation for Business Travelers"
    ],
    descriptions: [
      "Professional airport car service to O'Hare & Midway. Flight tracking, meet & greet, 24/7 availability. Book online instantly.",
      "Luxury black car service for Chicago airports. Professional chauffeurs, real-time flight monitoring, guaranteed on-time pickup.",
      "Premium airport transportation in Chicago. Serving ORD & MDW with executive sedans and SUVs. Reserve your ride today.",
      "Reliable Chicago airport transfers. Corporate accounts, NET-30 billing available. Professional drivers, luxury vehicles."
    ],
    businessName: "Chicago Airport Black Car",
    callToAction: "Book Now"
  },

  corporate: {
    campaignName: "Performance Max - Corporate",
    assetGroupName: "Corporate Transportation - Chicago",
    finalUrl: "https://chicagoexecutivecarservice.com",
    headlines: [
      "Chicago Executive Car Service",
      "Corporate Transportation",
      "Business Travel Solutions",
      "Executive Black Car",
      "Corporate Accounts Available",
      "NET-30 Billing Options",
      "Professional Chauffeurs",
      "Hourly Car Service",
      "Chicago Business Travel",
      "Executive Sedan Service",
      "Corporate Event Transport",
      "Roadshow Transportation",
      "Client Entertainment",
      "Board Meeting Transport",
      "VIP Business Service"
    ],
    longHeadlines: [
      "Professional Corporate Car Service with NET-30 Billing Options",
      "Executive Transportation for Chicago Business Professionals",
      "Reliable Corporate Black Car Service - Hourly & Point-to-Point",
      "Premium Business Travel Solutions with Dedicated Account Manager",
      "Chicago Executive Car Service for Roadshows & Corporate Events"
    ],
    descriptions: [
      "Professional corporate car service in Chicago. Executive sedans, SUVs, hourly service. Corporate accounts with NET-30 billing.",
      "Executive transportation for business travelers. Dedicated account managers, real-time tracking, professional chauffeurs.",
      "Premium corporate black car service. Roadshows, client entertainment, board meetings. Flexible billing, instant booking.",
      "Chicago executive car service for business professionals. Reliable, professional, on-time. Corporate rates available."
    ],
    businessName: "Chicago Executive Car Service",
    callToAction: "Get Quote"
  },

  wedding: {
    campaignName: "Performance Max - Wedding",
    assetGroupName: "Wedding Transportation - Chicago",
    finalUrl: "https://chicagoweddingtransportation.com",
    headlines: [
      "Chicago Wedding Limo",
      "Wedding Transportation",
      "Bridal Party Transport",
      "Wedding Guest Shuttles",
      "Elegant Wedding Cars",
      "Luxury Wedding Service",
      "Wedding Day Transport",
      "Bride & Groom Limo",
      "Wedding Party Bus",
      "Chicago Wedding Cars",
      "Romantic Getaway Car",
      "Photo-Ready Vehicles",
      "Wedding Coordinator",
      "Red Carpet Service",
      "Your Special Day"
    ],
    longHeadlines: [
      "Elegant Chicago Wedding Transportation for Your Special Day",
      "Luxury Wedding Limousines & Guest Shuttle Services",
      "Professional Wedding Transportation with Dedicated Coordinator",
      "Premium Bridal Party Transport - Photo-Ready Luxury Vehicles",
      "Chicago Wedding Car Service - Stretch Limos & Party Buses"
    ],
    descriptions: [
      "Elegant wedding transportation in Chicago. Luxury limos, guest shuttles, bridal party transport. Make your day unforgettable.",
      "Premium wedding car service. Stretch limousines, SUVs, party buses. Dedicated wedding coordinator, red carpet service.",
      "Chicago wedding transportation specialists. Photo-ready vehicles, professional chauffeurs, seamless coordination.",
      "Luxury wedding limo service. Bride & groom cars, guest shuttles, after-party transport. Book your dream wedding ride."
    ],
    businessName: "Chicago Wedding Transportation",
    callToAction: "Get Quote"
  },

  partybus: {
    campaignName: "Performance Max - Party Bus",
    assetGroupName: "Party Bus Rentals - Chicago",
    finalUrl: "https://chicago-partybus.com",
    headlines: [
      "Chicago Party Bus",
      "Party Bus Rentals",
      "Bachelorette Party Bus",
      "Bachelor Party Transport",
      "Birthday Party Bus",
      "Prom Limo & Bus",
      "Concert Transportation",
      "Sports Event Shuttle",
      "Night Out Party Bus",
      "Club Hopping Bus",
      "Chicago Party Limo",
      "Group Event Transport",
      "Celebration Bus Rental",
      "VIP Party Experience",
      "Chicago Nightlife Bus"
    ],
    longHeadlines: [
      "Chicago Party Bus Rentals - Bachelorette, Birthday & More",
      "Premium Party Bus Service with Sound System & LED Lights",
      "Luxury Party Bus for Bachelor/Bachelorette Parties in Chicago",
      "Chicago Party Bus - Concerts, Sporting Events, Night Out",
      "VIP Party Bus Experience - Professional Driver, Full Bar Setup"
    ],
    descriptions: [
      "Chicago party bus rentals for any celebration. Bachelorette, birthday, prom, concerts. Premium sound, LED lights, bar area.",
      "Luxury party bus service in Chicago. Bachelor parties, sporting events, club hopping. Professional drivers, VIP experience.",
      "Premium party bus rentals. Groups up to 40 guests. Sound system, dance floor, complimentary bar setup. Book your party!",
      "Chicago party bus for unforgettable nights. Bachelorette, birthday, graduation. Safe, fun, professional service."
    ],
    businessName: "Chicago Party Bus",
    callToAction: "Book Now"
  }
};

// Create output directory
const outputDir = path.join(__dirname, '..', 'data', 'google-ads', 'exports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate CSV for each site
function generateAssetCSV(site, assets) {
  const rows = [];

  // Header for Google Ads Editor format
  rows.push([
    'Campaign',
    'Asset Group',
    'Asset Type',
    'Asset Text',
    'Final URL',
    'Business Name',
    'Call to Action'
  ].join(','));

  // Headlines (max 15)
  assets.headlines.slice(0, 15).forEach(headline => {
    rows.push([
      assets.campaignName,
      assets.assetGroupName,
      'Headline',
      `"${headline}"`,
      assets.finalUrl,
      '',
      ''
    ].join(','));
  });

  // Long Headlines (max 5)
  assets.longHeadlines.slice(0, 5).forEach(headline => {
    rows.push([
      assets.campaignName,
      assets.assetGroupName,
      'Long Headline',
      `"${headline}"`,
      assets.finalUrl,
      '',
      ''
    ].join(','));
  });

  // Descriptions (max 4)
  assets.descriptions.slice(0, 4).forEach(desc => {
    rows.push([
      assets.campaignName,
      assets.assetGroupName,
      'Description',
      `"${desc}"`,
      assets.finalUrl,
      '',
      ''
    ].join(','));
  });

  // Business Name
  rows.push([
    assets.campaignName,
    assets.assetGroupName,
    'Business Name',
    `"${assets.businessName}"`,
    assets.finalUrl,
    `"${assets.businessName}"`,
    ''
  ].join(','));

  // Call to Action
  rows.push([
    assets.campaignName,
    assets.assetGroupName,
    'Call to Action',
    `"${assets.callToAction}"`,
    assets.finalUrl,
    '',
    `"${assets.callToAction}"`
  ].join(','));

  return rows.join('\n');
}

// Generate summary markdown
function generateSummary() {
  let md = `# Google Ads Performance Max Assets

Generated: ${new Date().toISOString().split('T')[0]}

## Asset Groups Overview

| Site | Campaign | Headlines | Long Headlines | Descriptions |
|------|----------|-----------|----------------|--------------|
`;

  Object.entries(ASSETS).forEach(([site, assets]) => {
    md += `| ${site} | ${assets.campaignName} | ${assets.headlines.length} | ${assets.longHeadlines.length} | ${assets.descriptions.length} |\n`;
  });

  md += `
## Recommended Settings

### Budget
- **Daily Budget:** $50-100 per campaign (start conservative)
- **Bid Strategy:** Maximize conversions (once you have conversion tracking)

### Location Targeting
- Chicago, IL (50 mile radius)
- Cook, DuPage, Lake, Will, Kane, McHenry counties
- Special: O'Hare Airport (10 mile radius for airport campaign)

### Audience Signals
Each campaign has specific audience signals configured in the full export.

## Files Generated

`;

  Object.keys(ASSETS).forEach(site => {
    md += `- \`${site}_assets.csv\` - ${ASSETS[site].campaignName}\n`;
  });

  md += `- \`all_assets_combined.csv\` - All campaigns in one file
- \`PERFORMANCE_MAX_GUIDE.md\` - This file

## How to Import

### Option 1: Google Ads Editor (Recommended)
1. Open Google Ads Editor
2. File > Import > From CSV
3. Select the CSV file for your campaign
4. Review and post changes

### Option 2: Manual Entry
1. Go to Google Ads > Campaigns > + New Campaign
2. Select "Performance Max"
3. Copy headlines, descriptions from CSV
4. Configure audience signals manually

## Asset Requirements

| Type | Min | Max | Character Limit |
|------|-----|-----|-----------------|
| Headlines | 3 | 15 | 30 chars |
| Long Headlines | 1 | 5 | 90 chars |
| Descriptions | 2 | 4 | 90 chars |
| Business Name | 1 | 1 | 25 chars |
| Images | 1 | 20 | Various sizes |
| Logos | 1 | 5 | 1:1 & 4:1 ratios |

## Next Steps

1. Add logo images to each asset group
2. Add marketing images (landscape, square, portrait)
3. Set up conversion tracking
4. Configure final URL expansion settings
5. Review and launch campaigns
`;

  return md;
}

// Main execution
console.log('Exporting Google Ads Performance Max assets...\n');

// Generate individual CSV files
Object.entries(ASSETS).forEach(([site, assets]) => {
  const csv = generateAssetCSV(site, assets);
  const filename = `${site}_assets.csv`;
  fs.writeFileSync(path.join(outputDir, filename), csv);
  console.log(`✓ Generated ${filename}`);
});

// Generate combined CSV
const allRows = ['Campaign,Asset Group,Asset Type,Asset Text,Final URL,Business Name,Call to Action'];
Object.entries(ASSETS).forEach(([site, assets]) => {
  const csv = generateAssetCSV(site, assets);
  const lines = csv.split('\n').slice(1); // Skip header
  allRows.push(...lines);
});
fs.writeFileSync(path.join(outputDir, 'all_assets_combined.csv'), allRows.join('\n'));
console.log('✓ Generated all_assets_combined.csv');

// Generate summary
const summary = generateSummary();
fs.writeFileSync(path.join(outputDir, 'PERFORMANCE_MAX_GUIDE.md'), summary);
console.log('✓ Generated PERFORMANCE_MAX_GUIDE.md');

console.log(`\n✅ All files exported to: ${outputDir}`);
console.log('\nAsset counts:');
Object.entries(ASSETS).forEach(([site, assets]) => {
  console.log(`  ${site}: ${assets.headlines.length} headlines, ${assets.longHeadlines.length} long headlines, ${assets.descriptions.length} descriptions`);
});
