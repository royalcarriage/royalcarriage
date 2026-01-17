/**
 * AI Image Generator
 * Generates images using AI for website content
 */

import { VertexAI } from "@google-cloud/vertexai";

interface ImageGenerationRequest {
  purpose: "hero" | "service_card" | "fleet" | "location" | "testimonial";
  location?: string;
  vehicle?: string;
  style?: string;
  description?: string;
}

interface ImageGenerationResult {
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
        console.warn(
          "Vertex AI initialization failed for image generation:",
          error,
        );
      }
    }
  }

  /**
   * Generate an image based on request parameters
   */
  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const prompt = this.buildImagePrompt(request);

    let result: ImageGenerationResult;

    if (this.vertexAI) {
      try {
        result = await this.generateWithVertexAI(prompt, request);
      } catch (error) {
        console.error("Vertex AI image generation failed:", error);
        // Fallback to placeholder
        result = this.generatePlaceholder(request, prompt);
      }
    } else {
      // Return placeholder for development
      result = this.generatePlaceholder(request, prompt);
    }

    // Store metadata in Firestore
    await this.saveImageMetadata(result, request);

    return result;
  }

  /**
   * Save image metadata to Firestore
   */
  private async saveImageMetadata(
    result: ImageGenerationResult,
    request: ImageGenerationRequest,
  ): Promise<void> {
    try {
      const admin = await import("firebase-admin");
      const db = admin.firestore();

      await db.collection("ai_images").add({
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        purpose: request.purpose,
        location: request.location || null,
        vehicle: request.vehicle || null,
        style: request.style || null,
        description: request.description || null,
        width: result.width,
        height: result.height,
        format: result.format,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usageCount: 0,
      });
    } catch (error) {
      console.error("Failed to save image metadata:", error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(request: ImageGenerationRequest): string {
    const { purpose, location, vehicle, style, description } = request;

    let prompt =
      "Professional photograph, high quality, luxury transportation, ";

    switch (purpose) {
      case "hero":
        prompt += "luxury black ";
        if (vehicle) {
          prompt += `${vehicle} `;
        } else {
          prompt += "sedan ";
        }
        if (location) {
          prompt += `at ${location}, `;
        } else {
          prompt += "at modern airport terminal, ";
        }
        prompt +=
          "sleek design, nighttime with dramatic lighting, professional chauffeur standing beside vehicle, ";
        prompt +=
          "cinematic composition, wide angle, premium quality, Chicago skyline in background";
        break;

      case "service_card":
        prompt += "luxury ";
        if (vehicle) {
          prompt += `${vehicle} `;
        }
        prompt += "on clean modern street, professional service vehicle, ";
        prompt +=
          "daytime, clear sky, well-lit, front 3/4 view, commercial photography style";
        break;

      case "fleet":
        if (vehicle) {
          prompt += `luxury ${vehicle}, `;
        }
        prompt +=
          "studio lighting, professional product photography, pristine condition, ";
        prompt +=
          "black or dark color, leather interior visible through windows, side profile view";
        break;

      case "location":
        if (location) {
          prompt += `${location} landmark or airport, `;
        }
        prompt +=
          "luxury black car in foreground, professional transportation service, ";
        prompt +=
          "golden hour lighting, establishing shot, travel photography style";
        break;

      case "testimonial":
        prompt += "happy business professional getting into luxury black car, ";
        prompt +=
          "professional chauffeur holding door, airport or hotel setting, ";
        prompt +=
          "natural candid style, positive atmosphere, professional service";
        break;
    }

    if (style) {
      prompt += `, ${style}`;
    }

    if (description) {
      prompt += `, ${description}`;
    }

    // Add quality and style constraints
    prompt +=
      ", photorealistic, 4K quality, professional photography, no text or logos";

    return prompt;
  }

  /**
   * Generate image using Vertex AI Imagen
   */
  private async generateWithVertexAI(
    prompt: string,
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    if (!this.vertexAI) {
      throw new Error("Vertex AI not initialized");
    }

    try {
      // Get the generative model for Imagen
      const generativeModel = this.vertexAI.preview.getGenerativeModel({
        model: "imagegeneration@006",
      });

      // Determine image dimensions based on purpose
      const specs = ImageGenerator.getRecommendedSpecs(request.purpose);

      // Generate the image
      const result = await generativeModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
        },
      });

      // Extract image data from response
      const response = result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error("No image candidates returned from Vertex AI");
      }

      // Get the first candidate
      const candidate = candidates[0];
      const content = candidate.content;

      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No image parts in response");
      }

      // Extract image data (base64 or URL)
      const imagePart = content.parts[0];
      let imageUrl: string;

      if ("inlineData" in imagePart && imagePart.inlineData) {
        // Image is returned as base64
        const base64Data = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || "image/png";

        // Upload to Firebase Storage
        imageUrl = await this.uploadToStorage(
          base64Data,
          mimeType,
          request.purpose,
        );
      } else if ("fileData" in imagePart && imagePart.fileData) {
        // Image is returned as a file URI
        imageUrl = imagePart.fileData.fileUri;
      } else {
        throw new Error("Unexpected image format in response");
      }

      return {
        imageUrl,
        prompt,
        width: specs.width,
        height: specs.height,
        format: specs.format,
      };
    } catch (error) {
      console.error("Vertex AI image generation error:", error);
      throw new Error(
        `Failed to generate image: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Upload image to Firebase Storage
   */
  private async uploadToStorage(
    base64Data: string,
    mimeType: string,
    purpose: string,
  ): Promise<string> {
    const admin = await import("firebase-admin");
    const bucket = admin.storage().bucket();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType.split("/")[1] || "png";
    const filename = `ai-generated/${purpose}/${timestamp}.${extension}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Create file reference
    const file = bucket.file(filename);

    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          generatedBy: "vertex-ai-imagen",
          purpose,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  }

  /**
   * Generate placeholder image (for development/fallback)
   */
  private generatePlaceholder(
    request: ImageGenerationRequest,
    prompt: string,
  ): ImageGenerationResult {
    const { purpose, vehicle, location } = request;

    // Use placeholder image service
    let width = 1200;
    let height = 800;

    if (purpose === "hero") {
      width = 1920;
      height = 1080;
    } else if (purpose === "service_card") {
      width = 600;
      height = 400;
    }

    const text = vehicle || location || purpose;
    const imageUrl = `https://placehold.co/${width}x${height}/1a1a1a/ffffff?text=${encodeURIComponent(text)}`;

    return {
      imageUrl,
      prompt,
      width,
      height,
      format: "png",
    };
  }

  /**
   * Optimize image for web
   */
  async optimizeImage(imageUrl: string): Promise<{
    originalUrl: string;
    optimizedUrl: string;
    thumbnailUrl: string;
    sizeReduction: number;
  }> {
    // This would integrate with image optimization service
    // For now, return the same URLs
    return {
      originalUrl: imageUrl,
      optimizedUrl: imageUrl,
      thumbnailUrl: imageUrl,
      sizeReduction: 0,
    };
  }

  /**
   * Generate multiple variations
   */
  async generateVariations(
    request: ImageGenerationRequest,
    count: number = 3,
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateImage(request);
        results.push(result);
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
      }
    }

    return results;
  }

  /**
   * Get recommended image specs for different purposes
   */
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

/**
 * Image prompt templates for different scenarios
 */
export const ImagePromptTemplates = {
  oHareAirport:
    "luxury black sedan at Chicago O'Hare International Airport, modern terminal, professional chauffeur, nighttime, dramatic lighting, cinematic",
  midwayAirport:
    "luxury black car at Chicago Midway Airport, professional airport transportation, clean modern setting, daytime, professional photography",
  downtownChicago:
    "luxury limousine in downtown Chicago, Michigan Avenue, city skyline, evening, professional black car service, urban sophistication",
  luxurySedan:
    "luxury black sedan, pristine condition, leather interior, professional product photography, studio lighting, side profile",
  luxurySUV:
    "luxury black SUV, spacious interior, premium vehicle, professional transportation, modern design, studio photography",
  stretchLimo:
    "stretch limousine, elegant luxury vehicle, professional photography, black exterior, sophisticated lighting",
  professionalChauffeur:
    "professional chauffeur in suit opening car door, luxury black car, airport setting, customer service, welcoming",
  airportPickup:
    "luxury car pickup at airport terminal, professional driver with sign, business traveler, premium service",
};
