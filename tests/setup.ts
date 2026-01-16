/**
 * Test setup file
 * Runs before all tests
 */

import { vi } from "vitest";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.GOOGLE_CLOUD_PROJECT = "test-project";
process.env.GOOGLE_CLOUD_LOCATION = "us-central1";
process.env.GOOGLE_CLOUD_STORAGE_BUCKET = "test-bucket";
process.env.SESSION_SECRET = "test-secret-key-for-testing-only";

// Global mocks
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};
