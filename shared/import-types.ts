/**
 * TypeScript types for CSV Import System
 * Moovs reservation data import with accounting, fleet, payroll, and marketing attribution
 */

import { z } from 'zod';

// ============================================================================
// Raw Import Batch and Rows
// ============================================================================

export const RawImportBatchSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalFilename: z.string(),
  storageUrl: z.string(), // Firebase Storage URL
  sha256Hash: z.string(),
  fileSize: z.number(),
  rowCount: z.number(),
  uploadedAt: z.date(),
  uploadedBy: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  processedAt: z.date().optional(),
  errorMessage: z.string().optional(),
});

export type RawImportBatch = z.infer<typeof RawImportBatchSchema>;

export const RawImportRowSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  rowNumber: z.number(),
  rawData: z.record(z.string(), z.any()), // Original CSV row as JSON
  normalizedData: z.record(z.string(), z.any()).optional(), // After column mapping
  status: z.enum(['pending', 'processed', 'skipped', 'failed']),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
});

export type RawImportRow = z.infer<typeof RawImportRowSchema>;

// ============================================================================
// Booking Entity
// ============================================================================

export const BookingStatusSchema = z.object({
  statusSlug: z.string(), // e.g., 'completed', 'cancelled', 'pending'
  closedStatus: z.string().optional(),
  cancelled: z.boolean().default(false),
});

export const BookingContactSchema = z.object({
  bookingContact: z.string().optional(),
  passengerName: z.string().optional(),
  emails: z.array(z.string()).default([]),
  phones: z.array(z.string()).default([]),
});

export const BookingServiceSchema = z.object({
  tripType: z.string().optional(), // e.g., 'Airport Transfer', 'Hourly Charter'
  orderType: z.string().optional(),
  classification: z.string().optional(),
  passengers: z.number().optional(),
  stops: z.number().default(0),
  distance: z.number().optional(), // miles
  driveTime: z.number().optional(), // minutes
});

export const BookingVehicleSchema = z.object({
  vehicleId: z.string().optional(),
  vehicleType: z.string().optional(), // e.g., 'Sedan', 'SUV', 'Sprinter'
  vehicleName: z.string().optional(),
});

export const BookingAttributionSchema = z.object({
  reqSource: z.string().optional(), // e.g., 'google_ads', 'direct', 'referral'
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  gclid: z.string().optional(),
  wbraid: z.string().optional(),
  gbraid: z.string().optional(),
  queryString: z.string().optional(), // Full query string for parsing
});

export const BookingSchema = z.object({
  id: z.string(),
  bookingId: z.string(), // From Trip ID, fallback to Trip Conf or Reservation Conf
  
  // Status
  status: BookingStatusSchema,
  
  // Timestamps
  createdAt: z.date(),
  pickupDatetime: z.date(),
  
  // Locations
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  
  // Service details
  service: BookingServiceSchema,
  
  // Vehicle
  vehicle: BookingVehicleSchema,
  
  // Contacts
  contacts: BookingContactSchema,
  
  // Attribution
  attribution: BookingAttributionSchema,
  
  // Import metadata
  importBatchId: z.string(),
  importRowId: z.string(),
  
  // Timestamps
  updatedAt: z.date(),
});

export type Booking = z.infer<typeof BookingSchema>;

// ============================================================================
// Revenue Lines
// ============================================================================

export const RevenueLineTypeSchema = z.enum([
  'base_rate',
  'meet_greet',
  'tolls',
  'other1',
  'other2',
  'other3',
  'tax',
  'discount',
  'promo_applied',
  'refund',
  'gratuity',
]);

export type RevenueLineType = z.infer<typeof RevenueLineTypeSchema>;

export const RevenueLineSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  
  lineType: RevenueLineTypeSchema,
  description: z.string().optional(),
  amount: z.number(), // USD, numeric
  
  // Computed fields
  isRevenue: z.boolean().default(true), // false for discounts/refunds
  
  createdAt: z.date(),
});

export type RevenueLine = z.infer<typeof RevenueLineSchema>;

