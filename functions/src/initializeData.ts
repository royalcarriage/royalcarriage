/**
 * Cloud Function: initializeData
 * Purpose: Initialize Firestore database with locations, services, and fleet data
 * Trigger: Manual - HTTP callable or Admin-initiated
 * Usage: Call once to populate database with enterprise data
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface Location {
  id: string;
  name: string;
  state: string;
  type: "neighborhood" | "suburb";
  region: string;
  coordinates: { lat: number; lng: number };
  zipCodes: string[];
  population: number;
  description: string;
  landmarks: string[];
  nearbyAirports: {
    primary: { name: string; code: string; distance: number };
    secondary: { name: string; code: string; distance: number };
  };
  demographics: {
    medianIncome: string;
    businessDensity: string;
    touristAttraction?: string;
  };
  weddingVenues: number;
  hotels: number;
  restaurants: number;
  applicableServices: {
    airport: number;
    corporate: number;
    wedding: number;
    partyBus: number;
  };
}

interface Service {
  id: string;
  website: "airport" | "corporate" | "wedding" | "partyBus";
  name: string;
  category: string;
  description: string;
  longDescription: string;
  basePrice: number;
  pricingModel: string;
  applicableVehicles: string[];
  relatedServices: string[];
  keywords: string[];
  searchVolume: number;
  difficulty: string;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
  capacity: number;
  baseHourlyRate: number;
  baseAirportRate: number;
  description: string;
  features: string[];
  applicableServices: string[];
  imageUrl: string;
  seoKeywords: string[];
  availability: { weekday: boolean; weekend: boolean; available24_7: boolean };
}

// Hardcoded data (in production, load from JSON files or external API)
const locationsData: Location[] = [
  {
    id: "chicago-downtown-loop",
    name: "Downtown Chicago - Loop",
    state: "IL",
    type: "neighborhood",
    region: "downtown",
    coordinates: { lat: 41.8819, lng: -87.6278 },
    zipCodes: ["60601", "60602", "60603"],
    population: 15000,
    description: "The heart of Chicago's business district, home to iconic skyscrapers, the Chicago Stock Exchange, and world-class dining and entertainment.",
    landmarks: ["Willis Tower", "Chicago Board of Trade", "Thompson Center", "Millennium Park"],
    nearbyAirports: { primary: { name: "Chicago O'Hare", code: "ORD", distance: 18 }, secondary: { name: "Chicago Midway", code: "MDW", distance: 20 } },
    demographics: { medianIncome: "high", businessDensity: "very-high", touristAttraction: "high" },
    weddingVenues: 25,
    hotels: 40,
    restaurants: 200,
    applicableServices: { airport: 20, corporate: 20, wedding: 18, partyBus: 15 },
  },
  {
    id: "naperville",
    name: "Naperville",
    state: "IL",
    type: "suburb",
    region: "western-suburbs",
    coordinates: { lat: 41.7658, lng: -88.1477 },
    zipCodes: ["60540", "60563", "60564"],
    population: 141853,
    description: "Upscale western suburb known for fine dining, shopping, beautiful riverwalk, and excellent schools.",
    landmarks: ["Riverwalk", "Millennium Carillon", "Knoch Park", "Mayslake Peabody Estate", "Naper Settlement"],
    nearbyAirports: { primary: { name: "Chicago O'Hare", code: "ORD", distance: 28 }, secondary: { name: "Chicago Midway", code: "MDW", distance: 35 } },
    demographics: { medianIncome: "very-high", businessDensity: "medium-high", touristAttraction: "high" },
    weddingVenues: 15,
    hotels: 12,
    restaurants: 85,
    applicableServices: { airport: 20, corporate: 18, wedding: 19, partyBus: 17 },
  },
];

const servicesData: Service[] = [
  {
    id: "airport-ohare-transfer",
    website: "airport",
    name: "O'Hare Airport Transfer",
    category: "airport-transfer",
    description: "Professional limousine service to and from Chicago O'Hare International Airport with flight tracking and real-time updates",
    longDescription: "Our O'Hare airport transfer service ensures stress-free travel to Chicago's largest airport. We monitor flight schedules to provide timely pickups, ensuring you never miss your departure.",
    basePrice: 75,
    pricingModel: "flat-rate",
    applicableVehicles: ["lincoln-continental", "cadillac-xts", "escalade-suv", "sprinter-14"],
    relatedServices: ["midway-airport-transfer", "airport-downtown-hotel", "airport-business-meeting"],
    keywords: ["O'Hare airport limo", "Chicago O'Hare transportation", "O'Hare limousine service", "ORD airport transfer"],
    searchVolume: 2200,
    difficulty: "high",
  },
];

const fleetData: Vehicle[] = [
  {
    id: "lincoln-continental",
    name: "Lincoln Continental",
    category: "luxury-sedan",
    capacity: 3,
    baseHourlyRate: 95,
    baseAirportRate: 75,
    description: "Premium luxury sedan with elegant lines, advanced technology, and supremely comfortable seating for executive travel.",
    features: ["leather-seats", "climate-control", "premium-sound-system", "wifi", "charging-ports", "privacy-partition"],
    applicableServices: ["airport-ohare-transfer", "airport-midway-transfer", "business-meeting-transport"],
    imageUrl: "gs://bucket/lincoln-continental.jpg",
    seoKeywords: ["Lincoln Continental rental Chicago", "luxury sedan service", "executive car rental"],
    availability: { weekday: true, weekend: true, available24_7: true },
  },
];

export const initializeData = functions.https.onCall(async (data, context) => {
  // Verify admin context
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can initialize data");
  }

  const db = admin.firestore();
  let initialized = 0;

  try {
    // Initialize locations collection
    functions.logger.info("Starting locations initialization...");
    for (const location of locationsData) {
      await db.collection("locations").doc(location.id).set({
        ...location,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        contentGenerated: false,
        approvalStatus: "pending",
      });
      initialized++;
    }
    functions.logger.info(`Initialized ${initialized} locations`);

    // Initialize services collection
    functions.logger.info("Starting services initialization...");
    let serviceCount = 0;
    for (const service of servicesData) {
      await db.collection("services").doc(service.id).set({
        ...service,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      serviceCount++;
    }
    functions.logger.info(`Initialized ${serviceCount} services`);

    // Initialize fleet collection
    functions.logger.info("Starting fleet initialization...");
    let vehicleCount = 0;
    for (const vehicle of fleetData) {
      await db.collection("fleet_vehicles").doc(vehicle.id).set({
        ...vehicle,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      vehicleCount++;
    }
    functions.logger.info(`Initialized ${vehicleCount} fleet vehicles`);

    return {
      success: true,
      message: `Database initialized successfully`,
      stats: {
        locationsInitialized: initialized,
        servicesInitialized: serviceCount,
        vehiclesInitialized: vehicleCount,
      },
    };
  } catch (error) {
    functions.logger.error("Error initializing data:", error);
    throw new functions.https.HttpsError("internal", `Initialization failed: ${error}`);
  }
});

/**
 * Cloud Function: seedLocationServiceMappings
 * Purpose: Create mappings between locations and applicable services
 * This enables efficient querying of "all services available in Location X"
 */
