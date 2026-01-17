/**
 * CSV Parser
 * Generic CSV parsing and validation utilities
 */

import { parse } from "csv-parse/sync";

export interface CsvParseOptions {
  delimiter?: string;
  autoDetectDelimiter?: boolean;
  skipEmptyLines?: boolean;
  trim?: boolean;
  columns?: boolean | string[];
}

export interface ParsedCsvResult<T> {
  data: T[];
  headers: string[];
  rowCount: number;
}

/**
 * Auto-detect CSV delimiter
 */
export function detectDelimiter(csvContent: string): string {
  const delimiters = [",", ";", "\t", "|"];
  const firstLine = csvContent.split("\n")[0];

  if (!firstLine) {
    return ","; // Default to comma
  }

  // Count occurrences of each delimiter
  const counts = delimiters.map((delimiter) => ({
    delimiter,
    count: (firstLine.match(new RegExp(`\\${delimiter}`, "g")) || []).length,
  }));

  // Return delimiter with highest count (must have at least 1)
  const best = counts.reduce((a, b) => (b.count > a.count ? b : a));
  return best.count > 0 ? best.delimiter : ",";
}

/**
 * Parse CSV content
 */
export function parseCsv<T = any>(
  csvContent: string,
  options: CsvParseOptions = {},
): ParsedCsvResult<T> {
  const {
    delimiter = options.autoDetectDelimiter ? detectDelimiter(csvContent) : ",",
    skipEmptyLines = true,
    trim = true,
    columns = true,
  } = options;

  try {
    const records = parse(csvContent, {
      delimiter,
      skip_empty_lines: skipEmptyLines,
      trim,
      columns,
      relax_column_count: true, // Allow inconsistent column counts
      cast: false, // Don't auto-cast types
    });

    // Extract headers from first record if columns=true
    const headers =
      columns === true && records.length > 0 ? Object.keys(records[0]) : [];

    return {
      data: records as T[],
      headers,
      rowCount: records.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Map CSV row to schema using column mapping
 */
export function mapCsvRow<T>(
  row: { [key: string]: any },
  columnMap: { [key: string]: keyof T },
): Partial<T> {
  const mapped: Partial<T> = {};

  for (const [csvColumn, schemaField] of Object.entries(columnMap)) {
    // Check if the CSV has this column (case-insensitive)
    const csvKey = Object.keys(row).find(
      (key) => key.toLowerCase() === csvColumn.toLowerCase(),
    );

    if (
      csvKey &&
      row[csvKey] !== undefined &&
      row[csvKey] !== null &&
      row[csvKey] !== ""
    ) {
      (mapped as any)[schemaField] = row[csvKey];
    }
  }

  return mapped;
}

/**
 * Validate CSV headers against required fields
 */
export function validateCsvHeaders(
  headers: string[],
  requiredFields: string[],
): { valid: boolean; missingFields: string[] } {
  const lowerHeaders = headers.map((h) => h.toLowerCase());
  const missingFields = requiredFields.filter(
    (field) => !lowerHeaders.includes(field.toLowerCase()),
  );

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Generate import statistics
 */
export interface ImportStats {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
  duplicateRows: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
}

export function createImportStats(): ImportStats {
  return {
    totalRows: 0,
    successfulRows: 0,
    failedRows: 0,
    skippedRows: 0,
    duplicateRows: 0,
    startTime: new Date(),
  };
}

export function finalizeImportStats(stats: ImportStats): ImportStats {
  stats.endTime = new Date();
  stats.durationMs = stats.endTime.getTime() - stats.startTime.getTime();
  return stats;
}

/**
 * Batch processor for large CSV imports
 */
export async function* processCsvInBatches<T>(
  records: T[],
  batchSize: number = 500,
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < records.length; i += batchSize) {
    yield records.slice(i, i + batchSize);
  }
}

/**
 * Create import audit record
 */
export interface ImportAuditRecord {
  importId: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  importType: "moovs" | "ads" | "other";
  status: "in_progress" | "completed" | "failed";
  stats: ImportStats;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  duplicates: string[];
  uploadedBy?: string;
  uploadedAt: Date;
  completedAt?: Date;
}

export function createImportAudit(
  fileName: string,
  fileSize: number,
  rowCount: number,
  importType: "moovs" | "ads" | "other",
): ImportAuditRecord {
  return {
    importId: `${importType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fileName,
    fileSize,
    rowCount,
    importType,
    status: "in_progress",
    stats: createImportStats(),
    errors: [],
    duplicates: [],
    uploadedAt: new Date(),
  };
}
