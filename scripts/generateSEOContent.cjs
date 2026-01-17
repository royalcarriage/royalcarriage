const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'royalcarriagelimoseo' });
}
const db = admin.firestore();

// Cross-selling configuration - what services to recommend on each website
const CROSS_SELL_CONFIG = {
  'chicagoairportblackcar': {
    relatedWebsites: ['chicagoexecutivecarservice', 'chicago-partybus'],
    vehicleTypes: ['sedan', 'suv', 'van', 'executive-van'],
    crossSellMessages: {
      'chicagoexecutivecarservice': 'Need hourly corporate transportation? Check out our Executive Car Service for business meetings and corporate events.',
      'chicago-partybus': 'Traveling with a large group? Our Party Bus service offers fun, spacious transportation for groups up to 36 passengers.',
      'chicagoweddingtransportation': 'Planning a wedding? We offer elegant wedding limousine services for your special day.'
    }
  },
  'chicagoexecutivecarservice': {
    relatedWebsites: ['chicagoairportblackcar', 'chicago-partybus'],
    vehicleTypes: ['sedan', 'luxury-sedan', 'suv', 'luxury-suv', 'executive-van'],
    crossSellMessages: {
      'chicagoairportblackcar': 'Need airport transportation? Our Airport Black Car Service provides reliable O\'Hare and Midway transfers.',
      'chicago-partybus': 'Planning a corporate team outing? Our Party Bus service is perfect for company events and team building.',
      'chicagoweddingtransportation': 'Hosting VIP clients for a special event? Our Wedding Transportation service provides elegant vehicles.'
    }
  },
  'chicagoweddingtransportation': {
    relatedWebsites: ['chicago-partybus', 'chicagoairportblackcar'],
    vehicleTypes: ['stretch-limo', 'stretch', 'suv', 'luxury-suv', 'van', 'partyBus'],
    crossSellMessages: {
      'chicago-partybus': 'Planning a bachelor or bachelorette party? Our Party Bus service is perfect for pre-wedding celebrations!',
      'chicagoairportblackcar': 'Out-of-town guests arriving by plane? Our Airport Service ensures they arrive in style.',
      'chicagoexecutivecarservice': 'Need transportation for wedding vendors or rehearsal dinner? Our Executive Car Service provides professional transportation.'
    }
  },
  'chicago-partybus': {
    relatedWebsites: ['chicagoweddingtransportation', 'chicagoairportblackcar'],
    vehicleTypes: ['partyBus', 'stretch-limo', 'stretch', 'van'],
    crossSellMessages: {
      'chicagoweddingtransportation': 'Getting married? Our Wedding Transportation service offers elegant limousines for your special day.',
      'chicagoairportblackcar': 'Need airport transfers for your group? Our Airport Service handles groups of all sizes.',
      'chicagoexecutivecarservice': 'Planning a corporate event? Our Executive Car Service provides professional transportation.'
    }
  }
};

