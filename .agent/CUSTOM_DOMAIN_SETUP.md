# CUSTOM DOMAIN SETUP GUIDE ✅
**For:** admin.royalcarriagelimo.com → Admin Dashboard
**Target:** https://royalcarriagelimoseo.web.app
**Status:** Ready for configuration

---

## OVERVIEW

This guide walks you through setting up the custom domain `admin.royalcarriagelimo.com` to point to your Royal Carriage Admin Dashboard currently running at `https://royalcarriagelimoseo.web.app`.

**Current Setup:**
- ✅ Admin Dashboard: https://royalcarriagelimoseo.web.app
- ✅ Firebase Hosting Site: royalcarriagelimoseo
- ✅ 415 files deployed
- ⏳ Custom Domain: Pending configuration

---

## STEP-BY-STEP SETUP INSTRUCTIONS

### Step 1: Verify Domain Ownership

Before Firebase can use your custom domain, you need to verify you own it.

**Your Domain:** `admin.royalcarriagelimo.com`
**Registrar:** (likely where royalcarriagelimo.com is registered)

### Step 2: Access Firebase Console

1. Go to Firebase Console
   - URL: https://console.firebase.google.com/project/royalcarriagelimoseo/hosting

2. Select **Hosting** from the left sidebar

3. Click on the **royalcarriagelimoseo** site

### Step 3: Add Custom Domain

1. Click **"Add custom domain"** button (or **"Connect domain"**)

2. Enter your domain: `admin.royalcarriagelimo.com`

3. Firebase will show you verification options

### Step 4: Verify Domain Ownership

Firebase provides two verification methods:

#### Option A: DNS TXT Record (Recommended)

Firebase will provide a TXT record like:
```
Domain: admin.royalcarriagelimo.com
Type: TXT
Value: firebase-verification=<unique-verification-code>
```

**To Add:**
1. Log into your domain registrar (e.g., GoDaddy, Namecheap, etc.)
2. Find DNS settings for royalcarriagelimo.com
3. Add a new TXT record with the details Firebase provides
4. Click "Verify" in Firebase Console

#### Option B: CNAME Record

If you prefer, you can use a CNAME record. Firebase will guide you through this.

### Step 5: Configure DNS Routing

Once verified, Firebase will show you DNS records to add:

#### Record Type 1: A Record
```
Name: admin.royalcarriagelimo.com
Type: A
Values: (Firebase will provide IP addresses, typically 2 A records)
```

#### Record Type 2: AAAA Record (IPv6)
```
Name: admin.royalcarriagelimo.com
Type: AAAA
Values: (Firebase will provide IPv6 addresses)
```

**Or alternatively:**

#### Record Type: CNAME Record
```
Name: admin.royalcarriagelimo.com
Type: CNAME
Value: royalcarriagelimoseo.web.app
```

### Step 6: Add DNS Records to Registrar

1. Log into your domain registrar
2. Find DNS Management/Settings
3. Add the records Firebase provided:
   - Add A records (or CNAME if using that method)
   - Add AAAA records for IPv6 (recommended)

4. Save changes

### Step 7: Wait for DNS Propagation

DNS changes can take 24-48 hours to propagate globally.

**During this time:**
- Your domain may not work immediately
- Different parts of the world may see different results
- This is normal and expected

### Step 8: Verify in Firebase Console

Once DNS records are added:

1. Return to Firebase Console Hosting page
2. Firebase will automatically verify the DNS records
3. Status will change to "Connected" when verification completes
4. This typically happens within 24 hours

---

## WHAT HAPPENS AFTER SETUP

Once `admin.royalcarriagelimo.com` is configured:

✅ **URL Routing**
- `https://admin.royalcarriagelimo.com/` → Admin Dashboard Login
- `https://admin.royalcarriagelimo.com/admin/` → Main Dashboard
- `https://admin.royalcarriagelimo.com/admin/analytics` → Analytics Section
- All admin pages accessible via the custom domain

✅ **SSL/TLS Certificate**
- Firebase automatically provisions an SSL certificate
- HTTPS enabled automatically
- Certificate auto-renews

✅ **CDN & Performance**
- Content served via Firebase's global CDN
- Fast loading times worldwide
- Automatic caching

---

## CURRENT FIREBASE CONFIGURATION

### Firebase Project
- **Project ID:** royalcarriagelimoseo
- **Project Number:** 910418192896
- **Region:** us-central1

