/**
 * Competitor Analysis Script
 * Analyzes competitor landscape and identifies service gaps and keyword opportunities
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}

const db = admin.firestore();

// Simulated competitor data (in production, this would come from web scraping/API)
const COMPETITORS = [
  {
    name: "Chicago Elite Limo",
    website: "chicagoelitelimo.com",
    services: ["airport-transfer", "corporate", "wedding"],
    keywordsRanking: [
      "chicago airport limo",
      "ohare car service",
      "wedding limo chicago",
    ],
    estimatedTraffic: 5000,
  },
  {
    name: "Windy City Transportation",
    website: "windycitytransport.com",
    services: ["airport-transfer", "party-bus", "corporate"],
    keywordsRanking: [
      "party bus chicago",
      "chicago airport shuttle",
      "corporate car service",
    ],
    estimatedTraffic: 3500,
  },
  {
    name: "Luxury Rides Chicago",
    website: "luxuryrideschicago.com",
    services: ["airport-transfer", "wedding", "special-events"],
    keywordsRanking: [
      "luxury car service chicago",
      "limo service chicago",
      "chicago chauffeur",
    ],
    estimatedTraffic: 4200,
  },
];

// Keyword opportunities with search volume and difficulty
const KEYWORD_OPPORTUNITIES = [
  {
    keyword: "ohare airport limo service",
    searchVolume: 2400,
    difficulty: 0.65,
    ourRank: null,
    competitorRank: 3,
  },
  {
    keyword: "midway airport car service",
    searchVolume: 1800,
    difficulty: 0.55,
    ourRank: null,
    competitorRank: 5,
  },
  {
    keyword: "chicago executive transportation",
    searchVolume: 1200,
    difficulty: 0.7,
    ourRank: null,
    competitorRank: 4,
  },
  {
    keyword: "downtown chicago limo",
    searchVolume: 900,
    difficulty: 0.6,
    ourRank: null,
    competitorRank: 2,
  },
  {
    keyword: "naperville airport shuttle",
    searchVolume: 600,
    difficulty: 0.4,
    ourRank: null,
    competitorRank: null,
  },
  {
    keyword: "schaumburg corporate car service",
    searchVolume: 450,
    difficulty: 0.35,
    ourRank: null,
    competitorRank: null,
  },
  {
    keyword: "gold coast limo service",
    searchVolume: 350,
    difficulty: 0.45,
    ourRank: null,
    competitorRank: null,
  },
  {
    keyword: "lincoln park party bus",
    searchVolume: 500,
    difficulty: 0.5,
    ourRank: null,
    competitorRank: 8,
  },
  {
    keyword: "chicago wedding guest transportation",
    searchVolume: 700,
    difficulty: 0.55,
    ourRank: null,
    competitorRank: 6,
  },
  {
    keyword: "bachelor party bus chicago suburbs",
    searchVolume: 400,
    difficulty: 0.45,
    ourRank: null,
    competitorRank: null,
  },
];

async function analyzeCompetitors() {
  console.log("Analyzing Competitors...\n");

  const analysisResults = [];

  for (const competitor of COMPETITORS) {
    const analysis = {
      competitorName: competitor.name,
      website: competitor.website,
      servicesOffered: competitor.services,
      estimatedMonthlyTraffic: competitor.estimatedTraffic,
      topKeywords: competitor.keywordsRanking,
      strengths: [],
      weaknesses: [],
    };

    // Analyze strengths/weaknesses
    if (competitor.estimatedTraffic > 4000) {
      analysis.strengths.push("High organic traffic");
    } else {
      analysis.weaknesses.push("Lower organic traffic");
    }

    if (competitor.services.length >= 3) {
      analysis.strengths.push("Diverse service offerings");
    }

    if (!competitor.services.includes("party-bus")) {
      analysis.weaknesses.push("No party bus services");
    }

    // Store in Firestore
    await db
      .collection("competitor_analysis")
      .doc(competitor.website.replace(".", "-"))
      .set({
        ...analysis,
        analyzedAt: admin.firestore.Timestamp.now(),
      });

    analysisResults.push(analysis);
    console.log(`Analyzed: ${competitor.name}`);
    console.log(`  Services: ${competitor.services.join(", ")}`);
    console.log(`  Est. Traffic: ${competitor.estimatedTraffic}/month`);
    console.log(
      `  Strengths: ${analysis.strengths.join(", ") || "None identified"}`,
    );
    console.log(
      `  Weaknesses: ${analysis.weaknesses.join(", ") || "None identified"}`,
    );
    console.log();
  }

  return analysisResults;
}

async function identifyServiceGaps() {
  console.log("Identifying Service Gaps...\n");

  // Get our services
  const servicesSnapshot = await db.collection("services").get();
  const ourServices = servicesSnapshot.docs.map((doc) => doc.data());

  // Get our content
  const contentSnapshot = await db.collection("service_content").get();
  const coveredCombinations = new Set(
    contentSnapshot.docs.map((doc) => doc.id),
  );

  // Get locations
  const locationsSnapshot = await db.collection("locations").get();
  const locations = locationsSnapshot.docs.map((doc) => doc.data());

  const gaps = [];

  // Find high-value uncovered combinations
  for (const location of locations.slice(0, 15)) {
    for (const service of ourServices.slice(0, 10)) {
      const combinationId = `${location.id}_${service.id}`;
      if (!coveredCombinations.has(combinationId)) {
        const relevance = location.applicableServices?.[service.id] || 0;
        if (relevance >= 15) {
          gaps.push({
            locationId: location.id,
            locationName: location.name,
            serviceId: service.id,
            serviceName: service.name,
            relevance,
            priority: relevance >= 18 ? "high" : "medium",
          });
        }
      }
    }
  }

  // Sort by relevance
  gaps.sort((a, b) => b.relevance - a.relevance);
  const topGaps = gaps.slice(0, 10);

  console.log(`Found ${gaps.length} service gaps, top 10:`);
  for (const gap of topGaps) {
    console.log(
      `  [${gap.priority.toUpperCase()}] ${gap.locationName} + ${gap.serviceName} (relevance: ${gap.relevance})`,
    );
  }

  // Store gaps summary
  await db
    .collection("competitor_analysis")
    .doc("service_gaps_summary")
    .set({
      totalGaps: gaps.length,
      highPriorityGaps: gaps.filter((g) => g.priority === "high").length,
      topGaps,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

  return gaps;
}

async function identifyKeywordOpportunities() {
  console.log("\nIdentifying Keyword Opportunities...\n");

  const opportunities = [];

  for (const kw of KEYWORD_OPPORTUNITIES) {
    // Calculate opportunity score
    const opportunityScore = Math.round(
      (kw.searchVolume / 100) *
        (1 - kw.difficulty) *
        (kw.competitorRank ? (10 - kw.competitorRank) / 10 : 1.5),
    );

    opportunities.push({
      ...kw,
      opportunityScore,
      recommendation:
        opportunityScore > 15
          ? "High Priority"
          : opportunityScore > 8
            ? "Medium Priority"
            : "Low Priority",
    });
  }

  // Sort by opportunity score
  opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  console.log("Keyword Opportunities (ranked by potential):");
  for (const opp of opportunities) {
    console.log(`  [${opp.recommendation}] "${opp.keyword}"`);
    console.log(
      `    Volume: ${opp.searchVolume} | Difficulty: ${(opp.difficulty * 100).toFixed(0)}% | Score: ${opp.opportunityScore}`,
    );
  }

  // Store in Firestore
  await db
    .collection("competitor_analysis")
    .doc("keyword_opportunities")
    .set({
      opportunities,
      totalOpportunities: opportunities.length,
      highPriority: opportunities.filter(
        (o) => o.recommendation === "High Priority",
      ).length,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

  return opportunities;
}

async function main() {
  console.log("=== COMPETITOR ANALYSIS WORKFLOW ===\n");

  await analyzeCompetitors();
  const gaps = await identifyServiceGaps();
  const keywords = await identifyKeywordOpportunities();

  console.log("\n=== ANALYSIS COMPLETE ===");
  console.log(`Competitors analyzed: ${COMPETITORS.length}`);
  console.log(`Service gaps identified: ${gaps.length}`);
  console.log(`Keyword opportunities: ${keywords.length}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
