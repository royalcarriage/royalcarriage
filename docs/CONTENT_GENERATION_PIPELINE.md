# Content Generation Pipeline - Enterprise Scale

## Overview

The Content Generation Pipeline is an enterprise-scale system for generating, approving, and publishing SEO-optimized content for thousands of location-service page combinations. Built for the Royal Carriage SEO system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  CONTENT GENERATION PIPELINE                  │
└─────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
        │  Generate    │ │  Approve │ │   Publish  │
        │   Content    │ │  Content │ │   Pages    │
        └──────────────┘ └──────────┘ └────────────┘
                │              │              │
        ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
        │ Gemini AI    │ │  Admin   │ │   Static   │
        │ Generation   │ │  Review  │ │   Builder  │
        └──────────────┘ └──────────┘ └────────────┘
```

## Cloud Functions

### 1. generateLocationServiceContent

**Purpose**: Generate SEO-optimized content for a single location-service combination.

**Trigger**: Callable HTTPS function (authenticated)

**Input**:

```typescript
{
  locationId: string,      // Location document ID
  serviceId: string,       // Service document ID
  websiteId: string        // Target website (airport/corporate/wedding/partybus)
}
```

**Output**:

```typescript
{
  contentId: string,       // Generated content ID (serviceId-locationId)
  title: string,           // SEO-optimized page title
  status: string           // "pending" (awaiting approval)
}
```

**Process**:

1. Fetch service and location data from Firestore
2. Generate content using Gemini AI with structured prompt
3. Create SEO title, meta description, keywords
4. Generate schema markup and internal links
5. Store in `service_content` collection with status "pending"

**Example Usage**:

```javascript
const result = await generateLocationServiceContent({
  locationId: "naperville",
  serviceId: "airport-ohare",
  websiteId: "airport",
});

console.log(result);
// {
//   contentId: 'airport-ohare-naperville',
//   title: 'Airport Transfer to O\'Hare in Naperville | Royal Carriage',
//   status: 'pending'
// }
```

---

### 2. batchGenerateContent

**Purpose**: Batch generate content for multiple location-service combinations with rate limiting.

**Trigger**: Callable HTTPS function (authenticated, 9-minute timeout, 1GB memory)

**Input**:

```typescript
{
  websiteId: string,       // Target website
  locationIds: string[],   // Array of location IDs
  serviceIds: string[]     // Array of service IDs
}
```

**Output**:

```typescript
{
  totalGenerated: number,  // Successfully generated count
  errors: Array<{          // First 10 errors (if any)
    locationId: string,
    serviceId: string,
    error: string
  }>,
  totalErrors: number      // Total error count
}
```

**Features**:

- **Rate Limiting**: Respects Gemini API limits (60 requests/minute, 1500/day)
- **Concurrent Processing**: 5 concurrent requests per batch
- **Progress Tracking**: Updates batch job status in real-time
- **Error Handling**: Continues processing on individual failures
- **Batch Delay**: 1-second delay between batches

**Process**:

1. Create batch job record in `batch_jobs` collection
2. Split combinations into batches (5 concurrent requests)
3. Process each batch with rate limiting
4. Track progress and errors
5. Update batch job status on completion

**Example Usage**:

```javascript
const result = await batchGenerateContent({
  websiteId: "wedding",
  locationIds: ["naperville", "wheaton", "oak-brook"],
  serviceIds: ["wedding-bride", "wedding-groom", "wedding-guest"],
});

console.log(result);
// {
//   totalGenerated: 9,
//   errors: [],
//   totalErrors: 0
// }
```

---

### 3. approveAndPublishContent

**Purpose**: Approve content and create page mappings for publishing.

**Trigger**: Callable HTTPS function (authenticated)

**Input**:

```typescript
{
  contentIds: string[]     // Array of content IDs to approve
}
```

**Output**:

```typescript
{
  approved: number,        // Number of items approved
  published: number        // Number of page mappings created
}
```

**Process**:

1. Mark content as "approved" in `service_content` collection
2. Record approval timestamp and approver user ID
3. Create corresponding entries in `page_mappings` collection
4. Set `readyForPublish: true` flag
5. Process in batches of 500 (Firestore batch limit)

**Example Usage**:

```javascript
const result = await approveAndPublishContent({
  contentIds: [
    "airport-ohare-naperville",
    "airport-midway-naperville",
    "corporate-downtown-naperville",
  ],
});

