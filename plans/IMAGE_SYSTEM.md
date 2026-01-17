# Image Management System - Complete Design

## Overview

Centralized AI-powered image management system. Detect missing images, generate replacements with DALL-E, store variants for different use cases, and track usage across all systems.

---

## Core Components

### 1. Image Storage Structure

```
gs://firebase-bucket/
├── /vehicles/{vehicleId}/
│   ├── main.jpg (original)
│   ├── main_thumb.jpg (200px)
│   ├── main_medium.jpg (600px)
│   ├── main_large.jpg (1200px)
│   ├── main.webp (modern format)
│   ├── exterior.jpg
│   ├── interior.jpg
│   └── gallery/
│       ├── 001.jpg
│       ├── 002.jpg
│       └── ...
│
├── /drivers/{driverId}/
│   ├── profile.jpg
│   ├── profile_thumb.jpg
│   └── documents/
│
├── /blog/{postId}/
│   ├── featured.jpg
│   ├── featured_thumb.jpg
│   ├── featured_medium.jpg
│   └── inline/
│
├── /marketing/{siteId}/
│   ├── airport/
│   ├── corporate/
│   ├── wedding/
│   └── partybus/
│
└── /ai_generated/
    ├── vehicle_123_dall_e_001.jpg
    ├── vehicle_123_dall_e_001.metadata.json
    └── ...
```

### 2. Image Metadata Model

```firestore
/images/{imageId}: {
  id: string,
  tenantId: string,
  entityType: 'vehicle' | 'driver' | 'blog' | 'marketing',
  entityId: string,

  fileInfo: {
    originalFileName: string,
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    fileSize: number, // bytes
    uploadedAt: Timestamp,
    uploadedBy: string // userId
  },

  dimensions: {
    width: number,
    height: number,
    aspectRatio: string // "16:9"
  },

  storage: {
    originalUrl: string, // gs://bucket/...
    thumbUrl: string, // 200px
    mediumUrl: string, // 600px
    largeUrl: string, // 1200px
    webpUrl: string // modern format
  },

  seo: {
    altText: string,
    title: string,
    caption: string,
    keywords: string[]
  },

  ai: {
    generatedByAI: boolean,
    generationPrompt: string,
    model: 'dall-e-3' | 'stable-diffusion' | 'none',
    generationCost: number, // $ spent
    approvalStatus: 'pending' | 'approved' | 'rejected'
  },

  usage: {
    usageCount: number,
    usageLocations: [
      { page: 'vehicle_detail', url: '...' },
      { page: 'fleet_gallery', url: '...' }
    ],
    lastUsedAt: Timestamp
  },

  status: 'active' | 'archived' | 'flagged',
  created: Timestamp,
  updated: Timestamp
}
```

---

## Missing Image Detection

### Automated Scanner

```javascript
// Cloud Function runs hourly
async function checkMissingImages() {
  const issues = [];

  // Check vehicles missing images
  const vehicles = await getVehicles();
  for (const vehicle of vehicles) {
    const images = await getVehicleImages(vehicle.id);
    if (images.length === 0) {
      issues.push({
        type: "vehicle_no_images",
        entityId: vehicle.id,
        entityType: "vehicle",
        severity: "high",
        message: `Vehicle ${vehicle.make} ${vehicle.model} has no images`,
      });
    }

    // Check for broken image links (404s)
    for (const image of images) {
      const status = await checkImageUrl(image.originalUrl);
      if (status === 404) {
        issues.push({
          type: "broken_image_link",
          entityId: vehicle.id,
          imageId: image.id,
          severity: "high",
          message: `Image at ${image.originalUrl} is 404`,
        });
      }
    }
  }

  // Check drivers missing profile photos
  const drivers = await getDrivers();
  for (const driver of drivers) {
    const profilePhoto = await getDriverProfilePhoto(driver.id);
    if (!profilePhoto) {
      issues.push({
        type: "driver_no_profile",
        entityId: driver.id,
        entityType: "driver",
        severity: "medium",
        message: `Driver ${driver.name} has no profile photo`,
      });
    }
  }

  // Check blog posts missing featured images
  const posts = await getBlogPosts();
  for (const post of posts) {
    if (!post.featuredImage) {
      issues.push({
        type: "blog_no_featured_image",
        entityId: post.id,
        entityType: "blog",
        severity: "medium",
      });
    }
  }

  // Save issues to alerts collection
  await saveAlerts(issues);

  // Send email notification
  if (issues.length > 0) {
    await sendMissingImagesAlert(issues);
  }
}
```

