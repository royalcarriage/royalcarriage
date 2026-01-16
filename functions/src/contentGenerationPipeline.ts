/**
 * Content Generation Pipeline - Enterprise Scale
 * Purpose: Batch generate SEO-optimized content for 4,000+ location-service pages
 * Features: Rate limiting, batch processing, approval workflow, static page generation
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { geminiClient } from './shared/gemini-client';

// ========== INTERFACES ==========

interface ServiceContentData {
  id: string;
  serviceId: string;
  locationId: string;
  websiteId: string;
  title: string;
  metaDescription: string;
  content: {
    hero: string;
    overview: string;
    features: string[];
    whyChooseUs: string;
    localInfo: string;
    faq: Array<{ question: string; answer: string }>;
    cta: string;
  };
  internalLinks: string[];
  schema: Record<string, unknown>;
  keywords: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  generatedAt: admin.firestore.FieldValue;
  approvedAt?: admin.firestore.FieldValue;
  approvedBy?: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  landmarks?: string[];
  demographics?: Record<string, string>;
  weddingVenues?: number;
  hotels?: number;
  restaurants?: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  keywords?: string[];
  searchVolume?: number;
}

interface GeneratedContent {
  hero: string;
  overview: string;
  features: string[];
  whyChooseUs: string;
  localInfo: string;
  faq: Array<{ question: string; answer: string }>;
  cta: string;
}

// ========== RATE LIMITING CONFIGURATION ==========

const RATE_LIMITS = {
  // Gemini API rate limits
  requestsPerMinute: 60,
  requestsPerDay: 1500,

  // Batch processing limits
  concurrentRequests: 5,
  batchDelay: 1000, // ms between batches
  retryAttempts: 3,
  retryDelay: 2000, // ms
};

// ========== FUNCTION 1: generateLocationServiceContent ==========

/**
 * Generate SEO-optimized content for a single location-service combination
 * Callable function with admin-only access
 */
