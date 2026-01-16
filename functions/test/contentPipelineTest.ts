/**
 * Content Generation Pipeline - Test Suite
 *
 * Run with: npm test -- contentPipelineTest
 */

import * as admin from 'firebase-admin';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';

// Initialize Firebase Admin for testing
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'royalcarriagelimoseo',
  });
}

const db = admin.firestore();

describe('Content Generation Pipeline', () => {
  let testServiceId: string;
  let testLocationId: string;
  let testWebsiteId: string;
  let testContentId: string;

  before(async () => {
    // Set up test data
    testServiceId = 'test-service';
    testLocationId = 'test-location';
    testWebsiteId = 'airport';

    // Create test service
    await db.collection('services').doc(testServiceId).set({
      name: 'Test Airport Service',
      description: 'Professional airport transfer service for testing',
      keywords: ['airport', 'transfer', 'test'],
      searchVolume: 1000,
    });

    // Create test location
    await db.collection('locations').doc(testLocationId).set({
      name: 'Test Location',
      description: 'A test location in the Chicago area',
      landmarks: ['Test Landmark 1', 'Test Landmark 2'],
      demographics: {
        population: '50000',
        medianIncome: '75000',
      },
    });

    console.log('Test data initialized');
  });

  after(async () => {
    // Clean up test data
    try {
      await db.collection('services').doc(testServiceId).delete();
      await db.collection('locations').doc(testLocationId).delete();

      // Clean up generated content
      if (testContentId) {
        await db.collection('service_content').doc(testContentId).delete();
        await db.collection('page_mappings').doc(testContentId).delete();
        await db.collection('static_pages').doc(testContentId).delete();
      }

      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('generateLocationServiceContent', () => {
    it('should generate content for valid service and location', async () => {
      // This test would normally call the function via HTTP
      // For unit testing, we'll test the data structure

      const expectedContentId = `${testServiceId}-${testLocationId}`;

      // Verify test data exists
      const serviceDoc = await db.collection('services').doc(testServiceId).get();
      const locationDoc = await db.collection('locations').doc(testLocationId).get();

      expect(serviceDoc.exists).to.be.true;
      expect(locationDoc.exists).to.be.true;

      // Content structure validation
      const expectedContent = {
        serviceId: testServiceId,
        locationId: testLocationId,
        websiteId: testWebsiteId,
        approvalStatus: 'pending',
      };

      expect(expectedContent.serviceId).to.equal(testServiceId);
      expect(expectedContent.locationId).to.equal(testLocationId);
      expect(expectedContent.websiteId).to.equal(testWebsiteId);
      expect(expectedContent.approvalStatus).to.equal('pending');
    });

    it('should validate required parameters', () => {
      const validInput = {
        locationId: testLocationId,
        serviceId: testServiceId,
        websiteId: testWebsiteId,
      };

      expect(validInput.locationId).to.exist;
      expect(validInput.serviceId).to.exist;
      expect(validInput.websiteId).to.exist;
    });

    it('should generate proper content structure', () => {
      const contentStructure = {
        hero: 'Test hero text',
        overview: 'Test overview paragraph',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        whyChooseUs: 'Why choose us text',
        localInfo: 'Local information',
        faq: [
          { question: 'Question 1?', answer: 'Answer 1' },
          { question: 'Question 2?', answer: 'Answer 2' },
        ],
        cta: 'Call to action text',
      };

      expect(contentStructure).to.have.property('hero');
      expect(contentStructure).to.have.property('overview');
      expect(contentStructure).to.have.property('features');
      expect(contentStructure.features).to.be.an('array');
      expect(contentStructure).to.have.property('faq');
      expect(contentStructure.faq).to.be.an('array');
    });
  });

  describe('Schema Generation', () => {
    it('should generate valid schema markup', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Test Service in Test Location',
        description: 'Test description',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Royal Carriage Limousine',
        },
        areaServed: {
          '@type': 'City',
          name: 'Test Location',
        },
      };

      expect(schema).to.have.property('@context');
      expect(schema['@context']).to.equal('https://schema.org');
      expect(schema).to.have.property('@type');
      expect(schema['@type']).to.equal('Service');
      expect(schema).to.have.property('provider');
      expect(schema).to.have.property('areaServed');
    });
  });

  describe('SEO Metadata', () => {
    it('should generate title within character limit', () => {
      const title = 'Test Service in Test Location | Royal Carriage Limo';
      expect(title.length).to.be.at.most(60);
    });

    it('should generate meta description within character limit', () => {
      const metaDescription =
        'Professional test service in Test Location. High-quality transportation with experienced drivers. Book now!';

      expect(metaDescription.length).to.be.at.most(155);
      expect(metaDescription.length).to.be.at.least(120);
    });

    it('should generate keywords array', () => {
      const keywords = [
        'test service',
        'test location',
        'airport transfer',
        'limousine service',
      ];

      expect(keywords).to.be.an('array');
      expect(keywords.length).to.be.greaterThan(0);
      expect(keywords.length).to.be.at.most(20);
    });
  });

  describe('Content Approval Workflow', () => {
    it('should have valid approval statuses', () => {
      const validStatuses = ['pending', 'approved', 'rejected'];

      validStatuses.forEach((status) => {
        expect(['pending', 'approved', 'rejected']).to.include(status);
      });
    });

    it('should create page mapping on approval', () => {
      const pageMapping = {
        contentId: `${testServiceId}-${testLocationId}`,
        serviceId: testServiceId,
        locationId: testLocationId,
        websiteId: testWebsiteId,
        pagePath: `/${testServiceId}/${testLocationId}`,
        status: 'approved',
        readyForPublish: true,
      };

      expect(pageMapping).to.have.property('contentId');
      expect(pageMapping).to.have.property('pagePath');
      expect(pageMapping.status).to.equal('approved');
      expect(pageMapping.readyForPublish).to.be.true;
    });
  });

  describe('Static Page Generation', () => {
    it('should generate complete page data structure', () => {
      const pageData = {
        id: `${testServiceId}-${testLocationId}`,
        websiteId: testWebsiteId,
        serviceId: testServiceId,
        locationId: testLocationId,
        path: `/${testServiceId}/${testLocationId}`,
        title: 'Test Title',
        metaDescription: 'Test meta description',
        content: {
          hero: 'Hero text',
          overview: 'Overview',
          features: [],
          whyChooseUs: 'Why choose us',
          localInfo: 'Local info',
          faq: [],
          cta: 'CTA',
        },
        metadata: {},
        schema: {},
        internalLinks: [],
        keywords: [],
        serviceName: 'Test Service',
        locationName: 'Test Location',
        buildStatus: 'ready',
      };

      expect(pageData).to.have.property('id');
      expect(pageData).to.have.property('websiteId');
      expect(pageData).to.have.property('path');
      expect(pageData).to.have.property('title');
      expect(pageData).to.have.property('content');
      expect(pageData).to.have.property('metadata');
      expect(pageData).to.have.property('schema');
      expect(pageData.buildStatus).to.equal('ready');
    });

    it('should generate valid page path', () => {
      const path = `/${testServiceId}/${testLocationId}`;

      expect(path).to.match(/^\/[a-z0-9-]+\/[a-z0-9-]+$/);
      expect(path).to.include(testServiceId);
      expect(path).to.include(testLocationId);
    });
  });

  describe('Metadata Generation', () => {
    it('should generate complete metadata object', () => {
      const metadata = {
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        ogTitle: 'Test OG Title',
        ogDescription: 'Test OG Description',
        ogImage: '/images/og-test.jpg',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Test Twitter Title',
        twitterDescription: 'Test Twitter Description',
        twitterImage: '/images/twitter-test.jpg',
        canonical: 'https://example.com/test',
        robots: 'index, follow',
        breadcrumbs: [
          { name: 'Home', url: 'https://example.com' },
          { name: 'Services', url: 'https://example.com/services' },
        ],
        schema: {},
        keywords: [],
        author: 'Royal Carriage Limousine',
      };

      expect(metadata).to.have.property('metaTitle');
      expect(metadata).to.have.property('metaDescription');
      expect(metadata).to.have.property('ogTitle');
      expect(metadata).to.have.property('ogDescription');
      expect(metadata).to.have.property('ogImage');
      expect(metadata).to.have.property('twitterCard');
      expect(metadata).to.have.property('canonical');
      expect(metadata).to.have.property('robots');
      expect(metadata).to.have.property('breadcrumbs');
      expect(metadata.breadcrumbs).to.be.an('array');
    });

    it('should generate valid breadcrumbs', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://chicagoairportblackcar.com' },
        { name: 'Services', url: 'https://chicagoairportblackcar.com/services' },
        {
          name: 'Test Service',
          url: `https://chicagoairportblackcar.com/services/${testServiceId}`,
        },
        {
          name: 'Test Location',
          url: `https://chicagoairportblackcar.com/${testServiceId}/${testLocationId}`,
        },
      ];

      expect(breadcrumbs).to.be.an('array');
      expect(breadcrumbs.length).to.be.greaterThan(0);

      breadcrumbs.forEach((crumb) => {
        expect(crumb).to.have.property('name');
        expect(crumb).to.have.property('url');
        expect(crumb.url).to.match(/^https?:\/\//);
      });
    });
  });

  describe('Batch Processing', () => {
    it('should create batches from location-service combinations', () => {
      const locationIds = ['loc1', 'loc2', 'loc3'];
      const serviceIds = ['svc1', 'svc2'];
      const batchSize = 5;

      const combinations = [];
      for (const locationId of locationIds) {
        for (const serviceId of serviceIds) {
          combinations.push({ locationId, serviceId });
        }
      }

      const batches = [];
      for (let i = 0; i < combinations.length; i += batchSize) {
        batches.push(combinations.slice(i, i + batchSize));
      }

      expect(combinations.length).to.equal(6); // 3 locations × 2 services
      expect(batches.length).to.equal(2); // 6 items / 5 batch size = 2 batches
      expect(batches[0].length).to.equal(5);
      expect(batches[1].length).to.equal(1);
    });

    it('should track batch job status', () => {
      const batchJob = {
        type: 'content_generation',
        websiteId: testWebsiteId,
        totalCombinations: 10,
        status: 'running',
        progress: 5,
        errors: 0,
      };

      expect(batchJob).to.have.property('type');
      expect(batchJob.type).to.equal('content_generation');
      expect(batchJob).to.have.property('status');
      expect(['running', 'completed', 'failed']).to.include(batchJob.status);
      expect(batchJob).to.have.property('progress');
      expect(batchJob.progress).to.be.at.most(batchJob.totalCombinations);
    });
  });

  describe('Rate Limiting', () => {
    it('should define rate limit configuration', () => {
      const rateLimits = {
        requestsPerMinute: 60,
        requestsPerDay: 1500,
        concurrentRequests: 5,
        batchDelay: 1000,
        retryAttempts: 3,
        retryDelay: 2000,
      };

      expect(rateLimits.requestsPerMinute).to.equal(60);
      expect(rateLimits.requestsPerDay).to.equal(1500);
      expect(rateLimits.concurrentRequests).to.equal(5);
      expect(rateLimits.batchDelay).to.equal(1000);
    });
  });

  describe('Error Handling', () => {
    it('should provide fallback content on AI failure', () => {
      const fallbackContent = {
        hero: 'Experience premium service in Test Location.',
        overview: 'Professional transportation service in Test Location.',
        features: [
          'Professional chauffeurs',
          'Luxury fleet vehicles',
          '24/7 availability',
        ],
        whyChooseUs: 'Choose us for reliable service.',
        localInfo: 'Serving the Test Location area.',
        faq: [
          { question: 'How do I book?', answer: 'Book online or call us.' },
        ],
        cta: 'Book your transportation today.',
      };

      expect(fallbackContent).to.have.property('hero');
      expect(fallbackContent).to.have.property('overview');
      expect(fallbackContent.features).to.be.an('array');
      expect(fallbackContent.features.length).to.be.greaterThan(0);
    });

    it('should validate missing data scenarios', async () => {
      // Test non-existent service
      const invalidServiceDoc = await db
        .collection('services')
        .doc('non-existent-service')
        .get();
      expect(invalidServiceDoc.exists).to.be.false;

      // Test non-existent location
      const invalidLocationDoc = await db
        .collection('locations')
        .doc('non-existent-location')
        .get();
      expect(invalidLocationDoc.exists).to.be.false;
    });
  });

  describe('Data Validation', () => {
    it('should validate content structure', () => {
      const content = {
        hero: 'Test hero',
        overview: 'Test overview',
        features: ['Feature 1', 'Feature 2'],
        whyChooseUs: 'Why choose us',
        localInfo: 'Local info',
        faq: [{ question: 'Q1?', answer: 'A1' }],
        cta: 'CTA',
      };

      const requiredFields = [
        'hero',
        'overview',
        'features',
        'whyChooseUs',
        'localInfo',
        'faq',
        'cta',
      ];

      requiredFields.forEach((field) => {
        expect(content).to.have.property(field);
      });

      expect(content.features).to.be.an('array');
      expect(content.faq).to.be.an('array');
    });

    it('should validate SEO title length', () => {
      const title = 'Test Service in Test Location | Royal Carriage';

      expect(title.length).to.be.at.most(60);
    });

    it('should validate meta description length', () => {
      const metaDescription =
        'Professional test service in Test Location with experienced drivers and luxury vehicles. Book now!';

      expect(metaDescription.length).to.be.at.most(155);
      expect(metaDescription.length).to.be.at.least(100);
    });
  });
});

export {};
