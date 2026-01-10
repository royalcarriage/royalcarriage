import { Button } from "@/components/ui/button";
import { Phone, Calendar } from "lucide-react";
import { TrustBadges } from "./TrustBadges";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  showTrustBadges?: boolean;
  breadcrumb?: { label: string; href: string }[];
}

export function Hero({ title, subtitle, backgroundImage, showTrustBadges = false, breadcrumb }: HeroProps) {
  return (
    <section 
      className="relative min-h-[400px] md:min-h-[480px] flex items-center"
      data-testid="section-hero"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 w-full">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-white/70">
              {breadcrumb.map((item, index) => (
                <li key={item.href} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight" data-testid="text-hero-title">
            {title}
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-6 leading-relaxed" data-testid="text-hero-subtitle">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-foreground hover:bg-white/90 font-semibold text-base px-6"
              data-testid="button-hero-call"
            >
              <a href={PHONE_TEL}>
                <Phone className="w-5 h-5 mr-2" />
                Call {PHONE_DISPLAY}
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 font-semibold text-base px-6"
              data-testid="button-hero-book"
            >
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-5 h-5 mr-2" />
                Book Online
              </a>
            </Button>
          </div>
          
          {showTrustBadges && <TrustBadges />}
        </div>
      </div>
    </section>
  );
}