### Hosting Site
- **Site ID:** royalcarriagelimoseo
- **Default URL:** https://royalcarriagelimoseo.web.app
- **Status:** Live and operational
- **Files Deployed:** 415

### Admin Dashboard
- **Framework:** Next.js
- **Build:** Static Export (SSG)
- **Features:** 40+ admin sections
- **Authentication:** Firebase Auth (Google + Email/Password)
- **Database:** Firestore with RBAC

---

## DOMAIN REGISTRAR INSTRUCTIONS

### For Different Registrars:

#### GoDaddy
1. Log in to GoDaddy account
2. Go to "My Domains"
3. Select "royalcarriagelimo.com"
4. Click "Manage DNS"
5. Add records provided by Firebase

#### Namecheap
1. Log in to Namecheap account
2. Go to "Domain List"
3. Click "Manage" for royalcarriagelimo.com
4. Click "Advanced DNS"
5. Add records provided by Firebase

#### Google Domains
1. Log in to Google Domains
2. Select "royalcarriagelimo.com"
3. Click "DNS" in the left sidebar
4. Scroll to "Custom records"
5. Add records provided by Firebase

#### Other Registrars
1. Log into your registrar's control panel
2. Find "DNS Management" or "DNS Settings"
3. Look for "Add Record" or "Add DNS Record"
4. Add the records Firebase provides
5. Save changes

---

## DNS RECORD EXAMPLES

### Example A: Using A & AAAA Records
```
admin.royalcarriagelimo.com  A      199.36.158.100
admin.royalcarriagelimo.com  A      199.36.158.101
admin.royalcarriagelimo.com  AAAA   2607:f8b0:4004:809::2001
admin.royalcarriagelimo.com  AAAA   2607:f8b0:4004:80a::2001
```

### Example B: Using CNAME Record
```
admin.royalcarriagelimo.com  CNAME  royalcarriagelimoseo.web.app
```

---

## TESTING YOUR SETUP

### Test 1: DNS Lookup
```bash
# Check if DNS is configured
nslookup admin.royalcarriagelimo.com

# Or with Google's DNS
dig admin.royalcarriagelimo.com @8.8.8.8
```

### Test 2: Browser Test
1. Open browser
2. Go to: `https://admin.royalcarriagelimo.com`
3. You should see the admin dashboard login page

### Test 3: SSL Certificate
1. Visit `https://admin.royalcarriagelimo.com`
2. Click the lock icon in address bar
3. Verify certificate is valid
4. Issuer should be "Google"

### Test 4: All Admin Pages
Once domain is working, test:
- `https://admin.royalcarriagelimo.com/admin/`
- `https://admin.royalcarriagelimo.com/admin/analytics`
- `https://admin.royalcarriagelimo.com/admin/drivers`
- `https://admin.royalcarriagelimo.com/admin/fleet`

---

## TROUBLESHOOTING

### Domain shows "Not Connected" in Firebase
- **Check:** DNS records are entered correctly
- **Fix:** Verify CNAME/A records match exactly what Firebase provided
- **Wait:** DNS can take up to 48 hours to propagate

### Browser shows "ERR_NAME_NOT_RESOLVED"
- **Check:** DNS hasn't propagated yet
- **Fix:** Wait 24-48 hours for DNS propagation
- **Alternative:** Use `nslookup` to check DNS status

### SSL Certificate Error
- **Check:** Domain has been verified and connected for 24+ hours
- **Fix:** Firebase will auto-provision SSL
- **Wait:** Certificate provisioning can take 24 hours

### Redirect Loop
- **Check:** No conflicting redirect rules
- **Fix:** Remove any conflicting redirects in firebase.json
- **Status:** Current config has safe redirect at /admin → /

---

## FIREBASE.JSON CONFIGURATION

Your current firebase.json is configured for the admin dashboard:

```json
{
  "hosting": [
    {
      "target": "admin",
      "public": "apps/admin/out",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "redirects": [
        {
          "source": "/admin",
          "destination": "/",
          "type": 301
        }
      ]
    }
  ]
}
```

**This configuration:**
- ✅ Points to correct build output: `apps/admin/out`
- ✅ Rewrites all routes to index.html (Next.js requirement)
- ✅ Redirects `/admin` to `/` for clean URLs
- ✅ Works with custom domains automatically

---

## SSL/TLS CERTIFICATE

### Firebase Managed SSL

