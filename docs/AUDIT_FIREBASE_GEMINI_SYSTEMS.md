# Audit: Firebase & Gemini (Vertex AI) Systems

Date: 2026-01-16
Scope: repo-wide audit focusing on Firebase hosting/targets, Functions using Vertex AI (Gemini), local dev, CI/workflows, and agent integration.

Summary findings

- Hosting targets configured in `/.firebaserc` and `firebase.json`:
  - `admin` → `royalcarriagelimoseo` (apps/admin/out)
  - `airport` → `chicagoairportblackcar` (apps/airport/dist)
  - `corporate` → `chicagoexecutivecarservice` (apps/corporate/dist)
  - `wedding` → `chicagoweddingtransportation` (apps/wedding/dist)
  - `partybus` → `chicago-partybus` (apps/partybus/dist)

- AI (Gemini/Vertex) usage:
  - Primary implementations in `functions/src/api/ai/content-generator.ts` and `functions/src/api/ai/image-generator.ts`.
  - Code expects `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_APPLICATION_CREDENTIALS` env vars.
  - `image-generator.ts` currently throws an error for Imagen (intentional placeholder) and must be implemented or stubbed for local dev.

- Local env and dev helpers:
  - Added `.env.local.example` and `scripts/start-local-emulators.sh`.
  - Added `docs/FIREBASE_LOCAL_SETUP.md` with run/test instructions.

- Admin dashboard connections:
  - Client code expects `NEXT_PUBLIC_FIREBASE_*` env vars; `apps/admin/.env` exists with values.
  - `apps/admin/src/react/AdminApp.tsx` falls back to mock data store if Firebase config is missing.

- CI / workflows and agents:
  - Repo contains many docs and agent playbooks (`AGENTS.md`, `.codex/*`) and deployment reports describing Gemini integration (`DEPLOYMENT_VERIFICATION_REPORT.md`, `GEMINI_QUICK_START.md`, etc.).
  - `.github/workflows` directory should be reviewed to ensure CI runs `pnpm run gates` and exposes necessary job environment (secrets) and checks for Firebase/emulator steps.

Risks & caveats

- Vertex AI (Gemini) cannot be fully emulated locally — valid GCP credentials are required for real model calls.
- Do not check service account keys into source control. Use `GOOGLE_APPLICATION_CREDENTIALS` in CI via secrets.
- Image generation via Imagen is not implemented; attempting to call it will throw an error.

Recommended next actions (prioritized)

1. Stub or implement `image-generator` to return safe placeholders during local development (low-risk).
2. Add a `pnpm` script to start emulators from repo root and include it in README and CI (medium).
3. Review `.github/workflows` and update workflows to run `pnpm run gates`, run tests, and ensure CI injects `GOOGLE_APPLICATION_CREDENTIALS` via secrets when needed (high).
4. Integrate Gemini function tests into local CI gating and add smoke tests for admin dashboard integration (high).
5. Add checks in admin dashboard to surface function availability and AI quota/health (optional).

Files of interest (non-exhaustive)

- `/.firebaserc`, `firebase.json`
- `functions/src/api/ai/content-generator.ts`
- `functions/src/api/ai/image-generator.ts`
- `functions/src/api/ai/routes.ts` and compiled `functions/lib/*`
- `functions/package.json` (contains `@google-cloud/vertexai`)
- `docs/GEMINI_QUICK_START.md`, `GEMINI_INTEGRATION.md`, `GEMINI_IMPLEMENTATION_SUMMARY.md`
- `docs/DEPLOYMENT_GUIDE.md`, `docs/AI_SYSTEM_GUIDE.md`
- `apps/admin/.env`, `apps/admin/src/react/AdminApp.tsx`
- `.github/workflows/*` (CI workflows)
- `docs/FIREBASE_LOCAL_SETUP.md` (new)

Quick verification checklist

- [ ] `GOOGLE_APPLICATION_CREDENTIALS` set locally (do not commit)
- [ ] Run `./scripts/start-local-emulators.sh .env.local` and confirm functions emulator starts
- [ ] Use `curl` or Firebase Shell to call content-generation endpoints and confirm fallback or Vertex result
- [ ] Implement placeholder behavior in `image-generator` to avoid thrown errors during local testing
- [ ] Update `.github/workflows` to run `pnpm run gates` and report status

Prepared next step: implement the `image-generator` stub and add a `pnpm` script to launch local emulators; optionally open a PR with these changes.
