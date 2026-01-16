/**
 * AI Content Generator
 * Uses Google Vertex AI to generate optimized content for website pages
 */

import { VertexAI } from "@google-cloud/vertexai";

interface ContentGenerationRequest {
  pageType: string;
  location?: string;
  vehicle?: string;
  currentContent?: string;
  targetKeywords: string[];
  tone: "professional" | "friendly" | "luxury" | "urgent";
  maxLength?: number;
}

interface ContentGenerationResult {
  title: string;
  metaDescription: string;
  heading: string;
  content: string;
  ctaText: string;
}

export class ContentGenerator {
  private vertexAI: VertexAI | null = null;
  private projectId: string;
  private location: string;

  constructor(projectId?: string, location?: string) {
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || "";
    this.location =
      location || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    // Only initialize if credentials are available
    if (this.projectId) {
      try {
        this.vertexAI = new VertexAI({
          project: this.projectId,
          location: this.location,
        });
      } catch (error) {
        console.warn(
          "Vertex AI initialization failed, will use fallback generation:",
          error,
        );
      }
    }
  }

  /**
   * Generate optimized content for a page
   */
  async generateContent(
    request: ContentGenerationRequest,
  ): Promise<ContentGenerationResult> {
    // If Vertex AI is available, use it
    if (this.vertexAI) {
      try {
        return await this.generateWithVertexAI(request);
      } catch (error) {
        console.error("Vertex AI generation failed, using fallback:", error);
      }
    }

    // Fallback to template-based generation
    return this.generateWithTemplate(request);
  }

  /**
   * Generate content using Vertex AI
   */
  private async generateWithVertexAI(
    request: ContentGenerationRequest,
  ): Promise<ContentGenerationResult> {
    const model = this.vertexAI!.preview.getGenerativeModel({
      model: "gemini-pro",
    });

    const prompt = this.buildPrompt(request);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the generated content
    return this.parseGeneratedContent(generatedText, request);
  }

  /**
   * Build AI prompt for content generation
   */
  private buildPrompt(request: ContentGenerationRequest): string {
    const {
      pageType,
      location,
      vehicle,
      currentContent,
      targetKeywords,
      tone,
      maxLength,
    } = request;

    let prompt = `You are an expert SEO copywriter for a luxury airport transportation company in Chicago.

Business Context:
- Company: Royal Carriage / Chicago Airport Black Car Service
- Services: Airport transfers, black car service, limousine service
- Areas: Chicago O'Hare Airport, Midway Airport, Downtown Chicago, and 50+ suburbs
- Fleet: Luxury sedans, SUVs, stretch limousines
- Brand: Professional, reliable, luxury positioning

Task: Generate optimized web content for a ${pageType} page.
`;

    if (location) {
      prompt += `\nLocation Focus: ${location}`;
    }

    if (vehicle) {
      prompt += `\nVehicle Focus: ${vehicle}`;
    }

    prompt += `\n\nTarget Keywords: ${targetKeywords.join(", ")}`;
    prompt += `\nTone: ${tone}`;

    if (maxLength) {
      prompt += `\nMax Length: ${maxLength} words`;
    }

    if (currentContent) {
      prompt += `\n\nCurrent Content (to improve):\n${currentContent.substring(0, 500)}...`;
    }

    prompt += `\n\nGenerate the following in this exact format:

TITLE: [SEO-optimized page title with primary keyword]

META_DESCRIPTION: [155-character meta description]

HEADING: [Main H1 heading for the page]

CONTENT:
[Optimized page content with the following structure:
- Opening paragraph with primary keyword
- 2-3 benefit-focused sections
- Location or vehicle-specific details
- Trust elements (licensed, insured, professional)
- Call-to-action language
Keep it concise, professional, and conversion-focused.]

CTA_TEXT: [Compelling call-to-action button text]

Important:
- Use keywords naturally, avoid keyword stuffing
- Write for humans first, search engines second
- Include specific Chicago locations and landmarks
- Emphasize luxury, reliability, and professionalism
- Focus on benefits and value proposition
- Keep sentences clear and readable
`;

    return prompt;
  }

  /**
   * Parse AI-generated content into structured format
   */
  private parseGeneratedContent(
    text: string,
    request: ContentGenerationRequest,
  ): ContentGenerationResult {
    const lines = text.split("\n");

    let title = "";
    let metaDescription = "";
    let heading = "";
    let content = "";
    let ctaText = "Book Now";

    let currentSection = "";

    for (const line of lines) {
      if (line.startsWith("TITLE:")) {
        title = line.replace("TITLE:", "").trim();
      } else if (line.startsWith("META_DESCRIPTION:")) {
        metaDescription = line.replace("META_DESCRIPTION:", "").trim();
      } else if (line.startsWith("HEADING:")) {
        heading = line.replace("HEADING:", "").trim();
      } else if (line.startsWith("CONTENT:")) {
        currentSection = "content";
      } else if (line.startsWith("CTA_TEXT:")) {
        ctaText = line.replace("CTA_TEXT:", "").trim();
        currentSection = "";
      } else if (currentSection === "content" && line.trim()) {
        content += line + "\n";
      }
    }

    // Fallback if parsing failed
    if (!title || !heading || !content) {
      return this.generateWithTemplate(request);
    }

    return {
      title: title || this.generateTitle(request),
      metaDescription: metaDescription || this.generateMetaDescription(request),
      heading: heading || title,
      content: content.trim(),
      ctaText: ctaText,
    };
  }

