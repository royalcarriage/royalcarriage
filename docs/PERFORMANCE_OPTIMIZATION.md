# Performance Optimization Guide

Guide for optimizing the AI Image Generation system for better performance, lower costs, and improved user experience.

## Table of Contents

1. [Image Generation Optimization](#image-generation-optimization)
2. [Function Performance](#function-performance)
3. [Database Optimization](#database-optimization)
4. [Storage Optimization](#storage-optimization)
5. [Caching Strategies](#caching-strategies)
6. [Cost Optimization](#cost-optimization)

## Image Generation Optimization

### Prompt Optimization

Optimize prompts for faster, better results:

```typescript
// Optimized prompt structure
function createOptimizedPrompt(request: ImageRequest): string {
  // Keep prompts concise but descriptive
  const basePrompt = getBasePRompt(request.purpose);

  // Add only essential details
  const details = [
    request.vehicle && `featuring ${request.vehicle}`,
    request.location && `at ${request.location}`,
    request.style || "professional style",
  ]
    .filter(Boolean)
    .join(", ");

  return `${basePrompt} ${details}`.trim();
}

// Avoid overly long prompts
const MAX_PROMPT_LENGTH = 200;
function truncatePrompt(prompt: string): string {
  return prompt.length > MAX_PROMPT_LENGTH
    ? prompt.substring(0, MAX_PROMPT_LENGTH) + "..."
    : prompt;
}
```

### Negative Prompts

Use consistent, effective negative prompts:

```typescript
const OPTIMIZED_NEGATIVE_PROMPT = "blurry, low quality, distorted, watermark";

// Avoid overly long negative prompts
// They increase generation time without much benefit
```

### Aspect Ratio Selection

Choose appropriate aspect ratios for faster generation:

```typescript
// Faster: Standard aspect ratios
const FAST_RATIOS = ["16:9", "4:3", "1:1"];

// Slower: Custom aspect ratios
const SLOW_RATIOS = ["21:9", "5:4"];

// Recommendation: Stick to standard ratios
function getOptimalAspectRatio(purpose: string): string {
  const ratios = {
    hero: "16:9", // Standard, fast
    service_card: "3:2", // Standard, fast
    fleet: "4:3", // Standard, fast
    testimonial: "1:1", // Standard, fast
  };
  return ratios[purpose] || "16:9";
}
```

### Batch Processing

For multiple images, consider batch processing:

```typescript
// Instead of sequential:
for (const request of requests) {
  await generateImage(request);
}

// Use parallel processing (with limits):
const BATCH_SIZE = 3; // Don't overwhelm the API
for (let i = 0; i < requests.length; i += BATCH_SIZE) {
  const batch = requests.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map((r) => generateImage(r)));
}
```

## Function Performance

### Memory Allocation

Optimize Firebase Functions memory:

```typescript
// functions/src/index.ts
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({
  region: "us-central1",
  memory: "1GiB", // Increase for image generation
  timeoutSeconds: 60, // Adequate for AI operations
  maxInstances: 10, // Limit concurrent executions
});

// For image generation specifically
export const generateImage = onCall(
  {
    memory: "2GiB", // More memory = faster execution
    timeoutSeconds: 120, // Longer timeout for AI
  },
  async (request) => {
    // ... implementation
  },
);
```

### Cold Start Optimization

Minimize cold starts:

```typescript
// 1. Keep dependencies light
// Import only what you need
import { Storage } from "@google-cloud/storage";
// NOT: import * as gcp from '@google-cloud/everything';

// 2. Use dynamic imports for heavy dependencies
async function generateImage(request) {
  const { VertexAI } = await import("@google-cloud/vertexai");
  // ... use VertexAI
}

// 3. Implement keep-alive
export const keepWarm = onSchedule("every 5 minutes", async () => {
  // Ping critical functions to keep them warm
  await fetch("https://your-domain.com/api/ai/config-status");
});
```

### Concurrent Execution

Optimize concurrent request handling:

```typescript
// Use Promise.all for independent operations
async function generateAndStore(request: ImageRequest) {
  const [image, userData] = await Promise.all([
    generateImage(request),
    fetchUserData(request.userId),
  ]);

  // Now use both results
  await storeImageWithMetadata(image, userData);
}

// Avoid sequential when possible
// BAD:
// const image = await generateImage();
// const user = await fetchUser();

// GOOD:
// const [image, user] = await Promise.all([generateImage(), fetchUser()]);
```

## Database Optimization

### Firestore Query Optimization

Optimize Firestore queries:

```typescript
// Use indexes for common queries
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "generated_images",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usage_stats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}

// Limit query results
const recentImages = await db
  .collection('generated_images')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(10) // Always use limit
  .get();

// Use pagination for large datasets
async function getImagesPaginated(userId: string, pageSize = 20, startAfter?) {
  let query = db
    .collection('generated_images')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(pageSize);

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  return await query.get();
}
```

### Write Optimization

Optimize write operations:

```typescript
// Batch writes for multiple operations
async function updateMultipleStats(
  updates: Array<{ userId: string; increment: number }>,
) {
  const batch = db.batch();

  for (const update of updates) {
    const ref = db.collection("usage_stats").doc(update.userId);
    batch.update(ref, {
      count: FieldValue.increment(update.increment),
    });
  }

  await batch.commit(); // Single network call
}

// Use server timestamps instead of client timestamps
await db.collection("generated_images").add({
  ...imageData,
  createdAt: FieldValue.serverTimestamp(), // More efficient
});
```

### Data Structure Optimization

Optimize data structures:

```typescript
// Store frequently accessed data at root level
interface ImageDocument {
  imageUrl: string;
  userId: string;
  purpose: string;
  createdAt: Timestamp;
  // NOT nested objects for frequently queried fields
}

// Use subcollections for large related data
// Main document:
db.collection("users").doc(userId);
// Related data:
db.collection("users").doc(userId).collection("generated_images");

// Use array fields wisely (max 20000 elements)
// GOOD for small lists:
tags: ["luxury", "airport", "sedan"];
// BAD for large lists:
// imageIds: [/* 1000+ items */]
```

## Storage Optimization

### Image Format & Size

Optimize stored images:

```typescript
// Use appropriate formats
const FORMAT = "webp"; // Smaller than PNG, good quality
// or
const FORMAT = "jpg"; // If webp not supported

// Compress images if needed
import sharp from "sharp";

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .webp({ quality: 85 }) // Good balance of quality/size
    .toBuffer();
}
```

### Storage Lifecycle

Implement lifecycle policies:

```bash
# Delete old generated images after 90 days
gsutil lifecycle set lifecycle-config.json gs://your-bucket

# lifecycle-config.json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 90,
          "matchesPrefix": ["generated/"]
        }
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["archive/"]
        }
      }
    ]
  }
}
```

### CDN Integration

Use Firebase Hosting CDN for static assets:

```typescript
// Store frequently accessed images in Hosting
// Less frequently accessed in Storage

// Configuration in firebase.json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/images/popular/**",
        "destination": "/images/popular/:splat"
      }
    ],
    "headers": [
      {
        "source": "/images/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

## Caching Strategies

### Browser Caching

Implement browser caching:

```typescript
// Set cache headers for generated images
async function uploadWithCaching(buffer: Buffer, filename: string) {
  await bucket.file(filename).save(buffer, {
    metadata: {
      cacheControl: "public, max-age=31536000", // 1 year
      contentType: "image/png",
    },
  });
}
```

### Application-Level Caching

Cache frequent requests:

```typescript
// Simple in-memory cache
class ImageCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any) {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + this.TTL,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }
}

const cache = new ImageCache();

async function generateImageWithCache(request: ImageRequest) {
  const cacheKey = JSON.stringify(request);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Generate if not in cache
  const result = await generateImage(request);
  cache.set(cacheKey, result);

  return result;
}
```

### Firestore Caching

Use Firestore offline persistence:

```typescript
// Enable offline persistence (client-side)
import { enableIndexedDbPersistence } from "firebase/firestore";

await enableIndexedDbPersistence(db);

// This caches documents locally
// Reduces reads and improves performance
```

## Cost Optimization

### API Call Reduction

Minimize unnecessary API calls:

```typescript
// Validate input before calling expensive APIs
function validateBeforeGeneration(request: ImageRequest): string | null {
  if (!request.purpose) return "Purpose required";
  if (!request.userId) return "User ID required";

  // Check rate limit locally first
  if (hasExceededLocalRateLimit(request.userId)) {
    return "Rate limit exceeded";
  }

  return null; // Valid
}

async function generateImage(request: ImageRequest) {
  // Validate first (cheap)
  const error = validateBeforeGeneration(request);
  if (error) throw new Error(error);

  // Then call expensive API
  return await callVertexAI(request);
}
```

### Efficient Storage Usage

Minimize storage costs:

```typescript
// Delete old images periodically
async function cleanupOldImages() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const oldImages = await db
    .collection("generated_images")
    .where("createdAt", "<", cutoffDate)
    .get();

  const batch = db.batch();
  const storagePromises: Promise<void>[] = [];

  oldImages.forEach((doc) => {
    // Delete from Firestore
    batch.delete(doc.ref);

    // Delete from Storage
    const filename = doc.data().filename;
    storagePromises.push(
      bucket
        .file(filename)
        .delete()
        .catch(() => {}),
    );
  });

  await Promise.all([batch.commit(), ...storagePromises]);
}
```

### Rate Limiting

Implement effective rate limiting:

```typescript
// Progressive rate limiting
function getRateLimit(userTier: string): number {
  const limits = {
    free: 10,
    basic: 50,
    premium: 200,
  };
  return limits[userTier] || 10;
}

// Use Firestore transactions for accurate counting
async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const today = getToday();
  const statRef = db.collection("usage_stats").doc(`${userId}_${today}`);

  return await db.runTransaction(async (transaction) => {
    const stat = await transaction.get(statRef);
    const current = stat.exists ? stat.data()!.count : 0;
    const limit = getRateLimit(getUserTier(userId));

    if (current >= limit) {
      return false; // Rate limit exceeded
    }

    transaction.set(
      statRef,
      {
        userId,
        date: today,
        count: current + 1,
      },
      { merge: true },
    );

    return true; // OK to proceed
  });
}
```

## Performance Monitoring

### Key Metrics to Track

```typescript
// Track performance metrics
interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: Date;
}

async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  let success = true;

  try {
    return await fn();
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - start;

    // Log performance metric
    console.log(
      JSON.stringify({
        operation,
        duration,
        success,
        timestamp: new Date().toISOString(),
      }),
    );

    // Alert if slow
    if (duration > 30000) {
      // 30 seconds
      console.warn(`Slow operation: ${operation} took ${duration}ms`);
    }
  }
}

