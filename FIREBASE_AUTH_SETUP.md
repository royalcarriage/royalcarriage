# Firebase Authentication Setup Guide

## Status

✅ **DEPLOYED** (January 16, 2026)
✅ **PRODUCTION READY:** All authentication systems operational
✅ **Google OAuth**: Enabled and functional
✅ **Email/Password Auth**: Configured and tested

---

## 🟢 Current Production Configuration

### Deployed Systems

- **Admin Dashboard**: https://admin.royalcarriagelimo.com (Live ✅)
- **Firebase Project**: royalcarriagelimoseo
- **Firebase Auth**: Fully configured with Google OAuth + Email/Password
- **Custom Claims**: Role-based access control (superadmin, admin, editor, viewer)
- **Firestore**: Security rules deployed and enforced
- **Cloud Functions**: All 13 functions deployed, including syncUserRole

### Authentication Flow (Working)

```
User visits admin.royalcarriagelimo.com
    ↓
Login page loads (via Next.js)
    ↓
User enters credentials or clicks "Continue with Google"
    ↓
Firebase Authentication validates credentials
    ↓
AuthProvider detects sign-in, creates Firestore user profile
    ↓
syncUserRole Cloud Function syncs role to custom claims
    ↓
Dashboard renders with role-based access control
    ↓
✅ User logged in and authenticated
```

---

## What's Configured

✅ **Google Popup Authentication** - Already implemented in code
✅ **Role-based Access Control** - Admin dashboard checks roles
✅ **User Profile Management** - Auto-creates user records on first sign-in
✅ **Redirect Flow** - AuthProvider handles redirect to dashboard after sign-in

**The code is ready. You just need to provide Firebase credentials.**

---

## Step 1: Get Firebase Web Config

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **royalcarriagelimoseo**
3. Click ⚙️ Settings → Project Settings
4. Under "Your apps" section, find or create a **Web** app
5. Copy these values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `measurementId` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

---

## Step 2: Create .env.local

Create file at `/Users/admin/VSCODE/.env.local` with:

```env
# Firebase Client Config (from Console)
NEXT_PUBLIC_FIREBASE_API_KEY=XXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=royalcarriagelimoseo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=royalcarriagelimoseo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=royalcarriagelimoseo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXX
NEXT_PUBLIC_FIREBASE_APP_ID=XXX
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=XXX
```

**Replace XXX with actual values from Firebase Console**

---

## Step 3: Configure Google OAuth

1. In Firebase Console → Authentication → Sign-in method
2. Enable **Google** provider
3. Under "Authorized domains":
   - Add: `admin.royalcarriagelimo.com`
   - Add: `localhost` (for local development)
   - Add: any custom domain you'll use

---

## Step 4: Configure Admin Access

**Current Configuration** (in `/Users/admin/VSCODE/apps/admin/src/lib/dataStore.ts`):

```typescript
// Line 208 - Admin email configuration
role: user.email === "info@royalcarriagelimo.com" ? "superadmin" : "viewer",
```

**Role Levels** (lowercase):

- `superadmin`: Full system access (all admin features)
- `admin`: Administrative functions
- `editor`: Content editing
- `viewer`: Read-only access (default)

**To Add More Admins**, update the logic to:

```typescript
const superAdminEmails = ["info@royalcarriagelimo.com", "your_email@example.com"];
const adminEmails = ["admin1@example.com", "admin2@example.com"];

let role = "viewer"; // default
if (superAdminEmails.includes(user.email)) {
  role = "superadmin";
} else if (adminEmails.includes(user.email)) {
  role = "admin";
} else if (/* some other condition */) {
  role = "editor";
}
```

**Then rebuild and redeploy:**

```bash
cd apps/admin && npm run build && firebase deploy --only hosting:admin
```

---

## Step 5: Test Production Authentication

### Production Testing (Live)

1. Visit: https://admin.royalcarriagelimo.com
2. Click "Sign in"
3. Choose authentication method:
   - **Google OAuth**: Click "Continue with Google"
   - **Email/Password**: Enter credentials

**Expected Result**: Login successful → Dashboard loads with role-based UI

### Local Development Testing

1. Set up `.env.local` with Firebase credentials (see Step 2 above)

2. Start dev server:

   ```bash
   cd apps/admin
   npm install
   npm run dev    # http://localhost:3000
   ```

