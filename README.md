# Chicago Airport Black Car

Professional airport transportation serving Chicago O'Hare, Midway, and 80+ suburbs.

## Quick Start

### Prerequisites

- Node.js 20.x LTS or later
- npm 10.x or later
- Git

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
├── server/          # Express.js backend
├── shared/          # Shared types and utilities
├── docs/            # Documentation
│   ├── DEVELOPER_GUIDE.md    # Comprehensive developer guide
│   └── REPO_AUDIT.md         # Repository audit report
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
- **[Repository Audit](docs/REPO_AUDIT.md)** - Repository structure and audit report
- **[Design Guidelines](design_guidelines.md)** - Brand and design specifications

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
     - macOS: `base64 -i service-account.json`
   - Add to: Settings → Secrets and variables → Actions

See [Developer Guide - Deployment Rollout Plan](docs/DEVELOPER_GUIDE.md#deployment-rollout-plan) for detailed instructions.

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