console.log(result);
// {
//   approved: 3,
//   published: 3
// }
```

---

### 4. generatePageMetadata

**Purpose**: Generate comprehensive metadata for approved content.

**Trigger**: Callable HTTPS function (authenticated)

**Input**:

```typescript
{
  contentId: string; // Content document ID
}
```

**Output**:

```typescript
{
  metadata: {
    metaTitle: string,
    metaDescription: string,
    ogTitle: string,
    ogDescription: string,
    ogImage: string,
    twitterCard: string,
    twitterTitle: string,
    twitterDescription: string,
    twitterImage: string,
    canonical: string,
    robots: string,
    breadcrumbs: Array<{name: string, url: string}>,
    schema: object,
    keywords: string[],
    author: string,
    publishedTime: string,
    modifiedTime: string
  }
}
```

**Metadata Includes**:

- **SEO Meta Tags**: Title, description, robots
- **Open Graph**: Title, description, image for social sharing
- **Twitter Cards**: Optimized for Twitter sharing
- **Canonical URL**: Prevent duplicate content
- **Breadcrumbs**: Navigation schema markup
- **Schema.org**: Structured data for rich snippets
- **Keywords**: Target SEO keywords

**Example Usage**:

```javascript
const result = await generatePageMetadata({
  contentId: "airport-ohare-naperville",
});

console.log(result.metadata.breadcrumbs);
// [
//   { name: 'Home', url: 'https://chicagoairportblackcar.com' },
//   { name: 'Services', url: 'https://chicagoairportblackcar.com/services' },
//   { name: 'O\'Hare Airport Transfer', url: '...' },
//   { name: 'Naperville', url: '...' }
// ]
```

---

### 5. buildStaticPages

**Purpose**: Build static page data for Astro sites from approved content.

**Trigger**: Callable HTTPS function (authenticated, 9-minute timeout, 2GB memory)

**Input**:

```typescript
{
  websiteId: string,       // Target website
  limit?: number           // Max pages to build (default: 1000)
}
```

**Output**:

```typescript
{
  pagesBuilt: number; // Number of static pages generated
}
```

**Process**:

1. Query all approved content for the website
2. Fetch service and location data for each content piece
3. Generate static page data with all metadata
4. Store in `static_pages` collection
5. Mark with `buildStatus: 'ready'` for deployment

**Static Page Data Structure**:

```typescript
{
  id: string,              // Content ID
  websiteId: string,       // Target website
  serviceId: string,       // Service ID
  locationId: string,      // Location ID
  path: string,            // Page path (/serviceId/locationId)
  title: string,           // Page title
  metaDescription: string, // Meta description
  content: object,         // Full content object
  metadata: object,        // All metadata
  schema: object,          // Schema.org markup
  internalLinks: string[], // Internal links
  keywords: string[],      // SEO keywords
  serviceName: string,     // Service name
  locationName: string,    // Location name
  buildStatus: string,     // "ready"
  builtAt: timestamp       // Build timestamp
}
```

**Example Usage**:

```javascript
const result = await buildStaticPages({
  websiteId: "airport",
  limit: 500,
});

