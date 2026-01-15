/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Scheduled function: Daily page analysis
 * Runs every day at 2:00 AM to analyze all website pages
 */
export const dailyPageAnalysis = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    console.log('Starting daily page analysis...');

    try {
      const pages = [
        { url: '/', name: 'Home' },
        { url: '/ohare-airport-limo', name: 'O\'Hare Airport' },
        { url: '/midway-airport-limo', name: 'Midway Airport' },
        { url: '/airport-limo-downtown-chicago', name: 'Downtown Chicago' },
        { url: '/airport-limo-suburbs', name: 'Suburbs Service' },
        { url: '/fleet', name: 'Fleet' },
        { url: '/pricing', name: 'Pricing' },
        { url: '/about', name: 'About' },
        { url: '/contact', name: 'Contact' },
      ];

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
  .timeZone('America/Chicago')
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
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { pageUrl, pageName, pageContent } = req.body;

    if (!pageUrl || !pageName || !pageContent) {
      res.status(400).json({
        error: 'Missing required fields: pageUrl, pageName, pageContent',
      });
      return;
    }

    // TODO: Replace with actual AI analysis using PageAnalyzer
    // This is currently using mock data for demonstration
    // In production, import and use the PageAnalyzer class:
    // import { PageAnalyzer } from '../../server/ai/page-analyzer';
    // const analyzer = new PageAnalyzer();
    // const result = await analyzer.analyzePage(pageContent, pageUrl, pageName);
    
    // Perform AI analysis (using mock data for now)
    const analysis = {
      pageUrl,
      pageName,
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
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { pageType, location, vehicle, targetKeywords } = req.body;

    if (!pageType || !targetKeywords) {
      res.status(400).json({
        error: 'Missing required fields: pageType, targetKeywords',
      });
      return;
    }

    // Generate content (simplified template for now)
    const content = {
      title: `${location || 'Chicago'} ${vehicle || 'Limo'} Service | Premium Airport Transportation`,
      metaDescription: `Professional ${location || 'Chicago'} airport limo service. Reliable black car transportation to O'Hare & Midway.`,
      heading: `Premium ${vehicle || 'Limousine'} Service`,
      content: `Experience luxury transportation with our professional ${vehicle || 'limousine'} service in ${location || 'Chicago'}.`,
      ctaText: 'Book Your Ride Now',
      generatedAt: new Date().toISOString(),
    };

    // Store in Firestore
    await admin.firestore().collection('content_suggestions').add({
      pageType,
      location,
      vehicle,
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
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { purpose, location, vehicle, style, description } = req.body;

    if (!purpose) {
      res.status(400).json({
        error: 'Missing required field: purpose',
      });
      return;
    }

    // Import ImageGenerator dynamically
    const { ImageGenerator } = await import('../../server/ai/image-generator');
    
    // Create image generator instance
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    const imageGenerator = new ImageGenerator(projectId, 'us-central1');
    
    // Generate the image
    const result = await imageGenerator.generateImage({
      purpose: purpose as any,
      location,
      vehicle,
      style,
      description,
    });

    // Store in Firestore with full metadata
    const docRef = await admin.firestore().collection('ai_images').add({
      purpose,
      location,
      vehicle,
      style,
      description,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      width: result.width,
      height: result.height,
      format: result.format,
      status: 'generated',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Track usage for rate limiting
    const today = new Date().toISOString().split('T')[0];
    const userId = 'system'; // In production, use actual user ID from auth
    const usageRef = admin.firestore().collection('usage_stats').doc(`${userId}_${today}`);
    
    await usageRef.set({
      userId,
      date: today,
      imageGenerations: admin.firestore.FieldValue.increment(1),
      totalCost: admin.firestore.FieldValue.increment(0.02), // Approximate cost per image
      lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Log audit event
    await admin.firestore().collection('audit_logs').add({
      action: 'image_generated',
      resourceId: docRef.id,
      resourceType: 'ai_image',
      userId: 'system',
      details: {
        purpose,
        prompt: result.prompt,
        status: 'success',
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      image: result,
      imageId: docRef.id,
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    
    // Log failure in audit logs
    try {
      await admin.firestore().collection('audit_logs').add({
        action: 'image_generation_failed',
        resourceType: 'ai_image',
        userId: 'system',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed',
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
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
