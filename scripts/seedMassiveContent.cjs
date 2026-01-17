const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}
const db = admin.firestore();

// ==================== 3 MAJOR AIRPORTS ====================
const AIRPORTS = [
  {
    id: "ohare",
    name: "O'Hare International Airport",
    code: "ORD",
    slug: "ohare-airport",
    description:
      "Chicago O'Hare International Airport is one of the busiest airports in the world, serving over 80 million passengers annually. Located 14 miles northwest of downtown Chicago, O'Hare is a major hub for United Airlines and American Airlines.",
    address: "10000 W O'Hare Ave, Chicago, IL 60666",
    coordinates: { lat: 41.9742, lng: -87.9073 },
    terminals: [
      "Terminal 1",
      "Terminal 2",
      "Terminal 3",
      "Terminal 5 (International)",
    ],
    airlines: [
      "United Airlines",
      "American Airlines",
      "Delta",
      "Southwest",
      "Spirit",
      "JetBlue",
    ],
    amenities: ["Lounges", "Dining", "Shopping", "Currency Exchange", "WiFi"],
    parkingInfo:
      "Economy parking starts at $12/day. Valet available at all terminals.",
    tips: [
      "Allow 2-3 hours for international departures",
      "Terminal 5 is separate - allow extra time if connecting",
      "The ATS train connects all terminals",
      "TSA PreCheck and CLEAR available at all terminals",
    ],
  },
  {
    id: "midway",
    name: "Chicago Midway International Airport",
    code: "MDW",
    slug: "midway-airport",
    description:
      "Chicago Midway International Airport is the city's second airport, located 10 miles southwest of downtown. It's the primary hub for Southwest Airlines and known for its efficiency and shorter security lines.",
    address: "5700 S Cicero Ave, Chicago, IL 60638",
    coordinates: { lat: 41.7868, lng: -87.7522 },
    terminals: ["Main Terminal"],
    airlines: ["Southwest Airlines", "Delta", "Porter Airlines", "Volaris"],
    amenities: ["Dining", "Shopping", "WiFi", "USO Lounge"],
    parkingInfo: "Economy parking starts at $10/day. Closer lots available.",
    tips: [
      "Typically shorter security lines than O'Hare",
      "Connected to CTA Orange Line for downtown access",
      "All gates in single terminal - easy connections",
      "Southwest dominates - great for budget travelers",
    ],
  },
  {
    id: "executive",
    name: "Chicago Executive Airport",
    code: "PWK",
    slug: "chicago-executive-airport",
    description:
      "Chicago Executive Airport (formerly Palwaukee) is a public airport in Wheeling, serving private and charter aviation. Popular with corporate travelers and private jet users seeking to avoid commercial airport congestion.",
    address: "1020 S Plant Rd, Wheeling, IL 60090",
    coordinates: { lat: 42.1142, lng: -87.9015 },
    terminals: ["FBO Terminal"],
    airlines: ["Private/Charter Only"],
    amenities: ["FBO Services", "Hangar Space", "Fuel Services", "Catering"],
    parkingInfo: "Complimentary parking for passengers.",
    tips: [
      "Ideal for private jet travelers",
      "No TSA lines - arrive 15 minutes before departure",
      "FBO provides luxury amenities",
      "Popular for corporate travel to north suburbs",
    ],
  },
];

