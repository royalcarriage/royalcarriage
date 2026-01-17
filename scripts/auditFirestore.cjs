const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}
const db = admin.firestore();

async function audit() {
  const collections = [
    'tenants', 'users', 'drivers', 'fleet_vehicles', 'vehicles',
    'locations', 'services', 'service_content', 'blog_posts',
    'bookings', 'customers', 'payments', 'invoices',
    'auditLogs', 'activity_log', 'imports', 'analytics',
    'competitor_analysis', 'content_quality_scores', 'page_analyses',
    'regeneration_queue', 'seo-reports', 'seo-tasks', 'organizations'
  ];

  console.log('=== FIRESTORE AUDIT ===\n');
  console.log('Collection                  | Documents | Status');
  console.log('----------------------------|-----------|--------');

  let totalDocs = 0;
  for (const name of collections) {
    try {
      const snapshot = await db.collection(name).count().get();
      const count = snapshot.data().count;
      totalDocs += count;
      const status = count > 0 ? 'OK' : 'EMPTY';
      console.log(name.padEnd(27) + ' | ' + String(count).padStart(9) + ' | ' + status);
    } catch (e) {
      console.log(name.padEnd(27) + ' | ' + String(0).padStart(9) + ' | NOT FOUND');
    }
  }

  console.log('----------------------------|-----------|--------');
  console.log('TOTAL                       | ' + String(totalDocs).padStart(9) + ' |');

  process.exit(0);
}

audit();
