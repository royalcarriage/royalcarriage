const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}
const db = admin.firestore();

async function audit() {
  // Get locations
  const locSnap = await db.collection('locations').get();
  console.log('=== LOCATIONS (' + locSnap.size + ') ===');
  const locTypes = {};
  const locByArea = {};
  locSnap.forEach(doc => {
    const d = doc.data();
    locTypes[d.type || 'unknown'] = (locTypes[d.type || 'unknown'] || 0) + 1;
    const area = d.area || d.region || 'unknown';
    locByArea[area] = (locByArea[area] || 0) + 1;
  });
  console.log('By type:', JSON.stringify(locTypes, null, 2));
  console.log('By area:', JSON.stringify(locByArea, null, 2));

  // Sample locations
  console.log('\nSample locations:');
  let count = 0;
  locSnap.forEach(doc => {
    if (count < 5) {
      const d = doc.data();
      console.log(`  - ${d.name} (${d.slug || doc.id}): type=${d.type}, area=${d.area}`);
      count++;
    }
  });

  // Get services
  const svcSnap = await db.collection('services').get();
  console.log('\n=== SERVICES (' + svcSnap.size + ') ===');
  const svcByWebsite = {};
  const svcByCategory = {};
  svcSnap.forEach(doc => {
    const d = doc.data();
    const website = d.websiteId || 'shared';
    svcByWebsite[website] = (svcByWebsite[website] || 0) + 1;
    const cat = d.category || 'general';
    svcByCategory[cat] = (svcByCategory[cat] || 0) + 1;
  });
  console.log('By website:', JSON.stringify(svcByWebsite, null, 2));
  console.log('By category:', JSON.stringify(svcByCategory, null, 2));

  // Sample services
  console.log('\nSample services:');
  count = 0;
  svcSnap.forEach(doc => {
    if (count < 10) {
      const d = doc.data();
      console.log(`  - ${d.name} (${d.slug || doc.id}): website=${d.websiteId}, category=${d.category}`);
      count++;
    }
  });

  // Get service_content
  const contentSnap = await db.collection('service_content').get();
  console.log('\n=== SERVICE CONTENT (' + contentSnap.size + ') ===');
  const contentByStatus = {};
  const contentByWebsite = {};
  contentSnap.forEach(doc => {
    const d = doc.data();
    const status = d.approvalStatus || 'pending';
    contentByStatus[status] = (contentByStatus[status] || 0) + 1;
    const website = d.websiteId || 'unknown';
    contentByWebsite[website] = (contentByWebsite[website] || 0) + 1;
  });
  console.log('By status:', JSON.stringify(contentByStatus, null, 2));
  console.log('By website:', JSON.stringify(contentByWebsite, null, 2));

  // Get fleet vehicles
  const fleetSnap = await db.collection('fleet_vehicles').get();
  console.log('\n=== FLEET VEHICLES (' + fleetSnap.size + ') ===');
  const fleetByType = {};
  fleetSnap.forEach(doc => {
    const d = doc.data();
    const type = d.type || d.category || 'unknown';
    fleetByType[type] = (fleetByType[type] || 0) + 1;
  });
  console.log('By type:', JSON.stringify(fleetByType, null, 2));

  // List all vehicles
  console.log('\nAll vehicles:');
  fleetSnap.forEach(doc => {
    const d = doc.data();
    console.log(`  - ${d.name}: ${d.type || d.category}, capacity=${d.passengerCapacity || d.capacity}`);
  });

  process.exit(0);
}

audit().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
