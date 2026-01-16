#!/usr/bin/env node
/**
 * Build all workspace apps (admin + 4 microsites)
 */
import { execSync } from "child_process";

const apps = [
  { name: "admin", workspace: false, dir: "apps/admin" },
  { name: "airport", workspace: true, pkg: "@royal/airport" },
  { name: "corporate", workspace: true, pkg: "@royal/corporate" },
  { name: "wedding", workspace: true, pkg: "@royal/wedding" },
  { name: "partybus", workspace: true, pkg: "@royal/partybus" },
];

console.log("🔨 Building all apps...\n");

let failed = 0;

for (const app of apps) {
  console.log(`📦 Building ${app.name}...`);
  try {
    if (app.workspace) {
      execSync(`npm -w ${app.pkg} run build`, { stdio: "inherit" });
    } else {
      execSync(`npm --prefix ${app.dir} run build`, { stdio: "inherit" });
    }
    console.log(`✅ ${app.name} built successfully\n`);
  } catch (error) {
    console.error(`❌ ${app.name} build failed\n`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n❌ ${failed} app(s) failed to build`);
  process.exit(1);
}

console.log("\n✅ All apps built successfully!");
