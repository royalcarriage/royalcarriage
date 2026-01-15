# PLAN (2026-01-15)

## Mission
Run end-to-end audit, repair, and deployment across repo, Firebase/GCP, and workspace. Operate autonomously and log all actions.

## Phases
1) Safety/logging setup; sync with origin/main; create repo map.
2) MD audit → backlog (20-item roadmap).
3) Gates + UI/security/data audits; fix blockers.
4) Cloud/Firebase verification and dry-run deploy.
5) Cleanup plan and archival.
6) Shadow deploy → smoke → prod (if green).
7) Re-run gates and finalize reports.

## Current Checkpoints
- Branch: merge/consolidation-2026-01-15 (tracks origin/main).
- Working tree: clean (post-reset), stashes retained for earlier work.

## Next Actions
1) Reconfirm repo map after package installs; keep astro packages aligned; refresh `.agent/artifacts/repo-map.md` if structure shifts.
2) Re-run MD audit deltas if new docs land; keep backlog/priorities in sync.
3) Run gates regularly (`npm run check && npm run build` now green); add CI coverage for smoke.
4) Finalize Firebase bits: migrate any env to params, finish rate limiter/deployImages bucket wiring, consider multi-org scoping; dry-run deploy before prod.
5) Expand smoke (auth/API/UI), address UX/SEO backlog (CTA/trust/pricing, schemas/robots automation, GA4/ROI), and prep next deploy.

## Roadmap (to fill after MD audit)
1) Mobile sticky CTA + trust badges + differentiated hero copy.
2) Pricing anchors on Pricing page with “no surge” messaging.
3) Image optimization (WebP/responsive, lazyload, preload).
4) JSON-LD schemas (Org/FAQ/Service/Breadcrumb/Product).
5) XML sitemaps + robots.txt for all sites.
6) Internal linking strategy implementation.
7) GA4 + conversion tracking events (calls/bookings/forms).
8) ROI data pipeline (Moovs + Google Ads import) with schema validation.
9) PR-based content workflow with quality gates for AI content.
10) Firebase rules/auth hardening + functions build fix.
11) Consolidated gates script + CI enforcement + PR templates.
12) Performance tuning (LCP/CLS/caching, reduce unused JS/CSS).
13) Monitoring/observability hooks and alerts.
14) Admin dashboard build-out (reports/drivers/trips) per redesign doc.
15) ROI analytics dashboards in admin.
16) Sitemap/robots generation scripts for Astro microsites/admin.
17) Security hardening: secrets scan, dependency audit, GCP config verification.
18) Smoke/preview deploy automation for Firebase before prod.
19) Content depth upgrades (1k+ words, trust/FAQ) on service/city/blog pages.
20) Cleanup/archival of dead docs/code/assets post-verification.
