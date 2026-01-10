import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";

const PHONE_NUMBER = "+1 (224) 801-3090";
const PHONE_TEL = "tel:+12248013090";

const serviceLinks = [
  { href: "/ohare-airport-limo", label: "O'Hare Airport" },
  { href: "/midway-airport-limo", label: "Midway Airport" },
  { href: "/airport-limo-downtown-chicago", label: "Downtown Chicago" },
  { href: "/airport-limo-suburbs", label: "Suburbs" },
];

const companyLinks = [
  { href: "/fleet", label: "Our Fleet" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const popularCities = [
  { name: "Naperville", slug: "naperville" },
  { name: "Schaumburg", slug: "schaumburg" },
  { name: "Evanston", slug: "evanston" },
  { name: "Oak Brook", slug: "oak-brook" },
  { name: "Arlington Heights", slug: "arlington-heights" },
  { name: "Highland Park", slug: "highland-park" },
  { name: "Orland Park", slug: "orland-park" },
  { name: "Hinsdale", slug: "hinsdale" },
  { name: "Des Plaines", slug: "des-plaines" },
  { name: "Oak Park", slug: "oak-park" },
  { name: "Aurora", slug: "aurora" },
  { name: "Joliet", slug: "joliet" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">CB</span>
              </div>
              <div>
                <span className="font-semibold text-background text-sm">Chicago Airport</span>
                <span className="block text-xs text-background/70">Black Car Service</span>
              </div>
            </div>
            <p className="text-background/70 text-sm mb-4 leading-relaxed">
              Premium airport transportation serving Chicago O'Hare, Midway, and surrounding suburbs with professional chauffeur service.
            </p>
            <a
              href={PHONE_TEL}
              className="flex items-center gap-2 text-background font-semibold text-lg"
              data-testid="link-footer-phone"
            >
              <Phone className="w-5 h-5" />
              {PHONE_NUMBER}
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Popular Cities
            </h3>
            <ul className="space-y-2">
              {popularCities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/city/${city.slug}`}
                    className="text-background/70 hover:text-background transition-colors text-sm flex items-center gap-2"
                    data-testid={`link-footer-city-${city.slug}`}
                  >
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} Chicago Airport Black Car. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
