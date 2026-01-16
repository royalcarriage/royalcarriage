/**
 * Cloud Function to expand locations from 25 to 173+
 * Initializes all Chicago neighborhoods and suburbs
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CHICAGO_NEIGHBORHOODS, LocationData } from './expandLocations';
import { NORTHERN_SUBURBS, WESTERN_SUBURBS, SOUTHERN_SUBURBS } from './expandLocationsData';

const db = admin.firestore();

/**
 * Insert all location data into Firestore
 */
async function insertAllLocations(): Promise<number> {
  console.log('🚀 Starting location expansion...');

  // Combine all location arrays
  const allLocations: LocationData[] = [
    ...CHICAGO_NEIGHBORHOODS,
    ...NORTHERN_SUBURBS,
    ...WESTERN_SUBURBS,
    ...SOUTHERN_SUBURBS,
  ];

  console.log(`📊 Total locations to insert: ${allLocations.length}`);
  console.log(`  - Chicago neighborhoods: ${CHICAGO_NEIGHBORHOODS.length}`);
  console.log(`  - Northern suburbs: ${NORTHERN_SUBURBS.length}`);
  console.log(`  - Western suburbs: ${WESTERN_SUBURBS.length}`);
  console.log(`  - Southern suburbs: ${SOUTHERN_SUBURBS.length}`);

  let inserted = 0;
  const batchSize = 400; // Firestore batch limit is 500, use 400 to be safe

  // Process in batches
  for (let i = 0; i < allLocations.length; i += batchSize) {
    const batch = db.batch();
    const chunk = allLocations.slice(i, i + batchSize);

    for (const location of chunk) {
      const docRef = db.collection('locations').doc(location.id);
      batch.set(docRef, {
        id: location.id,
        name: location.name,
        state: location.state,
        type: location.type,
        region: location.region,
        coordinates: location.coordinates,
        zipCodes: location.zipCodes,
        nearbyAirports: location.nearbyAirports,
        applicableServices: location.applicableServices,
        description: location.description,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
      inserted++;
    }

    await batch.commit();
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${chunk.length} locations)`);
  }

  console.log(`✅ Total locations inserted: ${inserted}`);
  return inserted;
}

/**
 * Create location-service mappings for all applicable services
 */
async function createLocationServiceMappings(): Promise<number> {
  console.log('\n🗺️  Creating location-service mappings...');

  const allLocations: LocationData[] = [
    ...CHICAGO_NEIGHBORHOODS,
    ...NORTHERN_SUBURBS,
    ...WESTERN_SUBURBS,
    ...SOUTHERN_SUBURBS,
  ];

  // Map service types to actual service IDs from the system
  const serviceMapping: { [key: string]: string[] } = {
    airport: [
      'airport-ohare-transfer',
      'airport-midway-transfer',
      'airport-meigs-field-transfer',
      'airport-suburban-hotel',
    ],
    corporate: [
      'corporate-executive',
      'corporate-meeting',
      'corporate-client',
      'corp-conference',
      'corporate-commute',
    ],
    wedding: [
      'wedding-bride',
      'wedding-guest',
      'wedding-multi',
      'wedding-venue',
      'wedding-vip',
    ],
    partyBus: [
      'partybus-bachelor',
      'partybus-nightclub',
      'partybus-birthday',
      'partybus-concert',
      'partybus-casino',
    ],
  };

  let mappingCount = 0;
  const batchSize = 400;
  const mappings: Array<{ locationId: string; serviceId: string; relevance: number }> = [];

  // Build all mappings
  for (const location of allLocations) {
    if (location.applicableServices) {
      for (const [serviceType, relevance] of Object.entries(location.applicableServices)) {
        const serviceIds = serviceMapping[serviceType] || [];
        for (const serviceId of serviceIds) {
          mappings.push({
            locationId: location.id,
            serviceId,
            relevance: relevance as number,
          });
        }
      }
    }
  }

  console.log(`📋 Total mappings to create: ${mappings.length}`);

  // Insert mappings in batches
  for (let i = 0; i < mappings.length; i += batchSize) {
    const batch = db.batch();
    const chunk = mappings.slice(i, i + batchSize);

    for (const mapping of chunk) {
      const docRef = db
        .collection('locations')
        .doc(mapping.locationId)
        .collection('services')
        .doc(mapping.serviceId);

      batch.set(docRef, {
        serviceId: mapping.serviceId,
        relevance: mapping.relevance,
        createdAt: admin.firestore.Timestamp.now(),
      });
      mappingCount++;
    }

    await batch.commit();
    console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1} (${chunk.length} mappings)`);
  }

  console.log(`✅ Total mappings created: ${mappingCount}`);
  return mappingCount;
}

