# Admin User Guide - AI Image Generation

**For:** Admin Dashboard Users  
**Version:** 1.0  
**Last Updated:** January 15, 2026

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
3. [Generating Images](#generating-images)
4. [Understanding Costs](#understanding-costs)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Getting Started

### What is AI Image Generation?

The AI Image Generation feature allows you to create professional, high-quality images for the Royal Carriage website using Google's Vertex AI Imagen technology. Instead of searching for stock photos or hiring photographers, you can generate custom images on-demand.

### What can you create?

- **Hero Images** - Large banner images for homepage and key pages
- **Service Cards** - Images for service offerings
- **Fleet Images** - Professional vehicle photography
- **Location Images** - Images featuring specific Chicago locations
- **Testimonial Images** - Customer-focused imagery

### Benefits

✅ **Custom Content** - Images tailored to your specific needs  
✅ **Fast Generation** - Images ready in 10-30 seconds  
✅ **Cost Effective** - ~$0.02-0.04 per image  
✅ **Consistent Quality** - Professional results every time  
✅ **No Licensing Issues** - Full rights to use generated images

---

## Accessing the Admin Dashboard

### Step 1: Navigate to Dashboard

1. Open your web browser
2. Go to: `https://royalcarriagelimoseo.web.app/admin`
3. You will be redirected to the login page if not already logged in

### Step 2: Login

1. Enter your admin username
2. Enter your admin password
3. Click "Login"

**Security Note:** Admin credentials should never be shared. If you've forgotten your password, contact the development team.

### Step 3: Navigate to Images Tab

1. Once logged in, you'll see the admin dashboard
2. Click on the "Images" tab in the navigation menu
3. You should see the AI Image Generation interface

---

## Generating Images

### Quick Start

1. **Select Purpose** - Choose what type of image you need
2. **Enter Details** - Provide location, vehicle, or style information
3. **Click Generate** - Wait 10-30 seconds for the image
4. **Review Result** - Evaluate the generated image
5. **Save or Regenerate** - Keep the image or try again

### Detailed Instructions

#### Step 1: Choose Image Purpose

Select from the dropdown menu:

- **Hero** - Large banner images (1920x1080)
  - Best for: Homepage, landing pages
  - Example: Black sedan at O'Hare Airport at night

- **Service Card** - Medium-sized service images (600x400)
  - Best for: Service offerings, features
  - Example: Luxury SUV in downtown Chicago

- **Fleet** - Vehicle showcase images (800x600)
  - Best for: Fleet page, vehicle listings
  - Example: Stretch limousine with studio lighting

- **Location** - Location-specific images (1200x800)
  - Best for: Service area pages
  - Example: Midway Airport with limousine

- **Testimonial** - Customer-focused images (400x400)
  - Best for: Reviews, testimonials
  - Example: Professional chauffeur assisting customer

#### Step 2: Provide Details

**Location (Optional but Recommended)**
- Enter specific Chicago locations for better results
- Examples:
  - "Chicago O'Hare International Airport"
  - "Downtown Chicago on Michigan Avenue"
  - "Midway Airport"
  - "Navy Pier"
  - "Willis Tower"

**Vehicle (Optional but Recommended)**
- Specify the type of vehicle
- Examples:
  - "Black Sedan"
  - "Luxury SUV"
  - "Stretch Limousine"
  - "Executive Van"

**Style (Optional)**
- Add style preferences
- Examples:
  - "Professional, nighttime, dramatic lighting"
  - "Daytime, sunny, clean modern"
  - "Evening, golden hour"
  - "Studio photography, black background"

**Description (Optional)**
- Add any additional details
- Keep it under 200 characters

#### Step 3: Generate Image

1. Click the "Generate Image" button
2. Wait for the generation process (10-30 seconds)
3. You'll see a loading indicator
4. Once complete, the image will appear

**Note:** You can only generate 50 images per day per admin account. This limit resets at midnight.

#### Step 4: Review Generated Image

Evaluate the image for:

- **Quality** - Is it professional and high-resolution?
- **Relevance** - Does it match your requirements?
- **Composition** - Is the framing and layout good?
- **Branding** - Does it fit Royal Carriage brand?

#### Step 5: Save or Regenerate

**If the image is good:**
1. Right-click on the image
2. Select "Save image as..."
3. Save to your desired location
4. Note the image URL from Firestore for future reference

**If you want to try again:**
1. Modify your prompt details
2. Click "Generate Image" again
3. Compare the new result

**Tips for Better Results:**
- Be specific in your descriptions
- Include time of day (daytime, evening, night)
- Mention lighting preferences
- Specify exact locations when possible
- Try multiple variations

---

## Understanding Costs

### Cost Per Image

- **Standard Quality:** ~$0.020 per image
- **HD Quality:** ~$0.040 per image (if enabled)

### Daily Limits

- **Maximum:** 50 images per admin per day
- **Resets:** Midnight Central Time
- **Purpose:** Cost control and preventing abuse

### Monthly Budget

- **Allocated:** $20/month for the system
- **Light Usage (50/month):** ~$1-2
- **Medium Usage (200/month):** ~$4-8
- **Heavy Usage (1000/month):** ~$20-40

### Monitoring Your Usage

1. Go to the "Analytics" tab in admin dashboard
2. View "Image Generation Statistics"
3. See:
   - Images generated today
   - Images generated this month
   - Estimated cost
   - Remaining daily quota

### Cost Alerts

You'll receive email notifications when:
- 50% of monthly budget is used
- 90% of monthly budget is used
- 100% of monthly budget is reached

**If budget is exceeded:** Image generation will be temporarily disabled until the next billing cycle or budget is increased.

---

## Best Practices

### When to Use AI-Generated Images

✅ **Good Use Cases:**
- Need specific location/vehicle combinations
- Quick turnaround required
- Multiple variations needed
- Consistent style across images
- Budget-conscious projects

❌ **Not Ideal For:**
- Real customer testimonials (use actual photos)
- Specific vehicle VINs (use actual photos)
- Brand partnerships (use provided assets)
- Legal/contractual requirements for real photos

### Writing Effective Prompts

**DO:**
- ✅ Be specific: "Black Mercedes S-Class at O'Hare Terminal 1"
- ✅ Include lighting: "Evening, golden hour lighting"
- ✅ Mention style: "Professional photography, wide angle"
- ✅ Add context: "Professional chauffeur standing beside car"

**DON'T:**
- ❌ Be vague: "Car at airport"
- ❌ Use brand names in unusual contexts
- ❌ Request inappropriate content
- ❌ Use overly complex descriptions

### Quality Guidelines

Before using an image, ensure:

1. **Resolution** - Image is sharp and high-quality
2. **Composition** - Subject is well-framed
3. **Lighting** - Professional and appropriate
4. **Brand Alignment** - Matches Royal Carriage aesthetic
5. **Technical Quality** - No artifacts or distortions

### Approval Workflow

1. **Generate** - Create the image
2. **Review** - Check quality and relevance
3. **Approve** - Mark as approved in system
4. **Deploy** - Upload to website
5. **Track** - Note where image is used

### Image Organization

- Save images with descriptive names: `hero-ohare-sedan-night.png`
- Keep track of image URLs in a spreadsheet
- Document where each image is used
- Maintain a library of approved images

---

## Troubleshooting

### Issue: "Image generation unavailable"

**Possible Causes:**
- Vertex AI API not enabled
- Service account lacks permissions
- Daily quota exceeded

**Solutions:**
1. Check if you've reached your daily limit (50 images)
2. Wait until midnight for quota reset
3. Contact DevOps team if API issues suspected

### Issue: "Generation failed" or Error Message

**Possible Causes:**
- Invalid prompt
- API timeout
- Service temporarily unavailable

**Solutions:**
1. Simplify your prompt and try again
2. Wait 30 seconds and retry
3. Check your internet connection
4. Clear browser cache and cookies
5. Try a different browser

### Issue: Image Quality is Poor

**Solutions:**
1. Be more specific in your prompt
2. Add style keywords: "high quality", "professional photography"
3. Specify lighting conditions
4. Try generating multiple variations
5. Adjust the purpose type (hero vs service card, etc.)

### Issue: Rate Limit Error

**Message:** "You have reached your daily limit of 50 images"

**Solution:**
- Wait until midnight CT for quota reset
- Contact management if you need increased limits
- Review if all generated images were necessary

### Issue: Image Doesn't Load

**Solutions:**
1. Refresh the page
2. Check your internet connection
3. Verify image URL is correct
4. Check Cloud Storage bucket permissions
5. Contact DevOps team

### Issue: Can't Access Admin Dashboard

**Solutions:**
1. Verify you're using the correct URL
2. Check your admin credentials
3. Clear browser cache
4. Try incognito/private browsing mode
5. Contact development team for access issues

---

## FAQ

### Q: How long does it take to generate an image?

**A:** Most images are generated in 10-30 seconds. Complex prompts may take slightly longer.

### Q: Can I edit the generated images?

**A:** Yes! Download the image and edit with your preferred image editor. The AI-generated images are high quality and suitable for professional editing.

### Q: What if I don't like the generated image?

**A:** Simply adjust your prompt and generate again. You can create multiple variations until you find one you like. Just be mindful of your daily quota.

### Q: Are these images copyright-free?

**A:** Yes, images generated by Vertex AI Imagen are available for your commercial use. There are no additional licensing fees.

### Q: Can I use these images on social media?

**A:** Yes, generated images can be used across all Royal Carriage marketing channels including social media, website, and print materials.

### Q: How many variations should I generate?

**A:** We recommend generating 2-3 variations for each need, then selecting the best one. This balances quality with cost.

### Q: What happens if I exceed my daily quota?

**A:** You'll receive an error message and won't be able to generate more images until the next day at midnight CT.

### Q: Can I request higher quality images?

**A:** Standard quality is suitable for web use. If you need higher quality for print, contact the development team to enable HD generation.

### Q: Where are the images stored?

**A:** Images are stored in Google Cloud Storage and metadata is tracked in Firestore. You can access image URLs from the admin dashboard.

### Q: How do I report an issue or bug?

**A:** Contact the development team via email or your internal support channel with:
- Screenshot of the issue
- Exact error message
- Steps to reproduce
- Time of occurrence

---

## Getting Help

### Technical Support

**Email:** devops@royalcarriage.com (example)  
**Response Time:** Within 24 hours  
**For Urgent Issues:** Contact via internal Slack channel

### Training Resources

- **This User Guide** - Complete reference
- **Video Tutorial** - Coming soon
- **Team Training Sessions** - Scheduled quarterly

### Provide Feedback

Your feedback helps improve the system:
- What features would you like?
- What's confusing or unclear?
- What's working well?

Send feedback to: product@royalcarriage.com (example)

---

## Appendix: Prompt Examples

### Hero Images

**Example 1:**
- Purpose: hero
- Location: Chicago O'Hare International Airport
- Vehicle: Black Mercedes S-Class Sedan
- Style: Nighttime, dramatic lighting, professional chauffeur standing beside vehicle
- Description: Cinematic composition, city lights in background

**Example 2:**
- Purpose: hero
- Location: Downtown Chicago on Michigan Avenue
- Vehicle: Stretch Limousine
- Style: Evening, golden hour, luxury aesthetic
- Description: Sophisticated urban setting

### Service Card Images

**Example 1:**
- Purpose: service_card
- Location: Modern airport terminal
- Vehicle: Black SUV
- Style: Daytime, clean professional
- Description: Front 3/4 view

**Example 2:**
- Purpose: service_card
- Location: Suburban Chicago street
- Vehicle: Executive Van
- Style: Bright, welcoming
- Description: Family-friendly vibe

### Fleet Images

**Example 1:**
- Purpose: fleet
- Vehicle: Lincoln Town Car
- Style: Studio lighting, professional product photography
- Description: Side profile, leather interior visible

**Example 2:**
- Purpose: fleet
- Vehicle: Cadillac Escalade ESV
- Style: Dark background, spotlight
- Description: Luxury SUV showcase

---

**Document Version:** 1.0  
**For Questions:** Contact development team  
**Last Updated:** January 15, 2026
