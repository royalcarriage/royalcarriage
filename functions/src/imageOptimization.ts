/**
 * RC-202: Image Optimization Pipeline
 * WebP conversion, responsive sizes, lazy loading, CDN caching, image audit
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import sharp from 'sharp';
import path from 'path';

const db = admin.firestore();
const storage = admin.storage().bucket();

// Responsive image sizes
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1024, height: 768 },
  xlarge: { width: 1920, height: 1080 },
} as const;

type ImageSize = keyof typeof IMAGE_SIZES;

// Image quality settings
const QUALITY_SETTINGS = {
  webp: 85,
  avif: 80,
  jpeg: 85,
  png: 90,
};

// CDN cache headers
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
};

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  formats: string[];
  sizes: string[];
  urls: Record<string, Record<string, string>>;
}

interface ImageAuditResult {
  totalImages: number;
  optimizedImages: number;
  unoptimizedImages: number;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  recommendations: string[];
}

/**
 * Optimize a single image on upload
 * Triggered when image is uploaded to /images/ path
 */
export const optimizeImageOnUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;

    // Only process images in specific paths
    if (!filePath?.startsWith('images/') && !filePath?.startsWith('ai-generated/')) {
      return null;
    }

    // Only process image files
    if (!contentType?.startsWith('image/')) {
      return null;
    }

    // Skip already optimized images
    if (filePath.includes('/optimized/')) {
      return null;
    }

    functions.logger.info('Optimizing image', { filePath, contentType });

    try {
      // Download original image
      const tempFilePath = `/tmp/${path.basename(filePath)}`;
      await storage.file(filePath).download({ destination: tempFilePath });

      const originalStats = await storage.file(filePath).getMetadata();
      const originalSize = parseInt(String(originalStats[0].size || '0'));

      // Generate optimized versions
      const results = await generateOptimizedVersions(tempFilePath, filePath);

      // Store optimization metadata
      const imageId = filePath.replace(/\//g, '_').replace(/\./g, '_');
      await db.collection('image_optimizations').doc(imageId).set({
        originalPath: filePath,
        originalSize,
        contentType,
        optimization: results,
        optimizedAt: admin.firestore.Timestamp.now(),
      });

      functions.logger.info('Image optimization complete', {
        filePath,
        originalSize,
        optimizedSize: results.optimizedSize,
        savings: `${results.compressionRatio.toFixed(1)}%`,
      });

      return results;
    } catch (error) {
      functions.logger.error('Image optimization failed', { filePath, error });
      return null;
    }
  });

/**
 * Generate optimized versions of an image
 */
async function generateOptimizedVersions(
  inputPath: string,
  originalPath: string
): Promise<OptimizationResult> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const originalSize = metadata.size || 0;

  const basePath = path.dirname(originalPath);
  const fileName = path.basename(originalPath, path.extname(originalPath));
  const optimizedBasePath = `${basePath}/optimized/${fileName}`;

  const urls: Record<string, Record<string, string>> = {};
  let totalOptimizedSize = 0;
  const formats: string[] = [];
  const sizes: string[] = [];

  // Generate WebP and AVIF for each size
  for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
    urls[sizeName] = {};

    // WebP format
    const webpBuffer = await image
      .clone()
      .resize(dimensions.width, dimensions.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY_SETTINGS.webp })
      .toBuffer();

    const webpPath = `${optimizedBasePath}_${sizeName}.webp`;
    await storage.file(webpPath).save(webpBuffer, {
      metadata: {
        contentType: 'image/webp',
        metadata: CACHE_HEADERS,
      },
    });

    urls[sizeName].webp = `https://storage.googleapis.com/${storage.name}/${webpPath}`;
    totalOptimizedSize += webpBuffer.length;

    // AVIF format (smaller but less compatible)
    try {
      const avifBuffer = await image
        .clone()
        .resize(dimensions.width, dimensions.height, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: QUALITY_SETTINGS.avif })
        .toBuffer();

      const avifPath = `${optimizedBasePath}_${sizeName}.avif`;
      await storage.file(avifPath).save(avifBuffer, {
        metadata: {
          contentType: 'image/avif',
          metadata: CACHE_HEADERS,
        },
      });

      urls[sizeName].avif = `https://storage.googleapis.com/${storage.name}/${avifPath}`;
    } catch (avifError) {
      // AVIF not supported for all images
      functions.logger.warn('AVIF generation skipped', { sizeName });
    }

    sizes.push(sizeName);
  }

  formats.push('webp', 'avif');

  const compressionRatio = ((originalSize - totalOptimizedSize) / originalSize) * 100;

  return {
    originalSize,
    optimizedSize: totalOptimizedSize,
    compressionRatio,
    formats,
    sizes,
    urls,
  };
}

/**
 * Batch optimize existing images
 */
