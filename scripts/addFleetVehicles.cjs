/**
 * Enterprise Phase 1: Add Fleet Vehicles Database
 * Adds 14+ fleet vehicles with full metadata
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}

const db = admin.firestore();

// Fleet Vehicles based on market research
const FLEET_VEHICLES = [
  // CATEGORY 1: LUXURY SEDANS (1-3 passengers)
  {
    id: "lincoln-continental",
    name: "Lincoln Continental",
    category: "luxury-sedan",
    capacity: 3,
    features: [
      "leather-interior",
      "wifi",
      "charging-ports",
      "climate-control",
      "privacy-glass",
    ],
    baseHourlyRate: 75,
    baseAirportRate: 65,
    baseDailyRate: 450,
    description:
      "The Lincoln Continental offers sophisticated elegance with premium leather interior, advanced technology, and a smooth, quiet ride perfect for executive transportation.",
    longDescription:
      "Experience the pinnacle of American luxury with our Lincoln Continental sedan. Featuring handcrafted leather seating, a state-of-the-art infotainment system, complimentary WiFi, and USB charging ports. The Continental's signature quiet interior and smooth suspension make it ideal for airport transfers and business meetings.",
    seoKeywords: [
      "Lincoln Continental rental Chicago",
      "luxury sedan service",
      "executive car service",
    ],
    imageUrl: "/images/fleet/lincoln-continental.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "airport-transfer",
      "corporate",
      "executive",
      "business-meeting",
    ],
    specifications: {
      engine: "3.0L Twin-Turbo V6",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "3 large bags",
    },
  },
  {
    id: "cadillac-xts",
    name: "Cadillac XTS/CTS",
    category: "luxury-sedan",
    capacity: 3,
    features: [
      "leather-interior",
      "bose-audio",
      "charging-ports",
      "rear-climate",
      "sunroof",
    ],
    baseHourlyRate: 70,
    baseAirportRate: 60,
    baseDailyRate: 420,
    description:
      "The Cadillac XTS combines bold American luxury with cutting-edge technology for a commanding presence on Chicago streets.",
    longDescription:
      "Our Cadillac XTS delivers an unmistakable statement of success. Featuring premium leather appointments, Bose surround sound, and Cadillac's signature CUE infotainment system. Perfect for professionals who demand both comfort and style.",
    seoKeywords: [
      "Cadillac XTS rental",
      "Cadillac limo service Chicago",
      "luxury Cadillac car service",
    ],
    imageUrl: "/images/fleet/cadillac-xts.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "airport-transfer",
      "corporate",
      "professional-travel",
    ],
    specifications: {
      engine: "3.6L V6",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "3 large bags",
    },
  },
  {
    id: "mercedes-s-class",
    name: "Mercedes-Benz S-Class",
    category: "luxury-sedan",
    capacity: 3,
    features: [
      "premium-leather",
      "burmester-audio",
      "massage-seats",
      "ambient-lighting",
      "wifi",
      "champagne-cooler",
    ],
    baseHourlyRate: 125,
    baseAirportRate: 100,
    baseDailyRate: 750,
    description:
      "The Mercedes-Benz S-Class represents the ultimate in automotive luxury, offering unparalleled comfort and prestige.",
    longDescription:
      "Indulge in the world-renowned luxury of our Mercedes-Benz S-Class. This flagship sedan features executive rear seating with massage function, Burmester 3D surround sound, ambient lighting, and a champagne cooler. The S-Class is the preferred choice for VIPs, celebrities, and discerning executives.",
    seoKeywords: [
      "Mercedes S-Class rental Chicago",
      "S-Class limousine service",
      "luxury Mercedes car service",
    ],
    imageUrl: "/images/fleet/mercedes-s-class.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "vip-transfer",
      "executive",
      "wedding",
      "special-events",
    ],
    specifications: {
      engine: "4.0L Twin-Turbo V8",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "3 large bags",
    },
  },
  {
    id: "bmw-7-series",
    name: "BMW 7 Series",
    category: "luxury-sedan",
    capacity: 3,
    features: [
      "premium-leather",
      "harman-kardon-audio",
      "gesture-control",
      "executive-lounge",
      "wifi",
    ],
    baseHourlyRate: 115,
    baseAirportRate: 95,
    baseDailyRate: 700,
    description:
      "The BMW 7 Series combines athletic performance with supreme luxury for the ultimate driving experience.",
    longDescription:
      "Experience the ultimate driving machine in the back seat. Our BMW 7 Series features the executive lounge package with extended legroom, premium Harman Kardon audio, and BMW's innovative gesture control system. Perfect for executives who appreciate both performance and comfort.",
    seoKeywords: [
      "BMW 7 Series rental",
      "BMW limousine Chicago",
      "luxury BMW car service",
    ],
    imageUrl: "/images/fleet/bmw-7-series.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: ["airport-transfer", "corporate", "executive", "vip"],
    specifications: {
      engine: "4.4L Twin-Turbo V8",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "3 large bags",
    },
  },

  // CATEGORY 2: LUXURY SUVs (4-6 passengers)
  {
    id: "escalade-suv",
    name: "Cadillac Escalade ESV",
    category: "luxury-suv",
    capacity: 6,
    features: [
      "captain-chairs",
      "entertainment-system",
      "bar",
      "sunroof",
      "premium-leather",
      "wifi",
    ],
    baseHourlyRate: 120,
    baseAirportRate: 85,
    baseDailyRate: 650,
    description:
      "The Cadillac Escalade ESV offers commanding presence and spacious luxury for groups up to 6 passengers.",
    longDescription:
      "Our Cadillac Escalade ESV is the pinnacle of American SUV luxury. Featuring captain's chairs, rear entertainment system, mini bar, and expansive cargo space. The Escalade makes a powerful impression for weddings, corporate groups, and family trips.",
    seoKeywords: [
      "Cadillac Escalade rental Chicago",
      "luxury SUV service",
      "Escalade limo Chicago",
    ],
    imageUrl: "/images/fleet/escalade-esv.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "airport-group",
      "wedding",
      "corporate-group",
      "family-travel",
      "vip",
    ],
    specifications: {
      engine: "6.2L V8",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "6 large bags",
    },
  },
  {
    id: "navigator-suv",
    name: "Lincoln Navigator",
    category: "luxury-suv",
    capacity: 6,
    features: [
      "premium-leather",
      "revel-audio",
      "panoramic-sunroof",
      "power-running-boards",
      "wifi",
    ],
    baseHourlyRate: 115,
    baseAirportRate: 80,
    baseDailyRate: 620,
    description:
      "The Lincoln Navigator delivers exceptional comfort and refinement for up to 6 passengers.",
    longDescription:
      "Experience the perfect blend of power and elegance with our Lincoln Navigator. Featuring the acclaimed Revel audio system, panoramic Vista Roof, and signature Lincoln comfort. Ideal for executive groups and family events.",
    seoKeywords: [
      "Lincoln Navigator rental",
      "Navigator limousine service",
      "luxury Lincoln SUV Chicago",
    ],
    imageUrl: "/images/fleet/lincoln-navigator.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "airport-group",
      "wedding",
      "corporate",
      "family-travel",
    ],
    specifications: {
      engine: "3.5L Twin-Turbo V6",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "6 large bags",
    },
  },
  {
    id: "suburban-suv",
    name: "Chevrolet Suburban",
    category: "luxury-suv",
    capacity: 6,
    features: [
      "leather-interior",
      "rear-entertainment",
      "climate-zones",
      "wifi",
      "usb-charging",
    ],
    baseHourlyRate: 95,
    baseAirportRate: 70,
    baseDailyRate: 520,
    description:
      "The Chevrolet Suburban offers spacious reliability for group airport transfers and family travel.",
    longDescription:
      "Our Chevrolet Suburban provides exceptional space and comfort for larger groups. With three climate zones, rear entertainment, and ample luggage capacity, it's perfect for family airport pickups and group transportation.",
    seoKeywords: [
      "Suburban rental Chicago",
      "SUV car service",
      "group airport transportation",
    ],
    imageUrl: "/images/fleet/suburban.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: ["airport-group", "family-travel", "corporate-group"],
    specifications: {
      engine: "5.3L V8",
      transmission: "Automatic",
      fuelType: "Regular Gasoline",
      luggageCapacity: "8 large bags",
    },
  },
  {
    id: "yukon-denali",
    name: "GMC Yukon Denali",
    category: "luxury-suv",
    capacity: 6,
    features: [
      "premium-leather",
      "magnetic-ride",
      "heads-up-display",
      "bose-audio",
      "wifi",
    ],
    baseHourlyRate: 110,
    baseAirportRate: 78,
    baseDailyRate: 580,
    description:
      "The GMC Yukon Denali combines rugged capability with premium refinement.",
    longDescription:
      "The GMC Yukon Denali offers the perfect combination of capability and luxury. Featuring Magnetic Ride Control, premium Bose audio, and Denali-exclusive appointments. Ideal for corporate groups and wedding parties.",
    seoKeywords: [
      "Yukon Denali rental",
      "GMC limousine service",
      "Denali SUV Chicago",
    ],
    imageUrl: "/images/fleet/yukon-denali.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: ["corporate-group", "wedding", "airport-group"],
    specifications: {
      engine: "6.2L V8",
      transmission: "Automatic",
      fuelType: "Premium Gasoline",
      luggageCapacity: "6 large bags",
    },
  },

  // CATEGORY 3: STRETCH LIMOUSINES (8-10 passengers)
  {
    id: "lincoln-stretch",
    name: "Lincoln Stretch Limousine",
    category: "stretch-limo",
    capacity: 10,
    features: [
      "bar",
      "fiber-optic-lighting",
      "entertainment-system",
      "privacy-partition",
      "champagne-service",
      "premium-sound",
    ],
    baseHourlyRate: 175,
    baseAirportRate: 150,
    baseDailyRate: 950,
    description:
      "The classic Lincoln Stretch Limousine offers timeless elegance for weddings, proms, and special celebrations.",
    longDescription:
      "Our Lincoln Stretch Limousine is the epitome of classic celebration. Featuring a full bar, fiber optic lighting, premium entertainment system, and champagne service. The privacy partition ensures an intimate experience for up to 10 passengers. Perfect for weddings, proms, and milestone celebrations.",
    seoKeywords: [
      "stretch limo Chicago",
      "Lincoln limousine rental",
      "wedding limo Chicago",
    ],
    imageUrl: "/images/fleet/lincoln-stretch.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "wedding",
      "prom",
      "special-events",
      "anniversary",
      "celebration",
    ],
    specifications: {
      length: "120 inches stretch",
      amenities: "Full bar, fiber optics, flat screens",
      fuelType: "Premium Gasoline",
      luggageCapacity: "Trunk storage",
    },
  },

  // CATEGORY 4: EXECUTIVE VANS (10-16 passengers)
  {
    id: "sprinter-14",
    name: "Mercedes Sprinter Van (14 seats)",
    category: "executive-van",
    capacity: 14,
    features: [
      "high-roof",
      "comfortable-seating",
      "climate-control",
      "luggage-space",
      "usb-charging",
      "wifi",
    ],
    baseHourlyRate: 150,
    baseAirportRate: 120,
    baseDailyRate: 800,
    description:
      "The Mercedes Sprinter Van offers comfortable group transportation for up to 14 passengers.",
    longDescription:
      "Our Mercedes Sprinter Van is perfect for group airport transfers, corporate shuttles, and tour groups. Featuring high ceilings for easy movement, comfortable seating, climate control, and ample luggage space. WiFi and USB charging keep everyone connected.",
    seoKeywords: [
      "Sprinter van rental Chicago",
      "Mercedes van service",
      "group transportation Chicago",
    ],
    imageUrl: "/images/fleet/sprinter-14.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "airport-group",
      "corporate-shuttle",
      "tour-group",
      "wedding-guest",
    ],
    specifications: {
      engine: "3.0L Turbo Diesel",
      transmission: "Automatic",
      fuelType: "Diesel",
      luggageCapacity: "14 carry-on bags",
    },
  },
  {
    id: "sprinter-exec-12",
    name: "Luxury Sprinter (Executive 12 seats)",
    category: "executive-van",
    capacity: 12,
    features: [
      "premium-interior",
      "captain-chairs",
      "wifi",
      "power-outlets",
      "flat-screens",
      "mini-bar",
    ],
    baseHourlyRate: 185,
    baseAirportRate: 150,
    baseDailyRate: 950,
    description:
      "The Executive Sprinter offers premium group transportation with luxury amenities.",
    longDescription:
      "Our Executive Sprinter is the ultimate in group luxury. Featuring premium leather captain's chairs, dual flat-screen TVs, mini bar, and executive work tables. Ideal for corporate groups, VIP transportation, and luxury tours.",
    seoKeywords: [
      "executive Sprinter Chicago",
      "luxury van service",
      "VIP group transportation",
    ],
    imageUrl: "/images/fleet/sprinter-executive.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "corporate-executive",
      "vip-group",
      "wedding-party",
      "executive-tour",
    ],
    specifications: {
      engine: "3.0L Turbo Diesel",
      transmission: "Automatic",
      fuelType: "Diesel",
      luggageCapacity: "12 carry-on bags",
    },
  },

  // CATEGORY 5: PARTY BUSES (20-40 passengers)
  {
    id: "party-bus-36",
    name: "Full-Size Party Bus (36 seats)",
    category: "party-bus",
    capacity: 36,
    features: [
      "led-lighting",
      "dance-floor",
      "premium-sound",
      "bar",
      "restroom",
      "multiple-tvs",
      "stripper-poles",
    ],
    baseHourlyRate: 350,
    baseAirportRate: null,
    baseDailyRate: 1800,
    description:
      "The Full-Size Party Bus is the ultimate mobile celebration venue for up to 36 guests.",
    longDescription:
      "Our 36-passenger party bus is a nightclub on wheels. Featuring LED dance floor, premium sound system, multiple flat-screen TVs, full bar, private restroom, and wraparound seating. Perfect for bachelor/bachelorette parties, birthday celebrations, and group nightlife experiences.",
    seoKeywords: [
      "party bus Chicago",
      "party bus rental",
      "bachelor party bus Chicago",
    ],
    imageUrl: "/images/fleet/party-bus-36.jpg",
    availability: { weekday: true, weekend: true, available24_7: false },
    applicableServices: [
      "bachelor-party",
      "bachelorette-party",
      "birthday",
      "nightclub-tour",
      "prom",
    ],
    specifications: {
      length: "40 feet",
      amenities: "Dance floor, bar, restroom, sound system",
      fuelType: "Diesel",
      minimumHours: 4,
    },
  },
  {
    id: "party-bus-24",
    name: "Mid-Size Party Bus (24 seats)",
    category: "party-bus",
    capacity: 24,
    features: [
      "led-lighting",
      "premium-sound",
      "bar",
      "flat-screens",
      "wraparound-seating",
    ],
    baseHourlyRate: 275,
    baseAirportRate: null,
    baseDailyRate: 1400,
    description:
      "The Mid-Size Party Bus offers premium celebration space for groups up to 24.",
    longDescription:
      "Our 24-passenger party bus delivers the perfect celebration experience for medium-sized groups. Featuring LED lighting, premium sound system, wet bar, and entertainment systems. Ideal for birthday parties, brewery tours, and corporate outings.",
    seoKeywords: [
      "party bus rental",
      "mid-size party bus",
      "brewery tour bus Chicago",
    ],
    imageUrl: "/images/fleet/party-bus-24.jpg",
    availability: { weekday: true, weekend: true, available24_7: false },
    applicableServices: [
      "bachelor-party",
      "bachelorette-party",
      "birthday",
      "brewery-tour",
      "corporate-party",
    ],
    specifications: {
      length: "32 feet",
      amenities: "Bar, LED lights, entertainment system",
      fuelType: "Diesel",
      minimumHours: 4,
    },
  },

  // CATEGORY 6: COACH BUSES (40+ passengers)
  {
    id: "coach-50",
    name: "Full-Size Motor Coach (50+ seats)",
    category: "coach-bus",
    capacity: 55,
    features: [
      "reclining-seats",
      "restroom",
      "overhead-storage",
      "wifi",
      "power-outlets",
      "pa-system",
      "wheelchair-accessible",
    ],
    baseHourlyRate: 250,
    baseAirportRate: 200,
    baseDailyRate: 1500,
    description:
      "The Full-Size Motor Coach provides comfortable large group transportation for 50+ passengers.",
    longDescription:
      "Our 55-passenger motor coach is perfect for large group transportation. Featuring reclining seats, onboard restroom, WiFi, power outlets, and PA system. ADA wheelchair accessible. Ideal for corporate charters, tour groups, and large event transportation.",
    seoKeywords: [
      "charter bus Chicago",
      "motor coach rental",
      "large group transportation",
    ],
    imageUrl: "/images/fleet/coach-55.jpg",
    availability: { weekday: true, weekend: true, available24_7: true },
    applicableServices: [
      "charter",
      "tour-group",
      "corporate-event",
      "wedding-guest-shuttle",
    ],
    specifications: {
      length: "45 feet",
      amenities: "Restroom, WiFi, PA system, overhead storage",
      fuelType: "Diesel",
      luggageCapacity: "Full undercarriage storage",
    },
  },
];

async function addFleetVehicles() {
  console.log("=== ENTERPRISE PHASE 1: ADDING FLEET VEHICLES ===\n");
  console.log(`Total vehicles to add: ${FLEET_VEHICLES.length}\n`);

  let created = 0;
  let errors = 0;

  const batch = db.batch();

  for (const vehicle of FLEET_VEHICLES) {
    try {
      const vehicleDoc = {
        ...vehicle,
        applicableLocations: ["all"], // Available in all service areas
        status: "active",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const docRef = db.collection("fleet_vehicles").doc(vehicle.id);
      batch.set(docRef, vehicleDoc, { merge: true });
      created++;
      console.log(
        `  Added: ${vehicle.name} (${vehicle.category}, ${vehicle.capacity} passengers)`,
      );
    } catch (err) {
      console.error(`Error processing ${vehicle.name}:`, err.message);
      errors++;
    }
  }

  await batch.commit();

  console.log("\n=== FLEET VEHICLE ADDITION COMPLETE ===");
  console.log(`Created/Updated: ${created}`);
  console.log(`Errors: ${errors}`);

  // Verify count
  const countSnapshot = await db.collection("fleet_vehicles").count().get();
  console.log(`\nVerified fleet count: ${countSnapshot.data().count}`);

  // Count by category
  const categories = [
    "luxury-sedan",
    "luxury-suv",
    "stretch-limo",
    "executive-van",
    "party-bus",
    "coach-bus",
  ];
  for (const category of categories) {
    const catCount = await db
      .collection("fleet_vehicles")
      .where("category", "==", category)
      .count()
      .get();
    console.log(`  ${category}: ${catCount.data().count} vehicles`);
  }

  return { created, errors };
}

async function main() {
  const result = await addFleetVehicles();
  console.log("\nResult:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
