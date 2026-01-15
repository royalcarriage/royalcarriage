/**
 * Configuration Validator
 * Validates that all required Google Cloud services and configurations are properly set up
 */

import { VertexAI } from '@google-cloud/vertexai';

export interface ValidationResult {
  valid: boolean;
  service: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export class ConfigurationValidator {
  private projectId: string;
  private location: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  }

  /**
   * Validate all required configurations
   */
  async validateAll(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check environment variables
    results.push(...this.validateEnvironmentVariables());

    // Check Vertex AI
    results.push(await this.validateVertexAI());

    // Check Cloud Storage
    results.push(await this.validateCloudStorage());

    // Check Firestore
    results.push(await this.validateFirestore());

    return results;
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironmentVariables(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Check GOOGLE_CLOUD_PROJECT
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      results.push({
        valid: false,
        service: 'Environment Variables',
        message: 'GOOGLE_CLOUD_PROJECT not set. This is required for Vertex AI.',
        severity: 'error',
      });
    } else {
      results.push({
        valid: true,
        service: 'Environment Variables',
        message: `GOOGLE_CLOUD_PROJECT: ${process.env.GOOGLE_CLOUD_PROJECT}`,
        severity: 'info',
      });
    }

    // Check GOOGLE_CLOUD_LOCATION
    if (!process.env.GOOGLE_CLOUD_LOCATION) {
      results.push({
        valid: true,
        service: 'Environment Variables',
        message: 'GOOGLE_CLOUD_LOCATION not set, using default: us-central1',
        severity: 'warning',
      });
    } else {
      results.push({
        valid: true,
        service: 'Environment Variables',
        message: `GOOGLE_CLOUD_LOCATION: ${process.env.GOOGLE_CLOUD_LOCATION}`,
        severity: 'info',
      });
    }

    // Check GOOGLE_CLOUD_STORAGE_BUCKET
    if (!process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
      results.push({
        valid: true,
        service: 'Environment Variables',
        message: 'GOOGLE_CLOUD_STORAGE_BUCKET not set. Images will use data URLs instead of Cloud Storage.',
        severity: 'warning',
      });
    } else {
      results.push({
        valid: true,
        service: 'Environment Variables',
        message: `GOOGLE_CLOUD_STORAGE_BUCKET: ${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}`,
        severity: 'info',
      });
    }

    return results;
  }

  /**
   * Validate Vertex AI access
   */
  private async validateVertexAI(): Promise<ValidationResult> {
    if (!this.projectId) {
      return {
        valid: false,
        service: 'Vertex AI',
        message: 'Cannot validate Vertex AI: GOOGLE_CLOUD_PROJECT not set',
        severity: 'error',
      };
    }

    try {
      const vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location,
      });

      // Try to initialize a model to test access
      const model = vertexAI.preview.getGenerativeModel({
        model: 'imagen-3.0-generate-001',
      });

      return {
        valid: true,
        service: 'Vertex AI',
        message: 'Vertex AI initialized successfully. Imagen model accessible.',
        severity: 'info',
      };
    } catch (error) {
      return {
        valid: false,
        service: 'Vertex AI',
        message: `Vertex AI initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Ensure aiplatform.googleapis.com API is enabled and service account has roles/aiplatform.user role.`,
        severity: 'error',
      };
    }
  }

  /**
   * Validate Cloud Storage access
   */
  private async validateCloudStorage(): Promise<ValidationResult> {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

    if (!bucketName) {
      return {
        valid: true,
        service: 'Cloud Storage',
        message: 'Cloud Storage bucket not configured. Images will use data URLs (base64).',
        severity: 'warning',
      };
    }

    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage({ projectId: this.projectId });
      const bucket = storage.bucket(bucketName);

      // Check if bucket exists
      const [exists] = await bucket.exists();

      if (!exists) {
        return {
          valid: false,
          service: 'Cloud Storage',
          message: `Bucket "${bucketName}" does not exist. Run setup script to create it.`,
          severity: 'error',
        };
      }

      return {
        valid: true,
        service: 'Cloud Storage',
        message: `Cloud Storage bucket "${bucketName}" is accessible.`,
        severity: 'info',
      };
    } catch (error) {
      return {
        valid: false,
        service: 'Cloud Storage',
        message: `Cloud Storage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Ensure storage-api.googleapis.com is enabled and service account has storage permissions.`,
        severity: 'error',
      };
    }
  }

  /**
   * Validate Firestore access
   */
  private async validateFirestore(): Promise<ValidationResult> {
    try {
      // Try to import firebase-admin
      const admin = await import('firebase-admin');
      
      // Check if Firebase is initialized
      if (admin.apps.length === 0) {
        return {
          valid: false,
          service: 'Firestore',
          message: 'Firebase Admin not initialized. Firestore access unavailable.',
          severity: 'error',
        };
      }

      // Try to access Firestore
      const db = admin.firestore();
      
      // Test read access
      await db.collection('ai_settings').limit(1).get();

      return {
        valid: true,
        service: 'Firestore',
        message: 'Firestore is accessible.',
        severity: 'info',
      };
    } catch (error) {
      return {
        valid: false,
        service: 'Firestore',
        message: `Firestore validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      };
    }
  }

  /**
   * Generate setup instructions based on validation results
   */
  generateSetupInstructions(results: ValidationResult[]): string[] {
    const instructions: string[] = [];
    const errors = results.filter(r => !r.valid && r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');

    if (errors.length === 0 && warnings.length === 0) {
      instructions.push('✅ All systems configured correctly! Image generation is ready to use.');
      return instructions;
    }

    instructions.push('🔧 Configuration Issues Found:\n');

    if (errors.length > 0) {
      instructions.push('ERRORS (Must Fix):');
      errors.forEach(error => {
        instructions.push(`  ❌ ${error.service}: ${error.message}`);
      });
      instructions.push('');
    }

    if (warnings.length > 0) {
      instructions.push('WARNINGS (Recommended):');
      warnings.forEach(warning => {
        instructions.push(`  ⚠️  ${warning.service}: ${warning.message}`);
      });
      instructions.push('');
    }

    instructions.push('📚 To fix these issues:');
    instructions.push('1. Review docs/GOOGLE_CLOUD_SECURITY_AUDIT.md');
    instructions.push('2. Run: ./script/setup-gcloud-security.sh');
    instructions.push('3. Or follow: docs/ENABLE_IMAGE_GENERATION.md');

    return instructions;
  }

  /**
   * Check if system is ready for image generation
   */
  async isSystemReady(): Promise<{ ready: boolean; message: string }> {
    const results = await this.validateAll();
    const errors = results.filter(r => !r.valid && r.severity === 'error');

    if (errors.length === 0) {
      return {
        ready: true,
        message: 'System is ready for image generation',
      };
    }

    return {
      ready: false,
      message: `System not ready: ${errors.length} error(s) found. Run validation to see details.`,
    };
  }
}

/**
 * Helper function to run validation and log results
 */
export async function runConfigurationCheck(): Promise<void> {
  console.log('🔍 Running Google Cloud Configuration Check...\n');

  const validator = new ConfigurationValidator();
  const results = await validator.validateAll();

  // Log each result
  results.forEach(result => {
    const icon = result.valid 
      ? (result.severity === 'warning' ? '⚠️ ' : '✅') 
      : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
  });

  console.log('');

  // Generate and log setup instructions
  const instructions = validator.generateSetupInstructions(results);
  instructions.forEach(line => console.log(line));

  console.log('');

  // Check overall readiness
  const readiness = await validator.isSystemReady();
  console.log(readiness.ready ? '✅' : '❌', readiness.message);
}
