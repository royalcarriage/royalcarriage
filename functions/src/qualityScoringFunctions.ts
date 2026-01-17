import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface ContentQualityScores {
  keywordDensity: number;
  readability: number;
  contentLength: number;
  structure: number;
  seoOptimization: number;
  originality: number;
  engagement: number;
}

interface QualityScoreResult {
  contentId: string;
  overallScore: number;
  scores: ContentQualityScores;
  recommendations: string[];
  shouldRegenerate: boolean;
  scoredAt: number;
}

/**
 * Calculate content quality score based on multiple metrics
 * Returns score 0-100 with component breakdown
 */
export const calculateContentQuality = functions.https.onCall(
  async (data: { contentId: string; contentData?: any }, context) => {
    // Verify admin authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== "admin" && userRole !== "superadmin") {
      throw new functions.https.HttpsError("permission-denied", "Admins only");
    }

    const { contentId, contentData } = data;

    try {
      // Get content from Firestore if not provided
      let content = contentData;
      if (!content) {
        const contentDoc = await db
          .collection("service_content")
          .doc(contentId)
          .get();
        if (!contentDoc.exists) {
          throw new Error("Content not found");
        }
        content = contentDoc.data();
      }

      // Calculate individual scores
      const scores: ContentQualityScores = {
        keywordDensity: calculateKeywordDensity(
          content.content || "",
          content.keywords || [],
        ),
        readability: calculateReadability(content.content || ""),
        contentLength: calculateContentLength(content.content || ""),
        structure: calculateStructure(content.content || ""),
        seoOptimization: calculateSeoOptimization(content),
        originality: calculateOriginality(content.content || ""),
        engagement: calculateEngagement(content),
      };

      // Calculate weighted overall score
      const weights = {
        keywordDensity: 0.15,
        readability: 0.15,
        contentLength: 0.1,
        structure: 0.1,
        seoOptimization: 0.25,
        originality: 0.15,
        engagement: 0.1,
      };

      const overallScore = Math.round(
        Object.entries(scores).reduce((sum, [key, value]) => {
          return sum + value * weights[key as keyof typeof weights];
        }, 0),
      );

      // Generate recommendations
      const recommendations = generateRecommendations(scores, content);

      // Determine if regeneration is needed
      const shouldRegenerate = overallScore < 50;

      const result: QualityScoreResult = {
        contentId,
        overallScore,
        scores,
        recommendations,
        shouldRegenerate,
        scoredAt: Date.now(),
      };

      // Save score to Firestore
      await db.collection("content_quality_scores").doc(contentId).set({
        contentId,
        websiteId: content.websiteId,
        locationId: content.locationId,
        serviceId: content.serviceId,
        overallScore,
        scores,
        recommendations,
        shouldRegenerate,
        scoredAt: new Date(),
      });

      // Update content document with quality score
      await db
        .collection("service_content")
        .doc(contentId)
        .update({
          aiQualityScore: overallScore / 100,
          qualityScoredAt: new Date(),
        });

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      console.error("Quality scoring error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Bulk score all content items for a website or location
 */
export const bulkScoreContent = functions.https.onCall(
  async (
    data: { websiteId?: string; locationId?: string; maxItems?: number },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== "admin" && userRole !== "superadmin") {
      throw new functions.https.HttpsError("permission-denied", "Admins only");
    }

    const { websiteId, locationId, maxItems = 500 } = data;

    try {
      let query;
      if (websiteId) {
        query = db
          .collection("service_content")
          .where("websiteId", "==", websiteId);
      } else if (locationId) {
        query = db
          .collection("service_content")
          .where("locationId", "==", locationId);
      } else {
        query = db.collection("service_content");
      }

      const snapshot = await query.get();
      const items = snapshot.docs.slice(0, maxItems);

      let scoredCount = 0;
      let regenerateCount = 0;
      const scores: number[] = [];

      const batch = db.batch();

      for (const doc of items) {
        const content = doc.data();

        // Calculate quality scores
        const contentScores: ContentQualityScores = {
          keywordDensity: calculateKeywordDensity(
            content.content || "",
            content.keywords || [],
          ),
          readability: calculateReadability(content.content || ""),
          contentLength: calculateContentLength(content.content || ""),
          structure: calculateStructure(content.content || ""),
          seoOptimization: calculateSeoOptimization(content),
          originality: calculateOriginality(content.content || ""),
          engagement: calculateEngagement(content),
        };

        const weights = {
          keywordDensity: 0.15,
          readability: 0.15,
          contentLength: 0.1,
          structure: 0.1,
          seoOptimization: 0.25,
          originality: 0.15,
          engagement: 0.1,
        };

        const overallScore = Math.round(
          Object.entries(contentScores).reduce((sum, [key, value]) => {
            return sum + value * weights[key as keyof typeof weights];
          }, 0),
        );

        scores.push(overallScore);
        const shouldRegenerate = overallScore < 50;
        if (shouldRegenerate) regenerateCount++;

        // Save quality score
        batch.set(db.doc(`content_quality_scores/${doc.id}`), {
          contentId: doc.id,
          websiteId: content.websiteId,
          locationId: content.locationId,
          serviceId: content.serviceId,
          overallScore,
          scores: contentScores,
          recommendations: generateRecommendations(contentScores, content),
          shouldRegenerate,
          scoredAt: new Date(),
        });

        // Update content with quality score
        batch.update(db.doc(`service_content/${doc.id}`), {
          aiQualityScore: overallScore / 100,
          qualityScoredAt: new Date(),
        });

        scoredCount++;
      }

      await batch.commit();

      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b) / scores.length)
          : 0;
      const excellentCount = scores.filter((s) => s >= 90).length;
      const goodCount = scores.filter((s) => s >= 75 && s < 90).length;
      const fairCount = scores.filter((s) => s >= 50 && s < 75).length;
      const poorCount = scores.filter((s) => s < 50).length;

      return {
        success: true,
        scoredCount,
        regenerateCount,
        avgScore,
        distribution: {
          excellent: excellentCount,
          good: goodCount,
          fair: fairCount,
          poor: poorCount,
        },
      };
    } catch (error: any) {
      console.error("Bulk scoring error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get quality score summary for dashboard
 */
export const getQualityScoreSummary = functions.https.onCall(
  async (data: { websiteId?: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    try {
      const db = admin.firestore();
      let qry;
      if (data.websiteId) {
        qry = db
          .collection("content_quality_scores")
          .where("websiteId", "==", data.websiteId);
      } else {
        qry = db.collection("content_quality_scores");
      }

      const snapshot = await qry.get();
      const scores = snapshot.docs.map((doc) => doc.data());

      if (scores.length === 0) {
        return {
          success: true,
          avgScore: 0,
          totalScored: 0,
          distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
          lowestScoring: [],
          highestScoring: [],
        };
      }

      const overallScores = scores.map((s) => s.overallScore);
      const avgScore = Math.round(
        overallScores.reduce((a, b) => a + b) / overallScores.length,
      );

      const excellent = scores.filter((s) => s.overallScore >= 90).length;
      const good = scores.filter(
        (s) => s.overallScore >= 75 && s.overallScore < 90,
      ).length;
      const fair = scores.filter(
        (s) => s.overallScore >= 50 && s.overallScore < 75,
      ).length;
      const poor = scores.filter((s) => s.overallScore < 50).length;

      const lowestScoring = scores
        .sort((a, b) => a.overallScore - b.overallScore)
        .slice(0, 10)
        .map((s) => ({
          contentId: s.contentId,
          score: s.overallScore,
          location: s.locationId,
          service: s.serviceId,
        }));

      const highestScoring = scores
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 10)
        .map((s) => ({
          contentId: s.contentId,
          score: s.overallScore,
          location: s.locationId,
          service: s.serviceId,
        }));

      return {
        success: true,
        avgScore,
        totalScored: scores.length,
        distribution: {
          excellent,
          good,
          fair,
          poor,
        },
        lowestScoring,
        highestScoring,
      };
    } catch (error: any) {
      console.error("Summary error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

// ============ HELPER FUNCTIONS ============

function calculateKeywordDensity(content: string, keywords: string[]): number {
  if (keywords.length === 0 || content.length === 0) return 50;

  const words = content.toLowerCase().split(/\s+/);
  const keywordCounts = keywords.map((keyword) => {
    const count = words.filter((word) =>
      word.includes(keyword.toLowerCase()),
    ).length;
    const density = (count / words.length) * 100;
    return Math.min(density, 3);
  });

  const avgDensity = keywordCounts.reduce((a, b) => a + b, 0) / keywords.length;

  // Optimal: 1-2% per keyword
  if (avgDensity >= 0.8 && avgDensity <= 2.5) return 100;
  if (avgDensity >= 0.5 && avgDensity < 0.8) return 85;
  if (avgDensity >= 2.5 && avgDensity <= 3.5) return 85;
  if (avgDensity < 0.5) return 60;
  return 50;
}

function calculateReadability(content: string): number {
  if (content.length === 0) return 0;

  // Simple readability score based on sentence structure
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;
  const avgWordLength = content.replace(/\s/g, "").length / words;

  // Gunning Fog Index approximation
  const index =
    0.4 * (words / sentences + (100 * (avgWordLength - 4.71)) / words);

  // Grade 8-10 readability is optimal (15-16 FOG index)
  if (index >= 10 && index <= 16) return 100;
  if (index >= 8 && index < 10) return 85;
  if (index > 16 && index <= 18) return 85;
  if (index < 8) return 70;
  return 60;
}

function calculateContentLength(content: string): number {
  const wordCount = content.split(/\s+/).length;

  // Optimal: 1,500-2,000 words
  if (wordCount >= 1500 && wordCount <= 2000) return 100;
  if (wordCount >= 1200 && wordCount < 1500) return 90;
  if (wordCount > 2000 && wordCount <= 2500) return 90;
  if (wordCount >= 800 && wordCount < 1200) return 75;
  if (wordCount >= 2500 && wordCount <= 3000) return 75;
  if (wordCount < 500) return 40;
  return 60;
}

function calculateStructure(content: string): number {
  // Count headings, lists, paragraphs
  const headingCount = (content.match(/<h[2-6]/gi) || []).length;
  const listCount = (content.match(/<[ul|ol]/gi) || []).length;
  const paragraphCount = (content.match(/<p>/gi) || []).length;

  const score = Math.min(
    headingCount * 5 + listCount * 3 + paragraphCount / 3,
    100,
  );
  return Math.round(score);
}

function calculateSeoOptimization(content: any): number {
  let score = 0;

  // Meta title (50-60 chars) - 25 points
  if (
    content.title &&
    content.title.length >= 50 &&
    content.title.length <= 60
  ) {
    score += 25;
  } else if (
    content.title &&
    content.title.length >= 40 &&
    content.title.length <= 70
  ) {
    score += 15;
  }

  // Meta description (155-160 chars) - 25 points
  if (
    content.metaDescription &&
    content.metaDescription.length >= 155 &&
    content.metaDescription.length <= 160
  ) {
    score += 25;
  } else if (
    content.metaDescription &&
    content.metaDescription.length >= 140 &&
    content.metaDescription.length <= 170
  ) {
    score += 15;
  }

  // Keywords (15-20) - 20 points
  if (
    content.keywords &&
    content.keywords.length >= 15 &&
    content.keywords.length <= 20
  ) {
    score += 20;
  } else if (
    content.keywords &&
    content.keywords.length >= 10 &&
    content.keywords.length <= 25
  ) {
    score += 12;
  }

  // Internal links (8-12) - 15 points
  if (
    content.internalLinks &&
    content.internalLinks.length >= 8 &&
    content.internalLinks.length <= 12
  ) {
    score += 15;
  } else if (
    content.internalLinks &&
    content.internalLinks.length >= 5 &&
    content.internalLinks.length <= 15
  ) {
    score += 8;
  }

  // Schema markup - 15 points
  if (content.schema) {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateOriginality(content: string): number {
  // Simplified originality check (without external API)
  // Check for keyword diversity and unique phrasing
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = (uniqueWords.size / words.length) * 100;

  // Higher diversity = more original
  if (diversity >= 60) return 95;
  if (diversity >= 50) return 80;
  if (diversity >= 40) return 65;
  return 50;
}

function calculateEngagement(content: any): number {
  let score = 0;

  // CTA presence - 40 points
  if (
    content.content &&
    content.content.toLowerCase().includes("book") &&
    content.content.toLowerCase().includes("now")
  ) {
    score += 40;
  } else {
    score += 20;
  }

  // Question format (FAQs) - 30 points
  const questionCount = (content.content?.match(/\?/g) || []).length;
  if (questionCount >= 3) score += 30;
  else if (questionCount >= 1) score += 15;

  // Lists and formatting - 30 points
  const bulletPoints = (content.content?.match(/^[\s]*[-•*]/gm) || []).length;
  if (bulletPoints >= 5) score += 30;
  else if (bulletPoints >= 2) score += 15;

  return Math.min(score, 100);
}

function generateRecommendations(
  scores: ContentQualityScores,
  content: any,
): string[] {
  const recommendations: string[] = [];

  // Keyword density
  if (scores.keywordDensity < 70) {
    recommendations.push(
      "Increase keyword density - consider adding 2-3 more keyword mentions",
    );
  }

  // Readability
  if (scores.readability < 70) {
    recommendations.push(
      "Improve readability - use shorter sentences and simpler words",
    );
  }

  // Content length
  if (scores.contentLength < 70) {
    recommendations.push(
      "Expand content - add 300-500 more words to reach optimal length",
    );
  }

  // Structure
  if (scores.structure < 70) {
    recommendations.push(
      "Improve structure - add more headings, lists, and subheadings",
    );
  }

  // SEO optimization
  if (scores.seoOptimization < 70) {
    recommendations.push(
      "Optimize for SEO - review title, description, and schema markup",
    );
  }

  // Originality
  if (scores.originality < 70) {
    recommendations.push(
      "Improve uniqueness - rewrite sections with more original phrasing",
    );
  }

  // Engagement
  if (scores.engagement < 70) {
    recommendations.push(
      "Enhance engagement - add more CTAs, questions, and formatted lists",
    );
  }

  return recommendations;
}
