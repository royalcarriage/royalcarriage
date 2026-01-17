#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Airport pages with content
const airportPages = {
  "ohare-airport-limo.astro": {
    title:
      "O'Hare Airport Limousine Service - Chicago Black Car Transportation",
    description:
      "Professional limousine service to O'Hare International Airport. Luxury black car transportation with flight tracking, meet & greet service, and punctual pickup. Book your O'Hare limo now.",
    h1: "O'Hare Airport Limousine Service",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine provides premium transportation services to and from Chicago O'Hare International Airport (ORD). As Chicago's busiest airport, O'Hare requires reliable, professional transportation that you can count on. Our experienced chauffeurs and luxury fleet ensure you arrive on time, every time.</p>

<h2 class="text-2xl font-bold mb-4">Why Choose Our O'Hare Limo Service?</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li><strong>Flight Tracking:</strong> We monitor your flight status in real-time to adjust pickup times for delays or early arrivals</li>
  <li><strong>Meet & Greet Service:</strong> Your chauffeur will be waiting at baggage claim with a name sign</li>
  <li><strong>All Terminals Covered:</strong> Service to and from all O'Hare terminals including international arrivals</li>
  <li><strong>Luggage Assistance:</strong> Professional help with all luggage, including oversized items</li>
  <li><strong>24/7 Availability:</strong> Service available around the clock for any flight time</li>
  <li><strong>Flat Rate Pricing:</strong> No surge pricing or hidden fees, just transparent flat rates</li>
</ul>

<h2 class="text-2xl font-bold mb-4">O'Hare Airport Transportation Routes</h2>
<p class="text-gray-700 mb-4">We provide limousine service from O'Hare to all Chicago destinations:</p>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li>O'Hare to Downtown Chicago (Loop, River North, Gold Coast)</li>
  <li>O'Hare to North Shore suburbs (Evanston, Wilmette, Highland Park)</li>
  <li>O'Hare to Western suburbs (Naperville, Oak Brook, Wheaton)</li>
  <li>O'Hare to Northwest suburbs (Schaumburg, Arlington Heights, Palatine)</li>
  <li>O'Hare to South suburbs (Tinley Park, Orland Park)</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Our O'Hare Service Process</h2>
<div class="bg-gray-50 p-6 rounded-lg mb-6">
  <ol class="list-decimal list-inside space-y-3 text-gray-700">
    <li><strong>Book Online:</strong> Reserve your O'Hare limo service with flight details</li>
    <li><strong>Flight Monitoring:</strong> We track your flight and adjust pickup time automatically</li>
    <li><strong>Meet & Greet:</strong> Chauffeur waits at baggage claim with name sign</li>
    <li><strong>Luggage Handling:</strong> Professional assistance with all bags</li>
    <li><strong>Comfortable Ride:</strong> Relax in a luxury vehicle to your destination</li>
    <li><strong>Safe Arrival:</strong> Door-to-door service to your exact location</li>
  </ol>
</div>

<h2 class="text-2xl font-bold mb-4">Business Travel to O'Hare</h2>
<p class="text-gray-700 mb-6">Our corporate clients rely on us for consistent, professional O'Hare airport transportation. We understand the importance of punctuality for business travel and provide quiet, productive environments for calls or work during transit. All vehicles feature Wi-Fi, power outlets, and privacy partitions.</p>`,
  },
  "midway-airport-limo.astro": {
    title:
      "Midway Airport Limousine Service - Chicago South Side Transportation",
    description:
      "Reliable limousine service to Chicago Midway Airport. Professional black car service with experienced drivers, luxury vehicles, and on-time guarantee. Book Midway limo transportation now.",
    h1: "Midway Airport Limousine Service",
    content: `<p class="text-lg text-gray-700 mb-6">Experience premium transportation to and from Chicago Midway International Airport (MDW) with Royal Carriage Limousine. Conveniently located on Chicago's southwest side, Midway Airport serves millions of travelers annually. Our professional chauffeur service ensures stress-free airport transportation with punctual, reliable service.</p>

<h2 class="text-2xl font-bold mb-4">Midway Airport Limo Features</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li><strong>Real-Time Flight Tracking:</strong> Automatic adjustments for flight delays or early arrivals</li>
  <li><strong>Curbside Pickup:</strong> Convenient meetup at designated pickup areas</li>
  <li><strong>Quick Access:</strong> Midway's smaller size means faster pickups and drop-offs</li>
  <li><strong>All Concourses:</strong> Service to Gates A, B, and C</li>
  <li><strong>Competitive Rates:</strong> Affordable luxury transportation to Midway</li>
  <li><strong>Professional Service:</strong> Courteous chauffeurs familiar with Midway's layout</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Popular Midway Routes</h2>
<div class="grid md:grid-cols-2 gap-4 mb-6">
  <div class="bg-gray-50 p-4 rounded">
    <h3 class="font-bold mb-2">From Midway Airport:</h3>
    <ul class="text-sm space-y-1 text-gray-700">
      <li>• Downtown Chicago</li>
      <li>• South Loop</li>
      <li>• Hyde Park</li>
      <li>• South Suburbs</li>
      <li>• Indiana Border Cities</li>
    </ul>
  </div>
  <div class="bg-gray-50 p-4 rounded">
    <h3 class="font-bold mb-2">To Midway Airport:</h3>
    <ul class="text-sm space-y-1 text-gray-700">
      <li>• Hotel Pickups</li>
      <li>• Residential Addresses</li>
      <li>• Corporate Offices</li>
      <li>• Special Events</li>
      <li>• Convention Centers</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Why Travelers Choose Us for Midway</h2>
<p class="text-gray-700 mb-4">Midway Airport's location makes it a popular choice for South Side and suburban travelers. Our chauffeurs know the optimal routes to avoid traffic on the Stevenson Expressway (I-55) and surface streets. Whether you're flying Southwest, Delta, or another carrier, we provide seamless door-to-door service.</p>

<p class="text-gray-700 mb-6">We serve frequent Midway travelers including business professionals commuting to Springfield or St. Louis, families visiting relatives, and tourists exploring Chicago. Our service includes luggage handling, vehicle cleanliness, and courteous drivers who make your journey comfortable and efficient.</p>`,
  },
  "airport-limo-downtown-chicago.astro": {
    title: "Airport Limousine to Downtown Chicago - O'Hare & Midway Service",
    description:
      "Professional airport limousine service between downtown Chicago and O'Hare or Midway airports. Luxury transportation to the Loop, River North, and all downtown destinations.",
    h1: "Airport Limousine Service to Downtown Chicago",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine specializes in seamless transportation between Chicago's airports and downtown locations. Whether you're heading to a hotel in the Loop, a meeting in River North, or any downtown destination, our professional chauffeur service ensures timely, comfortable arrivals.</p>

<h2 class="text-2xl font-bold mb-4">Downtown Chicago Destinations We Serve</h2>
<div class="grid md:grid-cols-3 gap-4 mb-6">
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">The Loop</h3>
    <p class="text-sm text-gray-700">Chicago's central business district, financial institutions, and City Hall area</p>
  </div>
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">River North</h3>
    <p class="text-sm text-gray-700">Gallery district, restaurants, and boutique hotels near the Chicago River</p>
  </div>
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">Streeterville</h3>
    <p class="text-sm text-gray-700">Navy Pier area, Northwestern Memorial Hospital, and lakefront hotels</p>
  </div>
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">Gold Coast</h3>
    <p class="text-sm text-gray-700">Luxury shopping on Michigan Avenue and upscale residential area</p>
  </div>
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">South Loop</h3>
    <p class="text-sm text-gray-700">Museum Campus, Soldier Field, and McCormick Place convention center</p>
  </div>
  <div class="bg-blue-50 p-4 rounded">
    <h3 class="font-bold text-blue-600 mb-2">West Loop</h3>
    <p class="text-sm text-gray-700">Restaurant Row, Google offices, and United Center sports venue</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Travel Times to Downtown</h2>
<ul class="space-y-2 mb-6 text-gray-700">
  <li><strong>O'Hare to Downtown:</strong> 35-45 minutes depending on traffic and destination</li>
  <li><strong>Midway to Downtown:</strong> 25-35 minutes via I-55 or surface streets</li>
  <li><strong>Peak Hour Adjustments:</strong> We factor in rush hour traffic (7-9 AM, 4-6 PM)</li>
  <li><strong>Express Lane Access:</strong> I-Pass equipped vehicles for faster travel</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Hotel Partnerships</h2>
<p class="text-gray-700 mb-6">We provide preferred airport transportation for guests at major downtown Chicago hotels including The Palmer House, The Langham, Four Seasons, Peninsula Chicago, and many others. Ask your hotel concierge about Royal Carriage Limousine for your airport transfers.</p>`,
  },
  "airport-limo-suburbs.astro": {
    title:
      "Chicago Suburbs Airport Limousine Service - Naperville, Schaumburg & More",
    description:
      "Airport limousine service to all Chicago suburbs. Professional transportation from O'Hare and Midway to Naperville, Schaumburg, Oak Brook, and throughout Chicagoland.",
    h1: "Airport Limousine Service to Chicago Suburbs",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine provides comprehensive airport transportation throughout the Chicago metropolitan area. Whether you're traveling to the North Shore, western suburbs, or south suburbs, our professional chauffeur service delivers reliable, comfortable transportation to and from both O'Hare and Midway airports.</p>

<h2 class="text-2xl font-bold mb-4">Suburbs We Serve</h2>

<h3 class="text-xl font-bold mb-3 mt-6">North & Northwest Suburbs</h3>
<div class="grid md:grid-cols-4 gap-3 mb-6">
  <div class="bg-gray-100 p-3 rounded text-center">Evanston</div>
  <div class="bg-gray-100 p-3 rounded text-center">Skokie</div>
  <div class="bg-gray-100 p-3 rounded text-center">Wilmette</div>
  <div class="bg-gray-100 p-3 rounded text-center">Highland Park</div>
  <div class="bg-gray-100 p-3 rounded text-center">Schaumburg</div>
  <div class="bg-gray-100 p-3 rounded text-center">Arlington Heights</div>
  <div class="bg-gray-100 p-3 rounded text-center">Palatine</div>
  <div class="bg-gray-100 p-3 rounded text-center">Wheeling</div>
</div>

<h3 class="text-xl font-bold mb-3 mt-6">Western Suburbs</h3>
<div class="grid md:grid-cols-4 gap-3 mb-6">
  <div class="bg-gray-100 p-3 rounded text-center">Naperville</div>
  <div class="bg-gray-100 p-3 rounded text-center">Oak Brook</div>
  <div class="bg-gray-100 p-3 rounded text-center">Wheaton</div>
  <div class="bg-gray-100 p-3 rounded text-center">Downers Grove</div>
  <div class="bg-gray-100 p-3 rounded text-center">Elmhurst</div>
  <div class="bg-gray-100 p-3 rounded text-center">Hinsdale</div>
  <div class="bg-gray-100 p-3 rounded text-center">Lombard</div>
  <div class="bg-gray-100 p-3 rounded text-center">Glen Ellyn</div>
</div>

<h3 class="text-xl font-bold mb-3 mt-6">South Suburbs</h3>
<div class="grid md:grid-cols-4 gap-3 mb-6">
  <div class="bg-gray-100 p-3 rounded text-center">Orland Park</div>
  <div class="bg-gray-100 p-3 rounded text-center">Tinley Park</div>
  <div class="bg-gray-100 p-3 rounded text-center">Oak Lawn</div>
  <div class="bg-gray-100 p-3 rounded text-center">Frankfort</div>
</div>

<h2 class="text-2xl font-bold mb-4">Why Suburban Travelers Choose Us</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li><strong>Local Knowledge:</strong> Chauffeurs familiar with suburban routes and traffic patterns</li>
  <li><strong>Door-to-Door Service:</strong> Pickup and drop-off at your exact residential or business address</li>
  <li><strong>Competitive Suburban Rates:</strong> Fair pricing for longer-distance airport transportation</li>
  <li><strong>Early Morning Service:</strong> Available for dawn flights from suburban locations</li>
  <li><strong>Toll-Inclusive Pricing:</strong> No surprise fees for highway tolls on expressways</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Suburban Corporate Accounts</h2>
<p class="text-gray-700 mb-6">Many suburban businesses rely on Royal Carriage for employee airport transportation. We provide account billing, ride reports, and dedicated service for corporate locations in business parks and office complexes throughout Chicagoland. Contact us about establishing a corporate account for your suburban location.</p>`,
  },
  "fleet.astro": {
    title: "Luxury Airport Limousine Fleet - Sedans, SUVs & Vans",
    description:
      "View our luxury fleet of airport limousines including executive sedans, SUVs, and passenger vans. Immaculately maintained vehicles with professional chauffeurs for Chicago airport transportation.",
    h1: "Our Luxury Fleet",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine maintains a premium fleet of vehicles to accommodate all your airport transportation needs. Every vehicle is meticulously maintained, regularly detailed, and equipped with modern amenities for your comfort and convenience.</p>

<h2 class="text-2xl font-bold mb-4">Executive Sedans</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Lincoln Continental & Similar</h3>
  <ul class="list-disc list-inside space-y-2 text-gray-700 mb-4">
    <li>Seating capacity: Up to 3 passengers</li>
    <li>Luggage capacity: 3-4 large suitcases</li>
    <li>Perfect for: Individual travelers, couples, small business groups</li>
    <li>Features: Leather seating, climate control, smartphone connectivity, bottled water</li>
  </ul>
  <p class="text-gray-700">Our executive sedans provide a quiet, comfortable ride ideal for business travelers or anyone seeking a premium airport transportation experience.</p>
</div>

<h2 class="text-2xl font-bold mb-4">Luxury SUVs</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Cadillac Escalade & Similar</h3>
  <ul class="list-disc list-inside space-y-2 text-gray-700 mb-4">
    <li>Seating capacity: Up to 6 passengers</li>
    <li>Luggage capacity: 6-8 large suitcases</li>
    <li>Perfect for: Families, small groups, travelers with extra luggage</li>
    <li>Features: Spacious interior, entertainment system, Wi-Fi, power outlets, privacy glass</li>
  </ul>
  <p class="text-gray-700">Luxury SUVs offer extra space and comfort for groups or travelers with additional luggage needs while maintaining a premium travel experience.</p>
</div>

<h2 class="text-2xl font-bold mb-4">Passenger Vans</h2>
<div class="bg-white p-6 rounded-lg shadow-md mb-6">
  <h3 class="text-xl font-bold mb-3">Mercedes Sprinter & Similar</h3>
  <ul class="list-disc list-inside space-y-2 text-gray-700 mb-4">
    <li>Seating capacity: Up to 12 passengers</li>
    <li>Luggage capacity: 12-14 large suitcases</li>
    <li>Perfect for: Corporate groups, wedding parties, family reunions</li>
    <li>Features: Individual captain's chairs, A/C zones, entertainment, ample headroom</li>
  </ul>
  <p class="text-gray-700">Our luxury passenger vans are ideal for group airport transportation, offering comfort and convenience for everyone traveling together.</p>
</div>

<h2 class="text-2xl font-bold mb-4">Fleet Standards</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li>All vehicles less than 3 years old</li>
  <li>Regular professional detailing and sanitization</li>
  <li>Comprehensive safety inspections</li>
  <li>GPS tracking for optimal routing</li>
  <li>Fully insured and licensed</li>
  <li>Complimentary amenities: bottled water, phone chargers, Wi-Fi</li>
</ul>`,
  },
  "pricing.astro": {
    title: "Airport Limousine Service Pricing - Transparent Flat Rates",
    description:
      "View transparent flat rate pricing for Chicago airport limousine service. No hidden fees, no surge pricing. Get an instant quote for O'Hare or Midway airport transportation.",
    h1: "Transparent Pricing for Airport Limousine Service",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine believes in transparent, fair pricing. We offer flat rates for airport transportation with no hidden fees, no surge pricing, and no surprises. Get an instant quote online or call us for immediate pricing.</p>

<h2 class="text-2xl font-bold mb-4">Our Pricing Philosophy</h2>
<div class="bg-blue-50 p-6 rounded-lg mb-6">
  <ul class="space-y-3 text-gray-700">
    <li><strong>✓ Flat Rate Pricing:</strong> One price quoted, one price charged</li>
    <li><strong>✓ No Surge Pricing:</strong> Same rates during peak hours and holidays</li>
    <li><strong>✓ No Hidden Fees:</strong> Tolls and gratuity options clearly stated</li>
    <li><strong>✓ Free Wait Time:</strong> Complimentary waiting for flight delays up to 60 minutes</li>
    <li><strong>✓ Free Cancellation:</strong> Cancel up to 24 hours before for full refund</li>
  </ul>
</div>

<h2 class="text-2xl font-bold mb-4">Sample Flat Rates</h2>
<div class="overflow-x-auto mb-6">
  <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
    <thead class="bg-blue-600 text-white">
      <tr>
        <th class="p-3 text-left">Route</th>
        <th class="p-3 text-left">Sedan</th>
        <th class="p-3 text-left">SUV</th>
        <th class="p-3 text-left">Van</th>
      </tr>
    </thead>
    <tbody class="text-gray-700">
      <tr class="border-b">
        <td class="p-3">O'Hare to Downtown</td>
        <td class="p-3">Starting $75</td>
        <td class="p-3">Starting $95</td>
        <td class="p-3">Starting $135</td>
      </tr>
      <tr class="border-b">
        <td class="p-3">Midway to Downtown</td>
        <td class="p-3">Starting $65</td>
        <td class="p-3">Starting $85</td>
        <td class="p-3">Starting $125</td>
      </tr>
      <tr class="border-b">
        <td class="p-3">O'Hare to Naperville</td>
        <td class="p-3">Starting $95</td>
        <td class="p-3">Starting $115</td>
        <td class="p-3">Starting $155</td>
      </tr>
      <tr>
        <td class="p-3">O'Hare to Schaumburg</td>
        <td class="p-3">Starting $70</td>
        <td class="p-3">Starting $90</td>
        <td class="p-3">Starting $130</td>
      </tr>
    </tbody>
  </table>
</div>
<p class="text-sm text-gray-600 mb-6">*Rates shown are starting prices for standard service. Final price depends on exact pickup and drop-off addresses. Get an exact quote online.</p>

<h2 class="text-2xl font-bold mb-4">What's Included</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li>Professional chauffeur service</li>
  <li>Flight tracking and monitoring</li>
  <li>Meet and greet at baggage claim</li>
  <li>Luggage assistance</li>
  <li>Bottled water and amenities</li>
  <li>All fuel and vehicle costs</li>
  <li>Highway tolls (on most routes)</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Additional Services</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li><strong>Hourly Service:</strong> Starting at $75/hour (3-hour minimum)</li>
  <li><strong>Child Car Seats:</strong> Available upon request ($10 per seat)</li>
  <li><strong>Extra Stops:</strong> $15 per additional stop along route</li>
  <li><strong>After-Hours Pickup:</strong> No additional fee for late night or early morning</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Payment Methods</h2>
<p class="text-gray-700 mb-4">We accept all major credit cards, debit cards, corporate accounts, and cash. Payment can be made online during booking or directly to your chauffeur. Corporate invoicing available for established accounts.</p>`,
  },
  "about.astro": {
    title: "About Royal Carriage Limousine - Chicago Airport Transportation",
    description:
      "Learn about Royal Carriage Limousine, Chicago's premier airport transportation service. Professional chauffeurs, luxury fleet, and commitment to excellence since our founding.",
    h1: "About Royal Carriage Limousine",
    content: `<p class="text-lg text-gray-700 mb-6">Royal Carriage Limousine has been providing exceptional airport transportation services throughout Chicago and surrounding suburbs. We've built our reputation on reliability, professionalism, and an unwavering commitment to customer satisfaction.</p>

<h2 class="text-2xl font-bold mb-4">Our Mission</h2>
<p class="text-gray-700 mb-6">To provide the most reliable, professional, and comfortable airport limousine service in Chicago. We strive to make every journey seamless, stress-free, and punctual, whether you're traveling for business or leisure.</p>

<h2 class="text-2xl font-bold mb-4">Why Choose Royal Carriage</h2>
<div class="grid md:grid-cols-2 gap-6 mb-6">
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3 text-blue-600">Professional Chauffeurs</h3>
    <p class="text-gray-700">Our chauffeurs are carefully selected, thoroughly vetted, and extensively trained. All drivers undergo background checks, have excellent driving records, and are knowledgeable about Chicago area routes and traffic patterns.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3 text-blue-600">Luxury Fleet</h3>
    <p class="text-gray-700">We maintain a modern fleet of luxury vehicles including executive sedans, SUVs, and passenger vans. Every vehicle is meticulously maintained, regularly detailed, and equipped with premium amenities.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3 text-blue-600">24/7 Availability</h3>
    <p class="text-gray-700">Airport flights don't follow a 9-to-5 schedule, and neither do we. Royal Carriage is available 24 hours a day, 7 days a week, including holidays, for all your airport transportation needs.</p>
  </div>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-3 text-blue-600">Technology-Driven</h3>
    <p class="text-gray-700">We use advanced flight tracking systems, GPS routing, and real-time traffic monitoring to ensure punctual service. Easy online booking and instant confirmations make reservations simple.</p>
  </div>
</div>

<h2 class="text-2xl font-bold mb-4">Our Service Standards</h2>
<ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
  <li>Punctuality guaranteed - we're always on time</li>
  <li>Immaculate vehicles cleaned and sanitized before every trip</li>
  <li>Professional attire and courteous service from all chauffeurs</li>
  <li>Confidentiality and discretion for all clients</li>
  <li>Safe driving practices and defensive driving techniques</li>
  <li>Comprehensive insurance coverage for your protection</li>
</ul>

<h2 class="text-2xl font-bold mb-4">Serving All of Chicagoland</h2>
<p class="text-gray-700 mb-6">From downtown Chicago to the farthest suburbs, Royal Carriage provides comprehensive airport limousine service throughout the metropolitan area. We know the best routes to O'Hare and Midway airports from every neighborhood and suburb, ensuring efficient, comfortable transportation regardless of your location.</p>

<h2 class="text-2xl font-bold mb-4">Corporate & Individual Services</h2>
<p class="text-gray-700 mb-6">Whether you're a business executive requiring regular airport transportation, a family traveling on vacation, or an event planner coordinating group transfers, Royal Carriage Limousine has the expertise and fleet to meet your needs. We offer both individual reservations and corporate account services with flexible billing options.</p>`,
  },
  "contact.astro": {
    title: "Contact Royal Carriage Limousine - Book Airport Transportation",
    description:
      "Contact Royal Carriage Limousine for Chicago airport transportation. Call (224) 801-3090 or book online. 24/7 customer service for O'Hare and Midway limo service.",
    h1: "Contact Us",
    content: `<p class="text-lg text-gray-700 mb-6">Ready to book your airport limousine service? Contact Royal Carriage Limousine today. We're available 24/7 to answer questions, provide quotes, and make reservations for O'Hare and Midway airport transportation.</p>

<div class="grid md:grid-cols-2 gap-8 mb-8">
  <div>
    <h2 class="text-2xl font-bold mb-4">Get In Touch</h2>
    <div class="space-y-4">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
        <div>
          <p class="font-bold">Phone</p>
          <a href="tel:+12248013090" class="text-blue-600 hover:text-blue-800">(224) 801-3090</a>
          <p class="text-sm text-gray-600">Available 24/7</p>
        </div>
      </div>

      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <div>
          <p class="font-bold">Service Area</p>
          <p class="text-gray-700">Chicago & All Suburbs</p>
          <p class="text-sm text-gray-600">O'Hare & Midway Airports</p>
        </div>
      </div>

      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="font-bold">Hours</p>
          <p class="text-gray-700">24/7 Service</p>
          <p class="text-sm text-gray-600">Including holidays</p>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <h3 class="text-xl font-bold mb-3">Quick Quote Request</h3>
      <p class="text-gray-700 mb-4">For the fastest service, book online using our instant quote system. You'll receive immediate confirmation and pricing.</p>
    </div>
  </div>

  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
    <div class="space-y-4">
      <div>
        <p class="font-bold">How far in advance should I book?</p>
        <p class="text-sm text-gray-700">We recommend booking at least 24 hours in advance, but we can often accommodate same-day reservations based on availability.</p>
      </div>
      <div>
        <p class="font-bold">Do you track flight delays?</p>
        <p class="text-sm text-gray-700">Yes, we monitor all flights in real-time and automatically adjust pickup times for delays or early arrivals at no extra charge.</p>
      </div>
      <div>
        <p class="font-bold">What is your cancellation policy?</p>
        <p class="text-sm text-gray-700">Free cancellation up to 24 hours before scheduled pickup. Cancellations within 24 hours may incur a fee.</p>
      </div>
      <div>
        <p class="font-bold">Do you offer corporate accounts?</p>
        <p class="text-sm text-gray-700">Yes, we provide corporate billing with monthly invoicing for businesses requiring frequent airport transportation.</p>
      </div>
      <div>
        <p class="font-bold">Are gratuities included?</p>
        <p class="text-sm text-gray-700">Gratuity is not included in the quoted price but can be added during booking or paid directly to your chauffeur.</p>
      </div>
    </div>
  </div>
</div>

<div class="bg-blue-600 text-white p-8 rounded-lg text-center">
  <h2 class="text-2xl font-bold mb-4">Ready to Experience Premium Airport Transportation?</h2>
  <p class="mb-6">Book online now or call us for immediate assistance</p>
</div>`,
  },
};

