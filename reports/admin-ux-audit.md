# Admin UX Audit (Command Center Upgrade)

## What changed
- Rebuilt admin UI in Next.js with compact Command Center shell (accordion sidebar, pill buttons, top bar with site selector/status badges/quick actions).
- Added role-aware auth guard (Google sign-in via Firebase Auth; SuperAdmin bootstrap for info@royalcarriagelimo.com; viewer/editor/admin/superadmin gating in UI).
- Implemented data-backed flows for all nav items: imports (Moovs/Ads), ROI, websites health, SEO bot (queue/drafts/gates), images, deploy/logs, users/roles, settings, self-audit.
- Created shared UI kit: AdminShell, TopBar, SidebarAccordion, KpiCard, DataFreshnessChip, PillButton, Table, Modal, Toast.
- Wired Firestore-friendly data model helpers (org-scoped writes to users, sites, moovs_imports, ads_imports, metrics_rollups, seo_topics, seo_drafts, seo_runs, images, deploys).

## Coverage vs requirements
- Layout: compact, responsive, accordion sidebar (single-open), pill button hierarchy, top bar actions + status chips.
- Buttons/actions: all actions log to datastore (imports, gate runs, deploy logs, SEO queue/drafts/gates, settings save, image upload metadata, deploy logs).
- Pages implemented per nav order: Overview; Imports (Moovs/Ads); ROI; Websites (Site Health + placeholders for Money Pages/Fleet/Cities/Blog); SEO Bot (Queue/Drafts/Gate Reports/Publish); Images (Library/Missing); Deploy & Logs; Users & Roles; Settings; Self Audit.
- Security: Auth required for all pages (Google); role guard for role editing and admin actions; org field stamped on writes.
- Performance: Static export build (`apps/admin/out`), minimal bundles per page; Next 14 static output.

## Outstanding items
- Firebase client config must be provided via NEXT_PUBLIC_FIREBASE_* env vars to use live Auth/Firestore; otherwise mock datastore is used.
- Role enforcement is client-side; server rules must mirror roles in Firestore security rules.
- Settings/Imports/Deploy actions write to Firestore (or mock) but do not trigger backend jobs; add cloud functions for real imports/deploy.
