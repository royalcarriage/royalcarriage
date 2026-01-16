import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function Chrysler300Page() {
  const vehicle = {
    slug: "chrysler-300",
    name: "Chrysler 300",
    category: "sedan",
    capacity: 3,
    luggage: 2,
    image: "/images/fleet/chrysler-300.jpg",
    description: "Modern luxury sedan with bold styling and comfortable ride.",
    features: [
      "Panoramic sunroof",
      "Premium sound",
      "Heated seats",
      "Navigation system",
    ],
    hourlyRate: 90,
    airportRate: 100,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-6" asChild>
        <a href="/fleet">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Fleet
        </a>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Vehicle Image */}
        <div>
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/800x600?text=" + vehicle.name;
            }}
          />
        </div>

        {/* Vehicle Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold">{vehicle.name}</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {vehicle.category}
            </Badge>
          </div>

          <p className="text-xl text-gray-600 mb-6">{vehicle.description}</p>

          {/* Capacity Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Passenger Capacity</p>
                    <p className="text-2xl font-bold">{vehicle.capacity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Luggage Space</p>
                    <p className="text-2xl font-bold">{vehicle.luggage} bags</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="text-2xl font-bold">
                    ${vehicle.hourlyRate}/hour
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Airport Transfer:</span>
                  <span className="text-2xl font-bold">
                    ${vehicle.airportRate}
                  </span>
                </div>
                <p className="text-sm text-gray-500 pt-2 border-t">
                  Prices may vary based on distance, duration, and time of day.
                  Contact us for a detailed quote.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Book Now Button */}
          <Button size="lg" className="w-full" asChild>
            <a href="/contact">
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </a>
          </Button>
        </div>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicle.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <div className="mt-12 prose max-w-none">
        <h2>About the {vehicle.name}</h2>
        <p>
          The {vehicle.name} is an exceptional choice for discerning clients who
          demand comfort, style, and reliability. With seating for up to{" "}
          {vehicle.capacity} passengers and room for {vehicle.luggage} pieces of
          luggage, this vehicle is perfect for a wide range of transportation
          needs.
        </p>
        <h3>Ideal For:</h3>
        <ul>
          <li>Airport transfers and business meetings</li>
          <li>Executive transportation</li>
          <li>Corporate events</li>
          <li>Special occasions</li>
        </ul>
      </div>
    </div>
  );
}