// Usage
const result = await trackPerformance("image-generation", async () => {
  return await generateImage(request);
});
```

## Performance Targets

### Recommended Targets

- **Image Generation**: P95 < 30 seconds
- **Config Check**: P95 < 500ms
- **Database Queries**: P95 < 100ms
- **Storage Upload**: P95 < 5 seconds
- **Function Cold Start**: < 3 seconds
- **Function Warm Start**: < 500ms

### Monitoring These Targets

```bash
# Query Cloud Monitoring for P95 latency
gcloud monitoring time-series list \
  --filter='metric.type="cloudfunctions.googleapis.com/function/execution_times"' \
  --aggregation=ALIGN_PERCENTILE_95
```

## Best Practices Summary

1. **Keep Prompts Concise**: Shorter prompts = faster generation
2. **Use Standard Aspect Ratios**: Faster processing
3. **Optimize Function Memory**: More memory = better performance
4. **Minimize Cold Starts**: Use keep-alive functions
5. **Batch Operations**: Reduce network round-trips
6. **Implement Caching**: Reduce repeated work
7. **Use Indexes**: Firestore queries need proper indexes
8. **Clean Up Old Data**: Reduce storage costs
9. **Monitor Performance**: Track metrics and optimize continuously
10. **Rate Limit Effectively**: Prevent abuse and control costs

## Additional Resources

- [Firebase Performance Best Practices](https://firebase.google.com/docs/perf-mon/best-practices)
- [Cloud Functions Performance Tips](https://cloud.google.com/functions/docs/bestpractices/tips)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Storage Performance](https://cloud.google.com/storage/docs/best-practices)
