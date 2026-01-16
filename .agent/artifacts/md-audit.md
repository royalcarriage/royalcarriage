# MD Audit (2026-01-15)

Sources scanned:

- Root docs: README.md, design_guidelines.md, PLAN/STATUS/CHANGELOG.
- Reports: repo/site/tech SEO audits, ROI/phase summaries, bootstrap self-audit.
- Roadmaps/guides: docs/MASTER_ROADMAP.md, FUTURE_BUILDS_INTEGRATION.md, IMPLEMENTATION_GUIDE.md, ADMIN_DASHBOARD_REDESIGN.md, PERFORMANCE_OPTIMIZATION.md, MONITORING_OBSERVABILITY.md, PRODUCTION_READINESS_CHECKLIST.md, QUICK_START.md, DEPLOYMENT guides/summaries, SECURITY_DEPLOYMENT_COMPLETE.md, GCLOUD_CONFIG_CHECKLIST.md, GOOGLE_CLOUD_SECURITY_AUDIT.md, PRE_DEPLOYMENT_AUDIT.md, CICD_WORKFLOW.md, AI_SYSTEM_GUIDE.md, GCLOUD_AUDIT_README.md, ADMIN_USER_GUIDE.md, DEVELOPER_GUIDE.md.
- Data READMEs: data/moovs, data/google-ads, data/keyword-research.
- Tests/README.md.

Key incomplete features / TODO themes:

- Conversion blockers (MASTER_ROADMAP Phase 1): mobile sticky CTA, hero differentiation, trust signals, sample pricing, image optimization (WebP/responsive, lazyload).
- Technical SEO foundations: JSON-LD schemas (Organization/FAQ/Service/Breadcrumb/Product), XML sitemaps, robots.txt verification, internal linking strategy, rich content depth >1k words.
- Analytics/data: GA4 integration, conversion tracking, ROI data pipeline, Moovs/Ads data import, monitoring/observability hooks.
- Content generation workflow: PR-based publishing, guardrails for AI, city/service/blog page generation with quality gates.
- Performance: image optimization, lazy loading, LCP improvements, caching/preload strategies.
- Security/compliance: Firebase least-privilege rules, auth/RBAC alignment, secrets hygiene, GCP config validation.
- CI/CD: need consolidated gates, preview deploys, smoke tests, PR templates (noted in CICD_WORKFLOW).
- Admin dashboard redesign: multiple admin subpages listed (drivers, trips, reports) with missing implementations; sticky CTA for booking.
- Data pipelines: Moovs and Google Ads README note placeholder/expected schemas; import tasks pending.
- Observability: monitoring/alerting checklist referenced but not wired.
- Deployment docs: emphasize pre-deploy audits and readiness checks; no evidence of automated enforcement.

Broken/uncertain items:

- Multiple deprecated/overlapping deployment/audit summaries; unclear canonical source.
- No sitemap/robots implementation in code; marked critical in roadmap.
- Firebase Functions build issues (from earlier audit) contradict deployment readiness docs.

Obsolete docs to archive:

- None explicitly marked; kept all in place pending confirmation.
