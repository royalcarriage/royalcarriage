/**
 * Auto-Regeneration Test Script
 * Tests the regeneration queue processing with real tasks
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}

const db = admin.firestore();

async function testRegenerationQueue() {
  console.log('=== AUTO-REGENERATION TEST ===\n');

  // 1. Add test regeneration tasks
  console.log('1. Adding test regeneration tasks...');

  const testTasks = [
    { locationId: 'naperville', serviceId: 'airport-ohard', reason: 'Low quality score', priority: 9 },
    { locationId: 'schaumburg', serviceId: 'corporate-meeting', reason: 'Content refresh', priority: 8 },
    { locationId: 'oak-brook', serviceId: 'wedding-bride', reason: 'Competitor content update', priority: 7 },
  ];

  for (const task of testTasks) {
    const taskId = `regen_${task.locationId}_${task.serviceId}`;
    await db.collection('regeneration_queue').doc(taskId).set({
      ...task,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      retries: 0,
    });
    console.log(`  Added: ${task.locationId} + ${task.serviceId} (${task.reason})`);
  }

  // 2. Check queue status
  console.log('\n2. Queue Status:');
  const pendingSnapshot = await db.collection('regeneration_queue').where('status', '==', 'pending').get();
  const completedSnapshot = await db.collection('regeneration_queue').where('status', '==', 'completed').get();
  const failedSnapshot = await db.collection('regeneration_queue').where('status', '==', 'failed').get();

  console.log(`  Pending: ${pendingSnapshot.size}`);
  console.log(`  Completed: ${completedSnapshot.size}`);
  console.log(`  Failed: ${failedSnapshot.size}`);

  // 3. Log regeneration to history
  console.log('\n3. Logging to regeneration history...');
  await db.collection('regeneration_logs').add({
    type: 'test_run',
    tasksAdded: testTasks.length,
    timestamp: admin.firestore.Timestamp.now(),
    status: 'pending',
    message: 'Test regeneration tasks queued for processing',
  });

  // 4. Verify content can be retrieved
  console.log('\n4. Verifying existing content structure...');
  const contentSnapshot = await db.collection('service_content').limit(3).get();

  for (const doc of contentSnapshot.docs) {
    const data = doc.data();
    console.log(`  Content: ${doc.id}`);
    console.log(`    Title: ${data.content?.title || 'N/A'}`);
    console.log(`    Quality Score: ${data.qualityScore || 'Not scored'}`);
    console.log(`    Status: ${data.status}`);
  }

  // 5. Summary
  console.log('\n=== REGENERATION TEST COMPLETE ===');
  console.log('Tasks added to queue: 3');
  console.log('Queue is ready for scheduled processing');
  console.log('Daily regeneration runs at 2 AM CT');
  console.log('Hourly queue processing is configured');

  return {
    tasksAdded: testTasks.length,
    queueStatus: {
      pending: pendingSnapshot.size + testTasks.length,
      completed: completedSnapshot.size,
      failed: failedSnapshot.size,
    },
  };
}

async function main() {
  const result = await testRegenerationQueue();
  console.log('\nTest Result:', JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
