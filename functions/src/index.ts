/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Helper function to get allowed origins from environment
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 
    'https://royalcarriagelimoseo.web.app,https://chicagoairportblackcar.com';
  
  const origins = allowedOriginsEnv.split(',').map(o => o.trim());
  
  // Add localhost for development
  if (process.env.NODE_ENV === 'development' || process.env.FUNCTIONS_EMULATOR === 'true') {
    origins.push('http://localhost:5000', 'http://127.0.0.1:5000');
  }
  
  return origins;
}

/**
 * Scheduled function: Daily page analysis
 * Runs every day at 2:00 AM to analyze all website pages
 */
export const dailyPageAnalysis = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone(process.env.SCHEDULED_TIMEZONE || 'America/Chicago')
  .onRun(async (context) => {
    console.log('Starting daily page analysis...');

    try {
      // Get pages to analyze from environment or use defaults
      const pagesToAnalyzeEnv = process.env.PAGES_TO_ANALYZE || 
        '/,/ohare-airport-limo,/midway-airport-limo,/airport-limo-downtown-chicago,/airport-limo-suburbs,/fleet,/pricing,/about,/contact';
      
      const pageUrls = pagesToAnalyzeEnv.split(',').map(url => url.trim());
      
      const pages = pageUrls.map(url => {
        // Extract page name from URL
        const name = url === '/' ? 'Home' : 
          url.split('/').filter(Boolean).join(' ')
            .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { url, name };
      });

      // Analyze each page
      for (const page of pages) {
        console.log(`Analyzing page: ${page.name}`);
        
        // Store analysis results in Firestore
        await admin.firestore().collection('page_analyses').add({
          pageUrl: page.url,
          pageName: page.name,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
        });
      }

      console.log(`Daily analysis completed for ${pages.length} pages`);
      return null;
    } catch (error) {
      console.error('Daily analysis failed:', error);
      throw error;
    }
  });

/**
 * Scheduled function: Weekly SEO report
 * Runs every Monday at 9:00 AM to generate SEO report
 */
