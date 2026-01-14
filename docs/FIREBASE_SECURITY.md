# Firebase Security Best Practices

**Repository:** royalcarriage/royalcarriage  
**Last Updated:** January 14, 2026  
**Version:** 1.0

---

## Overview

This document outlines security best practices for the Firebase Hosting configuration and deployment processes for the Royal Carriage / Chicago Airport Black Car website.

---

## Table of Contents

1. [Authentication & Access Control](#authentication--access-control)
2. [Service Account Security](#service-account-security)
3. [Secret Management](#secret-management)
4. [Security Headers](#security-headers)
5. [HTTPS & SSL](#https--ssl)
6. [Content Security](#content-security)
7. [Monitoring & Auditing](#monitoring--auditing)
8. [Incident Response](#incident-response)

---

## Authentication & Access Control

### Firebase Project Access

**Principle of Least Privilege:**
- Limit number of users with Owner role
- Use Editor role for developers who need deployment access
- Use Viewer role for monitoring/read-only access

**Current Recommended Roles:**

| Role | Access Level | Permissions | Use For |
|------|-------------|-------------|---------|
| Owner | Full access | All operations | Project admins only |
| Editor | Write access | Deploy, configure | CI/CD, developers |
| Viewer | Read-only | View console | Stakeholders, QA |

**Action Items:**
1. Review current Firebase project members
2. Remove inactive users
3. Ensure proper role assignment
4. Document access in team wiki

### GitHub Repository Access

**Branch Protection Rules:**

```yaml
main branch:
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date
  - Include administrators
  - Restrict who can push
```

**Required Status Checks:**
- Build job must pass
- TypeScript check must pass
- Smoke tests must pass

**Action:**
- Configure in: Repository Settings → Branches → Branch protection rules

---

## Service Account Security

### Service Account Key Management

**Best Practices:**

1. **Generation:**
   - Generate service account with minimal required permissions
   - Use Firebase Hosting Admin role only
   - Document key creation date

2. **Storage:**
   - ✅ Store in GitHub Secrets (encrypted)
   - ❌ Never commit to repository
   - ❌ Never share via email/Slack
   - ❌ Never store in plaintext files

3. **Rotation:**
   - Rotate every 90 days minimum
   - Rotate immediately if compromised
   - Rotate when team members leave

### Service Account Rotation Procedure

```bash
# Step 1: Generate new service account
# In Firebase Console → Project Settings → Service Accounts
# Click "Generate New Private Key"

# Step 2: Base64 encode the JSON
base64 -w 0 < service-account-key.json > service-account-base64.txt

# Step 3: Update GitHub Secret
# Go to: Repository Settings → Secrets and variables → Actions
# Update: FIREBASE_SERVICE_ACCOUNT

# Step 4: Test deployment
# Open a test PR or manually trigger workflow

# Step 5: Revoke old service account
# In Firebase Console → IAM & Admin → Service Accounts
# Find old service account and delete

# Step 6: Securely delete local files
shred -u service-account-key.json service-account-base64.txt
```

**Rotation Schedule:**
- **Mandatory:** Every 90 days
- **Emergency:** Immediately upon suspected compromise
- **Team Changes:** When engineer with access leaves

---

## Secret Management

### GitHub Secrets

**Current Secrets:**

| Secret Name | Purpose | Rotation Period | Last Rotated |
|-------------|---------|-----------------|--------------|
| FIREBASE_SERVICE_ACCOUNT | Firebase deployment auth | 90 days | TBD |
| FIREBASE_PROJECT_ID | Firebase project identifier | Never (unless project changes) | N/A |

**Secret Security:**
- ✅ Encrypted at rest by GitHub
- ✅ Only accessible during workflow runs
- ✅ Not exposed in logs
- ✅ Require write access to modify

### Environment Variables

**Development (.env):**
```bash
# .env file (gitignored)
NODE_ENV=development
PORT=5000
# Add other non-sensitive configs
```

**Production:**
- ✅ Build-time environment variables compiled into bundle
- ✅ No runtime secrets needed (static hosting)
- ⚠️ Never include API keys in client bundle

### Secrets Audit Checklist

Run this monthly:

- [ ] Review all GitHub Secrets
- [ ] Verify rotation dates
- [ ] Check for unused secrets
- [ ] Scan code for hardcoded secrets
- [ ] Review .gitignore for sensitive files
- [ ] Verify .env files not committed

---

## Security Headers

### Current Implementation

**File:** `firebase.json`

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
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), microphone=(), camera=()"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
          }
        ]
      }
    ]
  }
}
```

### Header Explanations

| Header | Purpose | Impact |
|--------|---------|--------|
| X-Content-Type-Options | Prevent MIME sniffing | Prevents browser from interpreting files as different type |
| X-Frame-Options | Prevent clickjacking | Blocks site from being embedded in iframe |
| X-XSS-Protection | Enable XSS filter | Browser's built-in XSS protection |
| Referrer-Policy | Control referrer info | Limits referrer information sent |
| Permissions-Policy | Restrict browser features | Blocks unnecessary APIs |
| Content-Security-Policy | Control resource loading | Prevents XSS and injection attacks |

### CSP Policy Notes

**Current Policy:**
- `default-src 'self'`: Only load resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Allow inline scripts (required for React)
- `style-src 'self' 'unsafe-inline'`: Allow inline styles (required for Tailwind)
- `img-src 'self' data: https:`: Allow images from any HTTPS source
- `font-src 'self' data:`: Allow fonts from same origin or data URLs
- `connect-src 'self'`: Only allow API calls to same origin

**⚠️ Note:** `'unsafe-inline'` and `'unsafe-eval'` reduce CSP effectiveness but are required for React/Vite builds. Consider using nonces in future for stricter CSP.

### Testing Security Headers

```bash
# Test headers with curl
curl -I https://chicagoairportblackcar.com

# Test with security headers analyzer
# https://securityheaders.com
```

---

## HTTPS & SSL

### Current Configuration

**Status:** ✅ AUTOMATIC

**Features:**
- Free SSL certificate from Firebase Hosting
- Automatic renewal
- Forced HTTPS (all HTTP redirected to HTTPS)
- TLS 1.2 and 1.3 support
- Modern cipher suites

### Custom Domain SSL

**When adding custom domain:**

1. Add domain in Firebase Console
2. Firebase generates SSL certificate automatically
3. Update DNS records as instructed
4. Wait for SSL provisioning (5 minutes - 24 hours)
5. Verify HTTPS works

**SSL Certificate Details:**
- Provider: Let's Encrypt (via Firebase)
- Renewal: Automatic
- Cost: Free
- Validity: 90 days (auto-renewed)

### Force HTTPS

Firebase Hosting automatically forces HTTPS. No configuration needed.

**Verification:**
```bash
# Try HTTP, should redirect to HTTPS
curl -I http://chicagoairportblackcar.com
# Should return 301/302 to https://
```

---

## Content Security

### Input Validation

**Current Status:** N/A (static site, no user input stored)

**If Adding Forms:**
- ✅ Validate on client and server
- ✅ Sanitize all inputs
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Add CAPTCHA for contact forms

### XSS Prevention

**React's Built-in Protection:**
- React escapes all rendered values by default
- JSX prevents XSS attacks
- Don't use `dangerouslySetInnerHTML` without sanitization

**If Using `dangerouslySetInnerHTML`:**
```javascript
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
```

### Dependency Security

**Automated Scanning:**
```bash
# Run npm audit regularly
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force
```

**Dependabot:**
- ✅ Enabled on GitHub
- ✅ Automatic PR creation for updates
- ✅ Security patches prioritized

---

## Monitoring & Auditing

### Regular Security Audits

**Monthly:**
- [ ] Run npm audit
- [ ] Review Firebase project members
- [ ] Check GitHub Actions logs for anomalies
- [ ] Review deployment history
- [ ] Test security headers
- [ ] Scan for exposed secrets

**Quarterly:**
- [ ] Rotate service account keys
- [ ] Review and update security policies
- [ ] Conduct security training
- [ ] Update security documentation
- [ ] Penetration testing (if applicable)

**Annually:**
- [ ] Comprehensive security audit
- [ ] Review incident response procedures
- [ ] Update security best practices
- [ ] Assess new security tools/features

### Logging and Monitoring

**Firebase Hosting Logs:**
- Access via Firebase Console
- Monitor for unusual traffic patterns
- Check error rates
- Review geographic distribution

**GitHub Actions Logs:**
- Monitor for failed authentications
- Check for unusual deployment patterns
- Review workflow modifications

### Security Alerts

**Set up alerts for:**
1. Failed deployments
2. npm audit findings
3. Dependabot security updates
4. Unusual Firebase traffic
5. Service account changes

---

## Incident Response

### Security Incident Procedure

**1. Detection**
- Security vulnerability reported
- Suspicious activity detected
- Credential compromise suspected

**2. Immediate Actions**
- Assess severity (Critical/High/Medium/Low)
- Notify security team
- Document incident details

**3. Containment**

**For Credential Compromise:**
```bash
# Immediately rotate compromised credentials
# 1. Generate new service account
# 2. Update GitHub secret
# 3. Revoke old service account
# 4. Review recent deployments
# 5. Check for unauthorized changes
```

**For Vulnerability:**
```bash
# 1. Assess impact
# 2. Apply security patch
# 3. Run tests
# 4. Deploy fix immediately
# 5. Verify fix deployed
```

**4. Investigation**
- Determine root cause
- Identify affected systems
- Check for data exposure
- Review logs for extent of breach

**5. Recovery**
- Apply permanent fixes
- Restore from backups if needed
- Deploy secure version
- Verify system integrity

**6. Post-Incident**
- Document lessons learned
- Update security procedures
- Conduct team training
- Implement preventive measures

### Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **Critical** | Active exploit, data breach | Immediate | Service account compromised |
| **High** | Exploitable vulnerability | < 4 hours | Critical npm package vulnerability |
| **Medium** | Potential vulnerability | < 24 hours | Security header missing |
| **Low** | Minor security concern | < 1 week | Outdated dependency (no exploit) |

### Contact Information

**Security Team:**
- Primary: [Security Lead Email]
- Secondary: [Engineering Manager Email]
- On-call: [On-call Engineer]

**External Resources:**
- Firebase Support: https://firebase.google.com/support/contact
- GitHub Security: https://docs.github.com/en/code-security

---

## Security Checklist

### Pre-Deployment Security Check

- [ ] npm audit shows no vulnerabilities
- [ ] No hardcoded secrets in code
- [ ] Security headers configured in firebase.json
- [ ] HTTPS enforced (automatic with Firebase)
- [ ] Service account has minimal permissions
- [ ] GitHub secrets are up to date
- [ ] Branch protection rules enabled
- [ ] .gitignore includes .env files
- [ ] Dependencies are up to date

### Post-Deployment Security Verification

- [ ] Test security headers present
- [ ] Verify HTTPS working
- [ ] Check for XSS vulnerabilities
- [ ] Test CSP not blocking legitimate resources
- [ ] Verify no sensitive data exposed
- [ ] Check error messages don't reveal system info

---

## Compliance & Standards

### Industry Standards

Following:
- **OWASP Top 10** - Web application security risks
- **CWE Top 25** - Most dangerous software weaknesses
- **HTTPS-Only** - All traffic encrypted

### Recommended Tools

- **Security Headers Check:** https://securityheaders.com
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/
- **OWASP ZAP:** Web application security scanner
- **npm audit:** Dependency vulnerability scanner
- **Snyk:** Continuous security monitoring

---

## Future Enhancements

### Recommended Security Additions

1. **Firebase App Check**
   - Protect against abuse
   - Bot detection
   - API call authentication

2. **Web Application Firewall (WAF)**
   - DDoS protection
   - Bot mitigation
   - Rate limiting

3. **Security Monitoring**
   - Real-time threat detection
   - Automated incident response
   - Security analytics

4. **Stronger CSP**
   - Use nonces for inline scripts
   - Remove 'unsafe-inline' and 'unsafe-eval'
   - Requires build process changes

---

## Resources

### Documentation
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Security Guidelines](https://owasp.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Training
- [OWASP Top 10 Training](https://owasp.org/www-project-top-ten/)
- [Firebase Security Course](https://firebase.google.com/docs/security)

---

## Changelog

### Version 1.0 - January 14, 2026
- Initial security best practices document
- Service account rotation procedures
- Security headers implementation
- Incident response procedures
- Security monitoring guidelines

---

**Next Review:** April 14, 2026  
**Maintained By:** Security Team / Development Team  
**Status:** Active
