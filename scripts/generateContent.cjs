/**
 * Content Generation Script
 * Generates SEO content for location-service combinations using Vertex AI (Gemini)
 */

const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}

const db = admin.firestore();

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: 'royalcarriagelimoseo',
  location: 'us-central1',
});

const model = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

async function generateContentForLocation(locationId, serviceId) {
  // Get location and service data
  const [locationDoc, serviceDoc] = await Promise.all([
    db.collection('locations').doc(locationId).get(),
    db.collection('services').doc(serviceId).get(),
  ]);

  if (!locationDoc.exists || !serviceDoc.exists) {
    console.log(`  Skipping: Location or service not found`);
    return null;
  }

  const location = locationDoc.data();
  const service = serviceDoc.data();

  const prompt = `Generate SEO-optimized content for a limousine service page.

Location: ${location.name}, Chicago area
Service: ${service.name}
Service Description: ${service.description}
Target Keywords: ${(service.keywords || []).join(', ')}

Create the following content in JSON format:
{
  "title": "SEO-optimized page title (50-60 characters)",
  "metaDescription": "Compelling meta description (150-160 characters)",
  "h1": "Main heading with location and service",
  "introduction": "2-3 paragraph introduction (200-300 words) highlighting the service for this specific location",
  "features": ["5 key features/benefits as bullet points"],
  "callToAction": "Strong call to action text",
  "faq": [
    {"question": "FAQ 1", "answer": "Answer 1"},
    {"question": "FAQ 2", "answer": "Answer 2"},
    {"question": "FAQ 3", "answer": "Answer 3"}
  ]
}

Make the content specific to ${location.name} and the Chicago metropolitan area. Include local landmarks, neighborhoods, or business districts when relevant. Focus on professionalism, reliability, and luxury.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`  Warning: Could not parse JSON response`);
      return null;
    }

    const content = JSON.parse(jsonMatch[0]);

    // Store in Firestore
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
    console.log(`  Error generating content: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Starting Content Generation with Vertex AI (Gemini)\n');

  // Get pending queue items
  const queueSnapshot = await db
    .collection('regeneration_queue')
    .where('status', '==', 'pending')
    .limit(12)
    .get();

  console.log(`Found ${queueSnapshot.size} pending items in queue\n`);

  let generated = 0;
  let failed = 0;

  for (const doc of queueSnapshot.docs) {
    const item = doc.data();
    console.log(`Processing: ${item.locationId} + ${item.serviceId}`);

    const content = await generateContentForLocation(item.locationId, item.serviceId);

    if (content) {
      // Update queue status
      await doc.ref.update({
        status: 'completed',
        completedAt: admin.firestore.Timestamp.now(),
      });
      generated++;
      console.log(`  Generated: "${content.title}"`);
    } else {
      await doc.ref.update({
        status: 'failed',
        retries: (item.retries || 0) + 1,
      });
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n=== CONTENT GENERATION COMPLETE ===');
  console.log(`Generated: ${generated}`);
  console.log(`Failed: ${failed}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