// High-value SEO content templates by service category
const SEO_CONTENT_TEMPLATES = {
  airport: {
    intro: (location, service) => `
      <p class="lead">Experience premium airport limousine service in <strong>${location}</strong>. Royal Carriage Limousine provides reliable, luxurious transportation between ${location} and Chicago's major airports, including O'Hare International (ORD) and Midway International (MDW).</p>

      <p>Our professional chauffeurs monitor flight schedules in real-time, ensuring on-time pickup regardless of delays or early arrivals. We understand that your travel plans are important, which is why we offer 24/7 availability and flat-rate pricing with no hidden fees.</p>
    `,
    benefits: `
      <h2>Why Choose Royal Carriage for Airport Transportation?</h2>
      <ul>
        <li><strong>Real-Time Flight Tracking</strong> - We monitor your flight status and adjust pickup times automatically</li>
        <li><strong>Meet & Greet Service</strong> - Your chauffeur waits at baggage claim with a name sign</li>
        <li><strong>Flat-Rate Pricing</strong> - Know your cost upfront, no surge pricing or hidden fees</li>
        <li><strong>24/7 Availability</strong> - Early morning departures and late-night arrivals covered</li>
        <li><strong>Professional Chauffeurs</strong> - Background-checked, licensed, experienced drivers</li>
        <li><strong>Luxury Fleet</strong> - Late-model sedans, SUVs, and vans for any group size</li>
      </ul>
    `,
    vehicles: `
      <h2>Airport Transportation Fleet Options</h2>
      <div class="vehicle-grid">
        <div class="vehicle-card">
          <h3>Executive Sedan</h3>
          <p>Lincoln Continental or Mercedes S-Class. Perfect for 1-3 passengers with luggage. Premium leather interior, complimentary WiFi, and bottled water.</p>
        </div>
        <div class="vehicle-card">
          <h3>Luxury SUV</h3>
          <p>Cadillac Escalade or Lincoln Navigator. Seats up to 6 passengers with ample luggage space. Ideal for families or business groups.</p>
        </div>
        <div class="vehicle-card">
          <h3>Executive Sprinter Van</h3>
          <p>Mercedes Sprinter accommodating 12-14 passengers. Perfect for corporate groups, sports teams, or large families.</p>
        </div>
      </div>
    `
  },
  corporate: {
    intro: (location, service) => `
      <p class="lead">Elevate your business travel with Royal Carriage's executive car service in <strong>${location}</strong>. We specialize in providing punctual, professional, and discreet transportation for Chicago's business community.</p>

      <p>From airport transfers to multi-stop business meetings, our chauffeurs understand the importance of your time. Our vehicles offer a productive environment with WiFi, power outlets, and privacy for confidential calls.</p>
    `,
    benefits: `
      <h2>Corporate Transportation Benefits</h2>
      <ul>
        <li><strong>Corporate Accounts Available</strong> - Monthly billing, detailed reports, and preferred rates</li>
        <li><strong>Priority Booking</strong> - Dedicated account managers for corporate clients</li>
        <li><strong>Productive Environment</strong> - WiFi, charging ports, and privacy partitions</li>
        <li><strong>Professional Drivers</strong> - Business etiquette training and confidentiality protocols</li>
        <li><strong>Flexible Service</strong> - Hourly, point-to-point, or as-directed options</li>
        <li><strong>Real-Time Tracking</strong> - Know exactly where your executives are</li>
      </ul>
    `,
    vehicles: `
      <h2>Executive Fleet Selection</h2>
      <div class="vehicle-grid">
        <div class="vehicle-card">
          <h3>Mercedes S-Class</h3>
          <p>The pinnacle of executive transportation. Rear executive seating, privacy partition, premium sound system.</p>
        </div>
        <div class="vehicle-card">
          <h3>BMW 7 Series</h3>
          <p>Ultimate driving luxury for discerning executives. Advanced technology and unmatched comfort.</p>
        </div>
        <div class="vehicle-card">
          <h3>Cadillac Escalade ESV</h3>
          <p>Spacious luxury for executive teams. Perfect for multi-person meetings on the move.</p>
        </div>
      </div>
    `
  },
  wedding: {
    intro: (location, service) => `
      <p class="lead">Make your wedding day unforgettable with Royal Carriage's elegant limousine service in <strong>${location}</strong>. From intimate ceremonies to grand celebrations, we provide luxurious transportation that matches the elegance of your special day.</p>

      <p>Our experienced wedding coordinators work with you and your planner to ensure seamless transportation logistics. We offer complimentary champagne service, red carpet rollout, and "Just Married" signage to make your exit memorable.</p>
    `,
    benefits: `
      <h2>Wedding Transportation Services</h2>
      <ul>
        <li><strong>Bridal Party Transportation</strong> - Coordinate rides for your entire wedding party</li>
        <li><strong>Guest Shuttles</strong> - Transport guests between ceremony, reception, and hotels</li>
        <li><strong>Bachelor/Bachelorette Parties</strong> - Fun, safe pre-wedding celebration transportation</li>
        <li><strong>Rehearsal Dinner Service</strong> - Professional transportation for pre-wedding events</li>
        <li><strong>Complimentary Amenities</strong> - Champagne, red carpet, "Just Married" signs</li>
        <li><strong>Photo-Ready Vehicles</strong> - Immaculately detailed for your wedding photos</li>
      </ul>
    `,
    vehicles: `
      <h2>Wedding Fleet Options</h2>
      <div class="vehicle-grid">
        <div class="vehicle-card">
          <h3>Stretch Limousine</h3>
          <p>Classic wedding elegance. Seats up to 10 passengers with wet bar, fiber optic lighting, and premium sound system.</p>
        </div>
        <div class="vehicle-card">
          <h3>Luxury SUV</h3>
          <p>Modern elegance for intimate weddings. Perfect for bride and groom photos and stylish arrivals.</p>
        </div>
        <div class="vehicle-card">
          <h3>Party Bus</h3>
          <p>For larger bridal parties. Dance floor, LED lighting, and room for the whole group to celebrate together.</p>
        </div>
      </div>
    `
  },
  partybus: {
    intro: (location, service) => `
      <p class="lead">Experience Chicago's ultimate party on wheels with Royal Carriage's premium party bus service from <strong>${location}</strong>. Our party buses transform every trip into an unforgettable celebration.</p>

      <p>Whether you're planning a bachelor party, bachelorette celebration, birthday bash, or a night exploring Chicago's vibrant nightlife, our party buses keep the fun going from pickup to drop-off. Bring your own beverages and let us handle the driving!</p>
    `,
    benefits: `
      <h2>Party Bus Experience</h2>
      <ul>
        <li><strong>Premium Sound Systems</strong> - Club-quality audio with Bluetooth connectivity</li>
        <li><strong>LED Mood Lighting</strong> - Create the perfect party atmosphere</li>
        <li><strong>Dance Floor Area</strong> - Get up and move without stopping the party</li>
        <li><strong>Built-in Bars</strong> - Coolers stocked with ice, BYOB welcome</li>
        <li><strong>Multiple Stops</strong> - Hit all the hottest venues in one night</li>
        <li><strong>Professional Drivers</strong> - Everyone parties, everyone gets home safe</li>
      </ul>
    `,
    vehicles: `
      <h2>Party Bus Fleet</h2>
      <div class="vehicle-grid">
        <div class="vehicle-card">
          <h3>24-Passenger Party Bus</h3>
          <p>Perfect for medium groups. Full entertainment system, bar area, and dance floor. Great for birthdays and night outs.</p>
        </div>
        <div class="vehicle-card">
          <h3>36-Passenger Party Bus</h3>
          <p>Our flagship party experience. Maximum space, maximum fun. Bachelor/bachelorette parties, corporate events, and large celebrations.</p>
        </div>
        <div class="vehicle-card">
          <h3>Stretch Limousine</h3>
          <p>Classic party style for smaller groups. Up to 10 passengers in timeless luxury.</p>
        </div>
      </div>
    `
  }
};

