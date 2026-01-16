/**
 * Import Routes
 * API endpoints for CSV data imports (Moovs trips and Ads metrics)
 */

import { Router } from 'express';
import * as admin from 'firebase-admin';
import { parseCsv, mapCsvRow, createImportAudit, finalizeImportStats } from '../../lib/csv-parser';
import {
  MoovsTrip,
  MOOVS_COLUMN_MAP,
  validateMoovsTrip,
  normalizeMoovsTrip,
  MoovsImportResult,
} from '../../lib/moovs-schema';
import {
  AdsMetric,
  ADS_COLUMN_MAP,
  validateAdsMetric,
  normalizeAdsMetric,
  AdsImportResult,
} from '../../lib/ads-schema';

const router = Router();

/**
 * POST /imports/moovs
 * Import Moovs trip data from CSV
 */
router.post('/moovs', async (req, res) => {
  try {
    const { csvData, fileName } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Parse CSV
    const { data: records, headers } = parseCsv(csvData, {
      autoDetectDelimiter: true,
    });

    // Create import audit
    const audit = createImportAudit(
      fileName || 'unknown.csv',
      csvData.length,
      records.length,
      'moovs'
    );

    const db = admin.firestore();
    const result: MoovsImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: [],
    };

    // Track existing trip IDs for duplicate detection
    const existingTripIds = new Set<string>();
    const existingTripsSnapshot = await db
      .collection('trips')
      .select('tripId')
      .get();
    existingTripsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.tripId) {
        existingTripIds.add(data.tripId);
      }
    });

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Map CSV columns to schema
        const mappedData = mapCsvRow<MoovsTrip>(record, MOOVS_COLUMN_MAP);

        // Normalize data
        const normalized = normalizeMoovsTrip(mappedData);

        // Validate
        const validation = validateMoovsTrip(normalized);
        if (!validation.valid) {
          result.errors.push({
            row: rowNumber,
            error: validation.errors.join('; '),
            data: record,
          });
          audit.stats.failedRows++;
          continue;
        }

        // Check for duplicates
        if (existingTripIds.has(normalized.tripId)) {
          result.duplicates.push(normalized.tripId);
          result.skipped++;
          audit.stats.duplicateRows++;
          continue;
        }

        // Import to Firestore
        await db.collection('trips').add({
          ...normalized,
          importedAt: admin.firestore.FieldValue.serverTimestamp(),
          importId: audit.importId,
        });

        existingTripIds.add(normalized.tripId);
        result.imported++;
        audit.stats.successfulRows++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : String(error),
          data: record,
        });
        audit.stats.failedRows++;
      }
    }

    audit.stats.totalRows = records.length;
    finalizeImportStats(audit.stats);
    audit.status = result.errors.length === 0 ? 'completed' : 'completed';
    audit.errors = result.errors;
    audit.duplicates = result.duplicates;
    audit.completedAt = new Date();

    // Save audit to Firestore
    await db.collection('imports').doc(audit.importId).set(audit);

    res.json({
      ...result,
      importId: audit.importId,
    });
  } catch (error) {
    console.error('Moovs import error:', error);
    res.status(500).json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /imports/ads
 * Import advertising metrics from CSV
 */
router.post('/ads', async (req, res) => {
  try {
    const { csvData, fileName } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Parse CSV
    const { data: records, headers } = parseCsv(csvData, {
      autoDetectDelimiter: true,
    });

    // Create import audit
    const audit = createImportAudit(
      fileName || 'unknown.csv',
      csvData.length,
      records.length,
      'ads'
    );

    const db = admin.firestore();
    const result: AdsImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: [],
    };

    // Track existing metric IDs for duplicate detection
    const existingMetricIds = new Set<string>();
    const existingMetricsSnapshot = await db
      .collection('metrics')
      .where('source', '==', 'ads_import')
      .select('metricId')
      .get();
    existingMetricsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.metricId) {
        existingMetricIds.add(data.metricId);
      }
    });

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Map CSV columns to schema
        const mappedData = mapCsvRow<AdsMetric>(record, ADS_COLUMN_MAP);

        // Normalize data
        const normalized = normalizeAdsMetric(mappedData);

        // Validate
        const validation = validateAdsMetric(normalized);
        if (!validation.valid) {
          result.errors.push({
            row: rowNumber,
            error: validation.errors.join('; '),
            data: record,
          });
          audit.stats.failedRows++;
          continue;
        }

        // Check for duplicates
        if (existingMetricIds.has(normalized.metricId)) {
          result.duplicates.push(normalized.metricId);
          result.skipped++;
          audit.stats.duplicateRows++;
          continue;
        }

        // Import to Firestore
        await db.collection('metrics').add({
          ...normalized,
          source: 'ads_import',
          importedAt: admin.firestore.FieldValue.serverTimestamp(),
          importId: audit.importId,
        });

        existingMetricIds.add(normalized.metricId);
        result.imported++;
        audit.stats.successfulRows++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : String(error),
          data: record,
        });
        audit.stats.failedRows++;
      }
    }

    audit.stats.totalRows = records.length;
    finalizeImportStats(audit.stats);
    audit.status = result.errors.length === 0 ? 'completed' : 'completed';
    audit.errors = result.errors;
    audit.duplicates = result.duplicates;
    audit.completedAt = new Date();

    // Save audit to Firestore
    await db.collection('imports').doc(audit.importId).set(audit);

    res.json({
      ...result,
      importId: audit.importId,
    });
  } catch (error) {
    console.error('Ads import error:', error);
    res.status(500).json({
      error: 'Import failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /imports/:importId
 * Get import status and results
 */
router.get('/:importId', async (req, res) => {
  try {
    const { importId } = req.params;
    const db = admin.firestore();

    const importDoc = await db.collection('imports').doc(importId).get();

    if (!importDoc.exists) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json(importDoc.data());
  } catch (error) {
    console.error('Get import error:', error);
    res.status(500).json({
      error: 'Failed to retrieve import',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /imports
 * List all imports
 */
router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const { limit = 50, importType } = req.query;

    let query = db.collection('imports')
      .orderBy('uploadedAt', 'desc')
      .limit(Number(limit));

    if (importType) {
      query = query.where('importType', '==', importType) as any;
    }

    const snapshot = await query.get();
    const imports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ imports });
  } catch (error) {
    console.error('List imports error:', error);
    res.status(500).json({
      error: 'Failed to list imports',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
