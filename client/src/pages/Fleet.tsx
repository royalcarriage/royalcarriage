import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { FleetCard } from "@/components/FleetCard";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Phone, Calendar } from "lucide-react";
import {
  LocalBusinessSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/luxury_black_suv_downtown_chicago.png";
import suvImage from "@assets/stock_images/luxury_black_limousi_51737498.jpg";
import sedanImage from "@assets/stock_images/luxury_black_limousi_2ea6bdf3.jpg";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const vehicles = [
  {
    name: "Executive SUV",
    image: suvImage,
    passengers: 6,
    luggage: 6,
    features: [
      "Spacious leather interior",
      "Individual climate controls",
      "Complimentary bottled water",
      "USB charging at every seat",
      "Privacy glass windows",
      "Extra legroom throughout",
    ],
    description:
      "Our Executive SUV is the perfect choice for families, small groups, or business travelers who need extra space. With room for up to 6 passengers and ample luggage capacity, you'll travel in comfort without compromising on style.",
  },
  {
    name: "Executive Sedan",
    image: sedanImage,
    passengers: 3,
    luggage: 3,
    features: [
      "Premium leather seating",
      "Dual-zone climate control",
      "Complimentary bottled water",
      "Phone chargers available",
      "Privacy glass windows",
      "Quiet, smooth ride",
    ],
    description:
      "Our Executive Sedan offers an elegant, refined transportation experience ideal for business travelers and couples. Sink into premium leather seats and enjoy a peaceful journey to or from the airport.",
  },
];

const faqs = [
  {
    question: "Which vehicle should I choose for my group?",
    answer:
      "For 1-3 passengers with standard luggage, our Executive Sedan is ideal. For 4-6 passengers, families with car seats, or anyone with extra luggage, choose our Executive SUV for maximum comfort and space.",
  },
  {
    question: "What amenities are included in every vehicle?",
    answer:
      "All vehicles include complimentary bottled water, phone charging cables, climate control, and premium leather seating. Our chauffeurs also provide luggage assistance and meet-and-greet service at airports.",
  },
  {
    question: "How old are your vehicles?",
    answer:
      "We maintain a modern fleet with vehicles no more than 3 years old. All vehicles undergo daily inspections and are thoroughly cleaned between each trip to ensure a pristine experience.",
  },
  {
    question: "Can I request a specific vehicle type?",
    answer:
      "Absolutely. When booking, you'll select either our Executive Sedan or Executive SUV. Your vehicle choice is confirmed with your reservation, so you'll know exactly what to expect.",
  },
  {
    question: "Do you provide car seats for children?",
    answer:
      "Yes, we can provide child safety seats upon request. Please mention the ages and number of children when booking so we can have appropriate seats ready for your trip.",
  },
  {
    question: "Is there enough room for golf clubs or oversized luggage?",
    answer:
      "Our Executive SUV can accommodate golf clubs, skis, and other oversized items. For the Sedan, please call ahead if you have large or unusual items so we can confirm fit or suggest the SUV.",
  },
];

export default function Fleet() {
  return (
    <Layout>
      <SEO
        title="Our Premium Fleet – Executive SUV & Sedan"
        description="Travel in luxury with our Executive SUV and Sedan fleet. Leather interiors, complimentary water, USB charging. Professional chauffeur service for Chicago airport transportation."
        path="/fleet"
      />
      <Hero
        title="Our Premium Fleet"
        subtitle="Travel in style with our meticulously maintained luxury vehicles. Every ride features professional chauffeurs, complimentary amenities, and first-class service."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Fleet", href: "/fleet" },
        ]}
      />

      <section
        className="py-16 md:py-24 bg-background"
        data-testid="section-fleet-detail"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Choose Your Vehicle
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Both of our vehicle options provide a premium experience with
              professional chauffeurs, complimentary amenities, and spotless
              interiors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {vehicles.map((vehicle) => (
              <FleetCard key={vehicle.name} {...vehicle} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" data-testid="button-fleet-call">
              <a href={PHONE_TEL}>
                <Phone className="w-5 h-5 mr-2" />
                Call {PHONE_DISPLAY}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-testid="button-fleet-book"
            >
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-5 h-5 mr-2" />
                Book Online
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              What's Included in Every Ride
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Professional Chauffeur</h3>
                <p className="text-sm text-muted-foreground">
                  Licensed, insured, and trained for excellence
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Flight Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  We monitor delays and adjust automatically
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Complimentary Water</h3>
                <p className="text-sm text-muted-foreground">
                  Bottled water available in every vehicle
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Device Charging</h3>
                <p className="text-sm text-muted-foreground">
                  USB ports and phone chargers available
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Luggage Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Your driver handles all luggage
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Meet & Greet</h3>
                <p className="text-sm text-muted-foreground">
                  Driver meets you with name sign at arrivals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Vehicle Standards
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Every vehicle in our fleet is maintained to the highest standards.
              We perform daily inspections covering cleanliness, mechanical
              condition, and amenity stock. Our vehicles are never more than 3
              years old and are replaced regularly to ensure you always travel
              in a modern, reliable vehicle.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              All vehicles are fully licensed and insured with commercial
              coverage exceeding state requirements. Our chauffeurs undergo
              background checks and complete ongoing training in professional
              driving, customer service, and Chicago-area navigation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Daily vehicle inspections
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Modern fleet (3 years or newer)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Commercial insurance coverage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Cleaned between every trip
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-fleet-call-2">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-fleet-book-2"
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Fleet & Vehicle FAQs
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              data-testid="accordion-fleet-faq"
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
              <Button asChild size="lg" data-testid="button-fleet-call-3">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-fleet-book-3"
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
