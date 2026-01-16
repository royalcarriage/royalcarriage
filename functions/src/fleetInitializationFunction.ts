/**
 * Cloud Function: initializeFleetVehicles
 * Purpose: Initialize fleet_vehicles collection with complete Royal Carriage fleet
 * Trigger: HTTP Callable - Admin initiated
 *
 * This function populates the fleet_vehicles Firestore collection with 14 vehicles:
 * - 4 Luxury Sedans
 * - 4 Luxury SUVs
 * - 1 Stretch Limousine
 * - 2 Executive Vans
 * - 2 Party Buses
 * - 1 Coach Bus
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFleetVehicles, FleetVehicle } from './scripts/addFleetVehicles';

/**
 * Initialize fleet vehicles in Firestore
 * Callable function that can be invoked from the admin dashboard
 */
export const initializeFleetVehicles = functions.https.onCall(async (data, context) => {
  // Security: Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to initialize fleet vehicles'
    );
  }

  // Security: Require admin role
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can initialize fleet vehicles'
    );
  }

  functions.logger.info('Starting fleet vehicles initialization', {
    userId: context.auth.uid,
    userEmail: context.auth.token.email,
  });

  try {
    const db = admin.firestore();
    const fleetVehicles = getFleetVehicles();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Options from request
    const options = {
      overwrite: data?.overwrite || false, // Whether to overwrite existing vehicles
      dryRun: data?.dryRun || false, // Test mode - don't actually write
    };

    functions.logger.info('Initialization options', options);

    // Check if collection already has data
    const existingVehiclesSnapshot = await db.collection('fleet_vehicles').limit(1).get();
    const hasExistingData = !existingVehiclesSnapshot.empty;

    if (hasExistingData && !options.overwrite) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Fleet vehicles already exist. Use overwrite option to replace existing data.'
      );
    }

    const results = {
      total: fleetVehicles.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ vehicleId: string; error: string }>,
      vehicles: [] as Array<{ id: string; name: string; category: string }>,
    };

    // Process each vehicle
    for (const vehicle of fleetVehicles) {
      try {
        const vehicleRef = db.collection('fleet_vehicles').doc(vehicle.id);

        // Prepare document data
        const vehicleData = {
          ...vehicle,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: context.auth.uid,
          status: 'active',
        };

        if (options.dryRun) {
          functions.logger.info(`[DRY RUN] Would create/update vehicle: ${vehicle.id}`);
          results.created++;
        } else {
          // Check if vehicle already exists
          const existingVehicle = await vehicleRef.get();

          if (existingVehicle.exists && !options.overwrite) {
            results.skipped++;
            functions.logger.info(`Skipped existing vehicle: ${vehicle.id}`);
          } else {
            // Create or update vehicle
            await vehicleRef.set(vehicleData, { merge: options.overwrite });

            if (existingVehicle.exists) {
              results.updated++;
              functions.logger.info(`Updated vehicle: ${vehicle.id}`);
            } else {
              results.created++;
              functions.logger.info(`Created vehicle: ${vehicle.id}`);
            }
          }
        }

        // Track vehicle in results
        results.vehicles.push({
          id: vehicle.id,
          name: vehicle.name,
          category: vehicle.category,
        });

      } catch (error: any) {
        functions.logger.error(`Error processing vehicle ${vehicle.id}:`, error);
        results.errors.push({
          vehicleId: vehicle.id,
          error: error.message || 'Unknown error',
        });
      }
    }

    // Log audit trail
    if (!options.dryRun) {
      await db.collection('audit_logs').add({
        action: 'fleet_vehicles_initialized',
        userId: context.auth.uid,
        userEmail: context.auth.token.email,
        timestamp,
        results: {
          total: results.total,
          created: results.created,
          updated: results.updated,
          skipped: results.skipped,
          errorCount: results.errors.length,
        },
      });
    }

    functions.logger.info('Fleet vehicles initialization completed', results);

    return {
      success: true,
      message: options.dryRun
        ? 'Dry run completed - no data was written'
        : 'Fleet vehicles initialized successfully',
      results,
    };

  } catch (error: any) {
    functions.logger.error('Fleet vehicles initialization failed:', error);

    throw new functions.https.HttpsError(
      'internal',
      `Failed to initialize fleet vehicles: ${error.message}`,
      { error: error.message }
    );
  }
});

