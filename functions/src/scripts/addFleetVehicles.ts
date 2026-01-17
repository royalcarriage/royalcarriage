/**
 * Fleet Vehicles Initialization Script
 * Purpose: Populate fleet_vehicles collection with complete Royal Carriage fleet
 *
 * 14 Vehicles across 6 categories:
 * - 4 Luxury Sedans
 * - 4 Luxury SUVs
 * - 1 Stretch Limousine
 * - 2 Executive Vans
 * - 2 Party Buses
 * - 1 Coach Bus
 */

export interface FleetVehicle {
  id: string;
  name: string;
  category: "sedan" | "suv" | "stretch" | "van" | "partyBus" | "coach";
  capacity: number;
  baseHourlyRate: number;
  baseAirportRate: number;
  features: string[];
  applicableServices: string[];
  applicableLocations: string;
  description: string;
  seoKeywords: string[];
  imageUrl: string;
  availability: {
    weekday: boolean;
    weekend: boolean;
    available24_7: boolean;
  };
  specifications: {
    passengers: number;
    luggage?: number;
    amenities: string[];
  };
}

/**
 * Complete fleet data with comprehensive specifications
 */
export const fleetVehiclesData: FleetVehicle[] = [
  // ===== LUXURY SEDANS (4 vehicles) =====
  {
    id: "lincoln-continental",
    name: "Lincoln Continental",
    category: "sedan",
    capacity: 3,
    baseHourlyRate: 85,
    baseAirportRate: 75,
    features: [
      "Premium leather interior",
      "Wi-Fi connectivity",
      "USB charging ports",
      "Climate control",
      "Tinted windows",
      "Professional chauffeur",
      "Complimentary water",
    ],
    applicableServices: [
      "airport-transfer",
      "corporate-travel",
      "executive-service",
      "business-meeting",
      "point-to-point",
      "hourly-rental",
    ],
    applicableLocations: "all",
    description:
      "The Lincoln Continental represents the pinnacle of American luxury sedan design. Perfect for executive airport transfers, corporate meetings, and professional business travel throughout Chicago and suburbs. Features premium leather seating for up to 3 passengers, advanced climate control, and complimentary Wi-Fi. Ideal for discerning travelers who demand comfort, style, and punctuality.",
    seoKeywords: [
      "Lincoln Continental rental Chicago",
      "luxury sedan service",
      "airport car service",
      "executive sedan Chicago",
      "corporate car service",
      "business travel sedan",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/lincoln-continental.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 3,
      luggage: 3,
      amenities: [
        "Leather seats",
        "Wi-Fi",
        "Phone chargers",
        "Bottled water",
        "Climate zones",
      ],
    },
  },
  {
    id: "cadillac-xts",
    name: "Cadillac XTS",
    category: "sedan",
    capacity: 3,
    baseHourlyRate: 80,
    baseAirportRate: 70,
    features: [
      "Luxury leather interior",
      "Advanced technology package",
      "USB and power outlets",
      "Spacious trunk",
      "Smooth ride suspension",
      "Professional chauffeur",
      "Complimentary beverages",
    ],
    applicableServices: [
      "airport-transfer",
      "corporate-travel",
      "business-meeting",
      "professional-service",
      "point-to-point",
      "daily-commute",
    ],
    applicableLocations: "all",
    description:
      "The Cadillac XTS combines sophisticated American luxury with cutting-edge technology. Designed for professional business travelers and corporate executives, this sedan offers a refined travel experience with premium appointments and smooth ride quality. Perfect for airport transfers, business meetings, and executive point-to-point service across the Chicago metropolitan area.",
    seoKeywords: [
      "Cadillac XTS rental Chicago",
      "professional car service",
      "business sedan rental",
      "corporate sedan Chicago",
      "executive car service",
      "airport sedan service",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/cadillac-xts.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 3,
      luggage: 3,
      amenities: [
        "Luxury leather",
        "Tech package",
        "Power outlets",
        "Beverages",
        "Smooth suspension",
      ],
    },
  },
  {
    id: "mercedes-benz-s-class",
    name: "Mercedes-Benz S-Class",
    category: "sedan",
    capacity: 3,
    baseHourlyRate: 120,
    baseAirportRate: 100,
    features: [
      "Premium Nappa leather",
      "Advanced MBUX infotainment",
      "Heated and ventilated seats",
      "Executive rear seating",
      "Ambient lighting",
      "Professional chauffeur",
      "Premium beverages",
    ],
    applicableServices: [
      "vip-service",
      "executive-travel",
      "airport-transfer",
      "corporate-travel",
      "special-occasions",
      "luxury-transport",
    ],
    applicableLocations: "all",
    description:
      "The Mercedes-Benz S-Class sets the global standard for luxury sedans. Engineered for VIP clients and executive travelers who demand the absolute best, this flagship sedan delivers unparalleled comfort, cutting-edge technology, and prestigious presence. Features executive rear seating, premium Nappa leather, and advanced driver assistance. Perfect for high-profile airport transfers, corporate VIP service, and special occasions.",
    seoKeywords: [
      "Mercedes S-Class rental Chicago",
      "luxury VIP sedan",
      "executive car service Chicago",
      "premium sedan rental",
      "VIP airport service",
      "luxury corporate transport",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/mercedes-s-class.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 3,
      luggage: 3,
      amenities: [
        "Nappa leather",
        "MBUX system",
        "Heated/cooled seats",
        "Ambient lighting",
        "Premium drinks",
      ],
    },
  },
  {
    id: "bmw-7-series",
    name: "BMW 7 Series",
    category: "sedan",
    capacity: 3,
    baseHourlyRate: 115,
    baseAirportRate: 95,
    features: [
      "Premium leather upholstery",
      "iDrive infotainment system",
      "Wireless charging",
      "Executive lounge seating",
      "Gesture control",
      "Professional chauffeur",
      "Luxury amenities",
    ],
    applicableServices: [
      "executive-travel",
      "corporate-service",
      "vip-transport",
      "airport-transfer",
      "business-meeting",
      "premium-service",
    ],
    applicableLocations: "all",
    description:
      "The BMW 7 Series represents the perfect fusion of performance luxury and executive comfort. Designed for corporate leaders and discerning travelers, this premium sedan offers dynamic driving refinement with first-class passenger accommodations. Features gesture control technology, executive lounge seating, and advanced connectivity. Ideal for premium corporate travel, VIP airport service, and high-level business meetings throughout Chicago.",
    seoKeywords: [
      "BMW 7 Series rental Chicago",
      "premium corporate sedan",
      "executive BMW service",
      "luxury business car",
      "VIP sedan Chicago",
      "corporate luxury transport",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/bmw-7-series.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 3,
      luggage: 3,
      amenities: [
        "Premium leather",
        "iDrive system",
        "Wireless charging",
        "Gesture control",
        "Luxury finishes",
      ],
    },
  },

  // ===== LUXURY SUVs (4 vehicles) =====
  {
    id: "cadillac-escalade-esv",
    name: "Cadillac Escalade ESV",
    category: "suv",
    capacity: 6,
    baseHourlyRate: 130,
    baseAirportRate: 110,
    features: [
      "Premium leather seating for 6",
      "Rear entertainment system",
      "Mini bar setup",
      "Panoramic sunroof",
      "Advanced safety features",
      "Ample luggage space",
      "Professional chauffeur",
      "Luxury amenities",
    ],
    applicableServices: [
      "wedding-transportation",
      "group-travel",
      "family-events",
      "airport-group-transfer",
      "corporate-groups",
      "special-occasions",
    ],
    applicableLocations: "all",
    description:
      "The Cadillac Escalade ESV is the ultimate luxury SUV for group travel. With seating for 6 passengers and abundant cargo space, this extended-length SUV is perfect for wedding parties, family airport transfers, and corporate group transportation. Features include premium leather throughout, rear entertainment system, mini bar, and panoramic sunroof. Combines impressive presence with practical versatility for any occasion.",
    seoKeywords: [
      "Cadillac Escalade rental Chicago",
      "luxury SUV service",
      "wedding SUV transportation",
      "group airport transfer",
      "family SUV rental",
      "corporate group transport",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/cadillac-escalade.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 6,
      luggage: 8,
      amenities: [
        "Leather for 6",
        "Entertainment system",
        "Mini bar",
        "Sunroof",
        "Large cargo area",
      ],
    },
  },
  {
    id: "lincoln-navigator",
    name: "Lincoln Navigator",
    category: "suv",
    capacity: 6,
    baseHourlyRate: 125,
    baseAirportRate: 105,
    features: [
      "Premium leather seating",
      "Reclining second-row captain chairs",
      "Panoramic moonroof",
      "Lincoln Co-Pilot360",
      "Wireless connectivity",
      "Spacious interior",
      "Professional chauffeur",
      "Luxury amenities",
    ],
    applicableServices: [
      "executive-group-travel",
      "family-events",
      "wedding-parties",
      "airport-transfer",
      "corporate-groups",
      "special-occasions",
    ],
    applicableLocations: "all",
    description:
      "The Lincoln Navigator redefines luxury SUV travel with its spacious cabin and executive-level appointments. Perfect for executive groups, family celebrations, and wedding parties, the Navigator seats 6 passengers in exceptional comfort. Features reclining second-row captain chairs, panoramic moonroof, and Lincoln Co-Pilot360 safety suite. Ideal for airport group transfers, corporate team events, and upscale family occasions.",
    seoKeywords: [
      "Lincoln Navigator rental Chicago",
      "executive SUV service",
      "luxury group transportation",
      "family SUV rental",
      "wedding group transport",
      "corporate SUV Chicago",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/lincoln-navigator.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 6,
      luggage: 7,
      amenities: [
        "Captain chairs",
        "Panoramic roof",
        "Co-Pilot360",
        "Wireless tech",
        "Premium space",
      ],
    },
  },
  {
    id: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "suv",
    capacity: 6,
    baseHourlyRate: 110,
    baseAirportRate: 90,
    features: [
      "Comfortable seating for 6",
      "Extensive cargo capacity",
      "Reliable performance",
      "Climate control",
      "Entertainment system",
      "USB charging ports",
      "Professional chauffeur",
      "Spacious interior",
    ],
    applicableServices: [
      "airport-group-transfer",
      "family-travel",
      "group-events",
      "wedding-guests",
      "corporate-shuttle",
      "group-transportation",
    ],
    applicableLocations: "all",
    description:
      "The Chevrolet Suburban is the trusted choice for reliable group transportation. With room for 6 passengers and exceptional cargo capacity, the Suburban is perfect for family airport transfers, group events, and wedding guest transportation. Known for its dependability and spacious interior, this SUV combines practical functionality with comfortable amenities. Excellent choice for large families and groups traveling throughout Chicago.",
    seoKeywords: [
      "Chevrolet Suburban rental Chicago",
      "group airport SUV",
      "family SUV service",
      "reliable group transport",
      "wedding guest shuttle",
      "airport family transfer",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/chevrolet-suburban.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 6,
      luggage: 9,
      amenities: [
        "Spacious seating",
        "Large cargo",
        "Entertainment",
        "USB ports",
        "Climate zones",
      ],
    },
  },
  {
    id: "gmc-yukon-denali",
    name: "GMC Yukon Denali",
    category: "suv",
    capacity: 6,
    baseHourlyRate: 120,
    baseAirportRate: 100,
    features: [
      "Premium Denali leather",
      "Advanced technology suite",
      "Bose premium audio",
      "Power-folding third row",
      "Head-up display",
      "Spacious cabin",
      "Professional chauffeur",
      "Luxury appointments",
    ],
    applicableServices: [
      "corporate-groups",
      "wedding-transportation",
      "executive-travel",
      "group-events",
      "airport-transfer",
      "special-occasions",
    ],
    applicableLocations: "all",
    description:
      "The GMC Yukon Denali delivers premium luxury in a versatile SUV package. Perfect for corporate groups, wedding parties, and executive travel, the Denali features upscale appointments including premium leather, Bose audio, and advanced technology. Seats 6 passengers in refined comfort with ample cargo space. Ideal for professional group transportation, wedding events, and corporate team activities throughout the Chicago area.",
    seoKeywords: [
      "GMC Yukon Denali rental Chicago",
      "luxury corporate SUV",
      "wedding SUV service",
      "premium group transport",
      "executive SUV Chicago",
      "luxury group travel",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/gmc-yukon-denali.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 6,
      luggage: 8,
      amenities: [
        "Denali leather",
        "Bose audio",
        "Tech suite",
        "Power third row",
        "Premium finishes",
      ],
    },
  },

  // ===== STRETCH LIMOUSINES (1 vehicle) =====
  {
    id: "lincoln-stretch-limo",
    name: "Lincoln Stretch Limousine",
    category: "stretch",
    capacity: 10,
    baseHourlyRate: 150,
    baseAirportRate: 0, // Not typically used for airport service
    features: [
      "Leather seating for 8-10",
      "Full bar with glassware",
      "Premium sound system",
      "Fiber optic lighting",
      "Privacy partition",
      "Entertainment system",
      "Professional chauffeur",
      "Red carpet service",
    ],
    applicableServices: [
      "wedding-transportation",
      "prom-service",
      "special-events",
      "anniversary-celebration",
      "party-limo",
      "night-out",
    ],
    applicableLocations: "all",
    description:
      "The Lincoln Stretch Limousine is the iconic choice for unforgettable celebrations. Perfect for weddings, proms, anniversaries, and special nights out, this classic stretch limo seats 8-10 passengers in elegant luxury. Features include a full bar, fiber optic lighting, premium sound system, and privacy partition. Make a grand entrance with professional chauffeur service and red carpet treatment. The ultimate vehicle for creating memorable moments.",
    seoKeywords: [
      "stretch limo rental Chicago",
      "wedding limousine",
      "prom limo service",
      "party limousine Chicago",
      "special event limo",
      "anniversary limo rental",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/lincoln-stretch-limo.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: false,
    },
    specifications: {
      passengers: 10,
      luggage: 2,
      amenities: [
        "Full bar",
        "Fiber optics",
        "Sound system",
        "Privacy screen",
        "Entertainment",
      ],
    },
  },

  // ===== EXECUTIVE VANS (2 vehicles) =====
  {
    id: "mercedes-sprinter-van-14",
    name: "Mercedes Sprinter Van (14 Passenger)",
    category: "van",
    capacity: 14,
    baseHourlyRate: 140,
    baseAirportRate: 180,
    features: [
      "Seating for 14 passengers",
      "High roof design",
      "Climate control",
      "Comfortable captain chairs",
      "Ample luggage capacity",
      "Power outlets",
      "Professional chauffeur",
      "Group travel amenities",
    ],
    applicableServices: [
      "group-airport-transfer",
      "corporate-shuttle",
      "tour-groups",
      "wedding-guest-shuttle",
      "convention-transport",
      "team-events",
    ],
    applicableLocations: "all",
    description:
      "The Mercedes Sprinter Van is the premier choice for group airport transfers and corporate shuttles. With seating for 14 passengers and generous luggage space, this high-roof van combines Mercedes quality with practical group transportation. Perfect for corporate shuttles, tour groups, wedding guest transfers, and convention transportation. Features comfortable captain chairs, climate control, and power outlets for every passenger.",
    seoKeywords: [
      "Mercedes Sprinter rental Chicago",
      "group airport van",
      "corporate shuttle service",
      "14 passenger van rental",
      "group transportation Chicago",
      "airport group transfer",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/mercedes-sprinter-14.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 14,
      luggage: 14,
      amenities: [
        "Captain chairs",
        "High roof",
        "Climate control",
        "Power outlets",
        "Large luggage",
      ],
    },
  },
  {
    id: "luxury-sprinter-van-12",
    name: "Luxury Executive Sprinter (12 Passenger)",
    category: "van",
    capacity: 12,
    baseHourlyRate: 180,
    baseAirportRate: 220,
    features: [
      "Executive leather seating for 12",
      "Wi-Fi connectivity",
      "Power outlets at every seat",
      "LED ambient lighting",
      "Premium sound system",
      "Conference table setup",
      "Professional chauffeur",
      "Luxury appointments",
    ],
    applicableServices: [
      "executive-group-travel",
      "corporate-events",
      "vip-group-transport",
      "airport-executive-shuttle",
      "business-meetings",
      "team-building",
    ],
    applicableLocations: "all",
    description:
      "The Luxury Executive Sprinter redefines group business travel with premium appointments and executive-level comfort. Seating 12 passengers in plush leather with conference-style layout, this van is perfect for executive groups, corporate events, and VIP transportation. Features Wi-Fi, power at every seat, LED lighting, and premium audio. Ideal for mobile business meetings, airport executive shuttles, and high-level corporate team events.",
    seoKeywords: [
      "luxury Sprinter rental Chicago",
      "executive van service",
      "corporate group transportation",
      "VIP group van",
      "business meeting van",
      "executive airport shuttle",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/luxury-sprinter-12.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 12,
      luggage: 10,
      amenities: [
        "Executive leather",
        "Wi-Fi",
        "Power at every seat",
        "LED lighting",
        "Conference setup",
      ],
    },
  },

  // ===== PARTY BUSES (2 vehicles) =====
  {
    id: "party-bus-36",
    name: "Full-Size Party Bus (36 Passenger)",
    category: "partyBus",
    capacity: 36,
    baseHourlyRate: 250,
    baseAirportRate: 0, // Not used for airport service
    features: [
      "Seating for 36 passengers",
      "LED dance floor lighting",
      "Premium sound system",
      "Multiple TV screens",
      "Full bar setup",
      "Laser light show",
      "Pole and dance area",
      "Professional chauffeur",
      "Party atmosphere",
    ],
    applicableServices: [
      "bachelor-party",
      "bachelorette-party",
      "birthday-celebration",
      "group-celebration",
      "nightclub-tour",
      "special-events",
    ],
    applicableLocations: "all",
    description:
      "The Full-Size Party Bus is the ultimate mobile celebration venue for large groups. With capacity for 36 passengers, this party bus features LED dance floor lighting, premium sound system, multiple TV screens, and a full bar setup. Perfect for bachelor and bachelorette parties, birthday celebrations, nightclub tours, and group events. Keep the party going between venues with laser lights, dance floor, and professional entertainment features.",
    seoKeywords: [
      "party bus rental Chicago",
      "bachelor party bus",
      "bachelorette party bus",
      "36 passenger party bus",
      "large party bus Chicago",
      "nightclub tour bus",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/party-bus-36.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: false,
    },
    specifications: {
      passengers: 36,
      luggage: 0,
      amenities: [
        "LED dance floor",
        "Premium audio",
        "Multiple TVs",
        "Full bar",
        "Laser lights",
      ],
    },
  },
  {
    id: "party-bus-24",
    name: "Mid-Size Party Bus (24 Passenger)",
    category: "partyBus",
    capacity: 24,
    baseHourlyRate: 200,
    baseAirportRate: 0, // Not used for airport service
    features: [
      "Seating for 24 passengers",
      "LED lighting system",
      "High-quality sound system",
      "TV screens",
      "Bar area",
      "Dance-friendly layout",
      "Comfortable seating",
      "Professional chauffeur",
      "Party amenities",
    ],
    applicableServices: [
      "birthday-party",
      "celebration-events",
      "group-outings",
      "anniversary-party",
      "graduation-celebration",
      "nightlife-tour",
    ],
    applicableLocations: "all",
    description:
      "The Mid-Size Party Bus offers the perfect balance of party atmosphere and manageable group size. Seating 24 passengers, this party bus features LED lighting, high-quality sound, TV screens, and a bar area. Ideal for birthday parties, graduation celebrations, anniversaries, and nightlife tours. Provides a fun, energetic atmosphere while remaining perfect for medium-sized groups who want to celebrate together between destinations.",
    seoKeywords: [
      "mid-size party bus Chicago",
      "birthday party bus",
      "24 passenger party bus",
      "celebration bus rental",
      "graduation party bus",
      "nightlife tour Chicago",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/party-bus-24.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: false,
    },
    specifications: {
      passengers: 24,
      luggage: 0,
      amenities: [
        "LED lighting",
        "Sound system",
        "TV screens",
        "Bar area",
        "Dance layout",
      ],
    },
  },

  // ===== COACH BUSES (1 vehicle) =====
  {
    id: "motor-coach-50",
    name: "Full-Size Motor Coach (50+ Passenger)",
    category: "coach",
    capacity: 56,
    baseHourlyRate: 180,
    baseAirportRate: 300,
    features: [
      "Seating for 50+ passengers",
      "Reclining seats",
      "Overhead storage",
      "Restroom facility",
      "PA system",
      "Climate control",
      "Large luggage bays",
      "Professional driver",
      "Wheelchair accessible",
    ],
    applicableServices: [
      "large-group-charters",
      "corporate-tours",
      "convention-transport",
      "church-groups",
      "school-trips",
      "airport-large-groups",
    ],
    applicableLocations: "all",
    description:
      "The Full-Size Motor Coach is the ultimate solution for large group transportation. With seating for 50+ passengers, this coach bus features reclining seats, restroom facility, overhead storage, and large luggage bays. Perfect for corporate tours, conventions, church groups, school trips, and large airport transfers. Wheelchair accessible with PA system and climate control. Provides comfortable, efficient transportation for any large group event or charter.",
    seoKeywords: [
      "motor coach rental Chicago",
      "charter bus Chicago",
      "50 passenger bus",
      "large group transportation",
      "corporate tour bus",
      "convention shuttle bus",
    ],
    imageUrl:
      "https://storage.googleapis.com/royalcarriage-fleet/motor-coach-50.jpg",
    availability: {
      weekday: true,
      weekend: true,
      available24_7: true,
    },
    specifications: {
      passengers: 56,
      luggage: 50,
      amenities: [
        "Reclining seats",
        "Restroom",
        "PA system",
        "Large luggage",
        "Wheelchair lift",
      ],
    },
  },
];

/**
 * Get all fleet vehicles data
 */
export function getFleetVehicles(): FleetVehicle[] {
  return fleetVehiclesData;
}

/**
 * Get vehicles by category
 */
export function getVehiclesByCategory(
  category: FleetVehicle["category"],
): FleetVehicle[] {
  return fleetVehiclesData.filter((vehicle) => vehicle.category === category);
}

/**
 * Get vehicle by ID
 */
export function getVehicleById(id: string): FleetVehicle | undefined {
  return fleetVehiclesData.find((vehicle) => vehicle.id === id);
}

/**
 * Get vehicles by capacity range
 */
export function getVehiclesByCapacity(
  minCapacity: number,
  maxCapacity?: number,
): FleetVehicle[] {
  if (maxCapacity) {
    return fleetVehiclesData.filter(
      (v) => v.capacity >= minCapacity && v.capacity <= maxCapacity,
    );
  }
  return fleetVehiclesData.filter((v) => v.capacity >= minCapacity);
}