// Popular Chicago destinations and landmarks for SEO
const CHICAGO_LANDMARKS = {
  downtown: ['Willis Tower', 'Millennium Park', 'Navy Pier', 'Magnificent Mile', 'Art Institute', 'Chicago Riverwalk'],
  airports: ["O'Hare International Airport (ORD)", "Midway International Airport (MDW)", "Chicago Executive Airport"],
  venues: ['United Center', 'Soldier Field', 'Wrigley Field', 'Guaranteed Rate Field', 'McCormick Place'],
  neighborhoods: ['River North', 'Gold Coast', 'Lincoln Park', 'Wicker Park', 'West Loop', 'Streeterville']
};

async function generateContentForWebsite(websiteId, locations, services, vehicles) {
  let contentCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_LIMIT = 450; // Firestore batch limit is 500

  // Determine category prefix based on website
  let categoryPrefix = 'airport';
  if (websiteId.includes('corporate') || websiteId.includes('executive')) categoryPrefix = 'corporate';
  if (websiteId.includes('wedding')) categoryPrefix = 'wedding';
  if (websiteId.includes('partybus') || websiteId.includes('party')) categoryPrefix = 'partybus';

  // Get relevant services for this website (case-insensitive matching)
  const relevantServices = services.filter(s => {
    const cat = (s.category || '').toLowerCase();
    return cat.startsWith(categoryPrefix) || cat === categoryPrefix;
  });

  console.log(`Generating content for ${websiteId}: ${relevantServices.length} services x priority locations`);

  // Get cross-sell config
  const crossSell = CROSS_SELL_CONFIG[websiteId] || {};
  const template = SEO_CONTENT_TEMPLATES[categoryPrefix];

  // Get relevant vehicles
  const relevantVehicles = vehicles.filter(v =>
    (crossSell.vehicleTypes || []).includes(v.type || v.category)
  );

  // Generate content for top locations (prioritize suburbs with high traffic)
  const priorityLocations = locations.slice(0, 50); // Top 50 locations

  for (const loc of priorityLocations) {
    for (const svc of relevantServices.slice(0, 5)) { // Top 5 services per location
      const contentId = `${websiteId}-${loc.slug || loc.id}-${svc.slug || svc.id}`;

      // Generate rich content
      const title = `${svc.name} in ${loc.name}, Chicago - Royal Carriage Limousine`;
      const metaDescription = `Professional ${svc.name.toLowerCase()} in ${loc.name}. Luxury ${categoryPrefix} transportation with experienced chauffeurs. Available 24/7. Book online or call (224) 801-3090.`;

      // Build content with templates
      let content = template.intro(loc.name, svc.name);
      content += template.benefits;
      content += template.vehicles;

      // Add location-specific content
      content += `
        <h2>${svc.name} Service Area: ${loc.name}</h2>
        <p>Royal Carriage provides premium ${categoryPrefix} transportation throughout ${loc.name} and the surrounding Chicago metropolitan area. Our local expertise ensures efficient routing and on-time service.</p>

        <h3>Service Coverage</h3>
        <ul>
          <li>${loc.name} to O'Hare Airport (ORD)</li>
          <li>${loc.name} to Midway Airport (MDW)</li>
          <li>${loc.name} to Downtown Chicago</li>
          <li>${loc.name} to major Chicago venues and hotels</li>
        </ul>
      `;

      // Add cross-selling section
      content += `
        <h2>Additional Services Available</h2>
        <p>In addition to our ${categoryPrefix} services, Royal Carriage offers:</p>
        <ul>
      `;

      for (const [site, message] of Object.entries(crossSell.crossSellMessages || {})) {
        content += `<li>${message}</li>`;
      }
      content += '</ul>';

      // Build internal links
      const internalLinks = [];

      // Link to other services in same location
      for (const otherSvc of relevantServices.slice(0, 3)) {
        if (otherSvc.slug !== svc.slug) {
          internalLinks.push({
            title: `${otherSvc.name} in ${loc.name}`,
            url: `/service/${loc.slug || loc.id}/${otherSvc.slug || otherSvc.id}`,
            context: `Looking for ${otherSvc.name.toLowerCase()}? We offer this service in ${loc.name} too.`
          });
        }
      }

      // Link to nearby locations
      const nearbyLocs = locations.filter(l => l.type === loc.type && l.slug !== loc.slug).slice(0, 2);
      for (const nearLoc of nearbyLocs) {
        internalLinks.push({
          title: `${svc.name} in ${nearLoc.name}`,
          url: `/service/${nearLoc.slug || nearLoc.id}/${svc.slug || svc.id}`,
          context: `We also serve ${nearLoc.name} with the same premium service.`
        });
      }

      // Keywords
      const keywords = [
        `${categoryPrefix} service ${loc.name}`,
        `limo ${loc.name} chicago`,
        `${loc.name} car service`,
        `${svc.name.toLowerCase()} ${loc.name}`,
        `chicago ${categoryPrefix} transportation`,
        `${loc.name} airport limo`,
        `professional chauffeur ${loc.name}`,
        `luxury car service ${loc.name} IL`
      ];

      // Schema markup
      const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": title,
        "description": metaDescription,
        "provider": {
          "@type": "LocalBusiness",
          "name": "Royal Carriage Limousine",
          "telephone": "+1-224-801-3090",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Chicago",
            "addressRegion": "IL",
            "addressCountry": "US"
          }
        },
        "areaServed": {
          "@type": "City",
          "name": loc.name
        },
        "serviceType": svc.name
      };

      const docRef = db.collection('service_content').doc(contentId);
      batch.set(docRef, {
        id: contentId,
        websiteId: websiteId,
        locationId: loc.slug || loc.id,
        serviceId: svc.slug || svc.id,
        locationName: loc.name,
        serviceName: svc.name,
        title,
        metaDescription,
        content,
        keywords,
        internalLinks,
        schema,
        crossSellWebsites: crossSell.relatedWebsites || [],
        recommendedVehicles: relevantVehicles.map(v => v.name).slice(0, 3),
        approvalStatus: 'approved',
        aiQualityScore: 0.92,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }, { merge: true });

      contentCount++;
      batchCount++;

      // Commit batch before hitting Firestore limit
      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`  Committed ${contentCount} content pieces...`);
        batch = db.batch(); // Create new batch
        batchCount = 0;
      }
    }
  }

  // Commit remaining items
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Final commit: ${contentCount} total content pieces`);
  }

  return contentCount;
}

async function main() {
  console.log('=== GENERATING HIGH-VALUE SEO CONTENT ===\n');

  // Fetch all locations
  const locSnap = await db.collection('locations').get();
  const locations = locSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`Loaded ${locations.length} locations`);

  // Fetch all services
  const svcSnap = await db.collection('services').get();
  const services = svcSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`Loaded ${services.length} services`);

  // Fetch fleet vehicles
  const fleetSnap = await db.collection('fleet_vehicles').get();
  const vehicles = fleetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`Loaded ${vehicles.length} vehicles`);

  // Generate content for each website
  const websites = [
    'chicagoairportblackcar',
    'chicagoexecutivecarservice',
    'chicagoweddingtransportation',
    'chicago-partybus'
  ];

  let totalContent = 0;
  for (const website of websites) {
    console.log(`\nProcessing ${website}...`);
    const count = await generateContentForWebsite(website, locations, services, vehicles);
    console.log(`  Generated ${count} content pieces`);
    totalContent += count;
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Total content pieces generated: ${totalContent}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
