/**
 * Service Expansion Script
 * Expands services from 20 to 91 total (20 per website + 11 cross-site)
 * Based on ENTERPRISE_DASHBOARD_IMPLEMENTATION_PLAN.md
 */

import * as admin from 'firebase-admin';

export interface ServiceData {
  id: string;
  name: string;
  website: 'airport' | 'corporate' | 'wedding' | 'partyBus';
  category: string;
  description: string;
  longDescription: string;
  applicableVehicles: string[];
  applicableLocations: 'all' | string[];
  pricing: {
    baseRate: number;
    hourlyRate?: number;
    additionalInfo?: string;
  };
  seoKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedServices: string[];
  searchVolume?: number;
  difficulty?: string;
}

// AIRPORT WEBSITE SERVICES (20 services)
export const AIRPORT_SERVICES: ServiceData[] = [
  {
    id: 'ohare-airport-transfers',
    name: "O'Hare Airport Transfers",
    website: 'airport',
    category: 'Airport Transfer',
    description: 'Professional ground transportation to and from Chicago O\'Hare International Airport with flight tracking and meet-and-greet service.',
    longDescription: 'Experience seamless travel with our premier O\'Hare Airport transfer service. We monitor your flight in real-time, ensuring punctual pickups regardless of delays. Our professional chauffeurs provide meet-and-greet service at baggage claim, assist with luggage, and deliver you to your destination in comfort and style.',
    applicableVehicles: ['sedan', 'suv', 'sprinter', 'executive-van'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 95,
      additionalInfo: 'Pricing varies by distance and vehicle type'
    },
    seoKeywords: ['ohare airport limo', 'ord transfer', 'chicago airport car service', 'ohare limousine', 'airport transportation chicago'],
    faqs: [
      {
        question: 'How early should I book my O\'Hare airport transfer?',
        answer: 'We recommend booking at least 24 hours in advance, though we can accommodate last-minute requests based on availability.'
      },
      {
        question: 'Do you track flight delays?',
        answer: 'Yes, we monitor all flights in real-time and adjust pickup times automatically for delays or early arrivals.'
      }
    ],
    relatedServices: ['midway-airport-transfers', 'airport-to-hotel', 'corporate-airport-transfer'],
    searchVolume: 8500,
    difficulty: 'high'
  },
  {
    id: 'midway-airport-transfers',
    name: 'Midway Airport Transfers',
    website: 'airport',
    category: 'Airport Transfer',
    description: 'Fast and reliable transportation service to and from Chicago Midway International Airport with express routing to downtown and suburbs.',
    longDescription: 'Chicago Midway Airport transfers designed for efficiency and comfort. Our drivers know the fastest routes to avoid traffic, ensuring you arrive on time. Perfect for business travelers and families alike, with flexible vehicle options to accommodate any group size.',
    applicableVehicles: ['sedan', 'suv', 'sprinter'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 75,
      additionalInfo: 'Lower rates for southern suburbs'
    },
    seoKeywords: ['midway airport limo', 'mdw transfer', 'midway car service', 'chicago midway transportation'],
    faqs: [
      {
        question: 'Is Midway Airport closer to downtown than O\'Hare?',
        answer: 'Yes, Midway is typically 20-30 minutes from downtown Chicago, making it a convenient option for Loop destinations.'
      }
    ],
    relatedServices: ['ohare-airport-transfers', 'airport-to-downtown-hotel'],
    searchVolume: 5200,
    difficulty: 'medium'
  },
  {
    id: 'chicago-exec-airport-transfers',
    name: 'Chicago Exec Airport Transfers',
    website: 'airport',
    category: 'Airport Transfer',
    description: 'Premium VIP service for private jet passengers at Chicago Executive Airport with white-glove concierge treatment.',
    longDescription: 'Catering to discerning private aviation travelers, our Chicago Executive Airport service delivers unparalleled luxury and discretion. From tarmac pickup to your final destination, experience the pinnacle of ground transportation.',
    applicableVehicles: ['luxury-sedan', 'luxury-suv', 'executive-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 175,
      additionalInfo: 'Premium vehicles and VIP treatment included'
    },
    seoKeywords: ['chicago executive airport', 'private jet transfer', 'vip airport service', 'executive aviation ground transport'],
    faqs: [
      {
        question: 'Can you coordinate with my flight crew?',
        answer: 'Absolutely. We work directly with FBOs and flight crews to ensure seamless coordination.'
      }
    ],
    relatedServices: ['executive-airport-transfer', 'vip-corporate-travel'],
    searchVolume: 1200,
    difficulty: 'low'
  },
  {
    id: 'suburban-airport-pickups',
    name: 'Suburban Airport Pickups',
    website: 'airport',
    category: 'Airport Transfer',
    description: 'Specialized service for suburban residents traveling to Gary, Milwaukee, and South Bend airports with regional expertise.',
    longDescription: 'Serving Chicago suburban communities with connections to multiple regional airports. We understand the unique needs of suburban travelers and provide reliable, cost-effective transportation solutions.',
    applicableVehicles: ['suv', 'sprinter', 'executive-van'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 120,
      hourlyRate: 85,
      additionalInfo: 'Regional airport access'
    },
    seoKeywords: ['suburban airport service', 'gary airport transfer', 'milwaukee airport limo', 'regional airport transportation'],
    faqs: [
      {
        question: 'Which airports do you serve besides O\'Hare and Midway?',
        answer: 'We provide service to Gary/Chicago International, Milwaukee Mitchell, and South Bend International airports.'
      }
    ],
    relatedServices: ['group-airport-shuttle', 'family-airport-pickups'],
    searchVolume: 2100,
    difficulty: 'medium'
  },
  {
    id: 'airport-to-downtown-hotel',
    name: 'Airport to Downtown Hotel',
    website: 'airport',
    category: 'Airport + Hotel',
    description: 'Direct transportation from airports to downtown Chicago hotels in Loop, River North, and Michigan Avenue areas.',
    longDescription: 'Seamless airport-to-hotel transfers serving all major downtown Chicago hotels. Our drivers know every hotel entrance, valet procedure, and check-in process to ensure a smooth arrival experience.',
    applicableVehicles: ['sedan', 'suv', 'luxury-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 85,
      additionalInfo: 'Flat rates to major hotel districts'
    },
    seoKeywords: ['airport to hotel chicago', 'downtown hotel transfer', 'airport hotel shuttle', 'chicago hotel transportation'],
    faqs: [
      {
        question: 'Do you drop off directly at the hotel entrance?',
        answer: 'Yes, we coordinate with hotel valets and staff to ensure curbside drop-off at the main entrance.'
      }
    ],
    relatedServices: ['ohare-airport-transfers', 'airport-to-suburban-hotel'],
    searchVolume: 4200,
    difficulty: 'high'
  },
  {
    id: 'airport-to-suburban-hotel',
    name: 'Airport to Suburban Hotel',
    website: 'airport',
    category: 'Airport + Hotel',
    description: 'Reliable airport transfers to suburban hotels in Naperville, Schaumburg, Oak Brook, and surrounding areas.',
    longDescription: 'Specialized in suburban hotel connections from both O\'Hare and Midway. Perfect for business travelers visiting corporate headquarters or tourists exploring Chicago\'s suburban attractions.',
    applicableVehicles: ['sedan', 'suv', 'sprinter'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 95,
      additionalInfo: 'Distance-based pricing'
    },
    seoKeywords: ['suburban hotel transfer', 'naperville hotel airport service', 'schaumburg airport limo', 'oak brook hotel transportation'],
    faqs: [
      {
        question: 'How far in advance should I book for suburban hotels?',
        answer: 'We recommend 24-48 hours notice for suburban destinations to ensure optimal routing and availability.'
      }
    ],
    relatedServices: ['airport-to-downtown-hotel', 'corporate-hotel-transfer'],
    searchVolume: 3100,
    difficulty: 'medium'
  },
  {
    id: 'airport-to-business-meeting',
    name: 'Airport to Business Meeting',
    website: 'airport',
    category: 'Airport + Activity',
    description: 'Executive airport pickup with direct transport to your business meeting, complete with Wi-Fi and charging stations.',
    longDescription: 'Time-sensitive business travel requires precision. Our airport-to-meeting service includes productivity-enabled vehicles with Wi-Fi, power outlets, and a quiet environment to prepare for your meeting en route.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 125,
      additionalInfo: 'Premium vehicles with business amenities'
    },
    seoKeywords: ['airport to meeting', 'business travel chicago', 'executive airport service', 'corporate ground transportation'],
    faqs: [
      {
        question: 'Can I work during the ride?',
        answer: 'Yes, all our executive vehicles feature Wi-Fi, charging ports, and privacy partitions for confidential work.'
      }
    ],
    relatedServices: ['executive-airport-transfer', 'corporate-meeting-transport'],
    searchVolume: 2800,
    difficulty: 'medium'
  },
  {
    id: 'airport-to-event-conference',
    name: 'Airport to Event/Conference',
    website: 'airport',
    category: 'Airport + Activity',
    description: 'Specialized transportation from airports to McCormick Place, Navy Pier, and major Chicago event venues.',
    longDescription: 'Conference and event attendees deserve reliable transportation. We specialize in moving groups to major Chicago venues, coordinating multiple vehicles when needed, and ensuring on-time arrivals for opening sessions.',
    applicableVehicles: ['sedan', 'suv', 'sprinter', 'coach'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 95,
      hourlyRate: 85,
      additionalInfo: 'Group rates available'
    },
    seoKeywords: ['airport to mccormick place', 'conference transportation', 'event shuttle chicago', 'convention center transfer'],
    faqs: [
      {
        question: 'Can you handle large groups for conferences?',
        answer: 'Yes, we coordinate multi-vehicle logistics for groups of any size, from small teams to full conference delegations.'
      }
    ],
    relatedServices: ['corporate-conference-transport', 'group-airport-shuttle'],
    searchVolume: 3400,
    difficulty: 'medium'
  },
  {
    id: 'airport-to-dining',
    name: 'Airport to Dining Experience',
    website: 'airport',
    category: 'Airport + Activity',
    description: 'Arrive in style at Chicago\'s finest restaurants with direct airport-to-dining transportation service.',
    longDescription: 'Transform your arrival into the start of a memorable dining experience. Perfect for special occasions, client dinners, or celebrating with loved ones immediately upon arrival in Chicago.',
    applicableVehicles: ['luxury-sedan', 'suv', 'stretch-limo'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 110,
      additionalInfo: 'Restaurant recommendations available'
    },
    seoKeywords: ['airport to restaurant', 'dining transportation chicago', 'special occasion transfer', 'luxury restaurant service'],
    faqs: [
      {
        question: 'Can you recommend restaurants?',
        answer: 'Absolutely. Our chauffeurs know Chicago\'s finest dining establishments and can provide recommendations based on your preferences.'
      }
    ],
    relatedServices: ['special-occasion-transport', 'client-entertainment'],
    searchVolume: 1500,
    difficulty: 'low'
  },
  {
    id: 'corporate-group-airport',
    name: 'Corporate Group Airport Transfers',
    website: 'airport',
    category: 'Group Travel',
    description: 'Coordinated multi-vehicle airport transportation for corporate teams and business delegations of 4-50+ passengers.',
    longDescription: 'Enterprise-level airport logistics for corporate groups. We coordinate multiple vehicles, track all flight arrivals, and ensure your entire team arrives together at your destination.',
    applicableVehicles: ['sprinter', 'executive-van', 'coach', 'multiple-sedans'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      hourlyRate: 150,
      additionalInfo: 'Volume discounts for large groups'
    },
    seoKeywords: ['corporate group transfer', 'business team transport', 'executive shuttle service', 'company airport service'],
    faqs: [
      {
        question: 'How do you coordinate multiple arrivals?',
        answer: 'We assign a dedicated coordinator who tracks all flights and dispatches vehicles to meet each arrival, then coordinates reunion at your destination.'
      }
    ],
    relatedServices: ['corporate-conference-transport', 'executive-team-travel'],
    searchVolume: 2600,
    difficulty: 'medium'
  },
  {
    id: 'wedding-group-airport',
    name: 'Wedding Group Airport Shuttle',
    website: 'airport',
    category: 'Group Travel',
    description: 'Wedding guest airport shuttle service from O\'Hare and Midway to hotels and wedding venues throughout Chicago.',
    longDescription: 'Make your guests\' arrival seamless with dedicated wedding airport shuttles. We coordinate all guest arrivals, provide welcome service, and transport groups to hotels or directly to wedding events.',
    applicableVehicles: ['sprinter', 'executive-van', 'coach', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      additionalInfo: 'Multi-day packages available'
    },
    seoKeywords: ['wedding airport shuttle', 'guest transportation', 'destination wedding transfer', 'wedding party airport service'],
    faqs: [
      {
        question: 'Can you accommodate out-of-town guests arriving at different times?',
        answer: 'Yes, we create custom pickup schedules to accommodate staggered arrivals throughout the day.'
      }
    ],
    relatedServices: ['wedding-guest-transportation', 'multi-venue-wedding-transport'],
    searchVolume: 2200,
    difficulty: 'medium'
  },
  {
    id: 'family-large-group-airport',
    name: 'Family/Large Group Airport Pickups',
    website: 'airport',
    category: 'Group Travel',
    description: 'Spacious vehicle solutions for families and large groups with luggage, coordinating multiple vehicles when needed.',
    longDescription: 'Family reunions, group vacations, and extended family travel require special attention. We provide ample luggage capacity, comfortable seating for all ages, and coordinate multiple vehicles for larger groups.',
    applicableVehicles: ['suv', 'sprinter', 'executive-van', 'multiple-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'Based on group size and luggage requirements'
    },
    seoKeywords: ['family airport shuttle', 'large group transfer', 'vacation transportation', 'family reunion transport'],
    faqs: [
      {
        question: 'Can you fit car seats for young children?',
        answer: 'Yes, please specify the number and type of car seats needed when booking, and we\'ll ensure they\'re properly installed.'
      }
    ],
    relatedServices: ['group-airport-shuttle', 'vacation-transport-package'],
    searchVolume: 3800,
    difficulty: 'high'
  },
  {
    id: 'meet-greet-luggage',
    name: 'Meet & Greet + Luggage Assistance',
    website: 'airport',
    category: 'VIP Service',
    description: 'Premium airport concierge service with baggage claim assistance, cart service, and VIP escort to your vehicle.',
    longDescription: 'White-glove airport arrival experience. Your chauffeur meets you at the gate or baggage claim, assists with luggage retrieval, and escorts you to your luxury vehicle for a stress-free departure.',
    applicableVehicles: ['luxury-sedan', 'executive-sedan', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'VIP service premium included'
    },
    seoKeywords: ['meet and greet service', 'vip airport service', 'luggage assistance', 'concierge airport transfer'],
    faqs: [
      {
        question: 'Where exactly will the driver meet me?',
        answer: 'Your chauffeur will hold a name sign at baggage claim or, for international arrivals, just past customs.'
      }
    ],
    relatedServices: ['vip-airport-service', 'international-arrivals-service'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'airport-to-parking',
    name: 'Airport to Parking Facility',
    website: 'airport',
    category: 'Specialized Service',
    description: 'Park & fly service connecting you between long-term parking facilities and airport terminals.',
    longDescription: 'Save on airport parking with our park-and-fly shuttle service. We transport you and your luggage between economy parking lots and terminals, making extended travel more affordable.',
    applicableVehicles: ['shuttle-van', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 35,
      additionalInfo: 'Round-trip packages available'
    },
    seoKeywords: ['park and fly', 'airport parking shuttle', 'economy parking transfer', 'long term parking service'],
    faqs: [
      {
        question: 'Do you partner with specific parking facilities?',
        answer: 'Yes, we work with several reputable economy parking providers near both O\'Hare and Midway.'
      }
    ],
    relatedServices: ['airport-standby-service', 'frequent-flyer-program'],
    searchVolume: 2400,
    difficulty: 'medium'
  },
  {
    id: 'connecting-flight-coordination',
    name: 'Connecting Flight Coordination',
    website: 'airport',
    category: 'Specialized Service',
    description: 'Airport-to-airport transfer service for layovers, with precise timing coordination for connecting flights.',
    longDescription: 'Maximize your layover time with efficient ground transportation between airports. Perfect for split-ticket itineraries or business travelers with meetings between flights.',
    applicableVehicles: ['sedan', 'executive-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 140,
      additionalInfo: 'Express service with flight monitoring'
    },
    seoKeywords: ['connecting flight transfer', 'airport to airport', 'layover transportation', 'inter-airport shuttle'],
    faqs: [
      {
        question: 'What if my first flight is delayed?',
        answer: 'We monitor your inbound flight and adjust pickup timing. We also advise if your connection may be at risk.'
      }
    ],
    relatedServices: ['ohare-airport-transfers', 'midway-airport-transfers'],
    searchVolume: 1200,
    difficulty: 'low'
  },
  {
    id: 'airport-city-tour',
    name: 'Airport + City Tour Combination',
    website: 'airport',
    category: 'Extended Service',
    description: 'Airport pickup with guided Chicago city tour before hotel drop-off, perfect for first-time visitors.',
    longDescription: 'Transform your airport transfer into a memorable introduction to Chicago. Our driver-guides showcase iconic landmarks, share local history, and answer questions about the city before delivering you to your hotel.',
    applicableVehicles: ['suv', 'luxury-sedan', 'sprinter'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      hourlyRate: 95,
      additionalInfo: '3-hour tour package recommended'
    },
    seoKeywords: ['chicago city tour', 'airport tour package', 'sightseeing transfer', 'airport tour combo'],
    faqs: [
      {
        question: 'Can I customize which sites we visit?',
        answer: 'Absolutely. We offer standard routes but happily customize based on your interests and time constraints.'
      }
    ],
    relatedServices: ['sightseeing-tour-service', 'tourist-package'],
    searchVolume: 1600,
    difficulty: 'medium'
  },
  {
    id: 'all-day-airport-package',
    name: 'All-Day Airport Service Package',
    website: 'airport',
    category: 'Extended Service',
    description: 'Full-day transportation package including airport arrival, city activities, and return airport departure.',
    longDescription: 'Perfect for business travelers with same-day meetings or tourists with short layovers. Our all-day package provides a dedicated vehicle and driver for your entire stay, from arrival to departure.',
    applicableVehicles: ['sedan', 'executive-sedan', 'suv', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 800,
      additionalInfo: '10-12 hour package, dedicated vehicle'
    },
    seoKeywords: ['all day car service', 'dedicated driver', 'full day airport package', 'executive day service'],
    faqs: [
      {
        question: 'Is the vehicle and driver available the entire time?',
        answer: 'Yes, your dedicated vehicle and chauffeur remain at your disposal for the duration of your package.'
      }
    ],
    relatedServices: ['executive-day-package', 'corporate-hourly-service'],
    searchVolume: 900,
    difficulty: 'low'
  },
  {
    id: 'frequent-flyer-vip',
    name: 'Frequent Flyer VIP Program',
    website: 'airport',
    category: 'Extended Service',
    description: 'Membership program for regular travelers featuring priority booking, vehicle upgrades, and loyalty rewards.',
    longDescription: 'Designed for Chicago\'s frequent business travelers, our VIP program offers exclusive benefits including priority dispatch, complimentary upgrades, dedicated customer service, and volume discounts.',
    applicableVehicles: ['all-vehicles', 'priority-fleet'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 0,
      additionalInfo: 'Membership-based pricing with volume discounts'
    },
    seoKeywords: ['frequent flyer program', 'corporate travel membership', 'vip car service', 'executive travel program'],
    faqs: [
      {
        question: 'What are the membership requirements?',
        answer: 'Membership is complimentary for clients booking 10+ trips per year or $5,000+ in annual services.'
      }
    ],
    relatedServices: ['executive-commute-subscription', 'corporate-account-management'],
    searchVolume: 800,
    difficulty: 'low'
  },
  {
    id: 'airport-standby-waiting',
    name: 'Airport Standby/Waiting Service',
    website: 'airport',
    category: 'Specialized Service',
    description: 'Hourly rate service with driver waiting at airport for uncertain flight times or flexible scheduling needs.',
    longDescription: 'When flight times are uncertain or you need maximum flexibility, our standby service provides a dedicated vehicle and driver waiting at the airport, ready to depart whenever you arrive.',
    applicableVehicles: ['sedan', 'suv', 'luxury-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 80,
      hourlyRate: 60,
      additionalInfo: 'Hourly waiting fee plus transfer rate'
    },
    seoKeywords: ['airport standby service', 'waiting car service', 'flexible airport transfer', 'hourly airport service'],
    faqs: [
      {
        question: 'How long can the driver wait?',
        answer: 'We accommodate waiting times up to 4 hours. For longer waits, we recommend our on-call service.'
      }
    ],
    relatedServices: ['hourly-car-service', 'executive-on-demand'],
    searchVolume: 1100,
    difficulty: 'low'
  },
  {
    id: 'international-arrivals-service',
    name: 'International Arrivals Service',
    website: 'airport',
    category: 'VIP Service',
    description: 'Specialized service for international travelers with customs support, translation assistance, and extended waiting.',
    longDescription: 'Welcome international visitors with exceptional service. We understand customs procedures, provide extended waiting times, and offer translation assistance to ensure comfortable arrivals from abroad.',
    applicableVehicles: ['luxury-sedan', 'suv', 'sprinter'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 135,
      additionalInfo: 'Includes extended waiting time for customs'
    },
    seoKeywords: ['international arrivals', 'customs assistance', 'foreign visitor transport', 'international passenger service'],
    faqs: [
      {
        question: 'How long do you wait for international flights?',
        answer: 'We allow up to 90 minutes after landing for international customs processing at no additional charge.'
      }
    ],
    relatedServices: ['meet-greet-luggage', 'vip-airport-service'],
    searchVolume: 2000,
    difficulty: 'medium'
  }
];

