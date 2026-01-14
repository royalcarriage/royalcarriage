# Firebase Security Guide

**Project:** Chicago Airport Black Car Service  
**Firebase Project ID:** `royalcarriagelimoseo`  
**Last Updated:** January 14, 2026

## Table of Contents

1. [Security Overview](#security-overview)
2. [Hosting Security Best Practices](#hosting-security-best-practices)
3. [Environment Variable Management](#environment-variable-management)
4. [Secret Rotation Procedures](#secret-rotation-procedures)
5. [Access Control Setup](#access-control-setup)
6. [Security Headers Configuration](#security-headers-configuration)
7. [Monitoring and Auditing](#monitoring-and-auditing)
8. [Incident Response](#incident-response)

---

## Security Overview

This document outlines security best practices and procedures for the Firebase Hosting deployment of the Chicago Airport Black Car Service website.

### Security Principles

1. **Least Privilege**: Grant minimum necessary permissions
2. **Defense in Depth**: Multiple layers of security controls
3. **Secure by Default**: Security configurations enabled from the start
4. **Regular Audits**: Periodic security reviews and updates
5. **Incident Response**: Clear procedures for security incidents

### Threat Model

For a static hosting deployment, key security concerns include:

- **Credential Exposure**: Service account keys, API keys
- **Unauthorized Access**: Unauthorized deployments or modifications
- **Data Integrity**: Ensuring deployed content is authentic
- **Availability**: Preventing service disruption
- **Content Security**: Preventing XSS, clickjacking, and similar attacks

---

## Hosting Security Best Practices

### 1. HTTPS Only

Firebase Hosting enforces HTTPS by default. Never disable this.

**Verify HTTPS:**
```bash
curl -I https://your-domain.com | grep -i "strict-transport-security"
```

### 2. Security Headers

Security headers are configured in `firebase.json` to protect against common web vulnerabilities.

**Current Configuration:**

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}
```

**Header Explanations:**

- **`X-Content-Type-Options: nosniff`**: Prevents MIME type sniffing
- **`X-Frame-Options: DENY`**: Prevents clickjacking attacks
- **`X-XSS-Protection: 1; mode=block`**: Enables browser XSS protection
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Controls referrer information

**Optional Advanced Headers:**

Consider adding Content Security Policy (CSP) for additional protection:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebaseapp.com https://*.googleapis.com"
}
```

⚠️ **Warning**: CSP can break functionality if not configured correctly. Test thoroughly before deploying.

**Strict-Transport-Security (HSTS):**

```json
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}
```

### 3. Cache Control

Proper cache control prevents serving stale content and improves security:

```json
{
  "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "max-age=31536000"
    }
  ]
}
```

**Best Practices:**
- ✅ Long cache times for static assets (images, fonts)
- ✅ Short or no cache for HTML files
- ✅ Versioned filenames for cache busting

### 4. Clean URLs and Trailing Slashes

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

This prevents URL manipulation attacks and ensures consistent routing.

### 5. Input Validation

Although this is a static site, ensure any dynamic content or forms validate input:

- ✅ Sanitize user input before display
- ✅ Use CSP to prevent inline scripts
- ✅ Validate email addresses and phone numbers
- ✅ Rate limit form submissions

---

## Environment Variable Management

### Sensitive Data Classification

**Public Data** (OK in client bundle):
- Firebase Project ID
- Public API keys (with restrictions)
- Feature flags
- Public configuration

**Private Data** (NEVER in client):
- Service account credentials
- Database passwords
- API secrets
- Private keys

### Client-Side Environment Variables

Variables prefixed with `VITE_` are exposed to the browser:

```env
# OK for client
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=royalcarriagelimoseo

# WRONG - Never put secrets here!
VITE_DATABASE_PASSWORD=secret123  # ❌ NEVER DO THIS
```

### Protecting API Keys

Even public Firebase API keys should be restricted:

1. **Go to Google Cloud Console:**
   - Navigate to APIs & Services → Credentials
   - Find your API key

2. **Add Application Restrictions:**
   - HTTP referrers: `*.your-domain.com/*`, `localhost/*`

3. **Add API Restrictions:**
   - Only allow Firebase APIs needed

4. **Monitor Usage:**
   - Set up alerts for unusual activity

### Service Account Security

**Storage:**
- ✅ Store in GitHub Secrets (base64-encoded)
- ✅ Store in secure credential managers
- ❌ Never commit to git
- ❌ Never share via email/chat
- ❌ Never store in plain text

**Permissions:**
- ✅ Grant only necessary roles
- ✅ Use separate accounts for different environments
- ✅ Review permissions quarterly

**Example: Minimal Service Account Permissions**
```
Firebase Hosting Admin
Cloud Functions Deployer (if using functions)
```

### `.gitignore` Configuration

Ensure these patterns are in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log
*-firebase-adminsdk-*.json

# Service accounts
service-account*.json
*-service-account.json
credentials.json

# Secrets
secrets/
*.pem
*.key
```

### Checking for Committed Secrets

Scan repository for accidentally committed secrets:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
sudo apt-get install git-secrets  # Linux

# Setup
git secrets --install
git secrets --register-aws

# Scan
git secrets --scan-history
```

Or use GitHub's secret scanning (enabled by default for public repos).

---

## Secret Rotation Procedures

Regular secret rotation is critical for security.

### Rotation Schedule

| Credential Type | Rotation Frequency | Priority |
|----------------|-------------------|----------|
| Service Account Keys | Every 90 days | High |
| API Keys | Every 180 days | Medium |
| GitHub Tokens | Every 90 days | High |
| Database Passwords | Every 90 days | High |

### Service Account Key Rotation

**Step 1: Generate New Key**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the new JSON file
4. Base64 encode it:
   ```bash
   base64 -w 0 < new-service-account.json > encoded-key.txt
   ```

**Step 2: Update GitHub Secrets**

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Edit `FIREBASE_SERVICE_ACCOUNT`
3. Replace with new base64-encoded value
4. Click "Update secret"

**Step 3: Test New Key**

1. Trigger a deployment (push to a test branch)
2. Verify deployment succeeds
3. Check Firebase Console for successful deployment

**Step 4: Revoke Old Key**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Delete the old service account key
3. Verify new deployments still work

**Step 5: Document Rotation**

Update your security log:

```
Date: 2026-01-14
Action: Rotated Firebase service account key
Performed by: [Your Name]
Old key ID: xyz123 (revoked)
New key ID: abc456 (active)
```

### API Key Rotation

1. **Create new API key:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Click "Create credentials" → "API key"

2. **Apply restrictions:**
   - HTTP referrers restriction
   - API restrictions

3. **Update application:**
   - Update `.env.example` with new key ID (not value)
   - Update production environment variables
   - Redeploy application

4. **Test thoroughly:**
   - Verify all Firebase services work
   - Check for API errors in console

5. **Delete old key:**
   - Wait 24-48 hours for all deployments to use new key
   - Delete old key from Google Cloud Console

### GitHub Token Rotation

```bash
# Revoke old token
firebase logout

# Generate new token
firebase login:ci

# Update GitHub secret
# Go to GitHub repository settings and update FIREBASE_TOKEN
```

---

## Access Control Setup

### Firebase Project Permissions

**Recommended Role Structure:**

| Role | Permissions | Assigned To |
|------|------------|-------------|
| **Owner** | Full control | Project leads, senior developers |
| **Editor** | Deploy, modify settings | CI/CD service accounts, developers |
| **Viewer** | Read-only access | Stakeholders, support team |

**How to Manage:**

1. Go to Firebase Console → Project Settings
2. Click "Users and permissions"
3. Add users with appropriate roles
4. Review permissions quarterly

### GitHub Repository Permissions

**Branch Protection Rules:**

For the `main` branch:

1. **Require pull request reviews:** At least 1 approval
2. **Require status checks:** All CI checks must pass
3. **Require linear history:** Prevent merge commits
4. **Include administrators:** Enforce rules for all
5. **Restrict who can push:** Only maintainers

**How to Configure:**

1. Go to GitHub repository → Settings → Branches
2. Add rule for `main` branch
3. Enable required protections

### Service Account Permissions

**Principle of Least Privilege:**

Only grant permissions necessary for deployment:

```json
{
  "roles": [
    "roles/firebasehosting.admin"
  ]
}
```

**Avoid:**
- ❌ Project Owner role for service accounts
- ❌ Broad permissions like "Editor"
- ❌ Unused service accounts

**Review regularly:**
```bash
# List all service accounts
gcloud iam service-accounts list --project=royalcarriagelimoseo

# List permissions for a service account
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:*"
```

---

## Security Headers Configuration

### Current Security Headers

Our `firebase.json` includes these security headers:

```json
{
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Testing Security Headers

Use online tools to verify headers are set correctly:

**SecurityHeaders.com:**
```bash
# Visit
https://securityheaders.com/?q=https://your-domain.com
```

**Manual Testing:**
```bash
curl -I https://your-domain.com | grep -E "X-|Content-Security|Referrer"
```

### Recommended Additional Headers

#### 1. Permissions-Policy

Control browser features:

```json
{
  "key": "Permissions-Policy",
  "value": "geolocation=(), microphone=(), camera=()"
}
```

#### 2. Content-Security-Policy

Prevent XSS and injection attacks:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
}
```

⚠️ Test thoroughly - CSP can break functionality!

### Security Header Checklist

- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Content-Security-Policy (optional, needs testing)
- [ ] Permissions-Policy (optional)
- [ ] Strict-Transport-Security (auto-added by Firebase)

---

## Monitoring and Auditing

### Firebase Console Monitoring

Regularly review:

1. **Deployment History:**
   - Firebase Console → Hosting → Release history
   - Verify all deployments are authorized

2. **Usage Metrics:**
   - Monitor bandwidth usage
   - Check for unusual traffic patterns

3. **Error Logs:**
   - Review 404 errors
   - Investigate suspicious requests

### GitHub Actions Logs

Monitor CI/CD pipeline:

1. **Workflow Runs:**
   - Check all deployments succeed
   - Review failed deployments

2. **Secret Access:**
   - Monitor when secrets are accessed
   - Verify all accesses are from authorized workflows

### Audit Log

Maintain a security audit log:

```markdown
# Security Audit Log

## 2026-01-14
- Rotated Firebase service account key
- Reviewed project permissions
- Updated security headers

## 2026-01-01
- Quarterly access review completed
- Removed 2 inactive users from Firebase project
- Verified GitHub branch protection rules
```

### Automated Monitoring

Set up alerts for:

- **Failed Deployments:** GitHub Actions notifications
- **Unusual Traffic:** Firebase Hosting usage alerts
- **API Key Usage:** Google Cloud Console quota alerts
- **Service Account Activity:** Cloud Audit Logs

### Security Scanning

Regularly run security scans:

```bash
# Check for vulnerabilities in dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

---

## Incident Response

### Security Incident Types

1. **Credential Compromise**: Service account key, API key leaked
2. **Unauthorized Deployment**: Unauthorized code deployed
3. **Data Breach**: Sensitive data exposed
4. **Service Disruption**: Site unavailable or defaced

### Incident Response Plan

#### Phase 1: Detection & Assessment

1. **Identify the incident:**
   - What was compromised?
   - How was it discovered?
   - What is the scope?

2. **Assess severity:**
   - **Critical**: Active exploit, data breach
   - **High**: Credential compromise
   - **Medium**: Configuration issue
   - **Low**: Minor security gap

#### Phase 2: Containment

**For Credential Compromise:**

1. **Immediately revoke compromised credentials:**
   ```bash
   # Revoke Firebase service account
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=SERVICE_ACCOUNT_EMAIL
   ```

2. **Generate new credentials:**
   - Follow rotation procedures above

3. **Review access logs:**
   - Check for unauthorized access
   - Identify affected systems

**For Unauthorized Deployment:**

1. **Rollback immediately:**
   - Firebase Console → Hosting → Release history → Rollback

2. **Revoke access:**
   - Remove compromised user from Firebase project
   - Rotate service account keys

3. **Review code:**
   - Inspect deployed code for malicious changes
   - Run security scans

#### Phase 3: Eradication

1. **Remove threat:**
   - Delete malicious code
   - Patch vulnerabilities
   - Update dependencies

2. **Verify security:**
   - Run security scans
   - Test authentication

3. **Update configurations:**
   - Strengthen security settings
   - Update access controls

#### Phase 4: Recovery

1. **Deploy clean code:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

2. **Verify functionality:**
   - Test all routes
   - Check for errors
   - Monitor logs

3. **Communicate:**
   - Notify stakeholders
   - Update status page if applicable

#### Phase 5: Post-Incident

1. **Document incident:**
   - What happened
   - How it was resolved
   - Lessons learned

2. **Update procedures:**
   - Improve monitoring
   - Strengthen controls
   - Train team

3. **Follow-up:**
   - Verify no residual issues
   - Schedule security review

### Emergency Contacts

Maintain a list of contacts for security incidents:

```markdown
# Security Contacts

- **Security Lead**: [Name] - [Email] - [Phone]
- **Firebase Admin**: [Name] - [Email]
- **GitHub Admin**: [Name] - [Email]
- **On-Call Developer**: [Rotation Schedule]
```

### Incident Report Template

```markdown
# Security Incident Report

**Date**: YYYY-MM-DD
**Reported By**: [Name]
**Severity**: [Critical/High/Medium/Low]

## Summary
[Brief description of the incident]

## Timeline
- HH:MM - Incident detected
- HH:MM - Initial response
- HH:MM - Containment
- HH:MM - Resolution

## Impact
[What was affected]

## Root Cause
[Why it happened]

## Resolution
[How it was fixed]

## Prevention
[Steps to prevent recurrence]

## Follow-up Actions
- [ ] Action item 1
- [ ] Action item 2
```

---

## Security Checklist

Use this checklist for regular security reviews:

### Monthly

- [ ] Review Firebase deployment history
- [ ] Check GitHub Actions logs
- [ ] Monitor Firebase usage metrics
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review access logs

### Quarterly

- [ ] Rotate service account keys
- [ ] Review user permissions in Firebase Console
- [ ] Review GitHub repository access
- [ ] Update security documentation
- [ ] Run security header scan
- [ ] Review branch protection rules

### Annually

- [ ] Complete security audit
- [ ] Review and update security policies
- [ ] Conduct security training
- [ ] Test incident response plan
- [ ] Review third-party dependencies

---

## Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/support/guides/security-checklist)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

## Support

For security concerns:

- **Email:** security@[your-domain].com
- **GitHub Security Advisory:** Use private security advisory feature
- **Urgent Issues:** Contact on-call developer immediately

---

**Last Updated:** January 14, 2026  
**Maintained By:** Security Team  
**Next Review:** April 14, 2026
