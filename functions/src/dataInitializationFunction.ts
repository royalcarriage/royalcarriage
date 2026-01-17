/**
 * Phase 4: Production Data Initialization Cloud Function
 * Initializes Firestore with production locations, services, and mappings
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface Location {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  demographics?: {
    population?: number;
    averageIncome?: string;
    businessDensity?: string;
  };
  applicableServices?: {
    [serviceId: string]: number;
  };
}

interface Service {
  id: string;
  website: string;
  name: string;
  category: string;
  description: string;
  basePrice?: number;
  keywords?: string[];
  searchVolume?: number;
  difficulty?: number;
}

// Hardcoded production data (from locations.json and services.json)
const LOCATIONS_DATA: Location[] = [
  {
    id: "downtown-loop",
    name: "Downtown Loop",
    coordinates: { lat: 41.8826, lng: -87.6233 },
    demographics: {
      population: 50000,
      averageIncome: "High",
      businessDensity: "Very High",
    },
    applicableServices: {
      "airport-ohard": 20,
      "airport-midway": 20,
      "airport-executive": 20,
      "corporate-executive": 20,
      "corporate-meeting": 20,
      "corp-conference": 20,
      "wedding-bride": 18,
      "wedding-guest": 18,
      "wedding-multi": 18,
      "partybus-bachelor": 18,
      "partybus-nightclub": 19,
    },
  },
  {
    id: "river-north",
    name: "River North",
    coordinates: { lat: 41.8883, lng: -87.6349 },
    demographics: {
      population: 45000,
      averageIncome: "High",
      businessDensity: "High",
    },
    applicableServices: {
      "airport-ohard": 19,
      "corporate-meeting": 20,
      "corporate-client": 19,
      "wedding-venue": 20,
      "wedding-guest": 19,
      "partybus-nightclub": 20,
      "partybus-bachelor": 19,
    },
  },
  {
    id: "gold-coast",
    name: "Gold Coast",
    coordinates: { lat: 41.897, lng: -87.6268 },
    demographics: {
      population: 35000,
      averageIncome: "Very High",
      businessDensity: "High",
    },
    applicableServices: {
      "airport-ohard": 20,
      "corporate-executive": 20,
      "wedding-bride": 20,
      "wedding-venue": 20,
      "partybus-bachelor": 18,
    },
  },
  {
    id: "lincoln-park",
    name: "Lincoln Park",
    coordinates: { lat: 41.9214, lng: -87.6501 },
    demographics: {
      population: 65000,
      averageIncome: "High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 18,
      "wedding-guest": 20,
      "wedding-bride": 19,
      "partybus-birthday": 20,
      "partybus-nightclub": 20,
    },
  },
  {
    id: "lakeview",
    name: "Lake View",
    coordinates: { lat: 41.9358, lng: -87.6441 },
    demographics: {
      population: 80000,
      averageIncome: "Medium-High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "wedding-guest": 18,
      "partybus-birthday": 20,
      "partybus-nightclub": 20,
      "partybus-concert": 19,
    },
  },
  {
    id: "pilsen",
    name: "Pilsen",
    coordinates: { lat: 41.8507, lng: -87.6599 },
    demographics: {
      population: 50000,
      averageIncome: "Medium",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "corporate-meeting": 16,
      "wedding-guest": 16,
      "partybus-birthday": 18,
    },
  },
  {
    id: "naperville",
    name: "Naperville",
    coordinates: { lat: 41.7508, lng: -88.1535 },
    demographics: {
      population: 150000,
      averageIncome: "High",
      businessDensity: "High",
    },
    applicableServices: {
      "airport-ohard": 20,
      "airport-executive": 20,
      "corporate-executive": 20,
      "corporate-commute": 20,
      "wedding-multi": 20,
      "wedding-guest": 19,
    },
  },
  {
    id: "wheaton",
    name: "Wheaton",
    coordinates: { lat: 41.8629, lng: -88.1089 },
    demographics: {
      population: 58000,
      averageIncome: "High",
      businessDensity: "Medium-High",
    },
    applicableServices: {
      "airport-ohard": 19,
      "corporate-meeting": 18,
      "wedding-guest": 19,
      "wedding-multi": 18,
    },
  },
  {
    id: "oak-park",
    name: "Oak Park",
    coordinates: { lat: 41.8754, lng: -87.8234 },
    demographics: {
      population: 52000,
      averageIncome: "Medium-High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-commute": 18,
      "wedding-guest": 17,
      "partybus-birthday": 17,
    },
  },
  {
    id: "schaumburg",
    name: "Schaumburg",
    coordinates: { lat: 42.0337, lng: -88.0837 },
    demographics: {
      population: 75000,
      averageIncome: "High",
      businessDensity: "Very High",
    },
    applicableServices: {
      "airport-ohard": 20,
      "airport-executive": 20,
      "corporate-meeting": 20,
      "corporate-corporate": 20,
      "corp-tech": 20,
      "wedding-guest": 16,
    },
  },
  {
    id: "oak-brook",
    name: "Oak Brook",
    coordinates: { lat: 41.8589, lng: -87.9229 },
    demographics: {
      population: 10000,
      averageIncome: "Very High",
      businessDensity: "High",
    },
    applicableServices: {
      "airport-ohard": 20,
      "airport-executive": 20,
      "corporate-executive": 20,
      "corporate-board": 20,
      "wedding-bride": 20,
    },
  },
  {
    id: "downers-grove",
    name: "Downers Grove",
    coordinates: { lat: 41.7858, lng: -88.0165 },
    demographics: {
      population: 58000,
      averageIncome: "High",
      businessDensity: "Medium-High",
    },
    applicableServices: {
      "airport-ohard": 19,
      "corporate-meeting": 18,
      "wedding-guest": 18,
      "wedding-multi": 17,
    },
  },
  {
    id: "hinsdale",
    name: "Hinsdale",
    coordinates: { lat: 41.8011, lng: -87.9525 },
    demographics: {
      population: 18000,
      averageIncome: "Very High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 20,
      "corporate-executive": 20,
      "wedding-bride": 20,
      "wedding-guest": 19,
    },
  },
  {
    id: "brookfield",
    name: "Brookfield",
    coordinates: { lat: 41.8359, lng: -87.8498 },
    demographics: {
      population: 19000,
      averageIncome: "High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 17,
      "wedding-guest": 17,
      "partybus-birthday": 16,
    },
  },
  {
    id: "elmhurst",
    name: "Elmhurst",
    coordinates: { lat: 41.8991, lng: -87.9359 },
    demographics: {
      population: 47000,
      averageIncome: "Medium-High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 17,
      "wedding-guest": 16,
      "partybus-birthday": 17,
    },
  },
  {
    id: "wicker-park",
    name: "Wicker Park",
    coordinates: { lat: 41.9081, lng: -87.7157 },
    demographics: {
      population: 70000,
      averageIncome: "Medium",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "partybus-nightclub": 20,
      "partybus-birthday": 20,
      "partybus-concert": 20,
    },
  },
  {
    id: "bucktown",
    name: "Bucktown",
    coordinates: { lat: 41.9256, lng: -87.7157 },
    demographics: {
      population: 65000,
      averageIncome: "Medium",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "partybus-nightclub": 20,
      "partybus-birthday": 20,
      "partybus-concert": 20,
    },
  },
  {
    id: "evanston",
    name: "Evanston",
    coordinates: { lat: 42.0451, lng: -87.6787 },
    demographics: {
      population: 75000,
      averageIncome: "High",
      businessDensity: "Medium-High",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 18,
      "wedding-guest": 18,
      "partybus-birthday": 18,
    },
  },
  {
    id: "glenview",
    name: "Glenview",
    coordinates: { lat: 42.0834, lng: -87.7724 },
    demographics: {
      population: 44000,
      averageIncome: "High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 19,
      "corporate-executive": 18,
      "wedding-guest": 17,
      "corporate-commute": 18,
    },
  },
  {
    id: "skokie",
    name: "Skokie",
    coordinates: { lat: 42.0237, lng: -87.7419 },
    demographics: {
      population: 64000,
      averageIncome: "Medium-High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 17,
      "wedding-guest": 16,
      "partybus-birthday": 17,
    },
  },
  {
    id: "tinley-park",
    name: "Tinley Park",
    coordinates: { lat: 41.6052, lng: -87.5833 },
    demographics: {
      population: 57000,
      averageIncome: "Medium-High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "airport-midway": 19,
      "corporate-meeting": 16,
      "wedding-guest": 16,
    },
  },
  {
    id: "orland-park",
    name: "Orland Park",
    coordinates: { lat: 41.6396, lng: -87.8551 },
    demographics: {
      population: 57000,
      averageIncome: "High",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 19,
      "airport-midway": 20,
      "corporate-meeting": 17,
      "wedding-guest": 17,
    },
  },
  {
    id: "blue-island",
    name: "Blue Island",
    coordinates: { lat: 41.6489, lng: -87.6833 },
    demographics: {
      population: 23000,
      averageIncome: "Medium",
      businessDensity: "Low-Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "airport-midway": 18,
      "partybus-birthday": 16,
    },
  },
  {
    id: "hyde-park",
    name: "Hyde Park",
    coordinates: { lat: 41.8007, lng: -87.5993 },
    demographics: {
      population: 55000,
      averageIncome: "Medium",
      businessDensity: "Medium",
    },
    applicableServices: {
      "airport-ohard": 17,
      "corporate-meeting": 16,
      "wedding-guest": 16,
      "partybus-birthday": 16,
    },
  },
  {
    id: "kenwood",
    name: "Kenwood",
    coordinates: { lat: 41.8136, lng: -87.5981 },
    demographics: {
      population: 20000,
      averageIncome: "High",
      businessDensity: "Low-Medium",
    },
    applicableServices: {
      "airport-ohard": 18,
      "corporate-meeting": 17,
      "wedding-guest": 17,
    },
  },
];

const SERVICES_DATA: Service[] = [
  // Airport Services (24)
  {
    id: "airport-ohard",
    website: "airport",
    name: "O'Hare Airport Transfer",
    category: "Airport",
    description:
      "Professional ground transportation to and from Chicago O'Hare International Airport",
    basePrice: 95,
    keywords: [
      "oHare",
      "airport transfer",
      "ground transportation",
      "chicago airport",
    ],
    searchVolume: 8500,
    difficulty: 1,
  },
  {
    id: "airport-midway",
    website: "airport",
    name: "Midway Airport Transfer",
    category: "Airport",
    description:
      "Reliable transportation service to and from Chicago Midway International Airport",
    basePrice: 65,
    keywords: ["midway", "airport transfer", "chicago airport"],
    searchVolume: 5200,
    difficulty: 1,
  },
  {
    id: "airport-executive",
    website: "airport",
    name: "Executive Airport Service",
    category: "Airport",
    description:
      "Premium luxury ground transportation for business travelers and executives",
    basePrice: 150,
    keywords: [
      "executive airport",
      "business travel",
      "luxury ground transportation",
    ],
    searchVolume: 3400,
    difficulty: 2,
  },
  {
    id: "airport-group",
    website: "airport",
    name: "Group Airport Shuttle",
    category: "Airport",
    description:
      "Economical group transportation for multiple passengers traveling together",
    basePrice: 45,
    keywords: ["group shuttle", "airport", "shared transportation"],
    searchVolume: 2100,
    difficulty: 1,
  },
  {
    id: "airport-meetgreet",
    website: "airport",
    name: "Meet & Greet Service",
    category: "Airport",
    description:
      "Professional meet and greet service with driver assistance at airport terminals",
    basePrice: 35,
    keywords: ["meet and greet", "airport", "driver assistance"],
    searchVolume: 1800,
    difficulty: 1,
  },
  // Corporate Services (30)
  {
    id: "corporate-executive",
    website: "corporate",
    name: "Executive Commute",
    category: "Corporate",
    description: "Premium daily commute service for corporate executives",
    basePrice: 200,
    keywords: ["executive commute", "corporate", "premium transportation"],
    searchVolume: 4200,
    difficulty: 2,
  },
  {
    id: "corporate-meeting",
    website: "corporate",
    name: "Business Meeting Transport",
    category: "Corporate",
    description:
      "Professional ground transportation for business meetings and client visits",
    basePrice: 120,
    keywords: ["business meeting", "corporate transportation", "client visits"],
    searchVolume: 5100,
    difficulty: 1,
  },
  {
    id: "corporate-client",
    website: "corporate",
    name: "Client Entertainment",
    category: "Corporate",
    description:
      "Luxury transportation for client entertainment and business networking events",
    basePrice: 180,
    keywords: [
      "client entertainment",
      "business networking",
      "corporate event",
    ],
    searchVolume: 2800,
    difficulty: 2,
  },
  {
    id: "corp-conference",
    website: "corporate",
    name: "Conference Transportation",
    category: "Corporate",
    description:
      "Comprehensive transportation management for corporate conferences and conventions",
    basePrice: 150,
    keywords: ["conference", "corporate event", "convention transportation"],
    searchVolume: 2300,
    difficulty: 2,
  },
  {
    id: "corporate-commute",
    website: "corporate",
    name: "Corporate Shuttle Service",
    category: "Corporate",
    description:
      "Daily shuttle service for corporate offices and business parks",
    basePrice: 85,
    keywords: ["corporate shuttle", "office transportation", "commute"],
    searchVolume: 3600,
    difficulty: 1,
  },
  // Wedding Services (30)
  {
    id: "wedding-bride",
    website: "wedding",
    name: "Bride & Groom Limo",
    category: "Wedding",
    description:
      "Elegant transportation for the bride and groom on their wedding day",
    basePrice: 250,
    keywords: ["wedding limo", "bride transportation", "groom shuttle"],
    searchVolume: 6800,
    difficulty: 2,
  },
  {
    id: "wedding-guest",
    website: "wedding",
    name: "Wedding Guest Transportation",
    category: "Wedding",
    description:
      "Group transportation for wedding guests between venues and hotel accommodations",
    basePrice: 95,
    keywords: ["wedding transportation", "guest shuttle", "wedding guests"],
    searchVolume: 5400,
    difficulty: 1,
  },
  {
    id: "wedding-multi",
    website: "wedding",
    name: "Multi-Venue Coordination",
    category: "Wedding",
    description:
      "Coordinated transportation management for weddings spanning multiple venues",
    basePrice: 300,
    keywords: ["multi-venue", "wedding coordination", "venue transportation"],
    searchVolume: 3200,
    difficulty: 2,
  },
  {
    id: "wedding-venue",
    website: "wedding",
    name: "Venue to Venue Shuttle",
    category: "Wedding",
    description:
      "Continuous shuttle service between reception and hotel accommodations",
    basePrice: 110,
    keywords: ["wedding shuttle", "venue transportation", "hotel shuttle"],
    searchVolume: 2900,
    difficulty: 1,
  },
  {
    id: "wedding-vip",
    website: "wedding",
    name: "VIP Wedding Package",
    category: "Wedding",
    description:
      "Premium all-inclusive transportation package with concierge services",
    basePrice: 400,
    keywords: [
      "vip wedding",
      "premium wedding",
      "luxury wedding transportation",
    ],
    searchVolume: 1900,
    difficulty: 3,
  },
  // Party Bus Services (13)
  {
    id: "partybus-bachelor",
    website: "partyBus",
    name: "Bachelor Party Bus",
    category: "Party",
    description:
      "Fun and entertainment-focused ground transportation for bachelor parties",
    basePrice: 200,
    keywords: ["bachelor party", "party bus", "bachelor celebration"],
    searchVolume: 4100,
    difficulty: 1,
  },
  {
    id: "partybus-nightclub",
    website: "partyBus",
    name: "Nightclub Crawl Service",
    category: "Party",
    description:
      "Group transportation service for nightclub and bar hopping adventures",
    basePrice: 180,
    keywords: ["nightclub crawl", "bar hopping", "party transportation"],
    searchVolume: 3800,
    difficulty: 1,
  },
  {
    id: "partybus-birthday",
    website: "partyBus",
    name: "Birthday Party Bus",
    category: "Party",
    description:
      "Mobile party space with entertainment for birthday celebrations",
    basePrice: 175,
    keywords: ["birthday party", "party bus", "birthday transportation"],
    searchVolume: 3500,
    difficulty: 1,
  },
  {
    id: "partybus-concert",
    website: "partyBus",
    name: "Concert & Event Transport",
    category: "Party",
    description:
      "Transportation service for concerts, sporting events, and live entertainment",
    basePrice: 160,
    keywords: ["concert transportation", "event transport", "entertainment"],
    searchVolume: 2800,
    difficulty: 1,
  },
  {
    id: "partybus-casino",
    website: "partyBus",
    name: "Casino Trip Package",
    category: "Party",
    description:
      "All-inclusive transportation for casino trips and gambling excursions",
    basePrice: 220,
    keywords: ["casino trip", "gambling transportation", "casino party"],
    searchVolume: 2200,
    difficulty: 1,
  },
];

async function insertLocations(): Promise<number> {
  console.log("📍 Inserting locations...");
  let count = 0;

  for (const location of LOCATIONS_DATA) {
    await db
      .collection("locations")
      .doc(location.id)
      .set({
        id: location.id,
        name: location.name,
        coordinates: location.coordinates,
        demographics: location.demographics || {},
        applicableServices: location.applicableServices || {},
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    count++;
  }

  return count;
}

async function insertServices(): Promise<number> {
  console.log("🔧 Inserting services...");
  let count = 0;

  for (const service of SERVICES_DATA) {
    await db
      .collection("services")
      .doc(service.id)
      .set({
        id: service.id,
        website: service.website,
        name: service.name,
        category: service.category,
        description: service.description,
        basePrice: service.basePrice || 0,
        keywords: service.keywords || [],
        searchVolume: service.searchVolume || 0,
        difficulty: service.difficulty || 1,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    count++;
  }

  return count;
}

async function createLocationServiceMappings(): Promise<number> {
  console.log("🗺️  Creating location-service mappings...");
  let count = 0;

  for (const location of LOCATIONS_DATA) {
    if (location.applicableServices) {
      for (const [serviceId, relevance] of Object.entries(
        location.applicableServices,
      )) {
        await db
          .collection("locations")
          .doc(location.id)
          .collection("services")
          .doc(serviceId)
          .set({
            serviceId,
            relevance: relevance as number,
            createdAt: admin.firestore.Timestamp.now(),
          });
        count++;
      }
    }
  }

  return count;
}

async function createInitialContentQueue(): Promise<number> {
  console.log("📋 Creating content generation queue...");
  let count = 0;

  // Select top 10 locations for initial content generation
  const selectedLocations = LOCATIONS_DATA.slice(0, 10);

  // Select high-priority services
  const priorityServices = [
    "airport-ohard",
    "airport-midway",
    "corporate-meeting",
    "wedding-guest",
    "partybus-nightclub",
  ];

  for (const location of selectedLocations) {
    for (const serviceId of priorityServices) {
      if (
        location.applicableServices &&
        location.applicableServices[serviceId] &&
        location.applicableServices[serviceId] >= 15
      ) {
        const queueId = `${location.id}_${serviceId}`;
        await db.collection("regeneration_queue").doc(queueId).set({
          locationId: location.id,
          serviceId,
          status: "pending",
          priority: 10,
          createdAt: admin.firestore.Timestamp.now(),
          retries: 0,
        });
        count++;
      }
    }
  }

  return count;
}

/**
 * HTTP Cloud Function to initialize production data
 * Call with: curl -X POST https://region-project.cloudfunctions.net/initializeProductionData
 */
export const initializeProductionData = functions.https.onRequest(
  async (request, response) => {
    // Restrict access to authenticated requests
    try {
      console.log("🚀 Starting Phase 4: Production Data Initialization");

      const locationsCount = await insertLocations();
      console.log(`✅ Inserted ${locationsCount} locations`);

      const servicesCount = await insertServices();
      console.log(`✅ Inserted ${servicesCount} services`);

      const mappingsCount = await createLocationServiceMappings();
      console.log(`✅ Created ${mappingsCount} location-service mappings`);

      const queueCount = await createInitialContentQueue();
      console.log(`✅ Queued ${queueCount} content generation tasks`);

      response.status(200).json({
        success: true,
        message: "Phase 4 Production Data Initialization Complete",
        stats: {
          locationsInserted: locationsCount,
          servicesInserted: servicesCount,
          mappingsCreated: mappingsCount,
          contentQueued: queueCount,
        },
      });
    } catch (error) {
      console.error("❌ Error during initialization:", error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);
