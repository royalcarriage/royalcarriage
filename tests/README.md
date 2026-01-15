# Tests

This directory contains unit tests for the Royal Carriage AI Image Generation system.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run smoke tests (integration tests)
npm run test:smoke
```

## Test Structure

- `image-generator.test.ts` - Tests for AI image generation functionality
- `config-validator.test.ts` - Tests for system configuration validation
- `setup.ts` - Test setup and global mocks

## Test Coverage

Tests cover:
- ✅ Image generation with different purposes (hero, service_card, fleet, location, testimonial)
- ✅ Prompt generation and customization
- ✅ Graceful fallbacks when services unavailable
- ✅ Configuration validation
- ✅ Environment variable checks
- ✅ System readiness assessment

## Writing New Tests

When adding new tests:

1. Create test file with `.test.ts` extension
2. Import testing utilities from `vitest`
3. Use `describe` blocks to group related tests
4. Use `beforeEach` for setup
5. Mock external dependencies appropriately

Example:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YourModule } from '../path/to/module';

describe('YourModule', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should do something', () => {
    // Test code
    expect(something).toBe(expected);
  });
});
```

## Mocking

The test setup includes mocks for:
- `@google-cloud/vertexai` - Vertex AI API
- `@google-cloud/storage` - Cloud Storage API
- Console methods (log, error, warn)
- Environment variables

## Coverage

Coverage reports are generated in the `coverage/` directory and include:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Aim for >80% coverage for new code.

## CI/CD

Tests run automatically on:
- Push to main, develop, or copilot/** branches
- Pull requests to main or develop
- Manual workflow dispatch

See `.github/workflows/ci-test-build.yml` for CI configuration.
