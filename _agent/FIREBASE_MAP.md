# Firebase & GCP Integration Map

Current wiring for the Firebase + GCP footprint in the `royalcarriagelimoseo` project.

## Project Overview

- **Firebase project/alias:** `royalcarriagelimoseo` (default in `.firebaserc`)
- **Package manager:** pnpm `10.28.0`; root scripts wire `build` → admin + functions; `deploy:admin` uses hosting target `admin`
- **Node:** local `v24.12.0`; Functions runtime `nodejs20` (CLI warns but build succeeds)
- **Custom domain:** `admin.royalcarriagelimo.com` CNAMEs to `royalcarriagelimoseo.web.app` (verified via DNS)

## Hosting Targets → Sites

| Target     | Firebase Site ID                | Public dir            | Notes                                   |
|------------|---------------------------------|-----------------------|-----------------------------------------|
| `admin`    | `royalcarriagelimoseo`          | `apps/admin/dist`     | Astro static build (fresh)              |
| `airport`  | `chicagoairportblackcar`        | `apps/airport/dist`   | Static output checked in                |
| `corporate`| `chicagoexecutivecarservice`    | `apps/corporate/dist` | Static output checked in                |
| `wedding`  | `chicagoweddingtransportation`  | `apps/wedding/dist`   | Static output checked in                |
| `partybus` | `chicago-partybus`              | `apps/partybus/dist`  | Static output checked in                |

All hosting targets use SPA rewrites (`**` → `/index.html`).

## Firebase Config Highlights (`firebase.json`)

- **functions:** `source: functions`, `runtime: nodejs20`, `predeploy: cd functions && pnpm run build`
- **firestore:** `rules: firestore.rules`, `indexes: firestore.indexes.json`
- **storage:** `rules: storage.rules`
- **emulators:** functions 5001, firestore 8080, hosting 5000, storage 9199, UI 4000

## Functions

- Build with `pnpm --filter royalcarriage-functions build` (tsc + postbuild copy). TS `skipLibCheck` enabled to quiet dependency type noise.
- Image generation now uses `functions/src/image-generator.ts` (Vertex AI + Cloud Storage with placeholder fallback); no dependency on `server/ai`.
- Deploy via `firebase deploy --only functions` (predeploy already runs `pnpm run build`).

## Status

- Admin hosting redeployed from `apps/admin/dist` to site `royalcarriagelimoseo` (served at both `admin.royalcarriagelimo.com` and `.web.app`).
- Marketing sites are mapped to unique site IDs; builds are present only as checked-in `dist` outputs—regenerate sources before replacing them.
