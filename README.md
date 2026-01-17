# Royal Carriage Limousine - Monorepo

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://admin.royalcarriagelimo.com)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Astro%20%7C%20Firebase-orange)](https://nextjs.org)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5-blue)](https://ai.google.dev)
[![Deployment](https://img.shields.io/badge/Status-Live-success)](https://admin.royalcarriagelimo.com)

Professional limousine service ecosystem managed via a monorepo. **All systems deployed and operational as of January 16, 2026.**

## 🏗 System Architecture

**Monorepo Structure (pnpm workspaces):**

- `apps/admin`: **Admin Dashboard** (Next.js). The control center. Builds to static export in `out/`.
- `apps/airport`: **Airport Limo Service** (Astro). Marketing site.
- `apps/corporate`: **Corporate Car Service** (Astro). Marketing site.
- `apps/wedding`: **Wedding Transportation** (Astro). Marketing site.
- `apps/partybus`: **Party Bus Rentals** (Astro). Marketing site.
- `functions`: **Firebase Cloud Functions** (TypeScript). Backend logic, AI, & automation.
- `packages/ui`: Shared UI components (Tailwind).

## 🚀 Live Deployment Status (✅ All Systems Live)

**Last Deployment**: January 16, 2026

| Service               | Domain                                                                       | Firebase Target | Status  |
| --------------------- | ---------------------------------------------------------------------------- | --------------- | ------- |
| **Admin Dashboard**   | [admin.royalcarriagelimo.com](https://admin.royalcarriagelimo.com)           | `admin`         | ✅ Live |
| **Airport Limo**      | [chicagoairportblackcar.com](https://chicagoairportblackcar.com)             | `airport`       | ✅ Live |
| **Executive Service** | [chicagoexecutivecarservice.com](https://chicagoexecutivecarservice.com)     | `corporate`     | ✅ Live |
| **Wedding Transport** | [chicagoweddingtransportation.com](https://chicagoweddingtransportation.com) | `wedding`       | ✅ Live |
| **Party Bus Rental**  | [chicago-partybus.com](https://chicago-partybus.com)                         | `partybus`      | ✅ Live |

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

### AI Features (Powered by Google Gemini 1.5)

**Deployed Gemini Functions** ✅:

- **generateFAQForCity**: Creates city-specific FAQs with 30-day caching (gemini-1.5-flash)
- **summarizeCustomerReviews**: Aggregates & analyzes customer feedback with sentiment (gemini-1.5-flash)
- **translatePageContent**: Multi-language translation preserving tone (gemini-1.5-flash)
- **suggestSocialCaptions**: Platform-specific social media content with vision (gemini-1.5-flash)
- **analyzeSentimentOfFeedback**: Automatic sentiment analysis on new feedback (gemini-1.5-pro)
- **aiModelRouter**: Intelligent model selection with cost optimization

**Dashboard Features**:

- SEO Analysis: Automated page scoring
- Content Generation: Vertex AI integration
- Image Analysis: Vision-based insights
- Cost Optimization: ~$1/month for 1000 API calls

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

## 🔐 Security (Role-Based Access Control)

**Role Hierarchy** (lowercase):

- `superadmin`: Full system access
- `admin`: Administrative functions
- `editor`: Content editing
- `viewer`: Read-only access

**Implementation**:

- ✅ Custom Claims in Firebase Auth
- ✅ `syncUserRole` Cloud Function mirrors Firestore roles to Auth claims
- ✅ Firestore security rules enforce role-based access (13 collections)
- ✅ Storage security rules enforce role-based file access
- ✅ AuthProvider context manages role state in React

**See**: [Security & Authentication Documentation](./docs/STATUS_FIREBASE_GEMINI.md)

## 📚 Comprehensive Documentation

### Quick Start

- **[Deployment Verification Report](DEPLOYMENT_VERIFICATION_REPORT.md)** - Complete deployment status (Jan 16, 2026)
- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Full development setup

### Firebase & Infrastructure

- **[Firebase System Audit](FIREBASE_SYSTEM_AUDIT.md)** - Complete Firebase audit (13 collections, 5 auth functions, 31 data ops)
- **[Firebase Authentication Setup](FIREBASE_AUTH_SETUP.md)** - Auth configuration guide
- **[Firebase Local Setup](docs/FIREBASE_LOCAL_SETUP.md)** - Emulator configuration
- **[Security & Status](docs/STATUS_FIREBASE_GEMINI.md)** - Latest system status

### AI & Advanced Features

- **[Gemini Integration Guide](GEMINI_INTEGRATION.md)** - Full AI implementation guide (25 KB)
- **[Gemini Quick Start](GEMINI_QUICK_START.md)** - Deploy AI features in 10 minutes
- **[Gemini Implementation Summary](GEMINI_IMPLEMENTATION_SUMMARY.md)** - Technical details & metrics

### Deployment & Operations

- **[Deployment Checklist](OPS_DEPLOY_CHECKLIST.md)** - Pre-deployment verification
- **[CI/CD Workflow](docs/CICD_WORKFLOW.md)** - GitHub Actions setup
- **[Audit Log](VSCODE_AI_AUDIT.md)** - System audit history

### Admin Dashboard

- **[Admin Integration Plan](docs/ADMIN_SYSTEM_INTEGRATION_PLAN.md)** - Architecture overview
- **[Admin Dashboard Redesign](docs/ADMIN_DASHBOARD_REDESIGN.md)** - UI/UX specifications
