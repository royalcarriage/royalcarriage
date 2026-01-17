import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Phone, Calendar } from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/generated_images/luxury_black_sedan_airport_terminal.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const arrivalsBullets = [
  "Curbside or inside baggage claim pickup",
  "Real-time flight tracking—no early wake-ups",
  "Name sign meet-and-greet available",
  "All ORD terminals covered (1, 2, 3, and 5)",
];

const vehiclesBullets = [
  "Executive sedans for solo travelers",
  "SUVs for families and extra luggage",
  "Sprinter vans for groups up to 14",
  "Late-model, immaculately maintained fleet",
];

const whyReserveBullets = [
  "Flat-rate, quote-based pricing—no surge",
  "Licensed, insured, and compliant",
  "Professional chauffeurs who know Chicago",
  "24/7 dispatch and reservation support",
];

const faqItems = [
  {
    question: "Where do you meet passengers?",
    answer: "Curbside or inside baggage claim with a name sign—your choice.",
  },
  {
    question: "Do you wait if my flight is delayed?",
    answer: "Yes. We track flights and adjust pickup timing based on arrivals.",
  },
  {
    question: "Can you handle group arrivals?",
    answer:
      "Yes. Sprinters and multiple vehicles are available with coordinated staging.",
  },
  {
    question: "Do you serve FBOs?",
    answer: "Yes. We service Atlantic, Signature, and all ORD FBOs.",
  },
  {
    question: "Is pricing flat-rate or surge-based?",
    answer: "Flat-rate, quote-based pricing.",
  },
  {
    question: "Can you pick up at specific ORD terminals?",
    answer: "Yes. We coordinate terminal-specific pickup instructions.",
  },
  {
    question: "Do you offer meet-and-greet?",
    answer: "Yes. Meet-and-greet can be added for arrivals.",
  },
  {
    question: "Are gratuities included?",
    answer:
      "Quote-based; gratuity can be included or added per rider preference.",
  },
];

function DualCTAs({
  callTestId,
  bookTestId,
}: {
  callTestId: string;
  bookTestId: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button asChild size="lg" data-testid={callTestId}>
        <a href={PHONE_TEL}>
          <Phone className="w-5 h-5 mr-2" />
          Call {PHONE_DISPLAY}
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

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-background" />
          </div>
          <span className="text-foreground">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function OHareAirport() {
  return (
    <Layout>
      <SEO
        title="O'Hare Airport Limo Service (ORD)"
        description="Professional black car service to Chicago O'Hare International Airport (ORD). Flight tracking, meet & greet, curbside pickup. Licensed chauffeurs and flat-rate pricing. Call (224) 801-3090."
        path="/ohare-airport-limo"
      />
      <Hero
        title="O'Hare Airport Limo Service (ORD)"
        subtitle="Private car service to and from Chicago O'Hare. Professional chauffeurs, real-time flight tracking, and flat-rate pricing."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "O'Hare Airport", href: "/ohare-airport-limo" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              ORD arrivals made simple
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Skip the taxi line and rideshare surge. Your chauffeur tracks your
              flight and waits curbside or meets you inside baggage
              claim—whichever you prefer. Whether you're landing at Terminal 1,
              2, 3, or International Terminal 5, we handle the logistics so you
              can focus on what's next.
            </p>

            <BulletList items={arrivalsBullets} />
            <DualCTAs
              callTestId="button-ohare-arrivals-call"
              bookTestId="button-ohare-arrivals-book"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Premium vehicles for every itinerary
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              From executive sedans for quick downtown trips to Sprinter vans
              for corporate groups, our{" "}
              <Link href="/fleet" className="text-foreground underline">
                fleet
              </Link>{" "}
              matches your travel style. Every vehicle is late-model,
              immaculately maintained, and stocked with bottled water and phone
              chargers.
            </p>

            <BulletList items={vehiclesBullets} />
            <DualCTAs
              callTestId="button-ohare-vehicles-call"
              bookTestId="button-ohare-vehicles-book"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why reserve a private car for ORD?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              O'Hare is one of the busiest airports in the world. Rideshare
              pickups can take 20+ minutes during peak hours, and taxis add
              stress you don't need after a long flight. Our reservation-first
              model means your driver is confirmed before you land. Check our{" "}
              <Link href="/pricing" className="text-foreground underline">
                pricing
              </Link>{" "}
              for transparent, flat-rate quotes.
            </p>

            <BulletList items={whyReserveBullets} />
            <DualCTAs
              callTestId="button-ohare-why-call"
              bookTestId="button-ohare-why-book"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-muted-foreground mb-6">
                Have more questions?{" "}
                <Link href="/contact" className="text-foreground underline">
                  Contact us
                </Link>{" "}
                or call directly.
              </p>
              <DualCTAs
                callTestId="button-ohare-faq-call"
                bookTestId="button-ohare-faq-book"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