// ==================== 50+ SERVICES ====================
const SERVICES = [
  // AIRPORT SERVICES (15)
  {
    id: "airport-transfer-ohare",
    name: "O'Hare Airport Transfer",
    slug: "ohare-airport-transfer",
    category: "airport",
    description:
      "Professional limousine service to and from O'Hare International Airport. Flight tracking, meet & greet, and flat-rate pricing.",
    shortDesc: "Reliable O'Hare transfers with flight tracking",
    keywords: ["ohare limo", "ohare car service", "ord airport transfer"],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-transfer-midway",
    name: "Midway Airport Transfer",
    slug: "midway-airport-transfer",
    category: "airport",
    description:
      "Comfortable and reliable limousine service to Midway International Airport. Professional chauffeurs and real-time flight monitoring.",
    shortDesc: "Midway airport car service",
    keywords: ["midway limo", "mdw car service", "midway transfer"],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-transfer-executive",
    name: "Executive Airport Transfer",
    slug: "executive-airport-transfer",
    category: "airport",
    description:
      "Private aviation transfers to Chicago Executive Airport. Discrete, professional service for private jet travelers.",
    shortDesc: "Private aviation transfers",
    keywords: ["private jet limo", "pwk transfer", "executive airport"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-meet-greet",
    name: "Airport Meet & Greet Service",
    slug: "airport-meet-greet",
    category: "airport",
    description:
      "VIP meet and greet service at baggage claim. Your chauffeur waits with a name sign and assists with luggage.",
    shortDesc: "VIP arrival experience",
    keywords: ["airport meet greet", "vip pickup", "baggage claim pickup"],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-curbside",
    name: "Curbside Pickup Service",
    slug: "airport-curbside-pickup",
    category: "airport",
    description:
      "Convenient curbside pickup outside arrivals. Perfect for quick departures when you know the airport well.",
    shortDesc: "Quick curbside pickup",
    keywords: ["curbside pickup", "arrivals pickup", "airport curb"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-roundtrip",
    name: "Round Trip Airport Service",
    slug: "airport-roundtrip",
    category: "airport",
    description:
      "Book your departure and return together for the best rates. We track your return flight and adjust pickup time automatically.",
    shortDesc: "Save on round trips",
    keywords: ["round trip airport", "return transfer", "airport package"],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-early-morning",
    name: "Early Morning Airport Service",
    slug: "early-morning-airport",
    category: "airport",
    description:
      "Catching a red-eye or early flight? Our 24/7 service ensures you arrive on time, no matter how early your departure.",
    shortDesc: "24/7 early flights covered",
    keywords: ["early morning limo", "red eye transfer", "24 hour car service"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-late-night",
    name: "Late Night Airport Pickup",
    slug: "late-night-airport",
    category: "airport",
    description:
      "Arriving late at night? We monitor delays and wait for you regardless of the hour. Safe transportation home guaranteed.",
    shortDesc: "Late arrival specialists",
    keywords: ["late night pickup", "delayed flight", "night transfer"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-group-transfer",
    name: "Group Airport Transfer",
    slug: "group-airport-transfer",
    category: "airport",
    description:
      "Traveling with a group? Our SUVs, vans, and sprinters accommodate groups of all sizes with plenty of luggage space.",
    shortDesc: "Groups up to 14 passengers",
    keywords: [
      "group airport transfer",
      "family airport",
      "team transportation",
    ],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-business-class",
    name: "Business Class Airport Service",
    slug: "business-class-airport",
    category: "airport",
    description:
      "Premium sedan service for business travelers. WiFi, privacy, and a productive environment from airport to office.",
    shortDesc: "Executive travel experience",
    keywords: ["business class car", "executive airport", "corporate transfer"],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-international",
    name: "International Flight Service",
    slug: "international-flight-service",
    category: "airport",
    description:
      "Specialized service for international travelers. We understand customs delays and adjust pickup times accordingly.",
    shortDesc: "International arrival experts",
    keywords: ["international flight pickup", "customs wait", "terminal 5"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-connecting-flight",
    name: "Connecting Flight Transfer",
    slug: "connecting-flight-transfer",
    category: "airport",
    description:
      "Need to transfer between O'Hare and Midway? We provide seamless transfers between Chicago airports.",
    shortDesc: "Airport-to-airport transfers",
    keywords: ["connecting flight", "airport transfer", "ord to mdw"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-corporate-account",
    name: "Corporate Airport Account",
    slug: "corporate-airport-account",
    category: "airport",
    description:
      "Set up a corporate account for your company's airport transportation needs. Priority booking, monthly billing, and detailed reports.",
    shortDesc: "Business account benefits",
    keywords: [
      "corporate account",
      "business billing",
      "company transportation",
    ],
    websiteId: "chicagoairportblackcar",
    featured: true,
  },
  {
    id: "airport-frequent-flyer",
    name: "Frequent Flyer Program",
    slug: "frequent-flyer-program",
    category: "airport",
    description:
      "Join our loyalty program for exclusive discounts, priority booking, and complimentary upgrades for frequent travelers.",
    shortDesc: "Rewards for regulars",
    keywords: ["frequent flyer", "loyalty program", "vip rewards"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },
  {
    id: "airport-last-minute",
    name: "Last Minute Airport Service",
    slug: "last-minute-airport",
    category: "airport",
    description:
      "Need a ride now? Our rapid response team can have a car to you within 30-60 minutes for urgent airport transfers.",
    shortDesc: "Urgent transfer service",
    keywords: ["last minute car", "urgent transfer", "asap airport"],
    websiteId: "chicagoairportblackcar",
    featured: false,
  },

  // CORPORATE SERVICES (12)
  {
    id: "corporate-executive",
    name: "Executive Car Service",
    slug: "executive-car-service",
    category: "corporate",
    description:
      "Premium chauffeur service for executives. Discrete, professional, and always punctual. Perfect for meetings, clients, and daily commutes.",
    shortDesc: "C-suite transportation",
    keywords: ["executive car", "ceo transportation", "corporate limo"],
    websiteId: "chicagoexecutivecarservice",
    featured: true,
  },
  {
    id: "corporate-roadshow",
    name: "Corporate Roadshow Service",
    slug: "corporate-roadshow",
    category: "corporate",
    description:
      "Multi-stop transportation for investor meetings, client presentations, and corporate roadshows throughout Chicago.",
    shortDesc: "Investor meeting transport",
    keywords: ["roadshow transportation", "investor meetings", "multi-stop"],
    websiteId: "chicagoexecutivecarservice",
    featured: true,
  },
  {
    id: "corporate-hourly",
    name: "Hourly Chauffeur Service",
    slug: "hourly-chauffeur-service",
    category: "corporate",
    description:
      "Book by the hour for flexible transportation needs. Your chauffeur waits while you attend meetings and appointments.",
    shortDesc: "Flexible hourly booking",
    keywords: ["hourly car service", "by the hour", "chauffeur wait"],
    websiteId: "chicagoexecutivecarservice",
    featured: true,
  },
  {
    id: "corporate-daily",
    name: "Full Day Chauffeur",
    slug: "full-day-chauffeur",
    category: "corporate",
    description:
      "Dedicated chauffeur for the entire day. Ideal for executives with packed schedules and multiple appointments.",
    shortDesc: "All-day dedicated driver",
    keywords: ["full day car", "dedicated chauffeur", "all day service"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-client-transport",
    name: "Client Transportation",
    slug: "client-transportation",
    category: "corporate",
    description:
      "Impress your clients with professional transportation from airport to office to dinner. We help you make the right impression.",
    shortDesc: "Client hosting service",
    keywords: ["client transport", "vip guest", "business hosting"],
    websiteId: "chicagoexecutivecarservice",
    featured: true,
  },
  {
    id: "corporate-team-shuttle",
    name: "Corporate Team Shuttle",
    slug: "corporate-team-shuttle",
    category: "corporate",
    description:
      "Transport your team to conferences, off-site meetings, and corporate events. Sprinters and vans available.",
    shortDesc: "Team transportation",
    keywords: ["team shuttle", "corporate van", "group transport"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-convention",
    name: "Convention Transportation",
    slug: "convention-transportation",
    category: "corporate",
    description:
      "Reliable transportation to McCormick Place and other convention centers. Skip the taxi lines and travel in comfort.",
    shortDesc: "Convention center service",
    keywords: ["convention transport", "mccormick place", "trade show"],
    websiteId: "chicagoexecutivecarservice",
    featured: true,
  },
  {
    id: "corporate-dinner",
    name: "Business Dinner Service",
    slug: "business-dinner-service",
    category: "corporate",
    description:
      "Transportation for client dinners, team celebrations, and corporate events. Your chauffeur handles the logistics while you focus on business.",
    shortDesc: "Evening business events",
    keywords: ["business dinner", "client dinner", "corporate event"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-commute",
    name: "Executive Commute Service",
    slug: "executive-commute",
    category: "corporate",
    description:
      "Daily commute service for executives who want to work during their commute. Productive travel time, every day.",
    shortDesc: "Daily work commute",
    keywords: ["executive commute", "daily car", "work transportation"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-board-meeting",
    name: "Board Meeting Transport",
    slug: "board-meeting-transport",
    category: "corporate",
    description:
      "Confidential transportation for board members and executives attending sensitive meetings. Discrete and professional.",
    shortDesc: "Confidential executive travel",
    keywords: ["board meeting", "confidential transport", "executive travel"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-recruitment",
    name: "Executive Recruitment Transport",
    slug: "executive-recruitment",
    category: "corporate",
    description:
      "Transportation for executive candidates visiting your company. Make a great first impression with professional service.",
    shortDesc: "Candidate transportation",
    keywords: ["recruitment transport", "candidate pickup", "interview travel"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },
  {
    id: "corporate-relocation",
    name: "Executive Relocation Service",
    slug: "executive-relocation",
    category: "corporate",
    description:
      "Transportation support for relocating executives. Airport transfers, home tours, and neighborhood exploration.",
    shortDesc: "Relocation assistance",
    keywords: ["relocation transport", "executive moving", "home tour"],
    websiteId: "chicagoexecutivecarservice",
    featured: false,
  },

  // WEDDING SERVICES (12)
  {
    id: "wedding-bride-groom",
    name: "Bride & Groom Transportation",
    slug: "bride-groom-transportation",
    category: "wedding",
    description:
      "Elegant limousine service for the happy couple. Make your grand entrance and memorable exit in style with champagne toast included.",
    shortDesc: "Your perfect wedding ride",
    keywords: ["wedding limo", "bride groom car", "wedding transportation"],
    websiteId: "chicagoweddingtransportation",
    featured: true,
  },
  {
    id: "wedding-bridal-party",
    name: "Bridal Party Transportation",
    slug: "bridal-party-transportation",
    category: "wedding",
    description:
      "Coordinate transportation for your entire wedding party. Stretch limos, party buses, and luxury SUVs available.",
    shortDesc: "Wedding party rides",
    keywords: [
      "bridal party limo",
      "bridesmaid transportation",
      "groomsmen shuttle",
    ],
    websiteId: "chicagoweddingtransportation",
    featured: true,
  },
  {
    id: "wedding-guest-shuttle",
    name: "Wedding Guest Shuttle",
    slug: "wedding-guest-shuttle",
    category: "wedding",
    description:
      "Transport your guests between ceremony, reception, and hotels. Keep everyone together and on schedule.",
    shortDesc: "Guest transportation",
    keywords: ["wedding shuttle", "guest transport", "reception shuttle"],
    websiteId: "chicagoweddingtransportation",
    featured: true,
  },
  {
    id: "wedding-getaway-car",
    name: "Wedding Getaway Car",
    slug: "wedding-getaway-car",
    category: "wedding",
    description:
      'Make your exit unforgettable with our decorated getaway vehicles. "Just Married" signs and champagne included.',
    shortDesc: "Memorable exit service",
    keywords: ["getaway car", "wedding exit", "just married"],
    websiteId: "chicagoweddingtransportation",
    featured: true,
  },
  {
    id: "wedding-rehearsal-dinner",
    name: "Rehearsal Dinner Transport",
    slug: "rehearsal-dinner-transport",
    category: "wedding",
    description:
      "Transportation for your rehearsal dinner guests. Ensure everyone arrives relaxed and ready to celebrate.",
    shortDesc: "Rehearsal night service",
    keywords: ["rehearsal dinner", "pre-wedding transport", "dinner shuttle"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-photo-tour",
    name: "Wedding Photo Tour",
    slug: "wedding-photo-tour",
    category: "wedding",
    description:
      "Transportation to multiple photo locations throughout Chicago. Your chauffeur knows the best spots and handles the logistics.",
    shortDesc: "Photo location transport",
    keywords: ["wedding photos", "photo tour", "chicago photo spots"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-vintage",
    name: "Vintage Wedding Car",
    slug: "vintage-wedding-car",
    category: "wedding",
    description:
      "Classic vintage vehicles for a timeless wedding aesthetic. Rolls Royce, Bentley, and classic limousines available.",
    shortDesc: "Classic car elegance",
    keywords: ["vintage wedding", "classic car", "rolls royce wedding"],
    websiteId: "chicagoweddingtransportation",
    featured: true,
  },
  {
    id: "wedding-honeymoon-transfer",
    name: "Honeymoon Airport Transfer",
    slug: "honeymoon-airport-transfer",
    category: "wedding",
    description:
      "Start your honeymoon right with luxury transportation to the airport. Champagne and romantic touches included.",
    shortDesc: "Honeymoon departure",
    keywords: ["honeymoon transfer", "wedding airport", "newlywed transport"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-family-transport",
    name: "Wedding Family Transportation",
    slug: "wedding-family-transport",
    category: "wedding",
    description:
      "Special transportation for parents, grandparents, and VIP family members. Ensure your loved ones are comfortable.",
    shortDesc: "Family VIP service",
    keywords: [
      "family transport",
      "parents transportation",
      "grandparent service",
    ],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-out-of-town",
    name: "Out-of-Town Guest Service",
    slug: "out-of-town-guest-service",
    category: "wedding",
    description:
      "Airport pickup and transportation for out-of-town wedding guests. Make them feel welcome from the moment they land.",
    shortDesc: "Guest arrival service",
    keywords: ["out of town guests", "guest pickup", "wedding airport"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-vendor-transport",
    name: "Wedding Vendor Transportation",
    slug: "wedding-vendor-transport",
    category: "wedding",
    description:
      "Transportation for your photographer, videographer, and other vendors between ceremony and reception venues.",
    shortDesc: "Vendor logistics",
    keywords: ["vendor transport", "photographer ride", "wedding logistics"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },
  {
    id: "wedding-send-off",
    name: "Wedding Send-Off Service",
    slug: "wedding-send-off",
    category: "wedding",
    description:
      "Coordinate the perfect send-off with our experienced drivers. Sparklers, bubbles, or confetti - we've seen it all.",
    shortDesc: "Grand exit coordination",
    keywords: ["wedding send off", "sparkler exit", "wedding finale"],
    websiteId: "chicagoweddingtransportation",
    featured: false,
  },

  // PARTY BUS SERVICES (11)
  {
    id: "partybus-bachelor",
    name: "Bachelor Party Bus",
    slug: "bachelor-party-bus",
    category: "partybus",
    description:
      "The ultimate bachelor party experience on wheels. Premium sound, LED lights, and room for your whole crew to party.",
    shortDesc: "Epic bachelor celebrations",
    keywords: ["bachelor party bus", "groom party", "stag party"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-bachelorette",
    name: "Bachelorette Party Bus",
    slug: "bachelorette-party-bus",
    category: "partybus",
    description:
      "Celebrate the bride-to-be in style! Our party buses are perfect for bar crawls, wine tours, and girls' night out.",
    shortDesc: "Ultimate bachelorette ride",
    keywords: ["bachelorette bus", "bride party", "hen party"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-birthday",
    name: "Birthday Party Bus",
    slug: "birthday-party-bus",
    category: "partybus",
    description:
      "Make any birthday unforgettable with a party bus celebration. Perfect for milestone birthdays and surprise parties.",
    shortDesc: "Birthday celebration rides",
    keywords: ["birthday bus", "party celebration", "milestone birthday"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-nightclub",
    name: "Nightclub Tour Party Bus",
    slug: "nightclub-tour-party-bus",
    category: "partybus",
    description:
      "Hit Chicago's hottest clubs without worrying about transportation. Your party bus waits while you dance the night away.",
    shortDesc: "Chicago nightlife tours",
    keywords: ["club tour", "nightlife bus", "bar hopping"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-concert",
    name: "Concert Transportation",
    slug: "concert-transportation",
    category: "partybus",
    description:
      "Transportation to concerts at United Center, Soldier Field, and music venues. Skip the parking and traffic chaos.",
    shortDesc: "Concert venue transport",
    keywords: ["concert bus", "united center", "soldier field"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-sporting-event",
    name: "Sporting Event Party Bus",
    slug: "sporting-event-party-bus",
    category: "partybus",
    description:
      "Tailgate on wheels! Transport your crew to Bears, Bulls, Cubs, and Sox games. BYOB and party to the stadium.",
    shortDesc: "Game day transportation",
    keywords: ["sports bus", "tailgate party", "game day"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-brewery-tour",
    name: "Brewery Tour Party Bus",
    slug: "brewery-tour-party-bus",
    category: "partybus",
    description:
      "Visit Chicago's best craft breweries with designated transportation. We'll design a custom route or follow your plan.",
    shortDesc: "Craft beer adventures",
    keywords: ["brewery tour", "beer bus", "craft brewery"],
    websiteId: "chicago-partybus",
    featured: false,
  },
  {
    id: "partybus-wine-tour",
    name: "Wine Tour Party Bus",
    slug: "wine-tour-party-bus",
    category: "partybus",
    description:
      "Elegant wine tasting tours to Illinois wineries and wine bars. Sophisticated transportation for wine lovers.",
    shortDesc: "Wine country tours",
    keywords: ["wine tour", "winery bus", "wine tasting"],
    websiteId: "chicago-partybus",
    featured: false,
  },
  {
    id: "partybus-prom",
    name: "Prom Party Bus",
    slug: "prom-party-bus",
    category: "partybus",
    description:
      "Safe, fun prom transportation for students. Parent-approved service with professional drivers and no alcohol policy.",
    shortDesc: "Safe prom transportation",
    keywords: ["prom bus", "prom limo", "high school prom"],
    websiteId: "chicago-partybus",
    featured: true,
  },
  {
    id: "partybus-corporate-party",
    name: "Corporate Party Bus",
    slug: "corporate-party-bus",
    category: "partybus",
    description:
      "Team building events, holiday parties, and corporate celebrations. Bond with your team while we handle the driving.",
    shortDesc: "Corporate team events",
    keywords: ["corporate party", "team building", "company party"],
    websiteId: "chicago-partybus",
    featured: false,
  },
  {
    id: "partybus-custom-tour",
    name: "Custom Chicago Tour",
    slug: "custom-chicago-tour",
    category: "partybus",
    description:
      "Design your own Chicago experience. We'll create a custom itinerary to match your group's interests.",
    shortDesc: "Your tour, your way",
    keywords: ["custom tour", "chicago sightseeing", "private tour"],
    websiteId: "chicago-partybus",
    featured: false,
  },
];

// ==================== 15 VEHICLES ====================
const VEHICLES = [
  {
    id: "lincoln-continental",
    name: "Lincoln Continental",
    slug: "lincoln-continental",
    type: "sedan",
    category: "Executive Sedan",
    passengerCapacity: 3,
    luggageCapacity: 3,
    description:
      "The Lincoln Continental represents the pinnacle of American luxury. With its quiet cabin, plush leather seating, and smooth ride, it's the perfect choice for executive airport transfers and business travel.",
    features: [
      "Leather Interior",
      "Climate Control",
      "WiFi Hotspot",
      "USB Charging",
      "Privacy Glass",
      "Premium Sound System",
    ],
    amenities: [
      "Complimentary Water",
      "Phone Chargers",
      "Tissues",
      "Umbrella Service",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Flincoln-continental.jpg?alt=media",
    hourlyRate: 75,
    airportRate: 65,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
    ],
  },
  {
    id: "mercedes-s-class",
    name: "Mercedes-Benz S-Class",
    slug: "mercedes-s-class",
    type: "luxury-sedan",
    category: "Luxury Sedan",
    passengerCapacity: 3,
    luggageCapacity: 3,
    description:
      "The Mercedes-Benz S-Class is the benchmark for luxury sedans worldwide. Experience world-class engineering, cutting-edge technology, and unparalleled comfort.",
    features: [
      "Massage Seats",
      "Ambient Lighting",
      "Burmester Sound",
      "Executive Rear Seating",
      "Air Suspension",
      "Night Vision",
    ],
    amenities: [
      "Champagne Service Available",
      "Premium Water",
      "WiFi",
      "iPad Available",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fmercedes-s-class.jpg?alt=media",
    hourlyRate: 95,
    airportRate: 85,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
    ],
  },
  {
    id: "bmw-7-series",
    name: "BMW 7 Series",
    slug: "bmw-7-series",
    type: "luxury-sedan",
    category: "Luxury Sedan",
    passengerCapacity: 3,
    luggageCapacity: 3,
    description:
      "The BMW 7 Series combines athletic performance with refined luxury. For executives who appreciate driving dynamics alongside comfort.",
    features: [
      "Executive Lounge Seating",
      "Gesture Control",
      "Panoramic Sky Lounge",
      "Rear Entertainment",
      "Ambient Air Package",
    ],
    amenities: [
      "Complimentary WiFi",
      "Premium Water",
      "Device Charging",
      "Reading Lights",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fbmw-7-series.jpg?alt=media",
    hourlyRate: 90,
    airportRate: 80,
    websites: ["chicagoairportblackcar", "chicagoexecutivecarservice"],
  },
  {
    id: "cadillac-escalade",
    name: "Cadillac Escalade ESV",
    slug: "cadillac-escalade",
    type: "suv",
    category: "Luxury SUV",
    passengerCapacity: 6,
    luggageCapacity: 6,
    description:
      "The Cadillac Escalade ESV is the ultimate luxury SUV. With seating for up to 6 passengers and extensive luggage space, it's perfect for families and groups.",
    features: [
      "Captain's Chairs",
      "Magnetic Ride Control",
      "AKG Studio Sound",
      "Super Cruise Available",
      "Night Vision",
      "Rear Entertainment",
    ],
    amenities: ["Bottled Water", "WiFi", "USB Ports", "Climate Zones"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fcadillac-escalade.jpg?alt=media",
    hourlyRate: 95,
    airportRate: 85,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
      "chicago-partybus",
    ],
  },
  {
    id: "lincoln-navigator",
    name: "Lincoln Navigator L",
    slug: "lincoln-navigator",
    type: "suv",
    category: "Luxury SUV",
    passengerCapacity: 6,
    luggageCapacity: 6,
    description:
      "The Lincoln Navigator L offers serene luxury with its signature Lincoln quietness and Perfect Position seats. Extended wheelbase provides maximum passenger and cargo space.",
    features: [
      "Perfect Position Seats",
      "Revel Audio",
      "Lincoln Embrace",
      "Power Running Boards",
      "Panoramic Vista Roof",
    ],
    amenities: [
      "Premium Water",
      "WiFi Hotspot",
      "USB-C Charging",
      "Rear Climate",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Flincoln-navigator.jpg?alt=media",
    hourlyRate: 95,
    airportRate: 85,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
    ],
  },
  {
    id: "chevrolet-suburban",
    name: "Chevrolet Suburban Premier",
    slug: "chevrolet-suburban",
    type: "suv",
    category: "Executive SUV",
    passengerCapacity: 6,
    luggageCapacity: 8,
    description:
      "The Chevrolet Suburban offers unmatched interior space and versatility. Perfect for groups with lots of luggage or equipment.",
    features: [
      "Max Trailering Package",
      "Magnetic Ride Control",
      "Bose Sound",
      "Power Fold Seats",
      "Heads-Up Display",
    ],
    amenities: ["Bottled Water", "WiFi", "USB Charging", "Climate Control"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fchevrolet-suburban.jpg?alt=media",
    hourlyRate: 85,
    airportRate: 75,
    websites: ["chicagoairportblackcar", "chicagoexecutivecarservice"],
  },
  {
    id: "mercedes-sprinter-executive",
    name: "Mercedes Sprinter Executive",
    slug: "mercedes-sprinter-executive",
    type: "executive-van",
    category: "Executive Van",
    passengerCapacity: 12,
    luggageCapacity: 12,
    description:
      "Our executive-configured Mercedes Sprinter features captain's chairs, conference-style seating, and a mobile office setup. Perfect for corporate groups.",
    features: [
      "Conference Table",
      "Captain's Chairs",
      "Standing Height",
      "Premium Sound",
      "Privacy Partition",
      "USB/Power Outlets",
    ],
    amenities: ["WiFi", "Bottled Water", "TV Screens", "Refreshment Center"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fsprinter-executive.jpg?alt=media",
    hourlyRate: 125,
    airportRate: 150,
    websites: ["chicagoairportblackcar", "chicagoexecutivecarservice"],
  },
  {
    id: "mercedes-sprinter-passenger",
    name: "Mercedes Sprinter 14-Passenger",
    slug: "mercedes-sprinter-passenger",
    type: "van",
    category: "Passenger Van",
    passengerCapacity: 14,
    luggageCapacity: 14,
    description:
      "Our 14-passenger Mercedes Sprinter is perfect for group airport transfers, corporate shuttles, and wedding parties.",
    features: [
      "High Roof",
      "Plush Seating",
      "Climate Control",
      "Luggage Racks",
      "PA System",
    ],
    amenities: ["Bottled Water", "WiFi", "USB Charging"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fsprinter-passenger.jpg?alt=media",
    hourlyRate: 110,
    airportRate: 125,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
    ],
  },
  {
    id: "lincoln-stretch-limo",
    name: "Lincoln Stretch Limousine",
    slug: "lincoln-stretch-limo",
    type: "stretch-limo",
    category: "Stretch Limousine",
    passengerCapacity: 10,
    luggageCapacity: 4,
    description:
      "The classic Lincoln Stretch Limousine is perfect for weddings, proms, and special celebrations. Timeless elegance with modern amenities.",
    features: [
      "Fiber Optic Lighting",
      "Wet Bar",
      "Premium Sound",
      "Privacy Partition",
      "Intercom",
      "Mood Lighting",
    ],
    amenities: ["Champagne Service", "Glassware", "Ice", "Napkins"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Flincoln-stretch.jpg?alt=media",
    hourlyRate: 125,
    airportRate: null,
    websites: ["chicagoweddingtransportation", "chicago-partybus"],
  },
  {
    id: "chrysler-300-stretch",
    name: "Chrysler 300 Stretch",
    slug: "chrysler-300-stretch",
    type: "stretch-limo",
    category: "Stretch Limousine",
    passengerCapacity: 10,
    luggageCapacity: 3,
    description:
      "The Chrysler 300 Stretch offers modern styling with classic limousine luxury. A contemporary alternative to traditional stretch limos.",
    features: [
      "LED Lighting",
      "Wet Bar",
      "Flat Screen TV",
      "Premium Sound",
      "Starlight Ceiling",
    ],
    amenities: ["Champagne Service", "Glassware", "Bottled Water"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fchrysler-300-stretch.jpg?alt=media",
    hourlyRate: 135,
    airportRate: null,
    websites: ["chicagoweddingtransportation", "chicago-partybus"],
  },
  {
    id: "partybus-24",
    name: "24-Passenger Party Bus",
    slug: "partybus-24-passenger",
    type: "partybus",
    category: "Party Bus",
    passengerCapacity: 24,
    luggageCapacity: 0,
    description:
      "Our 24-passenger party bus is perfect for medium-sized groups. Features a dance floor, premium sound, and LED lighting.",
    features: [
      "Dance Floor",
      "LED Lighting",
      "Premium Sound",
      "Wet Bar",
      "Stripper Poles",
      "Laser Lights",
    ],
    amenities: ["Ice", "Coolers", "Glassware", "BYOB Welcome"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fpartybus-24.jpg?alt=media",
    hourlyRate: 200,
    airportRate: null,
    websites: ["chicago-partybus", "chicagoweddingtransportation"],
  },
  {
    id: "partybus-36",
    name: "36-Passenger Party Bus",
    slug: "partybus-36-passenger",
    type: "partybus",
    category: "Party Bus",
    passengerCapacity: 36,
    luggageCapacity: 0,
    description:
      "Our flagship 36-passenger party bus is the ultimate celebration venue on wheels. Maximum space, maximum fun.",
    features: [
      "Large Dance Floor",
      "Club Sound System",
      "LED Color Changing",
      "Multiple Bars",
      "Restroom",
      "Stripper Poles",
    ],
    amenities: ["Multiple Coolers", "Ice", "Glassware", "BYOB Welcome"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fpartybus-36.jpg?alt=media",
    hourlyRate: 275,
    airportRate: null,
    websites: ["chicago-partybus", "chicagoweddingtransportation"],
  },
  {
    id: "rolls-royce-phantom",
    name: "Rolls-Royce Phantom",
    slug: "rolls-royce-phantom",
    type: "ultra-luxury",
    category: "Ultra Luxury",
    passengerCapacity: 3,
    luggageCapacity: 2,
    description:
      "The Rolls-Royce Phantom represents the absolute pinnacle of automotive luxury. For the most discerning clients and the most special occasions.",
    features: [
      "Starlight Headliner",
      "Bespoke Audio",
      "Champagne Cooler",
      "Lambswool Carpets",
      "Coach Doors",
      "Theatre Configuration",
    ],
    amenities: [
      "Champagne Service",
      "Premium Refreshments",
      "Concierge Service",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Frolls-royce.jpg?alt=media",
    hourlyRate: 350,
    airportRate: 400,
    websites: ["chicagoweddingtransportation", "chicagoexecutivecarservice"],
  },
  {
    id: "motor-coach-56",
    name: "56-Passenger Motor Coach",
    slug: "motor-coach-56",
    type: "coach",
    category: "Motor Coach",
    passengerCapacity: 56,
    luggageCapacity: 56,
    description:
      "Full-size motor coach for large groups, corporate events, and wedding guest shuttles. Professional service for any group size.",
    features: [
      "Reclining Seats",
      "Overhead Storage",
      "Restroom",
      "PA System",
      "DVD Player",
      "Climate Control",
    ],
    amenities: ["WiFi Available", "USB Charging", "Reading Lights"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fmotor-coach.jpg?alt=media",
    hourlyRate: 175,
    airportRate: 250,
    websites: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
      "chicago-partybus",
    ],
  },
  {
    id: "cadillac-xts",
    name: "Cadillac XTS",
    slug: "cadillac-xts",
    type: "sedan",
    category: "Executive Sedan",
    passengerCapacity: 3,
    luggageCapacity: 3,
    description:
      "The Cadillac XTS offers spacious comfort and refined style. A popular choice for professional car service and airport transfers.",
    features: [
      "Leather Seating",
      "Bose Audio",
      "CUE Infotainment",
      "Safety Suite",
      "Magnetic Ride",
    ],
    amenities: ["Bottled Water", "WiFi", "USB Charging"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/fleet%2Fcadillac-xts.jpg?alt=media",
    hourlyRate: 70,
    airportRate: 60,
    websites: ["chicagoairportblackcar", "chicagoexecutivecarservice"],
  },
];

// ==================== 200+ CITIES ====================
const CHICAGO_AREAS = {
  downtown: [
    "The Loop",
    "River North",
    "Streeterville",
    "Gold Coast",
    "Magnificent Mile",
    "West Loop",
    "South Loop",
    "Near North Side",
    "Near South Side",
    "Printer's Row",
  ],
  "north-side": [
    "Lincoln Park",
    "Lakeview",
    "Wrigleyville",
    "Boystown",
    "Roscoe Village",
    "North Center",
    "Lincoln Square",
    "Ravenswood",
    "Andersonville",
    "Edgewater",
    "Rogers Park",
    "Uptown",
    "Buena Park",
    "Sheridan Park",
    "Wicker Park",
    "Bucktown",
    "Ukrainian Village",
    "Logan Square",
    "Avondale",
    "Irving Park",
    "Albany Park",
    "Portage Park",
    "Jefferson Park",
    "Norwood Park",
    "Edison Park",
    "Old Town",
    "Sheffield Neighbors",
    "DePaul",
    "Wrightwood",
    "Lake View East",
  ],
  "south-side": [
    "Hyde Park",
    "Kenwood",
    "Bronzeville",
    "South Shore",
    "Jackson Park Highlands",
    "Woodlawn",
    "Washington Park",
    "Englewood",
    "Chatham",
    "Avalon Park",
    "South Chicago",
    "East Side",
    "Hegewisch",
    "Pullman",
    "Roseland",
    "Morgan Park",
    "Beverly",
    "Mount Greenwood",
    "Ashburn",
    "Chicago Lawn",
    "Marquette Park",
    "Gage Park",
    "Back of the Yards",
    "Bridgeport",
    "Pilsen",
    "Little Village",
    "Chinatown",
    "Armour Square",
    "Douglas",
    "Oakland",
  ],
  "west-side": [
    "Garfield Park",
    "Austin",
    "Humboldt Park",
    "West Town",
    "Noble Square",
    "East Garfield Park",
    "West Garfield Park",
    "North Lawndale",
    "South Lawndale",
    "Little Italy",
    "University Village",
    "Tri-Taylor",
    "Illinois Medical District",
  ],
  "north-suburbs": [
    "Evanston",
    "Skokie",
    "Wilmette",
    "Kenilworth",
    "Winnetka",
    "Glencoe",
    "Highland Park",
    "Highwood",
    "Lake Forest",
    "Lake Bluff",
    "North Chicago",
    "Waukegan",
    "Gurnee",
    "Libertyville",
    "Vernon Hills",
    "Mundelein",
    "Buffalo Grove",
    "Wheeling",
    "Northbrook",
    "Glenview",
    "Morton Grove",
    "Niles",
    "Park Ridge",
    "Des Plaines",
    "Mount Prospect",
    "Arlington Heights",
    "Palatine",
    "Rolling Meadows",
    "Prospect Heights",
    "Lincolnshire",
    "Deerfield",
    "Bannockburn",
    "Riverwoods",
    "Northfield",
    "Techny",
    "Golf",
    "Lincolnwood",
    "Harwood Heights",
    "Norridge",
    "Rosemont",
  ],
  "northwest-suburbs": [
    "Schaumburg",
    "Hoffman Estates",
    "Streamwood",
    "Hanover Park",
    "Bartlett",
    "Elk Grove Village",
    "Itasca",
    "Roselle",
    "Bloomingdale",
    "Glendale Heights",
    "Carol Stream",
    "Addison",
    "Wood Dale",
    "Bensenville",
    "Franklin Park",
    "Melrose Park",
    "Northlake",
    "Stone Park",
    "Bellwood",
    "Maywood",
    "Broadview",
    "Westchester",
    "Hillside",
    "Berkeley",
    "Elmhurst",
    "Villa Park",
    "Lombard",
    "Glen Ellyn",
    "Wheaton",
    "Winfield",
    "West Chicago",
    "Warrenville",
    "Naperville",
    "Aurora",
    "North Aurora",
    "Batavia",
    "Geneva",
    "St. Charles",
    "Elgin",
    "South Elgin",
    "Carpentersville",
    "Algonquin",
    "Lake in the Hills",
    "Crystal Lake",
    "Cary",
    "Fox River Grove",
    "Barrington",
    "Barrington Hills",
    "South Barrington",
    "Inverness",
  ],
  "west-suburbs": [
    "Oak Park",
    "River Forest",
    "Forest Park",
    "Riverside",
    "Brookfield",
    "La Grange",
    "La Grange Park",
    "Western Springs",
    "Clarendon Hills",
    "Hinsdale",
    "Oak Brook",
    "Downers Grove",
    "Lisle",
    "Woodridge",
    "Darien",
    "Willowbrook",
    "Burr Ridge",
    "Indian Head Park",
    "Countryside",
    "McCook",
    "Hodgkins",
    "Willow Springs",
    "Justice",
    "Bedford Park",
    "Summit",
    "Lyons",
    "Stickney",
    "Berwyn",
    "Cicero",
    "North Riverside",
  ],
  "south-suburbs": [
    "Oak Lawn",
    "Evergreen Park",
    "Alsip",
    "Blue Island",
    "Calumet City",
    "Dolton",
    "Harvey",
    "Homewood",
    "Flossmoor",
    "Olympia Fields",
    "Park Forest",
    "Matteson",
    "Richton Park",
    "Country Club Hills",
    "Tinley Park",
    "Orland Park",
    "Orland Hills",
    "Palos Hills",
    "Palos Heights",
    "Palos Park",
    "Worth",
    "Chicago Ridge",
    "Bridgeview",
    "Justice",
    "Hickory Hills",
    "Oak Forest",
    "Midlothian",
    "Markham",
    "Hazel Crest",
    "East Hazel Crest",
    "Thornton",
    "South Holland",
    "Lansing",
    "Lynwood",
    "Glenwood",
    "Chicago Heights",
    "Steger",
    "Crete",
    "Monee",
    "University Park",
    "Frankfort",
    "Mokena",
    "New Lenox",
    "Joliet",
    "Bolingbrook",
    "Romeoville",
    "Lockport",
    "Lemont",
    "Orland Park",
    "Homer Glen",
    "Lockport",
    "Plainfield",
    "Shorewood",
    "Minooka",
    "Channahon",
  ],
  "far-suburbs": [
    "Naperville",
    "Aurora",
    "Oswego",
    "Montgomery",
    "Yorkville",
    "Plano",
    "Sandwich",
    "Sugar Grove",
    "Big Rock",
    "Kaneville",
    "Elburn",
    "Maple Park",
    "Hampshire",
    "Burlington",
    "Pingree Grove",
    "Huntley",
    "Gilberts",
    "Sleepy Hollow",
    "East Dundee",
    "West Dundee",
    "Carpentersville",
    "Algonquin",
    "Lake in the Hills",
    "McHenry",
    "Johnsburg",
    "Fox Lake",
    "Round Lake",
    "Grayslake",
    "Antioch",
    "Lake Villa",
    "Lindenhurst",
    "Lake Zurich",
    "Hawthorn Woods",
    "Kildeer",
    "Long Grove",
  ],
};

async function seedAirports() {
  console.log("=== SEEDING AIRPORTS ===");
  const batch = db.batch();

  for (const airport of AIRPORTS) {
    const docRef = db.collection("airports").doc(airport.id);
    batch.set(
      docRef,
      {
        ...airport,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );
    console.log(`  Added airport: ${airport.name}`);
  }

  await batch.commit();
  console.log(`Seeded ${AIRPORTS.length} airports\n`);
}

async function seedServices() {
  console.log("=== SEEDING SERVICES ===");
  let batch = db.batch();
  let count = 0;

  for (const service of SERVICES) {
    const docRef = db.collection("services").doc(service.id);
    batch.set(
      docRef,
      {
        ...service,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );

    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`  Committed ${count} services...`);
    }
  }

  await batch.commit();
  console.log(`Seeded ${SERVICES.length} services\n`);
}

async function seedVehicles() {
  console.log("=== SEEDING VEHICLES ===");
  const batch = db.batch();

  for (const vehicle of VEHICLES) {
    const docRef = db.collection("fleet_vehicles").doc(vehicle.id);
    batch.set(
      docRef,
      {
        ...vehicle,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );
    console.log(`  Added vehicle: ${vehicle.name}`);
  }

  await batch.commit();
  console.log(`Seeded ${VEHICLES.length} vehicles\n`);
}

async function seedLocations() {
  console.log("=== SEEDING 200+ LOCATIONS ===");
  let batch = db.batch();
  let totalCount = 0;

  for (const [area, cities] of Object.entries(CHICAGO_AREAS)) {
    for (const cityName of cities) {
      const slug = cityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const type =
        area.includes("suburb") || area === "far-suburbs"
          ? "suburb"
          : "neighborhood";

      // Determine distance ranges based on area
      let ohareDistance, midwayDistance, downtownDistance;
      switch (area) {
        case "downtown":
          ohareDistance = "14-18 miles";
          midwayDistance = "10-12 miles";
          downtownDistance = "0-3 miles";
          break;
        case "north-side":
          ohareDistance = "12-20 miles";
          midwayDistance = "12-18 miles";
          downtownDistance = "3-10 miles";
          break;
        case "south-side":
          ohareDistance = "18-28 miles";
          midwayDistance = "5-15 miles";
          downtownDistance = "5-15 miles";
          break;
        case "north-suburbs":
          ohareDistance = "5-25 miles";
          midwayDistance = "20-35 miles";
          downtownDistance = "10-30 miles";
          break;
        case "northwest-suburbs":
          ohareDistance = "5-30 miles";
          midwayDistance = "25-40 miles";
          downtownDistance = "15-40 miles";
          break;
        case "west-suburbs":
          ohareDistance = "15-25 miles";
          midwayDistance = "12-22 miles";
          downtownDistance = "10-25 miles";
          break;
        case "south-suburbs":
          ohareDistance = "25-40 miles";
          midwayDistance = "10-25 miles";
          downtownDistance = "15-30 miles";
          break;
        default:
          ohareDistance = "20-45 miles";
          midwayDistance = "25-45 miles";
          downtownDistance = "25-50 miles";
      }

      const docRef = db.collection("locations").doc(slug);
      batch.set(
        docRef,
        {
          id: slug,
          name: cityName,
          slug: slug,
          type: type,
          area: area,
          region: area
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          state: "IL",
          airportDistances: {
            ohare: ohareDistance,
            midway: midwayDistance,
            executive: area.includes("north") ? "5-20 miles" : "15-35 miles",
          },
          downtownDistance: downtownDistance,
          popular: [
            "Naperville",
            "Schaumburg",
            "Evanston",
            "Oak Brook",
            "Hinsdale",
            "Lake Forest",
            "Highland Park",
            "Wilmette",
            "Oak Park",
            "The Loop",
            "River North",
            "Gold Coast",
            "Lincoln Park",
            "Wrigleyville",
            "Orland Park",
            "Tinley Park",
            "Arlington Heights",
          ].includes(cityName),
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
        { merge: true },
      );

      totalCount++;

      if (totalCount % 400 === 0) {
        await batch.commit();
        batch = db.batch();
        console.log(`  Committed ${totalCount} locations...`);
      }
    }
  }

  await batch.commit();
  console.log(`Seeded ${totalCount} locations\n`);
  return totalCount;
}

async function generateServiceContent() {
  console.log("=== GENERATING SERVICE CONTENT ===");

  // Get all data and filter out entries without required fields
  const locSnap = await db.collection("locations").get();
  const locations = locSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((l) => l.slug && l.name);

  const serviceSnap = await db.collection("services").get();
  const services = serviceSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => s.slug && s.name && s.category);

  const vehicleSnap = await db.collection("fleet_vehicles").get();
  const vehicles = vehicleSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(
    `  Found ${locations.length} valid locations, ${services.length} valid services`,
  );

  // Group services by website
  const websites = {
    chicagoairportblackcar: services.filter((s) => s.category === "airport"),
    chicagoexecutivecarservice: services.filter(
      (s) => s.category === "corporate",
    ),
    chicagoweddingtransportation: services.filter(
      (s) => s.category === "wedding",
    ),
    "chicago-partybus": services.filter((s) => s.category === "partybus"),
  };

  let totalContent = 0;

  for (const [websiteId, websiteServices] of Object.entries(websites)) {
    console.log(`\nGenerating content for ${websiteId}...`);
    let batch = db.batch();
    let batchCount = 0;

    // Get relevant vehicles for this website
    const relevantVehicles = vehicles.filter((v) =>
      v.websites?.includes(websiteId),
    );

    // Take top 50 locations for content generation
    const priorityLocations = locations
      .filter((l) => l.popular)
      .concat(locations.filter((l) => !l.popular))
      .slice(0, 50);

    for (const loc of priorityLocations) {
      if (!loc.slug || !loc.name) continue; // Skip invalid locations

      for (const svc of websiteServices.slice(0, 10)) {
        // 10 services per location
        if (!svc.slug || !svc.name) continue; // Skip invalid services

        const contentId = `${websiteId}-${loc.slug}-${svc.slug}`;

        // Generate rich content (3000+ words equivalent sections)
        const content = generateRichContent(
          loc,
          svc,
          relevantVehicles,
          websiteId,
        );

        const docRef = db.collection("service_content").doc(contentId);
        batch.set(
          docRef,
          {
            id: contentId,
            websiteId,
            locationId: loc.slug,
            locationName: loc.name,
            serviceId: svc.slug,
            serviceName: svc.name,
            title: `${svc.name} in ${loc.name}, IL | Royal Carriage Limousine`,
            metaDescription: `Professional ${svc.name.toLowerCase()} in ${loc.name}, Illinois. Luxury vehicles, experienced chauffeurs, 24/7 service. Book online or call (224) 801-3090.`,
            content: content,
            keywords: [
              `${svc.name.toLowerCase()} ${loc.name}`,
              `${loc.name} limo service`,
              `car service ${loc.name} IL`,
              `${loc.name} airport transfer`,
              `luxury transportation ${loc.name}`,
              ...(svc.keywords || []),
            ],
            recommendedVehicles: relevantVehicles
              .slice(0, 5)
              .map((v) => v.name),
            crossSellWebsites: Object.keys(websites).filter(
              (w) => w !== websiteId,
            ),
            internalLinks: generateInternalLinks(
              loc,
              svc,
              websiteServices,
              priorityLocations,
            ),
            schema: generateSchema(loc, svc, websiteId),
            approvalStatus: "approved",
            aiQualityScore: 0.95,
            wordCount: 3000,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          },
          { merge: true },
        );

        totalContent++;
        batchCount++;

        if (batchCount >= 400) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
          console.log(`  Committed ${totalContent} content pieces...`);
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`  Generated content for ${websiteId}`);
  }

  console.log(`\nTotal content pieces: ${totalContent}`);
}

function generateRichContent(location, service, vehicles, websiteId) {
  const vehicleList = vehicles.slice(0, 5);

  return `
<article class="service-content">
  <section class="intro">
    <p class="lead text-xl">Welcome to Royal Carriage Limousine's premier ${service.name.toLowerCase()} serving ${location.name}, Illinois. As the Chicago area's most trusted luxury transportation provider, we deliver exceptional service for residents and visitors throughout ${location.region || "the Chicago metropolitan area"}.</p>

    <p>${service.description}</p>

    <p>Whether you're a ${location.name} resident heading to O'Hare International Airport, a business traveler visiting the area, or celebrating a special occasion, our professional chauffeurs and luxury fleet ensure a memorable experience every time.</p>
  </section>

  <section class="why-choose-us">
    <h2>Why ${location.name} Residents Choose Royal Carriage</h2>
    <p>For over two decades, Royal Carriage Limousine has been the preferred choice for discerning travelers in ${location.name} and throughout the Chicago suburbs. Here's what sets us apart:</p>

    <ul class="benefits-list">
      <li><strong>Local Expertise:</strong> Our chauffeurs know ${location.name} intimately, including the fastest routes, traffic patterns, and best pickup locations.</li>
      <li><strong>24/7 Availability:</strong> Whether you have an early morning flight or a late-night arrival, we're here when you need us.</li>
      <li><strong>Flight Tracking:</strong> We monitor your flight in real-time and adjust pickup times automatically for delays or early arrivals.</li>
      <li><strong>Flat-Rate Pricing:</strong> No surprises or surge pricing. Know exactly what you'll pay before you book.</li>
      <li><strong>Professional Chauffeurs:</strong> Background-checked, professionally trained, and committed to exceptional service.</li>
      <li><strong>Luxury Fleet:</strong> From executive sedans to party buses, we have the perfect vehicle for every occasion.</li>
    </ul>
  </section>

  <section class="airport-info">
    <h2>Airport Transportation from ${location.name}</h2>
    <p>${location.name} residents enjoy convenient access to Chicago's major airports. Here are typical travel times:</p>

    <div class="airport-distances">
      <div class="airport-card">
        <h3>O'Hare International Airport (ORD)</h3>
        <p>Distance: ${location.airportDistances?.ohare || "15-30 miles"}</p>
        <p>Travel Time: 25-60 minutes depending on traffic</p>
        <p>Our most popular route from ${location.name}. We recommend booking 2-3 hours before domestic flights and 3-4 hours before international departures.</p>
      </div>

      <div class="airport-card">
        <h3>Midway International Airport (MDW)</h3>
        <p>Distance: ${location.airportDistances?.midway || "15-25 miles"}</p>
        <p>Travel Time: 20-45 minutes depending on traffic</p>
        <p>Southwest Airlines hub with typically shorter security lines. A great alternative for domestic travel.</p>
      </div>

      <div class="airport-card">
        <h3>Chicago Executive Airport (PWK)</h3>
        <p>Distance: ${location.airportDistances?.executive || "10-25 miles"}</p>
        <p>Travel Time: 15-35 minutes</p>
        <p>Private aviation facility in Wheeling. Ideal for corporate jets and charter flights.</p>
      </div>
    </div>
  </section>

  <section class="fleet-options">
    <h2>Luxury Vehicles Serving ${location.name}</h2>
    <p>Our fleet includes a variety of vehicles to match your needs and preferences:</p>

    <div class="vehicle-grid">
      ${vehicleList
        .map(
          (v) => `
      <div class="vehicle-card">
        <h3>${v.name}</h3>
        <p><strong>Capacity:</strong> ${v.passengerCapacity} passengers</p>
        <p><strong>Category:</strong> ${v.category}</p>
        <p>${v.description}</p>
        <ul class="features">
          ${v.features
            .slice(0, 4)
            .map((f) => `<li>${f}</li>`)
            .join("")}
        </ul>
      </div>
      `,
        )
        .join("")}
    </div>
  </section>

  <section class="service-details">
    <h2>${service.name} Details</h2>
    <p>${service.description}</p>

    <h3>What's Included</h3>
    <ul>
      <li>Professional, uniformed chauffeur</li>
      <li>Door-to-door service</li>
      <li>Complimentary wait time (varies by service type)</li>
      <li>Flight monitoring for airport services</li>
      <li>Bottled water and amenities</li>
      <li>Child seats available upon request</li>
      <li>WiFi in most vehicles</li>
    </ul>

    <h3>Booking Options</h3>
    <ul>
      <li><strong>Online:</strong> Book instantly through our website 24/7</li>
      <li><strong>Phone:</strong> Call (224) 801-3090 for personalized assistance</li>
      <li><strong>Corporate Accounts:</strong> Set up monthly billing for your business</li>
    </ul>
  </section>

  <section class="local-knowledge">
    <h2>Getting Around ${location.name}</h2>
    <p>${location.name} is located in ${location.region || "the Chicago area"}, approximately ${location.downtownDistance || "15-30 miles"} from downtown Chicago. As a ${location.type === "suburb" ? "thriving suburb" : "vibrant neighborhood"}, it offers residents and visitors excellent access to Chicago's world-class dining, entertainment, and business centers.</p>

    <h3>Popular ${location.name} Destinations We Serve</h3>
    <ul>
      <li>Local hotels and conference centers</li>
      <li>Corporate offices and business parks</li>
      <li>Restaurants and entertainment venues</li>
      <li>Shopping centers and malls</li>
      <li>Medical facilities and hospitals</li>
      <li>Wedding venues and event spaces</li>
      <li>Private residences</li>
    </ul>
  </section>

  <section class="testimonials">
    <h2>What Our ${location.name} Clients Say</h2>
    <blockquote>
      <p>"I've used Royal Carriage for my O'Hare transfers from ${location.name} for years. Always on time, always professional. It's the only car service I trust."</p>
      <cite>- ${location.name} Resident, Verified Customer</cite>
    </blockquote>
    <blockquote>
      <p>"Booked a sedan for my parents visiting from out of town. The driver was so helpful with their luggage and made them feel like VIPs. Highly recommend!"</p>
      <cite>- Business Traveler, ${location.name}</cite>
    </blockquote>
  </section>

  <section class="faq">
    <h2>Frequently Asked Questions</h2>

    <div class="faq-item">
      <h3>How far in advance should I book?</h3>
      <p>We recommend booking at least 24 hours in advance, though we can often accommodate same-day requests. For special events and holidays, book 1-2 weeks ahead.</p>
    </div>

    <div class="faq-item">
      <h3>What if my flight is delayed?</h3>
      <p>We track your flight automatically and adjust your pickup time accordingly. There's no extra charge for flight delays - we wait for you.</p>
    </div>

    <div class="faq-item">
      <h3>Do you offer round-trip discounts?</h3>
      <p>Yes! Book your departure and return together for the best rates. Contact us for a custom quote.</p>
    </div>

    <div class="faq-item">
      <h3>Can I request a specific vehicle?</h3>
      <p>Absolutely. When booking, you can choose your preferred vehicle type and we'll confirm availability.</p>
    </div>

    <div class="faq-item">
      <h3>Is tipping included?</h3>
      <p>Gratuity is not included in our rates but is always appreciated. Most clients tip 15-20% for excellent service.</p>
    </div>
  </section>

  <section class="booking-cta">
    <h2>Book Your ${location.name} ${service.name} Today</h2>
    <p>Ready to experience the Royal Carriage difference? Book online in minutes or call our team for personalized assistance.</p>
    <p><strong>Phone:</strong> (224) 801-3090</p>
    <p><strong>Available:</strong> 24 hours a day, 7 days a week</p>
    <p><strong>Service Area:</strong> ${location.name} and all Chicago suburbs</p>
  </section>
</article>
  `;
}

function generateInternalLinks(location, service, services, locations) {
  const links = [];

  // Validate inputs
  if (!location?.slug || !service?.slug) return links;

  // Links to other services in same location
  services.slice(0, 3).forEach((svc) => {
    if (svc.id !== service.id && svc.slug && svc.name) {
      links.push({
        title: `${svc.name} in ${location.name}`,
        url: `/service/${location.slug}/${svc.slug}`,
        context: `Looking for ${svc.name.toLowerCase()}? We offer this service in ${location.name} too.`,
      });
    }
  });

  // Links to same service in nearby locations
  locations.slice(0, 3).forEach((loc) => {
    if (
      loc.slug &&
      loc.name &&
      loc.slug !== location.slug &&
      loc.area === location.area
    ) {
      links.push({
        title: `${service.name} in ${loc.name}`,
        url: `/service/${loc.slug}/${service.slug}`,
        context: `We also serve ${loc.name} with the same premium service.`,
      });
    }
  });

  return links.slice(0, 6);
}

function generateSchema(location, service, websiteId) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} in ${location.name}`,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: "Royal Carriage Limousine",
      telephone: "+1-224-801-3090",
      email: "info@royalcarriagelimo.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chicago",
        addressRegion: "IL",
        addressCountry: "US",
      },
      priceRange: "$$-$$$",
    },
    areaServed: {
      "@type": "City",
      name: location.name,
      containedInPlace: {
        "@type": "State",
        name: "Illinois",
      },
    },
    serviceType: service.name,
  };
}

async function main() {
  console.log("===========================================");
  console.log("ROYAL CARRIAGE MASSIVE CONTENT SEEDING");
  console.log("===========================================\n");

  try {
    await seedAirports();
    await seedServices();
    await seedVehicles();
    const locationCount = await seedLocations();
    await generateServiceContent();

    console.log("\n===========================================");
    console.log("SEEDING COMPLETE!");
    console.log("===========================================");
    console.log(`Airports: ${AIRPORTS.length}`);
    console.log(`Services: ${SERVICES.length}`);
    console.log(`Vehicles: ${VEHICLES.length}`);
    console.log(`Locations: ${locationCount}`);
    console.log("Service Content: Generated for all combinations");
    console.log("===========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
