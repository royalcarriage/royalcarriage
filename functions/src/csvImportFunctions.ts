/**
 * P1.3: CSV Import Pipeline Backend
 * Complete CSV parser with schema mapping for Moovs and Ads data
 * Ported from gemini-workspace with enhancements
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

interface CSVParseResult {
  success: boolean;
  totalRecords: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: { row: number; field: string; error: string }[];
  importId: string;
  timestamp: string;
}

interface MoovsCSVRow {
  'Trip Type': string;
  'Trip duration': string;
  'Distance Miles': string;
  'Created At': string;
  'Vehicle': string;
  'Status Slug': string;
  'Reservation Conf (Order No)': string;
  'Order Type': string;
  'Base Rate': string;
  'Total Amount ($)': string;
  'Amount Paid ($)': string;
  'Amount Due ($)': string;
  'Pickup Date ': string;
  'Pickup Address': string;
  'Dropoff Address': string;
  'Number of passengers': string;
  'Driver': string;
  'Driver ID': string;
  'Vehicle ID': string;
  'Passenger Contact Full Name': string;
  'Passenger Email': string;
  'Passenger Phone Number': string;
  'Trip ID': string;
  'Month': string;
  [key: string]: string;
}

interface AdsCSVRow {
  campaign_id: string;
  date: string;
  impressions: string;
  clicks: string;
  spend: string;
  conversions: string;
  revenue: string;
  [key: string]: string;
}

function parseAmount(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
}

export const importMoovsCSV = functions.https.onCall(
  async (data, context): Promise<CSVParseResult> => {
    if (!context.auth?.token?.role ||
        !['admin', 'superadmin'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { csvData, fileName, skipDuplicates = true } = data;
    if (!csvData || !Array.isArray(csvData)) {
      throw new functions.https.HttpsError('invalid-argument', 'csvData must be an array');
    }

    const db = admin.firestore();
    const importId = 'moovs-' + Date.now();
    const timestamp = new Date().toISOString();

    let imported = 0, skipped = 0, errors = 0;
    const errorDetails: { row: number; field: string; error: string }[] = [];

    await db.collection('imports').doc(importId).set({
      type: 'moovs', fileName: fileName || 'unknown', status: 'processing',
      totalRecords: csvData.length, startedAt: admin.firestore.FieldValue.serverTimestamp(),
      importedBy: context.auth?.uid,
    });

    const batchSize = 100;
    for (let i = 0; i < csvData.length; i += batchSize) {
      const chunk = csvData.slice(i, i + batchSize);
      const batch = db.batch();

      for (let j = 0; j < chunk.length; j++) {
        const row: MoovsCSVRow = chunk[j];
        const rowIndex = i + j + 1;

        try {
          const tripId = row['Trip ID']?.trim();
          if (!tripId) { errorDetails.push({ row: rowIndex, field: 'Trip ID', error: 'Missing' }); errors++; continue; }

          if (skipDuplicates) {
            const existing = await db.collection('bookings').doc(tripId).get();
            if (existing.exists) { skipped++; continue; }
          }

          const pickupDateStr = row['Pickup Date'] || row['Pickup Date '];
          const pickupDate = pickupDateStr ? new Date(pickupDateStr) : new Date();

          batch.set(db.collection('bookings').doc(tripId), {
            tripId,
            bookingId: row['Reservation Conf (Order No)'] || tripId,
            tripType: row['Trip Type'] || 'One-way',
            status: row['Status Slug'] === 'done' ? 'completed' : row['Status Slug'] || 'pending',
            duration: parseInt(row['Trip duration']) || 0,
            distance: parseFloat(row['Distance Miles']) || 0,
            passengers: parseInt(row['Number of passengers']) || 1,
            pickupAddress: row['Pickup Address'] || '',
            dropoffAddress: row['Dropoff Address'] || '',
            pickupDate: admin.firestore.Timestamp.fromDate(pickupDate),
            totalAmount: parseAmount(row['Total Amount ($)']),
            amountPaid: parseAmount(row['Amount Paid ($)']),
            driverId: row['Driver ID']?.trim() || 'unknown',
            vehicleId: row['Vehicle ID']?.trim() || 'unknown',
            passengerName: row['Passenger Contact Full Name'] || '',
            importId, sourceRowNumber: rowIndex,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          imported++;
        } catch (err) {
          errorDetails.push({ row: rowIndex, field: 'general', error: String(err) });
          errors++;
        }
      }
      await batch.commit();
    }

    await db.collection('imports').doc(importId).update({
      status: errors > 0 ? 'completed_with_errors' : 'completed',
      imported, skipped, errors, errorDetails: errorDetails.slice(0, 100),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, totalRecords: csvData.length, imported, skipped, errors, errorDetails: errorDetails.slice(0, 50), importId, timestamp };
  }
);

export const importAdsCSV = functions.https.onCall(
  async (data, context): Promise<CSVParseResult> => {
    if (!context.auth?.token?.role || !['admin', 'superadmin'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { csvData, fileName } = data;
    if (!csvData || !Array.isArray(csvData)) {
      throw new functions.https.HttpsError('invalid-argument', 'csvData must be an array');
    }

    const db = admin.firestore();
    const importId = 'ads-' + Date.now();
    const timestamp = new Date().toISOString();

    let imported = 0, skipped = 0, errors = 0;
    const errorDetails: { row: number; field: string; error: string }[] = [];

    await db.collection('imports').doc(importId).set({
      type: 'ads', fileName: fileName || 'unknown', status: 'processing',
      totalRecords: csvData.length, startedAt: admin.firestore.FieldValue.serverTimestamp(),
      importedBy: context.auth?.uid,
    });

    const batch = db.batch();
    for (let i = 0; i < csvData.length; i++) {
      const row: AdsCSVRow = csvData[i];
      const rowIndex = i + 1;

      try {
        const campaignId = row.campaign_id?.trim();
        const dateStr = row.date?.trim();
        if (!campaignId || !dateStr) { errorDetails.push({ row: rowIndex, field: 'campaign_id/date', error: 'Missing' }); errors++; continue; }

        const docId = campaignId + '-' + dateStr.replace(/[^0-9]/g, '');
        const impressions = parseInt(row.impressions) || 0;
        const clicks = parseInt(row.clicks) || 0;
        const spend = parseAmount(row.spend);
        const conversions = parseInt(row.conversions) || 0;
        const revenue = parseAmount(row.revenue);

        batch.set(db.collection('ads_metrics').doc(docId), {
          campaignId, date: new Date(dateStr), impressions, clicks, spend, conversions, revenue,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          roi: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
          importId, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        imported++;
      } catch (err) {
        errorDetails.push({ row: rowIndex, field: 'general', error: String(err) });
        errors++;
      }
    }
    await batch.commit();

    await db.collection('imports').doc(importId).update({
      status: errors > 0 ? 'completed_with_errors' : 'completed',
      imported, skipped, errors, errorDetails: errorDetails.slice(0, 100),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, totalRecords: csvData.length, imported, skipped, errors, errorDetails: errorDetails.slice(0, 50), importId, timestamp };
  }
);

export const getImportHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const db = admin.firestore();
  const snapshot = await db.collection('imports').orderBy('startedAt', 'desc').limit(data.limit || 20).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const rollbackImport = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token?.role || !['admin', 'superadmin'].includes(context.auth.token.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  const { importId } = data;
  if (!importId) throw new functions.https.HttpsError('invalid-argument', 'importId required');

  const db = admin.firestore();
  const importDoc = await db.collection('imports').doc(importId).get();
  if (!importDoc.exists) throw new functions.https.HttpsError('not-found', 'Import not found');

  let deletedCount = 0;
  const importType = importDoc.data()?.type;

  if (importType === 'moovs') {
    const bookings = await db.collection('bookings').where('importId', '==', importId).get();
    const batch = db.batch();
    bookings.docs.forEach(doc => { batch.delete(doc.ref); deletedCount++; });
    await batch.commit();
  } else if (importType === 'ads') {
    const metrics = await db.collection('ads_metrics').where('importId', '==', importId).get();
    const batch = db.batch();
    metrics.docs.forEach(doc => { batch.delete(doc.ref); deletedCount++; });
    await batch.commit();
  }

  await db.collection('imports').doc(importId).update({
    status: 'rolled_back', rolledBackAt: admin.firestore.FieldValue.serverTimestamp(),
    rolledBackBy: context.auth?.uid, deletedRecords: deletedCount,
  });

  return { success: true, importId, deletedCount };
});

export const getImportErrorReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { importId } = data;
  if (!importId) throw new functions.https.HttpsError('invalid-argument', 'importId required');

  const db = admin.firestore();
  const importDoc = await db.collection('imports').doc(importId).get();
  if (!importDoc.exists) throw new functions.https.HttpsError('not-found', 'Import not found');

  const d = importDoc.data();
  return { importId, type: d?.type, status: d?.status, totalRecords: d?.totalRecords, imported: d?.imported, errors: d?.errors, errorDetails: d?.errorDetails || [] };
});