  /**
   * Template-based content generation (fallback)
   */
  private generateWithTemplate(
    request: ContentGenerationRequest,
  ): ContentGenerationResult {
    const { pageType, location, vehicle } = request;

    return {
      title: this.generateTitle(request),
      metaDescription: this.generateMetaDescription(request),
      heading: this.generateHeading(request),
      content: this.generateBodyContent(request),
      ctaText: this.generateCTA(request),
    };
  }

  private generateTitle(request: ContentGenerationRequest): string {
    const { location, vehicle, pageType } = request;

    if (pageType === "airport" && location) {
      return `${location} Airport Limo Service | Luxury Black Car Transportation`;
    } else if (pageType === "suburb" && location) {
      return `${location} Limo Service | Airport Transportation to O'Hare & Midway`;
    } else if (pageType === "vehicle" && vehicle) {
      return `Luxury ${vehicle} Service | Chicago Airport Transportation`;
    }

    return "Chicago Airport Limo Service | Professional Black Car Transportation";
  }

  private generateMetaDescription(request: ContentGenerationRequest): string {
    const { location, vehicle } = request;

    let desc = "Professional";

    if (location) {
      desc += ` ${location}`;
    }

    desc += " airport limo service";

    if (vehicle) {
      desc += ` with luxury ${vehicle}s`;
    }

    desc +=
      ". Reliable black car transportation to O'Hare & Midway. Book online or call (224) 801-3090.";

    return desc.substring(0, 155);
  }

  private generateHeading(request: ContentGenerationRequest): string {
    const { location, vehicle, tone } = request;

    if (location && vehicle) {
      return `Premium ${vehicle} Service for ${location}`;
    } else if (location) {
      return `Professional ${location} Airport Transportation`;
    } else if (vehicle) {
      return `Luxury ${vehicle} Service in Chicago`;
    }

    return "Chicago Airport Black Car Service";
  }

  private generateBodyContent(request: ContentGenerationRequest): string {
    const { location, vehicle, pageType } = request;

    let content = `Experience premium airport transportation with Chicago's most trusted black car service. `;

    if (location) {
      content += `Our professional chauffeurs provide reliable service to and from ${location}, ensuring you arrive on time, every time. `;
    }

    if (vehicle) {
      content += `Travel in comfort with our fleet of luxury ${vehicle}s, featuring leather seating, climate control, and complimentary amenities. `;
    }

    content += `\n\nWhy Choose Our Service:\n`;
    content += `• Professional, licensed chauffeurs with local expertise\n`;
    content += `• Flight monitoring for timely airport pickups\n`;
    content += `• Flat-rate pricing with no hidden fees\n`;
    content += `• Immaculate, late-model luxury vehicles\n`;
    content += `• 24/7 availability and dispatch support\n\n`;

    if (location) {
      content += `Serving ${location} and surrounding areas with dedicated airport transportation. `;
    }

    content += `Book your ride today for a stress-free travel experience. Available 24/7 for reservations and immediate dispatch.`;

    return content;
  }

  private generateCTA(request: ContentGenerationRequest): string {
    const { pageType, tone } = request;

    // Deterministic CTA selection based on page type and tone
    if (tone === "urgent") {
      return "Call (224) 801-3090";
    }

    switch (pageType) {
      case "airport":
        return "Book Your Ride Now";
      case "suburb":
        return "Schedule Pickup";
      case "vehicle":
        return "Reserve Your Limo";
      case "pricing":
        return "Get Instant Quote";
      default:
        return "Book Your Ride Now";
    }
  }

  /**
   * Improve existing content
   */
  async improveContent(
    currentContent: string,
    recommendations: string[],
  ): Promise<string> {
    if (this.vertexAI) {
      try {
        const model = this.vertexAI.preview.getGenerativeModel({
          model: "gemini-pro",
        });

        const prompt = `You are an expert SEO copywriter. Improve the following website content based on these recommendations:

Current Content:
${currentContent}

Recommendations:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Provide an improved version that:
- Implements the recommendations
- Maintains the original message and tone
- Keeps it concise and professional
- Optimizes for SEO and conversions

Improved Content:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return (
          response.candidates?.[0]?.content?.parts?.[0]?.text || currentContent
        );
      } catch (error) {
        console.error("Content improvement failed:", error);
      }
    }

    return currentContent;
  }
}
