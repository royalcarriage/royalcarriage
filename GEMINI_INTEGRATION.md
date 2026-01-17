# Gemini AI Integration Guide

**Date**: January 16, 2026
**Status**: Implementation In Progress
**Project**: Royal Carriage Admin Dashboard

---

## Table of Contents

1. [Overview](#overview)
2. [Gemini API Setup](#gemini-api-setup)
3. [Available Models](#available-models)
4. [Implementation Plan](#implementation-plan)
5. [Functions to Implement](#functions-to-implement)
6. [Code Examples](#code-examples)
7. [Error Handling & Fallbacks](#error-handling--fallbacks)
8. [Cost Optimization](#cost-optimization)
9. [Testing Strategy](#testing-strategy)

---

## Overview

This document outlines the implementation of Google Gemini AI integration for the Royal Carriage admin dashboard Cloud Functions. The integration enables:

- **Content Generation**: AI-powered FAQ, social captions, and page content
- **Sentiment Analysis**: Automated feedback sentiment classification
- **Review Summarization**: Intelligent customer review summaries
- **Model Routing**: Intelligent switching between gemini-1.5-flash and gemini-1.5-pro

### Architecture

```
Cloud Functions (Node.js 20)
    ↓
Vertex AI SDK (@google-cloud/vertexai)
    ↓
Google Gemini Models (via Vertex AI API)
    ↓
Firestore (Store AI results)
```

---

## Gemini API Setup

### Prerequisites

✅ **Already Installed**:

- `@google-cloud/vertexai@latest` (package.json)
- Firebase Admin SDK
- Cloud Functions runtime

### Environment Configuration

Add to `functions/.env`:

```bash
GOOGLE_CLOUD_PROJECT=royalcarriagelimoseo
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_API_KEY=[If using direct API]
```

### Authentication

Google Cloud Functions authenticates automatically using:

- Application Default Credentials (ADC)
- Service account with Vertex AI API access

**Verify in Google Cloud Console**:

1. Project: `royalcarriagelimoseo`
2. APIs enabled: `aiplatform.googleapis.com`
3. Service account permissions: `Vertex AI User` role

---

## Available Models

### Model Comparison

| Model                | Speed     | Cost         | Best For                    | Context   |
| -------------------- | --------- | ------------ | --------------------------- | --------- |
| **gemini-1.5-flash** | ⚡ Fast   | 💰 Cheaper   | FAQ, captions, summaries    | 1M tokens |
| **gemini-1.5-pro**   | 🐢 Slower | 💵 Expensive | Complex analysis, sentiment | 2M tokens |

### Model Selection Strategy

```typescript
function selectModel(task: string, complexity: "low" | "medium" | "high") {
  if (complexity === "high" || task === "sentiment") {
    return "gemini-1.5-pro"; // Use for complex tasks
  }
  return "gemini-1.5-flash"; // Default for speed & cost
}
```

---

## Implementation Plan

### Phase 1: Core Gemini Wrapper (✅ Ready)

- **File**: `functions/src/shared/gemini-client.ts`
- **Status**: Create reusable Gemini client
- **Task**: Implement singleton pattern for Vertex AI initialization

### Phase 2: Content Functions (🔄 In Progress)

- **File**: `functions/src/contentFunctions.ts`
- **Functions**:
  - `generateFAQForCity` → Uses gemini-1.5-flash
  - `summarizeCustomerReviews` → Uses gemini-1.5-flash
  - `suggestSocialCaptions` → Uses gemini-1.5-flash

### Phase 3: Analysis Functions (⏳ Pending)

- **File**: `functions/src/contentFunctions.ts`
- **Functions**:
  - `analyzeSentimentOfFeedback` → Uses gemini-1.5-pro

### Phase 4: Advanced Orchestration (⏳ Pending)

- **File**: `functions/src/advancedFunctions.ts`
- **Functions**:
  - `aiModelRouter` → Model selection logic

---

## Functions to Implement

### 1. `generateFAQForCity(city: string)`

**Purpose**: Generate city-specific FAQ content for limo services

**Input**:

```typescript
{
  city: "Chicago",  // City name
}
```

**Output**:

```typescript
{
  faq: [
    {
      question: "How far in advance should I book...",
      answer: "We recommend booking at least 24 hours...",
    },
    // ... more Q&As
  ];
}
```

**Prompt Template**:

```
Generate 5 FAQs for {city} airport limo service.
Include: booking process, vehicle selection, pricing, cancellation, special requests.
Format as JSON array with questions and answers.
```

**Model**: `gemini-1.5-flash` (cost-optimized)

---

### 2. `summarizeCustomerReviews(customerId: string)`

**Purpose**: Generate AI summary of customer reviews

**Input**:

```typescript
{
  customerId: "cust_123",
}
```

**Output**:

```typescript
{
  summary: "Customer values punctuality and professionalism...",
  sentiment: "positive",
  keyPoints: ["punctuality", "professional", "clean vehicle"],
  rideCount: 5,
}
```

**Process**:

1. Query Firestore for customer reviews
2. Aggregate review text
3. Send to Gemini for summarization
4. Extract key points and sentiment

**Prompt Template**:

```
Summarize these {count} customer reviews for a limo service in 2-3 sentences.
Focus on: what they valued, recurring themes, areas for improvement.
Also extract 3 key points they mentioned.

Reviews:
{reviews_text}

Respond in JSON format:
{
  "summary": "...",
  "sentiment": "positive|neutral|negative",
  "keyPoints": ["...", "...", "..."]
}
```

**Model**: `gemini-1.5-flash`

---

### 3. `analyzeSentimentOfFeedback(feedback: string)`

**Purpose**: Automatically classify feedback sentiment

**Input**: Firestore trigger on new `/feedback/{id}` document

```typescript
{
  feedback: {
    text: "Amazing service! Driver was professional and car was immaculate.",
    customerId: "cust_123",
    rating: 5,
  }
}
```

**Output**: Update Firestore document

```typescript
{
  text: "...",
  sentiment: "positive",
  sentimentScore: 0.95,  // 0-1 scale
  categories: ["professionalism", "cleanliness"],
  shouldFlagForReview: false,
}
```

**Prompt Template**:

```
Analyze sentiment of this limo service feedback.
Return JSON with:
- sentiment: "positive", "neutral", or "negative"
- sentimentScore: 0-1 (confidence)
- categories: key themes mentioned
- shouldFlagForReview: true if contains complaint or safety concern

Feedback:
{feedback_text}
```

**Model**: `gemini-1.5-pro` (for accuracy)

---

### 4. `suggestSocialCaptions(imageUrl: string, platform: string)`

**Purpose**: Generate social media captions from images

**Input**:

```typescript
{
  imageUrl: "https://storage.googleapis.com/...",
  platform: "instagram|facebook|twitter",
}
```

**Output**:

```typescript
{
  captions: [
    "Arriving in style. Premium black car service for Chicago airport transfers. #RoyalCarriage",
    "Professional. Reliable. Luxury. Book your ride today.",
    "Experience the difference. Luxury limo service.",
  ];
}
```

**Process**:

1. Load image from URL
2. Use Gemini vision capabilities
3. Analyze image content
4. Generate platform-specific captions

**Model**: `gemini-1.5-flash` (supports vision)

---

### 5. `aiModelRouter(task: string, complexity: string)`

**Purpose**: Intelligent model selection based on task complexity

**Input**:

```typescript
{
  task: "sentiment_analysis",
  complexity: "high",
}
```

**Output**:

```typescript
{
  selectedModel: "gemini-1.5-pro",
  estimatedCost: "$0.015",  // per call
  status: "ready",
}
```

---

## Code Examples

### Example 1: Basic Gemini Client

**File**: `functions/src/shared/gemini-client.ts`

```typescript
import { VertexAI } from "@google-cloud/vertexai";

export class GeminiClient {
  private static instance: GeminiClient;
  private vertexAI: VertexAI;
  private projectId: string;
  private location: string;

  private constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "royalcarriagelimoseo";
    this.location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    this.vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
  }

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  async generateContent(
    prompt: string,
    model: "gemini-1.5-flash" | "gemini-1.5-pro" = "gemini-1.5-flash",
  ): Promise<string> {
    const client = this.vertexAI.preview.getGenerativeModel({
      model: `models/${model}`,
    });

    const result = await client.generateContent(prompt);
    const response = result.response;

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async generateContentWithVision(
    prompt: string,
    imageUrl: string,
    model: "gemini-1.5-flash" | "gemini-1.5-pro" = "gemini-1.5-flash",
  ): Promise<string> {
    const client = this.vertexAI.preview.getGenerativeModel({
      model: `models/${model}`,
    });

    // Fetch image and convert to base64
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const result = await client.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    return result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}
```

### Example 2: Implement generateFAQForCity

```typescript
export const generateFAQForCity = functions.https.onCall(
  async (data, context) => {
    try {
      const { city } = data;

      if (!city) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "City is required",
        );
      }

      const gemini = GeminiClient.getInstance();

      const prompt = `Generate 5 frequently asked questions about airport limo service in ${city}.

    For each question, provide a helpful, professional answer.

    Topics to cover:
    - How to book
    - Pricing
    - Vehicle selection
    - Cancellation policy
    - Special requests (child seats, extra luggage, etc.)

    Format as valid JSON:
    {
      "faq": [
        {
          "question": "...",
          "answer": "..."
        }
      ]
    }`;

      const response = await gemini.generateContent(prompt, "gemini-1.5-flash");
      const parsed = JSON.parse(response);

      // Store in Firestore for caching
      await db.collection("faq_cache").doc(city).set({
        faq: parsed.faq,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        city: city,
      });

      return { faq: parsed.faq };
    } catch (error) {
      console.error("FAQ generation failed:", error);
      throw new functions.https.HttpsError("internal", "FAQ generation failed");
    }
  },
);
```

### Example 3: Implement summarizeCustomerReviews

```typescript
export const summarizeCustomerReviews = functions.https.onCall(
  async (data, context) => {
    try {
      const { customerId } = data;

      if (!customerId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "customerId is required",
        );
      }

      // Get reviews from Firestore
      const reviewDocs = await db
        .collection("reviews")
        .where("customerId", "==", customerId)
        .get();

      if (reviewDocs.empty) {
        return {
          summary: "No reviews found",
          sentiment: "neutral",
          keyPoints: [],
        };
      }

      const reviews = reviewDocs.docs
        .map((doc) => doc.data().text)
        .join("\n\n");

      const gemini = GeminiClient.getInstance();

      const prompt = `Summarize these ${reviewDocs.size} customer reviews for a limo service.

    Provide:
    1. A 2-3 sentence summary
    2. Overall sentiment (positive/neutral/negative)
    3. Top 3 key points mentioned

    Reviews:
    ${reviews}

    Respond in JSON format:
    {
      "summary": "...",
      "sentiment": "positive|neutral|negative",
      "keyPoints": ["...", "...", "..."]
    }`;

      const response = await gemini.generateContent(prompt, "gemini-1.5-flash");
      const result = JSON.parse(response);

      return {
        summary: result.summary,
        sentiment: result.sentiment,
        keyPoints: result.keyPoints,
        reviewCount: reviewDocs.size,
      };
    } catch (error) {
      console.error("Review summarization failed:", error);
      throw new functions.https.HttpsError("internal", "Summarization failed");
    }
  },
);
```

---

## Error Handling & Fallbacks

### Fallback Strategies

```typescript
// Strategy 1: Cached Results
async function getCachedOrGenerate(
  cacheKey: string,
  generator: () => Promise<any>,
) {
  try {
    const cached = await db.collection("ai_cache").doc(cacheKey).get();
    if (cached.exists && isStillValid(cached)) {
      return cached.data();
    }
  } catch (e) {
    console.warn("Cache read failed:", e);
  }

  return await generator();
}

// Strategy 2: Template-Based Fallback
function generateFAQTemplate(city: string): FAQ[] {
  return [
    {
      question: `How do I book airport service in ${city}?`,
      answer:
        "You can book through our website or by calling our customer service team.",
    },
    // ... more templates
  ];
}

// Strategy 3: Queue for Retry
async function queueForRetry(task: string, data: any) {
  await db.collection("retry_queue").add({
    task,
    data,
    retryCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

---

## Cost Optimization

### Pricing (as of 2026-01)

| Model            | Input           | Output          |
| ---------------- | --------------- | --------------- |
| gemini-1.5-flash | $0.075/M tokens | $0.30/M tokens  |
| gemini-1.5-pro   | $3.50/M tokens  | $10.50/M tokens |

### Cost Reduction Strategies

1. **Use Flash for Simple Tasks**
   - FAQs: Use gemini-1.5-flash (saves 95% on input tokens)
   - Captions: Use gemini-1.5-flash
   - Summaries: Use gemini-1.5-flash

2. **Cache Results**
   - FAQ by city (rarely changes)
   - Customer summaries (cache 7 days)
   - Social captions (cache per image)

3. **Batch Processing**
   - Process multiple reviews at once
   - Combine sentiment analysis calls

4. **Token Optimization**
   - Trim prompt to essential details
   - Use structured output (JSON)
   - Reuse system instructions

### Monthly Cost Estimate

```
Assuming 1000 API calls/month:

Flash Model:
- Avg 500 input tokens per call
- Avg 300 output tokens per call
- Cost: (500 * 0.075 + 300 * 0.30) / 1M * 1000 = ~$0.18/month

Pro Model (100 calls):
- Avg 1000 input tokens
- Avg 500 output tokens
- Cost: (1000 * 3.50 + 500 * 10.50) / 1M * 100 = ~$0.00075/month

**Total: ~$0.19/month** (very affordable)
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
describe("GeminiClient", () => {
  it("should generate content successfully", async () => {
    const gemini = GeminiClient.getInstance();
    const result = await gemini.generateContent("Say hello");
    expect(result).toBeTruthy();
  });

  it("should handle vision prompts", async () => {
    const gemini = GeminiClient.getInstance();
    const result = await gemini.generateContentWithVision(
      "What is in this image?",
      "https://example.com/image.jpg",
    );
    expect(result).toBeTruthy();
  });
});
```

### 2. Integration Tests

```typescript
describe("generateFAQForCity", () => {
  it("should generate valid FAQ structure", async () => {
    const result = await generateFAQForCity({ city: "Chicago" });
    expect(result.faq).toBeDefined();
    expect(result.faq.length).toBeGreaterThan(0);
    expect(result.faq[0]).toHaveProperty("question");
    expect(result.faq[0]).toHaveProperty("answer");
  });
});
```

### 3. Manual Testing

```bash
# Test FAQ generation
firebase functions:shell
> generateFAQForCity({city: 'Chicago'})

# Test sentiment analysis
> analyzeSentimentOfFeedback({text: 'Great service!'})
```

---

## Deployment Checklist

- [ ] Create `functions/src/shared/gemini-client.ts`
- [ ] Update `functions/src/contentFunctions.ts` with Gemini implementations
- [ ] Update `functions/src/advancedFunctions.ts` with model router
- [ ] Add environment variables to Cloud Functions
- [ ] Enable Vertex AI API in Google Cloud Console
- [ ] Set up Service Account with Vertex AI User role
- [ ] Test all functions locally with Firebase Emulator
- [ ] Deploy to production: `firebase deploy --only functions`
- [ ] Monitor costs in Google Cloud Console
- [ ] Set up Cloud Logging for API calls

---

## Monitoring & Debugging

### Cloud Logging

All Gemini API calls should log:

- Prompt tokens used
- Response tokens used
- Model used
- Latency
- Errors (if any)

**View logs**:

```bash
gcloud functions logs read generateFAQForCity --limit 100
```

### Alerts to Set Up

1. **API Error Rate > 5%**: Alert on function errors
2. **Latency > 5 seconds**: Alert if Gemini calls slow
3. **Monthly Cost > $1**: Budget alert

---

## Next Steps

1. ✅ Create `gemini.md` (this file)
2. ⏳ Create `functions/src/shared/gemini-client.ts`
3. ⏳ Implement content functions with Gemini
4. ⏳ Test all functions
5. ⏳ Deploy to Firebase

---

## References

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Guide](https://ai.google.dev/)
- [Node.js Vertex AI SDK](https://github.com/googleapis/nodejs-ai-platform)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
