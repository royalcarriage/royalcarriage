import { useParams } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Phone, Calendar, Plane, MapPin, Building, Car } from "lucide-react";
import { Link } from "wouter";
import { getCityBySlug, getRelatedCities, getCitiesByRegion } from "@/data/cities";
import NotFound from "./not-found";

import heroImage from "@assets/generated_images/lincoln_sedan_chicago_cityscape.png";

const PHONE_NUMBER = "+1 (224) 801-3090";
const PHONE_TEL = "tel:+12248013090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

function generateFAQs(cityName: string, distanceToOhare: string, distanceToMidway: string) {
  const ohareMiles = parseInt(distanceToOhare) || 30;
  const midwayMiles = parseInt(distanceToMidway) || 25;
  const ohareMinTime = Math.round(ohareMiles * 1.5);
  const ohareMaxTime = Math.round(ohareMiles * 2);
  const midwayMinTime = Math.round(midwayMiles * 1.5);
  const midwayMaxTime = Math.round(midwayMiles * 2);

  return [
    {
      question: `How long is the ride from ${cityName} to O'Hare?`,
      answer: `${cityName} is ${distanceToOhare} from O'Hare. Plan ${ohareMinTime}–${ohareMaxTime} minutes depending on traffic.`
    },
    {
      question: `How long is the ride from ${cityName} to Midway?`,
      answer: `${cityName} is ${distanceToMidway} from Midway. Plan ${midwayMinTime}–${midwayMaxTime} minutes depending on traffic.`
    },
    {
      question: `Do you serve all of ${cityName}?`,
      answer: `Yes. Door-to-door service throughout ${cityName} including all neighborhoods and surrounding areas.`
    },
    {
      question: "Is pricing flat-rate?",
      answer: "Yes. Quote-based flat rates with taxes and tolls itemized. No surge pricing."
    },
    {
      question: "Do you track flights?",
      answer: "Yes. We monitor all arrivals at O'Hare and Midway and adjust pickup times automatically."
    },
    {
      question: "Are child seats available?",
      answer: "Yes, on request. Mention ages and quantity when booking."
    },
    {
      question: `Do you provide ${cityName} to Downtown Chicago service?`,
      answer: `Yes. We provide scheduled pickups and drop-offs between ${cityName} and Downtown Chicago including the Loop, River North, and Magnificent Mile.`
    },
    {
      question: "Do you offer meet-and-greet inside the terminal?",
      answer: "Yes. Meet-and-greet can be arranged at baggage claim with a name sign."
    },
    {
      question: "What vehicles do you recommend for groups?",
      answer: "SUVs accommodate 4-6 passengers with luggage. Sprinter vans are ideal for larger groups."
    },
    {
      question: "Can I schedule a round-trip?",
      answer: "Yes. Book round-trip service for coordinated timing and preferred chauffeur continuity."
    }
  ];
}

function DualCTAs({ callTestId, bookTestId }: { callTestId: string; bookTestId: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button asChild size="lg" data-testid={callTestId}>
        <a href={PHONE_TEL}>
          <Phone className="w-5 h-5 mr-2" />
          {PHONE_NUMBER}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline" data-testid={bookTestId}>
        <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          <Calendar className="w-5 h-5 mr-2" />
          Book Online
        </a>
      </Button>
    </div>
  );
}

const serviceLinks = [
  { 
    href: "/ohare-airport-limo", 
    icon: Plane, 
    title: "O'Hare Airport", 
    description: "ORD transfers with flight tracking" 
  },
  { 
    href: "/midway-airport-limo", 
    icon: Plane, 
    title: "Midway Airport", 
    description: "MDW pickups and drop-offs" 
  },
  { 
    href: "/airport-limo-downtown-chicago", 
    icon: Building, 
    title: "Downtown Chicago", 
    description: "Loop, River North, Mag Mile" 
  },
  { 
    href: "/airport-limo-suburbs", 
    icon: MapPin, 
    title: "All Suburbs", 
    description: "80+ Chicago area cities" 
  },
];

