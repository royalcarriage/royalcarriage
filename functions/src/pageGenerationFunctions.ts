/**
 * Cloud Functions: Static Page Generation
 * Purpose: Build Astro static pages from approved content
 * Process: Approved content → Generate .astro files → Build → Deploy
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface PageMapping {
  serviceId: string;
  locationId: string;
  websiteId: string;
  status: string;
  pagePath: string;
}

interface ServiceContent {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  schema: Record<string, unknown>;
  internalLinks: string[];
}

/**
 * Cloud Function: generatePageMetadata
 * Creates meta titles, descriptions, OG images, breadcrumbs for approved content
 */
export const generatePageMetadata = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin only");
    }

    const { contentId, serviceId, locationId, websiteId } = data;

    if (!contentId || !serviceId || !locationId || !websiteId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing parameters");
    }

    const db = admin.firestore();

    try {
      functions.logger.info(`Generating metadata for ${contentId}`);

      // Fetch service and location data
      const serviceDoc = await db.collection("services").doc(serviceId).get();
      const locationDoc = await db.collection("locations").doc(locationId).get();
      const contentDoc = await db.collection("service_content").doc(contentId).get();

      if (!serviceDoc.exists || !locationDoc.exists || !contentDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Missing data");
      }

      const service = serviceDoc.data();
      const location = locationDoc.data();
      const content = contentDoc.data() as ServiceContent;

      // Generate metadata
      const metadata = {
        metaTitle: generateMetaTitle(service.name, location.name),
        metaDescription: content.metaDescription,
        ogImage: generateOGImage(websiteId, service.name),
        twitterImage: generateOGImage(websiteId, service.name),
        canonical: generateCanonical(websiteId, serviceId, locationId),
        breadcrumbs: generateBreadcrumbs(websiteId, serviceId, locationId, service.name, location.name),
        structuredData: content.schema,
      };

      // Save metadata to content document
      await db.collection("service_content").doc(contentId).update({
        metadata,
        metadataGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Metadata generated for ${contentId}`);

      return {
        success: true,
        contentId,
        metadata,
      };
    } catch (error) {
      functions.logger.error("Error generating metadata:", error);
      throw new functions.https.HttpsError("internal", `Metadata generation failed: ${error}`);
    }
  }
);

/**
 * Cloud Function: buildStaticPages
 * Generates Astro components for approved pages and builds static site
 */
export const buildStaticPages = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin only");
    }

    const { websiteId, maxPages = 100 } = data;

    if (!websiteId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing websiteId");
    }

    const db = admin.firestore();

    try {
      functions.logger.info(
        `Starting page build for ${websiteId} (max ${maxPages} pages)`
      );

      // Get approved content
      const approvedContent = await db
        .collection("service_content")
        .where("approvalStatus", "==", "approved")
        .where("websiteId", "==", websiteId)
        .limit(maxPages)
        .get();

      let generatedPages = 0;
      let failedPages = 0;

      // Generate .astro files for each approved content
      for (const doc of approvedContent.docs) {
        const content = doc.data() as ServiceContent;
        const data = doc.data() as any;
        const { serviceId, locationId, metadata } = {
          ...data,
          metadata: data.metadata || {},
        };

        try {
          // Generate Astro component content
          const astroContent = generateAstroComponent(
            serviceId,
            locationId,
            content,
            metadata
          );

          // In production, would write to file system or trigger build
          // For now, store in Firestore for demonstration
          await db.collection("generated_pages").doc(doc.id).set({
            serviceId,
            locationId,
            websiteId,
            astroContent,
            status: "generated",
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update page mapping
          await db
            .collection("page_mappings")
            .doc(`${serviceId}-${locationId}`)
            .update({
              status: "generated",
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          generatedPages++;
          functions.logger.debug(
            `Generated page: ${serviceId}/${locationId}`
          );
        } catch (error) {
          functions.logger.error(
            `Failed to generate ${serviceId}/${locationId}:`,
            error
          );
          failedPages++;
        }
      }

      return {
        success: true,
        websiteId,
        generatedPages,
        failedPages,
        total: approvedContent.size,
        message: `Generated ${generatedPages} pages for ${websiteId}`,
      };
    } catch (error) {
      functions.logger.error("Error building pages:", error);
      throw new functions.https.HttpsError("internal", `Page build failed: ${error}`);
    }
  }
);

/**
 * Generate Astro component content for a page
 */
function generateAstroComponent(
  serviceId: string,
  locationId: string,
  content: ServiceContent,
  metadata: Record<string, unknown>
): string {
  const canonicalUrl = (metadata.canonical as string) || "/";
  const breadcrumbs = (metadata.breadcrumbs as any[]) || [];
  const schema = (metadata.structuredData as any) || {};

  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { generateMetaTags } from '@packages/astro-utils/seo';

const metaTags = generateMetaTags({
  title: "${content.title.replace(/"/g, '\\"')}",
  description: "${content.metaDescription.replace(/"/g, '\\"')}",
  canonical: "${canonicalUrl}",
  ogImage: "${metadata.ogImage || '/images/og-default.svg'}",
});

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    ${breadcrumbs
      .map(
        (item: any, idx: number) => `{
      "@type": "ListItem",
      "position": ${idx + 1},
      "name": "${item.name}",
      "item": "${item.url}"
    }`
      )
      .join(",\n    ")}
  ]
};
---

<BaseLayout {...metaTags}>
  <!-- Breadcrumb Navigation -->
  <div class="breadcrumb-nav mb-6">
    <nav aria-label="Breadcrumb">
      <ol class="flex text-sm text-gray-600">
        ${breadcrumbs
          .map(
            (item: any) => `<li><a href="${item.url}" class="hover:text-blue-600">${item.name}</a> <span class="mx-2">/</span></li>`
          )
          .join("\n        ")}
      </ol>
    </nav>
  </div>

  <!-- Main Content -->
  <article class="prose prose-lg max-w-4xl mx-auto">
    <h1>${content.title}</h1>
    <div set:html={sanitizeHtml(\`${content.content}\`)} />
  </article>

  <!-- Internal Links Section -->
  <aside class="mt-12 bg-gray-50 p-8 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Related Services & Locations</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      ${content.internalLinks
        .map(
          (link: string) => `<a href="${link}" class="text-blue-600 hover:underline">Related Service</a>`
        )
        .join("\n      ")}
    </div>
  </aside>

  <!-- Schema Markup -->
  <script type="application/ld+json" set:html={JSON.stringify({
    ...schema,
    "@context": "https://schema.org"
  })} />

  <script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />
</BaseLayout>

<style>
  .breadcrumb-nav ol {
    display: flex;
    flex-wrap: wrap;
  }

  .breadcrumb-nav li:last-child span {
    display: none;
  }
</style>`;
}

/**
 * Generate meta title (max 60 chars)
 */
function generateMetaTitle(serviceName: string, locationName: string): string {
  const title = `${serviceName} in ${locationName} | Royal Carriage`;
  return title.length > 60 ? title.substring(0, 57) + "..." : title;
}

/**
 * Generate OG image path (service-specific)
 */
function generateOGImage(websiteId: string, serviceName: string): string {
  const serviceSlug = serviceName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const serviceType = {
    airport: "airport-services",
    corporate: "corporate-services",
    wedding: "wedding-services",
    partyBus: "party-bus-services",
  }[websiteId] || "services";

  return `/images/og-${serviceType}.svg`;
}

/**
 * Generate canonical URL
 */
function generateCanonical(
  websiteId: string,
  serviceId: string,
  locationId: string
): string {
  const domain = {
    airport: "https://chicagoairportblackcar.web.app",
    corporate: "https://chicagoexecutivecarservice.web.app",
    wedding: "https://chicagoweddingtransportation.web.app",
    partyBus: "https://chicago-partybus.web.app",
  }[websiteId] || "https://royalcarriagelimousine.com";

  return `${domain}/${serviceId}/${locationId}`;
}

/**
 * Generate breadcrumb schema
 */
function generateBreadcrumbs(
  websiteId: string,
  serviceId: string,
  locationId: string,
  serviceName: string,
  locationName: string
): Array<{ name: string; url: string }> {
  const baseDomain = {
    airport: "https://chicagoairportblackcar.web.app",
    corporate: "https://chicagoexecutivecarservice.web.app",
    wedding: "https://chicagoweddingtransportation.web.app",
    partyBus: "https://chicago-partybus.web.app",
  }[websiteId] || "https://royalcarriagelimousine.com";

  return [
    { name: "Home", url: baseDomain },
    { name: "Services", url: `${baseDomain}/services` },
    { name: serviceName, url: `${baseDomain}/services/${serviceId}` },
    { name: locationName, url: `${baseDomain}/${serviceId}/${locationId}` },
  ];
}

/**
 * Cloud Function: publishPages
 * Prepares approved pages for Astro build and Firebase Hosting deployment
 */
export const publishPages = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Admin only");
  }

  const { websiteId } = data;

  if (!websiteId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing websiteId");
  }

  const db = admin.firestore();

  try {
    functions.logger.info(`Publishing pages for ${websiteId}`);

    // Mark generated pages as ready to publish
    const batch = db.batch();
    const pages = await db
      .collection("generated_pages")
      .where("websiteId", "==", websiteId)
      .where("status", "==", "generated")
      .get();

    pages.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "ready-for-publish",
        preparedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    functions.logger.info(`Prepared ${pages.size} pages for publishing`);

    return {
      success: true,
      websiteId,
      pagesReady: pages.size,
      message: `${pages.size} pages ready for Firebase Hosting deployment`,
      nextSteps: "Run: firebase deploy --only hosting",
    };
  } catch (error) {
    functions.logger.error("Error publishing pages:", error);
    throw new functions.https.HttpsError("internal", `Publishing failed: ${error}`);
  }
});

/**
 * Helper: Sanitize HTML content
 */
function sanitizeHtml(html: string): string {
  // Remove any script tags or dangerous content
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
}
