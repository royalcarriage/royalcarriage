export interface SiteConfig {
  target: string;
  name: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  bookingUrl: string;
  domain: string; // Will be updated to actual domain once deployed
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours: string;
  address: string;
  analytics?: {
    googleAnalyticsId?: string; // GA4 Measurement ID (G-XXXXXXXXXX)
    googleAdsId?: string; // Google Ads ID (AW-XXXXXXXXXX)
    facebookPixelId?: string; // Facebook Pixel ID
  };
}

const GLOBAL_PHONE = "+12248013090";
const GLOBAL_PHONE_DISPLAY = "(224) 801-3090";
const BASE_BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info";

export const SITE_CONFIGS: Record<string, SiteConfig> = {
  airport: {
    target: "airport",
    name: "Chicago Airport Black Car Service - Royal Carriage Limousine",
    description:
      "Premium airport limousine service in Chicago. Professional transportation to O'Hare and Midway airports, downtown Chicago, and suburbs. Reliable, luxury black car service available 24/7.",
    phone: GLOBAL_PHONE,
    phoneDisplay: GLOBAL_PHONE_DISPLAY,
    bookingUrl: `${BASE_BOOKING_URL}?utm_source=airport&utm_medium=seo&utm_campaign=microsites`,
    domain: "https://chicagoairportblackcar.com",
    socialMedia: {
      facebook: "https://www.facebook.com/RoyalCarriageLimo",
      instagram: "https://www.instagram.com/royalcarriagelimo",
    },
    businessHours: "24/7 Service Available",
    address: "Chicago, IL",
    analytics: {
      googleAnalyticsId: "G-CC67CH86JR",
    },
  },
  corporate: {
    target: "corporate",
    name: "Chicago Executive Car Service - Royal Carriage Limousine",
    description:
      "Professional corporate black car service in Chicago. Executive transportation, hourly chauffeur services, and business travel solutions. Reliable, discreet, and punctual service for professionals.",
    phone: GLOBAL_PHONE,
    phoneDisplay: GLOBAL_PHONE_DISPLAY,
    bookingUrl: `${BASE_BOOKING_URL}?utm_source=corporate&utm_medium=seo&utm_campaign=microsites`,
    domain: "https://chicagoexecutivecarservice.com",
    socialMedia: {
      facebook: "https://www.facebook.com/RoyalCarriageLimo",
      instagram: "https://www.instagram.com/royalcarriagelimo",
      linkedin: "https://www.linkedin.com/company/royal-carriage-limousine",
    },
    businessHours: "24/7 Service Available",
    address: "Chicago, IL",
    analytics: {
      googleAnalyticsId: "G-CC67CH86JR",
    },
  },
  wedding: {
    target: "wedding",
    name: "Chicago Wedding Transportation - Royal Carriage Limousine",
    description:
      "Elegant wedding limousine service in Chicago. Professional transportation for weddings, bridal parties, and special occasions. Make your special day memorable with luxury vehicles and experienced chauffeurs.",
    phone: GLOBAL_PHONE,
    phoneDisplay: GLOBAL_PHONE_DISPLAY,
    bookingUrl: `${BASE_BOOKING_URL}?utm_source=wedding&utm_medium=seo&utm_campaign=microsites`,
    domain: "https://chicagoweddingtransportation.com",
    socialMedia: {
      facebook: "https://www.facebook.com/RoyalCarriageLimo",
      instagram: "https://www.instagram.com/royalcarriagelimo",
    },
    businessHours: "Available by Appointment",
    address: "Chicago, IL",
    analytics: {
      googleAnalyticsId: "G-CC67CH86JR",
    },
  },
  partybus: {
    target: "partybus",
    name: "Chicago Party Bus Rental - Royal Carriage Limousine",
    description:
      "Premium party bus rentals in Chicago. Perfect for birthdays, concerts, bachelor/bachelorette parties, and special events. Spacious, entertaining, and safe group transportation.",
    phone: GLOBAL_PHONE,
    phoneDisplay: GLOBAL_PHONE_DISPLAY,
    bookingUrl: `${BASE_BOOKING_URL}?utm_source=partybus&utm_medium=seo&utm_campaign=microsites`,
    domain: "https://chicago-partybus.com",
    socialMedia: {
      facebook: "https://www.facebook.com/RoyalCarriageLimo",
      instagram: "https://www.instagram.com/royalcarriagelimo",
    },
    businessHours: "Available by Appointment",
    address: "Chicago, IL",
    analytics: {
      googleAnalyticsId: "G-CC67CH86JR",
    },
  },
};

export function getSiteConfig(target: string): SiteConfig {
  return SITE_CONFIGS[target] || SITE_CONFIGS.airport;
}
