/**
 * JSON-LD Structured Data Component
 * Generates Schema.org markup for improved SEO and rich snippets
 */

import React from "react";

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  priceRange?: string;
  image?: string;
}

interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: string;
  serviceType: string;
  areaServed: string[];
  url?: string;
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

const BUSINESS_DEFAULTS = {
  name: "Royal Carriage Limousine",
  telephone: "+12248013090",
  url: "https://chicagoairportblackcar.com",
  description:
    "Premium black car and limousine service in Chicago. Airport transfers, corporate transportation, and special events.",
  address: {
    street: "",
    city: "Chicago",
    state: "IL",
    postalCode: "60601",
    country: "US",
  },
  priceRange: "$$",
};

export function LocalBusinessSchema({
  name = BUSINESS_DEFAULTS.name,
  description = BUSINESS_DEFAULTS.description,
  url = BUSINESS_DEFAULTS.url,
  telephone = BUSINESS_DEFAULTS.telephone,
  address = BUSINESS_DEFAULTS.address,
  priceRange = BUSINESS_DEFAULTS.priceRange,
  image,
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    name,
    description,
    url,
    telephone,
    priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country || "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.8781,
      longitude: -87.6298,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "200",
      bestRating: "5",
      worstRating: "1",
    },
    openingHoursSpecification: {
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
    },
    ...(image && { image }),
    sameAs: [
      "https://www.facebook.com/royalcarriagelimo",
      "https://www.instagram.com/royalcarriagelimo",
    ],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 41.8781,
        longitude: -87.6298,
      },
      geoRadius: "80000", // 50 miles in meters
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema({
  name,
  description,
  provider = BUSINESS_DEFAULTS.name,
  serviceType,
  areaServed,
  url,
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "LocalBusiness",
      name: provider,
    },
    serviceType,
    areaServed: areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    ...(url && { url }),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