console.log(result);
// {
//   pagesBuilt: 487
// }
```

---

## Data Schema

### service_content Collection

**Document ID**: `{serviceId}-{locationId}`

```typescript
{
  id: string,
  serviceId: string,
  locationId: string,
  websiteId: string,
  title: string,                    // SEO-optimized title (max 60 chars)
  metaDescription: string,          // Meta description (max 155 chars)
  content: {
    hero: string,                   // Hero text (40-60 words)
    overview: string,               // Service overview (150-200 words)
    features: string[],             // 5 key features
    whyChooseUs: string,            // Location-specific value prop (100-150 words)
    localInfo: string,              // Local area information (100-150 words)
    faq: Array<{                    // 5 common questions
      question: string,
      answer: string                // 30-50 words each
    }>,
    cta: string                     // Call-to-action (20-30 words)
  },
  internalLinks: string[],          // Related page links
  schema: object,                   // JSON-LD schema markup
  keywords: string[],               // Target keywords (up to 20)
  approvalStatus: "pending" | "approved" | "rejected",
  generatedAt: timestamp,
  approvedAt?: timestamp,
  approvedBy?: string,
  metadata?: object                 // Generated metadata (from generatePageMetadata)
}
```

---

### page_mappings Collection

**Document ID**: `{serviceId}-{locationId}`

```typescript
{
  contentId: string,
  serviceId: string,
  locationId: string,
  websiteId: string,
  pagePath: string,                 // URL path (/serviceId/locationId)
  status: "approved",
  readyForPublish: boolean,
  createdAt: timestamp
}
```

---

### static_pages Collection

**Document ID**: `{serviceId}-{locationId}`

```typescript
{
  id: string,
  websiteId: string,
  serviceId: string,
  locationId: string,
  path: string,
  title: string,
  metaDescription: string,
  content: object,
  metadata: object,
  schema: object,
  internalLinks: string[],
  keywords: string[],
  serviceName: string,
  locationName: string,
  buildStatus: "ready",
  builtAt: timestamp
}
```

---

### batch_jobs Collection

**Document ID**: Auto-generated

```typescript
{
  type: "content_generation",
  websiteId: string,
  totalCombinations: number,
  status: "running" | "completed" | "failed",
  startedAt: timestamp,
  completedAt?: timestamp,
  userId: string,
  progress: number,                 // Current count
  errors: number,                   // Error count
  totalGenerated: number,
  totalErrors: number
}
```

---

## Rate Limiting

The pipeline implements comprehensive rate limiting to respect API quotas:

```typescript
const RATE_LIMITS = {
  requestsPerMinute: 60, // Gemini API limit
  requestsPerDay: 1500, // Daily quota
  concurrentRequests: 5, // Parallel processing
  batchDelay: 1000, // ms between batches
  retryAttempts: 3, // Retry failed requests
  retryDelay: 2000, // ms between retries
};
```

---

## Workflow Examples

### Generate Content for All Locations (Single Service)

```javascript
// Generate airport transfer content for all Chicago suburbs

const locations = await getLocations(); // ['naperville', 'wheaton', 'oak-brook', ...]
const serviceId = "airport-ohare";
const websiteId = "airport";

const result = await batchGenerateContent({
  websiteId,
  locationIds: locations,
  serviceIds: [serviceId],
});

console.log(`Generated ${result.totalGenerated} pages`);
```

### Approve and Publish Batch

```javascript
// Approve all pending content for a website

const pending = await getPendingContent("airport");
const contentIds = pending.map((doc) => doc.id);

// Approve content
await approveAndPublishContent({ contentIds });

// Generate metadata for all
for (const contentId of contentIds) {
  await generatePageMetadata({ contentId });
}

// Build static pages
const result = await buildStaticPages({
  websiteId: "airport",
  limit: 1000,
});

console.log(`${result.pagesBuilt} pages ready for deployment`);
```

### Full Pipeline (Generate → Approve → Build)

```javascript
// Complete workflow for new service launch

// Step 1: Generate content
const batchResult = await batchGenerateContent({
  websiteId: "wedding",
  locationIds: ["naperville", "wheaton", "oak-brook"],
  serviceIds: ["wedding-bride", "wedding-groom"],
});

console.log(`Generated ${batchResult.totalGenerated} pieces`);

// Step 2: Admin reviews and approves (manual step in UI)
// ...

// Step 3: Bulk approve all pending
const pending = await db
  .collection("service_content")
  .where("websiteId", "==", "wedding")
  .where("approvalStatus", "==", "pending")
  .get();

const contentIds = pending.docs.map((doc) => doc.id);

await approveAndPublishContent({ contentIds });

// Step 4: Generate metadata
for (const contentId of contentIds) {
  await generatePageMetadata({ contentId });
}

// Step 5: Build static pages
const buildResult = await buildStaticPages({
  websiteId: "wedding",
});

console.log(`${buildResult.pagesBuilt} pages ready to deploy`);

