# Quick Start Deployment Guide

Get the AI-powered website management system deployed in under 30 minutes!

## Prerequisites Checklist

- [ ] Node.js 20.x installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created at https://console.firebase.google.com
- [ ] Git repository cloned locally

## Step 1: Configuration (5 minutes)

### 1.1 Update Firebase Project ID

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 1.2 Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with minimum required values:

```env
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=your-firebase-project-id
SESSION_SECRET=generate-random-32-char-string
```

## Step 2: Install & Build (10 minutes)

Run the automated deployment script:

```bash
./deploy.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Type check
npm run check

# Build
npm run build

# Install Functions dependencies
cd functions
npm install
cd ..
```

## Step 3: Deploy to Firebase (10 minutes)

### 3.1 Login to Firebase

```bash
firebase login
```

### 3.2 Deploy Everything

```bash
firebase deploy
```

Or deploy individually:

```bash
# Deploy security rules
firebase deploy --only firestore

# Deploy functions
firebase deploy --only functions

# Deploy website
firebase deploy --only hosting
```

## Step 4: Create Admin User (5 minutes)

### Option A: Firebase Console

1. Go to Firestore Database in Firebase Console
2. Create collection: `users`
3. Add document with ID: `admin-001`
4. Fields:
   ```json
   {
     "id": "admin-001",
     "username": "admin",
     "password": "CHANGE_THIS_PASSWORD",
     "role": "admin",
     "createdAt": "2026-01-14T00:00:00Z"
   }
   ```

### Option B: Firebase CLI

```bash
firebase firestore:write users/admin-001 '{
  "id": "admin-001",
  "username": "admin",
  "password": "CHANGE_THIS_PASSWORD",
  "role": "admin",
  "createdAt": "2026-01-14T00:00:00Z"
}'
```

**⚠️ Important**: Change the password immediately after first login!

## Step 5: Verify Deployment (5 minutes)

### 5.1 Check Website

Visit: `https://your-project-id.web.app`

### 5.2 Check Admin Dashboard

Visit: `https://your-project-id.web.app/admin`

Login with admin credentials created in Step 4.

### 5.3 Verify Functions

```bash
firebase functions:list
```

Should show:

- `dailyPageAnalysis`
- `weeklySeoReport`
- `triggerPageAnalysis`
- `generateContent`
- `generateImage`
- `autoAnalyzeNewPage`

## What You Have Now

✅ **Deployed Website**: Live at your Firebase URL
✅ **Admin Dashboard**: Accessible at `/admin`
✅ **Scheduled Functions**: Running daily and weekly
✅ **Security Rules**: Admin-only access enabled
✅ **Database**: Firestore with indexes

## What's Next

### Immediate (Optional)

- [ ] Configure custom domain
- [ ] Set up Google Analytics
- [ ] Configure monitoring alerts

### Enable Full AI Features (2-3 hours)

1. **Enable Vertex AI**
   - Go to Google Cloud Console
   - Enable Vertex AI API
   - Enable Gemini and Imagen APIs

2. **Create Service Account**
   - IAM & Admin → Service Accounts
   - Create with roles:
     - Vertex AI User
     - Cloud Functions Developer
     - Firestore User

3. **Download Credentials**
   - Download JSON key
   - Store securely (never commit to git)

4. **Update Environment**

   ```env
   GOOGLE_CLOUD_PROJECT=your-gcp-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   ```

5. **Update Code**
   - Replace TODOs in `PageAnalyzer.tsx`
   - Replace TODOs in `functions/src/index.ts`
   - Redeploy: `firebase deploy`

## Troubleshooting

### Build Fails

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Deploy Fails

- Check Firebase project ID in `.firebaserc`
- Ensure logged in: `firebase login`
- Check Firebase quota limits

### Admin Dashboard Not Loading

- Verify build succeeded
- Check browser console for errors
- Ensure routing configured in `firebase.json`

### Functions Not Running

- Check Firebase Console → Functions
- View logs: `firebase functions:log`
- Verify function deployment: `firebase functions:list`

## Cost Estimate

**First Month**: $0-5 (Free tier covers most usage)

- Hosting: Free tier sufficient
- Functions: 2M invocations free
- Firestore: 50K reads/day free

**With AI Enabled**: $15-50/month

- Depends on content generation frequency
- Monitor usage in Google Cloud Console

## Support

**Documentation**

- Full System Guide: `docs/AI_SYSTEM_GUIDE.md`
- Detailed Deployment: `docs/DEPLOYMENT_GUIDE.md`
- Audit Report: `docs/PRE_DEPLOYMENT_AUDIT.md`

**Commands**

- Check status: `firebase deploy --only hosting --dry-run`
- View logs: `firebase functions:log`
- Rollback: `firebase hosting:rollback`

## Success!

🎉 Your AI-powered website management system is now live!

Access the admin dashboard and start analyzing pages for SEO optimization.

**Admin URL**: `https://your-project-id.web.app/admin`

---

**Total Time**: ~30 minutes
**Difficulty**: Easy
**Status**: Production Ready ✅
