import { Star } from "lucide-react";

export function TrustSignalsInline() {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-white/90 mt-4">
      <span className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="ml-1 font-semibold">4.8/5</span>
        <span className="text-white/70">(200+ reviews)</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span>🚗</span>
        <span className="font-semibold">15+ vehicles</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span>✓</span>
        <span className="font-semibold">Licensed & insured</span>
      </span>
    </div>
  );
}