export const seedLocationServiceMappings = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can seed mappings");
  }

  const db = admin.firestore();

  try {
    functions.logger.info("Creating location-service mappings...");

    // For each location, create service-location mappings
    const locations = await db.collection("locations").get();
    let mappingCount = 0;

    for (const locDoc of locations.docs) {
      const location = locDoc.data() as Location;
      const services = await db.collection("services").get();

      for (const serviceDoc of services.docs) {
        const service = serviceDoc.data() as Service;

        // Create mapping if service is applicable to location
        const serviceType = service.website as keyof typeof location.applicableServices;
        if (location.applicableServices[serviceType] > 0) {
          const mappingId = `${location.id}-${service.id}`;

          await db.collection("page_mappings").doc(mappingId).set({
            locationId: location.id,
            serviceId: service.id,
            websiteId: service.website,
            locationName: location.name,
            serviceName: service.name,
            pagePath: `/service/${service.id}/${location.id}`,
            status: "draft",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          mappingCount++;
        }
      }
    }

    functions.logger.info(`Created ${mappingCount} location-service mappings`);

    return {
      success: true,
      message: `Created ${mappingCount} location-service mappings`,
    };
  } catch (error) {
    functions.logger.error("Error seeding mappings:", error);
    throw new functions.https.HttpsError("internal", `Mapping seeding failed: ${error}`);
  }
});

/**
 * Cloud Function: createCollectionIndexes
 * Purpose: Ensure all required Firestore collections and indexes exist
 */
export const createCollectionIndexes = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can create indexes");
  }

  const db = admin.firestore();

  try {
    // Create collection references (documents will be auto-created on first write)
    const collections = [
      "locations",
      "services",
      "fleet_vehicles",
      "page_mappings",
      "service_content",
      "content_approval_queue",
    ];

    for (const collection of collections) {
      // Create a sentinel document to ensure collection exists
      await db.collection(collection).doc("_system_sentinel").set(
        {
          _type: "sentinel",
          _created: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    functions.logger.info("Collection indexes created successfully");

    return {
      success: true,
      message: "Collection indexes created",
      collections: collections,
    };
  } catch (error) {
    functions.logger.error("Error creating indexes:", error);
    throw new functions.https.HttpsError("internal", `Index creation failed: ${error}`);
  }
});