export const batchOptimizeImages = functions.https.onCall(
  async (data: { path?: string; limit?: number }) => {
    const { path: targetPath = 'images/', limit = 50 } = data;

    functions.logger.info('Starting batch image optimization', { targetPath, limit });

    const [files] = await storage.getFiles({ prefix: targetPath });

    const imagesToOptimize = files
      .filter((file) => {
        const contentType = file.metadata.contentType || '';
        return contentType.startsWith('image/') && !file.name.includes('/optimized/');
      })
      .slice(0, limit);

    let processed = 0;
    let skipped = 0;
    const results: Array<{ path: string; success: boolean; error?: string }> = [];

    for (const file of imagesToOptimize) {
      try {
        // Check if already optimized
        const imageId = file.name.replace(/\//g, '_').replace(/\./g, '_');
        const existingOpt = await db.collection('image_optimizations').doc(imageId).get();

        if (existingOpt.exists) {
          skipped++;
          continue;
        }

        // Download and optimize
        const tempPath = `/tmp/${path.basename(file.name)}`;
        await file.download({ destination: tempPath });

        const optimization = await generateOptimizedVersions(tempPath, file.name);

        await db.collection('image_optimizations').doc(imageId).set({
          originalPath: file.name,
          originalSize: optimization.originalSize,
          optimization,
          optimizedAt: admin.firestore.Timestamp.now(),
        });

        processed++;
        results.push({ path: file.name, success: true });
      } catch (error) {
        results.push({
          path: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      processed,
      skipped,
      total: imagesToOptimize.length,
      results,
    };
  }
);

/**
 * Generate srcset attributes for responsive images
 */
export const generateSrcset = functions.https.onCall(
  async (data: { imagePath: string; format?: 'webp' | 'avif' }) => {
    const { imagePath, format = 'webp' } = data;

    const imageId = imagePath.replace(/\//g, '_').replace(/\./g, '_');
    const optimizationDoc = await db.collection('image_optimizations').doc(imageId).get();

    if (!optimizationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Image not optimized');
    }

    const optimization = optimizationDoc.data()?.optimization;
    const urls = optimization?.urls;

    if (!urls) {
      throw new functions.https.HttpsError('internal', 'Optimization data missing');
    }

    // Generate srcset string
    const srcsetParts: string[] = [];
    const sizesMap: Record<string, number> = {
      thumbnail: 150,
      small: 320,
      medium: 640,
      large: 1024,
      xlarge: 1920,
    };

    for (const [sizeName, width] of Object.entries(sizesMap)) {
      const url = urls[sizeName]?.[format];
      if (url) {
        srcsetParts.push(`${url} ${width}w`);
      }
    }

    return {
      srcset: srcsetParts.join(', '),
      sizes: '(max-width: 320px) 280px, (max-width: 640px) 600px, (max-width: 1024px) 960px, 1920px',
      src: urls.large?.[format] || urls.medium?.[format],
      loading: 'lazy',
      decoding: 'async',
    };
  }
);

/**
 * Run image audit across all storage
 */
export const runImageAudit = functions.https.onCall(
  async (data: { path?: string }): Promise<ImageAuditResult> => {
    const { path: targetPath = '' } = data;

    functions.logger.info('Running image audit', { targetPath });

    const [files] = await storage.getFiles({ prefix: targetPath });

    const imageFiles = files.filter((file) => {
      const contentType = file.metadata.contentType || '';
      return contentType.startsWith('image/');
    });

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    let optimizedCount = 0;
    let unoptimizedCount = 0;
    const recommendations: string[] = [];

    for (const file of imageFiles) {
      const size = parseInt(String(file.metadata.size || '0'));
      totalOriginalSize += size;

      const imageId = file.name.replace(/\//g, '_').replace(/\./g, '_');
      const optimizationDoc = await db.collection('image_optimizations').doc(imageId).get();

      if (optimizationDoc.exists) {
        optimizedCount++;
        const optData = optimizationDoc.data();
        totalOptimizedSize += optData?.optimization?.optimizedSize || size;
      } else {
        unoptimizedCount++;
        totalOptimizedSize += size;

        if (size > 500000) {
          recommendations.push(`Large image needs optimization: ${file.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
        }
      }
    }

    const savingsBytes = totalOriginalSize - totalOptimizedSize;
    const savingsPercent = totalOriginalSize > 0 ? (savingsBytes / totalOriginalSize) * 100 : 0;

    // Add general recommendations
    if (unoptimizedCount > 0) {
      recommendations.push(`${unoptimizedCount} images need optimization. Run batchOptimizeImages()`);
    }

    if (savingsPercent < 30 && optimizedCount > 0) {
      recommendations.push('Consider using AVIF format for additional compression');
    }

    // Store audit result
    await db.collection('image_audits').add({
      path: targetPath,
      totalImages: imageFiles.length,
      optimizedImages: optimizedCount,
      unoptimizedImages: unoptimizedCount,
      totalOriginalSize,
      totalOptimizedSize,
      savingsBytes,
      savingsPercent,
      recommendations,
      auditedAt: admin.firestore.Timestamp.now(),
    });

    return {
      totalImages: imageFiles.length,
      optimizedImages: optimizedCount,
      unoptimizedImages: unoptimizedCount,
      totalOriginalSize,
      totalOptimizedSize,
      savingsBytes,
      savingsPercent,
      recommendations,
    };
  }
);

/**
 * Get optimized image URL with format negotiation
 */
export const getOptimizedImageUrl = functions.https.onCall(
  async (data: { imagePath: string; size?: ImageSize; preferAvif?: boolean }) => {
    const { imagePath, size = 'large', preferAvif = false } = data;

    const imageId = imagePath.replace(/\//g, '_').replace(/\./g, '_');
    const optimizationDoc = await db.collection('image_optimizations').doc(imageId).get();

    if (!optimizationDoc.exists) {
      // Return original path if not optimized
      return {
        url: `https://storage.googleapis.com/${storage.name}/${imagePath}`,
        optimized: false,
      };
    }

    const urls = optimizationDoc.data()?.optimization?.urls;
    const format = preferAvif && urls[size]?.avif ? 'avif' : 'webp';

    return {
      url: urls[size]?.[format] || urls.large?.webp,
      optimized: true,
      format,
      size,
    };
  }
);
