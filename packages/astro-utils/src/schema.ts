import type { SiteConfig } from "./config";

export interface LocalBusinessSchemaProps {
  config: SiteConfig;
  url: string;
}

export function generateLocalBusinessSchema(props: LocalBusinessSchemaProps) {
  const { config, url: _url } = props;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${config.domain}/#organization`,
    name: "Royal Carriage Limousine",
    alternateName: config.name,
    description: config.description,
    url: config.domain,
    telephone: config.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chicago",
      addressRegion: "IL",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.8781,
      longitude: -87.6298,
    },
    openingHoursSpecification:
      config.businessHours === "24/7 Service Available"
        ? {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          }
        : {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
    sameAs: Object.values(config.socialMedia).filter(Boolean),
    priceRange: "$$$",
    image: `${config.domain}/images/logo.png`,
    logo: {
      "@type": "ImageObject",
      url: `${config.domain}/images/logo.png`,
    },
  };
}

export interface ServiceSchemaProps {
  config: SiteConfig;
  serviceName: string;
  serviceDescription: string;
  serviceType: string;
  url: string;
}

export function generateServiceSchema(props: ServiceSchemaProps) {
  const {
    config,
    serviceName,
    serviceDescription,
    serviceType,
    url: _url,
  } = props;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${config.domain}/#organization`,
      name: "Royal Carriage Limousine",
    },
    name: serviceName,
    description: serviceDescription,
    areaServed: {
      "@type": "City",
      name: "Chicago",
      "@id": "https://en.wikipedia.org/wiki/Chicago",
    },
    url: _url,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceRange: "$$$",
    },
  };
}

export interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function generateFAQSchema(props: FAQSchemaProps) {
  const { faqs } = props;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface AggregateRatingSchemaProps {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export function generateAggregateRatingSchema(
  props: AggregateRatingSchemaProps,
) {
  const { ratingValue, reviewCount, bestRating = 5, worstRating = 1 } = props;

  return {
    "@type": "AggregateRating",
    ratingValue,
    reviewCount,
    bestRating,
    worstRating,
  };
}
