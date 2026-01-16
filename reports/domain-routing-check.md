# Domain Routing and Redirects Check

What I checked:
- Hosting config in `firebase.json` (hosting entries and rewrites).
- Live responses from the domains using `curl -I`.

Findings:
- `firebase.json` hosting entries for all targets use `rewrites` to `index.html` and do not include host-based redirects. Rewrites are path-based and cannot conditionally redirect by hostname.
- Curl results (see raw files):
  - `https://royalcarriagelimoseo.web.app` -> HTTP/2 200 (see `reports/curl-webapp.txt`)
  - `https://royalcarriagelimoseo.firebaseapp.com` -> HTTP/2 200 (see `reports/curl-firebaseapp.txt`)
  - `https://admin.royalcarriagelimo.com` -> HTTP/2 200 (see `reports/curl-admin.txt`)

Conclusion:
- All three domains are reachable and returning the same site content (HTTP 200). There are no host-based redirects in `firebase.json`.

Options to make `admin.royalcarriagelimo.com` canonical:
1. Console / DNS approach (recommended, minimal code changes):
   - In Firebase Console -> Hosting -> Sites, attach `admin.royalcarriagelimo.com` as the custom domain for the `royalcarriagelimoseo` site and ensure it is verified and SSL is provisioned.
   - There is no Firebase Console toggle to automatically redirect the default `*.web.app` domain to your custom domain; use one of the other methods below if you require an HTTP redirect.

2. Implement host-aware redirect server-side (code change):
   - Add a Cloud Function (HTTP) or Cloud Run service that receives requests and issues a 301 redirect to `https://admin.royalcarriagelimo.com` when the `Host` header is `royalcarriagelimoseo.web.app` or `royalcarriagelimoseo.firebaseapp.com`. Then add a rewrite in `firebase.json` for `/` to that function for the `admin` target. Note: this replaces static serving for `/` and must be coordinated to still serve static `index.html` for admin domain.

3. Client-side noindex (simpler, non-redirect):
   - Detect host on client and, when host is not `admin.royalcarriagelimo.com`, inject `<meta name="robots" content="noindex">` to prevent search engines from indexing the default domains. `admin-home.html` currently contains `<meta name="robots" content="index, follow">`, so this would require a build change.

How to test locally (curl commands):

- Test default web.app domain headers:
  curl -I https://royalcarriagelimoseo.web.app

- Test default firebaseapp domain headers:
  curl -I https://royalcarriagelimoseo.firebaseapp.com

- Test admin custom domain headers:
  curl -I https://admin.royalcarriagelimo.com

Files with raw outputs:
- reports/curl-webapp.txt
- reports/curl-firebaseapp.txt
- reports/curl-admin.txt

Recommended minimal path to canonicalize admin URL:
- Attach and verify `admin.royalcarriagelimo.com` as the site's custom domain in the Firebase Console and provision SSL.
- Optionally implement Cloud Function host-aware redirects if you need automatic HTTP redirects from default domains to the custom admin domain (I can scaffold this if you want it implemented)."}