// CORPORATE WEBSITE SERVICES (20 services)
export const CORPORATE_SERVICES: ServiceData[] = [
  {
    id: 'executive-airport-transfer',
    name: 'Executive Airport Transfer',
    website: 'corporate',
    category: 'Executive Transport',
    description: 'Premium airport transportation designed for corporate executives with productivity-enabled luxury vehicles.',
    longDescription: 'Our executive airport service caters specifically to C-suite and senior management. Featuring late-model luxury sedans with privacy partitions, Wi-Fi connectivity, and discreet professional chauffeurs who understand the demands of executive travel.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'Premium executive vehicles only'
    },
    seoKeywords: ['executive car service', 'corporate airport transfer', 'ceo transportation', 'luxury business travel'],
    faqs: [
      {
        question: 'Are your drivers trained in executive protocols?',
        answer: 'Yes, all our executive chauffeurs receive specialized training in corporate etiquette, confidentiality, and professional conduct.'
      }
    ],
    relatedServices: ['board-member-travel', 'executive-commute'],
    searchVolume: 4200,
    difficulty: 'high'
  },
  {
    id: 'daily-commute-service',
    name: 'Daily Commute Service',
    website: 'corporate',
    category: 'Executive Transport',
    description: 'Recurring subscription-based daily commute service for executives with consistent routes and dedicated vehicles.',
    longDescription: 'Transform your daily commute into productive time. Our subscription service provides the same professional driver, route consistency, and vehicle preferences daily, allowing you to work or relax during your commute.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 0,
      hourlyRate: 95,
      additionalInfo: 'Monthly subscription packages available'
    },
    seoKeywords: ['executive commute', 'daily car service', 'corporate commute', 'recurring transportation'],
    faqs: [
      {
        question: 'Can I have the same driver every day?',
        answer: 'Yes, we assign a primary driver to your account for consistency and familiarity.'
      }
    ],
    relatedServices: ['executive-airport-transfer', 'corporate-account-management'],
    searchVolume: 3600,
    difficulty: 'medium'
  },
  {
    id: 'corporate-meeting-transport',
    name: 'Corporate Meeting Transportation',
    website: 'corporate',
    category: 'Business Services',
    description: 'Professional ground transportation for business meetings with precise timing and downtown office expertise.',
    longDescription: 'Navigate Chicago\'s business district efficiently with drivers who know every office building, parking procedure, and optimal route. Arrive refreshed and on time for important meetings.',
    applicableVehicles: ['sedan', 'executive-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 120,
      hourlyRate: 85,
      additionalInfo: 'Multi-stop discounts available'
    },
    seoKeywords: ['business meeting transport', 'corporate car service', 'office transportation', 'professional driver service'],
    faqs: [
      {
        question: 'Can you wait between meetings?',
        answer: 'Yes, we offer hourly rates for vehicles to remain with you throughout your meeting schedule.'
      }
    ],
    relatedServices: ['executive-hourly-rental', 'client-meeting-transport'],
    searchVolume: 5100,
    difficulty: 'high'
  },
  {
    id: 'board-member-travel',
    name: 'Board Member Travel',
    website: 'corporate',
    category: 'Executive Transport',
    description: 'Discrete VIP transportation for board members and stakeholders with maximum confidentiality and luxury.',
    longDescription: 'Board-level travel demands the highest standards of discretion and luxury. Our service provides confidential transportation with NDAs available, experienced executive drivers, and vehicles that reflect your company\'s prestige.',
    applicableVehicles: ['luxury-sedan', 'executive-sedan', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      additionalInfo: 'Premium VIP service with confidentiality protocols'
    },
    seoKeywords: ['board member transportation', 'vip corporate travel', 'executive board service', 'confidential car service'],
    faqs: [
      {
        question: 'How do you ensure confidentiality?',
        answer: 'All drivers sign NDAs, and we maintain strict privacy protocols including no discussion of passengers or destinations.'
      }
    ],
    relatedServices: ['executive-airport-transfer', 'fortune-500-executive-service'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'client-entertainment',
    name: 'Client Entertainment',
    website: 'corporate',
    category: 'Business Services',
    description: 'Impressive luxury transportation for client entertainment, dining experiences, and business networking events.',
    longDescription: 'Make a lasting impression on important clients with sophisticated transportation. Perfect for theater outings, fine dining, sporting events, and entertainment experiences that strengthen business relationships.',
    applicableVehicles: ['luxury-sedan', 'luxury-suv', 'stretch-limo'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      hourlyRate: 120,
      additionalInfo: 'Evening packages available'
    },
    seoKeywords: ['client entertainment transport', 'business dining car service', 'corporate hospitality', 'luxury client travel'],
    faqs: [
      {
        question: 'Can you coordinate dinner reservations?',
        answer: 'While we focus on transportation, we can recommend restaurants and work with your reservations.'
      }
    ],
    relatedServices: ['executive-entertainment', 'corporate-hospitality-service'],
    searchVolume: 2800,
    difficulty: 'medium'
  },
  {
    id: 'sales-team-travel',
    name: 'Sales Team Travel',
    website: 'corporate',
    category: 'Team Services',
    description: 'Efficient multi-location transportation for sales teams visiting multiple client sites throughout Chicago.',
    longDescription: 'Maximize your sales team\'s productivity with efficient transportation between client visits. Our drivers optimize routes, handle parking, and keep your team on schedule while they focus on closing deals.',
    applicableVehicles: ['suv', 'sprinter', 'executive-van'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 140,
      hourlyRate: 95,
      additionalInfo: 'Full-day packages recommended'
    },
    seoKeywords: ['sales team transport', 'multi-stop car service', 'corporate sales travel', 'business development transportation'],
    faqs: [
      {
        question: 'Can you handle changing schedules?',
        answer: 'Yes, our drivers are flexible and can adjust routes in real-time as meetings shift or new opportunities arise.'
      }
    ],
    relatedServices: ['corporate-meeting-transport', 'business-trip-coordination'],
    searchVolume: 1900,
    difficulty: 'medium'
  },
  {
    id: 'conference-convention-transport',
    name: 'Conference & Convention Transport',
    website: 'corporate',
    category: 'Event Services',
    description: 'Comprehensive transportation management for corporate conferences at McCormick Place, hotels, and convention centers.',
    longDescription: 'Seamless conference logistics for exhibitors, speakers, and attendees. We coordinate hotel shuttles, VIP transportation, equipment hauling, and multi-day event schedules.',
    applicableVehicles: ['sedan', 'suv', 'sprinter', 'coach'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'Multi-day conference packages available'
    },
    seoKeywords: ['conference transportation', 'mccormick place shuttle', 'convention center transport', 'trade show car service'],
    faqs: [
      {
        question: 'Can you handle multiple attendees arriving throughout the day?',
        answer: 'Yes, we create comprehensive transportation plans with staggered pickups and dedicated conference coordinators.'
      }
    ],
    relatedServices: ['trade-show-shuttle', 'corporate-event-transport'],
    searchVolume: 2300,
    difficulty: 'medium'
  },
  {
    id: 'executive-hourly-rental',
    name: 'Executive Suite Hourly Rental',
    website: 'corporate',
    category: 'Flexible Services',
    description: 'Flexible hourly car service with dedicated vehicle and driver for unpredictable schedules.',
    longDescription: 'For days when your schedule is in flux, our hourly service provides a dedicated luxury vehicle and chauffeur at your disposal, ready to transport you wherever business demands.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 100,
      hourlyRate: 85,
      additionalInfo: '3-hour minimum, extended day discounts'
    },
    seoKeywords: ['hourly car service', 'executive rental', 'by the hour limo', 'flexible corporate transport'],
    faqs: [
      {
        question: 'Is there a minimum rental period?',
        answer: 'Yes, we require a 3-hour minimum for hourly services, with discounts for full-day bookings.'
      }
    ],
    relatedServices: ['executive-on-demand', 'corporate-flex-service'],
    searchVolume: 3200,
    difficulty: 'high'
  },
  {
    id: 'business-trip-coordination',
    name: 'Business Trip Coordination',
    website: 'corporate',
    category: 'Business Services',
    description: 'Comprehensive multi-day trip planning including airport, meetings, hotels, and restaurant reservations.',
    longDescription: 'Leave the logistics to us. We coordinate all ground transportation for your business trip, from airport arrival through meetings, client visits, dining, and return departure.',
    applicableVehicles: ['sedan', 'executive-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 0,
      additionalInfo: 'Custom pricing based on itinerary'
    },
    seoKeywords: ['business trip planning', 'corporate travel coordination', 'multi-day car service', 'itinerary management'],
    faqs: [
      {
        question: 'Do you help plan the itinerary?',
        answer: 'Yes, our team reviews your schedule and suggests optimal routes, timing, and transportation solutions.'
      }
    ],
    relatedServices: ['executive-concierge', 'corporate-travel-management'],
    searchVolume: 1600,
    difficulty: 'medium'
  },
  {
    id: 'mergers-acquisitions-transport',
    name: 'Mergers & Acquisitions Team Transport',
    website: 'corporate',
    category: 'Executive Transport',
    description: 'Confidential transportation for M&A teams with discrete service and secure communication.',
    longDescription: 'M&A activities require absolute discretion. Our specialized service provides confidential transportation, NDAs, secure vehicles, and experienced drivers who understand the sensitive nature of deal-making.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 250,
      additionalInfo: 'Premium confidential service'
    },
    seoKeywords: ['m&a transportation', 'confidential car service', 'deal team transport', 'discrete corporate travel'],
    faqs: [
      {
        question: 'How do you ensure confidentiality for sensitive deals?',
        answer: 'All transportation is billed discretely, drivers sign comprehensive NDAs, and we maintain zero record of specific destinations.'
      }
    ],
    relatedServices: ['board-member-travel', 'executive-confidential-service'],
    searchVolume: 900,
    difficulty: 'low'
  },
  {
    id: 'trade-show-expo-shuttle',
    name: 'Trade Show & Expo Shuttle',
    website: 'corporate',
    category: 'Event Services',
    description: 'Dedicated shuttle service for exhibitors and booth staff between hotels and exhibition halls.',
    longDescription: 'Keep your trade show team fresh and on time with reliable shuttle service. We transport booth staff, materials, and VIP guests between hotels and exhibition spaces throughout your event.',
    applicableVehicles: ['sprinter', 'executive-van', 'multiple-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      additionalInfo: 'Multi-day event packages'
    },
    seoKeywords: ['trade show shuttle', 'exhibitor transportation', 'expo car service', 'booth staff transport'],
    faqs: [
      {
        question: 'Can you transport exhibition materials?',
        answer: 'Yes, we can accommodate small displays and materials. For large exhibit pieces, we can coordinate with specialized carriers.'
      }
    ],
    relatedServices: ['conference-convention-transport', 'corporate-event-logistics'],
    searchVolume: 1700,
    difficulty: 'medium'
  },
  {
    id: 'executive-parking-service',
    name: 'Executive Parking & Service',
    website: 'corporate',
    category: 'Concierge Services',
    description: 'Premium park-and-ride service with valet-style vehicle storage and executive ground transportation.',
    longDescription: 'Park your personal vehicle at our secure facility and travel in our executive fleet. Perfect for executives who prefer their personal car for local travel but want professional transportation for longer trips.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 120,
      additionalInfo: 'Includes secure parking and executive vehicle'
    },
    seoKeywords: ['executive park and ride', 'valet car service', 'secure parking transport', 'premium parking service'],
    faqs: [
      {
        question: 'Where do you store personal vehicles?',
        answer: 'We maintain secure, covered parking facilities near major business districts with 24/7 monitoring.'
      }
    ],
    relatedServices: ['executive-concierge', 'daily-commute-service'],
    searchVolume: 800,
    difficulty: 'low'
  },
  {
    id: 'client-meeting-prep',
    name: 'Client Meeting Prep Transport',
    website: 'corporate',
    category: 'Business Services',
    description: 'Transportation optimized for pre-meeting preparation with quiet environment and connectivity.',
    longDescription: 'Arrive at client meetings confident and prepared. Our vehicles provide a mobile office environment where you can review presentations, make calls, and mentally prepare for important discussions.',
    applicableVehicles: ['executive-sedan', 'luxury-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 130,
      additionalInfo: 'Executive amenities included'
    },
    seoKeywords: ['meeting preparation transport', 'mobile office car', 'client meeting service', 'business prep transportation'],
    faqs: [
      {
        question: 'Can I make confidential calls during transport?',
        answer: 'Yes, all vehicles feature privacy partitions and sound-dampening for confidential conversations.'
      }
    ],
    relatedServices: ['corporate-meeting-transport', 'executive-productivity-service'],
    searchVolume: 1400,
    difficulty: 'medium'
  },
  {
    id: 'fortune-500-executive-service',
    name: 'Fortune 500 Visiting Executive',
    website: 'corporate',
    category: 'VIP Services',
    description: 'Premium VIP service for visiting Fortune 500 executives with red-carpet treatment and concierge support.',
    longDescription: 'Welcome your most important visitors with exceptional service. Our Fortune 500 package includes airport greeting, luxury transportation, itinerary management, and 24/7 concierge support.',
    applicableVehicles: ['luxury-sedan', 'luxury-suv', 'executive-suite-vehicle'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 300,
      additionalInfo: 'Full VIP package with concierge'
    },
    seoKeywords: ['fortune 500 transport', 'vip executive service', 'corporate vip travel', 'premium executive care'],
    faqs: [
      {
        question: 'What concierge services are included?',
        answer: 'Restaurant reservations, hotel coordination, meeting room setup, and 24/7 personal assistance throughout their visit.'
      }
    ],
    relatedServices: ['board-member-travel', 'vip-corporate-hospitality'],
    searchVolume: 1100,
    difficulty: 'low'
  },
  {
    id: 'corporate-event-transportation',
    name: 'Corporate Event Transportation',
    website: 'corporate',
    category: 'Event Services',
    description: 'Comprehensive transportation for corporate galas, award dinners, and company celebrations.',
    longDescription: 'Make your corporate event memorable with professional transportation logistics. We coordinate guest arrivals, VIP service, and departure schedules for company events of any size.',
    applicableVehicles: ['sedan', 'suv', 'stretch-limo', 'sprinter', 'coach'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 160,
      additionalInfo: 'Event packages based on guest count'
    },
    seoKeywords: ['corporate event transport', 'company party shuttle', 'gala transportation', 'awards dinner car service'],
    faqs: [
      {
        question: 'Can you handle large corporate events?',
        answer: 'Yes, we regularly service events from 50 to 500+ attendees with comprehensive transportation coordination.'
      }
    ],
    relatedServices: ['executive-group-transport', 'special-event-logistics'],
    searchVolume: 2400,
    difficulty: 'high'
  },
  {
    id: 'investor-relations-travel',
    name: 'Investor Relations Travel',
    website: 'corporate',
    category: 'Executive Transport',
    description: 'Discrete luxury transportation for investor meetings, roadshows, and high-net-worth stakeholder visits.',
    longDescription: 'Investor relations requires impeccable service and discretion. Our specialized transportation ensures your investors experience the same excellence that defines your company.',
    applicableVehicles: ['luxury-sedan', 'luxury-suv', 'executive-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 220,
      additionalInfo: 'Premium IR service package'
    },
    seoKeywords: ['investor relations transport', 'stakeholder car service', 'ir roadshow transportation', 'high net worth travel'],
    faqs: [
      {
        question: 'Do you understand investor relations protocols?',
        answer: 'Yes, our drivers are trained in IR etiquette, confidentiality requirements, and professional stakeholder service.'
      }
    ],
    relatedServices: ['board-member-travel', 'executive-confidential-service'],
    searchVolume: 700,
    difficulty: 'low'
  },
  {
    id: 'law-firm-attorney-transport',
    name: 'Law Firm Attorney Transport',
    website: 'corporate',
    category: 'Professional Services',
    description: 'Professional transportation for attorneys with case preparation support and court appearance timing.',
    longDescription: 'Legal professionals need reliable transportation between courts, offices, and depositions. Our attorney service understands court schedules, downtown parking, and the importance of punctuality in legal proceedings.',
    applicableVehicles: ['sedan', 'executive-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 140,
      hourlyRate: 95,
      additionalInfo: 'Court-optimized routing'
    },
    seoKeywords: ['attorney car service', 'lawyer transportation', 'law firm car service', 'legal professional transport'],
    faqs: [
      {
        question: 'Do you know the Chicago court system?',
        answer: 'Yes, our drivers are familiar with all major courthouses, filing procedures, and security protocols.'
      }
    ],
    relatedServices: ['professional-services-transport', 'downtown-court-service'],
    searchVolume: 1500,
    difficulty: 'medium'
  },
  {
    id: 'medical-professional-transport',
    name: 'Medical Professional Transport',
    website: 'corporate',
    category: 'Professional Services',
    description: 'Specialized transportation for doctors and healthcare executives between hospitals, clinics, and medical offices.',
    longDescription: 'Healthcare professionals maintain demanding schedules. Our medical transport service accommodates urgent calls, hospital rounds, and multi-facility practice management.',
    applicableVehicles: ['sedan', 'suv', 'executive-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 130,
      hourlyRate: 90,
      additionalInfo: 'On-call availability for medical emergencies'
    },
    seoKeywords: ['doctor car service', 'medical transport', 'physician transportation', 'healthcare professional travel'],
    faqs: [
      {
        question: 'Can you accommodate emergency calls?',
        answer: 'Yes, we offer on-call priority service for medical professionals with urgent patient needs.'
      }
    ],
    relatedServices: ['professional-emergency-transport', 'healthcare-executive-service'],
    searchVolume: 1300,
    difficulty: 'medium'
  },
  {
    id: 'tech-executive-travel',
    name: 'Tech Executive Travel',
    website: 'corporate',
    category: 'Industry-Specific',
    description: 'Tech-enabled transportation for startup founders and technology executives with productivity focus.',
    longDescription: 'The tech industry moves fast. Our service caters to tech executives with high-speed Wi-Fi, power everywhere, and an understanding of startup culture and flexible schedules.',
    applicableVehicles: ['executive-sedan', 'tesla-model-s', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'Tech-optimized vehicles'
    },
    seoKeywords: ['tech executive transport', 'startup ceo car service', 'silicon prairie travel', 'technology executive service'],
    faqs: [
      {
        question: 'Do vehicles have charging ports for all devices?',
        answer: 'Yes, all tech-focused vehicles feature USB-C, Lightning, and standard outlets plus high-speed Wi-Fi.'
      }
    ],
    relatedServices: ['startup-founder-service', 'innovation-district-transport'],
    searchVolume: 900,
    difficulty: 'medium'
  },
  {
    id: 'international-business-delegation',
    name: 'International Business Delegation',
    website: 'corporate',
    category: 'Group Services',
    description: 'Coordinated group transportation for international business delegations with translation and cultural support.',
    longDescription: 'Welcome international business partners with culturally-aware transportation service. We provide multilingual drivers when possible, coordinate group logistics, and ensure comfortable experiences for visitors from abroad.',
    applicableVehicles: ['sprinter', 'executive-van', 'coach', 'multiple-luxury-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 250,
      additionalInfo: 'Delegation packages with cultural support'
    },
    seoKeywords: ['international delegation transport', 'foreign business travel', 'global executive service', 'diplomatic car service'],
    faqs: [
      {
        question: 'Do you have multilingual drivers?',
        answer: 'We have drivers fluent in Spanish, Polish, and Mandarin, and can arrange translation services for other languages.'
      }
    ],
    relatedServices: ['international-executive-service', 'global-business-coordination'],
    searchVolume: 600,
    difficulty: 'low'
  }
];

