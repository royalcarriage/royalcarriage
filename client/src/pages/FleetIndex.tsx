import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Calendar } from "lucide-react";

interface Vehicle {
  slug: string;
  name: string;
  category: string;
  capacity: number;
  luggage: number;
  image: string;
  description: string;
  features?: string[];
  hourlyRate: number;
  airportRate: number | null;
}

const vehicles: Vehicle[] = [
  {
    "slug": "lincoln-town-car",
    "name": "Lincoln Town Car",
    "category": "sedan",
    "capacity": 3,
    "luggage": 2,
    "image": "/images/fleet/lincoln-town-car.jpg",
    "description": "Classic luxury sedan perfect for airport transfers and executive transportation.",
    "features": [
      "Leather interior",
      "Climate control",
      "Premium sound system",
      "Tinted windows"
    ],
    "hourlyRate": 85,
    "airportRate": 95
  },
  {
    "slug": "cadillac-escalade",
    "name": "Cadillac Escalade",
    "category": "suv",
    "capacity": 6,
    "luggage": 6,
    "image": "/images/fleet/cadillac-escalade.jpg",
    "description": "Spacious luxury SUV ideal for group travel and extra luggage requirements.",
    "features": [
      "Premium leather seats",
      "Entertainment system",
      "WiFi available",
      "Extra luggage space"
    ],
    "hourlyRate": 125,
    "airportRate": 140
  },
  {
    "slug": "mercedes-sprinter",
    "name": "Mercedes Sprinter Van",
    "category": "van",
    "capacity": 14,
    "luggage": 12,
    "image": "/images/fleet/mercedes-sprinter.jpg",
    "description": "Executive shuttle van for large groups, perfect for corporate events and airport groups.",
    "features": [
      "Reclining seats",
      "USB charging ports",
      "Premium audio",
      "Climate zones"
    ],
    "hourlyRate": 165,
    "airportRate": 180
  },
  {
    "slug": "chrysler-300",
    "name": "Chrysler 300",
    "category": "sedan",
    "capacity": 3,
    "luggage": 2,
    "image": "/images/fleet/chrysler-300.jpg",
    "description": "Modern luxury sedan with bold styling and comfortable ride.",
    "features": [
      "Panoramic sunroof",
      "Premium sound",
      "Heated seats",
      "Navigation system"
    ],
    "hourlyRate": 90,
    "airportRate": 100
  },
  {
    "slug": "stretch-limo",
    "name": "Lincoln Stretch Limousine",
    "category": "limo",
    "capacity": 8,
    "luggage": 3,
    "image": "/images/fleet/stretch-limo.jpg",
    "description": "Classic stretch limousine for weddings, proms, and special occasions.",
    "features": [
      "Bar area",
      "Fiber optic lighting",
      "Premium sound system",
      "Privacy partition"
    ],
    "hourlyRate": 150,
    "airportRate": null
  },
  {
    "slug": "party-bus-20",
    "name": "20 Passenger Party Bus",
    "category": "party-bus",
    "capacity": 20,
    "luggage": 5,
    "image": "/images/fleet/party-bus-20.jpg",
    "description": "Party bus with entertainment system, perfect for celebrations and group events.",
    "features": [
      "LED lighting",
      "Dance floor",
      "Premium sound system",
      "Bar area",
      "Leather seating"
    ],
    "hourlyRate": 220,
    "airportRate": null
  }
];

const categories = [
  {
    "slug": "sedan",
    "name": "Luxury Sedans",
    "description": "Executive sedans for 1-3 passengers"
  },
  {
    "slug": "suv",
    "name": "SUVs",
    "description": "Spacious SUVs for families and groups"
  },
  {
    "slug": "van",
    "name": "Vans & Shuttles",
    "description": "Group transportation for 10+ passengers"
  },
  {
    "slug": "limo",
    "name": "Limousines",
    "description": "Stretch limos for special occasions"
  },
  {
    "slug": "party-bus",
    "name": "Party Buses",
    "description": "Large party buses with entertainment"
  }
];

export default function FleetIndex() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredVehicles = selectedCategory === "all"
    ? vehicles
    : vehicles.filter((v) => v.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Fleet</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from our diverse selection of luxury vehicles for any occasion
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.slug} value={cat.slug}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.slug} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400?text=" + vehicle.name;
                }}
              />
              <CardTitle>{vehicle.name}</CardTitle>
              <Badge variant="secondary">{vehicle.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{vehicle.description}</p>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{vehicle.capacity} passengers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{vehicle.luggage} bags</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Hourly Rate:</span>
                  <span className="font-bold">${vehicle.hourlyRate}/hr</span>
                </div>
                {vehicle.airportRate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Airport Transfer:</span>
                    <span className="font-bold">${vehicle.airportRate}</span>
                  </div>
                )}
              </div>

              <Button className="w-full" asChild>
                <a href={`/fleet/${vehicle.slug}`}>View Details</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
        <Calendar className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Contact us today to reserve your vehicle for your next trip
        </p>
        <Button size="lg" variant="secondary" asChild>
          <a href="/contact">Get a Quote</a>
        </Button>
      </div>
    </div>
  );
}
