# Firebase System Integration Guide

**Date:** January 15, 2026  
**Status:** Integration Roadmap  
**Purpose:** Connect all components for full functionality

---

## Executive Summary

The Firebase system has three layers that need to be connected:

1. **Backend Services** (`server/ai/`) - ✅ Fully implemented
2. **Firebase Functions** (`functions/src/index.ts`) - ⚠️ Using mock data
3. **Admin Dashboard** (`client/src/pages/admin/`) - ⚠️ Using mock data

**Current State:** All components exist but are disconnected  
**Goal:** Wire them together for end-to-end functionality

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (Client)                 │
│  Pages: PageAnalyzer, AITools, ImageGallery, Analytics      │
│  Status: ⚠️ Using mock data                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP Requests (currently disconnected)
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API Server (server/ai/)                 │
│  Routes: /api/ai/analyze-page, generate-content, etc.       │
│  Services: PageAnalyzer, ContentGenerator, ImageGenerator   │
│  Status: ✅ Fully implemented                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─→ Firestore (read/write analysis data)
                  ├─→ Vertex AI (AI processing)
                  └─→ Firebase Storage (store images)
                  
┌─────────────────────────────────────────────────────────────┐
│          Firebase Functions (functions/src/index.ts)         │
│  Functions: triggerPageAnalysis, generateContent, etc.      │
│  Status: ⚠️ Using template/mock data                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  └─→ Firestore (store results)
```

---

## Critical Disconnections

### 1. Admin Dashboard → Backend API ❌

**Location:** `client/src/pages/admin/PageAnalyzer.tsx:52`

**Current State:**
```typescript
// TODO: Replace with actual API call to /api/ai/batch-analyze
// This is currently using mock data for demonstration purposes
// In production, this should call the real API:
// const response = await fetch('/api/ai/batch-analyze', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ pages: websitePages })
// });
```

**What's Needed:**
1. Uncomment and enable the API call
2. Add authentication headers (Bearer token)
3. Handle loading states and errors
4. Display real results instead of mock data

**Implementation:**
```typescript
const handleAnalyzePages = async () => {
  setAnalyzing(true);
  
  try {
    // Get auth token (from Firebase Auth context)
    const token = await user.getIdToken();
    
    // Call backend API
    const response = await fetch('/api/ai/batch-analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pages: websitePages })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setResults(data.results);
  } catch (error) {
    console.error('Analysis failed:', error);
    // Show error toast/notification
  } finally {
    setAnalyzing(false);
  }
};
```

**Files to Modify:**
- `client/src/pages/admin/PageAnalyzer.tsx` - Connect to API
- Add authentication context provider if missing
- Update UI to handle real data format

---

### 2. Firebase Functions → PageAnalyzer Class ❌

**Location:** `functions/src/index.ts:168`

**Current State:**
```typescript
// TODO: Replace with actual AI analysis using PageAnalyzer
// This is currently using mock data for demonstration
// In production, import and use the PageAnalyzer class:
// import { PageAnalyzer } from '../../server/ai/page-analyzer';
// const analyzer = new PageAnalyzer();
// const result = await analyzer.analyzePage(pageContent, pageUrl, pageName);

// Perform AI analysis (using mock data for now)
const analysis = {
  pageUrl: sanitizedPageUrl,
  pageName: sanitizedPageName,
  seoScore: Math.floor(Math.random() * 40) + 60,
  contentScore: Math.floor(Math.random() * 40) + 60,
  analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
  status: 'completed',
};
```

**Challenge:**
- Firebase Functions run in isolated environment
- Cannot directly import from `../../server/ai/` 
- Need to either:
  1. Copy AI classes to functions/src/
  2. Deploy as separate microservice
  3. Call backend API from functions

**Recommended Solution: Option 3 - Functions call Backend API**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch'; // Install: npm install node-fetch

export const triggerPageAnalysis = functions.https.onRequest(async (req, res) => {
  // ... authentication and validation ...
  
  try {
    // Call backend API instead of using PageAnalyzer directly
    const backendUrl = process.env.BACKEND_API_URL || 'https://your-backend-url.com';
    
    const analysisResponse = await fetch(`${backendUrl}/api/ai/analyze-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '', // Forward auth
      },
      body: JSON.stringify({
        pageUrl: sanitizedPageUrl,
        pageName: sanitizedPageName,
        pageContent: pageContent,
      }),
    });
    
    if (!analysisResponse.ok) {
      throw new Error(`Backend API error: ${analysisResponse.status}`);
    }
    
    const analysisData = await analysisResponse.json();
    
    // Store in Firestore
    const docRef = await admin.firestore().collection('page_analyses').add({
      pageUrl: sanitizedPageUrl,
      pageName: sanitizedPageName,
      seoScore: analysisData.analysis.seoScore,
      contentScore: analysisData.analysis.contentScore,
      recommendations: analysisData.analysis.recommendations,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
    });
    
    res.status(200).json({
      success: true,
      analysisId: docRef.id,
      analysis: analysisData.analysis,
    });
  } catch (error) {
    console.error('Page analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
```

**Files to Modify:**
- `functions/src/index.ts` - All 3 HTTP functions (triggerPageAnalysis, generateContent, generateImage)
- `functions/package.json` - Add `node-fetch` dependency
- `.env` / Firebase Functions config - Add `BACKEND_API_URL`

**Alternative: Copy AI Classes to Functions (Not Recommended)**
```bash
# This creates duplication but works
cp -r server/ai functions/src/
# Then import directly in functions
```

---

### 3. Vertex AI → Content/Image Generators ⚠️

**Location:** `server/ai/content-generator.ts`, `server/ai/image-generator.ts`

**Current State:**
- Services are implemented
- Gracefully fall back to templates if credentials missing
- Need Google Cloud credentials to enable AI

**What's Needed:**
```env
# .env file
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Service Account Setup:**
```bash
# 1. Create service account
gcloud iam service-accounts create vertex-ai-service \
  --display-name="Vertex AI Service Account"

# 2. Grant permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:vertex-ai-service@your-project-id.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 3. Create key
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-service@your-project-id.iam.gserviceaccount.com

# 4. Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/vertex-ai-key.json"
```

**Status Check:**
```typescript
// In server/ai/content-generator.ts
// If Vertex AI is configured, it will use AI
// If not, it falls back to templates (current behavior)
```

---

## Integration Steps (Priority Order)

### Phase 1: Critical Setup (Before Any Integration)

**1.1 Configure Firebase Project**
```bash
# Update .firebaserc with actual project ID
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

**1.2 Set Environment Variables**
```bash
# Copy and configure
cp .env.example .env

# Required values:
NODE_ENV=production
FIREBASE_PROJECT_ID=your-firebase-project-id
SESSION_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://your-domain.com
```

**1.3 Create Admin User**
```javascript
// Run once to create first admin
const admin = require('firebase-admin');
admin.initializeApp();

async function createAdmin() {
  const userRecord = await admin.auth().createUser({
    email: 'admin@yourdomain.com',
    password: 'secure-password',
    emailVerified: true,
  });
  
  // Set custom claims for Storage rules
  await admin.auth().setCustomUserClaims(userRecord.uid, { 
    role: 'admin' 
  });
  
  // Create Firestore document for Firestore rules
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    id: userRecord.uid,
    username: 'admin',
    email: 'admin@yourdomain.com',
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  console.log('Admin created:', userRecord.uid);
}

createAdmin();
```

---

### Phase 2: Backend → Firebase Integration

**2.1 Deploy Backend to Firebase Hosting or Cloud Run**

Option A: Firebase Hosting (Static + Functions)
```bash
# Backend runs as Express in Cloud Functions
firebase deploy --only hosting,functions
```

Option B: Cloud Run (Better for Backend API)
```bash
# Build container
docker build -t gcr.io/your-project/backend .

# Push to registry
docker push gcr.io/your-project/backend

# Deploy to Cloud Run
gcloud run deploy backend \
  --image gcr.io/your-project/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**2.2 Update Firebase Functions to Call Backend**
```bash
# In functions directory
npm install node-fetch

# Set environment config
firebase functions:config:set backend.api.url="https://your-backend-url.com"
```

**2.3 Connect Functions to Backend API**
- Edit `functions/src/index.ts`
- Replace mock data with fetch calls to backend
- Test with emulators first

---

### Phase 3: Admin Dashboard → Backend Integration

**3.1 Add Firebase Auth to Client**
```typescript
// client/src/lib/firebase-client.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

**3.2 Create Auth Context**
```typescript
// client/src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getToken = async () => {
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**3.3 Update PageAnalyzer to Call API**
```typescript
// client/src/pages/admin/PageAnalyzer.tsx
import { useAuth } from '@/contexts/AuthContext';

export default function PageAnalyzer() {
  const { getToken } = useAuth();
  
  const handleAnalyzePages = async () => {
    setAnalyzing(true);
    
    try {
      const token = await getToken();
      
      const response = await fetch('/api/ai/batch-analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pages: websitePages })
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Analysis error:', error);
      // Show error notification
    } finally {
      setAnalyzing(false);
    }
  };
  
  // ... rest of component
}
```

---

### Phase 4: Enable Vertex AI (Optional but Recommended)

**4.1 Enable APIs**
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable vertexai.googleapis.com
```

**4.2 Create Service Account**
```bash
# See "Vertex AI → Content/Image Generators" section above
```

**4.3 Set Credentials**
```bash
# In .env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/vertex-ai-key.json
```

**4.4 Test AI Services**
```bash
# Test content generation
curl -X POST http://localhost:5000/api/ai/generate-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"pageType":"service","location":"Chicago","vehicle":"Limo","targetKeywords":["luxury","airport"]}'
```

---

## Testing Integration

### Local Testing with Emulators

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start backend server
npm run dev

# Terminal 3: Start frontend (if separate)
cd client && npm run dev
```

**Test Flow:**
1. Login to admin dashboard → Gets Firebase Auth token
2. Click "Analyze Pages" → Calls backend API with token
3. Backend processes → Returns real analysis
4. Results displayed → Real data instead of mock

---

## Environment Configuration Summary

**Required for Basic Operation:**
```env
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=your-firebase-project-id
SESSION_SECRET=<32-char-random-string>
ALLOWED_ORIGINS=https://your-domain.com
```

**Required for Full AI Features:**
```env
GOOGLE_CLOUD_PROJECT=your-firebase-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Optional:**
```env
SCHEDULED_TIMEZONE=America/Chicago
PAGES_TO_ANALYZE=/,/ohare-airport-limo,...
COMPANY_PHONE=(224) 801-3090
BACKEND_API_URL=https://your-backend-url.com
```

---

## Deployment Checklist

### Pre-Integration
- [ ] `.firebaserc` updated with project ID
- [ ] `.env` configured with all required variables
- [ ] Admin user created with custom claims
- [ ] Service account created for Vertex AI (optional)

### Backend Integration
- [ ] Backend deployed (Firebase Functions or Cloud Run)
- [ ] Backend API URL configured
- [ ] Functions updated to call backend API
- [ ] Authentication forwarding working

### Frontend Integration
- [ ] Firebase client SDK initialized
- [ ] Auth context provider added
- [ ] PageAnalyzer connected to API
- [ ] Other admin pages connected (AITools, ImageGallery)

### Vertex AI Integration (Optional)
- [ ] Vertex AI API enabled
- [ ] Service account with permissions
- [ ] Credentials file configured
- [ ] Test AI endpoints

### Validation
- [ ] Can login to admin dashboard
- [ ] Can trigger page analysis (gets real results)
- [ ] Can generate content (gets AI or template)
- [ ] Can generate images (gets AI or placeholder)
- [ ] Scheduled functions running on schedule
- [ ] Firestore data being written correctly

---

## Quick Start Commands

```bash
# 1. Update configuration
cp .env.example .env
# Edit .env with your values

# 2. Update Firebase project
# Edit .firebaserc with your project ID

# 3. Install dependencies
npm install
cd functions && npm install && cd ..

# 4. Build everything
npm run build

# 5. Deploy Firebase (rules, indexes, functions)
firebase deploy --only firestore,storage,functions

# 6. Deploy backend (choose one)
# Option A: Cloud Run
gcloud run deploy backend --source .
# Option B: Include in Functions (use express in a function)

# 7. Create admin user
node scripts/create-admin.js

# 8. Test
# Login to https://your-domain.com/admin
# Try analyzing pages
```

---

## Troubleshooting

### "Authentication required" errors
- Check admin user has custom claims set
- Verify token is being sent in Authorization header
- Check token hasn't expired

### "CORS error" in browser
- Verify ALLOWED_ORIGINS includes your domain
- Check backend is returning proper CORS headers
- In development, ensure localhost is allowed

### "Analysis failed" errors
- Check backend API is accessible from Functions
- Verify BACKEND_API_URL is set correctly
- Check service account permissions

### Mock data still showing
- Verify fetch call is uncommented
- Check network tab for API calls
- Ensure no errors in console

---

## Next Steps

1. **Immediate:** Connect admin dashboard to backend API
2. **Short-term:** Connect Firebase Functions to backend API
3. **Medium-term:** Enable Vertex AI credentials for full AI
4. **Long-term:** Add monitoring, alerting, and analytics

**Estimated Integration Time:** 2-4 hours for basic, 1-2 days for full AI

---

**Document Status:** Integration roadmap  
**Last Updated:** January 15, 2026  
**Priority:** HIGH - Required for production functionality
