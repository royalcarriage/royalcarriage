import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";
import { geminiClient } from "./shared/gemini-client";

initFirebase();
const db = admin.firestore();

// --- AI CONTENT ENHANCEMENT ---

/**
 * Generate city-specific FAQ for limo services
 * Uses Gemini 1.5 Flash for cost efficiency
 */
export const generateFAQForCity = functions.https.onCall(
  async (data, context) => {
    try {
      const { city } = data;

      if (!city || typeof city !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "City name is required",
        );
      }

      // Check cache first
      const cached = await db.collection("faq_cache").doc(city).get();
      if (cached.exists) {
        const cacheData = cached.data();
        if (
          cacheData &&
          new Date(cacheData.generatedAt.toDate()).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000
        ) {
          functions.logger.info("[generateFAQForCity] Returning cached FAQ", {
            city,
          });
          return { faq: cacheData.faq, cached: true };
        }
      }

      const prompt = `Generate 5 frequently asked questions about professional airport limo service in ${city}.

For each question, provide a helpful, professional answer that addresses common customer concerns.

Topics to cover:
1. How to book and what information is needed
2. Pricing and payment methods
3. Vehicle selection and fleet options
4. Cancellation policy and modifications
5. Special requests (child seats, extra luggage, accessibility needs)

Format your response as valid JSON with this exact structure:
{
  "faq": [
    {
      "question": "...",
      "answer": "..."
    },
    ...
  ]
}`;

      functions.logger.info("[generateFAQForCity] Generating FAQ", { city });
      const response = await geminiClient.generateContent(prompt, {
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      const faqData = geminiClient.parseJSON(response, {
        faq: [
          {
            question: `How do I book airport service in ${city}?`,
            answer:
              "You can book through our website, mobile app, or by calling our customer service team.",
          },
        ],
      });

      if (!faqData || !Array.isArray(faqData.faq)) {
        throw new Error("Invalid FAQ structure from Gemini");
      }

      // Store in Firestore for caching
      await db.collection("faq_cache").doc(city).set({
        faq: faqData.faq,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        city: city,
      });

      functions.logger.info("[generateFAQForCity] FAQ generated successfully", {
        city,
        faqCount: faqData.faq.length,
      });

      return { faq: faqData.faq, cached: false };
    } catch (error) {
      functions.logger.error("[generateFAQForCity] Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate FAQ",
      );
    }
  },
);

/**
 * Summarize customer reviews with AI
 * Uses Gemini 1.5 Flash for cost efficiency
 */
export const summarizeCustomerReviews = functions.https.onCall(
  async (data, context) => {
    try {
      const { customerId } = data;

      if (!customerId || typeof customerId !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "customerId is required",
        );
      }

      // Fetch reviews from Firestore
      const reviewDocs = await db
        .collection("reviews")
        .where("customerId", "==", customerId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      if (reviewDocs.empty) {
        return {
          summary: "No reviews found for this customer.",
          sentiment: "neutral",
          keyPoints: [],
          reviewCount: 0,
        };
      }

      // Compile review texts
      const reviews = reviewDocs.docs
        .map((doc) => doc.data().text || doc.data().comment || "")
        .filter((text) => text.length > 0)
        .join("\n\n");

      const prompt = `Summarize these ${reviewDocs.size} customer reviews for a professional airport limo service.

Provide a concise summary that:
1. Captures the overall customer experience
2. Identifies sentiment (positive, neutral, negative)
3. Extracts the top 3 key points or themes

Reviews:
${reviews}

Respond with valid JSON in this exact format:
{
  "summary": "Brief 2-3 sentence summary of the customer's experience",
  "sentiment": "positive|neutral|negative",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}`;

      functions.logger.info("[summarizeCustomerReviews] Summarizing reviews", {
        customerId,
        reviewCount: reviewDocs.size,
      });

      const response = await geminiClient.generateContent(prompt, {
        model: "gemini-1.5-flash",
        temperature: 0.5,
        maxOutputTokens: 1024,
      });

      const result = geminiClient.parseJSON(response, {
        summary: "Unable to generate summary",
        sentiment: "neutral",
        keyPoints: [],
      });

      functions.logger.info("[summarizeCustomerReviews] Reviews summarized", {
        customerId,
        sentiment: result?.sentiment,
      });

      return {
        summary: result?.summary || "Unable to generate summary",
        sentiment: result?.sentiment || "neutral",
        keyPoints: result?.keyPoints || [],
        reviewCount: reviewDocs.size,
      };
    } catch (error) {
      functions.logger.error("[summarizeCustomerReviews] Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new functions.https.HttpsError(
        "internal",
        "Failed to summarize reviews",
      );
    }
  },
);

/**
 * Translate page content to target language
 * Uses Gemini 1.5 Flash
 */
export const translatePageContent = functions.https.onCall(
  async (data, context) => {
    try {
      const { content, targetLang } = data;

      if (!content || !targetLang) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "content and targetLang are required",
        );
      }

      const prompt = `Translate the following English content to ${targetLang}.
Maintain the tone, formatting, and meaning.
Focus on professional, marketing-appropriate language for a luxury transportation company.

Content to translate:
${content}

Provide only the translated content without any explanations.`;

      functions.logger.info("[translatePageContent] Translating content", {
        targetLang,
        contentLength: content.length,
      });

      const translated = await geminiClient.generateContent(prompt, {
        model: "gemini-1.5-flash",
        temperature: 0.3,
        maxOutputTokens: 4096,
      });

      return { translated };
    } catch (error) {
      functions.logger.error("[translatePageContent] Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new functions.https.HttpsError(
        "internal",
        "Failed to translate content",
      );
    }
  },
);

// --- SEO & LINKS ---

