# VS Code ACTUAL System State Audit - 2026-01-15

## Current Reality

**Branch:** `copilot/implement-admin-dashboard`
**Status:** ⚠️ **PARTIALLY CONSOLIDATED** - Config files updated, implementation scripts missing

---

## What Actually Exists

### ✅ Configuration Files (Updated)

These files show workspace/multi-site configuration:

1. **package.json** - Shows workspaces config, 90+ scripts
2. **firebase.json** - Shows 5 hosting targets (admin, airport, partybus, corporate, wedding)
3. **.firebaserc** - Shows 5 Firebase sites mapped
4. **vite.config.ts** - Fixed isDev definition
5. **CHANGELOG.md** - Shows audit cycle history
6. **README.md** - Shows workspace documentation
7. **.gitignore** - Updated with rc-admin-sa.json

### ❌ Implementation Files (Missing)

These scripts are referenced but DON'T exist:

1. **scripts/build-all.mjs** - Referenced by `npm run build:all` - MISSING
2. **scripts/verify-seo.mjs** - Referenced by `npm run verify:seo` - MISSING
3. **scripts/verify-links.mjs** - Referenced by `npm run verify:links` - MISSING
4. **scripts/verify-admin-links.mjs** - Referenced by `npm run verify:admin` - MISSING
5. **scripts/verify-db.mjs** - Referenced by `npm run verify:db` - MISSING
6. **scripts/audit-workspace.mjs** - Referenced by `npm run audit:workspace` - MISSING
7. **scripts/audit-firebase-mfa.mjs** - Referenced by `npm run audit:firebase:mfa` - MISSING
8. **scripts/audit-system.mjs** - Referenced by `npm run audit:system` - MISSING
9. **scripts/audit-scheduler.mjs** - Referenced by `npm run audit:schedule` - MISSING
10. **scripts/health-monitor.mjs** - Referenced by `npm run health:monitor` - MISSING

### ✅ Workspace Structure (Exists)

Directory structure is present:

```
apps/
├── admin/       ✅ EXISTS
├── airport/     ✅ EXISTS
├── corporate/   ✅ EXISTS
├── partybus/    ✅ EXISTS
└── wedding/     ✅ EXISTS

packages/
├── astro-components/  ✅ EXISTS
├── astro-utils/       ✅ EXISTS
├── content/           ✅ EXISTS
├── integrations/      ✅ EXISTS
└── types/             ✅ EXISTS
```

### ⚠️ Scripts That DO Exist

Working SEO automation scripts:

- scripts/seo-propose.mjs ✅
- scripts/seo-draft.mjs ✅
- scripts/seo-gate.mjs ✅
- scripts/seo-publish.mjs ✅
- scripts/seo-run.mjs ✅
- scripts/generate-sitemap.mjs ✅
- scripts/generate-weekly-report.mjs ✅
- scripts/backup-firestore.mjs ✅
- scripts/metrics-import.mjs ✅
- scripts/generate-fleet-pages.mjs ✅

---

## Build System Status

### What SHOULD Work (per package.json)

```bash
npm run build:all          # Calls build-all.mjs (MISSING)
npm run build:airport      # Calls npm -w @royal/airport run build
npm run build:corporate    # Calls npm -w @royal/corporate run build
npm run build:wedding      # Calls npm -w @royal/wedding run build
npm run build:partybus     # Calls npm -w @royal/partybus run build
```

### What ACTUALLY Works

```bash
npm run dev                # Works (calls dev:admin)
npm run dev:admin          # Works (npm --prefix apps/admin run dev)
npm run build:api          # Works (tsx script/build.ts)
# Individual workspace builds - UNKNOWN (need to test)
```

---

## Issue Analysis

### The Consolidation Was INCOMPLETE

**What Happened:**

1. Someone merged config files from `merge/consolidation-2026-01-15` into this branch
2. package.json, firebase.json, .firebaserc, vite.config.ts were updated
3. But the actual implementation scripts (build-all.mjs, verify-_.mjs, audit-_.mjs) were NOT added
4. This created a **configuration-implementation gap**

**Result:**

- Config says "multi-site workspace with 90+ scripts"
- Reality: "Multi-site workspace with 10 working scripts, 40+ broken script references"

---

## Critical Missing Scripts

### Priority 1: Build System

**build-all.mjs** - Orchestrator for building all 5 apps

Expected functionality:

