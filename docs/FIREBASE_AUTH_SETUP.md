# Firebase Authentication Setup Guide

This guide explains how to set up Firebase Authentication for the Royal Carriage admin dashboard.

## Prerequisites

- Firebase project created (royalcarriagelimoseo)
- Firebase CLI installed
- Admin access to Firebase Console

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`royalcarriagelimoseo`)
3. Navigate to **Authentication** in the left sidebar
4. Click **Get Started**
5. Go to the **Sign-in method** tab
6. Enable **Email/Password** authentication

## Step 2: Create Admin User

### Option A: Firebase Console (Recommended)

1. In Firebase Console → Authentication → Users
2. Click **Add User**
3. Enter email: `admin@royalcarriage.com` (or your preferred email)
4. Enter a strong password
5. Click **Add User**

### Option B: Firebase CLI

```bash
# Install Firebase Admin SDK globally if not already installed
npm install -g firebase-tools

# Create user via Firebase Auth REST API
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@royalcarriage.com",
    "password": "YOUR_SECURE_PASSWORD",
    "returnSecureToken": true
  }'
```

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (</>)
4. Register your app (name: "Royal Carriage Admin")
5. Copy the Firebase configuration values

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration (Client - for Vite)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=royalcarriagelimoseo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=royalcarriagelimoseo
VITE_FIREBASE_STORAGE_BUCKET=royalcarriagelimoseo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Firebase Development (Optional - for local emulators)
VITE_USE_FIREBASE_EMULATOR=false
```

**Important:** 
- All client-side Firebase environment variables must be prefixed with `VITE_`
- Never commit `.env` to git (it's already in `.gitignore`)

## Step 5: Test the Login

1. Start the development server:
```bash
npm run dev:admin
```

2. Navigate to: `http://localhost:5173/admin/login`

3. Log in with the credentials you created in Step 2

4. You should be redirected to `/admin` dashboard

## Security Features

The authentication system includes:

- ✅ **Protected Routes**: All admin pages require authentication
- ✅ **Auto-redirect**: Unauthenticated users are redirected to login
- ✅ **Session Persistence**: Users stay logged in across page refreshes
- ✅ **Secure Sign-out**: Proper Firebase sign-out with redirect
- ✅ **Error Handling**: User-friendly error messages for common issues
- ✅ **Password Visibility Toggle**: Show/hide password for better UX

## Common Error Messages

| Error Code | User-Friendly Message |
|------------|----------------------|
| `auth/invalid-credential` | Invalid email or password |
| `auth/user-not-found` | No account found with this email |
| `auth/wrong-password` | Invalid email or password |
| `auth/too-many-requests` | Too many failed login attempts. Try again later |
| `auth/invalid-email` | Please enter a valid email address |

## Firestore Security Rules

Make sure your `firestore.rules` file includes proper authentication checks:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // More specific rules for admin-only access
    match /admin_data/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@royalcarriage.com$');
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Firebase Emulator (Optional)

For local development without affecting production:

1. Install emulators:
```bash
firebase init emulators
```

2. Select: Authentication, Firestore

3. Start emulators:
```bash
firebase emulators:start
```

4. Set environment variable:
```env
VITE_USE_FIREBASE_EMULATOR=true
```

5. Access emulator UI: `http://localhost:4000`

## Troubleshooting

### "Firebase not initialized" error

- Check that all `VITE_FIREBASE_*` environment variables are set
- Restart the dev server after changing `.env`
- Verify Firebase config in `client/src/lib/firebase.ts`

### Can't log in

- Verify user exists in Firebase Console → Authentication → Users
- Check browser console for detailed error messages
- Ensure Email/Password auth method is enabled in Firebase Console

### Redirect loop

- Clear browser cache and cookies
- Check that ProtectedRoute is properly configured
- Verify AuthProvider wraps all routes in App.tsx

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

3. Update Firebase Auth authorized domains:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your custom domain if using one

## Security Best Practices

- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Enable MFA (Multi-Factor Authentication) for admin accounts
- ✅ Regularly review Firebase Auth users
- ✅ Set up Firebase App Check for additional security
- ✅ Monitor Firebase Authentication logs
- ✅ Never commit Firebase configuration to public repositories
- ✅ Use Firebase Security Rules to restrict data access

## Support

For issues or questions:
- Firebase Documentation: https://firebase.google.com/docs/auth
- Firebase Console: https://console.firebase.google.com
- Project Issues: GitHub Issues

---

Last Updated: January 16, 2026
