import { Button } from "@/components/ui/button";
import { Phone, Calendar } from "lucide-react";

const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  variant?: "dark" | "light";
}

export function CTASection({
  title = "Ready to Book Your Ride?",
  subtitle = "Experience premium airport transportation with Chicago Airport Black Car. Professional chauffeurs, flight tracking, and flat-rate pricing.",
  variant = "dark",
}: CTASectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`py-12 md:py-16 ${isDark ? "bg-foreground" : "bg-accent"}`}
      data-testid="section-cta"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <h2
          className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${isDark ? "text-background" : "text-foreground"}`}
        >
          {title}
        </h2>
        <p
          className={`text-lg max-w-2xl mx-auto mb-8 ${isDark ? "text-background/80" : "text-muted-foreground"}`}
        >
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            variant={isDark ? "secondary" : "default"}
            className="font-semibold text-base px-6"
            data-testid="button-cta-call"
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
            className={`font-semibold text-base px-6 ${isDark ? "border-background text-background hover:bg-background/10" : ""}`}
            data-testid="button-cta-book"
          >
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <Calendar className="w-5 h-5 mr-2" />
              Book Online
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