// Helper to compute totals
export interface BookingRevenueSummary {
  bookingId: string;
  subtotal: number; // Sum of base + extras before tax/discount
  totalCharged: number; // Final amount charged
  netRevenue: number; // After discounts/refunds
  taxAmount: number;
  discountAmount: number;
  refundAmount: number;
  gratuityAmount: number;
}

// ============================================================================
// Receivables
// ============================================================================

export const ReceivableSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  
  amountPaid: z.number().default(0),
  amountDue: z.number().default(0),
  paymentMethod: z.string().optional(), // e.g., 'credit_card', 'invoice', 'cash'
  paymentStatus: z.enum(['paid', 'partial', 'unpaid', 'overdue']),
  
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  
  notes: z.string().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Receivable = z.infer<typeof ReceivableSchema>;

// AR Aging buckets
export interface ARAgingReport {
  current: number; // 0-30 days
  days30: number; // 31-60 days
  days60: number; // 61-90 days
  days90Plus: number; // 90+ days
  total: number;
}

// ============================================================================
// Driver Payouts
// ============================================================================

export const DriverPayoutSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  
  // Payout components
  payoutFlat: z.number().default(0),
  payoutHourly: z.number().default(0),
  payoutGratuity: z.number().default(0),
  totalDriverPayout: z.number(),
  
  // Status
  earningStatus: z.enum(['pending', 'approved', 'paid']),
  payPeriod: z.string(), // e.g., '2026-W03' (ISO week)
  payPeriodStart: z.date(),
  payPeriodEnd: z.date(),
  
  paidAt: z.date().optional(),
  
  notes: z.string().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DriverPayout = z.infer<typeof DriverPayoutSchema>;

// Weekly payroll summary
export interface WeeklyPayrollSummary {
  payPeriod: string;
  startDate: Date;
  endDate: Date;
  driverCount: number;
  totalPayout: number;
  tripCount: number;
  byDriver: {
    driverId: string;
    driverName: string;
    tripCount: number;
    totalPayout: number;
    flatPayout: number;
    hourlyPayout: number;
    gratuity: number;
  }[];
}

// ============================================================================
// Affiliate Payables
// ============================================================================

export const AffiliatePayableSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  
  affiliateName: z.string(),
  affiliateId: z.string().optional(),
  
  payableAmount: z.number(),
  
  payableStatus: z.enum(['unpaid', 'paid', 'processing', 'disputed']),
  
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  
  notes: z.string().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AffiliatePayable = z.infer<typeof AffiliatePayableSchema>;

// ============================================================================
// Fleet Vehicle Registry
// ============================================================================

export const FleetVehicleSchema = z.object({
  id: z.string(),
  vehicleId: z.string().unique(),
  
  vehicleType: z.string(), // e.g., 'Sedan', 'SUV', 'Sprinter'
  vehicleName: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  
  status: z.enum(['active', 'maintenance', 'retired']),
  
  // Metrics (computed)
  totalTrips: z.number().default(0),
  totalRevenue: z.number().default(0),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FleetVehicle = z.infer<typeof FleetVehicleSchema>;

// Fleet utilization metrics
export interface FleetUtilizationMetrics {
  vehicleId: string;
  vehicleType: string;
  vehicleName?: string;
  
  // Weekly metrics
  tripsPerWeek: number;
  revenuePerWeek: number;
  
  // All-time
  totalTrips: number;
  totalRevenue: number;
  
  utilizationRate: number; // trips per week / capacity
}

// ============================================================================
// Marketing Attribution Data
// ============================================================================

export const MarketingGA4DailySchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  
  landingPage: z.string(),
  pagePath: z.string(),
  source: z.string().optional(),
  medium: z.string().optional(),
  
  sessions: z.number().default(0),
  conversions: z.number().default(0),
  revenue: z.number().default(0),
  
  createdAt: z.date(),
});

export type MarketingGA4Daily = z.infer<typeof MarketingGA4DailySchema>;

export const MarketingGoogleAdsDailySchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  
  campaign: z.string(),
  adGroup: z.string().optional(),
  keyword: z.string().optional(),
  
  cost: z.number().default(0),
  clicks: z.number().default(0),
  impressions: z.number().default(0),
  conversions: z.number().default(0),
  conversionValue: z.number().default(0),
  
  createdAt: z.date(),
});

