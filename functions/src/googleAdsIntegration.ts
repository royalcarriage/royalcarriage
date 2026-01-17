/**
 * Google Ads API Integration for Performance Max Campaign Management
 *
 * Setup required:
 * 1. Set environment variables in .env:
 *    - GOOGLE_ADS_CUSTOMER_ID
 *    - GOOGLE_ADS_DEVELOPER_TOKEN
 *    - GOOGLE_ADS_CLIENT_ID
 *    - GOOGLE_ADS_CLIENT_SECRET
 *    - GOOGLE_ADS_REFRESH_TOKEN
 *
 * 2. Enable Google Ads API in GCP Console
 * 3. Link Google Ads account to GCP project
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Types for Google Ads Performance Max
interface PerformanceMaxAssetGroup {
  name: string;
  finalUrls: string[];
  headlines: string[];
  longHeadlines: string[];
  descriptions: string[];
  businessName: string;
  callToActions: string[];
}

interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  costPerConversion: number;
}

// Asset configurations for Royal Carriage sites
export const PERFORMANCE_MAX_ASSETS = {
  airport: {
    assetGroupName: "Airport Transportation - Chicago",
    finalUrls: ["https://chicagoairportblackcar.com"],
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
    callToActions: ["Book Now", "Get Quote", "Reserve Ride"]
  },

  corporate: {
    assetGroupName: "Corporate Transportation - Chicago",
    finalUrls: ["https://chicagoexecutivecarservice.com"],
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
    callToActions: ["Get Corporate Rate", "Book Now", "Request Quote"]
  },

  wedding: {
    assetGroupName: "Wedding Transportation - Chicago",
    finalUrls: ["https://chicagoweddingtransportation.com"],
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
    callToActions: ["Get Wedding Quote", "Book Consultation", "View Fleet"]
  },

  partybus: {
    assetGroupName: "Party Bus Rentals - Chicago",
    finalUrls: ["https://chicago-partybus.com"],
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
    callToActions: ["Check Availability", "Get Party Quote", "Book Party Bus"]
  }
};

// Audience signals for Performance Max
export const AUDIENCE_SIGNALS = {
  airport: {
    customSegments: [
      "Business travelers",
      "Frequent flyers",
      "Corporate travelers",
      "Airport transportation searchers"
    ],
    demographics: {
      ageRanges: ["25-34", "35-44", "45-54", "55-64"],
      householdIncome: ["Top 10%", "11-20%", "21-30%"]
    },
    interests: [
      "Business & Industrial",
      "Travel",
      "Air Travel"
    ]
  },
  corporate: {
    customSegments: [
      "Business executives",
      "Corporate event planners",
      "Executive assistants",
      "Business travel managers"
    ],
    demographics: {
      ageRanges: ["35-44", "45-54", "55-64"],
      householdIncome: ["Top 10%", "11-20%"]
    },
    interests: [
      "Business & Industrial",
      "Business Services",
      "Corporate Services"
    ]
  },
  wedding: {
    customSegments: [
      "Engaged couples",
      "Wedding planners",
      "Brides-to-be",
      "Wedding party"
    ],
    demographics: {
      ageRanges: ["25-34", "35-44"],
      lifeEvents: ["Recently engaged", "Getting married"]
    },
    interests: [
      "Weddings",
      "Event Planning",
      "Luxury Services"
    ]
  },
  partybus: {
    customSegments: [
      "Party planners",
      "Bachelor/bachelorette party planners",
      "Event organizers",
      "Nightlife enthusiasts"
    ],
    demographics: {
      ageRanges: ["21-24", "25-34", "35-44"],
      householdIncome: ["Top 30%", "31-40%", "41-50%"]
    },
    interests: [
      "Nightlife & Clubs",
      "Entertainment",
      "Party Planning"
    ]
  }
};

// Location targeting for Chicago area
export const LOCATION_TARGETING = {
  include: [
    { name: "Chicago, IL", radiusMiles: 50 },
    { name: "Cook County, IL" },
    { name: "DuPage County, IL" },
    { name: "Lake County, IL" },
    { name: "Will County, IL" },
    { name: "Kane County, IL" },
    { name: "McHenry County, IL" }
  ],
  airports: [
    { name: "O'Hare International Airport", code: "ORD", radiusMiles: 10 },
    { name: "Midway International Airport", code: "MDW", radiusMiles: 10 }
  ]
};

/**
 * Cloud Function: Get Performance Max asset recommendations
 */
export const getPerformanceMaxAssets = functions.https.onCall(
  async (data: { site: "airport" | "corporate" | "wedding" | "partybus" }, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to access this function"
      );
    }

    const site = data.site;
    if (!PERFORMANCE_MAX_ASSETS[site]) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid site specified"
      );
    }

    return {
      assets: PERFORMANCE_MAX_ASSETS[site],
      audienceSignals: AUDIENCE_SIGNALS[site],
      locationTargeting: LOCATION_TARGETING
    };
  }
);

/**
 * Cloud Function: Store campaign performance data
 */
export const storeCampaignPerformance = functions.https.onCall(
  async (data: { performance: CampaignPerformance[] }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated"
      );
    }

    const db = admin.firestore();
    const batch = db.batch();
    const today = new Date().toISOString().split("T")[0];

    for (const perf of data.performance) {
      const docRef = db
        .collection("adsMetrics")
        .doc(`${perf.campaignId}_${today}`);

      batch.set(docRef, {
        ...perf,
        date: today,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    return { success: true, stored: data.performance.length };
  }
);

/**
 * Generate CSV for Google Ads Editor bulk upload
 */
export function generateBulkUploadCSV(site: keyof typeof PERFORMANCE_MAX_ASSETS): string {
  const assets = PERFORMANCE_MAX_ASSETS[site];

  const rows: string[] = [
    "Row Type,Action,Campaign,Ad Group,Asset Group,Final URL,Headline,Long Headline,Description,Business Name,Call to Action"
  ];

  // Add headlines
  assets.headlines.forEach((headline, i) => {
    rows.push(`Asset,Add,Performance Max - ${site},,${assets.assetGroupName},${assets.finalUrls[0]},${headline},,,,`);
  });

  // Add long headlines
  assets.longHeadlines.forEach((headline, i) => {
    rows.push(`Asset,Add,Performance Max - ${site},,${assets.assetGroupName},${assets.finalUrls[0]},,${headline},,,`);
  });

  // Add descriptions
  assets.descriptions.forEach((desc, i) => {
    rows.push(`Asset,Add,Performance Max - ${site},,${assets.assetGroupName},${assets.finalUrls[0]},,,${desc},,`);
  });

  return rows.join("\n");
}

// Export all assets for reference
export const ALL_ASSETS = PERFORMANCE_MAX_ASSETS;
export const ALL_AUDIENCES = AUDIENCE_SIGNALS;
export const ALL_LOCATIONS = LOCATION_TARGETING;
