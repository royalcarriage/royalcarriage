# Quick Start Guide - Public Websites

## Immediate Deployment (5 minutes)

### 1. Deploy to Firebase

```bash
cd /Users/admin/gemini-workspace/repo
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy
```

### 2. Configure Custom Domains

In Firebase Console:

- Hosting > Domains
- Add: chicagoairportblackcar.com → airport target
- Add: chicagoexecutivecarservice.com → corporate target
- Add: chicagoweddingtransportation.com → wedding target
- Add: chicago-partybus.com → partybus target

### 3. Point DNS Records

Update your domain registrar to point to Firebase nameservers.

## Quick Configuration (15 minutes)

### Update Analytics IDs

File: `/public-sites/shared/js/analytics.js`

Replace placeholder IDs:

```javascript
// Line 18-29
if (window.location.hostname.includes("chicagoairportblackcar")) {
  measurementId = "G-AIRPORT123"; // Update this
}
// ... repeat for other domains
```

### Update Contact Phone Numbers

Search and replace in each domain's index.html:

- Airport: (773) 123-4567
- Corporate: (773) 555-0100
- Wedding: (773) 555-0200
- Party Bus: (773) 555-0300

## Testing Checklist (10 minutes)

```bash
# Test locally
firebase serve --port 8000

# Visit http://localhost:8000 and test:
☐ Mobile responsive (try different screen sizes)
☐ Navigation menu working
☐ Forms submitting (check browser console)
☐ Links working
☐ Images loading
☐ Analytics firing (check Network tab for gtag requests)
```

## Enable Content (20 minutes)

### Create Firestore Collection

1. Firebase Console > Firestore
2. Create collection: `ai_content`
3. Add sample documents:

```javascript
// Sample Blog Post
{
  type: 'blog_post',
  title: 'Sample Blog Post',
  excerpt: 'This is a sample post',
  content: 'Full content here...',
  category: 'Travel Tips',
  author: 'AI Content',
  created_at: new Date(),
  published: true,
  image_url: 'https://via.placeholder.com/400x300'
}

// Sample FAQ
{
  type: 'faq',
  question: 'How do I book?',
  answer: 'Click the booking button...',
  category: 'Booking',
  created_at: new Date(),
  published: true
}
```

## Verify Everything Works

```bash
# Check all pages load
curl -s https://chicagoairportblackcar.com | head -20
curl -s https://chicagoexecutivecarservice.com | head -20
curl -s https://chicagoweddingtransportation.com | head -20
curl -s https://chicago-partybus.com | head -20

# Test on mobile
- iPhone: https://chicagoairportblackcar.com
- Android: https://chicagoairportblackcar.com
- Tablet: https://chicagoairportblackcar.com
```

## Post-Launch Checklist

- [ ] All 4 domains live and accessible
- [ ] Mobile responsive verified
- [ ] Forms submitting to Firestore
- [ ] Analytics tracking (check real-time)
- [ ] Blog posts loading from Firestore
- [ ] Contact forms working
- [ ] Social sharing (test OG tags)
- [ ] Search Console submission
- [ ] Google Ads conversion tracking setup
- [ ] Monitor Lighthouse scores

## File Locations Reference

**Main Files:**

- `/public-sites/airport/index.html` - Airport homepage
- `/public-sites/corporate/index.html` - Corporate homepage
- `/public-sites/wedding/index.html` - Wedding homepage
- `/public-sites/party-bus/index.html` - Party Bus homepage

**Shared Resources:**

- `/public-sites/shared/css/base.css` - Main styles
- `/public-sites/shared/css/colors.css` - Color schemes
- `/public-sites/shared/css/responsive.css` - Mobile styles
- `/public-sites/shared/js/analytics.js` - GA4 setup
- `/public-sites/shared/js/forms.js` - Form handling
- `/public-sites/shared/js/ai-content-loader.js` - Dynamic content

**Documentation:**

- `/DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `/ANALYTICS_SETUP.md` - Analytics configuration
- `/AI_CONTENT_GUIDE.md` - Content integration guide
- `/firebase.json` - Firebase hosting config

## Common Tasks

### Add a New Blog Post

1. Go to Firestore Console
2. Add document to `ai_content` collection
3. Set `type: 'blog_post'`, `published: true`
4. Blog page auto-updates in 1-2 minutes

### Update Contact Information

Search files for phone numbers and update:

```
Airport: (773) 123-4567
Corporate: (773) 555-0100
Wedding: (773) 555-0200
Party Bus: (773) 555-0300
```

### Change Color Scheme

Edit `/public-sites/shared/css/colors.css`:

```css
:root.airport {
  --primary-color: #1a1a1a; /* Change this */
  --accent-color: #c9a961; /* Or this */
}
```

### Enable Conversion Tracking

1. Get Google Ads conversion IDs
2. Update `/public-sites/shared/js/forms.js`
3. Forms automatically track conversions

## Troubleshooting

**Forms not submitting:**

- Check Firestore enabled
- Verify security rules allow writes
- Check browser console for errors

**Analytics not tracking:**

- Verify measurement ID is correct
- Check GA4 account has property created
- Allow 1-2 hours for data to appear

**Content not loading:**

- Check Firestore collection exists
- Verify documents have `published: true`
- Refresh page (F5)

**Mobile not responsive:**

- Check viewport meta tag present
- Test in Chrome DevTools device mode
- Verify CSS loads (check Network tab)

## Next Steps

1. **Week 1:** Deploy, test, fix bugs
2. **Week 2:** Create initial content, launch advertising
3. **Week 3:** Monitor analytics, optimize CTAs
4. **Week 4:** Scale content, review performance

## Support Files

For detailed information, see:

- `DEPLOYMENT_GUIDE.md` - Complete setup
- `ANALYTICS_SETUP.md` - Analytics details
- `AI_CONTENT_GUIDE.md` - Content management
- `WEBSITES_SUMMARY.md` - Full project overview

---

Ready to launch? Contact DevOps for final deployment approval.
