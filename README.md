# Royal Carriage Limousine - Monorepo

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://royalcarriagelimoseo.web.app)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Astro%20%7C%20Firebase-orange)](https://nextjs.org)

Professional limousine service ecosystem managed via a monorepo.

## 🏗 System Architecture

**Monorepo Structure (pnpm workspaces):**
- `apps/admin`: **Admin Dashboard** (Next.js). The control center. Builds to static export in `out/`.
- `apps/airport`: **Airport Limo Service** (Astro). Marketing site.
- `apps/corporate`: **Corporate Car Service** (Astro). Marketing site.
- `apps/wedding`: **Wedding Transportation** (Astro). Marketing site.
- `apps/partybus`: **Party Bus Rentals** (Astro). Marketing site.
- `functions`: **Firebase Cloud Functions** (TypeScript). Backend logic, AI, & automation.
- `packages/ui`: Shared UI components (Tailwind).

## 🚀 Live URLs

| Service | Target | URL |
|---------|--------|-----|
| **Admin** | `admin` | [https://royalcarriagelimoseo.web.app](https://royalcarriagelimoseo.web.app) |
| **Airport** | `airport` | [https://chicagoairportblackcar.web.app](https://chicagoairportblackcar.web.app) |
| **Corporate** | `corporate` | [https://chicagoexecutivecarservice.web.app](https://chicagoexecutivecarservice.web.app) |
| **Wedding** | `wedding` | [https://chicagoweddingtransportation.web.app](https://chicagoweddingtransportation.web.app) |
| **Party Bus** | `partybus` | [https://chicago-partybus.web.app](https://chicago-partybus.web.app) |

## 🛠️ Development

### Prerequisites
- Node.js v20+
- npm (for admin app) / pnpm if working on functions
- Firebase CLI

### Admin (Next.js) local dev
```bash
cd apps/admin
npm install
npm run dev   # http://localhost:3000
```

Set env in `apps/admin/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=royalcarriagelimoseo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Build + Deploy
- Build admin: `cd apps/admin && npm run build` (outputs `apps/admin/out`)
- Deploy admin hosting: `firebase deploy --only hosting:admin`
- Functions (if changed): `cd functions && pnpm install && pnpm run build && firebase deploy --only functions`
- Rules/indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`

### Emulator (optional)
```bash
firebase emulators:start --only hosting,functions,firestore,storage
```

### AI Features (Admin)
- **SEO Analysis**: Automated page scoring.
- **Content Gen**: Vertex AI integration.
- **Image Gen**: AI asset creation.

## 📁 Project Structure

```
.
├── apps/
│   ├── admin/       # Main Dashboard (Next.js)
│   ├── airport/     # Marketing Site (Astro)
│   ├── corporate/   # Marketing Site (Astro)
│   └── ...
├── functions/       # Cloud Functions (Triggers, API)
├── packages/        # Shared libraries
├── firebase.json    # Hosting configuration
├── firestore.rules  # Database security
└── storage.rules    # File security
```

## 🔐 Security
- **RBAC**: Custom Claims (SuperAdmin, Admin, Editor, Viewer).
- **Sync**: `syncUserRole` function mirrors Firestore roles to Auth claims.
- **Rules**: Firestore and Storage rules enforce role-based access.

## 📄 Documentation
- [Audit Log](VSCODE_AI_AUDIT.md)
- [Deployment Checklist](OPS_DEPLOY_CHECKLIST.md)