### Alert System

```firestore
/imageAlerts/{alertId}: {
  type: 'missing_image' | 'broken_link' | 'missing_alt_text',
  entityType: 'vehicle' | 'driver' | 'blog',
  entityId: string,
  severity: 'critical' | 'high' | 'medium' | 'low',
  status: 'open' | 'resolved',
  createdAt: Timestamp,
  resolvedAt: Timestamp | null,
  message: string,
  suggested_action: 'generate_image' | 'reupload' | 'add_alt_text'
}
```

---

## AI Image Generation (DALL-E Integration)

### Generation Workflow

```javascript
async function generateMissingImage(vehicle) {
  // 1. Build prompt
  const prompt = buildPrompt(vehicle);
  // "Professional photo of a white Toyota Camry luxury sedan,
  //  clean exterior, modern design, high quality photo,
  //  3/4 front angle, professional photography, white background"

  // 2. Call DALL-E API
  const response = await openai.images.generate({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    model: "dall-e-3",
  });

  // 3. Download image
  const imageUrl = response.data[0].url;
  const imageBuffer = await downloadImage(imageUrl);

  // 4. Upload to Cloud Storage
  const storagePath = `/ai_generated/vehicle_${vehicle.id}_dall_e_${Date.now()}.jpg`;
  const fileRef = bucket.file(storagePath);
  await fileRef.save(imageBuffer, {
    metadata: {
      contentType: "image/jpeg",
    },
  });

  // 5. Create variants (thumb, medium, large, webp)
  const variants = await createImageVariants(imageBuffer);

  // 6. Save metadata to Firestore
  await saveImageMetadata({
    entityType: "vehicle",
    entityId: vehicle.id,
    generatedByAI: true,
    model: "dall-e-3",
    generationPrompt: prompt,
    approvalStatus: "pending", // Requires manager approval
    storage: {
      originalUrl: storagePath,
      thumbUrl: variants.thumb,
      mediumUrl: variants.medium,
      largeUrl: variants.large,
      webpUrl: variants.webp,
    },
  });

  // 7. Send for approval
  await notifyImageApproval(vehicle.id, storagePath);
}
```

### Prompt Engineering

```javascript
function buildPrompt(vehicle, context = "marketing") {
  const basePrompt = `Professional high-quality photo of a ${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const stylePrompts = {
    marketing:
      "luxury vehicle advertisement, studio lighting, white background, professional photography",
    driver_profile:
      "clean, well-maintained vehicle, natural lighting, 3/4 side angle",
    fleet_gallery: "fleet of vehicles, professional lineup, uniform lighting",
  };

  const featurePrompts = {
    stretch_limo:
      "elegant stretch limousine, luxury interior visible, dark tinted windows, professional",
    party_bus:
      "party bus, colorful interior lighting, entertainment features visible",
    sedan: "professional sedan, business transportation, clean exterior",
    suv: "luxury SUV, spacious interior, premium finishes",
  };

  const style = stylePrompts[context] || stylePrompts.marketing;
  const features = featurePrompts[vehicle.type] || "";

  return `${basePrompt}, ${features}, ${style}, high resolution, sharp details, professional quality`;
}
```

### Cost Tracking

```javascript
async function trackGenerationCost(imageId) {
  const costPerImage = 0.08; // DALL-E 3 HD cost

  await db.collection("images").doc(imageId).update({
    "ai.generationCost": costPerImage,
    "ai.generatedAt": serverTimestamp(),
  });

  // Update tenant's AI spending
  await incrementAICost(tenantId, costPerImage);
}

