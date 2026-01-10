import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Check } from "lucide-react";

const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

interface FleetCardProps {
  name: string;
  image: string;
  passengers: number;
  luggage: number;
  features: string[];
  description: string;
}

export function FleetCard({ name, image, passengers, luggage, features, description }: FleetCardProps) {
  return (
    <Card className="overflow-hidden" data-testid={`card-fleet-${name.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-xl text-foreground mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{description}</p>
        
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{passengers} passengers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{luggage} bags</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-foreground flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
        
        <Button asChild className="w-full" data-testid={`button-quote-${name.toLowerCase().replace(/\s/g, "-")}`}>
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
            Get Quote
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
