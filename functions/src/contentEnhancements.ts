/**
 * RC-201: Content Generation Enhancements
 * Location-specific FAQ templates, multilingual support, SEO optimization, A/B variants
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";

const db = admin.firestore();
const vertexAI = new VertexAI({
  project: "royalcarriagelimoseo",
  location: "us-central1",
});
const model = vertexAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "es", "pl", "zh", "ko"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Location-specific FAQ templates
const LOCATION_FAQ_TEMPLATES: Record<string, string[]> = {
  "downtown-loop": [
    "What are the best pickup locations in the Loop?",
    "How long does it take to reach O'Hare from downtown?",
    "Do you provide service to Millennium Park events?",
    "Can you accommodate business travelers from downtown hotels?",
    "What's the best route during rush hour from the Loop?",
  ],
  "river-north": [
    "Do you service River North nightlife venues?",
    "What's the wait time for pickups from River North restaurants?",
    "Can you provide late-night transportation from River North?",
  ],
  "gold-coast": [
    "Do you offer luxury vehicles for Gold Coast residents?",
    "Can you provide discreet service for high-profile clients?",
    "What premium amenities are available?",
  ],
  naperville: [
    "How far in advance should I book for Naperville pickups?",
    "Do you service Naperville corporate parks?",
    "What's the typical fare from Naperville to O'Hare?",
  ],
  schaumburg: [
    "Do you provide corporate accounts for Schaumburg businesses?",
    "Can you handle group transportation for conventions?",
    "What's the service area around Schaumburg?",
  ],
  default: [
    "How do I book a ride?",
    "What payment methods do you accept?",
    "Can I modify or cancel my reservation?",
    "Do you provide child car seats?",
    "What is your cancellation policy?",
  ],
};

// SEO keyword templates by service
const SEO_KEYWORDS: Record<string, string[]> = {
  airport: [
    "airport transfer",
    "airport limo",
    "airport car service",
    "airport shuttle",
    "O'Hare transportation",
    "Midway car service",
    "private airport transfer",
  ],
  corporate: [
    "corporate transportation",
    "executive car service",
    "business travel",
    "corporate shuttle",
    "meeting transportation",
    "executive limo",
  ],
  wedding: [
    "wedding transportation",
    "wedding limo",
    "bridal car service",
    "wedding guest shuttle",
    "luxury wedding car",
    "wedding party bus",
  ],
  partyBus: [
    "party bus rental",
    "bachelor party bus",
    "bachelorette party bus",
    "nightclub transportation",
    "birthday party bus",
    "event transportation",
  ],
};

interface ContentVariant {
  id: string;
  variant: "A" | "B";
  content: Record<string, any>;
  createdAt: FirebaseFirestore.Timestamp;
}

interface MultilingualContent {
  language: SupportedLanguage;
  content: Record<string, any>;
  translatedAt: FirebaseFirestore.Timestamp;
}

/**
 * Generate location-specific FAQ content
 */
export const generateLocationFAQ = functions.https.onCall(
  async (data: {
    locationId: string;
    serviceId: string;
    websiteId: string;
  }) => {
    const { locationId, serviceId, websiteId } = data;

    functions.logger.info("Generating location-specific FAQ", {
      locationId,
      serviceId,
    });

    // Get location and service data
    const [locationDoc, serviceDoc] = await Promise.all([
      db.collection("locations").doc(locationId).get(),
      db.collection("services").doc(serviceId).get(),
    ]);

    const location = locationDoc.data();
    const service = serviceDoc.data();

    if (!location || !service) {
      throw new functions.https.HttpsError(
        "not-found",
        "Location or service not found",
      );
    }

    // Get location-specific questions or defaults
    const baseQuestions =
      LOCATION_FAQ_TEMPLATES[locationId] || LOCATION_FAQ_TEMPLATES.default;
    const serviceKeywords = SEO_KEYWORDS[websiteId] || [];

    const prompt = `Generate comprehensive FAQ content for a limousine service.

Location: ${location.name}, Chicago area
Service: ${service.name}
Service Description: ${service.description}

Base Questions to Answer:
${baseQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

SEO Keywords to Include: ${serviceKeywords.join(", ")}

Generate detailed, helpful answers for each question. Include:
- Specific details about ${location.name}
- Service-specific information
- Professional, friendly tone
- Natural keyword integration

Return as JSON array:
[
  {"question": "...", "answer": "..."},
  ...
]`;

    try {
      const result = await model.generateContent(prompt);
      const text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to parse FAQ response");
      }

      const faqs = JSON.parse(jsonMatch[0]);

      // Store FAQ
      const faqId = `${locationId}_${serviceId}_faq`;
      await db.collection("content_faqs").doc(faqId).set({
        locationId,
        serviceId,
        websiteId,
        faqs,
        generatedAt: admin.firestore.Timestamp.now(),
        version: 1,
      });

      return { success: true, faqId, faqCount: faqs.length };
    } catch (error) {
      functions.logger.error("FAQ generation failed", error);
      throw new functions.https.HttpsError("internal", "FAQ generation failed");
    }
  },
);

