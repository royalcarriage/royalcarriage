# ⚡ Admin Dashboard Firebase Auth - Quick Start

## Current Status

- ✅ Google Popup Auth code: Ready
- ✅ Dashboard redirect logic: Ready
- ❌ Firebase credentials: **MISSING** ← This is what we're fixing

---

## 🎯 Your 5-Minute Setup

### Step 1: Get Firebase Web Config

```
1. Go to: https://console.firebase.google.com/project/royalcarriagelimoseo/settings/general
2. Scroll down to "Your apps" section
3. Find or create a Web app (icon: <>)
4. Click "Firebaseconfig" or copy the config object
5. You'll see: { apiKey, authDomain, projectId, ... }
```

### Step 2: Create .env.local File

Run this command to interactively set up:

```bash
node scripts/setup-firebase-env.js
```

OR manually create `/Users/admin/VSCODE/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=royalcarriagelimoseo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=royalcarriagelimoseo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=royalcarriagelimoseo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC...
```

### Step 3: Update Admin Email

Edit: `/Users/admin/VSCODE/apps/admin/src/lib/dataStore.ts` line 208

**Before:**

```typescript
role: user.email === "info@royalcarriagelimo.com" ? "superadmin" : "viewer",
```

**After (use YOUR email):**

```typescript
role: user.email === "YOUR_EMAIL@example.com" ? "superadmin" : "viewer",
```

### Step 4: Add Google to Firebase Auth

```
1. Go to: https://console.firebase.google.com/project/royalcarriagelimoseo/authentication/providers
2. Click "Google" → Enable
3. Add authorized domains:
   - admin.royalcarriagelimo.com
   - localhost (for development)
```

### Step 5: Test It

```bash
cd /Users/admin/VSCODE/apps/admin
npm run build
npm run dev
```

Then visit: http://localhost:3000

**Expected Flow:**

1. See login page
2. Click "Sign in with Google"
3. Google popup appears
4. Sign in with your Google account
5. Redirected to dashboard
6. See metrics and admin controls

---

## 🔍 What's Already Fixed

✅ **Google Popup Auth** - Uses `signInWithPopup` (not redirect)
✅ **Automatic Dashboard Redirect** - AuthProvider handles it
✅ **Role-Based Access** - Admin role grants full access
✅ **User Profile Auto-Create** - First sign-in creates profile
✅ **Domain Validation** - Only `admin.royalcarriagelimo.com` allowed

---

## ⚠️ Common Issues & Fixes

| Issue                          | Fix                                           |
| ------------------------------ | --------------------------------------------- |
| "Firebase config missing"      | Add `.env.local` with credentials             |
| Google popup doesn't appear    | Add domain to Firebase authorized domains     |
| Sign-in works but no redirect  | Check browser console for errors              |
| Access denied after sign-in    | Update admin email in `dataStore.ts` line 208 |
| Can't see metrics on dashboard | Ensure Firestore is configured in Firebase    |

---

## 📋 Checklist

- [ ] Firebase credentials copied from Console
- [ ] `.env.local` file created with values
- [ ] Admin email updated in `dataStore.ts`
- [ ] Google provider enabled in Firebase Auth
- [ ] localhost added to authorized domains
- [ ] Admin app rebuilt (`npm run build`)
- [ ] Test sign-in flow works
- [ ] Redirects to dashboard after sign-in
- [ ] Admin metrics visible

---

## 📞 Support

If you get stuck:

1. **Check .env.local exists:** `ls -la /Users/admin/VSCODE/.env.local`
2. **Check Firebase Console:** https://console.firebase.google.com/project/royalcarriagelimoseo
3. **Read detailed guide:** See `FIREBASE_AUTH_SETUP.md`
4. **Check browser console:** F12 → Console tab for errors

---

## 🚀 After Setup

Once authentication is working:

1. Deploy admin app to production
2. Connect custom domain: `admin.royalcarriagelimo.com`
3. Monitor auth in Firebase Console
4. Add more admin users as needed (update email list in code)

---

**Ready to set up? Start with Step 1! 👆**
