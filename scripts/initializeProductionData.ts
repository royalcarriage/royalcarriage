/**
 * Phase 4: Production Data Initialization Script
 * Loads locations and services from JSON files and populates Firestore
 * Usage: npx ts-node scripts/initializeProductionData.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
}

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

async function loadJSON<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    throw error;
  }
}

async function insertLocations(locations: Location[]): Promise<number> {
  console.log(`\n📍 Inserting ${locations.length} locations...`);
  let inserted = 0;
  const batch = db.batch();

  for (const location of locations) {
    const docRef = db.collection('locations').doc(location.id);
    batch.set(docRef, {
      id: location.id,
      name: location.name,
      coordinates: location.coordinates,
      demographics: location.demographics || {},
      applicableServices: location.applicableServices || {},
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    inserted++;
  }

  try {
    await batch.commit();
    console.log(`✅ Successfully inserted ${inserted} locations`);
    return inserted;
  } catch (error) {
    console.error('Error inserting locations:', error);
    throw error;
  }
}

async function insertServices(services: Service[]): Promise<number> {
  console.log(`\n🔧 Inserting ${services.length} services...`);
  let inserted = 0;
  const batch = db.batch();

  for (const service of services) {
    const docRef = db.collection('services').doc(service.id);
    batch.set(docRef, {
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
    inserted++;
  }

  try {
    await batch.commit();
    console.log(`✅ Successfully inserted ${inserted} services`);
    return inserted;
  } catch (error) {
    console.error('Error inserting services:', error);
    throw error;
  }
}

async function createLocationServiceMappings(
  locations: Location[],
  services: Service[]
): Promise<number> {
  console.log(`\n🗺️  Creating location-service mappings...`);
  let created = 0;
  const mappings: Array<{ locationId: string; serviceId: string; relevance: number }> = [];

  // Create mappings based on applicableServices in locations
  for (const location of locations) {
    if (location.applicableServices) {
      for (const [serviceId, relevance] of Object.entries(location.applicableServices)) {
        mappings.push({
          locationId: location.id,
          serviceId,
          relevance: relevance as number,
        });
      }
    }
  }

  // Batch insert mappings (Firestore has 500 write limit per batch)
  const batchSize = 400;
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
      created++;
    }

    await batch.commit();
  }

  console.log(`✅ Created ${created} location-service mappings`);
  return created;
}

async function createInitialContentQueue(
  locations: Location[],
  services: Service[]
): Promise<number> {
  console.log(`\n📋 Creating initial content generation queue...`);

  // Select top locations and high-priority services for initial content generation
  const topLocations = locations.slice(0, 10);
  const priorityServices = services
    .filter((s) => s.difficulty && s.difficulty <= 2)
    .slice(0, 5);

  let queued = 0;
  const batch = db.batch();

  for (const location of topLocations) {
    for (const service of priorityServices) {
      if (
        location.applicableServices &&
        location.applicableServices[service.id] &&
        location.applicableServices[service.id] >= 15
      ) {
        const queueRef = db.collection('regeneration_queue').doc();
        batch.set(queueRef, {
          locationId: location.id,
          serviceId: service.id,
          status: 'pending',
          priority: 10,
          createdAt: admin.firestore.Timestamp.now(),
          retries: 0,
        });
        queued++;
      }
    }
  }

  try {
    await batch.commit();
    console.log(
      `✅ Queued ${queued} content generation tasks (${topLocations.length} locations × services)`
    );
    return queued;
  } catch (error) {
    console.error('Error creating queue:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Phase 4: Production Data Initialization\n');

  try {
    // Load master data
    console.log('📂 Loading master data files...');
    const locations = await loadJSON<Location[]>('data/locations.json');
    const services = await loadJSON<Service[]>('data/services.json');

    console.log(`✅ Loaded ${locations.length} locations and ${services.length} services`);

    // Insert data into Firestore
    const locationsInserted = await insertLocations(locations);
    const servicesInserted = await insertServices(services);
    const mappingsCreated = await createLocationServiceMappings(locations, services);
    const queuedTasks = await createInitialContentQueue(locations, services);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ PHASE 4 DATA INITIALIZATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`📍 Locations inserted: ${locationsInserted}`);
    console.log(`🔧 Services inserted: ${servicesInserted}`);
    console.log(`🗺️  Location-service mappings created: ${mappingsCreated}`);
    console.log(`📋 Content generation tasks queued: ${queuedTasks}`);
    console.log('\n✨ System is ready for content generation and quality scoring!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run generate-content');
    console.log('2. Run: npm run score-quality');
    console.log('3. Check admin dashboard for real data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }
}

main();
