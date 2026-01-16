/**
 * Cloud Functions: Content Generation System
 * Purpose: Generate AI-powered content for 4,000+ location-service pages
 * Uses: Gemini AI for research and content creation
 * Workflow: AI generates → Admin approves → Pages published
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GeminiClient } from "./shared/gemini-client";

interface Location {
  id: string;
  name: string;
  description: string;
  landmarks: string[];
  demographics: Record<string, string>;
  weddingVenues?: number;
  hotels?: number;
  restaurants?: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  keywords: string[];
  searchVolume: number;
}

interface GeneratedContent {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  schema: Record<string, unknown>;
  internalLinks: string[];
}

/**
 * Cloud Function: generateServiceContent
 * Generates AI-powered content for a location-service combination
 * Trigger: HTTP callable or Cloud Task (batch processing)
 * Input: serviceId, locationId, websiteId
 * Output: Content saved to service_content collection, queued for approval
 */
export const generateServiceContent = functions.https.onCall(
  async (data, context) => {
    // Verify admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin only");
    }

    const { serviceId, locationId, websiteId } = data;

    if (!serviceId || !locationId || !websiteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters"
      );
    }

    const db = admin.firestore();
    const geminiClient = GeminiClient.getInstance();

    try {
      functions.logger.info(
        `Generating content for ${serviceId} in ${locationId} on ${websiteId}`
      );

      // Fetch service and location data
      const serviceDoc = await db.collection("services").doc(serviceId).get();
      const locationDoc = await db.collection("locations").doc(locationId).get();

      if (!serviceDoc.exists || !locationDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Service or location not found");
      }

      const service = serviceDoc.data() as Service;
      const location = locationDoc.data() as Location;

      // Generate content using Gemini AI
      const generatedContent = await generateContentWithAI(
        geminiClient,
        service,
        location,
        websiteId
      );

      // Save to service_content collection for approval
      const contentId = `${serviceId}-${locationId}`;
      const contentPath = `service_content/${contentId}`;

      await db.doc(contentPath).set({
        serviceId,
        locationId,
        websiteId,
        title: generatedContent.title,
        metaDescription: generatedContent.metaDescription,
        content: generatedContent.content,
        keywords: generatedContent.keywords,
        schema: generatedContent.schema,
        internalLinks: generatedContent.internalLinks,
        approvalStatus: "pending",
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        aiQualityScore: 0.85, // Placeholder - calculate based on content metrics
      });

      // Add to approval queue
      await db.collection("content_approval_queue").add({
        contentId,
        contentType: "service-location",
        status: "pending",
        serviceId,
        locationId,
        websiteId,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Content generated and queued for approval: ${contentId}`);

      return {
        success: true,
        contentId,
        message: `Content generated for ${service.name} in ${location.name}`,
        preview: {
          title: generatedContent.title,
          description: generatedContent.metaDescription,
        },
      };
    } catch (error) {
      functions.logger.error("Error generating content:", error);
      throw new functions.https.HttpsError("internal", `Content generation failed: ${error}`);
    }
  }
);

/**
 * Cloud Function: generateContentBatch
 * Batch generate content for multiple location-service combinations
 * Triggers queue-based processing for 100+ pages at once
 */
export const generateContentBatch = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin only");
    }

    const { websiteId, locationIds, serviceIds, maxConcurrent = 5 } = data;

    if (!websiteId || !locationIds || !serviceIds) {
      throw new functions.https.HttpsError("invalid-argument", "Missing parameters");
    }

    const db = admin.firestore();
    let generated = 0;
    let failed = 0;

    try {
      functions.logger.info(
        `Starting batch generation: ${locationIds.length} locations × ${serviceIds.length} services`
      );

      // Process in batches to avoid timeout
      for (let i = 0; i < locationIds.length; i += maxConcurrent) {
        const batch = locationIds.slice(i, i + maxConcurrent);

        for (const locationId of batch) {
          for (const serviceId of serviceIds) {
            try {
              // Call generateServiceContent for each combination
              const result = await generateServiceContent.run(
                {
                  serviceId,
                  locationId,
                  websiteId,
                },
                { auth: context.auth }
              );

              if (result.success) {
                generated++;
              }
            } catch (error) {
              functions.logger.error(
                `Failed to generate ${serviceId}-${locationId}:`,
                error
              );
              failed++;
            }
          }
        }

        // Log progress
        functions.logger.info(
          `Batch progress: ${generated} generated, ${failed} failed`
        );
      }

      return {
        success: true,
        generated,
        failed,
        total: locationIds.length * serviceIds.length,
        message: `Batch generation complete: ${generated} success, ${failed} failed`,
      };
    } catch (error) {
      functions.logger.error("Batch generation error:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Batch generation failed: ${error}`
      );
    }
  }
);

