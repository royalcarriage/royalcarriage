/**
 * Cloud Function: Initialize Expanded Services
 * Expands services from 20 to 80 total (20 per website)
 * Callable function for admin dashboard
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  initializeServices,
  validateServiceData,
  ALL_SERVICES,
  AIRPORT_SERVICES,
  CORPORATE_SERVICES,
  WEDDING_SERVICES,
  PARTY_BUS_SERVICES
} from './scripts/expandServices';

const db = admin.firestore();

/**
 * Initialize Expanded Services - Main Cloud Function
 * Callable HTTPS function that populates Firestore with 80 services
 */
export const initializeExpandedServices = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to initialize services'
    );
  }

  // Verify admin role
  if (!context.auth.token.admin && context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can initialize services'
    );
  }

  try {
    functions.logger.info('Starting expanded services initialization', {
      userId: context.auth.uid,
      timestamp: new Date().toISOString()
    });

    // Validate service data first
    const validation = validateServiceData();
    if (!validation.valid) {
      functions.logger.error('Service validation failed', { errors: validation.errors });
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Service validation failed: ${validation.errors.join(', ')}`
      );
    }

    // Check if services already exist
    const existingServicesSnapshot = await db.collection('services').limit(1).get();
    const forceOverwrite = data?.forceOverwrite === true;

    if (!existingServicesSnapshot.empty && !forceOverwrite) {
      return {
        success: false,
        message: 'Services already exist. Use forceOverwrite=true to reinitialize.',
        existingCount: existingServicesSnapshot.size,
      };
    }

    // If force overwrite, clear existing services
    if (forceOverwrite) {
      functions.logger.info('Force overwrite enabled, clearing existing services');
      const existingServices = await db.collection('services').get();
      const deletePromises = existingServices.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      functions.logger.info(`Deleted ${existingServices.size} existing services`);
    }

    // Initialize services
    const servicesInitialized = await initializeServices(db);

    functions.logger.info('Services initialization completed successfully', {
      totalServices: servicesInitialized,
      airportServices: AIRPORT_SERVICES.length,
      corporateServices: CORPORATE_SERVICES.length,
      weddingServices: WEDDING_SERVICES.length,
      partyBusServices: PARTY_BUS_SERVICES.length
    });

    return {
      success: true,
      message: 'Successfully initialized expanded services',
      stats: {
        total: servicesInitialized,
        byWebsite: {
          airport: AIRPORT_SERVICES.length,
          corporate: CORPORATE_SERVICES.length,
          wedding: WEDDING_SERVICES.length,
          partyBus: PARTY_BUS_SERVICES.length
        }
      }
    };
  } catch (error) {
    functions.logger.error('Failed to initialize expanded services', { error });
    throw new functions.https.HttpsError(
      'internal',
      `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * Get Service Statistics
 * Returns current service counts and statistics
 */
export const getServiceStatistics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const servicesSnapshot = await db.collection('services').get();

    const stats = {
      total: servicesSnapshot.size,
      byWebsite: {
        airport: 0,
        corporate: 0,
        wedding: 0,
        partyBus: 0
      },
      byCategory: {} as Record<string, number>
    };

    servicesSnapshot.docs.forEach(doc => {
      const service = doc.data();

      // Count by website
      if (service.website) {
        stats.byWebsite[service.website as keyof typeof stats.byWebsite]++;
      }

      // Count by category
      if (service.category) {
        stats.byCategory[service.category] = (stats.byCategory[service.category] || 0) + 1;
      }
    });

    return {
      success: true,
      stats,
      expectedTotal: 80,
      isComplete: stats.total === 80
    };
  } catch (error) {
    functions.logger.error('Failed to get service statistics', { error });
    throw new functions.https.HttpsError(
      'internal',
      `Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * Validate Services
 * Validates existing services in Firestore against expected structure
 */
export const validateServices = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const servicesSnapshot = await db.collection('services').get();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check total count
    if (servicesSnapshot.size !== 80) {
      errors.push(`Expected 80 services, found ${servicesSnapshot.size}`);
    }

    // Validate each service
    servicesSnapshot.docs.forEach(doc => {
      const service = doc.data();
      const serviceId = doc.id;

      // Required fields
      if (!service.name) errors.push(`Service ${serviceId} missing name`);
      if (!service.website) errors.push(`Service ${serviceId} missing website`);
      if (!service.description) errors.push(`Service ${serviceId} missing description`);
      if (!service.category) warnings.push(`Service ${serviceId} missing category`);

      // Recommended fields
      if (!service.seoKeywords || service.seoKeywords.length === 0) {
        warnings.push(`Service ${serviceId} missing SEO keywords`);
      }
      if (!service.pricing) {
        warnings.push(`Service ${serviceId} missing pricing information`);
      }
      if (!service.applicableVehicles || service.applicableVehicles.length === 0) {
        warnings.push(`Service ${serviceId} missing applicable vehicles`);
      }
    });

    return {
      success: errors.length === 0,
      valid: errors.length === 0,
      totalServices: servicesSnapshot.size,
      errors,
      warnings,
      summary: {
        criticalIssues: errors.length,
        warnings: warnings.length,
        servicesValidated: servicesSnapshot.size
      }
    };
  } catch (error) {
    functions.logger.error('Failed to validate services', { error });
    throw new functions.https.HttpsError(
      'internal',
      `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * Get Service by ID
 * Retrieves a specific service with all details
 */
export const getServiceById = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { serviceId } = data;

  if (!serviceId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'serviceId is required'
    );
  }

  try {
    const serviceDoc = await db.collection('services').doc(serviceId).get();

    if (!serviceDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Service with ID ${serviceId} not found`
      );
    }

    return {
      success: true,
      service: {
        id: serviceDoc.id,
        ...serviceDoc.data()
      }
    };
  } catch (error) {
    functions.logger.error('Failed to get service', { serviceId, error });
    throw new functions.https.HttpsError(
      'internal',
      `Failed to retrieve service: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * List Services by Website
 * Returns all services for a specific website
 */
export const listServicesByWebsite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { website } = data;

  if (!website) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'website parameter is required (airport, corporate, wedding, or partyBus)'
    );
  }

  const validWebsites = ['airport', 'corporate', 'wedding', 'partyBus'];
  if (!validWebsites.includes(website)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Invalid website. Must be one of: ${validWebsites.join(', ')}`
    );
  }

  try {
    const servicesSnapshot = await db
      .collection('services')
      .where('website', '==', website)
      .get();

    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      website,
      count: services.length,
      services
    };
  } catch (error) {
    functions.logger.error('Failed to list services by website', { website, error });
    throw new functions.https.HttpsError(
      'internal',
      `Failed to retrieve services: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