export default function CityPage() {
  const params = useParams<{ slug: string }>();
  const city = getCityBySlug(params.slug || "");

  if (!city) {
    return <NotFound />;
  }

  const faqs = generateFAQs(city.name, city.distanceToOhare, city.distanceToMidway);
  const relatedCities = getRelatedCities(city.slug, 8);
  const regionCities = getCitiesByRegion(city.region).filter(c => c.slug !== city.slug).slice(0, 6);

  return (
    <Layout>
      <SEO
        title={`Airport Car Service ${city.name}, IL | O'Hare & Midway Transportation`}
        description={city.metaDescription}
        path={`/city/${city.slug}`}
      />
      <Hero
        title={`${city.name} Airport Car Service`}
        subtitle={`Premium black car transportation from ${city.name} to O'Hare (${city.distanceToOhare}) and Midway (${city.distanceToMidway}). Professional chauffeurs, flat-rate pricing, and 24/7 availability.`}
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Suburbs", href: "/airport-limo-suburbs" },
          { label: city.name, href: `/city/${city.slug}` },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {city.name} Airport Transportation
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Chicago Airport Black Car provides reliable {city.name} airport transportation to both <Link href="/ohare-airport-limo" className="text-foreground underline hover:text-foreground/80">O'Hare International Airport</Link> ({city.distanceToOhare}) and <Link href="/midway-airport-limo" className="text-foreground underline hover:text-foreground/80">Midway Airport</Link> ({city.distanceToMidway}). Our professional chauffeurs deliver door-to-door service with flight tracking and flat-rate pricing.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We also provide {city.name} to <Link href="/airport-limo-downtown-chicago" className="text-foreground underline hover:text-foreground/80">Downtown Chicago</Link> transportation for business meetings, events, and dining. Explore our full <Link href="/airport-limo-suburbs" className="text-foreground underline hover:text-foreground/80">suburban service area</Link> covering 80+ Chicago area cities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-background" />
                </div>
                <span className="text-foreground">O'Hare: {city.distanceToOhare}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-background" />
                </div>
                <span className="text-foreground">Midway: {city.distanceToMidway}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-background" />
                </div>
                <span className="text-foreground">Flight tracking included</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-background" />
                </div>
                <span className="text-foreground">Flat-rate pricing</span>
              </div>
            </div>

            <DualCTAs callTestId="button-city-call-1" bookTestId="button-city-book-1" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Airport & Transportation Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {serviceLinks.map((service) => (
              <Link 
                key={service.href} 
                href={service.href}
                className="bg-background rounded-lg p-6 hover-elevate transition-all block"
                data-testid={`link-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <service.icon className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              View our <Link href="/fleet" className="text-foreground underline hover:text-foreground/80">luxury fleet</Link> or check <Link href="/pricing" className="text-foreground underline hover:text-foreground/80">pricing</Link> for your route.
            </p>
            <DualCTAs callTestId="button-city-call-2" bookTestId="button-city-book-2" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why {city.name} Travelers Choose Us
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {city.name} residents expect reliable, professional transportation for airport travel. Unlike rideshare services with unpredictable pricing and driver quality, our <Link href="/fleet" className="text-foreground underline hover:text-foreground/80">luxury fleet</Link> delivers consistent service every time. We're licensed, insured, and committed to on-time arrivals.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Whether you're heading to <Link href="/ohare-airport-limo" className="text-foreground underline hover:text-foreground/80">O'Hare</Link> for an early morning flight or returning from <Link href="/midway-airport-limo" className="text-foreground underline hover:text-foreground/80">Midway</Link> late at night, our chauffeurs monitor your flight and adjust pickup times automatically. We serve all {city.region} communities including {regionCities.slice(0, 3).map(c => c.name).join(", ")}, and more.
            </p>

            <div className="bg-accent rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Service Areas in {city.name}</h3>
              <div className="flex flex-wrap gap-2">
                {city.neighborhoods.map((neighborhood, index) => (
                  <span 
                    key={index} 
                    className="bg-background px-3 py-1 rounded-full text-sm text-muted-foreground"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>

            <DualCTAs callTestId="button-city-call-3" bookTestId="button-city-book-3" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Nearby {city.region} Cities We Serve
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {regionCities.map((nearbyCity) => (
              <Link
                key={nearbyCity.slug}
                href={`/city/${nearbyCity.slug}`}
                className="bg-background rounded-lg p-4 hover-elevate transition-all block"
                data-testid={`link-city-${nearbyCity.slug}`}
              >
                <h3 className="font-semibold text-foreground mb-1">{nearbyCity.name}</h3>
                <p className="text-xs text-muted-foreground">ORD: {nearbyCity.distanceToOhare}</p>
                <p className="text-xs text-muted-foreground">MDW: {nearbyCity.distanceToMidway}</p>
              </Link>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Other Chicago Area Cities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {relatedCities.filter(c => c.region !== city.region).map((relatedCity) => (
              <Link
                key={relatedCity.slug}
                href={`/city/${relatedCity.slug}`}
                className="bg-background rounded-lg p-4 hover-elevate transition-all block"
                data-testid={`link-related-city-${relatedCity.slug}`}
              >
                <h3 className="font-semibold text-foreground mb-1">{relatedCity.name}</h3>
                <p className="text-xs text-muted-foreground">{relatedCity.region}</p>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/airport-limo-suburbs">
              <Button variant="outline" size="lg" data-testid="button-view-all-cities">
                <Car className="w-5 h-5 mr-2" />
                View All 80+ Cities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              {city.name} Airport Transportation FAQ
            </h2>
            <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8">
              <DualCTAs callTestId="button-city-call-4" bookTestId="button-city-book-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Book Your {city.name} Airport Car Service
          </h2>
          <p className="text-background/80 text-lg mb-8 max-w-2xl mx-auto">
            Professional chauffeurs, luxury vehicles, and reliable service from {city.name} to O'Hare, Midway, and Downtown Chicago.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" data-testid="button-city-final-call">
              <a href={PHONE_TEL}>
                <Phone className="w-5 h-5 mr-2" />
                {PHONE_NUMBER}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background text-background hover:bg-background hover:text-foreground" data-testid="button-city-final-book">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-5 h-5 mr-2" />
                Book Online Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
