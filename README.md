# Chicago Airport Black Car

[![Build and Deploy](https://github.com/royalcarriage/royalcarriage/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/royalcarriage/royalcarriage/actions/workflows/firebase-deploy.yml)

Professional airport transportation serving Chicago O'Hare, Midway, and 80+ suburbs.

## 🚀 NEW: AI-Powered Website Management System

This repository now includes a comprehensive AI-powered system for automated SEO optimization, content generation, and website analytics. 

**Key Features:**
- 🤖 AI Page Analyzer with SEO scoring
- ✍️ Automated content generation using Google Vertex AI
- 🖼️ AI-powered image generation
- 📊 Admin dashboard for website management
- ⏰ Scheduled automated analysis and reporting
- 🔒 Secure Firebase integration with role-based access

**Quick Access:**
- Admin Dashboard: `https://your-domain.com/admin`
- [AI System Guide](docs/AI_SYSTEM_GUIDE.md) - Complete documentation
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Setup instructions

## Quick Start

### Prerequisites

- Node.js 20.x LTS or later
- npm 10.x or later
- Git
- Firebase CLI (for AI features): `npm install -g firebase-tools`
- Google Cloud Project with Vertex AI enabled (for AI features)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/royalcarriage/royalcarriage.git
cd royalcarriage

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:5000` with hot module replacement enabled.

### Build for Production

```bash
# Build both client and server
npm run build

# Run smoke tests to verify build
npm test

# Type check
npm run check
```

Build output:
- Client: `dist/public/` (ready for Firebase Hosting)
- Server: `dist/index.cjs` (Express server bundle)

## Project Structure

```
royalcarriage/
├── client/          # React frontend (Vite + TypeScript)
│   └── src/
│       └── pages/
│           └── admin/    # AI admin dashboard
├── server/          # Express.js backend
│   └── ai/          # AI services (analyzer, generator, image)
├── functions/       # Firebase Functions for automation
├── shared/          # Shared types and database schema
├── docs/            # Documentation
│   ├── DEVELOPER_GUIDE.md     # Comprehensive developer guide
│   ├── REPO_AUDIT.md          # Repository audit report
│   ├── AI_SYSTEM_GUIDE.md     # AI system documentation
│   └── DEPLOYMENT_GUIDE.md    # AI deployment instructions
├── script/          # Build and utility scripts
└── .github/         # GitHub Actions workflows
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run check` | TypeScript type checking |
| `npm test` | Run smoke tests |
| `npm run db:push` | Push database schema (Drizzle ORM) |

## Documentation

- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Complete setup, build, deployment, and troubleshooting guide
- **[CI/CD Workflow](docs/CICD_WORKFLOW.md)** - Comprehensive GitHub Actions workflow documentation
- **[Repository Audit](docs/REPO_AUDIT.md)** - Repository structure and audit report
- **[Design Guidelines](design_guidelines.md)** - Brand and design specifications
- **[AI System Guide](docs/AI_SYSTEM_GUIDE.md)** - AI features documentation and usage
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - AI system deployment instructions
- **[Firebase Audit](docs/FIREBASE_AUDIT.md)** - Firebase system configuration audit report
- **[Firebase Emulator Guide](docs/FIREBASE_EMULATOR_GUIDE.md)** - Local development with Firebase emulators

## AI Features

### Admin Dashboard
Access the AI-powered admin dashboard at `/admin` to:
- Analyze all website pages for SEO optimization
- Generate AI-powered content improvements
- Create AI-generated images
- Monitor analytics and performance
- Configure automation settings

### API Endpoints
- `POST /api/ai/analyze-page` - Analyze a page for SEO
- `POST /api/ai/generate-content` - Generate optimized content
- `POST /api/ai/generate-image` - Create AI images
- `POST /api/ai/batch-analyze` - Analyze multiple pages
- `GET /api/ai/health` - Check AI services status

### Scheduled Tasks
- **Daily Analysis**: 2:00 AM CT - Analyzes all pages automatically
- **Weekly Reports**: Monday 9:00 AM CT - Generates SEO reports

See [AI System Guide](docs/AI_SYSTEM_GUIDE.md) for complete documentation.

## Deployment

This project is configured for automatic deployment to Firebase Hosting via GitHub Actions.

### Automatic Deployment

- **Main branch**: Pushes automatically deploy to production
- **Pull requests**: Preview deployments created automatically

### Required Setup

1. Update `.firebaserc` with your Firebase project ID
2. Add `FIREBASE_SERVICE_ACCOUNT` secret to GitHub repository
   - Get from Firebase Console → Project Settings → Service Accounts
   - Base64 encode the JSON:
     - Linux/WSL: `base64 -w 0 < service-account.json`
     - macOS: `base64 -i service-account-key.json`
   - Add to: Settings → Secrets and variables → Actions

3. For AI features, also set up:
   - Google Cloud Project with Vertex AI enabled
   - Service account with Vertex AI permissions
   - Environment variables (see [Deployment Guide](docs/DEPLOYMENT_GUIDE.md))

See [Developer Guide - Deployment Rollout Plan](docs/DEVELOPER_GUIDE.md#deployment-rollout-plan) and [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## Tech Stack

- **Frontend**: React 18 + Vite 7 + TypeScript
- **Backend**: Express.js 4
- **Styling**: Tailwind CSS + Radix UI
- **Database**: PostgreSQL + Drizzle ORM
- **Deployment**: Firebase Hosting
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally (`npm run build && npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

Private repository - All rights reserved.

## Support

For development questions and documentation, see the [Developer Guide](docs/DEVELOPER_GUIDE.md).
