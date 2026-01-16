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
import {
  Check,
  Phone,
  Calendar,
  Shield,
  Clock,
  CreditCard,
} from "lucide-react";
import { Link } from "wouter";
import {
  LocalBusinessSchema,
  BreadcrumbSchema,
  FAQSchema,
} from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/lincoln_sedan_chicago_cityscape.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const pricingFeatures = [
  "All-inclusive flat rates",
  "No surge pricing, ever",
  "Tolls and fees included",
  "Free flight delay wait time",
  "No hidden charges",
  "Transparent billing",
];

const faqs = [
  {
    question: "How do I get a price quote?",
    answer:
      "You can get an instant quote through our online booking system or call us at (224) 801-3090. Just provide your pickup location, destination, vehicle preference, and travel date for an immediate all-inclusive price.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express, Discover) as well as cash. You can pay online when booking or in the vehicle after your trip.",
  },
  {
    question: "Are tolls included in my quote?",
    answer:
      "Yes! All tolls, airport fees, and applicable taxes are included in your quoted price. The rate we quote is the rate you pay—no surprises.",
  },
  {
    question: "Is gratuity included?",
    answer:
      "Gratuity is not included in the quoted fare. Tipping is appreciated but always at your discretion. A standard tip is 15-20% of the fare.",
  },
  {
    question: "What's your cancellation policy?",
    answer:
      "You can cancel free of charge up to 4 hours before your scheduled pickup. Cancellations within 4 hours may be subject to a cancellation fee. We understand plans change and try to be as flexible as possible.",
  },
  {
    question: "Do you charge extra for flight delays?",
    answer:
      "No. We track your flight in real-time and adjust your pickup time automatically. If your flight is delayed by any amount, there's no additional charge—your quoted price remains the same.",
  },
  {
    question: "Is there a minimum fare?",
    answer:
      "Our rates are based on distance and vehicle type. We don't have a separate minimum fare, but shorter trips may have a base rate that reflects the cost of providing premium service.",
  },
  {
    question: "Do you offer round-trip discounts?",
    answer:
      "Yes! When you book round-trip service, you'll receive special pricing. Ask about our frequent traveler rates for regular business travelers.",
  },
];

export default function Pricing() {
  const breadcrumbItems = [
    { name: "Home", url: "https://chicagoairportblackcar.com" },
    { name: "Pricing", url: "https://chicagoairportblackcar.com/pricing" },
  ];

  return (
    <Layout>
      <LocalBusinessSchema image={heroImage} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQSchema questions={faqs} />

      <SEO
        title="Transparent Flat-Rate Pricing"
        description="Know your fare upfront with our flat-rate airport pricing. No surge pricing, no hidden fees. All-inclusive rates for O'Hare and Midway airport transfers. Get a quote today."
        path="/pricing"
      />
      <Hero
        title="Transparent, Flat-Rate Pricing"
        subtitle="Know your fare upfront. Our flat-rate pricing means no surprises—just reliable, professional service at a fair price."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Pricing", href: "/pricing" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              How Our Pricing Works
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 text-center">
              We believe in transparent, honest pricing. When you request a
              quote, you'll receive an all-inclusive flat rate based on your
              pickup location, destination, and vehicle choice. That rate is
              guaranteed—no matter what traffic looks like, how long your flight
              is delayed, or what route we take.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-accent rounded-lg text-center">
                <Shield className="w-10 h-10 mx-auto mb-4 text-foreground" />
                <h3 className="font-semibold mb-2">Guaranteed Rates</h3>
                <p className="text-sm text-muted-foreground">
                  Your quoted price is your final price
                </p>
              </div>
              <div className="p-6 bg-accent rounded-lg text-center">
                <Clock className="w-10 h-10 mx-auto mb-4 text-foreground" />
                <h3 className="font-semibold mb-2">No Wait Time Fees</h3>
                <p className="text-sm text-muted-foreground">
                  Free waiting for flight delays
                </p>
              </div>
              <div className="p-6 bg-accent rounded-lg text-center">
                <CreditCard className="w-10 h-10 mx-auto mb-4 text-foreground" />
                <h3 className="font-semibold mb-2">Easy Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Pay online or in the vehicle
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" data-testid="button-pricing-call">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-pricing-book"
              >
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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              What's Included in Every Fare
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {pricingFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 bg-background p-4 rounded-lg"
                >
                  <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button asChild size="lg" data-testid="button-pricing-quote">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Get Your Quote
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Pricing Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Sample Rates (Base Fare)
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Final price includes taxes, tolls, and fees. No surge pricing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-accent p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  O'Hare Airport (ORD)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">
                      To Downtown Chicago
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">From $85*</div>
                      <div className="text-xs text-muted-foreground">Sedan</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">
                      To Downtown (SUV)
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        From $115*
                      </div>
                      <div className="text-xs text-muted-foreground">SUV</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      To Naperville/Suburbs
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        From $105*
                      </div>
                      <div className="text-xs text-muted-foreground">Sedan</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Midway Airport (MDW)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">
                      To Downtown Chicago
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">From $70*</div>
                      <div className="text-xs text-muted-foreground">Sedan</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">
                      To Downtown (SUV)
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">From $95*</div>
                      <div className="text-xs text-muted-foreground">SUV</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      To Schaumburg/Suburbs
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-foreground">From $85*</div>
                      <div className="text-xs text-muted-foreground">Sedan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Hourly Charter Service
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-muted-foreground">
                    Executive sedan or SUV by the hour
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    3-hour minimum • Ideal for business meetings, city tours,
                    events
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground text-xl">
                    $95/hr
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">*Base rates shown.</strong>{" "}
                Final price includes all taxes, tolls, and airport fees. No
                surge pricing, ever. Book online or call for exact quote based
                on your specific pickup/drop-off locations.
              </p>
            </div>

            <div className="bg-accent p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                Why Our Rates Beat Ride-Share:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      No Surge Pricing
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Price locked at booking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Scheduled Pickup
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Not "5 min away" uncertainty
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Flight Tracking
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Driver adjusts for delays
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Professional Driver
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Licensed chauffeur, not random
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Request a Custom Quote
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Every trip is unique, and we provide personalized quotes based on
              your specific needs. Whether you're traveling from{" "}
              <Link
                href="/airport-limo-downtown-chicago"
                className="text-foreground underline"
              >
                downtown Chicago
              </Link>
              , a{" "}
              <Link
                href="/airport-limo-suburbs"
                className="text-foreground underline"
              >
                suburban location
              </Link>
              , or need multi-stop service, we'll provide a competitive flat
              rate.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Getting a quote is easy—just tell us where you're going and when:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Pickup address or location
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Destination (airport or address)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Date and preferred pickup time
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Number of passengers and bags
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-accent p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Call Us Directly</h3>
                <p className="text-muted-foreground mb-4">
                  Speak with our team for immediate quotes and booking.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  data-testid="button-pricing-call-2"
                >
                  <a href={PHONE_TEL}>
                    <Phone className="w-4 h-4 mr-2" />
                    {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>
              <div className="bg-accent p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Book Online</h3>
                <p className="text-muted-foreground mb-4">
                  Get an instant quote and book your ride online.
                </p>
                <Button
                  asChild
                  className="w-full"
                  data-testid="button-pricing-book-2"
                >
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Get Quote Online
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Pricing FAQs
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              data-testid="accordion-pricing-faq"
            >
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger
                    className="text-left"
                    data-testid={`faq-trigger-${index}`}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" data-testid="button-pricing-call-3">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-pricing-book-3"
              >
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
