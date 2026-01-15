/**
 * CSV Import Processor Service
 * Handles CSV parsing, column mapping, normalization, and entity creation
 */

import { parse } from 'csv-parse/sync';
import { createHash } from 'crypto';
import { autoMapColumns, applyColumnMappings } from './import-mapper';
import {
  parseMoney,
  parseDate,
  parseDateTime,
  parsePhone,
  parseEmail,
  parseBoolean,
  parseString,
  parseInteger,
  parseQueryString,
  calculatePayPeriod,
  getRowValue,
} from './import-parsers';
import type {
  RawImportBatch,
  RawImportRow,
  Booking,
  RevenueLine,
  Receivable,
  DriverPayout,
  AffiliatePayable,
  FleetVehicle,
  ImportAuditReport,
  RevenueLineType,
} from './import-types';

// ============================================================================
// CSV Import Processor
// ============================================================================

export class CSVImportProcessor {
  private batchId: string;
  private batch: Partial<RawImportBatch>;
  private rows: RawImportRow[] = [];
  private errors: any[] = [];
  private warnings: any[] = [];
  
  constructor(batchId: string) {
    this.batchId = batchId;
    this.batch = {
      id: batchId,
      status: 'processing',
    };
  }
  
  /**
   * Parse CSV file and create raw import batch
   */
  async parseCSV(
    fileContent: string,
    filename: string,
    uploadedBy: string
  ): Promise<{
    batch: RawImportBatch;
    rows: RawImportRow[];
  }> {
    // Calculate SHA256 hash
    const sha256Hash = createHash('sha256').update(fileContent).digest('hex');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
    });
    
    // Create batch record
    const batch: RawImportBatch = {
      id: this.batchId,
      filename,
      originalFilename: filename,
      storageUrl: `gs://imports/${this.batchId}/${filename}`,
      sha256Hash,
      fileSize: Buffer.from(fileContent).length,
      rowCount: records.length,
      uploadedAt: new Date(),
      uploadedBy,
      status: 'processing',
    };
    
    // Create raw import rows
    const rows: RawImportRow[] = records.map((record: any, index: number) => ({
      id: `${this.batchId}_row_${index + 1}`,
      batchId: this.batchId,
      rowNumber: index + 1,
      rawData: record,
      status: 'pending',
      createdAt: new Date(),
    }));
    
    this.batch = batch;
    this.rows = rows;
    
    return { batch, rows };
  }
  
  /**
   * Process import batch: map columns, normalize data, create entities
   */
  async processBatch(): Promise<{
    bookings: Booking[];
    revenueLines: RevenueLine[];
    receivables: Receivable[];
    driverPayouts: DriverPayout[];
    affiliatePayables: AffiliatePayable[];
    fleetVehicles: FleetVehicle[];
    auditReport: ImportAuditReport;
  }> {
    const startTime = Date.now();
    
    const bookings: Booking[] = [];
    const revenueLines: RevenueLine[] = [];
    const receivables: Receivable[] = [];
    const driverPayouts: DriverPayout[] = [];
    const affiliatePayables: AffiliatePayable[] = [];
    const fleetVehicles: FleetVehicle[] = [];
    
    // Auto-map columns
    const headers = this.rows.length > 0 ? Object.keys(this.rows[0].rawData) : [];
    const { mappings, unmapped, suggestions } = autoMapColumns(headers);
    
    console.log(`Auto-mapped ${Object.keys(mappings).length} columns`);
    if (unmapped.length > 0) {
      console.log(`Unmapped columns: ${unmapped.join(', ')}`);
    }
    
    // Process each row
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const row of this.rows) {
      try {
        // Apply column mappings
        const normalizedData = applyColumnMappings(row.rawData, mappings);
        row.normalizedData = normalizedData;
        
        // Create booking entity
        const booking = this.createBooking(row, normalizedData);
        bookings.push(booking);
        
        // Create revenue lines
        const revLines = this.createRevenueLines(booking, normalizedData);
        revenueLines.push(...revLines);
        
        // Create receivable
        if (!booking.status.cancelled) {
          const receivable = this.createReceivable(booking, normalizedData);
          receivables.push(receivable);
        }
        
        // Create driver payout
        const payout = this.createDriverPayout(booking, normalizedData);
        if (payout) {
          driverPayouts.push(payout);
        }
        
        // Create affiliate payable
        const affiliatePayable = this.createAffiliatePayable(booking, normalizedData);
        if (affiliatePayable) {
          affiliatePayables.push(affiliatePayable);
        }
        
        // Update fleet vehicle (deduped later)
        if (normalizedData.vehicle_id) {
          const vehicle = this.getOrCreateFleetVehicle(normalizedData.vehicle_id, normalizedData);
          if (vehicle) {
            fleetVehicles.push(vehicle);
          }
        }
        
        row.status = 'processed';
        imported++;
      } catch (error) {
        row.status = 'failed';
        row.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.errors.push({
          rowNumber: row.rowNumber,
          error: row.errorMessage,
          data: row.rawData,
        });
        failed++;
      }
    }
    
    // Generate audit report
    const auditReport = this.generateAuditReport(
      imported,
      skipped,
      failed,
      bookings,
      revenueLines,
      Date.now() - startTime
    );
    
    return {
      bookings,
      revenueLines,
      receivables,
      driverPayouts,
      affiliatePayables,
      fleetVehicles,
      auditReport,
    };
  }
  
  /**
   * Create booking entity from normalized data
   */
  private createBooking(row: RawImportRow, data: Record<string, any>): Booking {
    // Get booking ID (required)
    const bookingId = parseString(
      getRowValue(data, 'trip_id', 'booking_id') ||
      getRowValue(data, 'trip_conf') ||
      getRowValue(data, 'reservation_conf')
    );
    
    if (!bookingId) {
      throw new Error('Missing booking ID (Trip ID, Trip Conf, or Reservation Conf)');
    }
    
    // Parse dates
    const createdAt = getRowValue(data, 'created_at')
      ? parseDate(getRowValue(data, 'created_at'))
      : new Date();
    
    const pickupDate = parseDate(getRowValue(data, 'pickup_date'));
    const pickupTime = getRowValue(data, 'pickup_time');
    const pickupDatetime = pickupTime
      ? parseDateTime(pickupDate, pickupTime)
      : pickupDate;
    
    // Parse status
    const statusSlug = parseString(getRowValue(data, 'status_slug', 'status'));
    const closedStatus = parseString(getRowValue(data, 'closed_status'));
    const cancelled = parseBoolean(getRowValue(data, 'cancelled'));
    
    // Parse attribution
    const reqSource = parseString(getRowValue(data, 'req_source'));
    const queryString = parseString(getRowValue(data, 'query_string'));
    const attribution = parseQueryString(queryString);
    
    // Parse contacts
    const email = parseEmail(getRowValue(data, 'email'));
    const phone = parsePhone(getRowValue(data, 'phone'));
    
    const booking: Booking = {
      id: `booking_${this.batchId}_${row.rowNumber}`,
      bookingId,
      
      status: {
        statusSlug,
        closedStatus,
        cancelled,
      },
      
      createdAt,
      pickupDatetime,
      
      pickupAddress: parseString(getRowValue(data, 'pickup_address')),
      dropoffAddress: parseString(getRowValue(data, 'dropoff_address')),
      
      service: {
        tripType: parseString(getRowValue(data, 'trip_type')),
        orderType: parseString(getRowValue(data, 'order_type')),
        classification: parseString(getRowValue(data, 'classification')),
        passengers: parseInteger(getRowValue(data, 'passengers')),
        stops: parseInteger(getRowValue(data, 'stops')),
        distance: parseInteger(getRowValue(data, 'distance')),
        driveTime: parseInteger(getRowValue(data, 'drive_time')),
      },
      
      vehicle: {
        vehicleId: parseString(getRowValue(data, 'vehicle_id')),
        vehicleType: parseString(getRowValue(data, 'vehicle_type')),
        vehicleName: parseString(getRowValue(data, 'vehicle_name')),
      },
      
      contacts: {
        bookingContact: parseString(getRowValue(data, 'booking_contact')),
        passengerName: parseString(getRowValue(data, 'passenger_name')),
        emails: email ? [email] : [],
        phones: phone ? [phone] : [],
      },
      
      attribution: {
        reqSource,
        ...attribution,
        queryString,
      },
      
      importBatchId: this.batchId,
      importRowId: row.id,
      
      updatedAt: new Date(),
    };
    
    return booking;
  }
  
  /**
   * Create revenue lines from normalized data
   */
  private createRevenueLines(booking: Booking, data: Record<string, any>): RevenueLine[] {
    const lines: RevenueLine[] = [];
    
    const lineTypes: { type: RevenueLineType; field: string }[] = [
      { type: 'base_rate', field: 'base_rate' },
      { type: 'meet_greet', field: 'meet_greet' },
      { type: 'tolls', field: 'tolls' },
      { type: 'other1', field: 'other1' },
      { type: 'other2', field: 'other2' },
      { type: 'other3', field: 'other3' },
      { type: 'tax', field: 'tax' },
      { type: 'discount', field: 'discount' },
      { type: 'promo_applied', field: 'promo_applied' },
      { type: 'refund', field: 'refund' },
      { type: 'gratuity', field: 'gratuity' },
    ];
    
    for (const { type, field } of lineTypes) {
      const amount = parseMoney(getRowValue(data, field));
      
      if (amount !== 0) {
        lines.push({
          id: `revline_${booking.id}_${type}`,
          bookingId: booking.bookingId,
          lineType: type,
          amount,
          isRevenue: !['discount', 'promo_applied', 'refund'].includes(type),
          createdAt: new Date(),
        });
      }
    }
    
    return lines;
  }
  
  /**
   * Create receivable from normalized data
   */
  private createReceivable(booking: Booking, data: Record<string, any>): Receivable {
    const amountPaid = parseMoney(getRowValue(data, 'amount_paid'));
    const amountDue = parseMoney(getRowValue(data, 'amount_due'));
    
    let paymentStatus: 'paid' | 'partial' | 'unpaid' | 'overdue' = 'unpaid';
    if (amountDue === 0) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'partial';
    }
    
    return {
      id: `receivable_${booking.id}`,
      bookingId: booking.bookingId,
      amountPaid,
      amountDue,
      paymentMethod: parseString(getRowValue(data, 'payment_method')),
      paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Create driver payout from normalized data
   */
  private createDriverPayout(booking: Booking, data: Record<string, any>): DriverPayout | null {
    const driverId = parseString(getRowValue(data, 'driver_id'));
    const driverName = parseString(getRowValue(data, 'driver_name'));
    
    if (!driverId && !driverName) {
      this.warnings.push({
        type: 'missing_driver_id',
        rowNumber: parseInt(booking.importRowId.split('_').pop() || '0'),
        bookingId: booking.bookingId,
      });
      return null;
    }
    
    const payoutFlat = parseMoney(getRowValue(data, 'driver_payout_flat'));
    const payoutHourly = parseMoney(getRowValue(data, 'driver_payout_hourly'));
    const payoutGratuity = parseMoney(getRowValue(data, 'driver_payout_gratuity'));
    const totalPayout = payoutFlat + payoutHourly + payoutGratuity || parseMoney(getRowValue(data, 'driver_payout'));
    
    const { payPeriod, startDate, endDate } = calculatePayPeriod(booking.pickupDatetime);
    
    return {
      id: `payout_${booking.id}`,
      bookingId: booking.bookingId,
      driverId,
      driverName,
      payoutFlat,
      payoutHourly,
      payoutGratuity,
      totalDriverPayout: totalPayout,
      earningStatus: 'pending',
      payPeriod,
      payPeriodStart: startDate,
      payPeriodEnd: endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Create affiliate payable from normalized data
   */
  private createAffiliatePayable(booking: Booking, data: Record<string, any>): AffiliatePayable | null {
    const affiliateName = parseString(getRowValue(data, 'affiliate_name'));
    
    if (!affiliateName) {
      return null;
    }
    
    const payableAmount = parseMoney(getRowValue(data, 'affiliate_payable'));
    
    if (payableAmount === 0) {
      return null;
    }
    
    // Due date: 30 days from pickup
    const dueDate = new Date(booking.pickupDatetime);
    dueDate.setDate(dueDate.getDate() + 30);
    
    return {
      id: `affiliate_${booking.id}`,
      bookingId: booking.bookingId,
      affiliateName,
      payableAmount,
      payableStatus: 'unpaid',
      dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Get or create fleet vehicle
   */
  private getOrCreateFleetVehicle(vehicleId: string, data: Record<string, any>): FleetVehicle | null {
    if (!vehicleId) {
      return null;
    }
    
    return {
      id: `vehicle_${vehicleId}`,
      vehicleId,
      vehicleType: parseString(getRowValue(data, 'vehicle_type')),
      vehicleName: parseString(getRowValue(data, 'vehicle_name')),
      status: 'active',
      totalTrips: 0, // Will be computed
      totalRevenue: 0, // Will be computed
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Generate import audit report
   */
  private generateAuditReport(
    imported: number,
    skipped: number,
    failed: number,
    bookings: Booking[],
    revenueLines: RevenueLine[],
    processingTimeMs: number
  ): ImportAuditReport {
    // Reconciliation
    const totalRevenue = revenueLines
      .filter(l => l.isRevenue)
      .reduce((sum, l) => sum + l.amount, 0);
    
    return {
      batchId: this.batchId,
      filename: this.batch.filename || '',
      rowsTotal: this.rows.length,
      rowsImported: imported,
      rowsSkipped: skipped,
      rowsDuplicate: 0, // TODO: Implement duplicate detection
      rowsFailed: failed,
      parseErrors: this.errors,
      warnings: this.groupWarnings(),
      reconciliation: {
        totalAmountSum: 0, // TODO: Calculate from CSV
        revenueLinesTotal: totalRevenue,
        amountPaidSum: 0,
        amountDueSum: 0,
        refundSum: 0,
        discrepancies: [],
      },
      fixSuggestions: this.generateFixSuggestions(),
      processedAt: new Date(),
      processingTimeMs,
    };
  }
  
  /**
   * Group warnings by type
   */
  private groupWarnings() {
    const grouped: any[] = [];
    const byType = new Map<string, any[]>();
    
    for (const warning of this.warnings) {
      if (!byType.has(warning.type)) {
        byType.set(warning.type, []);
      }
      byType.get(warning.type)!.push(warning);
    }
    
    for (const [type, warnings] of byType.entries()) {
      grouped.push({
        type,
        count: warnings.length,
        examples: warnings.slice(0, 5),
      });
    }
    
    return grouped;
  }
  
  /**
   * Generate fix suggestions based on warnings/errors
   */
  private generateFixSuggestions() {
    const suggestions: any[] = [];
    
    if (this.warnings.some(w => w.type === 'missing_driver_id')) {
      suggestions.push({
        type: 'missing_driver',
        severity: 'warning',
        message: 'Some bookings are missing driver assignments',
        affectedRows: this.warnings.filter(w => w.type === 'missing_driver_id').length,
        suggestion: 'Manually assign drivers to these bookings in the admin dashboard',
      });
    }
    
    return suggestions;
  }
}
