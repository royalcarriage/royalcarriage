import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, Clock, Calendar, Check } from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/generated_images/luxury_black_sedan_airport_terminal.png";

const PHONE_NUMBER = "(224) 801-3090";
const PHONE_TEL = "tel:+12248013090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const faqs = [
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 24 hours in advance for standard reservations, though we can often accommodate same-day requests. For early morning pickups (before 6 AM), please book 48 hours ahead when possible."
  },
  {
    question: "Do you provide car seats for children?",
    answer: "Yes, car seats can be provided upon request at no additional charge. Please mention the ages and number of children when booking so we can ensure appropriate seats are available."
  },
  {
    question: "Can I modify or cancel my reservation?",
    answer: "Yes, you can modify your reservation up to 4 hours before pickup by calling us. Cancellations are free up to 4 hours before your scheduled pickup. Cancellations within 4 hours may be subject to a fee."
  },
  {
    question: "Do you offer round-trip discounts?",
    answer: "Yes! When you book round-trip service, you'll receive special pricing. We also offer frequent traveler rates for regular business travelers—ask us for details."
  },
  {
    question: "What if my flight is delayed or cancelled?",
    answer: "We track all flights in real-time. If your flight is delayed, we automatically adjust your pickup time at no additional charge. For cancelled flights, contact us immediately and we'll reschedule or provide a full refund."
  },
  {
    question: "What forms of payment do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) as well as cash. You can pay online when booking or in the vehicle after your trip."
  },
  {
    question: "Can you accommodate large groups?",
    answer: "Our Executive SUV seats up to 6 passengers. For larger groups, we can arrange multiple vehicles. Contact us with your group size and we'll provide a custom quote."
  },
];

export default function Contact() {
  return (
    <Layout>
      <SEO 
        title="Contact Us – Book Your Ride"
        description="Ready to book your Chicago airport black car? Call (224) 801-3090 or book online. Available 24/7 for O'Hare, Midway, and suburban transportation."
        path="/contact"
      />
      <Hero
        title="Contact Us"
        subtitle="Ready to book your ride or have questions? We're here to help 24/7. Call us or book online for immediate service."
        backgroundImage={heroImage}
        showTrustBadges={true}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Get in Touch
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The fastest way to book a ride is to call us directly or use our online booking system. Our team is available 24/7 to answer questions and help you arrange transportation to <Link href="/ohare-airport-limo" className="text-foreground underline">O'Hare</Link>, <Link href="/midway-airport-limo" className="text-foreground underline">Midway</Link>, or anywhere in the Chicagoland area.
              </p>

              <div className="space-y-6">
                <Card>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <a 
                        href={PHONE_TEL} 
                        className="text-lg font-medium text-foreground hover:underline"
                        data-testid="link-contact-phone"
                      >
                        {PHONE_NUMBER}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Available 24/7 for bookings and questions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <a 
                        href="mailto:info@chicagoairportblackcar.com" 
                        className="text-lg font-medium text-foreground hover:underline"
                        data-testid="link-contact-email"
                      >
                        info@chicagoairportblackcar.com
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">We respond within 2 hours during business hours</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Hours of Operation</h3>
                      <p className="text-lg font-medium text-foreground">24 Hours / 7 Days</p>
                      <p className="text-sm text-muted-foreground mt-1">We're always available for bookings and pickups</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Service Area</h3>
                      <p className="text-lg font-medium text-foreground">Greater Chicago Area</p>
                      <p className="text-sm text-muted-foreground mt-1">O'Hare, Midway, Downtown, and all suburbs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <Card className="h-full">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Book Your Ride
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Ready to book? Use our online booking system for instant quotes and reservations, or call us for personalized service.
                  </p>
                  
                  <div className="space-y-4">
                    <Button asChild size="lg" className="w-full" data-testid="button-contact-book">
                      <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Online Now
                      </a>
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    
                    <Button asChild size="lg" variant="outline" className="w-full" data-testid="button-contact-call">
                      <a href={PHONE_TEL}>
                        <Phone className="w-5 h-5 mr-2" />
                        Call {PHONE_NUMBER}
                      </a>
                    </Button>
                  </div>

                  <div className="mt-8 p-4 bg-accent rounded-lg">
                    <h3 className="font-semibold mb-3">Booking Tips</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                        Book at least 24 hours in advance for best availability
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                        For early morning pickups (before 6 AM), book 48 hours ahead
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                        Have your flight details ready when booking
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                        Include number of passengers and luggage count
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Contact & Booking FAQs
            </h2>
            <Accordion type="single" collapsible className="w-full" data-testid="accordion-contact-faq">
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
              <Button asChild size="lg" data-testid="button-contact-call-2">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_NUMBER}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-contact-book-2">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection variant="dark" />
    </Layout>
  );
}