/**
 * Create initial content generation queue for high-priority locations
 */
async function createContentQueue(): Promise<number> {
  console.log('\n📋 Creating content generation queue...');

  const allLocations: LocationData[] = [
    ...CHICAGO_NEIGHBORHOODS,
    ...NORTHERN_SUBURBS,
    ...WESTERN_SUBURBS,
    ...SOUTHERN_SUBURBS,
  ];

  // Select locations with high airport service relevance for initial content
  const priorityLocations = allLocations.filter(
    (loc) =>
      loc.applicableServices?.airport &&
      loc.applicableServices.airport >= 18
  );

  console.log(`🎯 Priority locations for queue: ${priorityLocations.length}`);

  const priorityServices = [
    'airport-ohare-transfer',
    'airport-midway-transfer',
    'corporate-meeting',
    'wedding-guest',
    'partybus-nightclub',
  ];

  let queueCount = 0;
  const batch = db.batch();

  for (const location of priorityLocations) {
    for (const serviceId of priorityServices) {
      const queueId = `${location.id}_${serviceId}`;
      const queueRef = db.collection('regeneration_queue').doc(queueId);

      batch.set(queueRef, {
        locationId: location.id,
        serviceId,
        status: 'pending',
        priority: 10,
        createdAt: admin.firestore.Timestamp.now(),
        retries: 0,
      });
      queueCount++;
    }
  }

  await batch.commit();
  console.log(`✅ Queued ${queueCount} content generation tasks`);
  return queueCount;
}

/**
 * HTTP Cloud Function to initialize expanded locations
 */
export const initializeExpandedLocations = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https.onRequest(async (request, response) => {
    try {
      console.log('🚀 Starting Location Expansion to 173+ locations\n');
      const startTime = Date.now();

      // Step 1: Insert all locations
      const locationsInserted = await insertAllLocations();

      // Step 2: Create location-service mappings
      const mappingsCreated = await createLocationServiceMappings();

      // Step 3: Create content generation queue
      const queuedTasks = await createContentQueue();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n' + '='.repeat(60));
      console.log('✅ LOCATION EXPANSION COMPLETE');
      console.log('='.repeat(60));
      console.log(`📍 Locations inserted: ${locationsInserted}`);
      console.log(`🗺️  Location-service mappings created: ${mappingsCreated}`);
      console.log(`📋 Content generation tasks queued: ${queuedTasks}`);
      console.log(`⏱️  Duration: ${duration}s`);
      console.log('='.repeat(60));

      response.status(200).json({
        success: true,
        message: 'Location expansion completed successfully',
        stats: {
          locationsInserted,
          mappingsCreated,
          queuedTasks,
          durationSeconds: parseFloat(duration),
        },
        breakdown: {
          chicagoNeighborhoods: CHICAGO_NEIGHBORHOODS.length,
          northernSuburbs: NORTHERN_SUBURBS.length,
          westernSuburbs: WESTERN_SUBURBS.length,
          southernSuburbs: SOUTHERN_SUBURBS.length,
        },
      });
    } catch (error) {
      console.error('❌ Error during location expansion:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