/**
 * Internal function: Generate content using Gemini AI
 * Researches location, service, and creates SEO-optimized content
 */
async function generateContentWithAI(
  geminiClient: GeminiClient,
  service: Service,
  location: Location,
  websiteId: string
): Promise<GeneratedContent> {
  // Build prompt for Gemini AI
  const prompt = buildContentPrompt(service, location, websiteId);

  // Call Gemini to generate content
  const aiContent = await geminiClient.generateContent(prompt);

  // Parse AI response
  const content = typeof aiContent === "string" ? aiContent : (aiContent as any).text;

  // Extract sections from content
  const title = extractSection(content, "TITLE");
  const metaDescription = extractSection(content, "META_DESCRIPTION");
  const pageContent = extractSection(content, "CONTENT");
  const keywordsList = extractKeywords(content);
  const internalLinks = generateInternalLinks(service.id, location.id);

  // Generate JSON-LD schema
  const schema = generateSchema(service, location);

  return {
    title: title || `${service.name} in ${location.name}`,
    metaDescription:
      metaDescription ||
      `Professional ${service.name.toLowerCase()} service in ${location.name}, Chicago. ${location.description?.substring(
        0,
        80
      )}...`,
    content: pageContent || content,
    keywords: keywordsList,
    schema,
    internalLinks,
  };
}

/**
 * Build AI prompt for content generation
 */
function buildContentPrompt(
  service: Service,
  location: Location,
  websiteId: string
): string {
  const siteContext = {
    airport:
      "luxury airport limousine service with focus on transfers, convenience, and professional service",
    corporate:
      "premium executive car service with focus on business travel, professional image, and reliability",
    wedding:
      "luxury wedding transportation service with focus on special occasions, elegance, and guest coordination",
    partyBus: "fun group celebration service with focus on entertainment, safety, and memorable experiences",
  }[websiteId] || "premium transportation service";

  return `
You are an SEO expert copywriter. Generate unique, engaging content for a limousine service webpage.

Service: ${service.name}
Location: ${location.name}
Service Description: ${service.description}
Location Details: ${location.description}
Landmarks: ${location.landmarks?.join(", ")}

Website Context: ${siteContext}
Target Keywords: ${service.keywords?.slice(0, 5).join(", ")}

Create optimized content with these sections:

TITLE:
Create a compelling H1 title (max 60 chars) that includes the service name, location, and is SEO-optimized.
Example format: "[Service] in [Location] | [Unique Angle]"

META_DESCRIPTION:
Write a meta description (155-160 chars) that's compelling and includes main keyword.
Include: service type, location, and unique value proposition.

CONTENT:
Write 1,500-2,000 words of engaging, SEO-optimized content covering:
1. Service Overview (200 words) - What the service is, why it matters
2. Why Choose Us in ${location.name} (150 words) - Local relevance, unique benefits
3. Service Details (300 words) - What's included, features, process
4. ${location.name} Specifics (200 words) - Local landmarks, business info, why this location matters
5. Fleet Options (150 words) - Vehicle recommendations for this service
6. Pricing & Availability (150 words) - Cost structure, when available
7. Customer Experience (200 words) - What to expect, process flow
8. FAQ Section (250 words) - 5-6 common questions with answers
9. Booking & Contact (100 words) - How to book, why choose us

Make content:
- Natural and engaging (avoid keyword stuffing)
- SEO-optimized with 2-3% keyword density
- Specific to location and service
- Include local references where possible
- Professional tone matching the service
- Action-oriented with CTAs

KEYWORDS:
List 15-20 long-tail keywords related to this service and location.
Format: keyword1, keyword2, keyword3...
`;
}