async function getAISpending(tenantId, month) {
  const query = await db
    .collection("images")
    .where("tenantId", "==", tenantId)
    .where("ai.generatedByAI", "==", true)
    .where("ai.generatedAt", ">=", monthStart)
    .where("ai.generatedAt", "<=", monthEnd)
    .get();

  let total = 0;
  query.docs.forEach((doc) => {
    total += doc.data().ai.generationCost || 0;
  });

  return total; // E.g., $12.80 for month
}
```

---

## Image Optimization

### Variant Creation

```javascript
async function createImageVariants(originalBuffer) {
  const sharp = require("sharp");

  // 1. Create thumbnail (200px)
  const thumb = await sharp(originalBuffer)
    .resize(200, 200, { fit: "cover", position: "center" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 2. Create medium (600px)
  const medium = await sharp(originalBuffer)
    .resize(600, 600, { fit: "cover", position: "center" })
    .jpeg({ quality: 85 })
    .toBuffer();

  // 3. Create large (1200px)
  const large = await sharp(originalBuffer)
    .resize(1200, 1200, { fit: "cover", position: "center" })
    .jpeg({ quality: 85 })
    .toBuffer();

  // 4. Create WebP (modern format)
  const webp = await sharp(originalBuffer)
    .resize(1200, 1200, { fit: "cover", position: "center" })
    .webp({ quality: 80 })
    .toBuffer();

  // Upload all to Cloud Storage
  const paths = {
    thumb: await uploadVariant(thumb, "thumb"),
    medium: await uploadVariant(medium, "medium"),
    large: await uploadVariant(large, "large"),
    webp: await uploadVariant(webp, "webp"),
  };

  return paths;
}
```

### Usage in Markup

```html
<!-- Responsive image with WebP fallback -->
<picture>
  <source srcset="{{ image.webpUrl }}" type="image/webp" />
  <source srcset="{{ image.largeUrl }}" type="image/jpeg" />
  <img
    src="{{ image.mediumUrl }}"
    alt="{{ image.altText }}"
    loading="lazy"
    width="600"
    height="600"
  />
</picture>
```

---

## Image Approval Workflow

```javascript
async function approveImage(imageId, approved = true) {
  await db
    .collection("images")
    .doc(imageId)
    .update({
      "ai.approvalStatus": approved ? "approved" : "rejected",
      status: approved ? "active" : "flagged",
    });

  if (approved) {
    // Make image live on all pages
    await publishImage(imageId);
    await notifyImageApproved(imageId);
  } else {
    // Mark for replacement
    await flagForReplacement(imageId);
  }
}
```

---

## Integration Points

### Vehicle Detail Page

```javascript
// Show images for vehicle
const vehicle = await getVehicle(vehicleId);
const images = await getVehicleImages(vehicleId);

if (images.length === 0) {
  // Fallback to AI-generated placeholder
  const aiImage = await getAIGeneratedImage(vehicleId);
  if (aiImage) {
    displayAlert("This image was AI-generated");
  } else {
    displayAlert("Missing vehicle image - admin will generate");
  }
}
```

### Admin Dashboard

```
Image Library
├─ All Images (1,234)
├─ By Entity Type
│  ├─ Vehicle (450)
│  ├─ Driver (200)
│  ├─ Blog (350)
│  └─ Marketing (234)
├─ Missing Images Alert (23) 🔴
├─ AI Generated (120)
│  ├─ Pending Approval (15)
│  ├─ Approved (100)
│  └─ Rejected (5)
└─ Upload New Image
```

---

## Analytics

```firestore
/imageMetrics/{tenantId}: {
  total_images: 1234,
  total_storage_gb: 45.6,
  ai_generated_count: 120,
  ai_spending_ytd: 2485.60,
  missing_images_count: 23,
  broken_links_count: 3,
  avg_usage_per_image: 3.2
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 6 - Image/AI)
**Status**: Production Ready
