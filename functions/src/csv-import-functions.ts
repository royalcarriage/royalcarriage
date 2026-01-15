/**
 * Firebase Cloud Functions for CSV Import System
 * Handles CSV upload, processing, and entity creation
 */

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

// Note: Firebase Admin is initialized in main index.ts
const storage = new Storage();

/**
 * HTTP Function: Upload CSV File
 * Receives CSV file upload, stores in Firebase Storage, creates import batch
 */
export const uploadCSV = functions.https.onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // CORS handling
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    try {
      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const token = authHeader.substring(7);
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check admin role (custom claims)
      if (decodedToken.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }
      
      // Get file content (assuming multipart/form-data or JSON with base64)
      // For MVP, we'll accept JSON with base64-encoded CSV content
      const { filename, content, importType } = req.body;
      
      if (!filename || !content) {
        res.status(400).json({ error: 'Missing filename or content' });
        return;
      }
      
      // Generate batch ID
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Decode base64 content
      const csvContent = Buffer.from(content, 'base64').toString('utf-8');
      
      // Upload to Firebase Storage
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || 'royalcarriage-imports');
      const file = bucket.file(`imports/${batchId}/${filename}`);
      
      await file.save(csvContent, {
        contentType: 'text/csv',
        metadata: {
          uploadedBy: decodedToken.uid,
          uploadedAt: new Date().toISOString(),
          batchId,
          importType: importType || 'moovs',
        },
      });
      
      const storageUrl = `gs://${bucket.name}/${file.name}`;
      
      // Calculate SHA256 hash
      const crypto = require('crypto');
      const sha256Hash = crypto.createHash('sha256').update(csvContent).digest('hex');
      
      // Check for duplicate import
      const existingBatch = await admin.firestore()
        .collection('raw_import_batches')
        .where('sha256Hash', '==', sha256Hash)
        .limit(1)
        .get();
      
      if (!existingBatch.empty) {
        res.status(409).json({
          error: 'Duplicate import detected',
          existingBatchId: existingBatch.docs[0].id,
        });
        return;
      }
      
      // Count rows
      const rows = csvContent.split('\n').filter(line => line.trim()).length - 1; // Subtract header
      
      // Create raw import batch
      const batchData = {
        id: batchId,
        filename,
        originalFilename: filename,
        storageUrl,
        sha256Hash,
        fileSize: Buffer.from(csvContent).length,
        rowCount: rows,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        uploadedBy: decodedToken.uid,
        status: 'pending',
        importType: importType || 'moovs',
      };
      
      await admin.firestore().collection('raw_import_batches').doc(batchId).set(batchData);
      
      // Trigger processing (via Pub/Sub or direct call)
      // For MVP, return success and let client poll for status
      res.status(200).json({
        success: true,
        batchId,
        status: 'pending',
        rowCount: rows,
        message: 'CSV uploaded successfully. Processing will begin shortly.',
      });
      
      // Asynchronously trigger processing
      // Note: In production, this would be a Pub/Sub trigger
      // For now, we'll use a Firestore onCreate trigger
      
    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Firestore Trigger: Process CSV Import
 * Triggered when a new raw_import_batch is created
 */
