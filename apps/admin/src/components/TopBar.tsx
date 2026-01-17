import { useMemo } from "react";
import { PillButton } from "./ui/PillButton";
import { DataFreshnessChip } from "./ui/DataFreshnessChip";
import type { FreshnessStatus, Role, SiteKey } from "../types";
import { canPerformAction } from "../lib/permissions";
import { Lock } from "lucide-react";

interface TopBarProps {
  site: SiteKey;
  onSiteChange: (site: SiteKey) => void;
  statuses: FreshnessStatus[];
  onImportMoovs: () => void;
  onImportAds: () => void;
  onRunGate: () => void;
  onDeploy: () => void;
  role?: Role;
}

export function TopBar({
  site,
  onSiteChange,
  statuses,
  onImportAds,
  onImportMoovs,
  onRunGate,
  onDeploy,
  role = "viewer",
}: TopBarProps) {
  const canImport = canPerformAction(role, "importMoovs");
  const canRunGate = canPerformAction(role, "runGate");
  const canDeploy = canPerformAction(role, "deploy");
  const siteOptions = useMemo(
    () => [
      { value: "all", label: "All Sites" },
      { value: "airport", label: "Airport" },
      { value: "partybus", label: "Partybus" },
      { value: "corporate", label: "Corporate" },
      { value: "wedding", label: "Wedding" },
    ],
    [],
  );

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Site
          <select
            className="mt-1 w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
            value={site}
            onChange={(e) => onSiteChange(e.target.value as SiteKey)}
          >
            {siteOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <DataFreshnessChip key={s.label} {...s} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PillButton variant="secondary" onClick={onImportMoovs}>
          Import Moovs
        </PillButton>
        <PillButton variant="secondary" onClick={onImportAds}>
          Import Ads
        </PillButton>
        <PillButton variant="primary" onClick={onRunGate}>
          Run Gate
        </PillButton>
        <PillButton variant="danger" onClick={onDeploy}>
          Deploy
        </PillButton>
      </div>
    </header>
  );
}
