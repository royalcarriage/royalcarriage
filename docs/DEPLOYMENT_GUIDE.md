# AI System Deployment Guide

## Quick Start

This guide helps you deploy the AI-powered website management system to Firebase.

## Prerequisites

1. **Firebase Project**: Create a Firebase project at https://console.firebase.google.com
2. **Google Cloud Project**: Enable Vertex AI in Google Cloud Console
3. **Node.js 20+**: Ensure Node.js 20.x is installed
4. **Firebase CLI**: Install with `npm install -g firebase-tools`

## Step 1: Configure Firebase

1. **Login to Firebase**
```bash
firebase login
```

2. **Update Firebase Project ID**
Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

3. **Initialize Firestore**
```bash
firebase init firestore
# Select existing project
# Use existing firestore.rules and firestore.indexes.json
```

## Step 2: Set Up Google Cloud

1. **Enable Required APIs**
Go to Google Cloud Console and enable:
- Vertex AI API
- Cloud Functions API
- Cloud Firestore API
- Cloud Storage API

2. **Create Service Account**
```bash
# In Google Cloud Console:
# IAM & Admin > Service Accounts > Create Service Account
# Give it these roles:
# - Vertex AI User
# - Cloud Functions Developer
# - Firestore User
# - Storage Object Admin
```

3. **Download Service Account Key**
```bash
# Download JSON key file
# Store securely (DO NOT commit to git)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Step 3: Configure Environment

1. **Create .env file**
```bash
cp .env.example .env
```

2. **Edit .env**
```env
NODE_ENV=production
PORT=5000

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id

# Google Cloud AI
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Security
SESSION_SECRET=generate-a-random-32-character-string

# Admin (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-here
```

## Step 4: Install Dependencies

```bash
# Root project
npm install

# Firebase Functions
cd functions
npm install
cd ..
```

## Step 5: Build and Test Locally

```bash
# Build the application
npm run build

# Test locally (optional)
npm start

