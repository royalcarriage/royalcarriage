/**
 * Parsers and normalizers for CSV import data
 * Handles money strings, percentages, dates, and other messy formats
 */

import { z } from 'zod';

// ============================================================================
// Money Parser
// ============================================================================

/**
 * Parse money strings with $, commas, and handle blanks
 * Examples: "$125.00", "1,250.50", "125", "", "  "
 */
export function parseMoney(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // Convert to string and trim
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    return 0;
  }
  
  // Remove $, commas, and extra spaces
  const cleaned = str.replace(/[$,\s]/g, '');
  
  // Handle negative values (parentheses or minus sign)
  const isNegative = (cleaned.startsWith('(') && cleaned.endsWith(')')) || cleaned.startsWith('-');
  const withoutNegative = cleaned.replace(/[()]/g, '').replace(/^-/, '');
  
  const parsed = parseFloat(withoutNegative);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid money format: "${value}"`);
  }
  
  return isNegative ? -parsed : parsed;
}

/**
 * Zod schema for money values
 */
export const MoneySchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.undefined(),
]).transform(parseMoney);

// ============================================================================
// Percent Parser
// ============================================================================

/**
 * Parse percent strings
 * Examples: "0.25%", "25%", "0.25", 25, ""
 */
export function parsePercent(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    return 0;
  }
  
  // Remove % sign
  const cleaned = str.replace(/%/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid percent format: "${value}"`);
  }
  
  // If value is > 1, assume it's already in percent form (e.g., 25 for 25%)
  // If value is <= 1, assume it's decimal form (e.g., 0.25 for 25%)
  return parsed > 1 ? parsed / 100 : parsed;
}

export const PercentSchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.undefined(),
]).transform(parsePercent);

// ============================================================================
// Date Parser
// ============================================================================

/**
 * Parse various date formats
 * Examples: "2026-01-15", "01/15/2026", "Jan 15, 2026", "2026-01-15T10:30:00Z"
 */
export function parseDate(value: any): Date {
  if (value === null || value === undefined || value === '') {
    throw new Error('Date is required');
  }
  
  // If already a Date object
  if (value instanceof Date) {
    return value;
  }
  
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    throw new Error('Date is required');
  }
  
  // Try ISO format first
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Try common formats
  const formats = [
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  
  throw new Error(`Invalid date format: "${value}"`);
}

export const DateSchema = z.union([
  z.string(),
  z.date(),
  z.null(),
  z.undefined(),
]).transform((val) => {
  if (val === null || val === undefined) {
    throw new Error('Date is required');
  }
  return parseDate(val);
});

/**
 * Parse date with optional fallback
 */
export function parseDateOptional(value: any): Date | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  
  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
}

export const OptionalDateSchema = z.union([
  z.string(),
  z.date(),
  z.null(),
  z.undefined(),
]).transform(parseDateOptional);

// ============================================================================
// DateTime Parser
// ============================================================================

/**
 * Parse datetime from separate date and time columns
 */
export function parseDateTime(date: any, time?: any): Date {
  const dateObj = parseDate(date);
  
  if (!time || time === '' || time === '-') {
    return dateObj;
  }
  
  const timeStr = String(time).trim();
  
  // Parse time (HH:MM or HH:MM:SS or HH:MM AM/PM)
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
  
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
    const meridiem = timeMatch[4];
    
    // Handle AM/PM
    if (meridiem) {
      if (meridiem.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    
    dateObj.setHours(hours, minutes, seconds);
  }
  
  return dateObj;
}

// ============================================================================
// Phone Parser
// ============================================================================

/**
 * Parse and normalize phone numbers
 * Examples: "(312) 555-1234", "312-555-1234", "3125551234", "+1-312-555-1234"
 */
export function parsePhone(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    return '';
  }
  
  // Remove all non-digit characters except + at the start
  const cleaned = str.replace(/(?!^\+)\D/g, '');
  
  return cleaned;
}

export const PhoneSchema = z.union([
  z.string(),
  z.null(),
  z.undefined(),
]).transform(parsePhone);

