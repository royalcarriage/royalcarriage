#!/usr/bin/env node
/**
 * Enterprise Data Verification Script
 *
 * Purpose: Verify that enterprise data was successfully written to Firestore
 * - Check fleet vehicles count and categories
 * - Check services count by website
 *
 * Usage:
 *   node scripts/verifyEnterpriseData.cjs
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "royalcarriagelimoseo",
  });
}

const db = admin.firestore();

/**
 * Verify fleet vehicles in Firestore
 */
async function verifyFleetVehicles() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║              FLEET VEHICLES VERIFICATION                   ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Get total count
    const totalSnapshot = await db.collection("fleet_vehicles").get();
    console.log(`Total Fleet Vehicles: ${totalSnapshot.size}`);

    // Count by category
    const categories = {
      sedan: 0,
      suv: 0,
      stretch: 0,
      van: 0,
      partyBus: 0,
      coach: 0,
    };

    const vehicles = {};

    totalSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.category && categories[data.category] !== undefined) {
        categories[data.category]++;
      }
      vehicles[doc.id] = {
        name: data.name,
        category: data.category,
        capacity: data.capacity,
        status: data.status,
      };
    });

    console.log("\nBy Category:");
    console.log(`  Sedans: ${categories.sedan}`);
    console.log(`  SUVs: ${categories.suv}`);
    console.log(`  Stretch Limousines: ${categories.stretch}`);
    console.log(`  Vans: ${categories.van}`);
    console.log(`  Party Buses: ${categories.partyBus}`);
    console.log(`  Coach Buses: ${categories.coach}`);

    console.log("\nVehicles List:");
    Object.entries(vehicles).forEach(([id, vehicle]) => {
      console.log(
        `  ✓ ${vehicle.name} (${vehicle.category}) - ${vehicle.capacity} passengers`,
      );
    });

    return {
      total: totalSnapshot.size,
      expected: 14,
      success: totalSnapshot.size === 14,
      categories,
      vehicles,
    };
  } catch (error) {
    console.error("✗ Error verifying fleet vehicles:", error.message);
    return { total: 0, expected: 14, success: false, error: error.message };
  }
}

/**
 * Verify services in Firestore
 */
async function verifyServices() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║                  SERVICES VERIFICATION                     ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Get total count
    const totalSnapshot = await db.collection("services").get();
    console.log(`Total Services: ${totalSnapshot.size}`);

    // Count by website
    const websites = {
      chicagoairportblackcar: 0,
      chicagoexecutivecarservice: 0,
      chicagoweddingtransportation: 0,
      "chicago-partybus": 0,
      other: 0,
    };

    const categories = {};

    totalSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Count by website
      if (data.website && websites[data.website] !== undefined) {
        websites[data.website]++;
      } else if (data.website) {
        websites["other"]++;
      }

      // Count by category
      if (data.category) {
        categories[data.category] = (categories[data.category] || 0) + 1;
      }
    });

    console.log("\nBy Website:");
    console.log(
      `  Airport (chicagoairportblackcar): ${websites["chicagoairportblackcar"]}`,
    );
    console.log(
      `  Corporate (chicagoexecutivecarservice): ${websites["chicagoexecutivecarservice"]}`,
    );
    console.log(
      `  Wedding (chicagoweddingtransportation): ${websites["chicagoweddingtransportation"]}`,
    );
    console.log(
      `  Party Bus (chicago-partybus): ${websites["chicago-partybus"]}`,
    );
    if (websites["other"] > 0) {
      console.log(`  Other/Shared: ${websites["other"]}`);
    }

    console.log("\nTop Categories:");
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    sortedCategories.forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    return {
      total: totalSnapshot.size,
      expected: 91,
      success: totalSnapshot.size >= 80,
      websites,
      categoryCount: Object.keys(categories).length,
    };
  } catch (error) {
    console.error("✗ Error verifying services:", error.message);
    return { total: 0, expected: 91, success: false, error: error.message };
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║     ROYAL CARRIAGE ENTERPRISE DATA VERIFICATION            ║");
  console.log("║                                                            ║");
  console.log("║  Project: royalcarriagelimoseo                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  try {
    // Verify fleet vehicles
    const fleetResults = await verifyFleetVehicles();

    // Verify services
    const servicesResults = await verifyServices();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                  VERIFICATION SUMMARY                      ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.log("Fleet Vehicles:");
    if (fleetResults.success) {
      console.log(
        `  ✓ ${fleetResults.total}/${fleetResults.expected} vehicles verified`,
      );
    } else {
      console.log(
        `  ✗ ${fleetResults.total}/${fleetResults.expected} vehicles found`,
      );
    }

    console.log("\nServices:");
    if (servicesResults.success) {
      console.log(`  ✓ ${servicesResults.total} services verified`);
    } else {
      console.log(
        `  ✗ ${servicesResults.total}/${servicesResults.expected} services found`,
      );
    }

    console.log(`\nVerification Time: ${duration}s\n`);

    if (fleetResults.success && servicesResults.success) {
      console.log(
        "╔════════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║         ALL DATA SUCCESSFULLY VERIFIED!                    ║",
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝\n",
      );
      process.exit(0);
    } else {
      console.log(
        "╔════════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║         VERIFICATION INCOMPLETE OR FAILED                  ║",
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝\n",
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("\n✗ VERIFICATION FAILED:", error);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);