export type MarketingGoogleAdsDaily = z.infer<typeof MarketingGoogleAdsDailySchema>;

// ============================================================================
// Column Mapping Configuration
// ============================================================================

export interface ColumnMapping {
  sourceColumn: string; // Moovs column name
  targetField: string; // Canonical field name
  transform?: 'money' | 'percent' | 'date' | 'datetime' | 'phone' | 'email' | 'boolean';
  required: boolean;
  defaultValue?: any;
}

export interface MoovsColumnMappings {
  // Booking ID
  tripId: ColumnMapping;
  tripConf: ColumnMapping;
  reservationConf: ColumnMapping;
  
  // Status
  statusSlug: ColumnMapping;
  closedStatus: ColumnMapping;
  cancelled: ColumnMapping;
  
  // Dates
  createdAt: ColumnMapping;
  pickupDate: ColumnMapping;
  pickupTime: ColumnMapping;
  
  // Locations
  pickupAddress: ColumnMapping;
  dropoffAddress: ColumnMapping;
  
  // Service
  tripType: ColumnMapping;
  orderType: ColumnMapping;
  classification: ColumnMapping;
  passengers: ColumnMapping;
  stops: ColumnMapping;
  distance: ColumnMapping;
  driveTime: ColumnMapping;
  
  // Vehicle
  vehicleId: ColumnMapping;
  vehicleType: ColumnMapping;
  vehicleName: ColumnMapping;
  
  // Contacts
  bookingContact: ColumnMapping;
  passengerName: ColumnMapping;
  email: ColumnMapping;
  phone: ColumnMapping;
  
  // Attribution
  reqSource: ColumnMapping;
  queryString: ColumnMapping;
  
  // Revenue
  baseRate: ColumnMapping;
  meetGreet: ColumnMapping;
  tolls: ColumnMapping;
  other1: ColumnMapping;
  other2: ColumnMapping;
  other3: ColumnMapping;
  tax: ColumnMapping;
  discount: ColumnMapping;
  promoApplied: ColumnMapping;
  refund: ColumnMapping;
  gratuity: ColumnMapping;
  totalAmount: ColumnMapping;
  
  // Payments
  amountPaid: ColumnMapping;
  amountDue: ColumnMapping;
  paymentMethod: ColumnMapping;
  paymentStatus: ColumnMapping;
  
  // Driver
  driverId: ColumnMapping;
  driverName: ColumnMapping;
  driverPayout: ColumnMapping;
  driverPayoutFlat: ColumnMapping;
  driverPayoutHourly: ColumnMapping;
  driverPayoutGratuity: ColumnMapping;
  
  // Affiliate
  affiliateName: ColumnMapping;
  affiliatePayable: ColumnMapping;
}

// ============================================================================
// Import Audit Report
// ============================================================================

export interface ImportAuditReport {
  batchId: string;
  filename: string;
  
  // Row counts
  rowsTotal: number;
  rowsImported: number;
  rowsSkipped: number;
  rowsDuplicate: number;
  rowsFailed: number;
  
  // Parse errors
  parseErrors: {
    rowNumber: number;
    field: string;
    value: any;
    error: string;
  }[];
  
  // Validation warnings
  warnings: {
    type: 'missing_driver_id' | 'missing_vehicle_id' | 'bad_money_format' | 'missing_date' | 'other';
    count: number;
    examples: {
      rowNumber: number;
      bookingId: string;
      details: string;
    }[];
  }[];
  
  // Reconciliation
  reconciliation: {
    totalAmountSum: number; // Sum from CSV Total Amount column
    revenueLinesTotal: number; // Computed from revenue_lines
    amountPaidSum: number;
    amountDueSum: number;
    refundSum: number;
    
    discrepancies: {
      field: string;
      expected: number;
      actual: number;
      difference: number;
    }[];
  };
  
  // Fix suggestions
  fixSuggestions: {
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    affectedRows: number;
    suggestion: string;
  }[];
  
  processedAt: Date;
  processingTimeMs: number;
}