export const generateLocationServiceContent = functions.https.onCall(
  async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { locationId, serviceId, websiteId } = data;

    // Validate input
    if (!locationId || !serviceId || !websiteId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: locationId, serviceId, websiteId'
      );
    }

    const db = admin.firestore();

    try {
      functions.logger.info('Generating content', {
        locationId,
        serviceId,
        websiteId,
        userId: context.auth.uid,
      });

      // Fetch location and service data
      const [locationDoc, serviceDoc] = await Promise.all([
        db.collection('locations').doc(locationId).get(),
        db.collection('services').doc(serviceId).get(),
      ]);

      if (!locationDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Location not found');
      }

      if (!serviceDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Service not found');
      }

      const location = { id: locationDoc.id, ...locationDoc.data() } as Location;
      const service = { id: serviceDoc.id, ...serviceDoc.data() } as Service;

      // Generate content using Gemini
      const generatedContent = await generateContentWithGemini(
        service,
        location,
        websiteId
      );

      // Create SEO title and meta description
      const title = createSEOTitle(service.name, location.name);
      const metaDescription = createMetaDescription(
        service.name,
        location.name,
        service.description
      );

      // Generate keywords
      const keywords = generateKeywords(service, location);

      // Generate schema markup
      const schema = generateSchemaMarkup(service, location, websiteId);

      // Generate internal links
      const internalLinks = generateInternalLinks(serviceId, locationId, websiteId);

      // Create content ID
      const contentId = `${serviceId}-${locationId}`;

      // Store in service_content collection
      const contentData: Partial<ServiceContentData> = {
        serviceId,
        locationId,
        websiteId,
        title,
        metaDescription,
        content: generatedContent,
        internalLinks,
        schema,
        keywords,
        approvalStatus: 'pending',
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('service_content').doc(contentId).set(contentData);

      functions.logger.info('Content generated successfully', { contentId });

      return {
        contentId,
        title,
        status: 'pending',
      };
    } catch (error) {
      functions.logger.error('Content generation failed', {
        error: error instanceof Error ? error.message : String(error),
        locationId,
        serviceId,
      });

      throw new functions.https.HttpsError(
        'internal',
        `Content generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// ========== FUNCTION 2: batchGenerateContent ==========

/**
 * Batch generate content for multiple location-service combinations
 * Includes rate limiting and progress tracking
 */
export const batchGenerateContent = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes (max for Cloud Functions)
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { websiteId, locationIds, serviceIds } = data;

    // Validate input
    if (!websiteId || !Array.isArray(locationIds) || !Array.isArray(serviceIds)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid input: websiteId, locationIds[], serviceIds[] required'
      );
    }

    const db = admin.firestore();
    const totalCombinations = locationIds.length * serviceIds.length;

    functions.logger.info('Starting batch generation', {
      websiteId,
      locations: locationIds.length,
      services: serviceIds.length,
      totalCombinations,
    });

    let totalGenerated = 0;
    const errors: Array<{ locationId: string; serviceId: string; error: string }> = [];

    try {
      // Create batch job record
      const batchJobRef = await db.collection('batch_jobs').add({
        type: 'content_generation',
        websiteId,
        totalCombinations,
        status: 'running',
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: context.auth.uid,
      });

      // Process in batches to respect rate limits
      const batches = createBatches(locationIds, serviceIds, RATE_LIMITS.concurrentRequests);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        // Process batch concurrently
        const results = await Promise.allSettled(
          batch.map(({ locationId, serviceId }) =>
            generateSingleContent(db, locationId, serviceId, websiteId)
          )
        );

        // Process results
        results.forEach((result, idx) => {
          const { locationId, serviceId } = batch[idx];

          if (result.status === 'fulfilled') {
            totalGenerated++;
          } else {
            errors.push({
              locationId,
              serviceId,
              error: result.reason?.message || 'Unknown error',
            });
          }
        });

        // Update progress
        await batchJobRef.update({
          progress: totalGenerated,
          errors: errors.length,
        });

        // Rate limiting delay between batches
        if (i < batches.length - 1) {
          await sleep(RATE_LIMITS.batchDelay);
        }

        functions.logger.info('Batch progress', {
          batchNumber: i + 1,
          totalBatches: batches.length,
          generated: totalGenerated,
          errors: errors.length,
        });
      }

      // Update batch job status
      await batchJobRef.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalGenerated,
        totalErrors: errors.length,
      });

      functions.logger.info('Batch generation completed', {
        totalGenerated,
        totalErrors: errors.length,
      });

      return {
        totalGenerated,
        errors: errors.slice(0, 10), // Return first 10 errors only
        totalErrors: errors.length,
      };
    } catch (error) {
      functions.logger.error('Batch generation failed', { error });

      throw new functions.https.HttpsError(
        'internal',
        `Batch generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

// ========== FUNCTION 3: approveAndPublishContent ==========

/**
 * Approve content and create page mappings for publishing
 */
export const approveAndPublishContent = functions.https.onCall(
  async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { contentIds } = data;

    // Validate input
    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'contentIds must be a non-empty array'
      );
    }

    const db = admin.firestore();
    let approved = 0;
    let published = 0;

    try {
      functions.logger.info('Approving and publishing content', {
        count: contentIds.length,
        userId: context.auth.uid,
      });

      // Process in batches (Firestore batch limit is 500)
      const batchSize = 500;
      for (let i = 0; i < contentIds.length; i += batchSize) {
        const batchContentIds = contentIds.slice(i, i + batchSize);
        const batch = db.batch();

        for (const contentId of batchContentIds) {
          const contentRef = db.collection('service_content').doc(contentId);
          const contentDoc = await contentRef.get();

          if (!contentDoc.exists) {
            functions.logger.warn('Content not found', { contentId });
            continue;
          }

          const content = contentDoc.data() as ServiceContentData;

          // Mark as approved
          batch.update(contentRef, {
            approvalStatus: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: context.auth.uid,
          });

          approved++;

          // Create page mapping entry
          const pagePath = `/${content.serviceId}/${content.locationId}`;
          const mappingRef = db.collection('page_mappings').doc(contentId);

          batch.set(mappingRef, {
            contentId,
            serviceId: content.serviceId,
            locationId: content.locationId,
            websiteId: content.websiteId,
            pagePath,
            status: 'approved',
            readyForPublish: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          published++;
        }

        await batch.commit();
      }

      functions.logger.info('Content approved and published', { approved, published });

      return {
        approved,
        published,
      };
    } catch (error) {
      functions.logger.error('Approval/publishing failed', { error });

      throw new functions.https.HttpsError(
        'internal',
        `Failed to approve/publish: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// ========== FUNCTION 4: generatePageMetadata ==========

/**
 * Generate comprehensive metadata for a content piece
 */
export const generatePageMetadata = functions.https.onCall(
  async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { contentId } = data;

    if (!contentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'contentId is required'
      );
    }

    const db = admin.firestore();

    try {
      const contentDoc = await db.collection('service_content').doc(contentId).get();

      if (!contentDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Content not found');
      }

      const content = contentDoc.data() as ServiceContentData;

      // Fetch service and location for additional metadata
      const [serviceDoc, locationDoc] = await Promise.all([
        db.collection('services').doc(content.serviceId).get(),
        db.collection('locations').doc(content.locationId).get(),
      ]);

      const service = serviceDoc.data() as Service;
      const location = locationDoc.data() as Location;

      // Generate comprehensive metadata
      const metadata = {
        metaTitle: content.title,
        metaDescription: content.metaDescription,
        ogTitle: content.title,
        ogDescription: content.metaDescription,
        ogImage: generateOGImageUrl(content.websiteId, content.serviceId),
        twitterCard: 'summary_large_image',
        twitterTitle: content.title,
        twitterDescription: content.metaDescription,
        twitterImage: generateOGImageUrl(content.websiteId, content.serviceId),
        canonical: generateCanonicalUrl(
          content.websiteId,
          content.serviceId,
          content.locationId
        ),
        robots: 'index, follow',
        breadcrumbs: generateBreadcrumbs(
          content.websiteId,
          content.serviceId,
          content.locationId,
          service.name,
          location.name
        ),
        schema: content.schema,
        keywords: content.keywords,
        author: 'Royal Carriage Limousine',
        publishedTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
      };

      // Store metadata
      await db.collection('service_content').doc(contentId).update({
        metadata,
        metadataGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info('Metadata generated', { contentId });

      return { metadata };
    } catch (error) {
      functions.logger.error('Metadata generation failed', { error });

      throw new functions.https.HttpsError(
        'internal',
        `Metadata generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// ========== FUNCTION 5: buildStaticPages ==========

/**
 * Build static page data for Astro sites from approved content
 */
export const buildStaticPages = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { websiteId, limit = 1000 } = data;

    if (!websiteId) {
      throw new functions.https.HttpsError('invalid-argument', 'websiteId is required');
    }

    const db = admin.firestore();
    let pagesBuilt = 0;

    try {
      functions.logger.info('Building static pages', { websiteId, limit });

      // Fetch all approved content for this website
      const contentSnapshot = await db
        .collection('service_content')
        .where('websiteId', '==', websiteId)
        .where('approvalStatus', '==', 'approved')
        .limit(limit)
        .get();

      functions.logger.info(`Found ${contentSnapshot.size} approved pages`);

      // Build page data for each content piece
      const batch = db.batch();

      for (const doc of contentSnapshot.docs) {
        const content = doc.data() as ServiceContentData;
        const contentId = doc.id;

        // Fetch service and location data
        const [serviceDoc, locationDoc] = await Promise.all([
          db.collection('services').doc(content.serviceId).get(),
          db.collection('locations').doc(content.locationId).get(),
        ]);

        if (!serviceDoc.exists || !locationDoc.exists) {
          functions.logger.warn('Missing service or location', { contentId });
          continue;
        }

        const service = serviceDoc.data() as Service;
        const location = locationDoc.data() as Location;

        // Generate static page data
        const pageData = {
          id: contentId,
          websiteId: content.websiteId,
          serviceId: content.serviceId,
          locationId: content.locationId,
          path: `/${content.serviceId}/${content.locationId}`,
          title: content.title,
          metaDescription: content.metaDescription,
          content: content.content,
          metadata: (content as any).metadata || {},
          schema: content.schema,
          internalLinks: content.internalLinks,
          keywords: content.keywords,
          serviceName: service.name,
          locationName: location.name,
          buildStatus: 'ready',
          builtAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Store in static_pages collection
        const pageRef = db.collection('static_pages').doc(contentId);
        batch.set(pageRef, pageData);

        pagesBuilt++;
      }

      await batch.commit();

      functions.logger.info('Static pages built', { pagesBuilt });

      return { pagesBuilt };
    } catch (error) {
      functions.logger.error('Static page build failed', { error });

      throw new functions.https.HttpsError(
        'internal',
        `Static page build failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

// ========== HELPER FUNCTIONS ==========

/**
 * Generate content using Gemini AI
 */
async function generateContentWithGemini(
  service: Service,
  location: Location,
  websiteId: string
): Promise<GeneratedContent> {
  const prompt = buildContentPrompt(service, location, websiteId);

  try {
    const response = await geminiClient.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 4096,
      model: 'gemini-1.5-flash',
    });

    // Parse JSON response
    const parsed = geminiClient.parseJSON<GeneratedContent>(response);

    if (!parsed) {
      throw new Error('Failed to parse Gemini response as JSON');
    }

    return parsed;
  } catch (error) {
    functions.logger.error('Gemini generation failed', { error });

    // Return fallback content
    return createFallbackContent(service, location);
  }
}

/**
 * Build comprehensive AI prompt
 */
function buildContentPrompt(
  service: Service,
  location: Location,
  websiteId: string
): string {
  const websiteContext = {
    airport: 'luxury airport limousine service',
    corporate: 'premium executive car service',
    wedding: 'elegant wedding transportation',
    partybus: 'fun party bus service',
  }[websiteId] || 'premium limousine service';

  return `Generate SEO-optimized content for a ${websiteContext} page.

Service: ${service.name}
Location: ${location.name}
Description: ${service.description}
Location Details: ${location.description || 'Chicago area'}
Landmarks: ${location.landmarks?.join(', ') || 'N/A'}

Return ONLY a JSON object with this exact structure:

{
  "hero": "Compelling 2-3 sentence hero text (40-60 words)",
  "overview": "Service overview paragraph (150-200 words)",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "whyChooseUs": "Why choose us section (100-150 words, location-specific)",
  "localInfo": "Local information about ${location.name} (100-150 words, mention landmarks)",
  "faq": [
    {"question": "Common question 1?", "answer": "Detailed answer 1 (30-50 words)"},
    {"question": "Common question 2?", "answer": "Detailed answer 2 (30-50 words)"},
    {"question": "Common question 3?", "answer": "Detailed answer 3 (30-50 words)"},
    {"question": "Common question 4?", "answer": "Detailed answer 4 (30-50 words)"},
    {"question": "Common question 5?", "answer": "Detailed answer 5 (30-50 words)"}
  ],
  "cta": "Strong call-to-action text (20-30 words)"
}

Requirements:
- Natural, engaging writing (avoid keyword stuffing)
- Include ${location.name} references in content
- Professional tone
- Action-oriented language
- Location-specific details`;
}

/**
 * Create fallback content if AI generation fails
 */
function createFallbackContent(service: Service, location: Location): GeneratedContent {
  return {
    hero: `Experience premium ${service.name.toLowerCase()} in ${location.name}. Professional service, luxury vehicles, and exceptional customer care.`,
    overview: `Our ${service.name.toLowerCase()} in ${location.name} provides the ultimate transportation experience. ${service.description} We pride ourselves on punctuality, professionalism, and attention to detail.`,
    features: [
      'Professional chauffeurs',
      'Luxury fleet vehicles',
      '24/7 availability',
      'Competitive pricing',
      'On-time guarantee',
    ],
    whyChooseUs: `Choose us for ${service.name.toLowerCase()} in ${location.name} because we combine years of experience with modern technology and a commitment to excellence. Our local knowledge and professional service ensure a seamless experience.`,
    localInfo: `${location.name} is a vibrant area with ${location.landmarks?.length || 'many'} notable landmarks. We provide reliable service throughout the region, ensuring you arrive safely and on time.`,
    faq: [
      {
        question: `How do I book ${service.name.toLowerCase()} in ${location.name}?`,
        answer: 'You can book online through our website or call us directly. We recommend booking in advance for the best availability.',
      },
      {
        question: 'What areas do you serve?',
        answer: `We serve ${location.name} and surrounding areas throughout the Chicago region.`,
      },
      {
        question: 'What vehicles are available?',
        answer: 'We offer a range of luxury vehicles including sedans, SUVs, stretch limousines, and party buses.',
      },
      {
        question: 'Do you offer 24/7 service?',
        answer: 'Yes, we provide around-the-clock service for your convenience.',
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'We offer flexible cancellation options. Please contact us for details on our cancellation policy.',
      },
    ],
    cta: 'Book your luxury transportation today. Call us now or reserve online for the best rates.',
  };
}

/**
 * Create SEO-optimized title
 */
function createSEOTitle(serviceName: string, locationName: string): string {
  const title = `${serviceName} in ${locationName} | Royal Carriage Limo`;
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

/**
 * Create meta description
 */
function createMetaDescription(
  serviceName: string,
  locationName: string,
  description: string
): string {
  const meta = `Professional ${serviceName.toLowerCase()} in ${locationName}. ${description.substring(0, 80)}. Book now!`;
  return meta.length > 155 ? meta.substring(0, 152) + '...' : meta;
}

/**
 * Generate keywords
 */
function generateKeywords(service: Service, location: Location): string[] {
  const baseKeywords = service.keywords || [];
  const locationKeywords = [
    `${service.name} ${location.name}`,
    `${service.name.toLowerCase()} in ${location.name}`,
    `${location.name} ${service.name.toLowerCase()}`,
    `${location.name} limo service`,
    `luxury transportation ${location.name}`,
  ];

  return [...new Set([...baseKeywords, ...locationKeywords])].slice(0, 20);
}

/**
 * Generate schema markup
 */
function generateSchemaMarkup(
  service: Service,
  location: Location,
  websiteId: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${location.name}`,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Royal Carriage Limousine',
      url: getDomainForWebsite(websiteId),
      telephone: '+1-312-XXX-XXXX',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Chicago',
        addressRegion: 'IL',
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'City',
      name: location.name,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceRange: '$$$',
    },
  };
}

/**
 * Generate internal links
 */
function generateInternalLinks(
  serviceId: string,
  locationId: string,
  websiteId: string
): string[] {
  // This would be more sophisticated in production
  return [
    `/services/${serviceId}`,
    `/locations/${locationId}`,
    '/fleet',
    '/about',
    '/contact',
  ];
}

/**
 * Generate OG image URL
 */
function generateOGImageUrl(websiteId: string, serviceId: string): string {
  return `/images/og-${websiteId}-${serviceId}.jpg`;
}

/**
 * Generate canonical URL
 */
function generateCanonicalUrl(
  websiteId: string,
  serviceId: string,
  locationId: string
): string {
  const domain = getDomainForWebsite(websiteId);
  return `${domain}/${serviceId}/${locationId}`;
}

/**
 * Generate breadcrumbs
 */
function generateBreadcrumbs(
  websiteId: string,
  serviceId: string,
  locationId: string,
  serviceName: string,
  locationName: string
): Array<{ name: string; url: string }> {
  const domain = getDomainForWebsite(websiteId);

  return [
    { name: 'Home', url: domain },
    { name: 'Services', url: `${domain}/services` },
    { name: serviceName, url: `${domain}/services/${serviceId}` },
    { name: locationName, url: `${domain}/${serviceId}/${locationId}` },
  ];
}

/**
 * Get domain for website ID
 */
function getDomainForWebsite(websiteId: string): string {
  const domains: Record<string, string> = {
    airport: 'https://chicagoairportblackcar.com',
    corporate: 'https://chicagoexecutivecarservice.com',
    wedding: 'https://chicagoweddingtransportation.com',
    partybus: 'https://chicago-partybus.com',
  };

  return domains[websiteId] || 'https://royalcarriagelimousine.com';
}

/**
 * Generate single content piece (used in batch processing)
 */
async function generateSingleContent(
  db: admin.firestore.Firestore,
  locationId: string,
  serviceId: string,
  websiteId: string
): Promise<void> {
  // Fetch location and service
  const [locationDoc, serviceDoc] = await Promise.all([
    db.collection('locations').doc(locationId).get(),
    db.collection('services').doc(serviceId).get(),
  ]);

  if (!locationDoc.exists || !serviceDoc.exists) {
    throw new Error('Location or service not found');
  }

  const location = { id: locationDoc.id, ...locationDoc.data() } as Location;
  const service = { id: serviceDoc.id, ...serviceDoc.data() } as Service;

  // Generate content
  const generatedContent = await generateContentWithGemini(service, location, websiteId);

  const title = createSEOTitle(service.name, location.name);
  const metaDescription = createMetaDescription(
    service.name,
    location.name,
    service.description
  );
  const keywords = generateKeywords(service, location);
  const schema = generateSchemaMarkup(service, location, websiteId);
  const internalLinks = generateInternalLinks(serviceId, locationId, websiteId);

  const contentId = `${serviceId}-${locationId}`;

  // Store content
  await db
    .collection('service_content')
    .doc(contentId)
    .set({
      serviceId,
      locationId,
      websiteId,
      title,
      metaDescription,
      content: generatedContent,
      internalLinks,
      schema,
      keywords,
      approvalStatus: 'pending',
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Create batches for processing
 */
function createBatches(
  locationIds: string[],
  serviceIds: string[],
  batchSize: number
): Array<Array<{ locationId: string; serviceId: string }>> {
  const combinations: Array<{ locationId: string; serviceId: string }> = [];

  for (const locationId of locationIds) {
    for (const serviceId of serviceIds) {
      combinations.push({ locationId, serviceId });
    }
  }

  const batches: Array<Array<{ locationId: string; serviceId: string }>> = [];

  for (let i = 0; i < combinations.length; i += batchSize) {
    batches.push(combinations.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