# Test Firebase Functions locally (optional)
cd functions
npm run serve
```

## Step 6: Deploy to Firebase

1. **Deploy Firestore Rules and Indexes**
```bash
firebase deploy --only firestore
```

2. **Deploy Storage Rules**
```bash
firebase deploy --only storage
```

3. **Deploy Firebase Functions**
```bash
firebase deploy --only functions
```

4. **Deploy Hosting**
```bash
firebase deploy --only hosting
```

5. **Or Deploy Everything**
```bash
firebase deploy
```

## Step 7: Create Admin User

After deployment, create an admin user with proper authentication setup:

### Important: Firebase Storage Rules Require Custom Claims

Firebase Storage rules cannot access Firestore directly (unlike Firestore rules). They rely on **custom claims** in the Firebase Auth token. You must set the `role: 'admin'` custom claim for admin users.

### Option 1: Via Firebase Functions (Recommended)

Create a one-time admin setup function:

```javascript
// In functions/src/index.ts or a separate setup file
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createAdminUser = functions.https.onCall(async (data, context) => {
  // Add security: only allow from specific IP or with secret key
  const { email, password, secret } = data;
  
  if (secret !== 'your-one-time-secret-key') {
    throw new functions.https.HttpsError('permission-denied', 'Invalid secret');
  }
  
  try {
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
    });
    
    // Set custom claims for Storage rules
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'admin' 
    });
    
    // Create Firestore user document for Firestore rules
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      username: email.split('@')[0],
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { 
      success: true, 
      userId: userRecord.uid,
      message: 'Admin user created with custom claims and Firestore document'
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

Call it after deployment:
```bash
# Using Firebase CLI
firebase functions:call createAdminUser --data '{"email":"admin@example.com","password":"secure-password","secret":"your-one-time-secret-key"}'
```

### Option 2: Via Firebase Admin SDK Script

Create a script `scripts/create-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'secure-password';
  
  try {
    // Create auth user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
    });
    
    console.log('Created auth user:', userRecord.uid);
    
    // Set custom claims for Storage rules
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'admin' 
    });
    
    console.log('Set custom claims: role=admin');
    
    // Create Firestore document for Firestore rules
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      username: email.split('@')[0],
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Created Firestore user document');
    console.log('Admin user created successfully!');
    
    // Verify
    const user = await admin.auth().getUser(userRecord.uid);
    console.log('Custom claims:', user.customClaims);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  }
  
  process.exit(0);
}

createAdmin();
```

Run the script:
```bash
node scripts/create-admin.js
```

### Option 3: Via Firebase Console (Manual - Two Steps Required)

1. **Create Firebase Auth User**
   - Go to Firebase Console → Authentication → Users
   - Click "Add User"
   - Enter email and password
   - Copy the User UID

2. **Set Custom Claims (requires Cloud Shell or local script)**
   
   You cannot set custom claims via the Firebase Console UI. Use one of these methods:
   
   **Using gcloud Cloud Shell:**
   ```bash
   # In Google Cloud Console Cloud Shell
   gcloud auth application-default login
   
   # Run this Node.js snippet
   const admin = require('firebase-admin');
   admin.initializeApp();
   await admin.auth().setCustomUserClaims('USER_UID_HERE', { role: 'admin' });
   ```
   
   **Or create the Firestore document manually:**
   - Go to Firestore Database
   - Create document in `users` collection with ID matching the Auth UID:
   ```json
   {
     "id": "USER_UID_FROM_AUTH",
     "username": "admin",
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```
   
   **Then set custom claims using a script** (same as Option 2 above)

### Verify Admin Setup

Test that admin has access to both Firestore and Storage:

```javascript
// Test script
const admin = require('firebase-admin');
admin.initializeApp();

async function verifyAdmin(uid) {
  // Check Auth custom claims
  const user = await admin.auth().getUser(uid);
  console.log('Custom claims:', user.customClaims);
  
  // Check Firestore document
  const doc = await admin.firestore().collection('users').doc(uid).get();
  console.log('Firestore role:', doc.data()?.role);
  
  // Both should show role: 'admin'
}

verifyAdmin('USER_UID_HERE');
```

## Step 8: Access Admin Dashboard

1. Navigate to: `https://your-firebase-app.web.app/admin`
2. Log in with admin credentials
3. Start using the AI tools!

## Scheduled Functions

The following functions run automatically:

- **Daily Page Analysis**: Every day at 2:00 AM CT
- **Weekly SEO Report**: Every Monday at 9:00 AM CT

View logs:
```bash
firebase functions:log
```

## Monitoring

### Check Function Status
```bash
firebase functions:list
```

### View Logs
```bash
firebase functions:log --only dailyPageAnalysis
firebase functions:log --only weeklySeoReport
```

### Firebase Console
- Functions: https://console.firebase.google.com/project/YOUR_PROJECT/functions
- Firestore: https://console.firebase.google.com/project/YOUR_PROJECT/firestore

## Troubleshooting

### Function Deployment Fails
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Check logs
firebase functions:log
```

### Vertex AI Errors
- Verify API is enabled in Google Cloud Console
- Check service account has Vertex AI User role
- Verify credentials file path is correct
- Check quota limits in Google Cloud Console

### Firestore Permission Denied
- Verify Firestore rules are deployed
- Check user has admin role
- Review rules in Firebase Console

### Build Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Cost Estimation

### Firebase
- **Hosting**: ~$0.15/GB transferred
- **Functions**: First 2M invocations free, then $0.40/M
- **Firestore**: First 50K reads free daily

### Google Cloud Vertex AI
- **Gemini Pro**: ~$0.00025 per 1K characters
- **Imagen**: ~$0.020 per image generation

**Estimated Monthly Cost**: $5-50 depending on usage

## Security Best Practices

1. **Never commit credentials**
   - Add to .gitignore
   - Use environment variables
   - Rotate keys regularly

2. **Limit API access**
   - Set up Firebase App Check
   - Use API keys with restrictions
   - Monitor usage in console

3. **Regular security audits**
   - Review Firestore rules
   - Check IAM permissions
   - Monitor audit logs

## Support

For issues or questions:
1. Check [AI_SYSTEM_GUIDE.md](./AI_SYSTEM_GUIDE.md)
2. Review Firebase documentation
3. Check Google Cloud Vertex AI docs
4. Contact development team

## Next Steps

After deployment:
1. Test all admin dashboard features
2. Run initial page analysis
3. Review AI recommendations
4. Configure automation settings
5. Set up monitoring alerts
6. Train team on admin tools
