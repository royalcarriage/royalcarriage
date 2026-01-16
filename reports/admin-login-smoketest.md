# Admin Login Smoke Test

Goal: Verify `admin.royalcarriagelimo.com` loads and that login UI does not show an "unauthorized domain" Firebase Auth error.

What I ran:
- `curl -I https://admin.royalcarriagelimo.com` -> headers saved to `reports/curl-admin.txt` (HTTP/2 200)
- `curl -L https://admin.royalcarriagelimo.com` -> first 200 lines saved to `reports/admin-home.html`
- Simple grep for login/sign-in keywords in the saved HTML -> `reports/admin-login-elements.txt` (empty)

Results:
- Domain reachable: PASS (HTTP/2 200).
- No Firebase "unauthorized domain" banner detected in the first 200 lines of HTML.
- The saved admin HTML contains a canonical meta tag pointing to `https://admin.royalcarriagelimo.com/` and `meta name="robots" content="index, follow"`.
- No explicit Firebase Auth initialization found in the admin static HTML, which is consistent with Passport-based auth.

Interpretation:
- The admin site is reachable and serves the expected admin dashboard HTML.
- Because the admin app appears to use Passport local auth, there is no Firebase Auth domain restriction to fix for admin logins.

Manual verification steps (to fully validate login):
1. Open a browser to https://admin.royalcarriagelimo.com
2. Try logging in with a known admin username/password (Passport-based). Confirm you can access admin-only pages.
3. If login fails due to session or CORS issues, check server logs and ensure the server's session cookie domain is correct for `admin.royalcarriagelimo.com`.

If you want an automated smoke test I can add a minimal Playwright script that:
- Loads `https://admin.royalcarriagelimo.com`
- Asserts the page loads
- (Optional) Posts a form to the Passport login endpoint using provided test credentials and confirms a redirect to a protected admin page.

Note: I did not attempt to log in using credentials (none provided). Manual login validation is required to confirm end-to-end admin authentication."}