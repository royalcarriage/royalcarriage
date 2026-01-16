# Firebase Local Setup (Gemini / Vertex AI integration)

This doc explains how the repo uses Firebase hosting targets and Vertex AI (Gemini) and how to run a local development environment.

## Hosting targets
Configured in `/.firebaserc` and `firebase.json` (targets map):

- `admin` → site id: `royalcarriagelimoseo`  (public: `apps/admin/out`)
- `airport` → site id: `chicagoairportblackcar` (public: `apps/airport/dist`)
- `corporate` → site id: `chicagoexecutivecarservice` (public: `apps/corporate/dist`)
- `wedding` → site id: `chicagoweddingtransportation` (public: `apps/wedding/dist`)
- `partybus` → site id: `chicago-partybus` (public: `apps/partybus/dist`)

These targets are declared in `/.firebaserc` and referenced by `firebase.json` entries with `target` fields.

## Environment variables
AI and Vertex integration expects the following env vars (see `.env.local.example`):

- `GOOGLE_CLOUD_PROJECT` — your GCP project id (e.g. `royalcarriagelimoseo`)
- `GOOGLE_CLOUD_LOCATION` — region for Vertex AI (`us-central1` by default)
- `GOOGLE_APPLICATION_CREDENTIALS` — absolute path to service account JSON key

Also useful for local client runs:
- `NEXT_PUBLIC_FIREBASE_*` variables (API key, authDomain, projectId, storageBucket, appId)

## Service account & IAM
Create a service account in GCP and grant the minimal roles for testing Vertex AI (for quick testing `Vertex AI User` and `Service Account User` are sufficient). Download the JSON key and set `GOOGLE_APPLICATION_CREDENTIALS` to its path.

## Start emulators locally
1. Copy the template and fill values:

```bash
cp .env.local.example .env.local
# Edit .env.local and set GOOGLE_APPLICATION_CREDENTIALS absolute path
```

2. Use the helper script (it loads `.env.local` and starts emulators):

```bash
chmod +x scripts/start-local-emulators.sh
./scripts/start-local-emulators.sh .env.local
```

This runs `firebase emulators:start --only functions,hosting`. The functions emulator serves functions at a local endpoint (default ports from `firebase.json` are used).

## Test AI endpoints
The functions code calls Vertex AI directly (not emulated). To test AI endpoints locally you must have valid GCP credentials and network access to Vertex AI.

Example curl to a deployed local function (replace FUNCTION_NAME and project path):

```bash
curl -X POST \
  http://localhost:5001/${GOOGLE_CLOUD_PROJECT}/us-central1/<FUNCTION_NAME> \
  -H "Content-Type: application/json" \
  -d '{"pageType":"airport","targetKeywords":["airport limo chicago"],"tone":"professional"}'
```

## Notes and caveats
- Vertex AI (Gemini) cannot be fully emulated locally — valid cloud credentials are required for actual model calls.
- `functions/src/api/ai/image-generator.ts` currently throws an error for Imagen; follow `docs/DEPLOYMENT_GUIDE.md` to enable Imagen and implement API usage before testing image generation.
- Do not commit `.env.local` or service account keys to version control.

## Next steps
- If you want, I can stub `image-generator` to return representative placeholder images during local dev, and add a `pnpm` script to start emulators from the repo root.