/**
 * Extract a specific section from AI-generated content
 */
function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(
    `${sectionName}:?\\s*(.+?)(?=\\n[A-Z_]+:|$)`,
    "is"
  );
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const keywordSection = extractSection(content, "KEYWORDS");
  if (!keywordSection) return [];

  return keywordSection
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 20);
}

/**
 * Generate internal links for this page
 * Links to related services, locations, and vehicles
 */
function generateInternalLinks(serviceId: string, locationId: string): string[] {
  const links = [];

  // Link to related services (same website)
  const relatedServices = getRelatedServices(serviceId);
  relatedServices.forEach((svc) => {
    links.push(`/${serviceId.split("-")[0]}/${svc}/${locationId}`);
  });

  // Link to nearby locations
  const nearbyLocations = getNearbyLocations(locationId);
  nearbyLocations.forEach((loc) => {
    links.push(`/${serviceId.split("-")[0]}/${serviceId}/${loc}`);
  });

  // Link to service overview page
  links.push(`/services/${serviceId}`);

  // Link to location hub page
  links.push(`/locations/${locationId}`);

  return links.slice(0, 12); // Max 12 internal links per page
}

/**
 * Get related services (mock - would fetch from DB in production)
 */
function getRelatedServices(serviceId: string): string[] {
  const serviceRelations: Record<string, string[]> = {
    "airport-ohare": ["airport-midway", "airport-downtown-hotel"],
    "airport-midway": ["airport-ohare", "airport-suburban-hotel"],
    "wedding-bride": ["wedding-groom", "wedding-guest"],
    "wedding-groom": ["wedding-bride", "wedding-guest"],
    "party-bachelor": ["party-bachelorette", "party-birthday"],
  };

  return serviceRelations[serviceId] || [];
}

/**
 * Get nearby locations (mock - would calculate from coordinates in production)
 */
function getNearbyLocations(locationId: string): string[] {
  const nearbyMaps: Record<string, string[]> = {
    naperville: ["wheaton", "downers-grove", "hinsdale"],
    wheaton: ["naperville", "downers-grove", "elmhurst"],
    evanston: ["skokie", "glenview", "wilmette"],
  };

  return nearbyMaps[locationId] || [];
}

/**
 * Generate JSON-LD schema for page
 */
function generateSchema(
  service: Service,
  location: Location
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} in ${location.name}`,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: "Royal Carriage Limousine",
      url: "https://royalcarriagelimousine.com",
    },
    areaServed: {
      "@type": "City",
      name: location.name,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceRange: "$$$",
    },
  };
}

/**
 * Cloud Function: approveAndPublishContent
 * Admin approves content, marks as ready for page generation
 */
export const approveAndPublishContent = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin only");
    }

    const { contentId, approved, feedback } = data;

    if (!contentId || approved === undefined) {
      throw new functions.https.HttpsError("invalid-argument", "Missing parameters");
    }

    const db = admin.firestore();

    try {
      if (approved) {
        // Mark as approved
        await db.collection("service_content").doc(contentId).update({
          approvalStatus: "approved",
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: context.auth?.uid,
        });

        // Update mapping status
        await db.collection("page_mappings").doc(contentId).update({
          status: "approved",
          readyForPublish: true,
        });

        functions.logger.info(`Content approved: ${contentId}`);
      } else {
        // Mark as rejected with feedback
        await db.collection("service_content").doc(contentId).update({
          approvalStatus: "rejected",
          rejectionFeedback: feedback,
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          rejectedBy: context.auth?.uid,
        });

        functions.logger.info(`Content rejected: ${contentId}`);
      }

      return {
        success: true,
        contentId,
        status: approved ? "approved" : "rejected",
      };
    } catch (error) {
      functions.logger.error("Error updating content status:", error);
      throw new functions.https.HttpsError("internal", `Update failed: ${error}`);
    }
  }
);
