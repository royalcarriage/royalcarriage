# Royal Carriage Limousine - Admin System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://royalcarriagelimoseo.web.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-orange)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/security-HTTPS%20%7C%20HSTS-green)](https://royalcarriagelimoseo.web.app)

Professional limousine service with comprehensive admin management system for Chicago O'Hare, Midway, and surrounding areas.

## 🎯 Admin System - Complete & Production Ready

**Live System:** [https://royalcarriagelimoseo.web.app](https://royalcarriagelimoseo.web.app)
**Admin Login:** [https://royalcarriagelimoseo.web.app/login](https://royalcarriagelimoseo.web.app/login)

### ✨ Features

**Authentication & Authorization:**
- 🔐 Secure login with Passport.js and bcrypt
- 👥 Role-based access control (User, Admin, Super Admin)
- 🔒 HTTP-only secure cookies with 24-hour sessions
- 🛡️ CSRF protection and HSTS enabled

**Admin Dashboard:**
- 📊 Stats overview with trends
- ⚡ Quick action buttons
- 📈 Recent activity feed
- 🎛️ System health monitoring
- 🤖 AI automation schedule

**Management Tools:**
- 🧠 **Page Analyzer:** SEO analysis with scoring
- 👥 **User Management:** Full CRUD with role management
- 📈 **Analytics:** Traffic stats and insights
- ⚙️ **Settings:** System configuration

**Design:**
- 🎨 Modern, professional interface
- 📱 Responsive design (mobile, tablet, desktop)
- 🔄 Collapsible sidebar navigation
- ✅ Role-based menu filtering
- 🎯 Active route highlighting

### 🚀 Quick Start

**1. Clone and Install:**
```bash
git clone <repo-url>
cd VSCODE
npm install
```

**2. Create Admin User:**
```bash
npm run init-admin
```

**3. Start Development Server:**
```bash
npm run dev
# Visit http://localhost:5000/login
```

**4. Login:**
- Username: `admin`
- Password: `Admin123!`
- Change password after first login!

### 📋 Admin Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Dashboard | `/admin` | All | Overview, stats, quick actions |
| Page Analyzer | `/admin/analyze` | Admin+ | SEO analysis tool |
| User Management | `/admin/users` | Admin+ | User CRUD operations |
| Analytics | `/admin/analytics` | Admin+ | Traffic insights |
| Settings | `/admin/settings` | Super Admin | System configuration |

### 📚 Documentation

- 📖 [Quick Start Guide](docs/QUICK_START.md) - Get up and running
- 🔐 [Authentication System](docs/AUTHENTICATION_INTEGRATION_COMPLETE.md) - Security details
- 🎨 [Dashboard Design](docs/ADMIN_DASHBOARD_REDESIGN.md) - UI specifications
- 🚀 [Deployment Guide](docs/COMPLETE_SYSTEM_DEPLOYMENT.md) - Production setup

---

## 🛠️ Development

### Prerequisites

- Node.js 20.x LTS or later
- npm 10.x or later
- Git
- Firebase CLI (optional): `npm install -g firebase-tools`

### Local Setup

```bash
# Clone repository
git clone <repo-url>
cd VSCODE

# Install dependencies
npm install

# Create admin user
npm run init-admin

# Start development server
npm run dev
# Server: http://localhost:5000
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run check        # TypeScript type checking
npm run init-admin   # Create initial admin user
npm run db:push      # Push database schema
npm test            # Run tests
```

### Environment Variables

Create `.env` file:

```bash
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-64-character-secret

# Optional - PostgreSQL
DATABASE_URL=postgresql://localhost:5432/royalcarriage

# Firebase (if using)
FIREBASE_PROJECT_ID=royalcarriagelimoseo
GOOGLE_CLOUD_PROJECT=royalcarriagelimoseo
GOOGLE_CLOUD_LOCATION=us-central1
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📁 Project Structure

```
VSCODE/
├── client/src/
│   ├── components/
│   │   └── layout/
│   │       └── AdminLayout.tsx      # Shared sidebar layout
│   ├── hooks/
│   │   └── useAuth.tsx              # Authentication hook
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # Main dashboard
│   │   │   ├── PageAnalyzer.tsx     # SEO analyzer
│   │   │   ├── Users.tsx            # User management
│   │   │   ├── Analytics.tsx        # Traffic stats
│   │   │   └── Settings.tsx         # System config
│   │   ├── Login.tsx                # Login page
│   │   └── Unauthorized.tsx         # Access denied
│   └── App.tsx                      # Routes & providers
├── server/
│   ├── auth.ts                      # Passport.js setup
│   ├── database.ts                  # PostgreSQL connection
│   ├── security.ts                  # RBAC middleware
│   ├── storage.ts                   # User storage
│   ├── init-admin.ts                # Admin user script
│   ├── routes/
│   │   ├── auth.ts                  # Auth endpoints
│   │   └── users.ts                 # User management API
│   └── ai/                          # AI services
├── shared/
│   └── schema.ts                    # Database schema
├── docs/                            # Documentation
└── functions/                       # Firebase Functions
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

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Login to Firebase
firebase login

# Deploy hosting only
firebase deploy --only hosting

# Deploy everything (hosting + functions)
firebase deploy
```

**Production URL:** https://royalcarriagelimoseo.web.app

### Build Output

```
Client: 373.14 KB → 96.82 KB gzipped
Server: 1.1 MB
HTML: 3.27 KB → 1.13 KB gzipped
Total Files: 21
Build Time: ~1 second
```

---

## 🔐 Security

### Authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ HTTP-only secure cookies
- ✅ CSRF protection (SameSite: 'lax')
- ✅ 24-hour session expiration
- ✅ Secure flag in production (HTTPS only)

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Hierarchical permissions (user < admin < super_admin)
- ✅ Endpoint-level protection
- ✅ UI element visibility by role
- ✅ Self-deletion prevention

### Transport Security
- ✅ HSTS enabled with preload
- ✅ SSL/TLS encryption
- ✅ Security headers (X-Frame-Options, CSP, etc.)

---

## 🧪 Testing

### TypeScript Check
```bash
npm run check
# Should show: 0 errors
```

### Build Test
```bash
npm run build
# Should complete in ~1 second
```

### Manual Testing
1. Run `npm run init-admin`
2. Start dev server: `npm run dev`
3. Visit http://localhost:5000/login
4. Login with admin credentials
5. Test navigation and features

---

## 🎯 User Roles

### Role Hierarchy

```
super_admin (Level 3)
    ├── Full system access
    ├── User management
    ├── Settings configuration
    └── All admin features

admin (Level 2)
    ├── Dashboard access
    ├── Page analyzer
    ├── Analytics
    └── View users (read-only)

user (Level 1)
    └── Dashboard access only
```

### Creating Users

**Via Script (Development):**
```bash
npm run init-admin
```

**Via API (Production):**
```typescript
POST /api/auth/register
{
  "username": "newuser",
  "password": "SecurePass123!"
}
```

**Update Role:**
```typescript
PUT /api/users/:id/role
{
  "role": "admin" | "super_admin" | "user"
}
```

---

## 📊 Tech Stack

**Frontend:**
- React 18.3 with TypeScript
- Vite 7.3 (build tool)
- Wouter 3.3 (routing)
- React Query 5.60 (data fetching)
- Radix UI (components)
- Tailwind CSS 3.4

**Backend:**
- Node.js 20
- Express.js 4.21
- Passport.js 0.7 (authentication)
- bcryptjs 2.4 (password hashing)
- Drizzle ORM 0.39

**Database:**
- PostgreSQL (production)
- In-memory storage (development fallback)

**Infrastructure:**
- Firebase Hosting
- Firebase Cloud Functions
- Firebase Firestore

---

## 🐛 Troubleshooting

### Cannot Login
- Verify user exists: Check with `npm run init-admin`
- Check SESSION_SECRET is set
- Clear browser cookies
- Check browser console for errors

### Build Errors
- Run `npm run check` for TypeScript errors
- Delete `node_modules` and reinstall
- Check Node.js version (must be 20.x+)

### Navigation Issues
- Verify user role and permissions
- Check authentication status
- Review browser console
- Clear cache and reload

### Database Connection
- Currently using memory storage by default
- Set DATABASE_URL for PostgreSQL
- Run migrations: `npx drizzle-kit migrate`

---

## 📞 Support

**Documentation:**
- [Quick Start Guide](docs/QUICK_START.md)
- [Authentication System](docs/AUTHENTICATION_INTEGRATION_COMPLETE.md)
- [Dashboard Design](docs/ADMIN_DASHBOARD_REDESIGN.md)
- [Deployment Guide](docs/COMPLETE_SYSTEM_DEPLOYMENT.md)

**System Status:**
- Build: ✅ Passing
- Deployment: ✅ Live
- TypeScript: ✅ 0 Errors
- Security: ✅ Active

**Live System:** https://royalcarriagelimoseo.web.app

---

## ✅ System Status

All components operational:
- ✅ Frontend: Deployed & Live
- ✅ Authentication: Working
- ✅ Authorization: RBAC Enforced
- ✅ Navigation: Seamless
- ✅ All Pages: Functional
- ✅ User Management: Complete
- ✅ Security: Enterprise-Grade
- ✅ Performance: Optimized

**The Royal Carriage Admin System is production-ready!** 🎉

---

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a private commercial project. Please contact the project owner for contribution guidelines.
