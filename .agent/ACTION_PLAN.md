# VS Code System Audit - ACTION PLAN
**Date:** 2026-01-15
**Current Branch:** `copilot/implement-admin-dashboard`
**Target Branch:** `merge/consolidation-2026-01-15`
**Status:** 🔴 CRITICAL - Branch Divergence Detected

---

## ✅ COMPLETED ACTIONS

1. **Secured Service Account** ✅
   - Added `rc-admin-sa.json` to `.gitignore`
   - Moved file to `~/.secrets/rc-admin-sa.json`
   - Committed security fix: `a8fe0c6bd`

2. **Generated Audit Report** ✅
   - Created `.agent/artifacts/vscode-system-audit.md`
   - Identified branch divergence
   - Documented architecture changes

---

## 🚨 CRITICAL FINDINGS

### Branch State Analysis

| Aspect | Current Branch | Consolidated Branch | Status |
|--------|---------------|---------------------|--------|
| **Architecture** | Single-app monolith | Multi-site workspace | ⚠️ DIVERGED |
| **Firebase Hosting** | Single target (dist/public) | 5 targets (apps/*/dist) | ⚠️ DIVERGED |
| **Build System** | `npm run build` → dist/public | `npm run build:all` → apps/*/dist | ⚠️ DIVERGED |
| **Package Manager** | pnpm (lock modified) | npm (standard) | ⚠️ DIVERGED |
| **Vite Config** | Broken (isDev undefined) | Fixed (mode parameter) | ⚠️ DIVERGED |
| **CHANGELOG** | v1.0.0 deployment notes | Audit cycle history | ⚠️ DIVERGED |

### Risk Assessment

**Deploying from current branch will:**
- ❌ Break multi-site Firebase hosting (wrong paths)
- ❌ Fail to build workspace apps (airport, corporate, wedding, partybus)
- ❌ Miss consolidated branch improvements (rules, functions, SEO automation)
- ❌ Lose audit/monitoring infrastructure

---

## 📋 IMMEDIATE ACTION PLAN

### PHASE 1: Assessment (10 minutes)

**Step 1: Compare Branches**
```bash
git diff --stat copilot/implement-admin-dashboard..merge/consolidation-2026-01-15
git diff copilot/implement-admin-dashboard..merge/consolidation-2026-01-15 -- client/src/pages/admin/
```

**Step 2: Identify Valuable Work on Current Branch**
```bash
git log --oneline copilot/implement-admin-dashboard ^merge/consolidation-2026-01-15
# Last 10 commits are admin dashboard components
```

**Step 3: Check Build Compatibility**
```bash
# On current branch (will fail):
npm run build:all

# Switch to consolidated:
git checkout merge/consolidation-2026-01-15
npm ci
npm run build:all
```

---

### PHASE 2: Branch Reconciliation (30 minutes)

**Option A: Merge Consolidated INTO Current (RECOMMENDED)**

This preserves admin component work while getting infrastructure updates.

```bash
# On current branch
git checkout copilot/implement-admin-dashboard

# Stash unstaged changes
git stash push -m "WIP: admin components before merge"

# Merge consolidated branch
git merge merge/consolidation-2026-01-15

# Resolve conflicts (expect many):
# - CHANGELOG.md (merge both histories)
# - package.json (keep workspace structure, add admin scripts)
# - vite.config.ts (use consolidated version - it's fixed)
# - firebase.json (use consolidated - multi-site)
# - README.md (merge both)

# After resolving conflicts:
git add .
git commit -m "chore: merge consolidated branch with admin components"

# Restore WIP changes
git stash pop
```

**Expected Conflicts:**
- `CHANGELOG.md` - Merge v1.0.0 notes + audit cycle
- `package.json` - Keep workspaces, merge scripts
- `vite.config.ts` - Use consolidated (fixed)
- `firebase.json` - Use consolidated (multi-site)
- `README.md` - Merge admin + workspace docs
- `.firebaserc` - Use consolidated (5 targets)

**Option B: Cherry-Pick Admin Work to Consolidated (SURGICAL)**

This puts admin components on top of stable consolidated branch.

```bash
# Switch to consolidated
git checkout merge/consolidation-2026-01-15
git checkout -b feature/admin-components-integrated

# Cherry-pick last 10 commits from copilot branch
git cherry-pick 7dc6eafff..907572541

# Resolve conflicts in each commit
# Build and test after each pick

# Once done:
npm ci
npm run build:all
npm run check
npm test
```

**Option C: Start Fresh from Consolidated (CLEAN SLATE)**

Only if admin components are duplicated or obsolete.

```bash
git checkout merge/consolidation-2026-01-15
git checkout -b feature/admin-dashboard-clean

# Manually copy any unique components:
cp -r ../backup-admin-components/* apps/admin/src/pages/admin/

# Commit and test
```

---

### PHASE 3: Workspace Verification (20 minutes)

After reconciliation, verify the workspace:

**Step 1: Install Dependencies**
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm ci
```

**Step 2: Build All Apps**
```bash
npm run build:all

# Verify output:
ls -la apps/admin/dist/
ls -la apps/airport/dist/
ls -la apps/corporate/dist/
ls -la apps/wedding/dist/
ls -la apps/partybus/dist/
```

**Step 3: Run Quality Gates**
```bash
npm run check          # TypeScript
npm run lint           # ESLint
npm test               # Unit tests
npm run verify:all     # Links, DB, SEO, admin
```

**Step 4: Test Firebase Deploy (Dry Run)**
```bash
# Build functions
cd functions && npm ci && npx tsc && cd ..

# Deploy to preview
firebase hosting:channel:deploy test-$(date +%s) --only hosting:admin
```

---

### PHASE 4: Deploy Strategy (15 minutes)

**Step 1: Deploy Individual Sites First**
```bash
# Deploy each microsite separately
npm run deploy:airport
npm run deploy:corporate
npm run deploy:wedding
npm run deploy:partybus

# Deploy admin last (most critical)
firebase deploy --only hosting:admin
```

**Step 2: Deploy Functions and Rules**
```bash
# Deploy functions
firebase deploy --only functions

# Deploy Firestore/Storage rules
firebase deploy --only firestore:rules,storage:rules
```

**Step 3: Verify All Sites**
```bash
# Check each deployment
curl -I https://airport-royalcarriage.web.app
curl -I https://corporate-royalcarriage.web.app
curl -I https://wedding-royalcarriage.web.app
curl -I https://partybus-royalcarriage.web.app
curl -I https://royalcarriagelimoseo.web.app
```

---

## 🔧 POST-MERGE CLEANUP

### Update Documentation
- [ ] Merge CHANGELOG histories
- [ ] Update README with workspace structure
- [ ] Document multi-site deployment process
- [ ] Add admin component documentation

### Clean Up Branches
```bash
# After successful merge and deploy
git branch -D backup/main-before-merge-
git push origin --delete copilot/implement-admin-dashboard
```

### Update CI/CD
- [ ] Review `.github/workflows/firebase-deploy-oidc.yml`
- [ ] Ensure workflow builds all apps
- [ ] Test preview channel deployment
- [ ] Enable branch protection on main

---

## 📊 SUCCESS CRITERIA

### Build System
- ✅ `npm run build:all` succeeds
- ✅ All 5 apps produce dist/ directories
- ✅ No TypeScript errors
- ✅ No ESLint errors

### Deployment
- ✅ All 5 Firebase hosting sites deployed
- ✅ Functions deployed successfully
- ✅ Firestore/Storage rules active
- ✅ Admin dashboard accessible

### Quality Gates
- ✅ `npm run verify:all` passes
- ✅ `npm run audit:all` passes
- ✅ Link validation passes
- ✅ SEO validation passes

---

## 🚀 RECOMMENDED PATH FORWARD

**Use Option A: Merge Consolidated INTO Current**

**Rationale:**
1. Preserves all admin component work (10 commits)
2. Gets infrastructure updates from consolidated
3. Allows conflict resolution with full context
4. Maintains git history linearly

**Timeline:**
- Phase 1 (Assessment): 10 min
- Phase 2 (Merge): 30 min
- Phase 3 (Verification): 20 min
- Phase 4 (Deploy): 15 min
- **Total: ~75 minutes**

**Next Command:**
```bash
git checkout copilot/implement-admin-dashboard
git stash push -m "WIP: admin components"
git merge merge/consolidation-2026-01-15
```

---

## 🆘 ROLLBACK PLAN

If merge fails catastrophically:

```bash
# Abort merge
git merge --abort

# Return to safe state
git reset --hard HEAD

# Restore WIP
git stash pop

# Use Option B (cherry-pick) instead
```

---

**AUDIT COMPLETE - AWAITING USER DECISION**