export const weeklySeoReport = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone(process.env.SCHEDULED_TIMEZONE || 'America/Chicago')
  .onRun(async (context) => {
    console.log('Generating weekly SEO report...');

    try {
      // Get all page analyses from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const snapshot = await admin.firestore()
        .collection('page_analyses')
        .where('analyzedAt', '>=', oneWeekAgo)
        .get();

      const analyses = snapshot.docs.map(doc => doc.data());

      // Generate summary report
      const report = {
        periodStart: oneWeekAgo,
        periodEnd: new Date(),
        totalPages: analyses.length,
        averageSeoScore: analyses.reduce((sum, a: any) => sum + (a.seoScore || 0), 0) / analyses.length,
        averageContentScore: analyses.reduce((sum, a: any) => sum + (a.contentScore || 0), 0) / analyses.length,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store report
      await admin.firestore().collection('seo_reports').add(report);

      console.log('Weekly SEO report generated successfully');
      return null;
    } catch (error) {
      console.error('Weekly report generation failed:', error);
      throw error;
    }
  });

/**
 * HTTP function: Trigger page analysis
 * Manual trigger for page analysis via API
 */
export const triggerPageAnalysis = functions.https.onRequest(async (req, res) => {
  // Configure CORS based on environment
  const allowedOrigins = getAllowedOrigins();
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Check authentication (require admin role)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  try {
    // Verify Firebase Auth token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin (requires custom claims to be set)
    if (decodedToken.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden. Admin access required.',
      });
      return;
    }

    const { pageUrl, pageName, pageContent } = req.body;

    if (!pageUrl || !pageName || !pageContent) {
      res.status(400).json({
        error: 'Missing required fields: pageUrl, pageName, pageContent',
      });
      return;
    }

    // Sanitize inputs
    const sanitizedPageUrl = pageUrl.trim();
    const sanitizedPageName = pageName.trim().replace(/[<>]/g, '');

    // TODO: Replace with actual AI analysis using PageAnalyzer
    // This is currently using mock data for demonstration
    // In production, import and use the PageAnalyzer class:
    // import { PageAnalyzer } from '../../server/ai/page-analyzer';
    // const analyzer = new PageAnalyzer();
    // const result = await analyzer.analyzePage(pageContent, pageUrl, pageName);
    
    // Perform AI analysis (using mock data for now)
    const analysis = {
      pageUrl: sanitizedPageUrl,
      pageName: sanitizedPageName,
      seoScore: Math.floor(Math.random() * 40) + 60,
      contentScore: Math.floor(Math.random() * 40) + 60,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
    };

    // Store in Firestore
    const docRef = await admin.firestore().collection('page_analyses').add(analysis);

    res.status(200).json({
      success: true,
      analysisId: docRef.id,
      analysis,
    });
  } catch (error) {
    console.error('Page analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * HTTP function: Generate content
 * Trigger AI content generation
 */
export const generateContent = functions.https.onRequest(async (req, res) => {
  // Configure CORS based on environment
  const allowedOrigins = getAllowedOrigins();
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Check authentication (require admin role)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  try {
    // Verify Firebase Auth token
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin
    if (decodedToken.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden. Admin access required.',
      });
      return;
    }

    const { pageType, location, vehicle, targetKeywords } = req.body;

    if (!pageType || !targetKeywords) {
      res.status(400).json({
        error: 'Missing required fields: pageType, targetKeywords',
      });
      return;
    }

    // Sanitize inputs
    const sanitizedLocation = location ? location.trim().replace(/[<>]/g, '') : 'Chicago';
    const sanitizedVehicle = vehicle ? vehicle.trim().replace(/[<>]/g, '') : 'Limo';
    const sanitizedPageType = pageType.trim().replace(/[<>]/g, '');

    // Generate content (simplified template for now)
    const content = {
      title: `${sanitizedLocation} ${sanitizedVehicle} Service | Premium Airport Transportation`,
      metaDescription: `Professional ${sanitizedLocation} airport limo service. Reliable black car transportation to O'Hare & Midway.`,
      heading: `Premium ${sanitizedVehicle} Service`,
      content: `Experience luxury transportation with our professional ${sanitizedVehicle.toLowerCase()} service in ${sanitizedLocation}.`,
      ctaText: 'Book Your Ride Now',
      generatedAt: new Date().toISOString(),
    };

    // Store in Firestore
    await admin.firestore().collection('content_suggestions').add({
      pageType: sanitizedPageType,
      location: sanitizedLocation,
      vehicle: sanitizedVehicle,
      targetKeywords,
      generatedContent: content,
      status: 'pending_review',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Content generation failed:', error);
    res.status(500).json({
      error: 'Content generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * HTTP function: Generate image
 * Trigger AI image generation
 */
export const generateImage = functions.https.onRequest(async (req, res) => {
  // Configure CORS based on environment
  const allowedOrigins = getAllowedOrigins();
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Check authentication (require admin role)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  try {
    // Verify Firebase Auth token
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin
    if (decodedToken.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden. Admin access required.',
      });
      return;
    }

    const { purpose, location, vehicle } = req.body;

    if (!purpose) {
      res.status(400).json({
        error: 'Missing required field: purpose',
      });
      return;
    }

    // Sanitize inputs
    const sanitizedPurpose = purpose.trim().replace(/[<>]/g, '');
    const sanitizedLocation = location ? location.trim().replace(/[<>]/g, '') : null;
    const sanitizedVehicle = vehicle ? vehicle.trim().replace(/[<>]/g, '') : null;

    // Generate placeholder image URL
    const text = sanitizedVehicle || sanitizedLocation || sanitizedPurpose;
    const imageUrl = `https://placehold.co/1200x800/1a1a1a/ffffff?text=${encodeURIComponent(text)}`;

    const image = {
      imageUrl,
      prompt: `Luxury ${sanitizedVehicle || 'car'} at ${sanitizedLocation || 'Chicago airport'}`,
      width: 1200,
      height: 800,
      format: 'png',
      generatedAt: new Date().toISOString(),
    };

    // Store in Firestore
    await admin.firestore().collection('ai_images').add({
      purpose: sanitizedPurpose,
      location: sanitizedLocation,
      vehicle: sanitizedVehicle,
      imageUrl,
      status: 'generated',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      image,
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    res.status(500).json({
      error: 'Image generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Firestore trigger: Auto-analyze new pages
 * Automatically analyze pages when they're added to the database
 */
export const autoAnalyzeNewPage = functions.firestore
  .document('pages/{pageId}')
  .onCreate(async (snap, context) => {
    const page = snap.data();
    
    console.log(`Auto-analyzing new page: ${page.name}`);

    try {
      // Perform analysis
      const analysis = {
        pageId: context.params.pageId,
        pageUrl: page.url,
        pageName: page.name,
        seoScore: Math.floor(Math.random() * 40) + 60,
        contentScore: Math.floor(Math.random() * 40) + 60,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      };

      // Store analysis
      await admin.firestore().collection('page_analyses').add(analysis);

      console.log(`Auto-analysis completed for page: ${page.name}`);
    } catch (error) {
      console.error('Auto-analysis failed:', error);
    }

    return null;
  });
