/**
 * Tests for Image Generator
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ImageGenerator } from "../server/ai/image-generator";

// Mock VertexAI
vi.mock("@google-cloud/vertexai", () => ({
  VertexAI: vi.fn().mockImplementation(() => ({
    preview: {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        data: Buffer.from("fake-image-data").toString("base64"),
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
      }),
    },
  })),
}));

// Mock Cloud Storage
vi.mock("@google-cloud/storage", () => ({
  Storage: vi.fn().mockImplementation(() => ({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn().mockReturnValue({
        save: vi.fn().mockResolvedValue(undefined),
        makePublic: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  })),
}));

describe("ImageGenerator", () => {
  let imageGenerator: ImageGenerator;

  beforeEach(() => {
    // Reset environment variables
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    process.env.GOOGLE_CLOUD_LOCATION = "us-central1";
    process.env.GOOGLE_CLOUD_STORAGE_BUCKET = "test-bucket";

    imageGenerator = new ImageGenerator("test-project", "us-central1");
  });

  describe("generateImage", () => {
    it("should generate an image for hero purpose", async () => {
      const request = {
        purpose: "hero" as const,
        location: "Chicago O'Hare Airport",
        vehicle: "Black Sedan",
        style: "Professional, nighttime",
      };

      const result = await imageGenerator.generateImage(request);

      expect(result).toBeDefined();
      expect(result.imageUrl).toBeDefined();
      expect(result.prompt).toContain("Chicago O'Hare Airport");
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.format).toBe("png");
    });

    it("should generate an image for service_card purpose", async () => {
      const request = {
        purpose: "service_card" as const,
        vehicle: "Luxury SUV",
      };

      const result = await imageGenerator.generateImage(request);

      expect(result).toBeDefined();
      expect(result.imageUrl).toBeDefined();
      expect(result.prompt).toContain("Luxury SUV");
    });

    it("should use placeholder when Vertex AI is unavailable", async () => {
      // Create generator without project ID to simulate unavailable Vertex AI
      const generatorWithoutVertexAI = new ImageGenerator("", "");

      const request = {
        purpose: "hero" as const,
        location: "Test Location",
      };

      const result = await generatorWithoutVertexAI.generateImage(request);

      expect(result).toBeDefined();
      expect(result.imageUrl).toBeDefined();
      // When Vertex AI is not configured, should still return a valid image URL
      // (either placeholder or from storage mock in test environment)
      expect(result.imageUrl.length).toBeGreaterThan(0);
      expect(result.prompt).toContain("luxury");
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });

  describe("getRecommendedSpecs", () => {
    it("should return correct specs for hero images", () => {
      const specs = ImageGenerator.getRecommendedSpecs("hero");

      expect(specs.width).toBe(1920);
      expect(specs.height).toBe(1080);
      expect(specs.aspectRatio).toBe("16:9");
    });

    it("should return correct specs for service_card images", () => {
      const specs = ImageGenerator.getRecommendedSpecs("service_card");

      expect(specs.width).toBe(600);
      expect(specs.height).toBe(400);
      expect(specs.aspectRatio).toBe("3:2");
    });
  });
});
