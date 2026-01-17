#!/usr/bin/env node
import fs from "fs";
import path from "path";

const results = [];

function pass(name, detail) {
  results.push({ name, status: "PASS", detail });
}
function fail(name, detail) {
  results.push({ name, status: "FAIL", detail });
}

const root = process.cwd();

// Check build output
const adminOut = path.join(root, "apps", "admin", "out", "index.html");
if (fs.existsSync(adminOut)) {
  pass("Admin build", "apps/admin/out exists");
} else {
  fail(
    "Admin build",
    "apps/admin/out missing, run npm run build in apps/admin",
  );
}

// Check firebase.json mapping
try {
  const firebase = JSON.parse(
    fs.readFileSync(path.join(root, "firebase.json"), "utf8"),
  );
  const adminHosting = firebase.hosting?.find((h) => h.target === "admin");
  if (adminHosting?.public === "apps/admin/out") {
    pass(
      "Hosting output alignment",
      "firebase.json points admin to apps/admin/out",
    );
  } else {
    fail(
      "Hosting output alignment",
      "firebase.json admin public does not match apps/admin/out",
    );
  }
} catch {
  fail("Hosting output alignment", "Could not parse firebase.json");
}

// Check route files exist
const requiredPages = [
  "index.tsx",
  "deploy-logs.tsx",
  "images/library.tsx",
  "images/missing.tsx",
  "imports/ads.tsx",
  "imports/moovs.tsx",
  "roi/index.tsx",
  "self-audit.tsx",
  "seo/queue.tsx",
  "seo/drafts.tsx",
  "seo/gate-reports.tsx",
  "seo/publish.tsx",
  "settings.tsx",
  "users.tsx",
  "websites/site-health.tsx",
  "websites/money-pages.tsx",
  "websites/fleet.tsx",
  "websites/cities.tsx",
  "websites/blog.tsx",
];

const missingPages = requiredPages.filter(
  (p) => !fs.existsSync(path.join(root, "apps", "admin", "src", "pages", p)),
);

if (missingPages.length === 0) {
  pass("Route coverage", "All admin routes registered");
} else {
  fail("Route coverage", `Missing: ${missingPages.join(", ")}`);
}

const reportLines = [
  "# Admin Self Audit",
  "",
  "| Check | Status | Detail |",
  "| --- | --- | --- |",
  ...results.map((r) => `| ${r.name} | ${r.status} | ${r.detail} |`),
  "",
  `Generated: ${new Date().toISOString()}`,
];

const outPath = path.join(root, "reports", "admin-self-audit.md");
fs.writeFileSync(outPath, reportLines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
