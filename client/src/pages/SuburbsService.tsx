import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Phone, Calendar, MapPin, Plane, Building } from "lucide-react";
import { Link } from "wouter";
import { cities, getCitiesByRegion, allRegions, type City } from "@/data/cities";
import { LocalBusinessSchema, ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/lincoln_sedan_chicago_cityscape.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const faqs = [
  {
    question: "Do you service my suburb?",
    answer: "We serve 80+ cities across the Chicago metropolitan area including all western, northwestern, northern, southern, and far western suburbs. If you don't see your city listed, contact us—we likely provide service to your area."
  },
  {
    question: "How far in advance should I book for suburban pickups?",
    answer: "We recommend booking at least 24 hours in advance for standard suburban pickups. For early morning departures (before 6 AM), please book 48 hours ahead to ensure availability."
  },
  {
    question: "Is there an extra fee for suburban pickups?",
    answer: "No hidden fees. Our flat-rate pricing is based on distance from the airport. You'll receive an all-inclusive quote before booking that won't change regardless of traffic or weather."
  },
  {
    question: "Do you pick up from residential addresses?",
    answer: "Yes! We provide true door-to-door service, picking you up directly from your home, office, or any address in the Chicago suburbs."
  },
  {
    question: "How does pricing compare to airport parking?",
    answer: "For trips of 5+ days, our round-trip black car service often costs less than airport parking when you factor in gas, parking fees, and the convenience of door-to-door service."
  },
  {
    question: "Can you accommodate early morning or late night pickups?",
    answer: "Absolutely. We operate 24/7 and regularly handle 4 AM departures and late-night arrivals. Our chauffeurs are accustomed to early and late schedules."
  },
  {
    question: "What if my flight is delayed or arrives early?",
    answer: "We track all flights in real-time and adjust your pickup accordingly. There's no extra charge for flight delays—your driver will be waiting when you arrive."
  },
  {
    question: "Do you provide service to both O'Hare and Midway?",
    answer: "Yes! We provide transportation to both O'Hare (ORD) and Midway (MDW) airports from all Chicago suburbs."
  },
];

const regionLabels: Record<City["region"], string> = {
  "North Shore": "North Shore Suburbs",
  "West Suburbs": "Western Suburbs",
  "Northwest Suburbs": "Northwest Suburbs",
  "South Suburbs": "South Suburbs",
  "Southwest Suburbs": "Southwest Suburbs",
  "Far West Suburbs": "Far West Suburbs",
};

export default function SuburbsService() {
  const breadcrumbItems = [
    { name: "Home", url: "https://chicagoairportblackcar.com" },
    { name: "Suburbs Service", url: "https://chicagoairportblackcar.com/chicago-suburbs" }
  ];

  const featuredRegions: City["region"][] = [
    "North Shore",
    "West Suburbs",
    "Northwest Suburbs",
  ];

  const suburbCities = cities
    .filter(c => featuredRegions.includes(c.region))
    .slice(0, 20)
    .map(c => c.name);

  return (
    <Layout>
      <LocalBusinessSchema image={heroImage} />
      <ServiceSchema 
        name="Chicago Suburbs Airport Transportation Service"
        description="Professional black car service from Chicago suburbs to O'Hare and Midway airports"
        serviceType="Airport Transfer Service"
        areaServed={suburbCities}
        url="https://chicagoairportblackcar.com/chicago-suburbs"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQSchema questions={faqs} />
      
      <SEO 
        title="Chicago Suburbs Airport Transportation | 80+ Cities Served"
        description="Door-to-door airport transportation from Naperville, Schaumburg, Evanston, and 80+ Chicago suburbs to O'Hare and Midway. Flat-rate pricing, professional chauffeurs. Call (224) 801-3090."
        path="/airport-limo-suburbs"
      />
      <Hero
        title="Chicago Suburbs Airport Transportation"
        subtitle="Premium black car transportation from 80+ Chicago suburbs to O'Hare and Midway airports. Door-to-door service with professional chauffeurs."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Suburbs Service", href: "/airport-limo-suburbs" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Suburban Airport Transportation
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Living in the Chicago suburbs doesn't mean compromising on quality airport transportation. Our premium black car service provides door-to-door pickup from your home, office, or any location throughout the Chicagoland suburbs.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Whether you're in <Link href="/city/naperville" className="text-foreground underline hover:text-foreground/80">Naperville</Link> heading to <Link href="/ohare-airport-limo" className="text-foreground underline hover:text-foreground/80">O'Hare</Link>, or in <Link href="/city/evanston" className="text-foreground underline hover:text-foreground/80">Evanston</Link> catching a flight from <Link href="/midway-airport-limo" className="text-foreground underline hover:text-foreground/80">Midway</Link>, our professional chauffeurs provide reliable, comfortable service that eliminates the stress of airport parking and traffic navigation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Door-to-door pickup</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Flat-rate suburban pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Early morning & late night service</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Flight tracking included</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-suburbs-call">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-suburbs-book">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {cities.length}+ Chicago Suburbs Served
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select your city below for specific service details, distances to airports, and booking information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {allRegions.map((region) => {
              const regionCities = getCitiesByRegion(region);
              return (
                <div key={region} className="bg-background rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5" />
                    {regionLabels[region] || region}
                    <span className="text-sm font-normal text-muted-foreground">({regionCities.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {regionCities.map((city) => (
                      <Link 
                        key={city.slug} 
                        href={`/city/${city.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors py-1"
                        data-testid={`link-suburb-${city.slug}`}
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            Don't see your suburb? We serve the entire Chicagoland area. <Link href="/contact" className="text-foreground underline hover:text-foreground/80">Contact us</Link> for a quote.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Airport Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <Link href="/ohare-airport-limo" className="block p-6 bg-accent rounded-lg hover-elevate transition-all" data-testid="link-ohare-service">
              <Plane className="w-8 h-8 text-foreground mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">O'Hare Airport (ORD)</h3>
              <p className="text-sm text-muted-foreground">Black car service to Chicago O'Hare with flight tracking and meet-and-greet options.</p>
            </Link>
            <Link href="/midway-airport-limo" className="block p-6 bg-accent rounded-lg hover-elevate transition-all" data-testid="link-midway-service">
              <Plane className="w-8 h-8 text-foreground mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">Midway Airport (MDW)</h3>
              <p className="text-sm text-muted-foreground">Premium transportation to Chicago Midway with professional chauffeurs.</p>
            </Link>
            <Link href="/airport-limo-downtown-chicago" className="block p-6 bg-accent rounded-lg hover-elevate transition-all" data-testid="link-downtown-service">
              <Building className="w-8 h-8 text-foreground mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">Downtown Chicago</h3>
              <p className="text-sm text-muted-foreground">Airport transfers to the Loop, River North, Magnificent Mile, and beyond.</p>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" data-testid="button-suburbs-call-2">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-suburbs-book-2">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why Suburban Travelers Choose Black Car Service
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              For suburban residents, getting to the airport presents unique challenges. Long-term airport parking is expensive and requires shuttle buses. Rideshare availability varies by location and time of day. Public transportation often requires multiple transfers.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our black car service solves these problems with reliable door-to-door transportation. Your professional chauffeur arrives at your home, handles your luggage, and delivers you directly to your terminal. On the return, we're waiting when you land—no surge pricing, no searching for your ride.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">No airport parking hassle</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Guaranteed availability</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Professional chauffeur service</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Cost-effective for longer trips</span>
              </div>
            </div>

            <div className="bg-background p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Cost Comparison: Black Car vs. Airport Parking</h3>
              <p className="text-muted-foreground mb-4">
                Consider a week-long trip from Naperville to O'Hare:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span><strong>Airport parking:</strong> $15-22/day × 7 days = $105-154, plus gas and wear on your vehicle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span><strong>Rideshare (each way):</strong> $40-80 depending on surge, plus 15-20 min wait time</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span><strong>Black car round-trip:</strong> Competitive flat-rate with guaranteed service</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-suburbs-call-3">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-suburbs-book-3">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Suburban Airport Transportation FAQs
            </h2>
            <Accordion type="single" collapsible className="w-full" data-testid="accordion-suburbs-faq">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-trigger-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" data-testid="button-suburbs-call-4">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-suburbs-book-4">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
