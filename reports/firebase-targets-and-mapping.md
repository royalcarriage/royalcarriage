# Firebase Hosting Targets and Mapping

Source files consulted:
- firebase.json
- .firebaserc
- CLI output: /reports/firebase-targets.txt

Summary of hosting targets (from `firebase.json`):

- admin
  - public: dist/public
  - rewrites: all -> /index.html
- airport
  - public: dist/public
  - rewrites: all -> /index.html
- executive
  - public: dist/public
  - rewrites: all -> /index.html
- wedding
  - public: dist/public
  - rewrites: all -> /index.html
- partybus
  - public: dist/public
  - rewrites: all -> /index.html
- packages-firebase
  - public: packages/firebase
  - rewrites: all -> /index.html

Mapping to hosting site IDs (from `.firebaserc` targets):

- admin -> site `royalcarriagelimoseo` (this is the main project site)
- airport -> site `chicagoairportblackcar`
- executive -> site `chicagoexecutivecarservice`
- wedding -> site `chicagoweddingtransportation`
- partybus -> site `chicagopartybus`
- packages-firebase -> site `YOUR_HOSTING_SITE_ID` (placeholder)

Default domains for the `royalcarriagelimoseo` site (Firebase-managed):
- https://royalcarriagelimoseo.web.app
- https://royalcarriagelimoseo.firebaseapp.com

Notes:
- Deploy commands should reference the hosting targets, e.g. `firebase deploy --only hosting:admin --project royalcarriagelimoseo`.
- The `admin` target deploys to the `royalcarriagelimoseo` site; the default site domains above are the ones that will serve that content unless a custom domain (admin.royalcarriagelimo.com) is attached to that site in the Firebase Console.

See raw CLI output: [reports/firebase-targets.txt](reports/firebase-targets.txt)

Recommended next steps (manual/console):
- Verify in Firebase Console -> Hosting -> Sites that the custom domain `admin.royalcarriagelimo.com` is attached to the `royalcarriagelimoseo` site and is marked as connected/SSL-provisioned.
- If you want the default `.web.app`/.firebaseapp.com domains to redirect to the custom admin domain, choose one of:
  - Configure a host-aware redirect at runtime (Cloud Function or App Hosting middleware) that checks `Host` and issues 301 to `https://admin.royalcarriagelimo.com` for default hosts; OR
  - Serve a noindex meta tag on default domains (client-side) to avoid SEO duplication (requires app change)."}