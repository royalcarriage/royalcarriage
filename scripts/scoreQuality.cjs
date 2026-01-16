/**
 * Quality Scoring Script
 * Calculates quality scores for generated content using 7-metric system
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}

const db = admin.firestore();

// Metric weights (must sum to 1.0)
const WEIGHTS = {
  keywordDensity: 0.15,
  readability: 0.15,
  contentLength: 0.10,
  structure: 0.10,
  seo: 0.25,
  originality: 0.15,
  engagement: 0.10,
};

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function countSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function calculateKeywordDensity(content, keywords) {
  const text = JSON.stringify(content).toLowerCase();
  const wordCount = countWords(text);
  let keywordCount = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = text.match(regex);
    keywordCount += matches ? matches.length : 0;
  }

  const density = (keywordCount / wordCount) * 100;
  // Optimal density is 1-3%
  if (density >= 1 && density <= 3) return 100;
  if (density < 1) return density * 100;
  if (density > 3) return Math.max(0, 100 - (density - 3) * 20);
  return 50;
}

function calculateReadability(content) {
  const text = content.introduction || '';
  const words = countWords(text);
  const sentences = countSentences(text);

  if (sentences === 0) return 50;

  const avgWordsPerSentence = words / sentences;
  // Optimal is 15-20 words per sentence
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 100;
  if (avgWordsPerSentence < 10) return 60;
  if (avgWordsPerSentence > 25) return 60;
  return 80;
}

function calculateContentLength(content) {
  const text = JSON.stringify(content);
  const words = countWords(text);

  // Optimal length is 500-1500 words
  if (words >= 500 && words <= 1500) return 100;
  if (words < 300) return 40;
  if (words < 500) return 70;
  if (words > 2000) return 70;
  return 85;
}

function calculateStructure(content) {
  let score = 0;

  if (content.title) score += 20;
  if (content.metaDescription) score += 15;
  if (content.h1) score += 15;
  if (content.introduction && content.introduction.length > 100) score += 20;
  if (content.features && content.features.length >= 3) score += 15;
  if (content.faq && content.faq.length >= 2) score += 15;

  return score;
}

function calculateSEO(content, keywords) {
  let score = 0;

  // Title contains keywords
  if (content.title) {
    const titleLower = content.title.toLowerCase();
    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 20;
        break;
      }
    }
  }

  // Meta description exists and has good length
  if (content.metaDescription) {
    const metaLen = content.metaDescription.length;
    if (metaLen >= 120 && metaLen <= 160) score += 25;
    else if (metaLen >= 100 && metaLen <= 180) score += 15;
  }

  // H1 exists
  if (content.h1) score += 15;

  // FAQ exists (great for featured snippets)
  if (content.faq && content.faq.length >= 2) score += 20;

  // Call to action exists
  if (content.callToAction) score += 20;

  return Math.min(100, score);
}

function calculateOriginality(content) {
  // For generated content, we assume it's original
  // In production, this would compare against existing content
  return 85;
}

function calculateEngagement(content) {
  let score = 50;

  // Has call to action
  if (content.callToAction) score += 20;

  // Has features/benefits
  if (content.features && content.features.length >= 3) score += 15;

  // Has FAQ for user questions
  if (content.faq && content.faq.length >= 2) score += 15;

  return Math.min(100, score);
}

function calculateOverallScore(metrics) {
  let total = 0;
  for (const [metric, value] of Object.entries(metrics)) {
    total += value * (WEIGHTS[metric] || 0);
  }
  return Math.round(total);
}

async function main() {
  console.log('Starting Quality Scoring\n');

  // Get all generated content
  const contentSnapshot = await db
    .collection('service_content')
    .where('status', '==', 'generated')
    .get();

  console.log(`Found ${contentSnapshot.size} content items to score\n`);

  let scored = 0;

  for (const doc of contentSnapshot.docs) {
    const data = doc.data();
    const content = data.content;

    // Get service for keywords
    const serviceDoc = await db.collection('services').doc(data.serviceId).get();
    const keywords = serviceDoc.exists ? (serviceDoc.data().keywords || []) : [];

    // Calculate metrics
    const metrics = {
      keywordDensity: calculateKeywordDensity(content, keywords),
      readability: calculateReadability(content),
      contentLength: calculateContentLength(content),
      structure: calculateStructure(content),
      seo: calculateSEO(content, keywords),
      originality: calculateOriginality(content),
      engagement: calculateEngagement(content),
    };

    const overallScore = calculateOverallScore(metrics);

    // Store quality score
    await db.collection('content_quality_scores').doc(doc.id).set({
      contentId: doc.id,
      locationId: data.locationId,
      serviceId: data.serviceId,
      websiteId: data.websiteId,
      metrics,
      overallScore,
      scoredAt: admin.firestore.Timestamp.now(),
    });

    // Update content status
    await doc.ref.update({
      qualityScore: overallScore,
      scoredAt: admin.firestore.Timestamp.now(),
    });

    console.log(`${data.locationId} + ${data.serviceId}: Score ${overallScore}/100`);
    console.log(`  Metrics: KD=${metrics.keywordDensity.toFixed(0)} RD=${metrics.readability.toFixed(0)} CL=${metrics.contentLength.toFixed(0)} ST=${metrics.structure.toFixed(0)} SEO=${metrics.seo.toFixed(0)} OR=${metrics.originality.toFixed(0)} EN=${metrics.engagement.toFixed(0)}`);
    scored++;
  }

  console.log(`\n=== QUALITY SCORING COMPLETE ===`);
  console.log(`Scored: ${scored} items`);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
