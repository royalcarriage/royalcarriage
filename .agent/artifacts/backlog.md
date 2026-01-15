# Backlog (Top 20) — 2026-01-15

1) Implement mobile sticky CTA bar across all public layouts; add trust badges and differentiated hero copy.
2) Add sample pricing anchors to Pricing page with clear “no surge” messaging.
3) Image optimization pipeline: convert heavy assets to WebP, generate responsive sizes, add lazy loading/preload.
4) Introduce JSON-LD schemas (Organization, FAQ, Service, Breadcrumb, Product) with SEO component support.
5) Generate XML sitemaps and ensure robots.txt is present and correct for all sites.
6) Establish internal linking strategy (services → cities → fleet/blog) and implement in nav/footers.
7) GA4 + conversion tracking wiring; verify events for calls, bookings, forms.
8) Build ROI data pipeline: import Moovs + Google Ads data per data READMEs; validate schemas.
9) Publish PR-based content workflow with quality gates for AI generation; prevent auto-publish.
10) Harden Firebase rules (Firestore/Storage) and align auth claims/RBAC; fix functions build deps.
11) Add consolidated gates script (lint/typecheck/test/build) and enforce in CI; add PR templates/checklists.
12) Performance tuning: LCP/CLS audits, caching headers, remove unused JS/CSS; add lazy/priority hints.
13) Monitoring/observability: hook up logging/metrics/alerts per MONITORING_OBSERVABILITY checklist.
14) Admin dashboard build-out: complete reports/drivers/trips pages and navigation per redesign doc.
15) Analytics dashboards for ROI: surface imported data (Moovs/Ads) with KPIs in admin.
16) Create sitemap/robots generation scripts for all Astro microsites and admin app hosting.
17) Security hardening: secrets scan, dependency audit, verify GCP project configs vs code references.
18) Smoke/preview deploy flow: automate Firebase preview channels + smoke tests before prod.
19) Content depth upgrade: ensure service/city/blog pages exceed 1k words with trust/FAQ sections.
20) Cleanup/archival: identify dead docs/code/assets; move to `.agent/artifacts/archived-docs` after verification.
