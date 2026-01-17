/**
 * Enterprise Phase 1: Expand Services Database
 * Adds 80 services (20 per website x 4 websites)
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}

const db = admin.firestore();

// Airport Website Services (chicagoairportblackcar)
const AIRPORT_SERVICES = [
  {
    id: "airport-ohare",
    name: "O'Hare Airport Transfers",
    category: "airport-transfer",
    description:
      "Professional black car service to and from Chicago O'Hare International Airport (ORD). Flight tracking, meet and greet, and door-to-door service.",
    keywords: [
      "ohare limo",
      "ohare car service",
      "ohare airport transportation",
      "ord airport limo",
    ],
  },
  {
    id: "airport-midway",
    name: "Midway Airport Transfers",
    category: "airport-transfer",
    description:
      "Reliable limousine service to Chicago Midway International Airport (MDW). Express routes and competitive pricing.",
    keywords: [
      "midway limo",
      "midway car service",
      "mdw airport transportation",
    ],
  },
  {
    id: "airport-exec",
    name: "Chicago Executive Airport Transfers",
    category: "airport-transfer",
    description:
      "VIP transportation for private jet passengers at Chicago Executive Airport. Premium service for discerning travelers.",
    keywords: [
      "executive airport limo",
      "private jet car service",
      "chicago exec airport",
    ],
  },
  {
    id: "airport-suburban",
    name: "Suburban Airport Pickups",
    category: "airport-transfer",
    description:
      "Airport transportation serving Gary, Milwaukee, and South Bend regional airports. Convenient connections for suburban travelers.",
    keywords: ["suburban airport shuttle", "regional airport limo"],
  },
  {
    id: "airport-downtown-hotel",
    name: "Airport to Downtown Hotel",
    category: "airport-hotel",
    description:
      "Direct transfers from airports to Loop, River North, and Michigan Avenue hotels. Business and leisure travelers welcome.",
    keywords: ["airport hotel transfer", "downtown chicago hotel limo"],
  },
  {
    id: "airport-suburban-hotel",
    name: "Airport to Suburban Hotel",
    category: "airport-hotel",
    description:
      "Airport transfers to suburban hotels in Naperville, Schaumburg, and Oak Brook areas.",
    keywords: ["suburban hotel airport shuttle", "naperville airport transfer"],
  },
  {
    id: "airport-business-meeting",
    name: "Airport to Business Meeting",
    category: "airport-business",
    description:
      "Direct airport to office transportation with WiFi and charging for productive travel. Perfect for business executives.",
    keywords: ["business airport transfer", "corporate airport car"],
  },
  {
    id: "airport-event-conference",
    name: "Airport to Event/Conference",
    category: "airport-business",
    description:
      "Transportation to McCormick Place, Navy Pier, and convention venues from all Chicago airports.",
    keywords: ["conference airport shuttle", "mccormick place limo"],
  },
  {
    id: "airport-dining",
    name: "Airport to Dining Experience",
    category: "airport-special",
    description:
      "Arrive in style at Chicago's finest restaurants directly from the airport.",
    keywords: ["airport dinner limo", "fine dining car service"],
  },
  {
    id: "airport-corporate-group",
    name: "Corporate Group Airport Transfers",
    category: "airport-group",
    description:
      "Coordinated airport transportation for corporate teams and large groups. Multiple vehicles available.",
    keywords: ["corporate group airport", "team airport shuttle"],
  },
  {
    id: "airport-wedding-shuttle",
    name: "Wedding Group Airport Shuttle",
    category: "airport-group",
    description:
      "Guest transportation from airports to wedding venues and hotels. Destination wedding specialists.",
    keywords: ["wedding guest airport shuttle", "destination wedding limo"],
  },
  {
    id: "airport-family-group",
    name: "Family/Large Group Pickups",
    category: "airport-group",
    description:
      "Family reunion and large group airport coordination. Multiple vehicle options for any group size.",
    keywords: ["family airport pickup", "large group limo"],
  },
  {
    id: "airport-meet-greet",
    name: "Meet & Greet + Luggage Assistance",
    category: "airport-vip",
    description:
      "VIP meet and greet service with baggage claim assistance and curbside pickup.",
    keywords: ["airport meet greet", "vip airport service"],
  },
  {
    id: "airport-parking",
    name: "Airport to Parking Facility",
    category: "airport-special",
    description:
      "Park and fly service connections to airport parking facilities.",
    keywords: ["airport parking shuttle", "park and fly chicago"],
  },
  {
    id: "airport-connecting-flight",
    name: "Connecting Flight Coordination",
    category: "airport-special",
    description:
      "Airport-to-airport transfers for connecting flights. Timing optimization included.",
    keywords: ["airport connection transfer", "layover transportation"],
  },
  {
    id: "airport-city-tour",
    name: "Airport + City Tour Combination",
    category: "airport-tour",
    description:
      "Arrival pickup combined with Chicago sightseeing tour before hotel drop-off.",
    keywords: ["airport city tour", "chicago arrival tour"],
  },
  {
    id: "airport-all-day",
    name: "All-Day Airport Service Package",
    category: "airport-package",
    description:
      "Comprehensive all-day service: arrival, activities, and return to airport.",
    keywords: ["all day airport limo", "airport day package"],
  },
  {
    id: "airport-vip-program",
    name: "Frequent Flyer VIP Program",
    category: "airport-vip",
    description:
      "Priority booking and upgrades for repeat business travelers. Loyalty rewards included.",
    keywords: ["vip airport program", "frequent flyer limo"],
  },
  {
    id: "airport-standby",
    name: "Airport Standby/Waiting Service",
    category: "airport-special",
    description:
      "Flexible hourly service with airport waiting for uncertain flight times.",
    keywords: ["airport waiting service", "standby limo service"],
  },
  {
    id: "airport-international",
    name: "International Arrivals Service",
    category: "airport-vip",
    description:
      "Specialized service for international travelers with customs navigation support.",
    keywords: ["international arrival limo", "customs assistance car"],
  },
];

// Corporate Website Services (chicagoexecutivecarservice)
const CORPORATE_SERVICES = [
  {
    id: "corporate-executive-airport",
    name: "Executive Airport Transfer",
    category: "corporate-travel",
    description:
      "Premium airport transportation designed for business executives. WiFi, charging, and privacy.",
    keywords: ["executive airport car", "business airport limo"],
  },
  {
    id: "corporate-daily-commute",
    name: "Daily Commute Service",
    category: "corporate-commute",
    description:
      "Subscription-based daily commute service for executives. Consistent, reliable, professional.",
    keywords: ["executive commute service", "daily car service"],
  },
  {
    id: "corporate-meeting",
    name: "Corporate Meeting Transportation",
    category: "corporate-business",
    description:
      "Professional transportation to downtown offices and corporate meetings.",
    keywords: ["corporate meeting car", "business meeting limo"],
  },
  {
    id: "corporate-board",
    name: "Board Member Travel",
    category: "corporate-vip",
    description:
      "Premium VIP service for board members and C-suite executives.",
    keywords: ["board member transportation", "executive vip car"],
  },
  {
    id: "corporate-client",
    name: "Client Entertainment",
    category: "corporate-entertainment",
    description:
      "Impress clients with luxury transportation to high-end dining and venues.",
    keywords: ["client entertainment limo", "business dining car"],
  },
  {
    id: "corporate-sales-team",
    name: "Sales Team Travel",
    category: "corporate-team",
    description:
      "Coordinated transportation for sales teams visiting multiple locations.",
    keywords: ["sales team transportation", "multiple location car"],
  },
  {
    id: "corporate-conference",
    name: "Conference & Convention Transport",
    category: "corporate-event",
    description:
      "Group transportation for McCormick Place, hotels, and convention centers.",
    keywords: ["conference transportation", "convention limo"],
  },
  {
    id: "corporate-hourly",
    name: "Executive Suite Hourly Rental",
    category: "corporate-flexible",
    description:
      "Flexible hourly rental for executives with changing schedules.",
    keywords: ["hourly executive car", "as directed service"],
  },
  {
    id: "corporate-business-trip",
    name: "Business Trip Coordination",
    category: "corporate-travel",
    description:
      "Multi-leg business journey coordination with seamless transitions.",
    keywords: ["business trip limo", "multi-destination car"],
  },
  {
    id: "corporate-ma",
    name: "Mergers & Acquisitions Team",
    category: "corporate-vip",
    description: "Confidential, premium transportation for M&A deal teams.",
    keywords: ["m&a transportation", "confidential car service"],
  },
  {
    id: "corporate-tradeshow",
    name: "Trade Show & Expo Shuttle",
    category: "corporate-event",
    description: "Group shuttle service for trade show and expo attendance.",
    keywords: ["trade show shuttle", "expo transportation"],
  },
  {
    id: "corporate-parking",
    name: "Executive Parking & Service",
    category: "corporate-commute",
    description:
      "Park and ride service for executives with secure parking options.",
    keywords: ["executive parking service", "park and ride limo"],
  },
  {
    id: "corporate-client-meeting",
    name: "Client Meeting Prep Transport",
    category: "corporate-business",
    description:
      "Professional image transportation for important client meetings.",
    keywords: ["client meeting car", "professional image limo"],
  },
  {
    id: "corporate-fortune500",
    name: "Fortune 500 Visiting Executive",
    category: "corporate-vip",
    description:
      "Premium VIP service for visiting Fortune 500 executives and dignitaries.",
    keywords: ["fortune 500 car service", "visiting executive limo"],
  },
  {
    id: "corporate-event-gala",
    name: "Corporate Event Transportation",
    category: "corporate-event",
    description:
      "Transportation for corporate galas, functions, and celebrations.",
    keywords: ["corporate gala limo", "business event car"],
  },
  {
    id: "corporate-investor",
    name: "Investor Relations Travel",
    category: "corporate-vip",
    description: "High-net-worth investor transportation with premium service.",
    keywords: ["investor relations car", "hnw transportation"],
  },
  {
    id: "corporate-law-firm",
    name: "Law Firm Attorney Transport",
    category: "corporate-professional",
    description:
      "Professional transportation for attorneys and legal professionals.",
    keywords: ["attorney car service", "law firm limo"],
  },
  {
    id: "corporate-medical",
    name: "Medical Professional Transport",
    category: "corporate-professional",
    description:
      "Reliable transportation for doctors, specialists, and medical professionals.",
    keywords: ["doctor car service", "medical professional limo"],
  },
  {
    id: "corporate-tech",
    name: "Tech Executive Travel",
    category: "corporate-professional",
    description: "Startup and growth company executive transportation.",
    keywords: ["tech executive car", "startup ceo limo"],
  },
  {
    id: "corporate-international",
    name: "International Business Delegation",
    category: "corporate-group",
    description: "Group transportation for international business delegations.",
    keywords: ["international delegation car", "business group limo"],
  },
];

// Wedding Website Services (chicagoweddingtransportation)
const WEDDING_SERVICES = [
  {
    id: "wedding-bride",
    name: "Bride Transportation",
    category: "wedding-bridal",
    description:
      "Full-service wedding day transportation for the bride. Champagne, red carpet, and VIP treatment.",
    keywords: ["bride limo", "wedding day car", "bridal transportation"],
  },
  {
    id: "wedding-groom",
    name: "Groom & Groomsmen Shuttle",
    category: "wedding-party",
    description:
      "Pre-ceremony and post-ceremony transportation for the groom and groomsmen.",
    keywords: ["groom limo", "groomsmen transportation"],
  },
  {
    id: "wedding-bridal-party",
    name: "Bridal Party Travel",
    category: "wedding-party",
    description:
      "Coordinated transportation for bridesmaids and immediate family.",
    keywords: ["bridal party limo", "bridesmaid transportation"],
  },
  {
    id: "wedding-guest-transport",
    name: "Wedding Guest Transportation",
    category: "wedding-guest",
    description:
      "Airport to venue shuttle service for out-of-town wedding guests.",
    keywords: ["wedding guest shuttle", "guest airport transfer"],
  },
  {
    id: "wedding-rehearsal",
    name: "Rehearsal Dinner Transport",
    category: "wedding-event",
    description: "Transportation for the rehearsal dinner the evening before.",
    keywords: ["rehearsal dinner limo", "pre-wedding transportation"],
  },
  {
    id: "wedding-getting-ready",
    name: "Getting Ready Location Transport",
    category: "wedding-prep",
    description:
      "Hair and makeup to venue transportation for the bridal party.",
    keywords: ["getting ready limo", "wedding prep transportation"],
  },
  {
    id: "wedding-photo-location",
    name: "Pre-Wedding Photo Location",
    category: "wedding-photo",
    description:
      "Transportation to scenic Chicago photo locations before the ceremony.",
    keywords: ["wedding photo limo", "scenic photo transportation"],
  },
  {
    id: "wedding-ceremony-shuttle",
    name: "Ceremony Location Shuttle",
    category: "wedding-ceremony",
    description: "Shuttle service between multiple venue buildings.",
    keywords: ["ceremony shuttle", "venue transportation"],
  },
  {
    id: "wedding-reception-entrance",
    name: "Reception Entrance Coordination",
    category: "wedding-ceremony",
    description: "Grand entrance transportation from ceremony to reception.",
    keywords: ["reception entrance limo", "grand entrance car"],
  },
  {
    id: "wedding-celebration-drive",
    name: "Post-Ceremony Celebration Drive",
    category: "wedding-photo",
    description: "Photo opportunity drive and celebration after the ceremony.",
    keywords: ["wedding celebration drive", "post-ceremony limo"],
  },
  {
    id: "wedding-multi-venue",
    name: "Multi-Venue Wedding Transport",
    category: "wedding-logistics",
    description:
      "Seamless transportation between ceremony and reception venues.",
    keywords: ["multi-venue wedding", "venue-to-venue limo"],
  },
  {
    id: "wedding-honeymoon-airport",
    name: "Honeymoon Airport Transfer",
    category: "wedding-special",
    description: "Special honeymoon departure service to the airport.",
    keywords: ["honeymoon limo", "airport honeymoon transfer"],
  },
  {
    id: "wedding-coordinator",
    name: "Wedding Day Coordination Transport",
    category: "wedding-logistics",
    description:
      "Planner and vendor transportation throughout the wedding day.",
    keywords: ["wedding planner transportation", "vendor shuttle"],
  },
  {
    id: "wedding-cocktail-hour",
    name: "Cocktail Hour Escort",
    category: "wedding-event",
    description: "Guest movement coordination during cocktail hour.",
    keywords: ["cocktail hour shuttle", "guest movement limo"],
  },
  {
    id: "wedding-farewell",
    name: "Late-Night Farewell Service",
    category: "wedding-special",
    description: "End-of-night safe transportation for guests and couple.",
    keywords: ["wedding farewell limo", "end of night transportation"],
  },
  {
    id: "wedding-out-of-town",
    name: "Out-of-Town Guest Hotel Shuttle",
    category: "wedding-guest",
    description: "Day-before and day-after hotel shuttle for visiting guests.",
    keywords: ["out of town guest shuttle", "hotel transportation"],
  },
  {
    id: "wedding-weekend",
    name: "Wedding Weekend Itinerary Transport",
    category: "wedding-package",
    description: "Multi-day event transportation for full wedding weekends.",
    keywords: ["wedding weekend limo", "multi-day wedding"],
  },
  {
    id: "wedding-overnight",
    name: "Wedding Party Overnight Stay",
    category: "wedding-logistics",
    description:
      "Day-before lodging trip transportation for the wedding party.",
    keywords: ["overnight wedding limo", "pre-wedding stay"],
  },
  {
    id: "wedding-officiant",
    name: "Ceremony Officiant Transport",
    category: "wedding-logistics",
    description: "Professional transportation for clergy and officiants.",
    keywords: ["officiant transportation", "clergy limo"],
  },
  {
    id: "wedding-anniversary",
    name: "Special Anniversary Celebration",
    category: "wedding-special",
    description: "Vow renewal and milestone anniversary celebrations.",
    keywords: ["anniversary limo", "vow renewal transportation"],
  },
];

// Party Bus Website Services (chicago-partybus)
const PARTYBUS_SERVICES = [
  {
    id: "partybus-bachelor",
    name: "Bachelor Party Chicago Tour",
    category: "partybus-celebration",
    description:
      "Full-night bachelor party experience with multi-stop routing through Chicago nightlife.",
    keywords: ["bachelor party bus", "bachelor party limo chicago"],
  },
  {
    id: "partybus-bachelorette",
    name: "Bachelorette Party Celebration",
    category: "partybus-celebration",
    description:
      "Multi-stop bachelorette party experience with premium amenities.",
    keywords: ["bachelorette party bus", "bachelorette limo chicago"],
  },
  {
    id: "partybus-birthday",
    name: "Birthday Party Bus Experience",
    category: "partybus-celebration",
    description: "All-age appropriate birthday celebration transportation.",
    keywords: ["birthday party bus", "birthday limo chicago"],
  },
  {
    id: "partybus-corporate",
    name: "Corporate Team Celebration",
    category: "partybus-corporate",
    description: "Team building outing and corporate bonding transportation.",
    keywords: ["corporate party bus", "team building limo"],
  },
  {
    id: "partybus-graduation",
    name: "Graduation Party Transport",
    category: "partybus-celebration",
    description:
      "High school and college graduation celebration transportation.",
    keywords: ["graduation party bus", "graduation limo"],
  },
  {
    id: "partybus-prom",
    name: "Prom Night Party Bus",
    category: "partybus-teen",
    description: "Safe, luxury prom experience for high school students.",
    keywords: ["prom party bus", "prom limo chicago"],
  },
  {
    id: "partybus-nye",
    name: "New Year's Eve Party Bus",
    category: "partybus-holiday",
    description:
      "Countdown celebration with multi-stop New Year's Eve routing.",
    keywords: ["nye party bus", "new years eve limo"],
  },
  {
    id: "partybus-halloween",
    name: "Halloween Party Bus",
    category: "partybus-holiday",
    description:
      "Themed, costume-friendly Halloween celebration transportation.",
    keywords: ["halloween party bus", "costume party limo"],
  },
  {
    id: "partybus-summer",
    name: "Summer Kickoff Party Bus",
    category: "partybus-seasonal",
    description:
      "Festival and outdoor event transportation for summer celebrations.",
    keywords: ["summer party bus", "festival transportation"],
  },
  {
    id: "partybus-destination",
    name: "Destination Bachelorette Weekend",
    category: "partybus-weekend",
    description: "Multi-day rental for destination bachelorette celebrations.",
    keywords: ["destination party bus", "weekend rental limo"],
  },
  {
    id: "partybus-brewery",
    name: "Brewery Tour Party Bus",
    category: "partybus-tour",
    description: "Chicago brewery tour with designated driver service.",
    keywords: ["brewery tour bus", "craft beer tour limo"],
  },
  {
    id: "partybus-wedding-rehearsal",
    name: "Wedding Rehearsal Party",
    category: "partybus-wedding",
    description: "Pre-wedding celebration transportation for wedding parties.",
    keywords: ["rehearsal party bus", "wedding party limo"],
  },
  {
    id: "partybus-sports",
    name: "Sports Event Party Shuttle",
    category: "partybus-sports",
    description:
      "Game day transportation for Cubs, Bears, Bulls, and Blackhawks games.",
    keywords: ["sports event bus", "game day limo chicago"],
  },
  {
    id: "partybus-concert",
    name: "Concert Experience Transport",
    category: "partybus-entertainment",
    description: "Premium venue transportation with parking convenience.",
    keywords: ["concert party bus", "concert limo chicago"],
  },
  {
    id: "partybus-casino",
    name: "Casino Night Party Bus",
    category: "partybus-entertainment",
    description: "Gaming and dining combination transportation.",
    keywords: ["casino party bus", "casino trip limo"],
  },
  {
    id: "partybus-nightclub",
    name: "Nightclub Crawl Transportation",
    category: "partybus-nightlife",
    description: "Multi-venue nightclub experience with safe transportation.",
    keywords: ["nightclub crawl bus", "club hopping limo"],
  },
  {
    id: "partybus-dinner",
    name: "Sunset Dinner Party Bus",
    category: "partybus-dining",
    description: "Mobile dining experience with scenic routes.",
    keywords: ["dinner party bus", "sunset cruise limo"],
  },
  {
    id: "partybus-casino-resort",
    name: "Casino Resort Weekend Trip",
    category: "partybus-weekend",
    description: "Multi-city travel to casino resort destinations.",
    keywords: ["casino weekend bus", "resort trip limo"],
  },
  {
    id: "partybus-vip",
    name: "VIP Nightlife Experience",
    category: "partybus-vip",
    description: "Premium venue access with VIP treatment throughout.",
    keywords: ["vip nightlife bus", "vip party limo"],
  },
  {
    id: "partybus-custom",
    name: "Custom Group Celebration",
    category: "partybus-custom",
    description: "Flexible, customizable celebration for any occasion.",
    keywords: ["custom party bus", "group celebration limo"],
  },
];

async function expandServices() {
  console.log("=== ENTERPRISE PHASE 1: EXPANDING SERVICES ===\n");

  const allServices = [
    ...AIRPORT_SERVICES.map((s) => ({
      ...s,
      website: "chicagoairportblackcar",
    })),
    ...CORPORATE_SERVICES.map((s) => ({
      ...s,
      website: "chicagoexecutivecarservice",
    })),
    ...WEDDING_SERVICES.map((s) => ({
      ...s,
      website: "chicagoweddingtransportation",
    })),
    ...PARTYBUS_SERVICES.map((s) => ({ ...s, website: "chicago-partybus" })),
  ];

  console.log(`Total services to add: ${allServices.length}\n`);
  console.log(`Airport: ${AIRPORT_SERVICES.length}`);
  console.log(`Corporate: ${CORPORATE_SERVICES.length}`);
  console.log(`Wedding: ${WEDDING_SERVICES.length}`);
  console.log(`Party Bus: ${PARTYBUS_SERVICES.length}`);
  console.log();

  let created = 0;
  let errors = 0;

  const batch = db.batch();

  for (const service of allServices) {
    try {
      const serviceDoc = {
        id: service.id,
        name: service.name,
        website: service.website,
        category: service.category,
        description: service.description,
        longDescription: `${service.description} Our professional chauffeurs provide luxury ${service.name.toLowerCase()} throughout the Chicago metropolitan area. Available 24/7 with a fleet of premium vehicles including sedans, SUVs, stretch limousines, and party buses.`,
        keywords: service.keywords,
        seoKeywords: [
          ...service.keywords,
          `chicago ${service.name.toLowerCase()}`,
          `${service.name.toLowerCase()} service`,
        ],
        pricing: {
          baseRate: service.category.includes("vip")
            ? 150
            : service.category.includes("party")
              ? 200
              : 75,
          hourlyRate: service.category.includes("party") ? 250 : 95,
          minimumHours: service.category.includes("party") ? 4 : 2,
        },
        applicableVehicles: getApplicableVehicles(service.category),
        faqs: generateServiceFAQs(service),
        relatedServices: [],
        status: "active",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const docRef = db.collection("services").doc(service.id);
      batch.set(docRef, serviceDoc, { merge: true });
      created++;
    } catch (err) {
      console.error(`Error processing ${service.name}:`, err.message);
      errors++;
    }
  }

  await batch.commit();

  console.log("\n=== SERVICE EXPANSION COMPLETE ===");
  console.log(`Created/Updated: ${created}`);
  console.log(`Errors: ${errors}`);

  // Verify count
  const countSnapshot = await db.collection("services").count().get();
  console.log(`\nVerified service count: ${countSnapshot.data().count}`);

  // Count by website
  const websites = [
    "chicagoairportblackcar",
    "chicagoexecutivecarservice",
    "chicagoweddingtransportation",
    "chicago-partybus",
  ];
  for (const website of websites) {
    const wsCount = await db
      .collection("services")
      .where("website", "==", website)
      .count()
      .get();
    console.log(`  ${website}: ${wsCount.data().count} services`);
  }

  return { created, errors };
}

function getApplicableVehicles(category) {
  if (category.includes("party") || category.includes("group")) {
    return [
      "party-bus-36",
      "party-bus-24",
      "sprinter-14",
      "sprinter-exec-12",
      "escalade-suv",
      "coach-50",
    ];
  }
  if (
    category.includes("corporate") ||
    category.includes("vip") ||
    category.includes("executive")
  ) {
    return [
      "lincoln-continental",
      "mercedes-s-class",
      "bmw-7-series",
      "cadillac-xts",
      "escalade-suv",
      "navigator-suv",
    ];
  }
  if (category.includes("wedding")) {
    return [
      "lincoln-stretch",
      "escalade-suv",
      "navigator-suv",
      "sprinter-14",
      "party-bus-24",
      "mercedes-s-class",
    ];
  }
  // Default for airport and general services
  return [
    "lincoln-continental",
    "cadillac-xts",
    "escalade-suv",
    "suburban-suv",
    "sprinter-14",
  ];
}

function generateServiceFAQs(service) {
  return [
    {
      question: `How do I book ${service.name} in Chicago?`,
      answer: `You can book ${service.name} online through our website, by calling our 24/7 reservations line, or through our mobile app. We recommend booking at least 24 hours in advance for standard service, or as early as possible for special events.`,
    },
    {
      question: `What vehicles are available for ${service.name}?`,
      answer: `For ${service.name}, we offer a variety of luxury vehicles including sedans, SUVs, stretch limousines, sprinter vans, and party buses depending on your group size and preferences.`,
    },
    {
      question: `What is the cancellation policy for ${service.name}?`,
      answer: `Cancellations made 24 hours or more before your scheduled pickup receive a full refund. Cancellations within 24 hours may be subject to a cancellation fee. Please contact us directly for details.`,
    },
  ];
}

async function main() {
  const result = await expandServices();
  console.log("\nResult:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
