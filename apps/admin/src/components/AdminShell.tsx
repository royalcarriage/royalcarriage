import { useMemo, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { SidebarAccordion } from "./ui/SidebarAccordion";
import type { FreshnessStatus, Role, SiteKey, UserProfile } from "../types";
import { PillButton } from "./ui/PillButton";
import { filterNavByRole } from "../lib/permissions";
import { RoleBadge } from "./AccessControl";

interface AdminShellProps {
  activePage: string;
  site: SiteKey;
  onSiteChange: (site: SiteKey) => void;
  statuses: FreshnessStatus[];
  children: ReactNode;
  onImportMoovs: () => void;
  onImportAds: () => void;
  onRunGate: () => void;
  onDeploy: () => void;
  user?: UserProfile;
  role: Role;
  onSignOut: () => void;
}

export function AdminShell({
  activePage,
  site,
  onSiteChange,
  statuses,
  children,
  onImportAds,
  onImportMoovs,
  onRunGate,
  onDeploy,
  user,
  role,
  onSignOut,
}: AdminShellProps) {
  const navItems = [
    { id: "overview", label: "Overview", href: "/" },
    {
      id: "ai-systems",
      label: "AI Systems",
      children: [
        { id: "ai-command-center", label: "Command Center", href: "/ai/command-center" },
        { id: "ai-chat", label: "AI Chat", href: "/ai/chat" },
        { id: "ai-analytics", label: "AI Analytics", href: "/ai/analytics" },
        { id: "content-pipeline", label: "Content Pipeline", href: "/content-pipeline" },
      ],
    },
    {
      id: "imports",
      label: "Imports",
      children: [
        { id: "imports-moovs", label: "Moovs Import", href: "/imports/moovs" },
        { id: "imports-ads", label: "Ads Import", href: "/imports/ads" },
        { id: "data-import", label: "Data Dashboard", href: "/data-import" },
      ],
    },
    { id: "roi", label: "ROI / Analytics", href: "/roi" },
    {
      id: "websites",
      label: "Websites",
      children: [
        { id: "site-health", label: "Site Health", href: "/websites/site-health" },
        { id: "money-pages", label: "Money Pages", href: "/websites/money-pages" },
        { id: "fleet", label: "Fleet", href: "/websites/fleet" },
        { id: "cities", label: "Cities", href: "/websites/cities" },
        { id: "blog", label: "Blog", href: "/websites/blog" },
      ],
    },
    {
      id: "seo",
      label: "SEO Bot",
      children: [
        { id: "seo-queue", label: "Queue", href: "/seo/queue" },
        { id: "seo-drafts", label: "Drafts", href: "/seo/drafts" },
        { id: "seo-gate-reports", label: "Gate Reports", href: "/seo/gate-reports" },
        { id: "seo-publish", label: "Publish", href: "/seo/publish" },
      ],
    },
    {
      id: "images",
      label: "Images",
      children: [
        { id: "images-library", label: "Library", href: "/images/library" },
        { id: "images-missing", label: "Missing", href: "/images/missing" },
      ],
    },
    {
      id: "enterprise",
      label: "Enterprise",
      children: [
        { id: "locations", label: "Locations (173)", href: "/locations" },
        { id: "services", label: "Services (91)", href: "/services" },
        { id: "fleet", label: "Fleet Vehicles", href: "/fleet-management" },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      children: [
        { id: "content-approval", label: "Content Approval", href: "/content-approval" },
        { id: "feedback", label: "Feedback Alerts", href: "/feedback-alerts" },
      ],
    },
    { id: "deploy", label: "Deploy & Logs", href: "/deploy-logs" },
    { id: "users", label: "Users & Roles", href: "/users" },
    { id: "settings", label: "Settings", href: "/settings" },
    { id: "self-audit", label: "Self Audit", href: "/self-audit" },
  ];

  // Filter navigation based on user role
  const filteredNavItems = useMemo(() => filterNavByRole(navItems, role), [role]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <aside className="lg:w-64">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500">Royal Carriage</div>
              <div className="text-lg font-semibold">Command Center</div>
            </div>
            <RoleBadge role={role} />
          </div>
          <SidebarAccordion items={filteredNavItems} activeId={activePage} />
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-3 text-xs text-indigo-900">
            {user?.email ? (
              <>
                <div className="font-semibold">{user.displayName || user.email}</div>
                <div className="opacity-80">{user.email}</div>
              </>
            ) : (
              <div className="font-semibold">Not signed in</div>
            )}
          </div>
          <div className="mt-2">
            <PillButton variant="ghost" className="w-full justify-center" onClick={onSignOut}>
              Sign out
            </PillButton>
          </div>
        </aside>
        <main className="flex-1 space-y-4">
          <TopBar
            site={site}
            onSiteChange={onSiteChange}
            statuses={statuses}
            onImportAds={onImportAds}
            onImportMoovs={onImportMoovs}
            onRunGate={onRunGate}
            onDeploy={onDeploy}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
