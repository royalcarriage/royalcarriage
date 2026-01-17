import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface CompetitorWebsite {
  name: string;
  url: string;
  category: "direct" | "indirect" | "local-pack";
}

interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  theyRankFor: boolean;
  weRankFor: boolean;
  opportunity: number; // Volume / Difficulty
}

interface ContentGap {
  serviceType: string;
  location: string;
  theyHave: boolean;
  weHave: boolean;
  priority: "high" | "medium" | "low";
}

/**
 * Analyze competitor websites for keywords and content strategy
 */
export const analyzeCompetitors = functions.https.onCall(
  async (
    data: {
      competitors?: CompetitorWebsite[];
      includeLocalPack?: boolean;
      analysisDepth?: "quick" | "detailed";
    },
    context,
  ) => {
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

    const {
      competitors = [
        {
          name: "Echo Limousine",
          url: "https://echolimousine.com",
          category: "direct",
        },
        {
          name: "Chi Town Black Cars",
          url: "https://chitownblackcars.com",
          category: "direct",
        },
      ],
      includeLocalPack = true,
      analysisDepth = "detailed",
    } = data;

    try {
      const startTime = Date.now();
      const competitorAnalyses: any[] = [];
      const allKeywords = new Map<string, any>();
      const contentGaps: ContentGap[] = [];

      // Analyze each competitor
      for (const competitor of competitors) {
        const competitorAnalysis = await analyzeCompetitorWebsite(
          competitor,
          analysisDepth,
        );
        competitorAnalyses.push(competitorAnalysis);

        // Aggregate keywords
        competitorAnalysis.topKeywords?.forEach((kw: any) => {
          if (!allKeywords.has(kw.keyword)) {
            allKeywords.set(kw.keyword, {
              keyword: kw.keyword,
              searchVolume: kw.searchVolume || 0,
              difficulty: kw.difficulty || 0,
              cpc: kw.cpc || 0,
              competitors: [],
            });
          }
          allKeywords.get(kw.keyword)?.competitors.push(competitor.name);
        });
      }

      // Get our content for comparison
      const ourContent = await getOurContentMap(db);

      // Identify opportunities and gaps
      const opportunities: KeywordOpportunity[] = [];

      allKeywords.forEach((kwData) => {
        const weRankFor = ourContent.has(kwData.keyword);
        const opportunity: KeywordOpportunity = {
          keyword: kwData.keyword,
          searchVolume: kwData.searchVolume,
          difficulty: kwData.difficulty,
          cpc: kwData.cpc,
          theyRankFor: kwData.competitors.length > 0,
          weRankFor,
          opportunity:
            (kwData.searchVolume || 1) / Math.max(kwData.difficulty || 1, 1),
        };
        opportunities.push(opportunity);
      });

      // Sort by opportunity score (volume / difficulty)
      opportunities.sort((a, b) => b.opportunity - a.opportunity);

      // Identify content gaps
      const topGapKeywords = opportunities
        .filter((o) => o.theyRankFor && !o.weRankFor && o.difficulty < 50)
        .slice(0, 20);

      const analysis = {
        analysisId: `competitor-analysis-${Date.now()}`,
        analysisDate: new Date(),
        competitors: competitorAnalyses,
        opportunities: {
          topOpportunities: opportunities.slice(0, 50),
          totalOpportunities: opportunities.length,
          highPriorityCount: opportunities.filter((o) => o.opportunity > 1000)
            .length,
          mediumPriorityCount: opportunities.filter(
            (o) => o.opportunity > 500 && o.opportunity <= 1000,
          ).length,
          lowPriorityCount: opportunities.filter((o) => o.opportunity <= 500)
            .length,
        },
        gaps: {
          keywordGaps: topGapKeywords,
          serviceGaps: calculateServiceGaps(competitorAnalyses, ourContent),
          locationGaps: identifyLocationGaps(competitorAnalyses, ourContent),
        },
        comparison: {
          theyRankForButWeDont: opportunities
            .filter((o) => o.theyRankFor && !o.weRankFor)
            .map((o) => o.keyword)
            .slice(0, 30),
          weRankForButTheyDont: opportunities
            .filter((o) => !o.theyRankFor && o.weRankFor)
            .map((o) => o.keyword)
            .slice(0, 30),
          commonKeywords: opportunities.filter(
            (o) => o.theyRankFor && o.weRankFor,
          ).length,
        },
        recommendations: generateRecommendations(
          opportunities,
          competitorAnalyses,
          ourContent,
        ),
        duration: Date.now() - startTime,
      };

      // Save analysis to Firestore
      await db
        .collection("competitor_analysis")
        .doc(analysis.analysisId)
        .set({
          ...analysis,
          savedAt: new Date(),
        });

      return {
        success: true,
        analysisId: analysis.analysisId,
        ...analysis,
      };
    } catch (error: any) {
      console.error("Competitor analysis error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get competitor analysis results
 */
export const getCompetitorAnalysis = functions.https.onCall(
  async (data: { analysisId?: string; limit?: number }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    try {
      const db = admin.firestore();

      if (data.analysisId) {
        // Get specific analysis
        const analysisDoc = await db
          .collection("competitor_analysis")
          .doc(data.analysisId)
          .get();
        if (!analysisDoc.exists) {
          throw new Error("Analysis not found");
        }
        return {
          success: true,
          analysis: analysisDoc.data(),
        };
      } else {
        // Get latest analyses
        const snapshot = await db.collection("competitor_analysis").get();
        const analyses = snapshot.docs
          .map((doc) => doc.data())
          .sort(
            (a, b) =>
              (b.analysisDate?.toMillis?.() || 0) -
              (a.analysisDate?.toMillis?.() || 0),
          )
          .slice(0, data.limit || 10);

        return {
          success: true,
          analyses,
          count: analyses.length,
        };
      }
    } catch (error: any) {
      console.error("Error retrieving competitor analysis:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Identify content service gaps by comparing our services to competitors
 */
export const identifyServiceGaps = functions.https.onCall(
  async (data: { analysisId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    try {
      const db = admin.firestore();

      // Get the competitor analysis
      const analysisDoc = await db
        .collection("competitor_analysis")
        .doc(data.analysisId)
        .get();
      if (!analysisDoc.exists) {
        throw new Error("Analysis not found");
      }

      const analysis = analysisDoc.data();
      const gaps = analysis.gaps?.serviceGaps || [];

      return {
        success: true,
        serviceGaps: gaps.slice(0, 20),
        totalGaps: gaps.length,
        highPriorityGaps: gaps.filter((g: any) => g.priority === "high").length,
      };
    } catch (error: any) {
      console.error("Error identifying service gaps:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get top keyword opportunities sorted by value
 */
export const getKeywordOpportunities = functions.https.onCall(
  async (
    data: {
      analysisId?: string;
      minVolume?: number;
      maxDifficulty?: number;
      limit?: number;
    },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    try {
      const db = admin.firestore();
      const { minVolume = 100, maxDifficulty = 60, limit = 50 } = data;

      // Get latest analysis if not specified
      let analysisId = data.analysisId;
      if (!analysisId) {
        const snapshot = await db.collection("competitor_analysis").get();
        if (snapshot.empty) {
          throw new Error("No competitor analyses found");
        }
        const latest = snapshot.docs.sort(
          (a, b) =>
            (b.data().analysisDate?.toMillis?.() || 0) -
            (a.data().analysisDate?.toMillis?.() || 0),
        )[0];
        analysisId = latest.id;
      }

      const analysisDoc = await db
        .collection("competitor_analysis")
        .doc(analysisId)
        .get();
      if (!analysisDoc.exists) {
        throw new Error("Analysis not found");
      }

      const analysis = analysisDoc.data();
      const opportunities = analysis.opportunities?.topOpportunities || [];

      // Filter and sort
      const filtered = opportunities
        .filter(
          (o: any) =>
            o.searchVolume >= minVolume &&
            o.difficulty <= maxDifficulty &&
            o.theyRankFor &&
            !o.weRankFor,
        )
        .slice(0, limit);

      return {
        success: true,
        opportunities: filtered,
        count: filtered.length,
        analysisId,
      };
    } catch (error: any) {
      console.error("Error getting keyword opportunities:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

// ============ HELPER FUNCTIONS ============

async function analyzeCompetitorWebsite(
  competitor: CompetitorWebsite,
  depth: "quick" | "detailed",
): Promise<any> {
  // In production, this would use SEO APIs like:
  // - SEMrush API
  // - Ahrefs API
  // - Moz API
  // - SimilarWeb API
  //
  // For now, returning mock data structure that would be populated by actual API calls

  return {
    name: competitor.name,
    url: competitor.url,
    category: competitor.category,
    analysisDate: new Date(),

    // These would be populated from real APIs
    topPages: [
      {
        url: `${competitor.url}/services/limo-services`,
        title: "Professional Limousine Services",
        trafficEstimate: 1000,
        topKeywords: [
          "chicago limo service",
          "luxury car service chicago",
          "black car service",
        ],
      },
      // ... more pages
    ],

    topKeywords: [
      {
        keyword: "chicago limo service",
        searchVolume: 2400,
        difficulty: 72,
        cpc: 4.5,
        position: 3,
      },
      {
        keyword: "wedding limo chicago",
        searchVolume: 1900,
        difficulty: 58,
        cpc: 3.2,
        position: 5,
      },
      {
        keyword: "airport car service chicago",
        searchVolume: 1600,
        difficulty: 65,
        cpc: 5.1,
        position: 2,
      },
      // ... more keywords
    ],

    metrics: {
      estimatedTraffic: 15000,
      backlinks: 450,
      dominatingRankings: 127,
      topicsAuthority: "High",
      contentQuality: "Good",
    },

    services: [
      "Airport Transfers",
      "Corporate Services",
      "Wedding Transportation",
      "Party Bus",
      "Executive Travel",
      "Group Shuttles",
    ],

    locations: [
      "Chicago",
      "Downtown Chicago",
      "Naperville",
      "Evanston",
      "Oak Park",
      "Wheaton",
      "Downers Grove",
    ],
  };
}

async function getOurContentMap(db: any): Promise<Set<string>> {
  // Get all our services and locations to identify what we're already ranking for
  const servicesSnapshot = await db.collection("services").get();
  const locationsSnapshot = await db.collection("locations").get();

  const keywords = new Set<string>();

  // Add service-location combinations
  servicesSnapshot.docs.forEach((serviceDoc) => {
    const service = serviceDoc.data();
    locationsSnapshot.docs.forEach((locationDoc) => {
      const location = locationDoc.data();
      // Create typical keyword combinations we'd rank for
      keywords.add(`${service.name} ${location.name}`);
      keywords.add(`${service.name} chicago`);
      keywords.add(`${location.name} ${service.category}`);
    });
  });

  return keywords;
}

function calculateServiceGaps(
  competitorAnalyses: any[],
  ourServices: Set<string>,
): ContentGap[] {
  const gaps: ContentGap[] = [];
  const serviceTypes = [
    "Airport Transfers",
    "Corporate Services",
    "Wedding Transportation",
    "Party Bus",
    "Executive Travel",
    "Group Shuttles",
  ];

  serviceTypes.forEach((serviceType) => {
    competitorAnalyses.forEach((competitor) => {
      const theyHave = competitor.services?.includes(serviceType) || false;
      const weHave = ourServices.has(serviceType);

      if (theyHave && !weHave) {
        gaps.push({
          serviceType,
          location: "Chicago",
          theyHave: true,
          weHave: false,
          priority: "high",
        });
      }
    });
  });

  return gaps.filter(
    (gap, index, self) =>
      self.findIndex((g) => g.serviceType === gap.serviceType) === index,
  );
}

function identifyLocationGaps(
  competitorAnalyses: any[],
  ourLocations: Set<string>,
): ContentGap[] {
  const gaps: ContentGap[] = [];
  const locations = [
    "Naperville",
    "Evanston",
    "Oak Park",
    "Wheaton",
    "Downers Grove",
    "Arlington Heights",
    "Schaumburg",
    "Barrington",
  ];

  locations.forEach((location) => {
    competitorAnalyses.forEach((competitor) => {
      const theyHave = competitor.locations?.includes(location) || false;
      const weHave = ourLocations.has(location);

      if (theyHave && !weHave) {
        gaps.push({
          serviceType: "General Services",
          location,
          theyHave: true,
          weHave: false,
          priority: "medium",
        });
      }
    });
  });

  return gaps;
}

function generateRecommendations(
  opportunities: any[],
  competitors: any[],
  ourContent: Set<string>,
): string[] {
  const recommendations: string[] = [];

  // High-volume, low-difficulty opportunities
  const quickWins = opportunities.filter(
    (o) =>
      o.searchVolume > 500 &&
      o.difficulty < 40 &&
      o.theyRankFor &&
      !o.weRankFor,
  );
  if (quickWins.length > 0) {
    recommendations.push(
      `Create content for ${quickWins.length} quick-win keywords (high volume, low difficulty)`,
    );
  }

  // Service gaps
  const allServices = new Set<string>();
  competitors.forEach((c) => {
    c.services?.forEach((s: string) => allServices.add(s));
  });
  if (allServices.size > 5) {
    recommendations.push(
      `Expand service offerings - competitors offer ${allServices.size} services`,
    );
  }

  // Location gaps
  const allLocations = new Set<string>();
  competitors.forEach((c) => {
    c.locations?.forEach((l: string) => allLocations.add(l));
  });
  if (allLocations.size > ourContent.size) {
    recommendations.push(
      `Expand location coverage - competitors serve ${allLocations.size} locations, we cover fewer`,
    );
  }

  // Content quality
  if (competitors.some((c) => c.metrics?.contentQuality === "Excellent")) {
    recommendations.push(
      "Improve content quality - competitors have excellent-quality content",
    );
  }

  // Backlink strategy
  const avgBacklinks =
    competitors.reduce((sum, c) => sum + (c.metrics?.backlinks || 0), 0) /
    competitors.length;
  if (avgBacklinks > 200) {
    recommendations.push(
      `Build backlinks - competitors average ${Math.round(avgBacklinks)} backlinks`,
    );
  }

  return recommendations;
}
