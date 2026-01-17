# Firebase Auth Domain Fix

**Goal:** Ensure Google Auth works for the admin dashboard on `admin.royalcarriagelimo.com` and Firebase defaults.

## Authorized domains checklist (Firebase Console)

1. Go to **Firebase Console → royalcarriagelimoseo → Authentication → Settings → Authorized domains**.
2. Add/verify the following domains:
   - `admin.royalcarriagelimo.com`
   - `royalcarriagelimoseo.web.app`
   - `royalcarriagelimoseo.firebaseapp.com`
   - `localhost`
3. Save changes.

## OAuth provider

1. In **Authentication → Sign-in method**, ensure **Google** provider is enabled.
2. No custom redirect URIs needed for the client SDK; defaults are fine for popup flow.

## Hosting alignment

- `firebase.json` admin target points to `apps/admin/out`.
- `.firebaserc` maps hosting target `admin` → site `royalcarriagelimoseo`.
- DNS: `admin.royalcarriagelimo.com` CNAME to `royalcarriagelimoseo.web.app` (verified).