```javascript
// Should build:
// 1. apps/admin (React/Vite → dist/public)
// 2. apps/airport (Astro → dist)
// 3. apps/corporate (Astro → dist)
// 4. apps/wedding (Astro → dist)
// 5. apps/partybus (Astro → dist)
```

### Priority 2: Verification System

- **verify-seo.mjs** - SEO validation
- **verify-links.mjs** - Link checking
- **verify-admin-links.mjs** - Admin dashboard link checking
- **verify-db.mjs** - Database schema validation

### Priority 3: Audit System

- **audit-workspace.mjs** - Workspace health check
- **audit-firebase-mfa.mjs** - Firebase MFA audit
- **audit-system.mjs** - System-wide audit
- **audit-scheduler.mjs** - Schedule validation

### Priority 4: Health Monitoring

- **health-monitor.mjs** - System health checks

---

## Workspace Apps Configuration

### apps/admin/package.json

Need to verify if it has:

```json
{
  "name": "@royal/admin",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### apps/\*/package.json (Astro sites)

Need to verify if they have:

```json
{
  "name": "@royal/airport", // or corporate, wedding, partybus
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  }
}
```

---

## Deployment Readiness Assessment

### ❌ NOT READY FOR DEPLOYMENT

**Blocking Issues:**

1. **Can't build all apps** - build-all.mjs missing
2. **Can't verify builds** - verify-\*.mjs missing
3. **Can't run quality gates** - audit-\*.mjs missing
4. **Unknown workspace package.json state** - haven't checked apps/\*/package.json

**Current Deployment Would:**

- ❌ Fail npm run build (calls build:all which calls missing build-all.mjs)
- ❌ Deploy only admin (dist/public exists from old builds)
- ❌ Leave 4 microsite targets empty (apps/\*/dist don't exist)

---

## Recommended Actions

### IMMEDIATE (Next 30 minutes)

**Option A: Create Missing Scripts**
Write the 10+ missing scripts to match package.json configuration.

**Option B: Simplify package.json**
Remove references to missing scripts, use manual build commands.

**Option C: Get Scripts from Consolidated Branch**

```bash
git show merge/consolidation-2026-01-15:scripts/build-all.mjs > scripts/build-all.mjs
git show merge/consolidation-2026-01-15:scripts/verify-seo.mjs > scripts/verify-seo.mjs
# ... repeat for all missing scripts
```

### VERIFICATION (Next 30 minutes)

1. **Check workspace package.json files:**

```bash
cat apps/admin/package.json
cat apps/airport/package.json
cat apps/corporate/package.json
cat apps/wedding/package.json
cat apps/partybus/package.json
```

2. **Test individual builds:**

```bash
npm -w @royal/admin run build
npm -w @royal/airport run build
npm -w @royal/corporate run build
npm -w @royal/wedding run build
npm -w @royal/partybus run build
```

3. **Verify dist directories:**

```bash
ls -la dist/public/          # Admin build output
ls -la apps/airport/dist/    # Airport build output
ls -la apps/corporate/dist/  # Corporate build output
ls -la apps/wedding/dist/    # Wedding build output
ls -la apps/partybus/dist/   # Partybus build output
```

---

## Quick Fix: Temporary build-all.mjs

```javascript
#!/usr/bin/env node
import { execSync } from "child_process";

const apps = ["admin", "airport", "corporate", "wedding", "partybus"];

console.log("Building all apps...\n");

for (const app of apps) {
  console.log(`Building @royal/${app}...`);
  try {
    if (app === "admin") {
      execSync("npm --prefix apps/admin run build", { stdio: "inherit" });
    } else {
      execSync(`npm -w @royal/${app} run build`, { stdio: "inherit" });
    }
    console.log(`✓ ${app} built successfully\n`);
  } catch (error) {
    console.error(`✗ ${app} build failed\n`);
    process.exit(1);
  }
}

console.log("✓ All apps built successfully");
```

---

## Summary

**Current State:**

- ✅ Workspace structure exists
- ✅ Config files updated
- ✅ 10 SEO scripts working
- ❌ 40+ referenced scripts missing
- ❌ Can't build all apps
- ❌ Can't deploy multi-site
- ⚠️ Unknown workspace package.json states

**Next Step:**
Get missing scripts from `merge/consolidation-2026-01-15` branch OR create them from scratch.

**Timeline to Deployment:**

- Get scripts: 30 min
- Verify builds: 30 min
- Test deploy: 15 min
- **Total: 75 minutes**
