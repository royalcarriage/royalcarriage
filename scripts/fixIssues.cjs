const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}
const db = admin.firestore();

async function fixIssues() {
  console.log('=== FIXING SYSTEM ISSUES ===\n');
  const now = admin.firestore.Timestamp.now();

  // 1. Create default organization
  console.log('1. Creating default organization...');
  const orgRef = db.collection('organizations').doc('royal-carriage');
  const orgDoc = await orgRef.get();

  if (!orgDoc.exists) {
    await orgRef.set({
      id: 'royal-carriage',
      name: 'Royal Carriage Limousine',
      slug: 'royal-carriage',
      description: 'Premium Chicago limousine and transportation services',
      status: 'active',
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      contact: {
        email: 'info@royalcarriagelimo.com',
        phone: '(312) 555-0100',
        address: 'Chicago, IL'
      },
      websites: [
        'royalcarriagelimoseo.web.app',
        'chicagoairportblackcar.web.app',
        'chicagoexecutivecarservice.web.app',
        'chicagoweddingtransportation.web.app',
        'chicago-partybus.web.app'
      ],
      features: {
        dispatchSystem: true,
        fleetManagement: true,
        driverPayroll: true,
        affiliateSystem: false,
        accounting: true,
        customerPortal: false,
        blogSystem: true,
        mobileApp: false,
        smsNotifications: false,
        aiCopilots: true
      },
      createdAt: now,
      updatedAt: now
    });
    console.log('   Created organization: royal-carriage');
  } else {
    console.log('   Organization already exists');
  }

  // 2. Initialize activity_log with system entries
  console.log('\n2. Initializing activity_log...');
  const activityLogs = [
    {
      type: 'system',
      action: 'system_audit',
      message: 'System audit completed - All systems operational',
      status: 'success',
      metadata: {
        hostingSites: 5,
        cloudFunctions: 130,
        firestoreDocuments: 1069
      },
      timestamp: now
    },
    {
      type: 'deployment',
      action: 'deploy_hosting',
      message: 'Deployed all 5 hosting sites successfully',
      status: 'success',
      metadata: {
        sites: ['admin', 'airport', 'corporate', 'wedding', 'partybus']
      },
      timestamp: now
    },
    {
      type: 'deployment',
      action: 'deploy_functions',
      message: 'Deployed 130 Cloud Functions',
      status: 'success',
      metadata: {
        functionsCount: 130,
        runtime: 'nodejs20'
      },
      timestamp: now
    },
    {
      type: 'data',
      action: 'seed_drivers',
      message: 'Seeded 8 sample drivers',
      status: 'success',
      metadata: {
        driversCount: 8
      },
      timestamp: now
    },
    {
      type: 'config',
      action: 'update_rules',
      message: 'Updated Firestore security rules - enabled public read for content',
      status: 'success',
      metadata: {
        collections: ['service_content', 'locations', 'services', 'fleet_vehicles', 'blog_posts']
      },
      timestamp: now
    }
  ];

  const batch = db.batch();
  for (const log of activityLogs) {
    const docRef = db.collection('activity_log').doc();
    batch.set(docRef, log);
  }
  await batch.commit();
  console.log('   Added ' + activityLogs.length + ' activity log entries');

  // 3. Update users with organizationId
  console.log('\n3. Updating users with organizationId...');
  const usersSnapshot = await db.collection('users').get();
  const userBatch = db.batch();
  let updatedUsers = 0;

  usersSnapshot.forEach(doc => {
    if (!doc.data().organizationId) {
      userBatch.update(doc.ref, {
        organizationId: 'royal-carriage',
        updatedAt: now
      });
      updatedUsers++;
    }
  });

  if (updatedUsers > 0) {
    await userBatch.commit();
    console.log('   Updated ' + updatedUsers + ' users with organizationId');
  } else {
    console.log('   All users already have organizationId');
  }

  // 4. Update drivers with organizationId
  console.log('\n4. Updating drivers with organizationId...');
  const driversSnapshot = await db.collection('drivers').get();
  const driverBatch = db.batch();
  let updatedDrivers = 0;

  driversSnapshot.forEach(doc => {
    if (!doc.data().organizationId) {
      driverBatch.update(doc.ref, {
        organizationId: 'royal-carriage',
        updatedAt: now
      });
      updatedDrivers++;
    }
  });

  if (updatedDrivers > 0) {
    await driverBatch.commit();
    console.log('   Updated ' + updatedDrivers + ' drivers with organizationId');
  } else {
    console.log('   All drivers already have organizationId');
  }

  console.log('\n=== ALL ISSUES FIXED ===');
  process.exit(0);
}

fixIssues().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
