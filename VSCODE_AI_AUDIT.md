# VSCODE AI AUDIT

Playbook for auditing/extending the Royal Carriage stack with AI assistance.

## Quick System Map
- **Admin App**: `apps/admin` (Next.js 14). Builds to static export in `out/`.
- **Marketing Sites**: `apps/{airport,corporate,wedding,partybus}` (Astro). Build to `dist/`.
- **Functions**: `functions/` (TypeScript). Compiled to `functions/lib`.
- **Hosting**: 5 targets in `firebase.json` mapping to their respective build outputs.

## Audit Steps
1) **Firebase config**: Check `firebase.json` + `.firebaserc`.
   - `admin` -> `apps/admin/out`
   - `airport` -> `apps/airport/dist`
   - etc.
2) **Build health**:
   - `pnpm run build`: Builds ALL workspaces.
   - Individual: `pnpm --filter <pkg> build`.
3) **Functions**:
   - `src/index.ts`: Triggers & scheduled tasks.
   - `src/{dispatch,fleet,payroll}Functions.ts`: Business logic (HTTP).
   - `tsconfig.json` excludes legacy `src/api` code.
4) **Rules**:
   - `firestore.rules`: Role-based access.
   - `storage.rules`: Checks custom claims synced by `syncUserRole`.
5) **Deploy**: `pnpm run deploy` or `firebase deploy`.

## Extending
- **Admin UI**: Add pages in `apps/admin/src/pages` (Next.js file routing not used? It seems to be a single page app in `src/react/AdminApp.tsx` mounted via Next.js pages).
- **Marketing**: Add `.astro` pages in `apps/<site>/src/pages`.
- **Functions**: Add new files in `functions/src` and update `tsconfig.json` include list.

## Gotchas
- Local Node is v24; Functions target nodejs20.
- Admin app is Next.js "Static Export" (`output: 'export'`), so no SSR/API routes in Next.js.
- Legacy code exists in `functions/src/api` but is excluded from build.