// Step 6: Deploy to Firebase Hosting (manual)
// firebase deploy --only hosting:wedding
```

---

## Error Handling

The pipeline includes comprehensive error handling:

### Content Generation Failures

- **Gemini API Errors**: Falls back to template-based content
- **Missing Data**: Throws `not-found` error with details
- **Rate Limiting**: Implements exponential backoff

### Batch Processing Failures

- **Individual Failures**: Continue processing, log errors
- **Partial Success**: Returns count of successful + failed items
- **Job Tracking**: All batch jobs logged in `batch_jobs` collection

### Approval/Publishing Failures

- **Missing Content**: Logs warning, continues with remaining items
- **Firestore Batch Limits**: Processes in chunks of 500

---

## Performance Optimization

### Batch Processing

- Processes 5 concurrent requests at a time
- 1-second delay between batches
- Maximum 9-minute execution time

### Memory Optimization

- 1GB memory for `batchGenerateContent`
- 2GB memory for `buildStaticPages`
- Processes large datasets in chunks

### Firestore Optimization

- Batch writes (up to 500 operations)
- Parallel reads where possible
- Indexed queries for performance

---

## Monitoring

### Cloud Functions Logs

All functions log comprehensive information:

```javascript
// Info logs
functions.logger.info("Generating content", { locationId, serviceId });

// Error logs
functions.logger.error("Content generation failed", { error });

// Debug logs
functions.logger.debug("Generated page", { contentId });
```

### Batch Job Tracking

Monitor batch jobs via Firestore:

```javascript
const batchJobs = await db
  .collection("batch_jobs")
  .where("status", "==", "running")
  .orderBy("startedAt", "desc")
  .get();
```

---

## Security

### Authentication

- All functions require authentication
- User context passed to all operations
- Approval actions log user ID

### Authorization

- Functions callable by authenticated users
- Admin-only operations can be added via custom claims

### Data Validation

- Input validation on all functions
- Type checking via TypeScript
- Schema validation for generated content

---

## Deployment

### Build Functions

```bash
cd functions
npm run build
```

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Specific Functions

```bash
firebase deploy --only functions:generateLocationServiceContent
firebase deploy --only functions:batchGenerateContent
firebase deploy --only functions:approveAndPublishContent
firebase deploy --only functions:generatePageMetadata
firebase deploy --only functions:buildStaticPages
```

---

## Testing

### Unit Testing

```javascript
// Test single content generation
const result = await generateLocationServiceContent({
  locationId: "naperville",
  serviceId: "airport-ohare",
  websiteId: "airport",
});

assert(result.contentId === "airport-ohare-naperville");
assert(result.status === "pending");
```

### Integration Testing

```javascript
// Test full pipeline
const batchResult = await batchGenerateContent({
  websiteId: "airport",
  locationIds: ["test-location"],
  serviceIds: ["test-service"],
});

assert(batchResult.totalGenerated === 1);

const approveResult = await approveAndPublishContent({
  contentIds: ["test-service-test-location"],
});

assert(approveResult.approved === 1);
assert(approveResult.published === 1);
```

---

## Troubleshooting

### "Gemini API rate limit exceeded"

- Reduce `concurrentRequests` in rate limits
- Increase `batchDelay` between batches
- Monitor daily quota usage

### "Function timeout (9 minutes)"

- Reduce batch size
- Process in multiple smaller batches
- Increase function memory allocation

### "Missing service or location data"

- Verify data exists in Firestore
- Check document IDs are correct
- Ensure data initialization completed

---

## Future Enhancements

### Planned Features

- [ ] A/B testing variants for content
- [ ] Multi-language content generation
- [ ] Content quality scoring with AI
- [ ] Auto-regeneration based on performance
- [ ] Competitor analysis integration
- [ ] Image generation for OG images
- [ ] Video script generation
- [ ] Voice search optimization

### Performance Improvements

- [ ] Caching for service/location data
- [ ] Pre-warming for cold starts
- [ ] Parallel metadata generation
- [ ] Incremental builds for static pages

---

## Support

For questions or issues:

- Check Firebase Functions logs
- Review `batch_jobs` collection for job status
- Verify Gemini API quota usage
- Contact development team

---

**Last Updated**: 2026-01-16
**Version**: 1.0.0
**Author**: YOLO Autonomous Builder Agent