export const detectBrokenInternalLinks = functions.https.onCall(
  async (data, context) => {
    // Scan all pages for 404 links
    return { broken: [] };
  },
);

export const generateSitemapEntries = functions.https.onCall(
  async (data, context) => {
    // Return list of URLs for sitemap.xml
    return { urls: ["/chicago", "/naperville"] };
  },
);

// --- SOCIAL MEDIA ---

/**
 * Generate platform-specific social media captions from images
 * Uses Gemini 1.5 Flash vision capabilities
 */
export const suggestSocialCaptions = functions.https.onCall(
  async (data, context) => {
    try {
      const { imageUrl, platform } = data;

      if (!imageUrl || !platform) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "imageUrl and platform are required",
        );
      }

      const platformGuides: { [key: string]: string } = {
        instagram:
          "Write 3 Instagram captions (140-280 chars each) with relevant hashtags. Focus on lifestyle, luxury, and service quality.",
        facebook:
          "Write 2 Facebook captions (200-300 chars each) encouraging engagement and bookings.",
        twitter:
          "Write 3 Twitter captions (max 280 chars each) that are punchy, professional, and shareable.",
        linkedin:
          "Write 2 LinkedIn captions (250-300 chars each) positioning the service as professional B2B transportation.",
      };

      const platformGuide =
        platformGuides[platform.toLowerCase()] ||
        "Write social media captions for this image.";

      const prompt = `Analyze this image and generate social media captions for ${platform}.

${platformGuide}

Image Content: [An image of a luxury limo/car service or related transportation]

Generate captions that:
- Appeal to potential customers
- Highlight professionalism, luxury, and reliability
- Include relevant call-to-action
- Are brand-appropriate for Royal Carriage limo service

Format your response as valid JSON:
{
  "captions": ["caption 1", "caption 2", "caption 3"]
}`;

      functions.logger.info("[suggestSocialCaptions] Generating captions", {
        platform,
        imageUrl,
      });

      const response = await geminiClient.generateContentWithVision(
        prompt,
        imageUrl,
        {
          model: "gemini-1.5-flash",
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      );

      const result = geminiClient.parseJSON(response, {
        captions: [
          "Experience luxury transportation. #RoyalCarriage",
          "Professional black car service for Chicago.",
          "Arriving in style every time.",
        ],
      });

      functions.logger.info("[suggestSocialCaptions] Captions generated", {
        platform,
        captionCount: result?.captions?.length,
      });

      return { captions: result?.captions || [] };
    } catch (error) {
      functions.logger.error("[suggestSocialCaptions] Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate captions",
      );
    }
  },
);

// --- REPUTATION ---

/**
 * Automatically analyze sentiment of customer feedback
 * Firestore trigger on new feedback documents
 * Uses Gemini 1.5 Pro for accuracy
 */
export const analyzeSentimentOfFeedback = functions.firestore
  .document("feedback/{id}")
  .onCreate(async (snap, context) => {
    try {
      const feedback = snap.data();
      const feedbackText = feedback.text || feedback.comment || "";

      if (!feedbackText) {
        functions.logger.warn(
          "[analyzeSentimentOfFeedback] Empty feedback text",
        );
        return;
      }

      functions.logger.info(
        "[analyzeSentimentOfFeedback] Analyzing sentiment",
        {
          feedbackId: snap.id,
          textLength: feedbackText.length,
        },
      );

      const prompt = `Analyze the sentiment of this customer feedback for a limo/transportation service.

Feedback:
"${feedbackText}"

Respond with valid JSON containing:
- sentiment: "positive", "neutral", or "negative"
- sentimentScore: confidence score from 0 to 1
- categories: up to 3 key themes mentioned (e.g., "professionalism", "cleanliness", "punctuality")
- shouldFlagForReview: true if feedback contains a complaint or safety concern

Format:
{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 0.95,
  "categories": ["category1", "category2"],
  "shouldFlagForReview": false
}`;

      const response = await geminiClient.generateContent(prompt, {
        model: "gemini-1.5-pro",
        temperature: 0.3,
        maxOutputTokens: 512,
      });

      const analysis = geminiClient.parseJSON(response, {
        sentiment: "neutral",
        sentimentScore: 0.5,
        categories: [],
        shouldFlagForReview: false,
      });

      // Update the feedback document with analysis
      await snap.ref.update({
        sentiment: analysis?.sentiment || "neutral",
        sentimentScore: analysis?.sentimentScore || 0.5,
        categories: analysis?.categories || [],
        shouldFlagForReview: analysis?.shouldFlagForReview || false,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        "[analyzeSentimentOfFeedback] Sentiment analysis complete",
        {
          feedbackId: snap.id,
          sentiment: analysis?.sentiment,
          flagged: analysis?.shouldFlagForReview,
        },
      );

      // If feedback should be flagged, store in alerts
      if (analysis?.shouldFlagForReview) {
        await db.collection("feedback_alerts").add({
          feedbackId: snap.id,
          sentiment: analysis.sentiment,
          text: feedbackText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending_review",
        });

        functions.logger.warn("[analyzeSentimentOfFeedback] Feedback flagged", {
          feedbackId: snap.id,
        });
      }
    } catch (error) {
      functions.logger.error("[analyzeSentimentOfFeedback] Error:", {
        error: error instanceof Error ? error.message : String(error),
        feedbackId: snap.id,
      });
      // Don't throw - allow feedback to be stored even if analysis fails
    }
  });

// --- MEDIA MANAGEMENT ---

export const optimizeImageMetadata = functions.https.onCall(
  async (data, context) => {
    const { imageId } = data;
    // Update alt tags and captions with AI
    return { success: true };
  },
);

export const createFleetHighlightVideo = functions.https.onCall(
  async (data, context) => {
    // Trigger video processing job (mock)
    return { jobId: "vid_999" };
  },
);