Firebase automatically manages SSL certificates for custom domains:

- **Issuer:** Google
- **Validity:** 90 days (auto-renews)
- **Coverage:** admin.royalcarriagelimo.com
- **Protocols:** TLS 1.2+
- **Cipher Suites:** Modern, secure
- **Mixed Content:** Blocked (enforces HTTPS)

### No Manual Configuration Needed

Firebase handles all certificate management automatically. You don't need to:
- Generate CSR
- Purchase certificate
- Upload certificate
- Manage renewals

---

## AFTER SETUP COMPLETE

Once `admin.royalcarriagelimo.com` is live:

### Update Documentation
- Update any docs that reference the URL
- Update team members
- Update client/stakeholder info

### Update Links
- Update any bookmarks
- Update social media links
- Update email signatures
- Update documentation links

### Monitor Performance
- Check Firebase Console for traffic
- Monitor error rates
- Check analytics
- Review Firestore usage

### Optional: Redirect Old URL
To keep the old Firebase URL working while redirecting to custom domain, you could set up a secondary hosting site or use the existing URL alongside the custom domain. Both URLs can work simultaneously.

---

## SECURITY NOTES

✅ **Your Setup is Secure:**
- HTTPS enforced automatically
- SSL certificate auto-managed
- No sensitive data in source code
- Firebase security rules active
- Authentication required

⚠️ **Best Practices:**
- Only share custom domain with authorized users
- Monitor Firebase Console for unusual activity
- Keep API keys secure (they're not in source)
- Regularly review Firestore security rules
- Use strong passwords for Firebase Auth

---

## FIRESTORE & AUTH NOTES

### Authentication
Your admin dashboard uses Firebase Auth:
- Google Sign-In available
- Email/Password authentication available
- Multi-factor authentication ready (can be enabled)
- Session management active

### Authorization
RBAC enforced at Firestore level:
- **SuperAdmin:** Full access
- **Admin:** Most operations except role management
- **Editor:** Content and page management
- **Viewer:** Read-only access

### Data Protection
- All data encrypted in transit (TLS)
- Data encrypted at rest
- Firestore backup enabled (native)
- Audit logs track all changes

---

## QUICK REFERENCE

### Current Status
```
Admin Dashboard: https://royalcarriagelimoseo.web.app ✅ LIVE
Custom Domain:   admin.royalcarriagelimo.com ⏳ READY TO CONFIGURE
Firebase Site:   royalcarriagelimoseo
Project:         royalcarriagelimoseo
Region:          us-central1
```

### Configuration Checklist
- [ ] Access Firebase Console
- [ ] Select royalcarriagelimoseo hosting site
- [ ] Click "Add custom domain"
- [ ] Enter: admin.royalcarriagelimo.com
- [ ] Verify domain ownership (TXT record or CNAME)
- [ ] Add DNS records (A, AAAA, or CNAME)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Firebase verifies automatically
- [ ] SSL certificate provisioned
- [ ] Domain connected and working
- [ ] Test: https://admin.royalcarriagelimo.com
- [ ] All admin pages working

---

## SUPPORT & HELP

### Firebase Console
- **URL:** https://console.firebase.google.com/project/royalcarriagelimoseo/hosting
- **Help:** Click "?" icon in console
- **Docs:** https://firebase.google.com/docs/hosting/custom-domain

### Domain Registrar Support
- Contact your registrar's support if needed for DNS help
- Most have live chat or email support

### Common Resources
- Firebase Docs: https://firebase.google.com/docs
- Firebase Community: https://stackoverflow.com/questions/tagged/firebase
- Hosting Setup: https://firebase.google.com/docs/hosting

---

## COMPLETION STATUS

**Once This Setup is Complete:**

```
✅ Admin Dashboard Live         https://royalcarriagelimoseo.web.app
✅ Custom Domain Configured     https://admin.royalcarriagelimo.com
✅ SSL Certificate Active       HTTPS with auto-renewal
✅ Firestore Connected          Ready for data
✅ Firebase Auth Ready          Login working
✅ Analytics Tracking           GA4 active
✅ Admin Sections Ready         40+ sections available
✅ Performance Optimized        CDN serving content
✅ Security Enforced            RBAC and encryption
✅ Team Ready                   All systems go
```

---

**Setup Guide Created:** 2026-01-16 04:55 UTC
**Status:** Ready for implementation
**Next Step:** Follow the step-by-step instructions above in Firebase Console

