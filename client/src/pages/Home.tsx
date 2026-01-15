import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Calendar, Check, Clock, Shield, Users, Car } from "lucide-react";
import { LocalBusinessSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/luxury_black_sedan_airport_terminal.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const faqItems = [
  {
    question: "Do you monitor flights?",
    answer: "Yes. We track arrivals and adjust pickup timing for ORD and MDW.",
  },
  {
    question: "Do you offer meet and greet?",
    answer: "Yes. Your chauffeur can meet you inside baggage claim with a name sign.",
  },
  {
    question: "What areas do you cover?",
    answer: "Downtown Chicago plus 50+ suburbs, including Naperville, Schaumburg, and Oak Brook.",
  },
  {
    question: "How is pricing calculated?",
    answer: "Quote-based flat rates with taxes and tolls itemized.",
  },
  {
    question: "Can I book last minute?",
    answer: "Often yes, subject to availability. For urgent trips, call dispatch.",
  },
  {
    question: "Do you provide curbside pickup and terminal meet?",
    answer: "Yes. Choose curbside pickup or inside meet-and-greet.",
  },
  {
    question: "Do you offer round trips and return pickups?",
    answer: "Yes. Schedule round-trip service for coordinated timing.",
  },
  {
    question: "What vehicles are available?",
    answer: "Sedans, SUVs, and sprinters. See the fleet page.",
  },
  {
    question: "Are child seats available?",
    answer: "Yes, on request. Mention ages and quantity when booking.",
  },
  {
    question: "Do you have corporate billing?",
    answer: "Yes. Contact dispatch to set up an account.",
  },
];

const comparisonPoints = [
  {
    icon: Clock,
    title: "Scheduled pickup with driver details",
    description: "Know exactly who's picking you up and when. We track your flight and adjust pickup times automatically.",
  },
  {
    icon: Shield,
    title: "Fixed quote once booked",
    description: "No surge pricing, no surprises. Your flat rate is locked in at booking time.",
  },
  {
    icon: Users,
    title: "Meet-and-greet available",
    description: "Your chauffeur can meet you inside baggage claim with a name sign for smoother arrivals.",
  },
  {
    icon: Car,
    title: "Multiple vehicle sizes",
    description: "Choose from sedans, SUVs, and sprinters based on your group size and luggage needs.",
  },
];

function SectionCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
      <Button 
        asChild 
        size="lg"
        data-testid="button-section-call"
      >
        <a href={PHONE_TEL}>
          <Phone className="w-4 h-4 mr-2" />
          Call {PHONE_DISPLAY}
        </a>
      </Button>
      <Button 
        asChild 
        variant="outline" 
        size="lg"
        data-testid="button-section-book"
      >
        <a 
          href={BOOKING_URL} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Online
        </a>
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <Layout>
      <SEO 
        title="Chicago Airport Black Car Service – O'Hare & Midway"
        description="Royal Carriage Airport Service — Scheduled pickup, no surge pricing, professional chauffeurs. Fixed rates to O'Hare & Midway airports. Flight tracking included. Book online or call (224) 801-3090."
        path="/"
      />
      <LocalBusinessSchema 
        image="https://chicagoairportblackcar.com/assets/luxury_black_sedan_airport_terminal.png"
      />
      <FAQSchema questions={faqItems} />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://chicagoairportblackcar.com" }
      ]} />
      <Hero
        title="Royal Carriage Airport Service — No Surge Pricing, Guaranteed Pickup"
        subtitle="Scheduled black car service to O'Hare & Midway • Fixed rates • Flight tracking • Professional chauffeurs • Never pay surge pricing"
        backgroundImage={heroImage}
        showTrustSignals={true}
        showTrustBadges={true}
      />

      <section className="py-12 md:py-16 bg-background" data-testid="section-ontime">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            On-time. Flight-tracked. Stress-free.
          </h2>
          <p className="text-muted-foreground text-lg mb-6 text-center">
            Our professional chauffeurs monitor your flight in real-time, ensuring they're there when you land — not when your flight was scheduled to arrive.
          </p>
          <ul className="space-y-3 max-w-xl mx-auto mb-6">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Automatic flight tracking for arrivals at O'Hare and Midway</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Driver details sent before pickup</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Complimentary 60-minute wait time for airport pickups</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Meet-and-greet available inside baggage claim</span>
            </li>
          </ul>
          <SectionCTA />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-accent" data-testid="section-coverage">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            Airport coverage that fits your itinerary
          </h2>
          <p className="text-muted-foreground text-lg mb-6 text-center">
            Whether you're heading to O'Hare, Midway, or flying private, we cover all Chicago-area airports with reliable black car service.
          </p>
          <ul className="space-y-3 max-w-xl mx-auto mb-6">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">O'Hare International Airport (ORD) — all terminals</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Midway International Airport (MDW)</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Downtown Chicago hotels and convention centers</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">50+ suburbs including Naperville, Schaumburg, and Oak Brook</span>
            </li>
          </ul>
          <SectionCTA />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background" data-testid="section-comparison">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            Black car vs Uber, taxi, and shuttle
          </h2>
          <p className="text-muted-foreground text-lg mb-8 text-center">
            Reserved black car service offers reliability and comfort that rideshare and taxi services simply can't match.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {comparisonPoints.map((point) => (
              <div 
                key={point.title} 
                className="flex gap-4 p-5 bg-accent rounded-lg"
                data-testid={`comparison-point-${point.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{point.title}</h3>
                  <p className="text-muted-foreground text-sm">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
          <SectionCTA />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-accent" data-testid="section-faq">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg mb-8 text-center">
            Everything you need to know about our black car service.
          </p>
          <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-border"
              >
                <AccordionTrigger 
                  className="text-left text-foreground hover:no-underline py-4"
                  data-testid={`faq-trigger-${index}`}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="text-muted-foreground"
                  data-testid={`faq-content-${index}`}
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
