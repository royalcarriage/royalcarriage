/**
 * Fill Service Gaps - Generate content for high-priority uncovered combinations
 */

const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}

const db = admin.firestore();
const vertexAI = new VertexAI({ project: 'royalcarriagelimoseo', location: 'us-central1' });
const model = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

// High-priority gaps identified from competitor analysis
const HIGH_PRIORITY_GAPS = [
  { locationId: 'naperville', serviceId: 'airport-ohard' },
  { locationId: 'naperville', serviceId: 'airport-executive' },
  { locationId: 'naperville', serviceId: 'corporate-executive' },
  { locationId: 'schaumburg', serviceId: 'airport-ohard' },
  { locationId: 'schaumburg', serviceId: 'corporate-meeting' },
  { locationId: 'oak-brook', serviceId: 'airport-ohard' },
  { locationId: 'oak-brook', serviceId: 'wedding-bride' },
  { locationId: 'hinsdale', serviceId: 'airport-ohard' },
  { locationId: 'hinsdale', serviceId: 'wedding-bride' },
  { locationId: 'river-north', serviceId: 'airport-ohard' },
  { locationId: 'river-north', serviceId: 'partybus-nightclub' },
  { locationId: 'wicker-park', serviceId: 'partybus-nightclub' },
  { locationId: 'bucktown', serviceId: 'partybus-birthday' },
  { locationId: 'evanston', serviceId: 'airport-ohard' },
  { locationId: 'glenview', serviceId: 'corporate-executive' },
];

async function generateContent(locationId, serviceId) {
  const [locationDoc, serviceDoc] = await Promise.all([
    db.collection('locations').doc(locationId).get(),
    db.collection('services').doc(serviceId).get(),
  ]);

  if (!locationDoc.exists || !serviceDoc.exists) return null;

  const location = locationDoc.data();
  const service = serviceDoc.data();

  const prompt = `Generate SEO-optimized content for a limousine service page.

Location: ${location.name}, Chicago area
Service: ${service.name}
Description: ${service.description}
Keywords: ${(service.keywords || []).join(', ')}

Create JSON:
{
  "title": "SEO title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "h1": "Main heading",
  "introduction": "2-3 paragraphs (200-300 words) specific to ${location.name}",
  "features": ["5 key benefits"],
  "callToAction": "Strong CTA",
  "faq": [{"question": "Q1", "answer": "A1"}, {"question": "Q2", "answer": "A2"}, {"question": "Q3", "answer": "A3"}]
}

Make content specific to ${location.name}. Include local landmarks. Professional tone.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const content = JSON.parse(jsonMatch[0]);
    const contentId = `${locationId}_${serviceId}`;

    await db.collection('service_content').doc(contentId).set({
      locationId,
      serviceId,
      websiteId: service.website,
      content,
      status: 'generated',
      approvalStatus: 'pending',
      generatedAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return content;
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('=== FILLING SERVICE GAPS ===\n');

  // Check existing content
  const existingContent = new Set();
  const contentSnapshot = await db.collection('service_content').get();
  contentSnapshot.docs.forEach(doc => existingContent.add(doc.id));

  let generated = 0;
  let skipped = 0;

  for (const gap of HIGH_PRIORITY_GAPS) {
    const contentId = `${gap.locationId}_${gap.serviceId}`;

    if (existingContent.has(contentId)) {
      console.log(`Skipping: ${gap.locationId} + ${gap.serviceId} (already exists)`);
      skipped++;
      continue;
    }

    console.log(`Generating: ${gap.locationId} + ${gap.serviceId}`);
    const content = await generateContent(gap.locationId, gap.serviceId);

    if (content) {
      console.log(`  ✓ "${content.title}"`);
      generated++;
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);

  // Run quality scoring on new content
  console.log('\nRunning quality scoring...');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