// WEDDING SERVICES - First 10 of 20 will be created in next segment
export const WEDDING_SERVICES: ServiceData[] = [
  {
    id: 'bride-transportation',
    name: 'Bride Transportation',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Elegant full-service transportation for the bride on her wedding day with white-glove treatment and photo coordination.',
    longDescription: 'Your wedding day deserves perfection. Our bride transportation service provides a pristine luxury vehicle, red-carpet treatment, champagne service, and a professional chauffeur who coordinates with your photographer for stunning arrival photos.',
    applicableVehicles: ['stretch-limo', 'luxury-sedan', 'vintage-rolls', 'bentley'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 350,
      additionalInfo: 'Full wedding day package available'
    },
    seoKeywords: ['bride limo service', 'wedding day transportation', 'bridal car service', 'wedding limo chicago'],
    faqs: [
      {
        question: 'Can the limo wait during the ceremony?',
        answer: 'Yes, we include waiting time in the package to transport you from ceremony to reception whenever you\'re ready.'
      },
      {
        question: 'What if my dress is very large?',
        answer: 'We specialize in accommodating full ball gowns and can provide vehicles with extra space and assistance.'
      }
    ],
    relatedServices: ['groom-groomsmen-shuttle', 'bridal-party-transport'],
    searchVolume: 6800,
    difficulty: 'high'
  },
  {
    id: 'groom-groomsmen-shuttle',
    name: 'Groom & Groomsmen Shuttle',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Group transportation for the groom and groomsmen with pre-ceremony and post-ceremony service.',
    longDescription: 'Keep the groom and his crew together, relaxed, and on time. Our service includes beverages, music options, and a fun atmosphere while ensuring everyone arrives ceremony-ready.',
    applicableVehicles: ['suv', 'stretch-limo', 'party-bus', 'sprinter'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      additionalInfo: 'Group packages for 4-12 people'
    },
    seoKeywords: ['groom transportation', 'groomsmen shuttle', 'wedding party limo', 'guys wedding transport'],
    faqs: [
      {
        question: 'Can we have drinks in the vehicle?',
        answer: 'Yes, we provide complimentary non-alcoholic beverages and can stock your preferred refreshments.'
      }
    ],
    relatedServices: ['bride-transportation', 'bachelor-party-transport'],
    searchVolume: 4200,
    difficulty: 'medium'
  },
  {
    id: 'bridal-party-travel',
    name: 'Bridal Party Travel',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Coordinated transportation for bridesmaids and wedding party between getting-ready locations and venues.',
    longDescription: 'Your bridesmaids deserve special treatment too. We coordinate group transportation for hair, makeup, photos, and ceremony, keeping everyone together and on schedule.',
    applicableVehicles: ['sprinter', 'party-bus', 'multiple-suvs'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 320,
      additionalInfo: 'Full-day bridal party package'
    },
    seoKeywords: ['bridesmaids transportation', 'bridal party shuttle', 'wedding party car service', 'bridesmaid limo'],
    faqs: [
      {
        question: 'Can we play our own music?',
        answer: 'Absolutely! We can connect to Bluetooth or play your custom playlist.'
      }
    ],
    relatedServices: ['bride-transportation', 'getting-ready-transport'],
    searchVolume: 3400,
    difficulty: 'medium'
  },
  {
    id: 'wedding-guest-transportation',
    name: 'Wedding Guest Transportation',
    website: 'wedding',
    category: 'Guest Services',
    description: 'Hotel shuttle service for wedding guests between accommodations and wedding venues throughout the event.',
    longDescription: 'Ensure all your guests arrive safely and on time. We provide continuous shuttle service from hotels to ceremony, reception, and return, eliminating parking concerns and enabling guests to celebrate freely.',
    applicableVehicles: ['sprinter', 'coach', 'party-bus', 'multiple-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      additionalInfo: 'Per vehicle pricing, multiple shuttles available'
    },
    seoKeywords: ['wedding guest shuttle', 'hotel wedding transport', 'guest transportation service', 'wedding shuttle bus'],
    faqs: [
      {
        question: 'How many guests can you transport?',
        answer: 'We can accommodate any size wedding, from intimate gatherings to 500+ guest events with multiple vehicles.'
      }
    ],
    relatedServices: ['multi-venue-wedding-transport', 'hotel-venue-shuttle'],
    searchVolume: 5400,
    difficulty: 'high'
  },
  {
    id: 'rehearsal-dinner-transport',
    name: 'Rehearsal Dinner Transport',
    website: 'wedding',
    category: 'Pre-Wedding Events',
    description: 'Group transportation for rehearsal dinner guests between hotels, rehearsal locations, and restaurants.',
    longDescription: 'Start your wedding weekend right with coordinated rehearsal dinner transportation. We handle logistics so you can focus on final preparations and enjoying time with close family and friends.',
    applicableVehicles: ['sprinter', 'coach', 'multiple-suvs'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      additionalInfo: 'Evening service package'
    },
    seoKeywords: ['rehearsal dinner transport', 'pre-wedding shuttle', 'wedding week transportation', 'rehearsal party car service'],
    faqs: [
      {
        question: 'Can you handle multiple pickup locations?',
        answer: 'Yes, we create optimized routes to collect guests from multiple hotels or locations.'
      }
    ],
    relatedServices: ['wedding-weekend-transport', 'multi-day-event-logistics'],
    searchVolume: 2200,
    difficulty: 'medium'
  },
  {
    id: 'getting-ready-location-transport',
    name: 'Getting Ready Location Transport',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Transportation from hair and makeup locations to the ceremony venue with timing coordination.',
    longDescription: 'Coordinate the hectic getting-ready phase with reliable transportation. We time arrivals perfectly, accommodate last-minute schedule changes, and ensure everyone arrives ceremony-ready.',
    applicableVehicles: ['suv', 'sprinter', 'luxury-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 150,
      additionalInfo: 'Flexible timing coordination'
    },
    seoKeywords: ['getting ready transport', 'hair makeup transportation', 'wedding prep car service', 'bridal prep shuttle'],
    faqs: [
      {
        question: 'What if we run behind schedule?',
        answer: 'We build flexibility into wedding day services and can adjust timing as needed without penalty.'
      }
    ],
    relatedServices: ['bride-transportation', 'bridal-party-travel'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'pre-wedding-photo-transport',
    name: 'Pre-Wedding Photo Location Transport',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Multi-stop transportation to scenic photo locations throughout Chicago before or after the ceremony.',
    longDescription: 'Chicago offers stunning photo backdrops from lakefront to architecture. Our photo tour service transports your wedding party to multiple locations while coordinating with your photographer\'s schedule.',
    applicableVehicles: ['stretch-limo', 'party-bus', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 250,
      hourlyRate: 120,
      additionalInfo: '2-4 hour photo tour packages'
    },
    seoKeywords: ['wedding photo transport', 'chicago wedding photography locations', 'photo tour car service', 'wedding location shuttle'],
    faqs: [
      {
        question: 'Can you recommend photo locations?',
        answer: 'Yes, our drivers know the best Chicago wedding photo spots and can coordinate with your photographer.'
      }
    ],
    relatedServices: ['post-ceremony-celebration-drive', 'chicago-photo-tour'],
    searchVolume: 2100,
    difficulty: 'medium'
  },
  {
    id: 'ceremony-location-shuttle',
    name: 'Ceremony Location Shuttle',
    website: 'wedding',
    category: 'Guest Services',
    description: 'Continuous shuttle service between ceremony and reception for multi-building or separate venue weddings.',
    longDescription: 'When ceremony and reception are in different locations, our shuttle service ensures seamless guest transportation. We coordinate timing with your wedding planner for smooth transitions.',
    applicableVehicles: ['coach', 'party-bus', 'sprinter', 'multiple-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 220,
      additionalInfo: 'Continuous service during transition period'
    },
    seoKeywords: ['ceremony to reception shuttle', 'wedding venue transport', 'multi-location wedding service', 'wedding guest shuttle'],
    faqs: [
      {
        question: 'How do you coordinate timing between venues?',
        answer: 'We work closely with your wedding coordinator to time shuttles perfectly with ceremony end and reception start.'
      }
    ],
    relatedServices: ['multi-venue-wedding-transport', 'wedding-guest-transportation'],
    searchVolume: 2900,
    difficulty: 'medium'
  },
  {
    id: 'reception-entrance-coordination',
    name: 'Reception Entrance Coordination',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Grand entrance transportation coordinating arrival timing for dramatic reception entrances.',
    longDescription: 'Make a memorable reception entrance with perfectly timed arrival. We coordinate with your DJ and coordinator to ensure your entrance is as dramatic and well-timed as you envision.',
    applicableVehicles: ['stretch-limo', 'luxury-sedan', 'vintage-car', 'exotic-vehicle'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      additionalInfo: 'Timing coordinated with reception team'
    },
    seoKeywords: ['reception entrance transport', 'grand entrance car service', 'wedding reception arrival', 'dramatic entrance limo'],
    faqs: [
      {
        question: 'Do you coordinate with our DJ?',
        answer: 'Yes, we communicate directly with your reception team to ensure perfect timing for your entrance.'
      }
    ],
    relatedServices: ['bride-transportation', 'post-ceremony-photo-drive'],
    searchVolume: 1400,
    difficulty: 'low'
  },
  {
    id: 'post-ceremony-celebration-drive',
    name: 'Post-Ceremony Celebration Drive',
    website: 'wedding',
    category: 'Wedding Day',
    description: 'Private time for newlyweds between ceremony and reception with champagne celebration and photo opportunities.',
    longDescription: 'Enjoy precious alone time as newlyweds with a private drive between ceremony and reception. We provide champagne, music, and route past scenic locations for spontaneous photos.',
    applicableVehicles: ['stretch-limo', 'luxury-sedan', 'vintage-rolls', 'convertible'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      hourlyRate: 120,
      additionalInfo: '1-2 hour celebration package'
    },
    seoKeywords: ['newlywed drive', 'post-ceremony transport', 'just married car service', 'wedding celebration ride'],
    faqs: [
      {
        question: 'Can we have champagne?',
        answer: 'Yes, complimentary champagne is included, and we can stock your preferred beverages.'
      }
    ],
    relatedServices: ['bride-transportation', 'pre-wedding-photo-transport'],
    searchVolume: 1600,
    difficulty: 'medium'
  },
  {
    id: 'multi-venue-wedding-transport',
    name: 'Multi-Venue Wedding Transport',
    website: 'wedding',
    category: 'Full-Service',
    description: 'Comprehensive transportation management for weddings spanning multiple locations with complex logistics.',
    longDescription: 'Complex weddings require expert coordination. We manage all transportation logistics for multi-venue events, coordinating timing, routes, and multiple vehicle types for seamless flow.',
    applicableVehicles: ['multiple-vehicle-types', 'coordinated-fleet'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 500,
      additionalInfo: 'Comprehensive multi-venue package'
    },
    seoKeywords: ['multi-venue wedding', 'wedding logistics coordination', 'complex wedding transport', 'full-service wedding shuttle'],
    faqs: [
      {
        question: 'How do you manage complex timing?',
        answer: 'We assign a dedicated coordinator who works with your planner to orchestrate all movements and timing.'
      }
    ],
    relatedServices: ['wedding-weekend-transport', 'full-service-wedding-coordination'],
    searchVolume: 3200,
    difficulty: 'high'
  },
  {
    id: 'honeymoon-airport-transfer',
    name: 'Honeymoon Airport Transfer',
    website: 'wedding',
    category: 'Post-Wedding',
    description: 'Special newlywed airport transfer service with honeymoon celebration and just-married treatment.',
    longDescription: 'Start your honeymoon journey with style. We decorate vehicles with just-married signage, provide champagne, and ensure you arrive at the airport relaxed and celebrating.',
    applicableVehicles: ['luxury-sedan', 'stretch-limo', 'luxury-suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 140,
      additionalInfo: 'Honeymoon celebration included'
    },
    seoKeywords: ['honeymoon airport transfer', 'newlywed car service', 'just married transport', 'wedding airport shuttle'],
    faqs: [
      {
        question: 'Do you decorate the vehicle?',
        answer: 'Yes, we can add tasteful just-married decorations and cans if desired, or keep it elegant and sophisticated.'
      }
    ],
    relatedServices: ['airport-transfer', 'special-occasion-transport'],
    searchVolume: 1900,
    difficulty: 'medium'
  },
  {
    id: 'wedding-day-coordination-transport',
    name: 'Wedding Day Coordination Transport',
    website: 'wedding',
    category: 'Vendor Services',
    description: 'Transportation for wedding planners, coordinators, and vendors moving between multiple locations.',
    longDescription: 'Wedding professionals need reliable transportation between locations. We provide flexible service for coordinators managing multiple sites and tight schedules.',
    applicableVehicles: ['suv', 'sedan', 'cargo-van'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 120,
      hourlyRate: 80,
      additionalInfo: 'Flexible hourly service'
    },
    seoKeywords: ['wedding planner transport', 'coordinator car service', 'vendor transportation', 'wedding professional shuttle'],
    faqs: [
      {
        question: 'Can you help transport wedding supplies?',
        answer: 'Yes, we can accommodate décor, favors, and supplies within our vehicles\' capacity.'
      }
    ],
    relatedServices: ['event-coordination-logistics', 'vendor-support-services'],
    searchVolume: 800,
    difficulty: 'low'
  },
  {
    id: 'cocktail-hour-escort',
    name: 'Cocktail Hour Escort',
    website: 'wedding',
    category: 'Guest Services',
    description: 'Coordinated guest movement between ceremony conclusion and cocktail hour locations.',
    longDescription: 'Manage the transition period smoothly. We transport guests from ceremony to cocktail hour location while the wedding party takes photos, ensuring everyone knows where to go.',
    applicableVehicles: ['coach', 'sprinter', 'multiple-shuttles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 160,
      additionalInfo: 'Transition period service'
    },
    seoKeywords: ['cocktail hour transport', 'wedding transition shuttle', 'ceremony to cocktails', 'guest movement service'],
    faqs: [
      {
        question: 'How long does the service run?',
        answer: 'Typically 45-90 minutes, timed to move all guests during your photo session.'
      }
    ],
    relatedServices: ['ceremony-location-shuttle', 'wedding-guest-transportation'],
    searchVolume: 900,
    difficulty: 'low'
  },
  {
    id: 'late-night-farewell-service',
    name: 'Late-Night Farewell Service',
    website: 'wedding',
    category: 'End of Night',
    description: 'Safe end-of-night transportation ensuring all guests return to hotels after reception celebrations.',
    longDescription: 'End your celebration knowing all guests arrive home safely. We provide late-night shuttle service from reception to hotels, accommodating various departure times.',
    applicableVehicles: ['coach', 'party-bus', 'multiple-shuttles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 200,
      additionalInfo: 'Late-night premium for post-midnight service'
    },
    seoKeywords: ['late night wedding shuttle', 'end of night transport', 'wedding farewell service', 'safe ride home wedding'],
    faqs: [
      {
        question: 'How late can you run shuttles?',
        answer: 'We accommodate any end time, even running into early morning hours if needed.'
      }
    ],
    relatedServices: ['wedding-guest-transportation', 'hotel-shuttle-service'],
    searchVolume: 1500,
    difficulty: 'medium'
  },
  {
    id: 'out-of-town-guest-hotel-shuttle',
    name: 'Out-of-Town Guest Hotel Shuttle',
    website: 'wedding',
    category: 'Guest Services',
    description: 'Multi-day shuttle service for wedding weekend guests between hotels and various wedding events.',
    longDescription: 'Wedding weekends involve multiple events. We provide continuous shuttle service for out-of-town guests between hotels and all scheduled events throughout the weekend.',
    applicableVehicles: ['coach', 'sprinter', 'multiple-vehicles'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 180,
      additionalInfo: 'Per day pricing for multi-day packages'
    },
    seoKeywords: ['wedding weekend shuttle', 'multi-day guest transport', 'destination wedding service', 'wedding hotel shuttle'],
    faqs: [
      {
        question: 'Can you service multiple hotels?',
        answer: 'Yes, we create routes covering all hotel blocks and guest accommodations.'
      }
    ],
    relatedServices: ['wedding-weekend-transport', 'destination-wedding-logistics'],
    searchVolume: 2400,
    difficulty: 'medium'
  },
  {
    id: 'wedding-weekend-itinerary-transport',
    name: 'Wedding Weekend Itinerary Transport',
    website: 'wedding',
    category: 'Full-Service',
    description: 'Comprehensive transportation for entire wedding weekend including welcome party, ceremony, reception, and brunch.',
    longDescription: 'Let us handle all weekend transportation logistics. From welcome cocktails to farewell brunch, we coordinate every movement ensuring seamless flow throughout your celebration.',
    applicableVehicles: ['multiple-vehicle-types', 'full-fleet'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 800,
      additionalInfo: 'Full weekend package, 3-4 days'
    },
    seoKeywords: ['wedding weekend package', 'full weekend transport', 'destination wedding logistics', 'complete wedding transportation'],
    faqs: [
      {
        question: 'What events are typically included?',
        answer: 'Welcome party, rehearsal dinner, ceremony, reception, after-party, and farewell brunch - fully customizable.'
      }
    ],
    relatedServices: ['destination-wedding-coordination', 'multi-day-event-logistics'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'wedding-party-overnight-stay',
    name: 'Wedding Party Overnight Stay',
    website: 'wedding',
    category: 'Pre-Wedding Events',
    description: 'Day-before transportation for wedding party between lodging, activities, and final preparations.',
    longDescription: 'The day before is crucial for preparations. We transport wedding parties to final fittings, rehearsals, dinners, and ensure everyone gets to their accommodations safely.',
    applicableVehicles: ['suv', 'sprinter', 'party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 160,
      additionalInfo: 'Day-before logistics package'
    },
    seoKeywords: ['day before wedding transport', 'wedding party lodging', 'pre-wedding transportation', 'wedding prep shuttle'],
    faqs: [
      {
        question: 'Can you accommodate last-minute schedule changes?',
        answer: 'Yes, we remain flexible as wedding week schedules often shift unexpectedly.'
      }
    ],
    relatedServices: ['rehearsal-dinner-transport', 'wedding-weekend-transport'],
    searchVolume: 1100,
    difficulty: 'low'
  },
  {
    id: 'ceremony-officiant-transport',
    name: 'Ceremony Officiant Transport',
    website: 'wedding',
    category: 'Vendor Services',
    description: 'Dedicated transportation for clergy, officiants, and wedding celebrants to ensure on-time arrival.',
    longDescription: 'Your officiant must arrive on time. We provide reliable, professional transportation for clergy and celebrants, coordinating timing with ceremony start.',
    applicableVehicles: ['sedan', 'luxury-sedan', 'suv'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 100,
      additionalInfo: 'Round-trip service included'
    },
    seoKeywords: ['officiant transportation', 'clergy car service', 'wedding minister transport', 'celebrant shuttle'],
    faqs: [
      {
        question: 'Do you coordinate timing with the ceremony?',
        answer: 'Yes, we ensure arrival 30-45 minutes before ceremony start as requested.'
      }
    ],
    relatedServices: ['vendor-coordination-transport', 'wedding-professional-service'],
    searchVolume: 600,
    difficulty: 'low'
  },
  {
    id: 'special-anniversary-celebration',
    name: 'Special Anniversary Celebration',
    website: 'wedding',
    category: 'Anniversary',
    description: 'Transportation for vow renewals, milestone anniversaries, and special marriage celebrations.',
    longDescription: 'Celebrate your enduring love with special transportation. Perfect for vow renewals, significant anniversaries, or recreating your wedding day with a nostalgic drive.',
    applicableVehicles: ['stretch-limo', 'vintage-car', 'luxury-sedan'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 250,
      additionalInfo: 'Anniversary packages with champagne'
    },
    seoKeywords: ['anniversary car service', 'vow renewal transport', 'milestone celebration', 'anniversary limo chicago'],
    faqs: [
      {
        question: 'Can you recreate our original wedding route?',
        answer: 'Yes, we love helping couples revisit their wedding venues and locations for anniversary celebrations.'
      }
    ],
    relatedServices: ['special-occasion-transport', 'romantic-celebration-service'],
    searchVolume: 1300,
    difficulty: 'medium'
  }
];

// PARTY BUS SERVICES (20 services)
export const PARTY_BUS_SERVICES: ServiceData[] = [
  {
    id: 'bachelor-party-chicago-tour',
    name: 'Bachelor Party Chicago Tour',
    website: 'partyBus',
    category: 'Bachelor Party',
    description: 'Epic bachelor party experience with party bus touring Chicago nightlife, breweries, and entertainment districts.',
    longDescription: 'Create an unforgettable bachelor party with our guided Chicago tour. We route you through the hottest nightlife spots, coordinate VIP entry, and keep the party rolling between venues on a fully-equipped party bus.',
    applicableVehicles: ['party-bus-large', 'party-bus-medium', 'limo-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 300,
      hourlyRate: 150,
      additionalInfo: '5-hour minimum recommended'
    },
    seoKeywords: ['bachelor party bus chicago', 'guys night out', 'bachelor party transportation', 'party bus rental'],
    faqs: [
      {
        question: 'Can you recommend stops and venues?',
        answer: 'Absolutely! We know all the best bachelor party spots and can create a custom route based on your group\'s preferences.'
      },
      {
        question: 'What amenities are on the party bus?',
        answer: 'LED lighting, premium sound system, dance floor, bar area, and climate control. Some buses include stripper poles and VIP seating.'
      }
    ],
    relatedServices: ['nightclub-crawl-service', 'brewery-tour-bus'],
    searchVolume: 4100,
    difficulty: 'high'
  },
  {
    id: 'bachelorette-party-celebration',
    name: 'Bachelorette Party Celebration',
    website: 'partyBus',
    category: 'Bachelorette Party',
    description: 'Fabulous bachelorette party transportation featuring multi-stop tours through Chicago\'s best celebration spots.',
    longDescription: 'Girls night out elevated to the next level. Our bachelorette party service includes party bus with entertainment system, coordinated venue stops, and VIP treatment at Chicago\'s hottest spots.',
    applicableVehicles: ['party-bus-large', 'party-bus-medium', 'pink-party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      hourlyRate: 140,
      additionalInfo: 'Bachelorette packages with decorations'
    },
    seoKeywords: ['bachelorette party bus', 'girls night out chicago', 'bachelorette transportation', 'bachelorette limo bus'],
    faqs: [
      {
        question: 'Can we decorate the bus?',
        answer: 'Yes! We welcome decorations and can help coordinate bachelorette party themes.'
      },
      {
        question: 'Do you have female drivers available?',
        answer: 'Yes, we can arrange female drivers upon request for bachelorette parties.'
      }
    ],
    relatedServices: ['nightclub-crawl-service', 'girls-night-party-package'],
    searchVolume: 3800,
    difficulty: 'high'
  },
  {
    id: 'birthday-party-bus-experience',
    name: 'Birthday Party Bus Experience',
    website: 'partyBus',
    category: 'Birthday',
    description: 'Mobile birthday celebration with party bus touring Chicago, perfect for milestone birthdays and group celebrations.',
    longDescription: 'Turn your birthday into a moving celebration. Our party buses provide the perfect venue for milestone birthdays, with entertainment systems, mood lighting, and the flexibility to visit multiple locations.',
    applicableVehicles: ['party-bus-large', 'party-bus-medium', 'limo-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 250,
      hourlyRate: 125,
      additionalInfo: 'Birthday packages with decorations included'
    },
    seoKeywords: ['birthday party bus', 'party bus rental chicago', 'mobile birthday party', 'birthday celebration transport'],
    faqs: [
      {
        question: 'Can we bring a birthday cake?',
        answer: 'Yes, we can accommodate cakes and provide surfaces and utensils for serving.'
      },
      {
        question: 'Is this suitable for all ages?',
        answer: 'Yes, we offer age-appropriate packages from sweet sixteens to senior celebrations.'
      }
    ],
    relatedServices: ['sweet-sixteen-party-bus', 'milestone-celebration-transport'],
    searchVolume: 3500,
    difficulty: 'high'
  },
  {
    id: 'corporate-team-celebration',
    name: 'Corporate Team Celebration',
    website: 'partyBus',
    category: 'Corporate Events',
    description: 'Team building and corporate celebration transportation for company outings and staff appreciation events.',
    longDescription: 'Reward your team with a memorable outing. Our corporate party bus service provides fun, safe transportation for team building events, holiday parties, and corporate celebrations.',
    applicableVehicles: ['party-bus-large', 'executive-party-bus', 'multiple-buses'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      hourlyRate: 140,
      additionalInfo: 'Corporate packages with volume discounts'
    },
    seoKeywords: ['corporate party bus', 'team building transport', 'company outing bus', 'staff party transportation'],
    faqs: [
      {
        question: 'Can you accommodate large corporate groups?',
        answer: 'Yes, we can coordinate multiple buses for groups up to 200+ employees.'
      },
      {
        question: 'Do you offer corporate billing?',
        answer: 'Yes, we work with corporate accounts and provide detailed invoicing.'
      }
    ],
    relatedServices: ['corporate-team-building', 'company-holiday-party'],
    searchVolume: 2200,
    difficulty: 'medium'
  },
  {
    id: 'graduation-party-transport',
    name: 'Graduation Party Transport',
    website: 'partyBus',
    category: 'Graduation',
    description: 'Celebration transportation for high school and college graduations with safe, supervised party atmosphere.',
    longDescription: 'Celebrate academic achievements safely. Our graduation party service provides supervised fun for new graduates, with experienced drivers ensuring a safe celebration while visiting multiple party locations.',
    applicableVehicles: ['party-bus-medium', 'party-bus-large', 'limo-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 260,
      hourlyRate: 130,
      additionalInfo: 'Graduation packages, adult supervision available'
    },
    seoKeywords: ['graduation party bus', 'prom limo alternative', 'grad party transportation', 'high school graduation bus'],
    faqs: [
      {
        question: 'Do you provide supervision for underage parties?',
        answer: 'Yes, we can provide additional staff supervision and enforce no-alcohol policies for underage celebrations.'
      }
    ],
    relatedServices: ['prom-night-party-bus', 'senior-celebration-transport'],
    searchVolume: 2800,
    difficulty: 'medium'
  },
  {
    id: 'prom-night-party-bus',
    name: 'Prom Night Party Bus',
    website: 'partyBus',
    category: 'Prom',
    description: 'Safe luxury prom transportation with party atmosphere, parent-approved supervision, and photo opportunities.',
    longDescription: 'Make prom night unforgettable and safe. Our prom packages include pre-prom photos, supervised transportation to and from the venue, and post-prom celebration options with strict safety protocols.',
    applicableVehicles: ['party-bus-medium', 'luxury-party-bus', 'limo-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 300,
      hourlyRate: 150,
      additionalInfo: 'Prom packages with photo stops and supervision'
    },
    seoKeywords: ['prom party bus', 'prom limo chicago', 'high school prom transport', 'prom night bus rental'],
    faqs: [
      {
        question: 'Are alcohol and substances strictly prohibited?',
        answer: 'Absolutely. We have zero-tolerance policies and conduct vehicle inspections before and after prom events.'
      },
      {
        question: 'Can parents meet the driver beforehand?',
        answer: 'Yes, we encourage parent meetings and provide driver information and contact numbers in advance.'
      }
    ],
    relatedServices: ['homecoming-dance-transport', 'school-dance-party-bus'],
    searchVolume: 4200,
    difficulty: 'high'
  },
  {
    id: 'new-years-eve-party-bus',
    name: 'New Year\'s Eve Party Bus',
    website: 'partyBus',
    category: 'Holiday',
    description: 'Ring in the New Year safely with party bus touring Chicago\'s best NYE celebrations and countdown events.',
    longDescription: 'Celebrate New Year\'s Eve without worrying about transportation or parking. Our NYE party bus packages include stops at multiple celebrations, champagne toast at midnight, and safe rides home.',
    applicableVehicles: ['party-bus-large', 'luxury-party-bus', 'vip-party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 500,
      hourlyRate: 200,
      additionalInfo: 'NYE premium pricing, champagne included'
    },
    seoKeywords: ['new years eve party bus', 'nye transportation chicago', 'new years party transport', 'countdown celebration bus'],
    faqs: [
      {
        question: 'When should we book for New Year\'s Eve?',
        answer: 'NYE books up quickly. We recommend reserving 3-6 months in advance for best vehicle selection.'
      },
      {
        question: 'Do you provide champagne?',
        answer: 'Yes, complimentary champagne toast is included in NYE packages. You can also BYOB.'
      }
    ],
    relatedServices: ['holiday-party-transport', 'special-event-celebration-bus'],
    searchVolume: 3200,
    difficulty: 'high'
  },
  {
    id: 'halloween-party-bus',
    name: 'Halloween Party Bus',
    website: 'partyBus',
    category: 'Holiday',
    description: 'Costume-friendly Halloween party transportation touring Chicago\'s haunted attractions and costume parties.',
    longDescription: 'Experience Chicago\'s spookiest night in style. Our Halloween party buses accommodate elaborate costumes, visit haunted attractions, and transport your crew to the hottest costume parties.',
    applicableVehicles: ['party-bus-large', 'party-bus-medium', 'themed-party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      hourlyRate: 140,
      additionalInfo: 'Halloween packages with themed decorations'
    },
    seoKeywords: ['halloween party bus', 'costume party transport', 'haunted chicago tour', 'halloween party transportation'],
    faqs: [
      {
        question: 'Can we bring large costume props?',
        answer: 'Yes, our buses accommodate costume props, though we ask that they be safe and not damage the vehicle.'
      }
    ],
    relatedServices: ['holiday-themed-party-bus', 'costume-party-transport'],
    searchVolume: 2400,
    difficulty: 'medium'
  },
  {
    id: 'summer-kickoff-party-bus',
    name: 'Summer Kickoff Party Bus',
    website: 'partyBus',
    category: 'Seasonal',
    description: 'Celebrate summer with party bus touring Chicago beaches, festivals, and outdoor entertainment venues.',
    longDescription: 'Welcome summer Chicago-style. Our summer kickoff packages tour lakefront beaches, rooftop bars, beer gardens, and festival grounds for the ultimate seasonal celebration.',
    applicableVehicles: ['party-bus-large', 'convertible-party-bus', 'open-top-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 260,
      hourlyRate: 130,
      additionalInfo: 'Summer packages with beach and festival stops'
    },
    seoKeywords: ['summer party bus', 'beach party transport', 'summer celebration chicago', 'festival party bus'],
    faqs: [
      {
        question: 'Can we stop at Lake Michigan beaches?',
        answer: 'Yes, we can include beach stops, though parking availability depends on the specific beach and day.'
      }
    ],
    relatedServices: ['festival-transportation', 'beach-party-shuttle'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'destination-bachelorette-weekend',
    name: 'Destination Bachelorette Weekend',
    website: 'partyBus',
    category: 'Multi-Day',
    description: 'Multi-day party bus package for destination bachelorette weekends in Chicago with hotel coordination.',
    longDescription: 'Host an unforgettable destination bachelorette in Chicago. Our weekend packages include airport pickup, hotel transfers, nightly party bus outings, and coordinated itinerary planning.',
    applicableVehicles: ['party-bus-large', 'luxury-party-bus', 'vip-party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 800,
      additionalInfo: 'Multi-day weekend package, 3 days/2 nights'
    },
    seoKeywords: ['destination bachelorette chicago', 'weekend party package', 'multi-day party bus', 'bachelorette weekend transportation'],
    faqs: [
      {
        question: 'Do you help plan the weekend itinerary?',
        answer: 'Yes, we provide Chicago expertise and recommendations for restaurants, activities, and nightlife.'
      }
    ],
    relatedServices: ['bachelorette-party-celebration', 'weekend-party-package'],
    searchVolume: 1600,
    difficulty: 'medium'
  },
  {
    id: 'brewery-tour-party-bus',
    name: 'Brewery Tour Party Bus',
    website: 'partyBus',
    category: 'Tours',
    description: 'Guided Chicago brewery tour with party bus transportation between craft breweries and taprooms.',
    longDescription: 'Explore Chicago\'s thriving craft beer scene safely. Our brewery tour includes transportation between 4-5 breweries, pre-arranged tastings, and knowledgeable drivers who double as beer guides.',
    applicableVehicles: ['party-bus-medium', 'tour-bus', 'craft-beer-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 350,
      hourlyRate: 140,
      additionalInfo: '4-6 hour brewery tour package'
    },
    seoKeywords: ['chicago brewery tour', 'craft beer bus tour', 'brewery party bus', 'beer tasting transportation'],
    faqs: [
      {
        question: 'Are brewery tastings included?',
        answer: 'Transportation is included; tasting fees are typically $10-15 per brewery paid separately.'
      },
      {
        question: 'Can you customize the brewery route?',
        answer: 'Yes, we can route to your preferred breweries or recommend our favorite stops.'
      }
    ],
    relatedServices: ['winery-tour-bus', 'distillery-tour-transport'],
    searchVolume: 2900,
    difficulty: 'high'
  },
  {
    id: 'wedding-rehearsal-party',
    name: 'Wedding Rehearsal Party',
    website: 'partyBus',
    category: 'Wedding',
    description: 'Fun group transportation for wedding party after rehearsal with stops at restaurants and bars.',
    longDescription: 'Keep the wedding party together and celebrating. Our rehearsal party service transports your crew from rehearsal to dinner, then to bars or entertainment while keeping everyone safe.',
    applicableVehicles: ['party-bus-medium', 'limo-bus', 'sprinter-party-van'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 240,
      hourlyRate: 120,
      additionalInfo: 'Evening packages for wedding parties'
    },
    seoKeywords: ['wedding rehearsal transport', 'rehearsal party bus', 'wedding party night out', 'pre-wedding celebration'],
    faqs: [
      {
        question: 'Can you coordinate with the rehearsal dinner venue?',
        answer: 'Yes, we work with your venue to time pickup and coordinate drop-off locations.'
      }
    ],
    relatedServices: ['wedding-party-transport', 'bachelor-party-bus'],
    searchVolume: 1400,
    difficulty: 'medium'
  },
  {
    id: 'sports-event-party-shuttle',
    name: 'Sports Event Party Shuttle',
    website: 'partyBus',
    category: 'Sports',
    description: 'Game day transportation for Cubs, Bears, Bulls, and Blackhawks with tailgate party bus service.',
    longDescription: 'The ultimate game day experience. We transport your group to Wrigley, Soldier Field, United Center, or other venues with pre-game tailgate party, avoiding parking hassles and allowing everyone to celebrate.',
    applicableVehicles: ['party-bus-large', 'tailgate-bus', 'sports-fan-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 300,
      hourlyRate: 150,
      additionalInfo: 'Game day packages with pre and post-game service'
    },
    seoKeywords: ['game day party bus', 'sports event transportation', 'tailgate party bus', 'cubs bears bulls shuttle'],
    faqs: [
      {
        question: 'Can we tailgate from the bus?',
        answer: 'Yes, many lots allow bus tailgating. We can park and open the bus for pre-game celebrations.'
      },
      {
        question: 'Do you service all Chicago sports venues?',
        answer: 'Yes, we serve Wrigley Field, Soldier Field, United Center, Guaranteed Rate Field, and suburban venues.'
      }
    ],
    relatedServices: ['tailgate-party-service', 'stadium-shuttle-transport'],
    searchVolume: 3200,
    difficulty: 'high'
  },
  {
    id: 'concert-experience-transport',
    name: 'Concert Experience Transport',
    website: 'partyBus',
    category: 'Entertainment',
    description: 'Concert venue transportation with pre-show party atmosphere and post-show safe rides.',
    longDescription: 'Enhance your concert experience with party bus transportation. Start the party early, avoid parking nightmares, and celebrate safely after the show with our concert packages.',
    applicableVehicles: ['party-bus-large', 'party-bus-medium', 'music-themed-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      hourlyRate: 140,
      additionalInfo: 'Concert packages with venue drop-off and pickup'
    },
    seoKeywords: ['concert party bus', 'concert transportation chicago', 'music venue shuttle', 'live music party bus'],
    faqs: [
      {
        question: 'Where do you pick up after concerts?',
        answer: 'We coordinate designated pickup locations near each venue and text you when ready.'
      },
      {
        question: 'Can we play the artist\'s music on the way there?',
        answer: 'Absolutely! Connect to our sound system and pump up the volume.'
      }
    ],
    relatedServices: ['festival-transportation', 'live-entertainment-shuttle'],
    searchVolume: 2800,
    difficulty: 'high'
  },
  {
    id: 'casino-night-party-bus',
    name: 'Casino Night Party Bus',
    website: 'partyBus',
    category: 'Casino',
    description: 'Casino resort transportation with party bus service to Indiana and Illinois casinos.',
    longDescription: 'Turn the journey into part of the fun. Our casino packages include party bus transportation to regional casinos, pre-gaming entertainment, and safe rides home after your gaming adventure.',
    applicableVehicles: ['party-bus-large', 'luxury-coach', 'casino-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 400,
      hourlyRate: 150,
      additionalInfo: 'Full-day casino packages available'
    },
    seoKeywords: ['casino party bus', 'casino transportation chicago', 'indiana casino bus', 'gambling trip transport'],
    faqs: [
      {
        question: 'Which casinos do you service?',
        answer: 'Horseshoe Hammond, Rivers Casino, Hard Rock Rockford, and other regional casinos.'
      },
      {
        question: 'Is there a minimum group size?',
        answer: 'Casino trips typically require 15-20 minimum for full-size buses, but we can accommodate smaller groups with other vehicles.'
      }
    ],
    relatedServices: ['casino-weekend-trip', 'gaming-resort-transportation'],
    searchVolume: 2200,
    difficulty: 'medium'
  },
  {
    id: 'nightclub-crawl-transportation',
    name: 'Nightclub Crawl Transportation',
    website: 'partyBus',
    category: 'Nightlife',
    description: 'Multi-venue nightclub tour with VIP entry coordination and party bus between Chicago\'s hottest clubs.',
    longDescription: 'Experience Chicago nightlife without the hassle. Our nightclub crawl packages include transportation between premier venues, VIP entry coordination, and mobile party between stops.',
    applicableVehicles: ['party-bus-large', 'vip-party-bus', 'nightlife-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 320,
      hourlyRate: 160,
      additionalInfo: 'VIP nightlife packages available'
    },
    seoKeywords: ['nightclub party bus', 'club crawl chicago', 'nightlife transportation', 'bar hopping bus'],
    faqs: [
      {
        question: 'Do you arrange VIP entry?',
        answer: 'We work with major venues for coordinated arrival, and can connect you with promoters for VIP table service.'
      },
      {
        question: 'What areas of Chicago do you cover?',
        answer: 'River North, Fulton Market, Wrigleyville, and other major nightlife districts.'
      }
    ],
    relatedServices: ['bachelor-party-tour', 'vip-nightlife-experience'],
    searchVolume: 3800,
    difficulty: 'high'
  },
  {
    id: 'sunset-dinner-party-bus',
    name: 'Sunset Dinner Party Bus',
    website: 'partyBus',
    category: 'Dining',
    description: 'Unique dining experience with scenic Chicago drives during dinner service aboard a luxury party bus.',
    longDescription: 'Dinner with a view, literally. Our sunset dinner service provides catered meals or restaurant pickup aboard a luxury bus touring Chicago\'s most scenic routes during golden hour.',
    applicableVehicles: ['luxury-party-bus', 'dinner-bus', 'tour-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 400,
      hourlyRate: 150,
      additionalInfo: '2-3 hour sunset tour package'
    },
    seoKeywords: ['dinner party bus', 'sunset tour chicago', 'mobile dining experience', 'romantic party bus'],
    faqs: [
      {
        question: 'Can we bring our own food?',
        answer: 'Yes, or we can arrange pickup from your favorite restaurant or catering service.'
      },
      {
        question: 'What routes do you take for sunset tours?',
        answer: 'Lakefront drives, architectural tours, and scenic overlooks timed for golden hour photography.'
      }
    ],
    relatedServices: ['romantic-celebration-tour', 'special-occasion-party-bus'],
    searchVolume: 1200,
    difficulty: 'low'
  },
  {
    id: 'casino-resort-weekend-trip',
    name: 'Casino Resort Weekend Trip',
    website: 'partyBus',
    category: 'Multi-Day',
    description: 'Multi-day casino resort packages with round-trip party bus transportation and hotel coordination.',
    longDescription: 'Full weekend casino getaway packages. We provide round-trip party bus service to casino resorts, coordinate hotel accommodations, and offer multiple-day transportation options.',
    applicableVehicles: ['party-bus-large', 'luxury-coach', 'overnight-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 800,
      additionalInfo: 'Weekend package, 2-3 days'
    },
    seoKeywords: ['casino weekend trip', 'casino resort package', 'weekend gambling trip', 'casino bus tour'],
    faqs: [
      {
        question: 'Do you coordinate hotel bookings?',
        answer: 'We can provide casino contact information and group booking assistance, but you arrange accommodations directly.'
      }
    ],
    relatedServices: ['casino-night-party-bus', 'weekend-getaway-transport'],
    searchVolume: 1500,
    difficulty: 'medium'
  },
  {
    id: 'vip-nightlife-experience',
    name: 'VIP Nightlife Experience',
    website: 'partyBus',
    category: 'VIP',
    description: 'Premium VIP nightlife package with luxury party bus, expedited entry, and table service coordination.',
    longDescription: 'The ultimate Chicago nightlife experience. Our VIP package includes luxury party bus, promoter connections for table service, skip-the-line entry, and white-glove service all night.',
    applicableVehicles: ['vip-party-bus', 'luxury-party-bus', 'executive-party-bus'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 500,
      hourlyRate: 200,
      additionalInfo: 'Premium VIP service with venue coordination'
    },
    seoKeywords: ['vip party bus', 'luxury nightlife chicago', 'vip club service', 'premium nightlife transport'],
    faqs: [
      {
        question: 'What VIP services are included?',
        answer: 'Luxury bus with premium amenities, promoter coordination for table service, and expedited venue entry.'
      },
      {
        question: 'Can you arrange bottle service?',
        answer: 'We connect you with venue promoters who handle bottle service arrangements directly.'
      }
    ],
    relatedServices: ['luxury-celebration-package', 'premium-entertainment-service'],
    searchVolume: 1800,
    difficulty: 'medium'
  },
  {
    id: 'custom-group-celebration',
    name: 'Custom Group Celebration',
    website: 'partyBus',
    category: 'Custom',
    description: 'Fully customizable party bus experience designed around your specific celebration needs and preferences.',
    longDescription: 'Your celebration, your way. We work with you to create a completely custom party bus experience, from route planning to decoration, music selection to venue coordination.',
    applicableVehicles: ['all-party-buses', 'customizable-fleet'],
    applicableLocations: 'all',
    pricing: {
      baseRate: 280,
      hourlyRate: 140,
      additionalInfo: 'Custom packages priced per requirements'
    },
    seoKeywords: ['custom party bus', 'personalized celebration', 'custom group event', 'flexible party transportation'],
    faqs: [
      {
        question: 'Can we create a completely unique itinerary?',
        answer: 'Absolutely! We specialize in custom experiences and welcome creative celebration ideas.'
      },
      {
        question: 'How far in advance should we book?',
        answer: 'For custom packages, we recommend 4-8 weeks to ensure availability and complete planning.'
      }
    ],
    relatedServices: ['special-event-coordination', 'unique-celebration-service'],
    searchVolume: 2400,
    difficulty: 'high'
  }
];

// Combine all services
export const ALL_SERVICES: ServiceData[] = [
  ...AIRPORT_SERVICES,
  ...CORPORATE_SERVICES,
  ...WEDDING_SERVICES,
  ...PARTY_BUS_SERVICES
];

// Validation function
export function validateServiceData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check total count
  if (ALL_SERVICES.length !== 80) {
    errors.push(`Expected 80 services, found ${ALL_SERVICES.length}`);
  }

  // Check per-website counts
  const airportCount = AIRPORT_SERVICES.length;
  const corporateCount = CORPORATE_SERVICES.length;
  const weddingCount = WEDDING_SERVICES.length;
  const partyBusCount = PARTY_BUS_SERVICES.length;

  if (airportCount !== 20) errors.push(`Airport: expected 20, found ${airportCount}`);
  if (corporateCount !== 20) errors.push(`Corporate: expected 20, found ${corporateCount}`);
  if (weddingCount !== 20) errors.push(`Wedding: expected 20, found ${weddingCount}`);
  if (partyBusCount !== 20) errors.push(`PartyBus: expected 20, found ${partyBusCount}`);

  // Check for duplicate IDs
  const ids = ALL_SERVICES.map(s => s.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate service IDs found: ${duplicates.join(', ')}`);
  }

  // Check required fields
  ALL_SERVICES.forEach(service => {
    if (!service.id) errors.push(`Service missing ID: ${service.name}`);
    if (!service.name) errors.push(`Service missing name: ${service.id}`);
    if (!service.description) errors.push(`Service ${service.id} missing description`);
    if (!service.seoKeywords || service.seoKeywords.length === 0) {
      errors.push(`Service ${service.id} missing SEO keywords`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// Initialize services in Firestore
export async function initializeServices(db: admin.firestore.Firestore): Promise<number> {
  console.log('🔧 Initializing 80 services...');

  const validation = validateServiceData();
  if (!validation.valid) {
    throw new Error(`Service validation failed: ${validation.errors.join(', ')}`);
  }

  let count = 0;
  const batch = db.batch();

  for (const service of ALL_SERVICES) {
    const serviceRef = db.collection('services').doc(service.id);
    batch.set(serviceRef, {
      ...service,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      status: 'active'
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully initialized ${count} services`);

  return count;
}