/**
 * Get fleet vehicle by ID
 * Callable function to retrieve a specific vehicle
 */
export const getFleetVehicle = functions.https.onCall(async (data, context) => {
  const vehicleId = data?.vehicleId;

  if (!vehicleId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'vehicleId is required'
    );
  }

  try {
    const db = admin.firestore();
    const vehicleDoc = await db.collection('fleet_vehicles').doc(vehicleId).get();

    if (!vehicleDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Vehicle with ID ${vehicleId} not found`
      );
    }

    return {
      success: true,
      vehicle: {
        id: vehicleDoc.id,
        ...vehicleDoc.data(),
      },
    };

  } catch (error: any) {
    functions.logger.error(`Error retrieving vehicle ${vehicleId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to retrieve vehicle: ${error.message}`
    );
  }
});

/**
 * Get all fleet vehicles
 * Callable function to retrieve all vehicles with optional filtering
 */
export const getAllFleetVehicles = functions.https.onCall(async (data, context) => {
  try {
    const db = admin.firestore();
    let query: admin.firestore.Query = db.collection('fleet_vehicles');

    // Optional filters
    if (data?.category) {
      query = query.where('category', '==', data.category);
    }

    if (data?.minCapacity) {
      query = query.where('capacity', '>=', data.minCapacity);
    }

    if (data?.maxCapacity) {
      query = query.where('capacity', '<=', data.maxCapacity);
    }

    // Execute query
    const snapshot = await query.get();

    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      count: vehicles.length,
      vehicles,
    };

  } catch (error: any) {
    functions.logger.error('Error retrieving fleet vehicles:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to retrieve fleet vehicles: ${error.message}`
    );
  }
});

/**
 * Update fleet vehicle
 * Callable function to update a specific vehicle (admin only)
 */
export const updateFleetVehicle = functions.https.onCall(async (data, context) => {
  // Security: Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update fleet vehicles'
    );
  }

  // Security: Require admin role
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can update fleet vehicles'
    );
  }

  const vehicleId = data?.vehicleId;
  const updates = data?.updates;

  if (!vehicleId || !updates) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'vehicleId and updates are required'
    );
  }

  try {
    const db = admin.firestore();
    const vehicleRef = db.collection('fleet_vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Vehicle with ID ${vehicleId} not found`
      );
    }

    // Update vehicle with timestamp and user tracking
    await vehicleRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid,
    });

    // Log audit trail
    await db.collection('audit_logs').add({
      action: 'fleet_vehicle_updated',
      vehicleId,
      userId: context.auth.uid,
      userEmail: context.auth.token.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      updates,
    });

    functions.logger.info(`Vehicle updated: ${vehicleId}`, { updates });

    return {
      success: true,
      message: `Vehicle ${vehicleId} updated successfully`,
    };

  } catch (error: any) {
    functions.logger.error(`Error updating vehicle ${vehicleId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update vehicle: ${error.message}`
    );
  }
});

/**
 * Delete fleet vehicle
 * Callable function to delete a specific vehicle (admin only)
 */
export const deleteFleetVehicle = functions.https.onCall(async (data, context) => {
  // Security: Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to delete fleet vehicles'
    );
  }

  // Security: Require super_admin role for deletion
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super administrators can delete fleet vehicles'
    );
  }

  const vehicleId = data?.vehicleId;

  if (!vehicleId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'vehicleId is required'
    );
  }

  try {
    const db = admin.firestore();
    const vehicleRef = db.collection('fleet_vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Vehicle with ID ${vehicleId} not found`
      );
    }

    const vehicleData = vehicleDoc.data();

    // Soft delete: mark as inactive instead of hard delete
    await vehicleRef.update({
      status: 'deleted',
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: context.auth.uid,
    });

    // Log audit trail
    await db.collection('audit_logs').add({
      action: 'fleet_vehicle_deleted',
      vehicleId,
      vehicleName: vehicleData?.name,
      userId: context.auth.uid,
      userEmail: context.auth.token.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Vehicle deleted: ${vehicleId}`);

    return {
      success: true,
      message: `Vehicle ${vehicleId} deleted successfully`,
    };

  } catch (error: any) {
    functions.logger.error(`Error deleting vehicle ${vehicleId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to delete vehicle: ${error.message}`
    );
  }
});