// Function to create airport page
function createAirportPage(filename, pageData) {
  const pagePath = path.join(rootDir, "apps/airport/src/pages", filename);

  const content = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import CTAButton from '@packages/astro-components/CTAButton.astro';
import CallButton from '@packages/astro-components/CallButton.astro';
import { generateServiceSchema } from '@packages/astro-utils/schema';
import { getSiteConfig } from '@packages/astro-utils/config';

const config = getSiteConfig('airport');
const serviceSchema = generateServiceSchema({
  config,
  serviceName: '${pageData.h1}',
  serviceDescription: '${pageData.description}',
  serviceType: 'Airport Limousine Service',
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
        <CTAButton target="airport" location="hero" size="lg" />
        <CallButton target="airport" location="hero" size="lg" />
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
      <h2 class="text-3xl font-bold mb-6">Book Your Airport Limousine Now</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <CTAButton target="airport" location="bottom-cta" size="lg" />
        <CallButton target="airport" location="bottom-cta" size="lg" variant="primary" />
      </div>
    </div>
  </div>
</BaseLayout>
`;

  fs.writeFileSync(pagePath, content);
  console.log(`✓ Created ${filename}`);
}

// Create all airport pages
console.log("Creating Airport site pages...");
Object.entries(airportPages).forEach(([filename, data]) => {
  createAirportPage(filename, data);
});

console.log("\n✓ Airport pages created successfully!");
console.log(
  "Note: You still need to create pages for Corporate, Wedding, and PartyBus sites.",
);
