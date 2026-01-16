import { Phone, Calendar } from "lucide-react";

const PHONE_TEL = "tel:+12248013090";
const BOOKING_URL =
  "https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites";

export function MobileCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border">
      <div className="flex">
        <a
          href={PHONE_TEL}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-foreground text-background font-semibold text-sm transition-colors"
          data-testid="button-mobile-call"
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-background text-foreground font-semibold text-sm border-l border-border transition-colors"
          data-testid="button-mobile-book"
        >
          <Calendar className="w-5 h-5" />
          Book Now
        </a>
      </div>
    </div>
  );
}
