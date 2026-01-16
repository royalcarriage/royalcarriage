/**
 * Lightweight Vertex AI image generator for Cloud Functions.
 * Falls back to placeholders when Vertex AI or Storage are not configured.
 */
import { VertexAI } from "@google-cloud/vertexai";

export type ImagePurpose =
  | "hero"
  | "service_card"
  | "fleet"
  | "location"
  | "testimonial";

export interface ImageGenerationRequest {
  purpose: ImagePurpose;
  location?: string;
  vehicle?: string;
  style?: string;
  description?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
  format: string;
}

export class ImageGenerator {
  private vertexAI: VertexAI | null = null;
  private projectId: string;
  private location: string;

  constructor(projectId?: string, location?: string) {
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || "";
    this.location =
      location || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    if (this.projectId) {
      try {
        this.vertexAI = new VertexAI({
          project: this.projectId,
          location: this.location,
        });
      } catch (error) {
        console.warn("Vertex AI initialization failed:", error);
      }
    }
  }

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const prompt = this.buildImagePrompt(request);

    if (this.vertexAI) {
      try {
        return await this.generateWithVertexAI(prompt, request);
      } catch (error) {
        console.error("Vertex AI image generation failed:", error);
      }
    }

    return this.generatePlaceholder(request, prompt);
  }

  private buildImagePrompt(request: ImageGenerationRequest): string {
    const { purpose, location, vehicle, style, description } = request;

    let prompt =
      "Professional photograph, high quality, luxury transportation, ";

    switch (purpose) {
      case "hero":
        prompt += `luxury black ${vehicle || "sedan"} `;
        prompt += location ? `at ${location}, ` : "at modern airport terminal, ";
        prompt +=
          "sleek design, nighttime with dramatic lighting, professional chauffeur standing beside vehicle, cinematic composition, wide angle, premium quality, Chicago skyline in background";
        break;
      case "service_card":
        prompt += "luxury ";
        if (vehicle) prompt += `${vehicle} `;
        prompt +=
          "on clean modern street, professional service vehicle, daytime, clear sky, well-lit, front 3/4 view, commercial photography style";
        break;
      case "fleet":
        if (vehicle) prompt += `luxury ${vehicle}, `;
        prompt +=
          "studio lighting, professional product photography, pristine condition, black or dark color, leather interior visible through windows, side profile view";
        break;
      case "location":
        if (location) prompt += `${location} landmark or airport, `;
        prompt +=
          "luxury black car in foreground, professional transportation service, golden hour lighting, establishing shot, travel photography style";
        break;
      case "testimonial":
        prompt +=
          "happy business professional getting into luxury black car, professional chauffeur holding door, airport or hotel setting, natural candid style, positive atmosphere, professional service";
        break;
    }

    if (style) prompt += `, ${style}`;
    if (description) prompt += `, ${description}`;

    prompt += ", photorealistic, 4K quality, professional photography, no text or logos";
    return prompt;
  }

  private async generateWithVertexAI(
    prompt: string,
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    if (!this.vertexAI) {
      throw new Error("Vertex AI not initialized");
    }

    // Prefer Imagen 3; fall back to placeholder if preview API unavailable
    const model = this.vertexAI.preview.getGenerativeModel({
      model: "imagen-3.0-generate-001",
    });

    const aspectRatio =
      request.purpose === "service_card"
        ? "3:2"
        : request.purpose === "fleet"
          ? "4:3"
          : request.purpose === "testimonial"
            ? "1:1"
            : "16:9";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                prompt,
                numberOfImages: 1,
                aspectRatio,
                negativePrompt:
                  "blurry, low quality, distorted, text, watermark, logo, signature",
              }),
            },
          ],
        },
      ],
    });

    const response = result.response;
    const candidate = response.candidates?.[0];
    const content = candidate?.content;
    const inlineData = content?.parts?.[0]?.inlineData;

    if (!inlineData?.data) {
      throw new Error("No image data returned from Vertex AI");
    }

    const imageBuffer = Buffer.from(inlineData.data, "base64");
    const imageUrl = await this.uploadToStorage(imageBuffer, request);
    const dimensions = this.getDimensions(request.purpose);

    return {
      imageUrl,
      prompt,
      width: dimensions.width,
      height: dimensions.height,
      format: "png",
    };
  }

  private async uploadToStorage(
    imageBuffer: Buffer,
    request: ImageGenerationRequest,
  ): Promise<string> {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

    if (!bucketName) {
      const base64 = imageBuffer.toString("base64");
      return `data:image/png;base64,${base64}`;
    }

    try {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage({ projectId: this.projectId });
      const bucket = storage.bucket(bucketName);

      const filename = `generated/${request.purpose}-${Date.now()}.png`;
      const file = bucket.file(filename);

      await file.save(imageBuffer, {
        metadata: {
          contentType: "image/png",
          cacheControl: "public, max-age=31536000",
          metadata: {
            purpose: request.purpose,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      await file.makePublic();
      return `https://storage.googleapis.com/${bucketName}/${filename}`;
    } catch (error) {
      console.error("Cloud Storage upload failed, returning data URL:", error);
      const base64 = imageBuffer.toString("base64");
      return `data:image/png;base64,${base64}`;
    }
  }

  private getDimensions(purpose: ImagePurpose): { width: number; height: number } {
    const specs = ImageGenerator.getRecommendedSpecs(purpose);
    return { width: specs.width, height: specs.height };
  }

  private generatePlaceholder(
    request: ImageGenerationRequest,
    prompt: string,
  ): ImageGenerationResult {
    const specs = ImageGenerator.getRecommendedSpecs(request.purpose);
    const text = request.vehicle || request.location || request.purpose;
    const imageUrl = `https://placehold.co/${specs.width}x${specs.height}/1a1a1a/ffffff?text=${encodeURIComponent(text)}`;

    return {
      imageUrl,
      prompt,
      width: specs.width,
      height: specs.height,
      format: "png",
    };
  }

  async generateVariations(
    request: ImageGenerationRequest,
    count: number = 3,
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (let i = 0; i < count; i++) {
      try {
        results.push(await this.generateImage(request));
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
      }
    }

    return results;
  }

  static getRecommendedSpecs(purpose: string): {
    width: number;
    height: number;
    aspectRatio: string;
    format: string;
  } {
    const specs = {
      hero: { width: 1920, height: 1080, aspectRatio: "16:9", format: "webp" },
      service_card: {
        width: 600,
        height: 400,
        aspectRatio: "3:2",
        format: "webp",
      },
      fleet: { width: 800, height: 600, aspectRatio: "4:3", format: "webp" },
      location: {
        width: 1200,
        height: 800,
        aspectRatio: "3:2",
        format: "webp",
      },
      testimonial: {
        width: 400,
        height: 400,
        aspectRatio: "1:1",
        format: "webp",
      },
    };

    return specs[purpose as keyof typeof specs] || specs.service_card;
  }
}
