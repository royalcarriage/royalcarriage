# VSCODE AI AUDIT

Playbook for auditing/extending the Royal Carriage stack with AI assistance.

## Quick System Map
- Monorepo with Firebase Hosting (5 targets) + Functions.
- Admin app: Astro static site in `apps/admin` → build to `apps/admin/dist`.
- Marketing sites: static assets already in `apps/{airport,corporate,wedding,partybus}/dist` (sources absent; tread carefully).
- Functions: TypeScript in `functions/src`, compiled to `functions/lib` via `pnpm run build:functions`.
- Hosting target mapping lives in `.firebaserc` (admin→royalcarriagelimoseo, airport→chicagoairportblackcar, corporate→chicagoexecutivecarservice, wedding→chicagoweddingtransportation, partybus→chicago-partybus).

## Audit Steps
1) **Firebase config**: Check `firebase.json` + `.firebaserc` for target/public alignment; confirm `predeploy` uses `pnpm run build`.
2) **Build health**:
   - `pnpm run build:admin`
   - `pnpm run build:functions`
3) **Hosting outputs**: Ensure `apps/admin/dist` exists post-build; confirm marketing `dist` assets present before deploying hosting targets.
4) **Functions**: Inspect `functions/src/image-generator.ts` (Vertex AI + Storage fallback) and `functions/lib` after build.
5) **Rules**: Review `firestore.rules`, `firestore.indexes.json`, `storage.rules`; deploy with `firebase deploy --only firestore:rules,firestore:indexes,storage`.
6) **Deploy check**: For admin, `firebase deploy --only hosting:admin`; verify `https://admin.royalcarriagelimo.com` resolves to the new build.

## Extending
- Add new UI to `apps/admin` (Astro); use Tailwind (integrated via `@astrojs/tailwind`).
- Shared UI lives in `packages/ui`.
- For new functions, add under `functions/src`, run `pnpm run build:functions`, then `firebase deploy --only functions`.

## Gotchas
- Local Node is v24; Functions target nodejs20 (CLI warns).
- Marketing app sources are missing—do not overwrite existing `dist` unless you have rebuildable sources.
- Vertex AI/Storage credentials must exist in runtime env; generator falls back to placeholders when absent.
