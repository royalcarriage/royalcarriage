/**
 * AI Image Generator
 * Generates images using AI for website content
 */

import { VertexAI } from '@google-cloud/vertexai';

interface ImageGenerationRequest {
  purpose: 'hero' | 'service_card' | 'fleet' | 'location' | 'testimonial';
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
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (this.projectId) {
      try {
        this.vertexAI = new VertexAI({
          project: this.projectId,
          location: this.location,
        });
      } catch (error) {
        console.warn('Vertex AI initialization failed for image generation:', error);
      }
    }
  }

  /**
   * Generate an image based on request parameters
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const prompt = this.buildImagePrompt(request);

    if (this.vertexAI) {
      try {
        return await this.generateWithVertexAI(prompt, request);
      } catch (error) {
        console.error('Vertex AI image generation failed:', error);
      }
    }

    // Return placeholder for development
    return this.generatePlaceholder(request, prompt);
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(request: ImageGenerationRequest): string {
    const { purpose, location, vehicle, style, description } = request;

    let prompt = 'Professional photograph, high quality, luxury transportation, ';

    switch (purpose) {
      case 'hero':
        prompt += 'luxury black ';
        if (vehicle) {
          prompt += `${vehicle} `;
        } else {
          prompt += 'sedan ';
        }
        if (location) {
          prompt += `at ${location}, `;
        } else {
          prompt += 'at modern airport terminal, ';
        }
        prompt += 'sleek design, nighttime with dramatic lighting, professional chauffeur standing beside vehicle, ';
        prompt += 'cinematic composition, wide angle, premium quality, Chicago skyline in background';
        break;

      case 'service_card':
        prompt += 'luxury ';
        if (vehicle) {
          prompt += `${vehicle} `;
        }
        prompt += 'on clean modern street, professional service vehicle, ';
        prompt += 'daytime, clear sky, well-lit, front 3/4 view, commercial photography style';
        break;

      case 'fleet':
        if (vehicle) {
          prompt += `luxury ${vehicle}, `;
        }
        prompt += 'studio lighting, professional product photography, pristine condition, ';
        prompt += 'black or dark color, leather interior visible through windows, side profile view';
        break;

      case 'location':
        if (location) {
          prompt += `${location} landmark or airport, `;
        }
        prompt += 'luxury black car in foreground, professional transportation service, ';
        prompt += 'golden hour lighting, establishing shot, travel photography style';
        break;

      case 'testimonial':
        prompt += 'happy business professional getting into luxury black car, ';
        prompt += 'professional chauffeur holding door, airport or hotel setting, ';
        prompt += 'natural candid style, positive atmosphere, professional service';
        break;
    }

    if (style) {
      prompt += `, ${style}`;
    }

    if (description) {
      prompt += `, ${description}`;
    }

    // Add quality and style constraints
    prompt += ', photorealistic, 4K quality, professional photography, no text or logos';

    return prompt;
  }

  /**
   * Generate image using Vertex AI Imagen
   */
  private async generateWithVertexAI(
    prompt: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    if (!this.vertexAI) {
      throw new Error('Vertex AI not initialized. Ensure GOOGLE_CLOUD_PROJECT is set.');
    }

    try {
      // Use Imagen 3 for image generation
      const generativeModel = this.vertexAI.preview.getGenerativeModel({
        model: 'imagen-3.0-generate-001',
      });

      // Determine aspect ratio based on purpose
      let aspectRatio = '16:9';
      if (request.purpose === 'service_card') {
        aspectRatio = '3:2';
      } else if (request.purpose === 'fleet') {
        aspectRatio = '4:3';
      } else if (request.purpose === 'testimonial') {
        aspectRatio = '1:1';
      }

      // Generate the image
      const generateImageRequest = {
        prompt: prompt,
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        // Add negative prompt to improve quality
        negativePrompt: 'blurry, low quality, distorted, text, watermark, logo, signature',
      };

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(generateImageRequest) }] }],
      });

      // Extract image data from response
      const response = result.response;
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No image generated from Vertex AI');
      }

      // Get the generated image data
      const candidate = response.candidates[0];
      const content = candidate.content;
      
      // Check if we have inline data (base64 image)
      if (content.parts && content.parts[0].inlineData) {
        const imageData = content.parts[0].inlineData;
        const base64Data = imageData.data;
        
        // Convert base64 to buffer for storage
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Upload to Cloud Storage if available
        const imageUrl = await this.uploadToStorage(imageBuffer, request);
        
        // Determine dimensions based on aspect ratio
        const dimensions = this.getDimensions(request.purpose);
        
        return {
          imageUrl,
          prompt,
          width: dimensions.width,
          height: dimensions.height,
          format: 'png',
        };
      } else {
        throw new Error('No image data in Vertex AI response');
      }
    } catch (error) {
      console.error('Vertex AI image generation error:', error);
      // Fall back to placeholder if Vertex AI fails
      console.warn('Falling back to placeholder image due to Vertex AI error');
      return this.generatePlaceholder(request, prompt);
    }
  }

  /**
   * Get dimensions based on image purpose
   */
  private getDimensions(purpose: string): { width: number; height: number } {
    const specs = ImageGenerator.getRecommendedSpecs(purpose);
    return { width: specs.width, height: specs.height };
  }

  /**
   * Upload image to Cloud Storage
   */
  private async uploadToStorage(
    imageBuffer: Buffer,
    request: ImageGenerationRequest
  ): Promise<string> {
    // If Cloud Storage is not configured, return data URL
    const bucketName = process.env.DEPLOY_IMAGES_BUCKET ||
      process.env.GOOGLE_CLOUD_STORAGE_BUCKET ||
      process.env.GCLOUD_STORAGE_BUCKET;
    const prefix = process.env.DEPLOY_IMAGES_PREFIX || 'generated';
    
    if (!bucketName) {
      console.warn('Cloud Storage bucket not configured, using data URL');
      // Return base64 data URL as fallback
      const base64 = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    }

    try {
      // Dynamic import to avoid errors if @google-cloud/storage is not installed
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage({ projectId: this.projectId });
      const bucket = storage.bucket(bucketName);
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${prefix}/${request.purpose}-${timestamp}.png`;
      const file = bucket.file(filename);
      
      // Upload the image
      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000',
          metadata: {
            purpose: request.purpose,
            generatedAt: new Date().toISOString(),
          },
        },
      });
      
      // Make the file publicly accessible
      await file.makePublic();
      
      // Return the public URL
      return `https://storage.googleapis.com/${bucketName}/${filename}`;
    } catch (error) {
      console.error('Cloud Storage upload error:', error);
      // Return data URL as fallback
      const base64 = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    }
  }

  /**
   * Generate placeholder image (for development/fallback)
   */
  private generatePlaceholder(
    request: ImageGenerationRequest,
    prompt: string
  ): ImageGenerationResult {
    const { purpose, vehicle, location } = request;

    // Use placeholder image service
    let width = 1200;
    let height = 800;

    if (purpose === 'hero') {
      width = 1920;
      height = 1080;
    } else if (purpose === 'service_card') {
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
      format: 'png',
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
    count: number = 3
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
      hero: { width: 1920, height: 1080, aspectRatio: '16:9', format: 'webp' },
      service_card: { width: 600, height: 400, aspectRatio: '3:2', format: 'webp' },
      fleet: { width: 800, height: 600, aspectRatio: '4:3', format: 'webp' },
      location: { width: 1200, height: 800, aspectRatio: '3:2', format: 'webp' },
      testimonial: { width: 400, height: 400, aspectRatio: '1:1', format: 'webp' },
    };

    return specs[purpose as keyof typeof specs] || specs.service_card;
  }
}

/**
 * Image prompt templates for different scenarios
 */
export const ImagePromptTemplates = {
  oHareAirport: 'luxury black sedan at Chicago O\'Hare International Airport, modern terminal, professional chauffeur, nighttime, dramatic lighting, cinematic',
  midwayAirport: 'luxury black car at Chicago Midway Airport, professional airport transportation, clean modern setting, daytime, professional photography',
  downtownChicago: 'luxury limousine in downtown Chicago, Michigan Avenue, city skyline, evening, professional black car service, urban sophistication',
  luxurySedan: 'luxury black sedan, pristine condition, leather interior, professional product photography, studio lighting, side profile',
  luxurySUV: 'luxury black SUV, spacious interior, premium vehicle, professional transportation, modern design, studio photography',
  stretchLimo: 'stretch limousine, elegant luxury vehicle, professional photography, black exterior, sophisticated lighting',
  professionalChauffeur: 'professional chauffeur in suit opening car door, luxury black car, airport setting, customer service, welcoming',
  airportPickup: 'luxury car pickup at airport terminal, professional driver with sign, business traveler, premium service',
};
