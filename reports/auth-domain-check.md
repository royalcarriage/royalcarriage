# Firebase Auth Domain Check

Summary:
- I searched the repo for Firebase Auth usage. The `admin` app (served from the `admin` hosting target) does not appear to include Firebase Auth initialization (no `authDomain` or `getAuth` references found under `apps/admin`).
- There are Firebase Auth references in other built artifacts (e.g. `apps/partybus/dist/blog/index.html` includes an `authDomain: 'royalcarriagelimoseo.firebaseapp.com'` snippet). This indicates some other apps use Firebase Auth, but the admin app likely uses Passport local strategy as you reported.

Implications for admin login:
- If the admin app uses Passport (local username/password) and not Firebase Auth, you do not need to add `admin.royalcarriagelimo.com` to Firebase Authentication Authorized Domains for admin login to work.
- If you plan to migrate or add Firebase Auth (Google Sign-In or email/password) for the admin app, you must add the following authorized domains in the Firebase Console -> Authentication -> Settings -> Authorized domains:
  - admin.royalcarriagelimo.com
  - royalcarriagelimoseo.web.app
  - royalcarriagelimoseo.firebaseapp.com

Google provider specific notes (if you enable Google Sign-In):
- In Google Cloud Console -> APIs & Services -> Credentials, ensure the OAuth client ID authorized redirect URIs include `https://admin.royalcarriagelimo.com/` (or the exact auth callback path your app uses).

Exact manual console steps to add authorized domains:
1. Open https://console.firebase.google.com
2. Select project `royalcarriagelimoseo`.
3. Navigate to Authentication -> Sign-in method -> Authorized domains.
4. Click "Add domain" and add `admin.royalcarriagelimo.com`, then `royalcarriagelimoseo.web.app`, and `royalcarriagelimoseo.firebaseapp.com` if needed.

If you want, I can:
- Add the exact Console / Cloud steps for creating OAuth redirect entries, or
- Implement a migration plan to add Firebase Auth (Google) to the `admin` app — tell me which and I will add it to the todo list."}```}{