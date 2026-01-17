#!/usr/bin/env node

/**
 * Create GA4 Properties for Royal Carriage Sites
 */

const { google } = require("googleapis");
const path = require("path");

const SITES = [
  {
    id: "chicagoairportblackcar",
    domain: "chicagoairportblackcar.web.app",
    name: "Chicago Airport Black Car",
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

async function main() {
  console.log("===========================================");
  console.log("GA4 PROPERTY SETUP");
  console.log("===========================================\n");

  // Use Application Default Credentials
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/analytics.edit",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });

  const analyticsAdmin = google.analyticsadmin({ version: "v1beta", auth });

  console.log("Listing Google Analytics accounts...\n");

  try {
    const accountsResponse = await analyticsAdmin.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      console.log("No Analytics accounts found.");
      console.log("\nYou need to:");
      console.log("1. Go to https://analytics.google.com/");
      console.log("2. Create a Google Analytics account first");
      console.log("3. Then run this script again\n");
      return;
    }

    console.log(`Found ${accounts.length} account(s):`);
    for (const acc of accounts) {
      console.log(`  - ${acc.displayName} (${acc.name})`);
    }

    const accountName = accounts[0].name;
    console.log(`\nUsing account: ${accounts[0].displayName}`);

    // List existing properties
    const propsResponse = await analyticsAdmin.properties.list({
      filter: `parent:${accountName}`,
    });

    const existingProps = propsResponse.data.properties || [];
    console.log(`\nExisting properties (${existingProps.length}):`);

    const measurementIds = {};

    for (const prop of existingProps) {
      console.log(`  - ${prop.displayName}`);

      // Get data streams for this property
      try {
        const streamsResponse =
          await analyticsAdmin.properties.dataStreams.list({
            parent: prop.name,
          });

        const streams = streamsResponse.data.dataStreams || [];
        for (const stream of streams) {
          if (stream.webStreamData?.measurementId) {
            console.log(
              `    Measurement ID: ${stream.webStreamData.measurementId}`,
            );
            console.log(`    URL: ${stream.webStreamData.defaultUri || "N/A"}`);

            // Try to match with our sites
            for (const site of SITES) {
              if (
                prop.displayName
                  .toLowerCase()
                  .includes(site.id.replace(/-/g, "").toLowerCase()) ||
                prop.displayName
                  .toLowerCase()
                  .includes(site.name.toLowerCase().split(" ")[1]) ||
                (stream.webStreamData.defaultUri &&
                  stream.webStreamData.defaultUri.includes(site.domain))
              ) {
                measurementIds[site.id] = stream.webStreamData.measurementId;
              }
            }
          }
        }
      } catch (e) {
        console.log(`    Could not get streams: ${e.message}`);
      }
    }

    // Create missing properties
    console.log("\n--- Creating Missing Properties ---\n");

    for (const site of SITES) {
      if (measurementIds[site.id]) {
        console.log(`${site.name}: Already has ID ${measurementIds[site.id]}`);
        continue;
      }

      // Check if property exists with different naming
      const exists = existingProps.find(
        (p) =>
          p.displayName.toLowerCase().replace(/\s/g, "") ===
          site.name.toLowerCase().replace(/\s/g, ""),
      );

      if (exists) {
        console.log(`${site.name}: Property exists, checking streams...`);
        continue;
      }

      console.log(`Creating: ${site.name}...`);

      try {
        const createResponse = await analyticsAdmin.properties.create({
          requestBody: {
            parent: accountName,
            displayName: site.name,
            timeZone: "America/Chicago",
            currencyCode: "USD",
            industryCategory: "TRAVEL",
          },
        });

        const propertyName = createResponse.data.name;
        console.log(`  Property created: ${propertyName}`);

        // Create web data stream
        const streamResponse =
          await analyticsAdmin.properties.dataStreams.create({
            parent: propertyName,
            requestBody: {
              type: "WEB_DATA_STREAM",
              displayName: `${site.name} Web`,
              webStreamData: {
                defaultUri: `https://${site.domain}`,
              },
            },
          });

        const measurementId = streamResponse.data.webStreamData?.measurementId;
        console.log(`  Measurement ID: ${measurementId}`);
        measurementIds[site.id] = measurementId;
      } catch (err) {
        console.error(`  Error: ${err.message}`);
      }
    }

    // Output configuration
    console.log("\n===========================================");
    console.log("CONFIGURATION TO ADD");
    console.log("===========================================\n");
    console.log("Update packages/astro-utils/src/config.ts:\n");

    for (const site of SITES) {
      const id = measurementIds[site.id] || "G-XXXXXXXXXX";
      console.log(`  ${site.id.replace(/-/g, "")}: {`);
      console.log(`    analytics: { googleAnalyticsId: "${id}" }`);
      console.log(`  },`);
    }
  } catch (error) {
    console.error("\nError:", error.message);

    if (error.code === 403 || error.message.includes("scope")) {
      console.log("\n--- Authentication Issue ---");
      console.log("Run this command to login with Analytics scope:");
      console.log("gcloud auth application-default login");
      console.log("\nOr manually set up GA4 at https://analytics.google.com/");
    }
  }
}

main().catch(console.error);
