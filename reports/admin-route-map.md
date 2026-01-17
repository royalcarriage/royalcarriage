# Admin Route Map & Permissions

| Route                   | Purpose                                                 | Permission                                    |
| ----------------------- | ------------------------------------------------------- | --------------------------------------------- |
| `/`                     | Overview (KPIs, freshness, alerts, quick actions)       | viewer+                                       |
| `/imports/moovs`        | Moovs CSV import + history                              | editor+                                       |
| `/imports/ads`          | Ads CSV import + history                                | editor+                                       |
| `/roi`                  | ROI / analytics snapshot                                | viewer+                                       |
| `/websites/site-health` | Per-site health (sitemap/robots/canonical/tracking/CTA) | viewer+                                       |
| `/websites/money-pages` | Money pages (placeholder content grid)                  | viewer+                                       |
| `/websites/fleet`       | Fleet view (placeholder)                                | viewer+                                       |
| `/websites/cities`      | Cities view (placeholder)                               | viewer+                                       |
| `/websites/blog`        | Blog view (placeholder)                                 | viewer+                                       |
| `/seo/queue`            | SEO queue (propose)                                     | editor+                                       |
| `/seo/drafts`           | Drafts list                                             | editor+                                       |
| `/seo/gate-reports`     | Gate reports viewer                                     | admin+                                        |
| `/seo/publish`          | Publish checklist                                       | admin+                                        |
| `/images/library`       | Image library upload/tag                                | editor+                                       |
| `/images/missing`       | Missing images report                                   | viewer+                                       |
| `/deploy-logs`          | Deploy per target + log viewer                          | admin+                                        |
| `/users`                | User list & role edits                                  | superadmin only (role edit), others read-only |
| `/settings`             | Global settings (phone/booking/GA4/publish limits)      | admin+                                        |
| `/self-audit`           | Runs self-audit checklist and writes report             | viewer+                                       |

Notes:

- All routes require Firebase Auth (Google). SuperAdmin seeded for `info@royalcarriagelimo.com`.
- All writes include `org` for multi-tenant expansion. Actions use Firestore if configured; otherwise fall back to mock store.
