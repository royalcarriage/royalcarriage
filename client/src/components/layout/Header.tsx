import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";

const PHONE_NUMBER = "+1 (224) 801-3090";
const PHONE_TEL = "tel:+12248013090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/ohare-airport-limo", label: "O'Hare" },
  { href: "/midway-airport-limo", label: "Midway" },
  { href: "/airport-limo-downtown-chicago", label: "Downtown" },
  { href: "/airport-limo-suburbs", label: "Suburbs" },
  { href: "/fleet", label: "Fleet" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            data-testid="link-home-logo"
          >
            <div className="w-10 h-10 bg-foreground rounded-md flex items-center justify-center">
              <span className="text-background font-bold text-lg">CB</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-foreground text-sm md:text-base">
                Chicago Airport
              </span>
              <span className="block text-xs text-muted-foreground">
                Black Car Service
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location === link.href
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z]/g, "")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={PHONE_TEL}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-foreground"
              data-testid="link-header-phone"
            >
              <Phone className="w-4 h-4" />
              {PHONE_NUMBER}
            </a>
            <Button
              asChild
              className="hidden sm:flex"
              data-testid="button-header-book"
            >
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Book Now
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-base font-medium rounded-md transition-colors ${
                  location === link.href
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(/[^a-z]/g, "")}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={PHONE_TEL}
              className="flex items-center gap-2 px-4 py-3 text-base font-semibold text-foreground"
              data-testid="link-mobile-phone"
            >
              <Phone className="w-5 h-5" />
              {PHONE_NUMBER}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
