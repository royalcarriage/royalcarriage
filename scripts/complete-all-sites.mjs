#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("🚀 Royal Carriage Multi-Site Generator");
console.log("=====================================\n");

// Create a page template function
function createPage(appName, target, filename, pageData) {
  const pagePath = path.join(rootDir, `apps/${appName}/src/pages`, filename);

  const content = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import CTAButton from '@packages/astro-components/CTAButton.astro';
import CallButton from '@packages/astro-components/CallButton.astro';
import { generateServiceSchema } from '@packages/astro-utils/schema';
import { getSiteConfig } from '@packages/astro-utils/config';

const config = getSiteConfig('${target}');
const serviceSchema = generateServiceSchema({
  config,
  serviceName: '${pageData.h1}',
  serviceDescription: '${pageData.description}',
  serviceType: '${pageData.serviceType || "Transportation Service"}',
  url: Astro.url.pathname
});
---

<BaseLayout
  title="${pageData.title}"
  description="${pageData.description}"
  canonical="${"/" + filename.replace(".astro", "")}"
  schema={serviceSchema}
>
  <div class="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">${pageData.h1}</h1>
      <div class="flex flex-col sm:flex-row gap-4">
        <CTAButton target="${target}" location="hero" size="lg" />
        <CallButton target="${target}" location="hero" size="lg" />
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto prose prose-lg">
      ${pageData.content}
    </div>
  </div>

  <div class="bg-gray-100 py-12">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-6">${pageData.ctaTitle || "Book Your Service Now"}</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <CTAButton target="${target}" location="bottom-cta" size="lg" />
        <CallButton target="${target}" location="bottom-cta" size="lg" variant="primary" />
      </div>
    </div>
  </div>
</BaseLayout>
`;

  fs.writeFileSync(pagePath, content);
  console.log(`  ✓ Created ${filename}`);
}

// CORPORATE PAGES
console.log("📊 Creating Corporate site pages...");
const corporatePages = {
  "index.astro": {
    title: "Chicago Executive Car Service - Corporate Black Car Transportation",
    description:
      "Professional executive car service in Chicago. Corporate black car transportation, hourly chauffeur services, and business travel solutions. Reliable, discreet, punctual service for professionals.",
    h1: "Chicago Executive Car Service",
    serviceType: "Executive Transportation",
    content: `<p class="text-lg mb-6">Royal Carriage Limousine provides premium executive car service tailored to the needs of business professionals and corporate clients throughout Chicago. Our professional chauffeur service delivers punctual, discreet, and comfortable transportation for meetings, airport transfers, and corporate events.</p>

<h2 class="text-2xl font-bold mb-4">Why Chicago Businesses Choose Us</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Punctuality Guaranteed:</strong> Your time is valuable. We're always on time, every time</li>
  <li><strong>Professional Chauffeurs:</strong> Background-checked drivers with business etiquette training</li>
  <li><strong>Luxury Fleet:</strong> Executive sedans and SUVs maintained to the highest standards</li>
  <li><strong>Productive Environment:</strong> Wi-Fi, power outlets, and privacy for calls and work</li>
  <li><strong>Flexible Billing:</strong> Corporate accounts with monthly invoicing available</li>
  <li><strong>Confidentiality:</strong> Complete discretion for all business transportation needs</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Corporate Transportation Services</h2>
<div class="grid md:grid-cols-2 gap-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Airport Transfers</h3>
    <p>Professional transportation to O'Hare and Midway airports. Flight tracking, meet & greet service, and reliable pickup for business travelers.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Corporate Events</h3>
    <p>Transportation coordination for conferences, seminars, client entertainment, and company events throughout Chicago.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Hourly Services</h3>
    <p>Dedicated chauffeur and vehicle for multiple stops, meetings, or full-day business needs.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Executive Travel</h3>
    <p>Premium transportation for C-suite executives, visiting clients, and VIP business guests.</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Corporate Account Benefits</h2>
<p class="mb-4">Establish a corporate account with Royal Carriage for streamlined business transportation:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Monthly consolidated billing and detailed ride reports</li>
  <li>Priority booking and dedicated account management</li>
  <li>Employee travel management and tracking</li>
  <li>Customizable approval workflows</li>
  <li>Preferred rates for regular clients</li>
  <li>24/7 customer support for urgent needs</li>
</ul>`,
  },
  "executive-transportation.astro": {
    title: "Executive Transportation Chicago - Premium Black Car Service",
    description:
      "Premium executive transportation in Chicago. Professional black car service for business leaders, meetings, and corporate travel. Discreet, reliable, luxury service.",
    h1: "Executive Transportation Service",
    serviceType: "Executive Transportation",
    content: `<p class="text-lg mb-6">Royal Carriage provides sophisticated executive transportation designed specifically for business leaders and high-level professionals. Our premium service combines luxury vehicles, professional chauffeurs, and meticulous attention to detail to ensure a seamless travel experience.</p>

<h2 class="text-2xl font-bold mb-4">Executive Service Features</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Late-model luxury sedans and SUVs (Lincoln, Cadillac)</li>
  <li>Professionally trained chauffeurs with business etiquette</li>
  <li>Complimentary Wi-Fi and device charging</li>
  <li>Privacy partition for confidential calls</li>
  <li>Bottled water, newspapers, and amenities</li>
  <li>Door-to-door service with luggage assistance</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Ideal For</h2>
<div class="space-y-3 mb-6">
  <p><strong>C-Suite Executives:</strong> CEOs, CFOs, and senior leadership requiring reliable, professional transportation</p>
  <p><strong>Visiting Clients:</strong> Impress important clients with luxury transportation during Chicago visits</p>
  <p><strong>Board Meetings:</strong> Timely arrival for critical board meetings and shareholder events</p>
  <p><strong>Business Development:</strong> Professional transportation for client entertainment and relationship building</p>
</div>`,
  },
  "corporate-black-car-service.astro": {
    title: "Corporate Black Car Service Chicago - Business Transportation",
    description:
      "Corporate black car service in Chicago. Professional transportation for businesses, employees, and clients. Flexible billing, reliable service, and luxury vehicles.",
    h1: "Corporate Black Car Service",
    serviceType: "Corporate Transportation",
    content: `<p class="text-lg mb-6">Royal Carriage Limousine specializes in corporate black car service for Chicago businesses. Whether you need regular airport transportation for employees, client entertainment, or event coordination, our professional service delivers consistent quality and reliability.</p>

<h2 class="text-2xl font-bold mb-4">Corporate Solutions</h2>
<p class="mb-4">We understand the unique needs of corporate transportation:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Employee Transportation:</strong> Regular airport transfers for traveling staff</li>
  <li><strong>Client Services:</strong> Impressive transportation for visiting clients and partners</li>
  <li><strong>Event Management:</strong> Coordination of multiple vehicles for company events</li>
  <li><strong>Executive Services:</strong> Dedicated transportation for leadership team</li>
  <li><strong>Flexible Scheduling:</strong> Last-minute bookings and changes accommodated</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Billing & Reporting</h2>
<div class="bg-blue-50 p-6 rounded-lg mb-6">
  <ul class="space-y-2">
    <li>✓ Monthly consolidated invoicing</li>
    <li>✓ Detailed trip reports by employee/department</li>
    <li>✓ Customizable approval workflows</li>
    <li>✓ Online booking portal for employees</li>
    <li>✓ Real-time ride tracking and notifications</li>
    <li>✓ Expense reporting integration available</li>
  </ul>
</div>`,
  },
  "hourly-chauffeur-service.astro": {
    title: "Hourly Chauffeur Service Chicago - By the Hour Transportation",
    description:
      "Hourly chauffeur service in Chicago. Dedicated vehicle and driver for multiple stops, meetings, or full-day business needs. Flexible, professional service by the hour.",
    h1: "Hourly Chauffeur Service",
    serviceType: "Hourly Transportation",
    content: `<p class="text-lg mb-6">Need a vehicle and chauffeur for multiple hours? Royal Carriage provides flexible hourly chauffeur service perfect for business professionals with multiple meetings, running errands, or requiring a dedicated vehicle for the day.</p>

<h2 class="text-2xl font-bold mb-4">How Hourly Service Works</h2>
<ol class="list-decimal list-inside space-y-2 mb-6">
  <li>Book minimum 3 hours (additional hours as needed)</li>
  <li>Your chauffeur and vehicle are dedicated to you</li>
  <li>Make unlimited stops within your booked time</li>
  <li>Chauffeur waits at each location</li>
  <li>Flexible routing based on your schedule</li>
  <li>Pay simple hourly rate with no per-stop fees</li>
</ol>

<h2 class="text-2xl font-bold mb-4">Perfect For</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Multiple business meetings across Chicago</li>
  <li>Shopping or personal errands</li>
  <li>Visiting multiple properties (real estate)</li>
  <li>Medical appointments and follow-ups</li>
  <li>Tourist sightseeing with driver/guide</li>
  <li>Evening entertainment and dining</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Hourly Rates</h2>
<p class="mb-4">Transparent pricing with no hidden fees:</p>
<ul class="space-y-2 mb-6">
  <li><strong>Executive Sedan:</strong> Starting at $75/hour (3-hour minimum)</li>
  <li><strong>Luxury SUV:</strong> Starting at $95/hour (3-hour minimum)</li>
  <li><strong>Additional Hours:</strong> Prorated hourly rate</li>
  <li><strong>Includes:</strong> Vehicle, chauffeur, fuel, and standard waiting time</li>
</ul>`,
  },
  "fleet.astro": {
    title: "Corporate Fleet - Executive Sedans & Luxury Vehicles",
    description:
      "View our corporate fleet of executive sedans, luxury SUVs, and passenger vans. Professional vehicles for business transportation in Chicago.",
    h1: "Our Corporate Fleet",
    content: `<p class="text-lg mb-6">Royal Carriage maintains a premium fleet specifically selected for corporate and executive transportation needs. Every vehicle is professionally maintained, regularly detailed, and equipped with business amenities.</p>

<h2 class="text-2xl font-bold mb-4">Executive Sedans</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Lincoln Continental & Cadillac XTS</h3>
  <p class="mb-4">Our flagship executive sedans provide quiet, professional transportation ideal for business travel.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: Up to 3 passengers</li>
    <li>Luggage: 3-4 large bags</li>
    <li>Features: Leather seats, Wi-Fi, power outlets, privacy partition</li>
    <li>Perfect for: Individual executives, client transportation, airport transfers</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Luxury SUVs</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Cadillac Escalade & Lincoln Navigator</h3>
  <p class="mb-4">Premium SUVs offering extra space and comfort for groups or executive teams.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: Up to 6 passengers</li>
    <li>Luggage: 6-8 large bags</li>
    <li>Features: Captain's chairs, entertainment system, Wi-Fi, power outlets</li>
    <li>Perfect for: Executive teams, client groups, airport transfers with luggage</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Executive Vans</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Mercedes Sprinter</h3>
  <p class="mb-4">Luxury passenger vans for larger corporate groups and event transportation.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: Up to 12 passengers</li>
    <li>Luggage: 12-14 large bags</li>
    <li>Features: Individual seating, A/C zones, entertainment, Wi-Fi</li>
    <li>Perfect for: Corporate events, conferences, team transportation</li>
  </ul>
</div>`,
  },
  "contact.astro": {
    title: "Contact - Corporate Account Setup",
    description:
      "Contact Royal Carriage for corporate transportation services. Set up a corporate account, request quotes, or book executive car service. Call (224) 801-3090.",
    h1: "Contact Us - Corporate Services",
    content: `<p class="text-lg mb-6">Ready to establish a corporate account or book executive transportation? Contact Royal Carriage Limousine for professional corporate car service in Chicago.</p>

<div class="grid md:grid-cols-2 gap-8 mb-8">
  <div>
    <h2 class="text-2xl font-bold mb-4">Corporate Inquiries</h2>
    <div class="space-y-4 mb-6">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
        <div>
          <p class="font-bold">Phone</p>
          <a href="tel:+12248013090" class="text-blue-600 hover:text-blue-800 text-lg">(224) 801-3090</a>
          <p class="text-sm text-gray-600">24/7 Business Line</p>
        </div>
      </div>
    </div>

    <h3 class="text-xl font-bold mb-3">Corporate Account Setup</h3>
    <p class="mb-4">To establish a corporate account, we'll need:</p>
    <ul class="list-disc list-inside space-y-2 text-sm mb-6">
      <li>Company name and billing address</li>
      <li>Primary contact information</li>
      <li>Estimated monthly usage</li>
      <li>Billing preferences (monthly invoice, credit card on file)</li>
      <li>Any specific requirements or approval workflows</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Why Choose Royal Carriage for Corporate Transportation?</h2>
    <ul class="space-y-3 text-sm">
      <li>✓ Professional service tailored to business needs</li>
      <li>✓ Flexible billing and reporting</li>
      <li>✓ Dedicated account management</li>
      <li>✓ Consistent quality across all rides</li>
      <li>✓ 24/7 availability for urgent needs</li>
      <li>✓ Technology integration options</li>
    </ul>
  </div>
</div>`,
  },
};

// Ensure corporate pages directory exists
fs.mkdirSync(path.join(rootDir, "apps/corporate/src/pages"), {
  recursive: true,
});

Object.entries(corporatePages).forEach(([filename, data]) => {
  createPage("corporate", "corporate", filename, data);
});

console.log("✓ Corporate site complete\n");

// WEDDING PAGES
console.log("💒 Creating Wedding site pages...");
const weddingPages = {
  "index.astro": {
    title: "Chicago Wedding Transportation - Elegant Limousine Service",
    description:
      "Elegant wedding limousine service in Chicago. Professional transportation for weddings, bridal parties, and special occasions. Luxury vehicles and experienced chauffeurs.",
    h1: "Chicago Wedding Transportation",
    serviceType: "Wedding Transportation",
    content: `<p class="text-lg mb-6">Make your special day even more memorable with Royal Carriage Limousine's elegant wedding transportation service. We provide luxury vehicles, professional chauffeurs, and meticulous attention to detail for weddings throughout Chicago and surrounding suburbs.</p>

<h2 class="text-2xl font-bold mb-4">Wedding Transportation Services</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Bridal Party Transportation:</strong> Comfortable transport for the wedding party to ceremony and reception</li>
  <li><strong>Bride & Groom Service:</strong> Elegant limousine for the happy couple's grand entrance and exit</li>
  <li><strong>Guest Shuttles:</strong> Coordinate transportation for guests between venues and hotels</li>
  <li><strong>Bachelor/Bachelorette Parties:</strong> Safe, fun transportation for pre-wedding celebrations</li>
  <li><strong>Rehearsal Dinner:</strong> Professional service for pre-wedding events</li>
  <li><strong>Airport Transfers:</strong> Transportation for out-of-town guests arriving for your wedding</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Why Choose Royal Carriage for Your Wedding</h2>
<div class="grid md:grid-cols-3 gap-6 mb-6">
  <div class="text-center bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Elegant Fleet</h3>
    <p class="text-sm">Luxury limousines and vehicles perfect for wedding photography and elegant arrivals</p>
  </div>
  <div class="text-center bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Professional Chauffeurs</h3>
    <p class="text-sm">Experienced drivers who understand wedding timelines and special day protocols</p>
  </div>
  <div class="text-center bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Stress-Free Service</h3>
    <p class="text-sm">Coordination with wedding planners, on-time arrivals, and seamless execution</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Wedding Package Options</h2>
<p class="mb-4">We offer flexible wedding transportation packages to fit your needs:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Hourly service with minimum booking (typically 3-4 hours)</li>
  <li>Point-to-point transfers (ceremony to reception)</li>
  <li>Multiple vehicle coordination for large wedding parties</li>
  <li>Custom packages combining various services</li>
  <li>Complimentary champagne service available</li>
</ul>`,
  },
  "wedding-limo-service.astro": {
    title: "Wedding Limousine Service Chicago - Luxury Wedding Transportation",
    description:
      "Luxury wedding limousine service in Chicago. Elegant transportation for your special day with professional chauffeurs and pristine vehicles. Book your wedding limo today.",
    h1: "Wedding Limousine Service",
    serviceType: "Wedding Limousine",
    content: `<p class="text-lg mb-6">Royal Carriage provides elegant wedding limousine service designed to add luxury and sophistication to your special day. Our pristine vehicles and professional chauffeurs ensure you arrive in style while creating beautiful memories.</p>

<h2 class="text-2xl font-bold mb-4">Wedding Limousine Options</h2>
<div class="space-y-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Stretch Limousines</h3>
    <p class="mb-3">Classic stretch limousines perfect for the bride and groom or bridal party.</p>
    <ul class="text-sm space-y-1">
      <li>• Seating for 6-10 passengers</li>
      <li>• Champagne bar and elegant interior</li>
      <li>• Privacy partition</li>
      <li>• Perfect for photos and grand arrivals</li>
    </ul>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">Luxury Sedans</h3>
    <p class="mb-3">Elegant sedans ideal for intimate weddings or transporting the couple.</p>
    <ul class="text-sm space-y-1">
      <li>• Seating for 2-3 passengers</li>
      <li>• Sophisticated and timeless</li>
      <li>• Professional chauffeur service</li>
      <li>• Perfect for couples wanting intimate elegance</li>
    </ul>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">SUV Limousines</h3>
    <p class="mb-3">Spacious SUV limos for larger bridal parties.</p>
    <ul class="text-sm space-y-1">
      <li>• Seating for 8-14 passengers</li>
      <li>• Comfortable for long dresses</li>
      <li>• Entertainment systems</li>
      <li>• Great for the entire bridal party</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">What's Included</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Professional chauffeur in formal attire</li>
  <li>Red carpet service for arrivals</li>
  <li>Complimentary champagne (where legal)</li>
  <li>Decorations and ribbons upon request</li>
  <li>Waiting time between locations</li>
  <li>Coordination with wedding planner</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Booking Your Wedding Limo</h2>
<p class="mb-4">We recommend booking your wedding transportation 6-12 months in advance, especially for peak wedding season (May-October). Early booking ensures:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Availability of your preferred vehicle</li>
  <li>Time to coordinate all details</li>
  <li>Potential early booking discounts</li>
  <li>Peace of mind with confirmed transportation</li>
</ul>`,
  },
  "bridal-party-transportation.astro": {
    title: "Bridal Party Transportation Chicago - Group Wedding Limos",
    description:
      "Bridal party transportation in Chicago. Luxury vehicles for bridesmaids, groomsmen, and wedding parties. Comfortable group transportation for your special day.",
    h1: "Bridal Party Transportation",
    serviceType: "Bridal Party Service",
    content: `<p class="text-lg mb-6">Coordinate seamless transportation for your entire bridal party with Royal Carriage Limousine. We specialize in group transportation that keeps everyone together, on time, and comfortable throughout your wedding day.</p>

<h2 class="text-2xl font-bold mb-4">Bridal Party Services</h2>
<p class="mb-4">Our bridal party transportation handles every aspect of group travel:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Getting Ready:</strong> Transport bridesmaids from hotel to getting-ready location</li>
  <li><strong>To the Ceremony:</strong> Coordinated arrival of bridal party at ceremony venue</li>
  <li><strong>Photo Locations:</strong> Transportation to photo shoot locations between events</li>
  <li><strong>To the Reception:</strong> Everyone arrives together at reception venue</li>
  <li><strong>Late Night:</strong> Safe transportation back to hotels after celebration</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Vehicle Options for Groups</h2>
<div class="grid md:grid-cols-2 gap-6 mb-6">
  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">SUV Limousines</h3>
    <p class="text-sm mb-2">Spacious and comfortable for groups of 8-14</p>
    <ul class="text-xs space-y-1">
      <li>• Extra room for dresses</li>
      <li>• Climate control</li>
      <li>• Entertainment system</li>
      <li>• Perfect for bridal party</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Party Buses</h3>
    <p class="text-sm mb-2">Ultimate group transportation for 20+ guests</p>
    <ul class="text-xs space-y-1">
      <li>• Standing room</li>
      <li>• Dance floor and lights</li>
      <li>• Sound system</li>
      <li>• Party atmosphere</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Multiple Sedans</h3>
    <p class="text-sm mb-2">Coordinate multiple luxury sedans</p>
    <ul class="text-xs space-y-1">
      <li>• Elegant arrivals</li>
      <li>• Smaller groups</li>
      <li>• Professional coordination</li>
      <li>• Classic sophistication</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Luxury Vans</h3>
    <p class="text-sm mb-2">Comfortable vans for 10-14 passengers</p>
    <ul class="text-xs space-y-1">
      <li>• Individual seating</li>
      <li>• Practical and elegant</li>
      <li>• Great for getting ready phase</li>
      <li>• Ample storage</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Coordination & Timing</h2>
<p class="mb-4">We work closely with you and your wedding planner to ensure perfect timing:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Detailed timeline creation and confirmation</li>
  <li>Communication with all parties involved</li>
  <li>Buffer time built in for photos and delays</li>
  <li>Multiple stops coordinated seamlessly</li>
  <li>Backup plans for weather or changes</li>
</ul>`,
  },
  "fleet.astro": {
    title: "Wedding Fleet - Luxury Limousines & Elegant Vehicles",
    description:
      "View our wedding fleet featuring elegant limousines, luxury sedans, and party buses. Beautiful vehicles for your special day in Chicago.",
    h1: "Our Wedding Fleet",
    content: `<p class="text-lg mb-6">Royal Carriage Limousine maintains an elegant fleet specifically suited for weddings and special occasions. Every vehicle is immaculately detailed and decorated for your big day.</p>

<h2 class="text-2xl font-bold mb-4">Stretch Limousines</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <p class="mb-4">Our classic stretch limousines provide timeless elegance for weddings.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: 6-10 passengers</li>
    <li>Features: Champagne bar, mood lighting, privacy partition, premium sound</li>
    <li>Perfect for: Bride and groom, bridal party, VIP guests</li>
    <li>Available in: White, Black</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Luxury Sedans</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <p class="mb-4">Elegant sedans for intimate wedding transportation.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: 2-3 passengers</li>
    <li>Features: Leather interior, climate control, elegant styling</li>
    <li>Perfect for: Intimate weddings, couple's departure, parents</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">SUV Limousines</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <p class="mb-4">Spacious SUV limos perfect for larger bridal parties.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: 8-14 passengers</li>
    <li>Features: Extra headroom for formal wear, entertainment system, bar</li>
    <li>Perfect for: Full bridal party, group transportation</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Party Buses</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <p class="mb-4">For larger wedding parties wanting mobile celebration.</p>
  <ul class="list-disc list-inside space-y-2">
    <li>Seating: 20-30 passengers</li>
    <li>Features: Dance floor, lighting, premium sound, bars</li>
    <li>Perfect for: Large wedding parties, guest shuttles, after-parties</li>
  </ul>
</div>`,
  },
  "contact.astro": {
    title: "Contact - Wedding Transportation Quotes",
    description:
      "Contact Royal Carriage for wedding transportation quotes. Book limousine service for your Chicago wedding. Call (224) 801-3090 for availability.",
    h1: "Contact Us - Wedding Services",
    content: `<p class="text-lg mb-6">Ready to book elegant transportation for your wedding day? Contact Royal Carriage Limousine for availability, quotes, and to discuss your wedding transportation needs.</p>

<div class="grid md:grid-cols-2 gap-8 mb-8">
  <div>
    <h2 class="text-2xl font-bold mb-4">Get Started</h2>
    <div class="space-y-4 mb-6">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
        <div>
          <p class="font-bold">Phone</p>
          <a href="tel:+12248013090" class="text-blue-600 hover:text-blue-800 text-lg">(224) 801-3090</a>
          <p class="text-sm text-gray-600">Available 7 days a week</p>
        </div>
      </div>
    </div>

    <h3 class="text-xl font-bold mb-3">Wedding Quote Request</h3>
    <p class="mb-4">To provide an accurate quote, please have ready:</p>
    <ul class="list-disc list-inside space-y-2 text-sm mb-6">
      <li>Wedding date and day of week</li>
      <li>Ceremony and reception locations</li>
      <li>Number of passengers needing transportation</li>
      <li>Approximate timeline and hours needed</li>
      <li>Type of vehicles preferred</li>
      <li>Any special requests or requirements</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Booking Timeline</h2>
    <p class="mb-4 font-bold">We recommend booking:</p>
    <ul class="space-y-3 text-sm">
      <li><strong>6-12 months ahead:</strong> Peak season weddings (May-October)</li>
      <li><strong>3-6 months ahead:</strong> Off-season or weekday weddings</li>
      <li><strong>ASAP:</strong> Last-minute bookings (check availability)</li>
    </ul>

    <h3 class="text-xl font-bold mt-6 mb-3">Why Book Early?</h3>
    <ul class="space-y-2 text-sm">
      <li>✓ Guaranteed vehicle availability</li>
      <li>✓ Preferred pricing for early bookings</li>
      <li>✓ More time for planning and coordination</li>
      <li>✓ Peace of mind with confirmed transportation</li>
    </ul>
  </div>
</div>`,
  },
};

fs.mkdirSync(path.join(rootDir, "apps/wedding/src/pages"), { recursive: true });

Object.entries(weddingPages).forEach(([filename, data]) => {
  createPage("wedding", "wedding", filename, data);
});

console.log("✓ Wedding site complete\n");

// PARTYBUS PAGES
console.log("🎉 Creating Party Bus site pages...");
const partybusPages = {
  "index.astro": {
    title: "Chicago Party Bus Rental - Premium Group Transportation",
    description:
      "Premium party bus rentals in Chicago. Perfect for birthdays, concerts, bachelor/bachelorette parties, and special events. Spacious, entertaining, safe group transportation.",
    h1: "Chicago Party Bus Rental",
    serviceType: "Party Bus Rental",
    ctaTitle: "Book Your Party Bus Now",
    content: `<p class="text-lg mb-6">Experience the ultimate group celebration with Royal Carriage Limousine's premium party bus rentals. Perfect for birthdays, bachelor/bachelorette parties, concerts, and any event where your group wants to travel and party together in style.</p>

<h2 class="text-2xl font-bold mb-4">Why Choose Our Party Buses</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Spacious Interior:</strong> Room for 20-30 passengers with space to move and socialize</li>
  <li><strong>Entertainment Systems:</strong> Premium sound, LED lighting, and entertainment features</li>
  <li><strong>Safety First:</strong> Professional chauffeurs ensure safe transportation while you party</li>
  <li><strong>No Designated Driver Needed:</strong> Everyone can enjoy the celebration</li>
  <li><strong>Multiple Stops:</strong> Visit multiple venues without parking hassles</li>
  <li><strong>Climate Controlled:</strong> Comfortable regardless of Chicago weather</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Perfect For</h2>
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Birthday Parties</h3>
    <p class="text-sm">Celebrate milestone birthdays with friends in a mobile party venue</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Bachelor/Bachelorette</h3>
    <p class="text-sm">Pre-wedding celebrations with the wedding party</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Concerts & Events</h3>
    <p class="text-sm">Transportation to concerts, sporting events, and shows</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Bar Crawls</h3>
    <p class="text-sm">Visit multiple bars and clubs without driving</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Corporate Events</h3>
    <p class="text-sm">Team building, company parties, and outings</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-bold mb-2">Proms & Homecoming</h3>
    <p class="text-sm">Safe group transportation for school dances</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Party Bus Features</h2>
<div class="bg-blue-50 p-6 rounded-lg mb-6">
  <ul class="grid md:grid-cols-2 gap-3">
    <li>✓ Premium sound systems</li>
    <li>✓ LED mood lighting</li>
    <li>✓ Dance floor area</li>
    <li>✓ Bar areas with coolers</li>
    <li>✓ Comfortable seating</li>
    <li>✓ Privacy windows</li>
    <li>✓ Climate control</li>
    <li>✓ Bluetooth connectivity</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">How Party Bus Rental Works</h2>
<ol class="list-decimal list-inside space-y-2 mb-6">
  <li><strong>Choose Your Bus:</strong> Select size based on your group</li>
  <li><strong>Book Your Time:</strong> Minimum 4-hour rental, additional hours available</li>
  <li><strong>Plan Your Route:</strong> Tell us your stops or let us suggest popular locations</li>
  <li><strong>Enjoy the Ride:</strong> Your chauffeur handles driving while you party</li>
  <li><strong>Multiple Stops:</strong> Visit bars, clubs, restaurants, or event venues</li>
  <li><strong>Safe Return:</strong> Everyone gets home safely</li>
</ol>`,
  },
  "party-bus-rental.astro": {
    title: "Party Bus Rental Chicago - Luxury Group Transportation",
    description:
      "Rent a party bus in Chicago for your group event. Spacious vehicles with entertainment systems, LED lighting, and professional drivers. Book your party bus rental today.",
    h1: "Party Bus Rental Service",
    serviceType: "Party Bus",
    content: `<p class="text-lg mb-6">Royal Carriage Limousine offers premium party bus rentals in Chicago, providing the ultimate mobile party experience. Our luxury party buses combine comfortable transportation with entertainment features for unforgettable group celebrations.</p>

<h2 class="text-2xl font-bold mb-4">Our Party Bus Fleet</h2>
<div class="space-y-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">20-Passenger Party Bus</h3>
    <p class="mb-3">Perfect for medium-sized groups wanting a party atmosphere.</p>
    <ul class="text-sm space-y-1 mb-3">
      <li>• Seating for up to 20 passengers</li>
      <li>• Premium sound and lighting</li>
      <li>• Bar area with coolers</li>
      <li>• Starting at $150/hour (4-hour minimum)</li>
    </ul>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3">30-Passenger Party Bus</h3>
    <p class="mb-3">Our largest party bus for big celebrations.</p>
    <ul class="text-sm space-y-1 mb-3">
      <li>• Seating for up to 30 passengers</li>
      <li>• Multiple bar areas</li>
      <li>• Dance floor with pole</li>
      <li>• Premium entertainment system</li>
      <li>• Starting at $180/hour (4-hour minimum)</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">What's Included</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Professional chauffeur for entire rental period</li>
  <li>Fuel and vehicle costs</li>
  <li>Sound system with Bluetooth connectivity</li>
  <li>LED mood lighting and dance lights</li>
  <li>Bar areas with ice and coolers (BYOB)</li>
  <li>Climate control</li>
  <li>Waiting time at stops (within reason)</li>
  <li>Unlimited mileage within Chicagoland</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Party Bus Rules & Guidelines</h2>
<div class="bg-yellow-50 p-6 rounded-lg mb-6">
  <ul class="space-y-2 text-sm">
    <li>• Must be 21+ to consume alcohol (BYOB - we provide coolers and ice)</li>
    <li>• No smoking inside vehicles</li>
    <li>• Respect chauffeur and follow instructions</li>
    <li>• No illegal substances or activities</li>
    <li>• Damage deposits may be required</li>
    <li>• Excessive mess or damage subject to cleaning/repair fees</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Popular Party Bus Routes</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Downtown Bar Crawl:</strong> River North, West Loop, Wrigleyville</li>
  <li><strong>Concert Transportation:</strong> United Center, Wrigley Field, Ravinia</li>
  <li><strong>Suburban Nightlife:</strong> Schaumburg, Naperville, Oak Brook entertainment districts</li>
  <li><strong>Special Events:</strong> Sporting events, festivals, shows</li>
</ul>`,
  },
  "birthday-party-bus.astro": {
    title: "Birthday Party Bus Chicago - Mobile Birthday Celebrations",
    description:
      "Celebrate birthdays with a party bus in Chicago. Perfect for milestone birthdays, surprise parties, and group celebrations. Book your birthday party bus now.",
    h1: "Birthday Party Bus Rental",
    serviceType: "Birthday Party Bus",
    content: `<p class="text-lg mb-6">Make your birthday celebration unforgettable with a Royal Carriage party bus rental. Whether it's a milestone 21st, 30th, 40th, or any birthday worth celebrating, our party buses provide a unique mobile venue for your celebration.</p>

<h2 class="text-2xl font-bold mb-4">Why Party Buses Are Perfect for Birthdays</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Keep Everyone Together:</strong> Your entire group travels and celebrates together</li>
  <li><strong>No Designated Driver:</strong> Professional chauffeur means everyone can enjoy</li>
  <li><strong>Visit Multiple Venues:</strong> Dinner, bars, clubs - visit them all in one night</li>
  <li><strong>Mobile Party:</strong> The celebration starts the moment you board</li>
  <li><strong>Photo Opportunities:</strong> Unique setting for birthday photos and videos</li>
  <li><strong>Surprise Factor:</strong> Arriving in a party bus makes an impression</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Popular Birthday Party Bus Ideas</h2>
<div class="grid md:grid-cols-2 gap-6 mb-6">
  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">21st Birthday Pub Crawl</h3>
    <p class="text-sm mb-3">Celebrate turning 21 legally with friends:</p>
    <ul class="text-xs space-y-1">
      <li>• Visit multiple bars and clubs</li>
      <li>• Safe transportation all night</li>
      <li>• Keep the party going between stops</li>
      <li>• Create unforgettable memories</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Milestone Birthdays (30, 40, 50+)</h3>
    <p class="text-sm mb-3">Celebrate life milestones in style:</p>
    <ul class="text-xs space-y-1">
      <li>• Elegant group transportation</li>
      <li>• Visit upscale restaurants and lounges</li>
      <li>• Sophisticated celebration atmosphere</li>
      <li>• Perfect for surprise parties</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Teen Birthday Parties (Sweet 16, etc)</h3>
    <p class="text-sm mb-3">Safe, supervised fun for teenagers:</p>
    <ul class="text-xs space-y-1">
      <li>• Visit movies, restaurants, activities</li>
      <li>• Parent-approved safe transportation</li>
      <li>• Chaperoned by professional driver</li>
      <li>• Memorable experience for teens</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="font-bold mb-3">Birthday Winery/Brewery Tours</h3>
    <p class="text-sm mb-3">Combine birthday with tasting tour:</p>
    <ul class="text-xs space-y-1">
      <li>• Visit multiple wineries or breweries</li>
      <li>• Everyone can taste safely</li>
      <li>• Relaxed birthday celebration</li>
      <li>• Professional tour coordination</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Birthday Party Bus Packages</h2>
<p class="mb-4">We offer flexible packages for birthday celebrations:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>4-Hour Package:</strong> Perfect for dinner and a few stops</li>
  <li><strong>6-Hour Package:</strong> Full evening of birthday celebration</li>
  <li><strong>8-Hour Package:</strong> All-day or all-night birthday extravaganza</li>
  <li><strong>Custom Packages:</strong> Create your own itinerary and timing</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Birthday Decorations & Add-Ons</h2>
<p class="mb-4">Make it extra special with optional additions:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Birthday banners and decorations (inquire for availability)</li>
  <li>Red carpet for birthday VIP entrance</li>
  <li>Champagne service (where permitted)</li>
  <li>Customized playlist for birthday person</li>
  <li>Photo packages at stops</li>
</ul>`,
  },
  "concert-transportation.astro": {
    title: "Concert Transportation Chicago - Party Bus to Shows",
    description:
      "Party bus transportation to Chicago concerts and shows. Safe group travel to United Center, Wrigley Field, Ravinia, and all Chicago venues. Book your concert party bus.",
    h1: "Concert & Event Transportation",
    serviceType: "Concert Transportation",
    content: `<p class="text-lg mb-6">Enhance your concert experience with Royal Carriage party bus transportation. Skip the parking hassles, traffic stress, and designated driver worries. Travel to concerts and events with your group in a mobile party atmosphere.</p>

<h2 class="text-2xl font-bold mb-4">Why Use a Party Bus for Concerts</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>No Parking Hassles:</strong> Drop-off at venue entrance, no expensive parking fees</li>
  <li><strong>Start the Party Early:</strong> Pre-concert celebration during travel</li>
  <li><strong>Everyone Travels Together:</strong> Keep your group together to and from venue</li>
  <li><strong>Safe Post-Concert Return:</strong> Professional driver gets everyone home safely</li>
  <li><strong>No Traffic Stress:</strong> Let the driver handle post-concert traffic</li>
  <li><strong>BYOB:</strong> Enjoy beverages during travel (must be 21+)</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Chicago Concert Venues We Serve</h2>
<div class="grid md:grid-cols-2 gap-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">United Center</h3>
    <p class="text-sm">Major concerts, Bulls/Blackhawks games, and large events</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Wrigley Field</h3>
    <p class="text-sm">Cubs games, summer concerts, and special events</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Ravinia Festival</h3>
    <p class="text-sm">Outdoor summer concerts in Highland Park</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Hollywood Casino Amphitheatre</h3>
    <p class="text-sm">Outdoor concerts in Tinley Park</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">Aragon Ballroom</h3>
    <p class="text-sm">Mid-size venue concerts on Lawrence Ave</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold mb-2">House of Blues</h3>
    <p class="text-sm">Marina City venue for various concerts</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Concert Transportation Process</h2>
<ol class="list-decimal list-inside space-y-2 mb-6">
  <li><strong>Book Early:</strong> Reserve your party bus when you buy concert tickets</li>
  <li><strong>Pickup:</strong> We pick up your group at designated location(s)</li>
  <li><strong>Pre-Concert Party:</strong> Enjoy the ride and get excited for the show</li>
  <li><strong>Venue Drop-Off:</strong> Convenient drop-off near venue entrance</li>
  <li><strong>Waiting Service:</strong> Driver waits or returns at concert end</li>
  <li><strong>Post-Concert Pickup:</strong> Quick departure while others wait in traffic</li>
  <li><strong>Safe Return:</strong> Comfortable ride home reliving concert highlights</li>
</ol>

<h2 class="text-2xl font-bold mb-4">Popular Concert Packages</h2>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>Standard Package:</strong> Round-trip transportation to/from concert</li>
  <li><strong>Extended Package:</strong> Pre-concert bar/restaurant stop included</li>
  <li><strong>VIP Package:</strong> Waiting service, multiple stops, full evening coverage</li>
  <li><strong>Festival Package:</strong> All-day service for music festivals</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Sporting Events Transportation</h2>
<p class="mb-4">Not just concerts - perfect for sporting events too:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Bears games at Soldier Field</li>
  <li>Cubs and White Sox games</li>
  <li>Bulls and Blackhawks at United Center</li>
  <li>Fire soccer matches</li>
  <li>Northwestern and college sports</li>
</ul>`,
  },
  "fleet.astro": {
    title: "Party Bus Fleet - View Our Chicago Party Buses",
    description:
      "View our fleet of party buses in Chicago. Various sizes from 20-30 passengers with entertainment systems, LED lighting, and premium features.",
    h1: "Our Party Bus Fleet",
    content: `<p class="text-lg mb-6">Royal Carriage Limousine maintains a modern fleet of party buses designed for group celebrations. Each vehicle features entertainment systems, comfortable seating, and amenities to keep your party going while traveling throughout Chicago.</p>

<h2 class="text-2xl font-bold mb-4">20-Passenger Party Bus</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Medium Group Party Bus</h3>
  <p class="mb-4">Perfect for smaller groups wanting a party atmosphere without excess space.</p>

  <h4 class="font-bold mb-2">Features:</h4>
  <ul class="list-disc list-inside space-y-1 mb-4 text-sm">
    <li>Seating for up to 20 passengers</li>
    <li>Premium sound system with subwoofers</li>
    <li>LED lighting with multiple color modes</li>
    <li>Bar area with coolers</li>
    <li>Flat screen TVs</li>
    <li>Bluetooth connectivity</li>
    <li>Climate control</li>
    <li>Privacy windows</li>
  </ul>

  <h4 class="font-bold mb-2">Perfect For:</h4>
  <ul class="text-sm space-y-1">
    <li>• Birthday parties</li>
    <li>• Bachelor/Bachelorette parties</li>
    <li>• Small concert groups</li>
    <li>• Bar crawls</li>
    <li>• Corporate team outings</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">30-Passenger Party Bus</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Large Group Party Bus</h3>
  <p class="mb-4">Our largest party bus for big celebrations and events.</p>

  <h4 class="font-bold mb-2">Features:</h4>
  <ul class="list-disc list-inside space-y-1 mb-4 text-sm">
    <li>Seating for up to 30 passengers</li>
    <li>Professional-grade sound system</li>
    <li>Advanced LED lighting with dance floor effects</li>
    <li>Multiple bar areas</li>
    <li>Dance floor area with pole</li>
    <li>Multiple flat screen TVs</li>
    <li>Bluetooth and aux connectivity</li>
    <li>Premium climate control</li>
    <li>Privacy windows throughout</li>
    <li>Laser lighting effects</li>
  </ul>

  <h4 class="font-bold mb-2">Perfect For:</h4>
  <ul class="text-sm space-y-1">
    <li>• Large birthday celebrations</li>
    <li>• Wedding parties</li>
    <li>• Concert groups</li>
    <li>• Corporate events</li>
    <li>• Proms and homecoming</li>
    <li>• Any large group celebration</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">All Party Buses Include</h2>
<div class="grid md:grid-cols-2 gap-4 mb-6">
  <ul class="space-y-2 text-sm">
    <li>✓ Professional chauffeur</li>
    <li>✓ Fuel and tolls</li>
    <li>✓ Premium sound systems</li>
    <li>✓ LED mood lighting</li>
    <li>✓ Climate control</li>
  </ul>
  <ul class="space-y-2 text-sm">
    <li>✓ Bar areas with coolers and ice</li>
    <li>✓ Bluetooth connectivity</li>
    <li>✓ Entertainment systems</li>
    <li>✓ Privacy windows</li>
    <li>✓ Unlimited mileage (Chicagoland)</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Choosing the Right Size</h2>
<p class="mb-4">Select your party bus based on group size:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>12-20 guests:</strong> 20-passenger party bus provides comfortable space</li>
  <li><strong>20-30 guests:</strong> 30-passenger party bus ensures everyone fits comfortably</li>
  <li><strong>Need more space?:</strong> Consider renting multiple vehicles or our largest bus</li>
  <li><strong>Want room to move?:</strong> Choose larger bus even with smaller group for dance space</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Vehicle Maintenance</h2>
<p class="mb-4">All party buses maintained to highest standards:</p>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li>Regular mechanical inspections and servicing</li>
  <li>Professional cleaning and sanitization between rentals</li>
  <li>Entertainment system testing and updates</li>
  <li>Safety equipment checks</li>
  <li>DOT and licensing compliance</li>
</ul>`,
  },
  "contact.astro": {
    title: "Contact - Party Bus Rental Quotes",
    description:
      "Contact Royal Carriage for party bus rental quotes in Chicago. Check availability, get pricing, and book your party bus. Call (224) 801-3090.",
    h1: "Contact Us - Party Bus Rentals",
    content: `<p class="text-lg mb-6">Ready to book your party bus rental in Chicago? Contact Royal Carriage Limousine for availability, quotes, and to plan your group celebration or event transportation.</p>

<div class="grid md:grid-cols-2 gap-8 mb-8">
  <div>
    <h2 class="text-2xl font-bold mb-4">Get a Quote</h2>
    <div class="space-y-4 mb-6">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
        <div>
          <p class="font-bold">Phone</p>
          <a href="tel:+12248013090" class="text-blue-600 hover:text-blue-800 text-lg">(224) 801-3090</a>
          <p class="text-sm text-gray-600">Available 7 days/week</p>
        </div>
      </div>
    </div>

    <h3 class="text-xl font-bold mb-3">Party Bus Quote Information</h3>
    <p class="mb-4">To provide accurate pricing, please provide:</p>
    <ul class="list-disc list-inside space-y-2 text-sm mb-6">
      <li>Event date and day of week</li>
      <li>Number of passengers in your group</li>
      <li>Approximate hours needed (4-hour minimum)</li>
      <li>Pickup location(s)</li>
      <li>Destination(s) or general itinerary</li>
      <li>Type of event (birthday, concert, etc)</li>
      <li>Any special requests or requirements</li>
    </ul>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Booking Information</h2>

    <h3 class="font-bold mb-2">Minimum Rental:</h3>
    <p class="text-sm mb-4">4 hours minimum rental required for all party buses. Additional hours available.</p>

    <h3 class="font-bold mb-2">Peak Times:</h3>
    <p class="text-sm mb-4">Friday and Saturday nights, prom season (April-May), and major concert dates book quickly. Reserve early!</p>

    <h3 class="font-bold mb-2">Deposit:</h3>
    <p class="text-sm mb-4">Deposit required to secure booking. Balance due before or on event day.</p>

    <h3 class="font-bold mb-2">Age Requirements:</h3>
    <p class="text-sm mb-4">Renter must be 21+ and sign rental agreement. All passengers must follow rules regarding alcohol consumption (21+only).</p>

    <h3 class="font-bold mb-2">Cancellation Policy:</h3>
    <p class="text-sm">Full refund if cancelled 7+ days before event. See rental agreement for details.</p>
  </div>
</div>

<div class="bg-blue-50 p-6 rounded-lg mb-6">
  <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
  <div class="space-y-4">
    <div>
      <p class="font-bold">Can we bring our own alcohol?</p>
      <p class="text-sm">Yes (BYOB), must be 21+. We provide coolers and ice. No kegs or glass bottles.</p>
    </div>
    <div>
      <p class="font-bold">How many stops can we make?</p>
      <p class="text-sm">Unlimited stops within your rental time. Each stop's waiting time counts against total hours.</p>
    </div>
    <div>
      <p class="font-bold">Can we smoke on the party bus?</p>
      <p class="text-sm">No smoking (including vaping) allowed inside any vehicle.</p>
    </div>
    <div>
      <p class="font-bold">What happens if we go over our rental time?</p>
      <p class="text-sm">Overtime charged at prorated hourly rate. Please plan accordingly.</p>
    </div>
  </div>
</div>`,
  },
};

fs.mkdirSync(path.join(rootDir, "apps/partybus/src/pages"), {
  recursive: true,
});

Object.entries(partybusPages).forEach(([filename, data]) => {
  createPage("partybus", "partybus", filename, data);
});

console.log("✓ Party Bus site complete\n");

console.log("\n✅ ALL SITES COMPLETED!");
console.log("\nSummary:");
console.log("  ✓ Corporate: 6 pages");
console.log("  ✓ Wedding: 5 pages");
console.log("  ✓ PartyBus: 6 pages");
console.log("  ✓ Airport: 9 pages (created earlier)\n");
console.log("Next steps:");
console.log("  1. Run: pnpm install");
console.log("  2. Run: pnpm run build:all-sites");
console.log(
  "  3. Run: firebase deploy --only hosting:airport,hosting:corporate,hosting:wedding,hosting:partybus\n",
);
