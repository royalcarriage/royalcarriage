/**
 * Image Manifest System
 * Central manifest for image metadata and AI prompts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ImageMetadata {
  id: string;
  alt: string;
  placement: string;
  dimensions: {
    width: number;
    height: number;
  };
  pagesUsed: string[];
  aiPrompt?: string;
  firebaseStorageUrl?: string;
  localPath?: string;
  generatedAt?: string;
  tags?: string[];
}

export interface ImageManifest {
  version: string;
  lastUpdated: string;
  images: Map<string, ImageMetadata>;
}

const MANIFEST_PATH = path.join(__dirname, '..', 'data', 'image-manifest.json');

/**
 * Load image manifest from disk
 */
export async function loadManifest(): Promise<ImageManifest> {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    // Convert images array back to Map
    const images = new Map(
      data.images.map((img: ImageMetadata) => [img.id, img])
    );
    
    return {
      version: data.version,
      lastUpdated: data.lastUpdated,
      images
    };
  } catch (error) {
    // Return empty manifest if file doesn't exist
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      images: new Map()
    };
  }
}

/**
 * Save image manifest to disk
 */
export async function saveManifest(manifest: ImageManifest): Promise<void> {
  // Convert Map to array for JSON serialization
  const data = {
    version: manifest.version,
    lastUpdated: new Date().toISOString(),
    images: Array.from(manifest.images.values())
  };
  
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Add or update an image in the manifest
 */
export async function addImage(
  id: string,
  metadata: Omit<ImageMetadata, 'id'>
): Promise<void> {
  const manifest = await loadManifest();
  
  manifest.images.set(id, {
    id,
    ...metadata
  });
  
  await saveManifest(manifest);
}

/**
 * Get image metadata by ID
 */
export async function getImage(id: string): Promise<ImageMetadata | null> {
  const manifest = await loadManifest();
  return manifest.images.get(id) || null;
}

/**
 * Update image metadata
 */
export async function updateImage(
  id: string,
  updates: Partial<ImageMetadata>
): Promise<void> {
  const manifest = await loadManifest();
  const existing = manifest.images.get(id);
  
  if (!existing) {
    throw new Error(`Image ${id} not found in manifest`);
  }
  
  manifest.images.set(id, {
    ...existing,
    ...updates
  });
  
  await saveManifest(manifest);
}

/**
 * Remove an image from the manifest
 */
export async function removeImage(id: string): Promise<void> {
  const manifest = await loadManifest();
  manifest.images.delete(id);
  await saveManifest(manifest);
}

/**
 * Find images by page
 */
export async function getImagesByPage(pageUrl: string): Promise<ImageMetadata[]> {
  const manifest = await loadManifest();
  const images: ImageMetadata[] = [];
  
  manifest.images.forEach(img => {
    if (img.pagesUsed.includes(pageUrl)) {
      images.push(img);
    }
  });
  
  return images;
}

/**
 * Find images by tag
 */
export async function getImagesByTag(tag: string): Promise<ImageMetadata[]> {
  const manifest = await loadManifest();
  const images: ImageMetadata[] = [];
  
  manifest.images.forEach(img => {
    if (img.tags && img.tags.includes(tag)) {
      images.push(img);
    }
  });
  
  return images;
}

/**
 * Get all images
 */
export async function getAllImages(): Promise<ImageMetadata[]> {
  const manifest = await loadManifest();
  return Array.from(manifest.images.values());
}

/**
 * Get manifest statistics
 */
export async function getManifestStats(): Promise<{
  totalImages: number;
  withAIPrompts: number;
  withFirebaseUrls: number;
  totalPageUsage: number;
  topTags: { tag: string; count: number }[];
}> {
  const manifest = await loadManifest();
  const images = Array.from(manifest.images.values());
  
  const withAIPrompts = images.filter(img => img.aiPrompt).length;
  const withFirebaseUrls = images.filter(img => img.firebaseStorageUrl).length;
  const totalPageUsage = images.reduce((sum, img) => sum + img.pagesUsed.length, 0);
  
  // Count tags
  const tagCounts = new Map<string, number>();
  images.forEach(img => {
    if (img.tags) {
      img.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });
  
  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalImages: images.length,
    withAIPrompts,
    withFirebaseUrls,
    totalPageUsage,
    topTags
  };
}

/**
 * Generate a unique image ID
 */
export function generateImageId(prefix: string = 'img'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}
