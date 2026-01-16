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
import {
  LocalBusinessSchema,
  ServiceSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/luxury_black_sedan_airport_terminal.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const arrivalsBullets = [
  "Curbside pickup outside baggage claim",
  "Real-time flight tracking included",
  "Name sign meet-and-greet available",
  "Single-terminal simplicity—we know MDW",
];

const vehiclesBullets = [
  "Executive sedans for business travelers",
  "SUVs for families and luggage",
  "Sprinter vans for larger groups",
  "Late-model, meticulously maintained fleet",
];

const whyReserveBullets = [
  "Flat-rate, quote-based pricing—no surge",
  "Licensed, insured, and compliant",
  "Professional chauffeurs who know Chicago",
  "24/7 dispatch and reservation support",
];

const faqItems = [
  {
    question: "Where do you meet passengers at Midway?",
    answer:
      "Curbside at the ground transportation area or inside baggage claim with a name sign—your choice.",
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
    question: "Is pricing flat-rate or surge-based?",
    answer: "Flat-rate, quote-based pricing.",
  },
  {
    question: "Do you offer meet-and-greet?",
    answer: "Yes. Meet-and-greet can be added for arrivals.",
  },
  {
    question: "Can you do airport-to-airport transfers?",
    answer: "Yes. We handle MDW to ORD transfers and vice versa.",
  },
  {
    question: "What airlines fly out of Midway?",
    answer:
      "Southwest, Delta, Porter, Volaris, and Frontier primarily operate from MDW.",
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

export default function MidwayAirport() {
  return (
    <Layout>
      <SEO
        title="Midway Airport Limo Service (MDW)"
        description="Professional black car service to Chicago Midway International Airport (MDW). Flight tracking, meet & greet, curbside pickup. Licensed chauffeurs and flat-rate pricing. Call (224) 801-3090."
        path="/midway-airport-limo"
      />
      <LocalBusinessSchema image={heroImage} />
      <ServiceSchema
        name="Midway Airport Limousine Service"
        description="Professional black car service to and from Chicago Midway International Airport with flight tracking and meet & greet."
        serviceType="Airport Transfer Service"
        areaServed={["Chicago", "Midway Airport", "MDW", "Southwest Side"]}
        url="https://chicagoairportblackcar.com/midway-airport-limo"
      />
      <FAQSchema questions={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chicagoairportblackcar.com" },
          {
            name: "Midway Airport",
            url: "https://chicagoairportblackcar.com/midway-airport-limo",
          },
        ]}
      />
      <Hero
        title="Midway Airport Limo Service (MDW)"
        subtitle="Private car service to and from Chicago Midway. Professional chauffeurs, real-time flight tracking, and flat-rate pricing."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Midway Airport", href: "/midway-airport-limo" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              MDW arrivals made simple
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Skip the taxi queue and rideshare wait. Your chauffeur tracks your
              flight and waits curbside or meets you inside baggage
              claim—whichever you prefer. Midway's single-terminal layout means
              quick pickups, and our drivers know exactly where to position for
              fastest boarding.
            </p>

            <BulletList items={arrivalsBullets} />
            <DualCTAs
              callTestId="button-midway-arrivals-call"
              bookTestId="button-midway-arrivals-book"
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
              meticulously maintained, and stocked with bottled water and phone
              chargers.
            </p>

            <BulletList items={vehiclesBullets} />
            <DualCTAs
              callTestId="button-midway-vehicles-call"
              bookTestId="button-midway-vehicles-book"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why reserve a private car for MDW?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Midway is compact but can get crowded at the curb. Rideshare
              pickups mean waiting in a designated lot, and taxis add stress you
              don't need. Our reservation-first model means your driver is
              confirmed before you land. Check our{" "}
              <Link href="/pricing" className="text-foreground underline">
                pricing
              </Link>{" "}
              for transparent, flat-rate quotes.
            </p>

            <BulletList items={whyReserveBullets} />
            <DualCTAs
              callTestId="button-midway-why-call"
              bookTestId="button-midway-why-book"
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
                  data-testid={`faq-item-mdw-${index}`}
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
                callTestId="button-midway-faq-call"
                bookTestId="button-midway-faq-book"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
