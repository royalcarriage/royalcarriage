# Chicago Airport Black Car

Professional airport transportation serving Chicago O'Hare, Midway, and 80+ suburbs.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5000` to view the application.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📦 Firebase Deployment

This project uses Firebase Hosting for deployment with automated CI/CD via GitHub Actions.

### Quick Deploy

```bash
# Build and deploy to Firebase Hosting
npm run build
bash script/firebase-deploy.sh
```

### Automated Deployment

- **Production:** Push to `main` branch triggers automatic deployment
- **Preview:** Pull requests automatically deploy preview versions
- **Status:** Check [GitHub Actions](../../actions) for deployment status

### Setup Firebase

First-time setup or local deployment:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

### 📚 Detailed Documentation

For comprehensive setup instructions, see:
- **[Firebase Setup Guide](docs/FIREBASE_SETUP.md)** - Complete deployment guide
- **[Firebase Security](docs/FIREBASE_SECURITY.md)** - Security best practices
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Full development documentation

### Common Issues

**Deployment fails:**
```bash
# Verify Firebase authentication
firebase login

# Check project configuration
firebase projects:list
```

**Build errors:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run TypeScript check
npm run check
```

**Need to rollback:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/royalcarriagelimoseo/hosting)
2. Navigate to Release History
3. Click ⋮ (three dots) → Rollback

## 🛠️ Technology Stack

- **Frontend:** React 18 + Vite
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS + Radix UI
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions

## 📞 Contact

**Phone:** +1 (224) 801-3090

## 📄 License

MIT
