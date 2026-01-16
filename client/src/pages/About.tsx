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
  Shield,
  Award,
  Clock,
  Users,
  Check,
  Phone,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import {
  LocalBusinessSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLdSchema";

import heroImage from "@assets/generated_images/luxury_black_suv_downtown_chicago.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Safety First",
    description:
      "Every chauffeur undergoes thorough background checks and ongoing training. Our vehicles are maintained to the highest safety standards.",
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Punctuality",
    description:
      "We understand that time is valuable. Our flight tracking and proactive scheduling ensure you're never left waiting.",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Professionalism",
    description:
      "From booking to drop-off, expect courteous, professional service that reflects our commitment to excellence.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Customer Focus",
    description:
      "Your satisfaction drives everything we do. We listen, adapt, and go the extra mile to exceed expectations.",
  },
];

const faqs = [
  {
    question: "Is your company licensed and insured?",
    answer:
      "Yes, Chicago Airport Black Car is fully licensed to operate as a commercial livery service in Illinois. We maintain comprehensive commercial auto insurance that exceeds state requirements, providing you with complete peace of mind.",
  },
  {
    question: "How long have you been in business?",
    answer:
      "We've been serving Chicago-area travelers for years, building a reputation for reliability, professionalism, and exceptional customer service. Our experienced team knows Chicago traffic, airport procedures, and what it takes to deliver a great experience.",
  },
  {
    question: "Are your chauffeurs background-checked?",
    answer:
      "Absolutely. All chauffeurs undergo thorough background checks, hold valid Illinois chauffeur licenses, and complete regular training on defensive driving, customer service, and airport procedures.",
  },
  {
    question: "What makes you different from rideshare services?",
    answer:
      "Unlike rideshares, we offer guaranteed availability, flat-rate pricing with no surge, professional uniformed chauffeurs, flight tracking, and a consistent premium experience every time. Your driver is assigned to you—not randomly matched when you request.",
  },
  {
    question: "Do you serve both O'Hare and Midway airports?",
    answer:
      "Yes, we provide service to and from both Chicago O'Hare (ORD) and Chicago Midway (MDW) airports, as well as private airports in the area.",
  },
  {
    question: "What areas do you service?",
    answer:
      "We serve the entire Chicagoland area including downtown Chicago, all suburbs (west, northwest, north, and south), and surrounding communities. If you're within 60 miles of Chicago, we can help.",
  },
];

export default function About() {
  const breadcrumbItems = [
    { name: "Home", url: "https://chicagoairportblackcar.com" },
    { name: "About", url: "https://chicagoairportblackcar.com/about" },
  ];

  return (
    <Layout>
      <LocalBusinessSchema image={heroImage} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <SEO
        title="About Chicago Airport Black Car"
        description="Learn about Chicago Airport Black Car – your trusted partner for premium airport transportation. Licensed, insured, and committed to excellence. Professional chauffeur service since day one."
        path="/about"
      />
      <Hero
        title="About Chicago Airport Black Car"
        subtitle="Professional airport transportation serving Chicago and the surrounding suburbs with dedication to excellence, safety, and customer satisfaction."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Our Story
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Chicago Airport Black Car was founded with a simple mission:
              provide reliable, professional airport transportation that
              travelers can trust. We understood that busy professionals,
              families, and visitors deserve better than the uncertainty of
              rideshares or the hassle of airport parking.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Today, we're proud to serve thousands of travelers each year,
              connecting Chicago's airports to homes, hotels, and businesses
              throughout the Chicagoland area. Our team of professional
              chauffeurs brings years of experience navigating Chicago traffic
              and airport terminals.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Whether you're catching an early flight from{" "}
              <Link href="/naperville" className="text-foreground underline">
                Naperville
              </Link>
              , arriving late at{" "}
              <Link
                href="/ohare-airport-limo"
                className="text-foreground underline"
              >
                O'Hare
              </Link>{" "}
              from an overseas trip, or need reliable transportation to a{" "}
              <Link
                href="/airport-limo-downtown-chicago"
                className="text-foreground underline"
              >
                downtown meeting
              </Link>
              , we're here to make your journey seamless and comfortable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Fully licensed and insured
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Background-checked chauffeurs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Modern, well-maintained fleet
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">24/7 customer support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-about-call">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-about-book"
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
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These core values guide every aspect of our service.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-background p-6 rounded-lg text-center"
              >
                <div className="w-16 h-16 rounded-lg bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Our Commitment to You
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              When you book with Chicago Airport Black Car, you're not just
              getting a ride—you're getting a commitment to excellence. We
              promise:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    On-time pickup, every time
                  </p>
                  <p className="text-muted-foreground">
                    We track your flight and arrive when you need us, not a
                    minute late.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Clean, well-maintained vehicles
                  </p>
                  <p className="text-muted-foreground">
                    Every vehicle is inspected daily and cleaned between trips.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Professional, courteous chauffeurs
                  </p>
                  <p className="text-muted-foreground">
                    Our team is trained to provide friendly, helpful service.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Transparent, fair pricing
                  </p>
                  <p className="text-muted-foreground">
                    No surprises, no surge pricing—just honest, competitive
                    rates.
                  </p>
                </div>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-about-call-2">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-about-book-2"
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Licensed & Insured
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Chicago Airport Black Car is fully licensed to operate as a
              commercial livery service in Illinois. We maintain comprehensive
              commercial auto insurance that exceeds state requirements,
              providing you with peace of mind on every journey.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              All of our chauffeurs hold valid Illinois chauffeur licenses and
              complete regular training on defensive driving, customer service,
              and airport procedures. We're committed to operating legally,
              safely, and professionally.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Illinois commercial livery license
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Comprehensive auto insurance
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">
                  Licensed professional chauffeurs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Regular safety training</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              About Us FAQs
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              data-testid="accordion-about-faq"
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
              <Button asChild size="lg" data-testid="button-about-call-3">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-about-book-3"
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
