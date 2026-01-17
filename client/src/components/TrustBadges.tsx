import { Shield, Clock, Users, Car, CalendarCheck } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "Licensed",
    description: "Insured & compliant",
  },
  {
    icon: Clock,
    label: "24/7",
    description: "Dispatch support",
  },
  {
    icon: Users,
    label: "Pros",
    description: "Chauffeur-driven",
  },
  {
    icon: Car,
    label: "Clean",
    description: "Late-model fleet",
  },
  {
    icon: CalendarCheck,
    label: "Planned",
    description: "Reservation-first",
  },
];

export function TrustBadges() {
  return (
    <div
      className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12 mt-8 pt-8 border-t border-white/20"
      data-testid="trust-badges"
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-3 text-white"
          data-testid={`trust-badge-${badge.label.toLowerCase()}`}
        >
          <badge.icon className="w-5 h-5 text-white/80" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">{badge.label}</span>
            <span className="text-xs text-white/70">{badge.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