export const processCSVImport = functions.firestore.onDocumentCreated(
  {
    document: 'raw_import_batches/{batchId}',
    region: 'us-central1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error('No data in snapshot');
      return;
    }
    
    const batchId = event.params.batchId;
    const batch = snapshot.data();
    
    console.log(`Processing import batch: ${batchId}`);
    
    try {
      // Update status to processing
      await snapshot.ref.update({
        status: 'processing',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Download CSV from Storage
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || 'royalcarriage-imports');
      const fileUrl = batch.storageUrl.replace('gs://' + bucket.name + '/', '');
      const file = bucket.file(fileUrl);
      
      const [content] = await file.download();
      const csvContent = content.toString('utf-8');
      
      // Note: Full processing would use CSVImportProcessor from shared module
      // For MVP, we'll create a simple parser
      
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Create raw import rows
      const rowsToCreate: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        rowsToCreate.push({
          id: `${batchId}_row_${i}`,
          batchId,
          rowNumber: i,
          rawData: rowData,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Batch write rows (Firestore allows 500 writes per batch)
      const db = admin.firestore();
      const batchWrites: admin.firestore.WriteBatch[] = [];
      let currentBatch = db.batch();
      let operationCount = 0;
      
      for (const row of rowsToCreate) {
        const ref = db.collection('raw_import_rows').doc(row.id);
        currentBatch.set(ref, row);
        operationCount++;
        
        if (operationCount === 500) {
          batchWrites.push(currentBatch);
          currentBatch = db.batch();
          operationCount = 0;
        }
      }
      
      if (operationCount > 0) {
        batchWrites.push(currentBatch);
      }
      
      // Commit all batches
      for (const batch of batchWrites) {
        await batch.commit();
      }
      
      console.log(`Created ${rowsToCreate.length} raw import rows`);
      
      // Update batch status
      await snapshot.ref.update({
        status: 'completed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Import batch ${batchId} completed successfully`);
      
    } catch (error) {
      console.error(`Error processing batch ${batchId}:`, error);
      
      await snapshot.ref.update({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/**
 * HTTP Function: Get Import Status
 * Returns status and audit report for an import batch
 */
export const getImportStatus = functions.https.onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    try {
      const batchId = req.query.batchId as string;
      
      if (!batchId) {
        res.status(400).json({ error: 'Missing batchId parameter' });
        return;
      }
      
      // Get batch
      const batchDoc = await admin.firestore()
        .collection('raw_import_batches')
        .doc(batchId)
        .get();
      
      if (!batchDoc.exists) {
        res.status(404).json({ error: 'Import batch not found' });
        return;
      }
      
      const batch = batchDoc.data();
      
      // Get row count and status
      const rowsSnapshot = await admin.firestore()
        .collection('raw_import_rows')
        .where('batchId', '==', batchId)
        .get();
      
      const statusCounts = {
        pending: 0,
        processed: 0,
        skipped: 0,
        failed: 0,
      };
      
      rowsSnapshot.forEach(doc => {
        const row = doc.data();
        statusCounts[row.status as keyof typeof statusCounts]++;
      });
      
      const progress = {
        processed: statusCounts.processed + statusCounts.skipped,
        total: rowsSnapshot.size,
        percentComplete: rowsSnapshot.size > 0
          ? Math.round(((statusCounts.processed + statusCounts.skipped) / rowsSnapshot.size) * 100)
          : 0,
      };
      
      res.status(200).json({
        batch,
        progress,
        statusCounts,
      });
      
    } catch (error) {
      console.error('Get import status error:', error);
      res.status(500).json({
        error: 'Failed to get import status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Scheduled Function: Daily GA4 Data Ingestion
 * Fetches GA4 analytics data and stores snapshots
 */
export const dailyGA4Ingestion = functions.scheduler.onSchedule(
  {
    schedule: '0 3 * * *', // 3 AM daily
    timeZone: 'America/Chicago',
  },
  async (event) => {
    console.log('Starting daily GA4 data ingestion...');
    
    try {
      // Note: Requires GA4 Data API setup
      // For MVP, this is a placeholder
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dateString = yesterday.toISOString().split('T')[0];
      
      // Mock data for demonstration
      const mockData = [
        {
          date: dateString,
          landingPage: '/',
          pagePath: '/',
          source: 'google',
          medium: 'organic',
          sessions: 150,
          conversions: 5,
          revenue: 625,
        },
        {
          date: dateString,
          landingPage: '/ohare-airport-limo',
          pagePath: '/ohare-airport-limo',
          source: 'google',
          medium: 'cpc',
          sessions: 85,
          conversions: 8,
          revenue: 1000,
        },
      ];
      
      // Store snapshots
      const batch = admin.firestore().batch();
      
      for (const data of mockData) {
        const id = `ga4_${data.date}_${data.pagePath.replace(/\//g, '_')}`;
        const ref = admin.firestore().collection('marketing_daily_ga4').doc(id);
        
        batch.set(ref, {
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      await batch.commit();
      
      console.log(`GA4 ingestion completed: ${mockData.length} records`);
      
    } catch (error) {
      console.error('GA4 ingestion error:', error);
      throw error;
    }
  }
);

/**
 * Scheduled Function: Daily Google Ads Data Ingestion
 * Fetches Google Ads performance data and stores snapshots
 */
export const dailyGoogleAdsIngestion = functions.scheduler.onSchedule(
  {
    schedule: '0 4 * * *', // 4 AM daily
    timeZone: 'America/Chicago',
  },
  async (event) => {
    console.log('Starting daily Google Ads data ingestion...');
    
    try {
      // Note: Requires Google Ads API setup
      // For MVP, this is a placeholder
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dateString = yesterday.toISOString().split('T')[0];
      
      // Mock data for demonstration
      const mockData = [
        {
          date: dateString,
          campaign: 'Airport Limo - O\'Hare',
          adGroup: 'O\'Hare Airport',
          keyword: 'ohare airport limo',
          cost: 125.50,
          clicks: 45,
          impressions: 1250,
          conversions: 8,
          conversionValue: 1000,
        },
        {
          date: dateString,
          campaign: 'Airport Limo - Midway',
          adGroup: 'Midway Airport',
          keyword: 'midway airport limo',
          cost: 85.30,
          clicks: 32,
          impressions: 890,
          conversions: 5,
          conversionValue: 625,
        },
      ];
      
      // Store snapshots
      const batch = admin.firestore().batch();
      
      for (const data of mockData) {
        const id = `ads_${data.date}_${data.campaign.replace(/\s+/g, '_')}_${data.adGroup.replace(/\s+/g, '_')}`;
        const ref = admin.firestore().collection('marketing_daily_google_ads').doc(id);
        
        batch.set(ref, {
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      await batch.commit();
      
      console.log(`Google Ads ingestion completed: ${mockData.length} records`);
      
    } catch (error) {
      console.error('Google Ads ingestion error:', error);
      throw error;
    }
  }
);
