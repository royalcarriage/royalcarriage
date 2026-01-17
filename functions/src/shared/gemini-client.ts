/**
 * Gemini AI Client
 * Singleton wrapper for Google Vertex AI (Gemini models)
 * Provides unified interface for content generation, analysis, and vision tasks
 */

import { VertexAI } from "@google-cloud/vertexai";
import * as functions from "firebase-functions/v1";

type GeminiModel = "gemini-1.5-flash" | "gemini-1.5-pro";

interface GenerateOptions {
  model?: GeminiModel;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export class GeminiClient {
  private static instance: GeminiClient;
  private vertexAI: VertexAI | null = null;
  private projectId: string;
  private location: string;
  private initialized: boolean = false;

  private constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "royalcarriagelimoseo";
    this.location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    try {
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location,
      });
      this.initialized = true;
      functions.logger.info("[GeminiClient] Successfully initialized", {
        project: this.projectId,
        location: this.location,
      });
    } catch (error) {
      functions.logger.error("[GeminiClient] Initialization failed:", error);
      this.initialized = false;
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * Check if Gemini is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.vertexAI !== null;
  }

  /**
   * Generate content from text prompt
   */
  async generateContent(
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<string> {
    if (!this.vertexAI) {
      throw new Error("Gemini client not initialized");
    }

    const model = options.model || "gemini-1.5-flash";

    try {
      functions.logger.info("[GeminiClient] Generating content", {
        model,
        promptLength: prompt.length,
      });

      const client = this.vertexAI.preview.getGenerativeModel({
        model: `models/${model}`,
      });

      const result = await client.generateContent({
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
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
        },
      });

      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      functions.logger.info("[GeminiClient] Content generated successfully", {
        model,
        responseLength: responseText.length,
      });

      return responseText;
    } catch (error) {
      functions.logger.error("[GeminiClient] Content generation failed:", {
        error: error instanceof Error ? error.message : String(error),
        model,
      });
      throw error;
    }
  }

  /**
   * Generate content with vision capabilities
   */
  async generateContentWithVision(
    prompt: string,
    imageUrl: string,
    options: GenerateOptions = {},
  ): Promise<string> {
    if (!this.vertexAI) {
      throw new Error("Gemini client not initialized");
    }

    const model = options.model || "gemini-1.5-flash";

    try {
      functions.logger.info("[GeminiClient] Generating content with vision", {
        model,
        imageUrl,
      });

      // Fetch image and convert to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";

      const client = this.vertexAI.preview.getGenerativeModel({
        model: `models/${model}`,
      });

      const result = await client.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64,
                  mimeType: mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
        },
      });

      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      functions.logger.info("[GeminiClient] Vision content generated", {
        model,
        responseLength: responseText.length,
      });

      return responseText;
    } catch (error) {
      functions.logger.error("[GeminiClient] Vision generation failed:", {
        error: error instanceof Error ? error.message : String(error),
        model,
        imageUrl,
      });
      throw error;
    }
  }

  /**
   * Parse JSON response (with fallback for malformed JSON)
   */
  parseJSON<T>(text: string, fallback?: T): T | null {
    try {
      // Try to extract JSON from text (in case Gemini added explanations)
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return fallback || null;
    } catch (error) {
      functions.logger.warn("[GeminiClient] JSON parsing failed", {
        error: error instanceof Error ? error.message : String(error),
        textPreview: text.substring(0, 100),
      });
      return fallback || null;
    }
  }

  /**
   * Select appropriate model based on task complexity
   */
  selectModel(complexity: "low" | "medium" | "high"): GeminiModel {
    // Use Pro for complex tasks that need high accuracy
    if (complexity === "high") {
      return "gemini-1.5-pro";
    }
    // Default to Flash for speed and cost efficiency
    return "gemini-1.5-flash";
  }

  /**
   * Estimate token usage (rough estimate)
   */
  estimateTokens(text: string): number {
    // Rough estimate: 4 characters ≈ 1 token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Export singleton instance
 */
export const geminiClient = GeminiClient.getInstance();