/**
 * Generate multilingual content translation
 */
export const translateContent = functions.https.onCall(
  async (data: { contentId: string; targetLanguage: SupportedLanguage }) => {
    const { contentId, targetLanguage } = data;

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unsupported language: ${targetLanguage}`,
      );
    }

    functions.logger.info("Translating content", { contentId, targetLanguage });

    // Get original content
    const contentDoc = await db
      .collection("service_content")
      .doc(contentId)
      .get();
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const originalContent = contentDoc.data()?.content;

    const languageNames: Record<SupportedLanguage, string> = {
      en: "English",
      es: "Spanish",
      pl: "Polish",
      zh: "Chinese (Simplified)",
      ko: "Korean",
    };

    const prompt = `Translate the following JSON content to ${languageNames[targetLanguage]}.
Maintain the exact JSON structure. Translate all text values naturally, preserving:
- Professional tone
- SEO keywords (adapt to target language equivalents)
- Brand voice
- Technical terms (keep service names in English if no equivalent)

Original Content:
${JSON.stringify(originalContent, null, 2)}

Return ONLY the translated JSON object.`;

    try {
      const result = await model.generateContent(prompt);
      const text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse translation response");
      }

      const translatedContent = JSON.parse(jsonMatch[0]);

      // Store translation
      const translationId = `${contentId}_${targetLanguage}`;
      await db.collection("content_translations").doc(translationId).set({
        originalContentId: contentId,
        language: targetLanguage,
        content: translatedContent,
        translatedAt: admin.firestore.Timestamp.now(),
      });

      return { success: true, translationId, language: targetLanguage };
    } catch (error) {
      functions.logger.error("Translation failed", error);
      throw new functions.https.HttpsError("internal", "Translation failed");
    }
  },
);

/**
 * Generate SEO-optimized content with keyword integration
 */
export const optimizeContentSEO = functions.https.onCall(
  async (data: { contentId: string; targetKeywords?: string[] }) => {
    const { contentId, targetKeywords } = data;

    functions.logger.info("Optimizing content for SEO", { contentId });

    const contentDoc = await db
      .collection("service_content")
      .doc(contentId)
      .get();
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const contentData = contentDoc.data();
    const websiteId = contentData?.websiteId;
    const originalContent = contentData?.content;

    const keywords = targetKeywords || SEO_KEYWORDS[websiteId] || [];

    const prompt = `Optimize the following content for SEO while maintaining quality and readability.

Current Content:
${JSON.stringify(originalContent, null, 2)}

Target Keywords: ${keywords.join(", ")}

Optimization Goals:
1. Naturally integrate keywords (1-3% density)
2. Optimize title (50-60 characters, keyword at start)
3. Enhance meta description (150-160 characters, compelling CTA)
4. Add semantic keywords and LSI terms
5. Improve heading structure
6. Add internal linking suggestions
7. Enhance readability (Flesch-Kincaid grade 8-10)

Return optimized content as JSON with same structure plus:
{
  ...originalFields,
  "seoMetrics": {
    "keywordDensity": number,
    "titleLength": number,
    "metaLength": number,
    "readabilityScore": number,
    "suggestedInternalLinks": ["topic1", "topic2"]
  }
}`;

    try {
      const result = await model.generateContent(prompt);
      const text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse SEO optimization response");
      }

      const optimizedContent = JSON.parse(jsonMatch[0]);

      // Update content with SEO optimization
      await contentDoc.ref.update({
        content: optimizedContent,
        seoOptimized: true,
        seoOptimizedAt: admin.firestore.Timestamp.now(),
        targetKeywords: keywords,
      });

      return {
        success: true,
        contentId,
        seoMetrics: optimizedContent.seoMetrics,
      };
    } catch (error) {
      functions.logger.error("SEO optimization failed", error);
      throw new functions.https.HttpsError(
        "internal",
        "SEO optimization failed",
      );
    }
  },
);

/**
 * Generate A/B test variants for content
 */
export const generateABVariants = functions.https.onCall(
  async (data: {
    contentId: string;
    variantFocus: "headline" | "cta" | "features" | "full";
  }) => {
    const { contentId, variantFocus } = data;

    functions.logger.info("Generating A/B variants", {
      contentId,
      variantFocus,
    });

    const contentDoc = await db
      .collection("service_content")
      .doc(contentId)
      .get();
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const originalContent = contentDoc.data()?.content;

    const focusInstructions: Record<string, string> = {
      headline:
        "Create alternative headlines/titles that test different emotional appeals (urgency, exclusivity, value)",
      cta: "Create alternative call-to-action text that tests different motivations (booking, inquiry, urgency)",
      features:
        "Reorganize and rephrase features to test different value propositions",
      full: "Create a complete alternative version with different tone (more formal vs casual)",
    };

    const prompt = `Generate an A/B test variant for this content.

Original Content (Variant A):
${JSON.stringify(originalContent, null, 2)}

Focus: ${focusInstructions[variantFocus]}

Requirements:
1. Maintain same factual information
2. Keep SEO keywords intact
3. Create meaningfully different variant (not just word swaps)
4. Variant should test a specific hypothesis

Return Variant B as JSON with same structure.
Also include:
{
  ...contentFields,
  "abTestMetadata": {
    "hypothesis": "What we're testing",
    "primaryChange": "Main difference from A",
    "expectedImpact": "What metric we expect to improve"
  }
}`;

    try {
      const result = await model.generateContent(prompt);
      const text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse A/B variant response");
      }

      const variantB = JSON.parse(jsonMatch[0]);

      // Store variants
      const testId = `${contentId}_abtest_${Date.now()}`;
      await db
        .collection("content_ab_tests")
        .doc(testId)
        .set({
          originalContentId: contentId,
          variantFocus,
          variantA: {
            content: originalContent,
            isOriginal: true,
          },
          variantB: {
            content: variantB,
            isOriginal: false,
            metadata: variantB.abTestMetadata,
          },
          status: "draft",
          createdAt: admin.firestore.Timestamp.now(),
          metrics: {
            variantA: { impressions: 0, conversions: 0 },
            variantB: { impressions: 0, conversions: 0 },
          },
        });

      return {
        success: true,
        testId,
        hypothesis: variantB.abTestMetadata?.hypothesis,
      };
    } catch (error) {
      functions.logger.error("A/B variant generation failed", error);
      throw new functions.https.HttpsError(
        "internal",
        "A/B variant generation failed",
      );
    }
  },
);

/**
 * Store content version for history/rollback
 */
export const createContentVersion = functions.https.onCall(
  async (data: { contentId: string; versionNote?: string }) => {
    const { contentId, versionNote } = data;

    const contentDoc = await db
      .collection("service_content")
      .doc(contentId)
      .get();
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const contentData = contentDoc.data();

    // Get current version count
    const versionsSnapshot = await db
      .collection("content_versions")
      .where("contentId", "==", contentId)
      .orderBy("version", "desc")
      .limit(1)
      .get();

    const lastVersion = versionsSnapshot.empty
      ? 0
      : versionsSnapshot.docs[0].data().version;
    const newVersion = lastVersion + 1;

    // Store version
    const versionId = `${contentId}_v${newVersion}`;
    await db
      .collection("content_versions")
      .doc(versionId)
      .set({
        contentId,
        version: newVersion,
        content: contentData?.content,
        qualityScore: contentData?.qualityScore,
        note: versionNote || `Version ${newVersion}`,
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "system",
      });

    // Update main content with version number
    await contentDoc.ref.update({
      currentVersion: newVersion,
      lastVersionedAt: admin.firestore.Timestamp.now(),
    });

    return { success: true, versionId, version: newVersion };
  },
);

/**
 * Rollback to previous content version
 */
export const rollbackContentVersion = functions.https.onCall(
  async (data: { contentId: string; targetVersion: number }) => {
    const { contentId, targetVersion } = data;

    const versionDoc = await db
      .collection("content_versions")
      .doc(`${contentId}_v${targetVersion}`)
      .get();

    if (!versionDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        `Version ${targetVersion} not found`,
      );
    }

    const versionData = versionDoc.data();

    // Update main content
    await db.collection("service_content").doc(contentId).update({
      content: versionData?.content,
      qualityScore: versionData?.qualityScore,
      currentVersion: targetVersion,
      rolledBackAt: admin.firestore.Timestamp.now(),
      rolledBackFrom: targetVersion,
    });

    return { success: true, restoredVersion: targetVersion };
  },
);
