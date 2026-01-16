/**
 * ROI Intelligence Module
 * Integrates with Moovs data to compute profit metrics
 * Revenue breakdown by service type, city, vehicle type, booking type
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data sources
const MOOVS_DATA_PATH = path.join(__dirname, '../../data/moovs');
const METRICS_PATH = path.join(__dirname, '../../packages/content/metrics');
const ADS_DATA_PATH = path.join(__dirname, '../../data/google-ads');

export interface BookingData {
  bookingId: string;
  date: string;
  serviceType: 'airport' | 'hourly' | 'wedding' | 'corporate';
  city: string;
  vehicleType: 'sedan' | 'suv' | 'sprinter' | 'limo';
  bookingType: 'one-way' | 'hourly' | 'round-trip';
  revenue: number;
  tax: number;
  driverPayout: number;
  adSpend?: number;
}

export interface ROIMetrics {
  totalRevenue: number;
  totalTax: number;
  totalDriverPayout: number;
  totalAdSpend: number;
  profitProxy: number;
  profitMargin: number;
  aov: number; // Average Order Value
  bookingCount: number;
}

export interface SegmentMetrics extends ROIMetrics {
  segment: string;
  segmentType: 'serviceType' | 'city' | 'vehicleType' | 'bookingType';
}

/**
 * Load Moovs CSV data
 */
