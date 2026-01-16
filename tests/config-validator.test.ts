/**
 * Tests for Configuration Validator
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ConfigurationValidator } from "../server/ai/config-validator";

describe("ConfigurationValidator", () => {
  let validator: ConfigurationValidator;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    process.env.GOOGLE_CLOUD_LOCATION = "us-central1";
    process.env.GOOGLE_CLOUD_STORAGE_BUCKET = "test-bucket";

    validator = new ConfigurationValidator();
  });

  describe("validateEnvironmentVariables", () => {
    it("should pass when all required env vars are set", async () => {
      const results = await validator.validateAll();
      const envResults = results.filter(
        (r) => r.service === "Environment Variables",
      );

      expect(envResults.length).toBeGreaterThan(0);
      expect(envResults.some((r) => r.valid === true)).toBe(true);
    });

    it("should warn when GOOGLE_CLOUD_LOCATION is not set", async () => {
      delete process.env.GOOGLE_CLOUD_LOCATION;
      const newValidator = new ConfigurationValidator();

      const results = await newValidator.validateAll();
      const locationWarning = results.find(
        (r) =>
          r.service === "Environment Variables" &&
          r.message.includes("GOOGLE_CLOUD_LOCATION"),
      );

      expect(locationWarning).toBeDefined();
      expect(locationWarning?.severity).toBe("warning");
    });

    it("should fail when GOOGLE_CLOUD_PROJECT is not set", async () => {
      delete process.env.GOOGLE_CLOUD_PROJECT;
      const newValidator = new ConfigurationValidator();

      const results = await newValidator.validateAll();
      const projectError = results.find(
        (r) =>
          r.service === "Environment Variables" &&
          r.message.includes("GOOGLE_CLOUD_PROJECT") &&
          !r.valid,
      );

      expect(projectError).toBeDefined();
      expect(projectError?.severity).toBe("error");
    });
  });

  describe("isSystemReady", () => {
    it("should return ready status when all checks pass", async () => {
      const readiness = await validator.isSystemReady();

      expect(readiness).toBeDefined();
      expect(readiness.message).toBeDefined();
    });

    it("should return not ready when critical errors exist", async () => {
      delete process.env.GOOGLE_CLOUD_PROJECT;
      const newValidator = new ConfigurationValidator();

      const readiness = await newValidator.isSystemReady();

      expect(readiness.ready).toBe(false);
      expect(readiness.message).toContain("not ready");
    });
  });

  describe("generateSetupInstructions", () => {
    it("should generate success message when no issues", async () => {
      const results = await validator.validateAll();
      const validResults = results.map((r) => ({
        ...r,
        valid: true,
        severity: "info" as const,
      }));

      const instructions = validator.generateSetupInstructions(validResults);

      expect(instructions).toBeDefined();
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0]).toContain("configured correctly");
    });

    it("should generate instructions when errors exist", async () => {
      const results = [
        {
          valid: false,
          service: "Test Service",
          message: "Test error",
          severity: "error" as const,
        },
      ];

      const instructions = validator.generateSetupInstructions(results);

      expect(instructions.some((i) => i.includes("ERRORS"))).toBe(true);
      expect(instructions.some((i) => i.includes("Test Service"))).toBe(true);
    });

    it("should generate instructions when warnings exist", async () => {
      const results = [
        {
          valid: true,
          service: "Test Service",
          message: "Test warning",
          severity: "warning" as const,
        },
      ];

      const instructions = validator.generateSetupInstructions(results);

      expect(instructions.some((i) => i.includes("WARNINGS"))).toBe(true);
    });
  });

  describe("validateAll", () => {
    it("should return an array of validation results", async () => {
      const results = await validator.validateAll();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("valid");
      expect(results[0]).toHaveProperty("service");
      expect(results[0]).toHaveProperty("message");
      expect(results[0]).toHaveProperty("severity");
    });

    it("should include checks for multiple services", async () => {
      const results = await validator.validateAll();
      const services = new Set(results.map((r) => r.service));

      expect(services.has("Environment Variables")).toBe(true);
      expect(services.size).toBeGreaterThan(1);
    });
  });
});