3. Test Firebase connection:
   - Visit http://localhost:3000
   - Try Google login
   - Check browser console for errors
   - Verify user appears in Firebase Console → Authentication

### Debugging Authentication Issues

**Issue: "Loading auth..." stuck on dashboard**

- Check: Firestore security rules are deployed (`firestore deploy`)
- Check: Role names are lowercase (superadmin, not SuperAdmin)
- Check: User profile created in Firestore `/users/{uid}` collection
- Check: Custom claims set in Firebase Auth

**Command to check custom claims:**

```bash
firebase auth:export --project=royalcarriagelimoseo /tmp/users.json
# Then search for your user and check claims
```

**View Firestore user record:**

- Go to: https://console.firebase.google.com
- Select project: royalcarriagelimoseo
- Firestore Database → Collection: `users`
- Find your user by UID

**View function logs:**

```bash
firebase functions:log --only syncUserRole
```

---

## Authentication Flow

```
1. User visits admin page (not authenticated)
   ↓
2. AuthProvider checks Firebase auth state
   ↓
3. Auth state is null → Login page renders
   ↓
4. User clicks "Sign in with Google"
   ↓
5. signInWithPopup triggers → Google popup opens
   ↓
6. User signs in with Google account
   ↓
7. onAuthStateChanged fires
   ↓
8. ensureUserProfile creates/loads user record
   ↓
9. User object is set in AuthProvider
   ↓
10. Dashboard renders (AdminApp shows full UI)
```

---

## Code Files Involved

- **Login UI:** `/apps/admin/src/react/AdminApp.tsx` (lines 880-930)
- **Auth Logic:** `/apps/admin/src/state/AuthProvider.tsx`
- **Firebase Client:** `/apps/admin/src/lib/firebaseClient.ts`
- **Auth Functions:** `/apps/admin/src/lib/dataStore.ts` (signIn, ensureUserProfile)
- **Role Config:** `/apps/admin/src/lib/dataStore.ts` (line 208)

---

## Troubleshooting

### Issue: "Firebase config missing; using mock data store"

**Fix:** Add `NEXT_PUBLIC_FIREBASE_*` variables to `.env.local`

### Issue: Google popup doesn't appear

**Fix:** Check that `admin.royalcarriagelimo.com` is in Firebase authorized domains

### Issue: Sign-in succeeds but no redirect

**Fix:** Check browser console for errors in AuthProvider

### Issue: "Not authorized" message after sign-in

**Fix:** Update the admin email check in `dataStore.ts` line 208

### Issue: Can't see dashboard after sign-in

**Fix:** Ensure `onAuthStateChanged` is working:

```javascript
// In browser console
firebase.auth().currentUser; // Should show user object
```

---

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env.local` to Git
- `NEXT_PUBLIC_*` variables are exposed to the client (this is normal for Firebase API key)
- Firebase Security Rules will protect your data
- Only emails in the admin list get superadmin access

---

## Next Steps After Setup

1. ✅ Configure Firebase credentials
2. ✅ Set admin email in code
3. ✅ Test sign-in flow
4. ✅ Deploy admin app to production
5. ✅ Configure custom domain (`admin.royalcarriagelimo.com`)
6. ✅ Monitor auth errors in Firebase Console → Authentication

---

## Firebase Console Links

- **Project Settings:** https://console.firebase.google.com/project/royalcarriagelimoseo/settings/general
- **Authentication:** https://console.firebase.google.com/project/royalcarriagelimoseo/authentication
- **Firestore:** https://console.firebase.google.com/project/royalcarriagelimoseo/firestore

---

## ✅ Deployment Status

| Component           | Status        | Date         |
| ------------------- | ------------- | ------------ |
| Firebase Auth       | ✅ Deployed   | Jan 16, 2026 |
| Google OAuth        | ✅ Configured | Jan 16, 2026 |
| Email/Password Auth | ✅ Configured | Jan 16, 2026 |
| Custom Claims       | ✅ Syncing    | Jan 16, 2026 |
| Admin Dashboard     | ✅ Live       | Jan 16, 2026 |
| Firestore Rules     | ✅ Deployed   | Jan 16, 2026 |

**All systems operational and ready for production use.**

For current deployment status, see: [DEPLOYMENT_VERIFICATION_REPORT.md](DEPLOYMENT_VERIFICATION_REPORT.md)
