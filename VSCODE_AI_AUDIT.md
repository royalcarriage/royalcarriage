# VS Code / Firebase Studio — AI Audit & Build Guide (YOLO)

## What this repo must guarantee
- admin.royalcarriagelimo.com serves the Admin Dashboard entrypoint
- Firebase deploy is clean (Hosting/Functions/Rules)
- GitHub -> Firebase rollout is consistent

## Where to look first (order)
1) firebase.json
2) .firebaserc (project + targets)
3) package.json scripts (build, deploy, lint, test)
4) apps/* or src/* structure (admin app)
5) apphosting.yaml (if Firebase App Hosting is used)

## Admin domain wiring
- Identify hosting target for admin domain in Firebase console:
  - Hosting -> custom domains
  - confirm which “site” the domain points to
- Ensure firebase.json has that site/target configured:
  - hosting.site or hosting.target
  - hosting.public or hosting.frameworks output
- Ensure the admin entrypoint exists at the deployed root:
  - SPA: index.html + assets
  - Next.js/Astro/etc: correct framework adapter + output dir

## Standard YOLO audit commands
- git status; git pull
- npm ci (or pnpm i / yarn --frozen-lockfile)
- npm run lint || true
- npm run typecheck || true
- npm test || true
- npm run build
- firebase use --add (only if needed)
- firebase deploy --only hosting,functions,firestore:rules,storage

## “If admin is blank”
- Check build output directory matches firebase.json hosting.public
- Ensure rewrite rules exist for SPA:
  - rewrites: [{ "source": "**", "destination": "/index.html" }]
- Ensure assets paths are correct (base href / publicPath)

## Required docs to keep updated
- OPS_DEPLOY_CHECKLIST.md
- GEMINI.md

**Session Summary (YOLO Mode):**

*   **Repository Reset:** Switched to `https://github.com/royalcarriage/royalcarriage.git` and reset local state to match the `main` branch, discarding previous local work (including the new admin Astro app).
*   **Dependencies:** Installed all project dependencies using `pnpm`.
*   **Linting:** Fixed all autofixable linting errors.
*   **Build:** Corrected the `build` script in `package.json` and successfully built the project.
*   **Firebase Configuration:** Refactored `firebase.json` to deploy the admin dashboard from `dist/public` to the default `royalcarriagelimoseo.web.app` hosting site. Simplified `package.json` deploy scripts accordingly.
*   **Deployment:** Successfully deployed the admin dashboard to `https://royalcarriagelimoseo.web.app`.
*   **Security Rules:** Audited and successfully deployed Firestore and Storage security rules, updating `firestore.indexes.json` to prevent deployment issues.
*   **Functions:** Audited Firebase Functions, resolved TypeScript errors, and deployed them successfully. (Note: `functions.config()` deprecation warning is present and requires future migration to environment variables).

**Current Status:**
The admin dashboard is now deployed to `https://royalcarriagelimoseo.web.app`. The previous marketing sites (airport, corporate, wedding, partybus) are no longer deployed by this configuration. The GitHub Actions workflow is set up for automated deployment of this single hosting site.