// ============================================================================
// Email Parser
// ============================================================================

/**
 * Parse and validate email addresses
 */
export function parseEmail(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const str = String(value).trim().toLowerCase();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    return '';
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new Error(`Invalid email format: "${value}"`);
  }
  
  return str;
}

export const EmailSchema = z.union([
  z.string(),
  z.null(),
  z.undefined(),
]).transform(parseEmail);

// ============================================================================
// Boolean Parser
// ============================================================================

/**
 * Parse boolean values from various formats
 * Examples: "true", "false", "yes", "no", "1", "0", true, false, 1, 0
 */
export function parseBoolean(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  const str = String(value).trim().toLowerCase();
  
  return str === 'true' || str === 'yes' || str === '1' || str === 'y';
}

export const BooleanSchema = z.union([
  z.string(),
  z.boolean(),
  z.number(),
  z.null(),
  z.undefined(),
]).transform(parseBoolean);

// ============================================================================
// Integer Parser
// ============================================================================

/**
 * Parse integer values
 */
export function parseInteger(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') {
    return 0;
  }
  
  const parsed = parseInt(str, 10);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer format: "${value}"`);
  }
  
  return parsed;
}

export const IntegerSchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.undefined(),
]).transform(parseInteger);

// ============================================================================
// String Parser (with trimming and normalization)
// ============================================================================

/**
 * Parse string values with trimming and normalization
 */
export function parseString(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const str = String(value).trim();
  
  if (str === '-' || str === 'N/A' || str === 'n/a') {
    return '';
  }
  
  return str;
}

export const StringSchema = z.union([
  z.string(),
  z.null(),
  z.undefined(),
]).transform(parseString);

// ============================================================================
// Column Name Normalizer
// ============================================================================

/**
 * Normalize column names (handle duplicates with trailing spaces, etc.)
 * Examples: "Pickup Date " -> "pickup_date", "Vehicle.1" -> "vehicle_1"
 */
export function normalizeColumnName(columnName: string): string {
  return columnName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Find column by name or similar variants
 * Handles: "Pickup Date", "Pickup Date ", "pickup_date", "pickupDate"
 */
export function findColumn(
  headers: string[],
  ...variants: string[]
): string | undefined {
  const normalizedHeaders = headers.map(normalizeColumnName);
  
  for (const variant of variants) {
    const normalized = normalizeColumnName(variant);
    const index = normalizedHeaders.indexOf(normalized);
    if (index !== -1) {
      return headers[index];
    }
  }
  
  return undefined;
}

// ============================================================================
// Query String Parser (for UTM parameters and attribution)
// ============================================================================

/**
 * Parse query string to extract UTM parameters, gclid, etc.
 */
export function parseQueryString(queryString: string): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
} {
  if (!queryString || queryString.trim() === '') {
    return {};
  }
  
  // Remove leading ? if present
  const qs = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  
  const params = new URLSearchParams(qs);
  
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    gclid: params.get('gclid') || undefined,
    wbraid: params.get('wbraid') || undefined,
    gbraid: params.get('gbraid') || undefined,
  };
}

// ============================================================================
// Pay Period Calculator
// ============================================================================

/**
 * Calculate ISO week pay period from pickup date
 * Returns format: "2026-W03"
 */
export function calculatePayPeriod(pickupDate: Date): {
  payPeriod: string;
  startDate: Date;
  endDate: Date;
} {
  // Get ISO week number
  const d = new Date(pickupDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  const year = d.getFullYear();
  const payPeriod = `${year}-W${String(weekNo).padStart(2, '0')}`;
  
  // Calculate start and end dates (Monday to Sunday)
  const startDate = new Date(d);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { payPeriod, startDate, endDate };
}

// ============================================================================
// Helper: Safe get value from row
// ============================================================================

/**
 * Safely get value from CSV row using multiple possible column names
 */
export function getRowValue(
  row: Record<string, any>,
  ...columnNames: string[]
): any {
  for (const name of columnNames) {
    if (row.hasOwnProperty(name)) {
      return row[name];
    }
  }
  return undefined;
}
