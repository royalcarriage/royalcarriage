import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Phone, Calendar, Building, MapPin } from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/generated_images/luxury_black_suv_downtown_chicago.png";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const neighborhoods = [
  { name: "The Loop", desc: "Financial district & business center" },
  { name: "River North", desc: "Hotels, restaurants & nightlife" },
  { name: "Magnificent Mile", desc: "Shopping & luxury hotels" },
  { name: "Gold Coast", desc: "Upscale residential & hotels" },
  { name: "West Loop", desc: "Trendy restaurants & businesses" },
  { name: "South Loop", desc: "McCormick Place & Museum Campus" },
  { name: "Streeterville", desc: "Navy Pier & Northwestern Hospital" },
  { name: "Old Town", desc: "Entertainment & dining" },
];

const popularHotels = [
  "The Peninsula Chicago",
  "Four Seasons Hotel",
  "The Langham Chicago",
  "Waldorf Astoria",
  "The Drake Hotel",
  "Palmer House Hilton",
  "Fairmont Chicago",
  "InterContinental Chicago",
];

const faqs = [
  {
    question: "Where do you pick up in downtown Chicago?",
    answer: "We provide door-to-door pickup at any downtown Chicago location including hotel lobbies, office buildings, residential addresses, and convention centers. Our chauffeurs can meet you at the lobby or curbside as preferred."
  },
  {
    question: "How early should I schedule pickup for my flight?",
    answer: "We recommend departing 3 hours before domestic flights and 4 hours before international flights from downtown Chicago. This accounts for typical traffic to O'Hare (30-60 minutes) or Midway (20-40 minutes) plus airport security time."
  },
  {
    question: "Do you serve all downtown Chicago hotels?",
    answer: "Yes, we serve every hotel in downtown Chicago including those in the Loop, River North, Magnificent Mile, Gold Coast, Streeterville, and South Loop neighborhoods."
  },
  {
    question: "What about convention center transportation?",
    answer: "We provide reliable transportation for McCormick Place, Navy Pier, and all downtown Chicago convention venues. We can accommodate multiple pickups for groups and work around your event schedule."
  },
  {
    question: "Is there surge pricing during rush hour?",
    answer: "No. We offer flat-rate pricing regardless of traffic conditions. Your quoted price is guaranteed whether it takes 30 minutes or 90 minutes to reach the airport."
  },
  {
    question: "Can I book a round-trip from my downtown hotel?",
    answer: "Absolutely. Many of our business travelers book round-trip service. We'll drop you at the airport and be waiting when your return flight arrives."
  },
];

export default function DowntownChicago() {
  return (
    <Layout>
      <SEO 
        title="Downtown Chicago Airport Transfers"
        description="Premium black car service connecting downtown Chicago hotels to O'Hare and Midway airports. Loop, River North, Magnificent Mile pickups. Professional chauffeurs. Call (224) 801-3090."
        path="/airport-limo-downtown-chicago"
      />
      <Hero
        title="Downtown Chicago Airport Transfers"
        subtitle="Premium black car service connecting downtown Chicago hotels and businesses to O'Hare and Midway airports. Professional chauffeurs, luxury vehicles, and on-time service."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Downtown Chicago", href: "/airport-limo-downtown-chicago" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Airport Transportation for Downtown Chicago
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Chicago's downtown core is the heart of the Midwest's largest city, home to world-class hotels, Fortune 500 companies, and iconic landmarks. Our premium black car service provides seamless airport transfers for business travelers, tourists, and locals alike.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              From the Magnificent Mile's luxury hotels to the Loop's corporate towers, we provide door-to-door service that eliminates the hassle of navigating Chicago traffic or dealing with unreliable rideshares. Our professional chauffeurs handle your luggage and ensure you arrive at the airport with time to spare. See our <Link href="/ohare-airport-limo" className="text-foreground underline">O'Hare Airport</Link> and <Link href="/midway-airport-limo" className="text-foreground underline">Midway Airport</Link> pages for terminal details.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Door-to-door hotel pickup</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Flat-rate downtown pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Professional meet & greet</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground">Flight tracking included</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-downtown-call">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-downtown-book">
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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Downtown Neighborhoods We Serve
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {neighborhoods.map((n) => (
              <div key={n.name} className="bg-background p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-foreground" />
                  <p className="font-medium">{n.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Hotel & Convention Center Service
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We provide premium airport transportation for guests at Chicago's finest hotels. Whether you're staying on Michigan Avenue, in River North, or near McCormick Place, our chauffeurs provide seamless pickup and drop-off at your hotel's entrance.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              For convention and trade show attendees at McCormick Place, Navy Pier, or downtown conference venues, we offer reliable service that works around your schedule—even for early morning departures or late-night arrivals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Popular Hotels We Serve
                </h3>
                <ul className="space-y-2">
                  {popularHotels.map((hotel) => (
                    <li key={hotel} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                      {hotel}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Convention Venues</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                    McCormick Place
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                    Navy Pier
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                    Hyatt Regency Chicago
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                    Marriott Marquis
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" data-testid="button-downtown-call-2">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-downtown-book-2">
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
              Travel Times from Downtown
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Travel times to Chicago's airports vary based on traffic, time of day, and weather conditions. Here are typical estimates:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-background p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">To O'Hare Airport</h3>
                <p className="text-2xl font-bold text-foreground mb-2">30-60 minutes</p>
                <p className="text-sm text-muted-foreground">
                  Depending on traffic conditions. Rush hour can extend to 75+ minutes.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">To Midway Airport</h3>
                <p className="text-2xl font-bold text-foreground mb-2">20-40 minutes</p>
                <p className="text-sm text-muted-foreground">
                  Shorter distance from downtown. Rush hour may add 15-20 minutes.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              <strong>Pro tip:</strong> We recommend departing 3 hours before domestic flights and 4 hours before international to account for traffic and security.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Related Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/ohare-airport-limo" className="block p-6 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
              <h3 className="font-semibold mb-2">O'Hare Airport Service</h3>
              <p className="text-sm text-muted-foreground">Black car service to Chicago O'Hare (ORD)</p>
            </Link>
            <Link href="/midway-airport-limo" className="block p-6 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
              <h3 className="font-semibold mb-2">Midway Airport Service</h3>
              <p className="text-sm text-muted-foreground">Black car service to Chicago Midway (MDW)</p>
            </Link>
            <Link href="/airport-limo-suburbs" className="block p-6 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
              <h3 className="font-semibold mb-2">Suburban Service</h3>
              <p className="text-sm text-muted-foreground">Serving all Chicago suburbs</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Downtown Chicago Airport Transfer FAQs
            </h2>
            <Accordion type="single" collapsible className="w-full" data-testid="accordion-downtown-faq">
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
              <Button asChild size="lg" data-testid="button-downtown-call-3">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-downtown-book-3">
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
