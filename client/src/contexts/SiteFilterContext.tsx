import { createContext, useContext, useState, ReactNode } from "react";

export const SITES = [
  { value: "all", label: "All Sites" },
  { value: "airport", label: "Chicago Airport Black Car" },
  { value: "partybus", label: "Chicago Party Bus" },
  { value: "corporate", label: "Chicago Executive Car" },
  { value: "wedding", label: "Chicago Wedding Transportation" },
] as const;

export type SiteSlug = (typeof SITES)[number]["value"];

interface SiteFilterContextType {
  selectedSite: SiteSlug;
  setSelectedSite: (site: SiteSlug) => void;
}

const SiteFilterContext = createContext<SiteFilterContextType | undefined>(
  undefined,
);

export function SiteFilterProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSite] = useState<SiteSlug>("all");

  return (
    <SiteFilterContext.Provider value={{ selectedSite, setSelectedSite }}>
      {children}
    </SiteFilterContext.Provider>
  );
}

export function useSiteFilter() {
  const context = useContext(SiteFilterContext);
  if (!context) {
    throw new Error("useSiteFilter must be used within a SiteFilterProvider");
  }
  return context;
}