export async function loadMoovsData(): Promise<BookingData[]> {
  try {
    // TODO: Implement actual CSV parsing
    // For now, check if data exists and load from metrics if available
    const metricsFile = path.join(METRICS_PATH, 'moovs_service_mix.json');
    
    try {
      const data = await fs.readFile(metricsFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Convert aggregated data back to booking format (mock)
      console.log('ℹ️  Loaded Moovs data from metrics cache');
      return [];
    } catch {
      console.warn('⚠️  No Moovs data found - returning empty dataset');
      return [];
    }
  } catch (error) {
    console.error('Error loading Moovs data:', error);
    return [];
  }
}

/**
 * Load Google Ads spend data
 */
export async function loadAdsData(): Promise<Map<string, number>> {
  try {
    // TODO: Implement actual CSV parsing
    // Map of keyword/campaign -> ad spend
    const adSpendMap = new Map<string, number>();
    
    console.log('ℹ️  Ads data integration pending');
    return adSpendMap;
  } catch (error) {
    console.error('Error loading Ads data:', error);
    return new Map();
  }
}

/**
 * Compute profit proxy for bookings
 */
export function computeProfitProxy(bookings: BookingData[]): number {
  return bookings.reduce((sum, booking) => {
    const profit = booking.revenue - booking.tax - booking.driverPayout - (booking.adSpend || 0);
    return sum + profit;
  }, 0);
}

/**
 * Calculate ROI metrics for a set of bookings
 */
export function calculateROIMetrics(bookings: BookingData[]): ROIMetrics {
  if (bookings.length === 0) {
    return {
      totalRevenue: 0,
      totalTax: 0,
      totalDriverPayout: 0,
      totalAdSpend: 0,
      profitProxy: 0,
      profitMargin: 0,
      aov: 0,
      bookingCount: 0,
    };
  }
  
  const totalRevenue = bookings.reduce((sum, b) => sum + b.revenue, 0);
  const totalTax = bookings.reduce((sum, b) => sum + b.tax, 0);
  const totalDriverPayout = bookings.reduce((sum, b) => sum + b.driverPayout, 0);
  const totalAdSpend = bookings.reduce((sum, b) => sum + (b.adSpend || 0), 0);
  
  const profitProxy = totalRevenue - totalTax - totalDriverPayout - totalAdSpend;
  const profitMargin = totalRevenue > 0 ? (profitProxy / totalRevenue) * 100 : 0;
  const aov = totalRevenue / bookings.length;
  
  return {
    totalRevenue,
    totalTax,
    totalDriverPayout,
    totalAdSpend,
    profitProxy,
    profitMargin,
    aov,
    bookingCount: bookings.length,
  };
}

/**
 * Revenue breakdown by service type
 */
export function breakdownByServiceType(bookings: BookingData[]): SegmentMetrics[] {
  const segments = new Map<string, BookingData[]>();
  
  bookings.forEach(booking => {
    if (!segments.has(booking.serviceType)) {
      segments.set(booking.serviceType, []);
    }
    segments.get(booking.serviceType)!.push(booking);
  });
  
  return Array.from(segments.entries()).map(([serviceType, bookings]) => ({
    segment: serviceType,
    segmentType: 'serviceType',
    ...calculateROIMetrics(bookings),
  }));
}

/**
 * Revenue breakdown by city
 */
export function breakdownByCity(bookings: BookingData[]): SegmentMetrics[] {
  const segments = new Map<string, BookingData[]>();
  
  bookings.forEach(booking => {
    if (!segments.has(booking.city)) {
      segments.set(booking.city, []);
    }
    segments.get(booking.city)!.push(booking);
  });
  
  return Array.from(segments.entries())
    .map(([city, bookings]) => ({
      segment: city,
      segmentType: 'city' as const,
      ...calculateROIMetrics(bookings),
    }))
    .sort((a, b) => b.profitProxy - a.profitProxy); // Sort by profit
}

/**
 * Revenue breakdown by vehicle type
 */
export function breakdownByVehicleType(bookings: BookingData[]): SegmentMetrics[] {
  const segments = new Map<string, BookingData[]>();
  
  bookings.forEach(booking => {
    if (!segments.has(booking.vehicleType)) {
      segments.set(booking.vehicleType, []);
    }
    segments.get(booking.vehicleType)!.push(booking);
  });
  
  return Array.from(segments.entries()).map(([vehicleType, bookings]) => ({
    segment: vehicleType,
    segmentType: 'vehicleType',
    ...calculateROIMetrics(bookings),
  }));
}

/**
 * Revenue breakdown by booking type
 */
export function breakdownByBookingType(bookings: BookingData[]): SegmentMetrics[] {
  const segments = new Map<string, BookingData[]>();
  
  bookings.forEach(booking => {
    if (!segments.has(booking.bookingType)) {
      segments.set(booking.bookingType, []);
    }
    segments.get(booking.bookingType)!.push(booking);
  });
  
  return Array.from(segments.entries()).map(([bookingType, bookings]) => ({
    segment: bookingType,
    segmentType: 'bookingType',
    ...calculateROIMetrics(bookings),
  }));
}

/**
 * Detect repeat booking signals
 */
export function detectRepeatBookings(bookings: BookingData[]): {
  repeatCustomers: number;
  repeatRate: number;
  avgBookingsPerCustomer: number;
} {
  // TODO: Implement customer ID tracking in booking data
  // For now, return placeholder
  return {
    repeatCustomers: 0,
    repeatRate: 0,
    avgBookingsPerCustomer: 1,
  };
}

/**
 * Generate comprehensive ROI report
 */
export async function generateROIReport(): Promise<{
  overall: ROIMetrics;
  byServiceType: SegmentMetrics[];
  byCity: SegmentMetrics[];
  byVehicleType: SegmentMetrics[];
  byBookingType: SegmentMetrics[];
  repeatSignals: ReturnType<typeof detectRepeatBookings>;
}> {
  const bookings = await loadMoovsData();
  
  return {
    overall: calculateROIMetrics(bookings),
    byServiceType: breakdownByServiceType(bookings),
    byCity: breakdownByCity(bookings),
    byVehicleType: breakdownByVehicleType(bookings),
    byBookingType: breakdownByBookingType(bookings),
    repeatSignals: detectRepeatBookings(bookings),
  };
}

/**
 * Get top profit segments
 */
export function getTopProfitSegments(
  segments: SegmentMetrics[],
  limit: number = 10
): SegmentMetrics[] {
  return segments
    .filter(s => s.profitProxy > 0)
    .sort((a, b) => b.profitProxy - a.profitProxy)
    .slice(0, limit);
}

/**
 * Calculate revenue opportunity score
 * Higher score = better opportunity for content creation
 */
export function calculateOpportunityScore(segment: SegmentMetrics, contentCoverage: number): number {
  // Factors:
  // - Profit proxy (40% weight)
  // - Booking volume (30% weight)
  // - Inverse of content coverage (30% weight)
  
  const profitScore = Math.min(segment.profitProxy / 10000, 1) * 40;
  const volumeScore = Math.min(segment.bookingCount / 100, 1) * 30;
  const contentGapScore = (1 - contentCoverage) * 30;
  
  return profitScore + volumeScore + contentGapScore;
}
