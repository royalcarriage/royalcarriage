/**
 * Auto-mapper for Moovs CSV columns to canonical fields
 * Handles duplicate columns, various naming conventions
 */

import { findColumn, normalizeColumnName } from './import-parsers';
import type { ColumnMapping } from './import-types';

// ============================================================================
// Moovs Column Patterns
// ============================================================================

/**
 * Known Moovs column patterns and their canonical mappings
 */
export const MOOVS_COLUMN_PATTERNS: Record<string, string[]> = {
  // Booking ID
  trip_id: ['Trip ID', 'TripID', 'trip_id', 'id', 'ID', 'Reservation ID', 'ReservationID'],
  trip_conf: ['Trip Conf', 'Trip Confirmation', 'TripConf', 'trip_conf', 'Confirmation Number'],
  reservation_conf: ['Reservation Conf', 'Reservation Confirmation', 'ReservationConf', 'reservation_conf'],
  
  // Status
  status_slug: ['Status Slug', 'StatusSlug', 'status_slug', 'Status', 'status'],
  closed_status: ['Closed Status', 'ClosedStatus', 'closed_status'],
  cancelled: ['Cancelled', 'cancelled', 'Is Cancelled', 'IsCancelled', 'is_cancelled'],
  
  // Dates
  created_at: ['Created At', 'CreatedAt', 'created_at', 'Booking Date', 'BookingDate', 'booking_date', 'Date Created', 'DateCreated'],
  pickup_date: ['Pickup Date', 'PickupDate', 'pickup_date', 'Pickup', 'Date', 'pickup'],
  pickup_time: ['Pickup Time', 'PickupTime', 'pickup_time', 'Time', 'time'],
  
  // Locations
  pickup_address: ['Pickup Address', 'PickupAddress', 'pickup_address', 'Pickup Location', 'PickupLocation', 'pickup_location', 'Origin', 'origin', 'From', 'from'],
  dropoff_address: ['Dropoff Address', 'DropoffAddress', 'dropoff_address', 'Dropoff Location', 'DropoffLocation', 'dropoff_location', 'Destination', 'destination', 'To', 'to'],
  
  // Service
  trip_type: ['Trip Type', 'TripType', 'trip_type', 'Service Type', 'ServiceType', 'service_type', 'Type', 'type'],
  order_type: ['Order Type', 'OrderType', 'order_type'],
  classification: ['Classification', 'classification', 'Class', 'class'],
  passengers: ['Passengers', 'passengers', 'Passenger Count', 'PassengerCount', 'passenger_count', 'Pax', 'pax'],
  stops: ['Stops', 'stops', 'Number of Stops', 'NumberOfStops', 'number_of_stops', 'Stop Count', 'StopCount'],
  distance: ['Distance', 'distance', 'Miles', 'miles', 'Distance (mi)', 'Distance (miles)'],
  drive_time: ['Drive Time', 'DriveTime', 'drive_time', 'Duration', 'duration', 'Trip Duration', 'TripDuration', 'Minutes', 'minutes'],
  
  // Vehicle
  vehicle_id: ['Vehicle ID', 'VehicleID', 'vehicle_id', 'Vehicle', 'vehicle', 'Vehicle.1', 'Vehicle 1'],
  vehicle_type: ['Vehicle Type', 'VehicleType', 'vehicle_type', 'Type of Vehicle', 'TypeOfVehicle', 'Car Type', 'CarType'],
  vehicle_name: ['Vehicle Name', 'VehicleName', 'vehicle_name', 'Car Name', 'CarName'],
  
  // Contacts
  booking_contact: ['Booking Contact', 'BookingContact', 'booking_contact', 'Contact Name', 'ContactName', 'contact_name', 'Booker', 'booker'],
  passenger_name: ['Passenger Name', 'PassengerName', 'passenger_name', 'Passenger', 'passenger', 'Guest Name', 'GuestName', 'guest_name'],
  email: ['Email', 'email', 'Email Address', 'EmailAddress', 'email_address', 'Contact Email', 'ContactEmail'],
  phone: ['Phone', 'phone', 'Phone Number', 'PhoneNumber', 'phone_number', 'Contact Phone', 'ContactPhone', 'Mobile', 'mobile'],
  
  // Attribution
  req_source: ['Req Source', 'ReqSource', 'req_source', 'Request Source', 'RequestSource', 'request_source', 'Source', 'source', 'Referral Source', 'ReferralSource'],
  query_string: ['Query String', 'QueryString', 'query_string', 'URL Parameters', 'URLParameters', 'url_parameters', 'URL Query', 'URLQuery'],
  
  // Revenue
  base_rate: ['Base Rate', 'BaseRate', 'base_rate', 'Base Price', 'BasePrice', 'base_price', 'Rate', 'rate'],
  meet_greet: ['Meet & Greet', 'Meet and Greet', 'MeetGreet', 'meet_greet', 'Meet Greet', 'MeetAndGreet', 'Greeter Fee', 'GreeterFee'],
  tolls: ['Tolls', 'tolls', 'Toll Fees', 'TollFees', 'toll_fees', 'Toll', 'toll'],
  other1: ['Other 1', 'Other1', 'other_1', 'Other Fee 1', 'OtherFee1', 'Extra 1', 'Extra1'],
  other2: ['Other 2', 'Other2', 'other_2', 'Other Fee 2', 'OtherFee2', 'Extra 2', 'Extra2'],
  other3: ['Other 3', 'Other3', 'other_3', 'Other Fee 3', 'OtherFee3', 'Extra 3', 'Extra3'],
  tax: ['Tax', 'tax', 'Tax Amount', 'TaxAmount', 'tax_amount', 'Sales Tax', 'SalesTax', 'sales_tax'],
  discount: ['Discount', 'discount', 'Discount Amount', 'DiscountAmount', 'discount_amount'],
  promo_applied: ['Promo Applied', 'PromoApplied', 'promo_applied', 'Promo Code', 'PromoCode', 'promo_code', 'Coupon', 'coupon'],
  refund: ['Refund', 'refund', 'Refund Amount', 'RefundAmount', 'refund_amount'],
  gratuity: ['Gratuity', 'gratuity', 'Tip', 'tip', 'Gratuity Amount', 'GratuityAmount', 'gratuity_amount'],
  total_amount: ['Total Amount', 'TotalAmount', 'total_amount', 'Total', 'total', 'Total Price', 'TotalPrice', 'total_price', 'Grand Total', 'GrandTotal'],
  
  // Payments
  amount_paid: ['Amount Paid', 'AmountPaid', 'amount_paid', 'Paid', 'paid', 'Payment Amount', 'PaymentAmount', 'payment_amount'],
  amount_due: ['Amount Due', 'AmountDue', 'amount_due', 'Due', 'due', 'Balance Due', 'BalanceDue', 'balance_due'],
  payment_method: ['Payment Method', 'PaymentMethod', 'payment_method', 'Payment Type', 'PaymentType', 'payment_type'],
  payment_status: ['Payment Status', 'PaymentStatus', 'payment_status', 'Payment', 'payment'],
  
  // Driver
  driver_id: ['Driver ID', 'DriverID', 'driver_id', 'Driver', 'driver'],
  driver_name: ['Driver Name', 'DriverName', 'driver_name', 'Chauffeur', 'chauffeur', 'Chauffeur Name', 'ChauffeurName'],
  driver_payout: ['Driver Payout', 'DriverPayout', 'driver_payout', 'Driver Pay', 'DriverPay', 'driver_pay', 'Chauffeur Pay', 'ChauffeurPay'],
  driver_payout_flat: ['Driver Payout Flat', 'DriverPayoutFlat', 'driver_payout_flat', 'Flat Rate', 'FlatRate', 'flat_rate'],
  driver_payout_hourly: ['Driver Payout Hourly', 'DriverPayoutHourly', 'driver_payout_hourly', 'Hourly Rate', 'HourlyRate', 'hourly_rate'],
  driver_payout_gratuity: ['Driver Payout Gratuity', 'DriverPayoutGratuity', 'driver_payout_gratuity', 'Driver Gratuity', 'DriverGratuity', 'driver_gratuity'],
  
  // Affiliate
  affiliate_name: ['Affiliate Name', 'AffiliateName', 'affiliate_name', 'Affiliate', 'affiliate', 'Partner', 'partner', 'Partner Name', 'PartnerName'],
  affiliate_payable: ['Affiliate Payable', 'AffiliatePayable', 'affiliate_payable', 'Affiliate Fee', 'AffiliateFee', 'affiliate_fee', 'Commission', 'commission'],
};

// ============================================================================
// Auto-mapper
// ============================================================================

/**
 * Automatically map CSV headers to canonical fields
 */
export function autoMapColumns(headers: string[]): {
  mappings: Record<string, string>;
  unmapped: string[];
  suggestions: { column: string; suggestion: string; confidence: number }[];
} {
  const mappings: Record<string, string> = {};
  const unmapped: string[] = [];
  const suggestions: { column: string; suggestion: string; confidence: number }[] = [];
  
  // Create set of canonical field names for lookup
  const canonicalFields = new Set(Object.keys(MOOVS_COLUMN_PATTERNS));
  
  for (const header of headers) {
    let mapped = false;
    
    // Try exact match first
    for (const [canonical, patterns] of Object.entries(MOOVS_COLUMN_PATTERNS)) {
      const found = findColumn([header], ...patterns);
      if (found) {
        mappings[header] = canonical;
        mapped = true;
        break;
      }
    }
    
    // If not mapped, try fuzzy matching for suggestions
    if (!mapped) {
      const normalized = normalizeColumnName(header);
      let bestMatch = '';
      let bestScore = 0;
      
      for (const canonical of canonicalFields) {
        const score = calculateSimilarity(normalized, canonical);
        if (score > bestScore && score > 0.6) {
          bestScore = score;
          bestMatch = canonical;
        }
      }
      
      if (bestMatch) {
        suggestions.push({
          column: header,
          suggestion: bestMatch,
          confidence: bestScore,
        });
      }
      
      unmapped.push(header);
    }
  }
  
  return { mappings, unmapped, suggestions };
}

/**
 * Calculate string similarity (Levenshtein distance-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  
  return 1 - (distance / maxLen);
}

/**
 * Apply column mappings to a CSV row
 */
export function applyColumnMappings(
  row: Record<string, any>,
  mappings: Record<string, string>
): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [csvColumn, canonicalField] of Object.entries(mappings)) {
    if (row.hasOwnProperty(csvColumn)) {
      normalized[canonicalField] = row[csvColumn];
    }
  }
  
  return normalized;
}

/**
 * Get default column mappings for Moovs exports
 * Returns ColumnMapping objects with transform hints
 */
export function getDefaultMoovsColumnMappings(): Partial<Record<string, ColumnMapping>> {
  return {
    trip_id: {
      sourceColumn: 'Trip ID',
      targetField: 'booking_id',
      required: true,
    },
    trip_conf: {
      sourceColumn: 'Trip Conf',
      targetField: 'trip_conf',
      required: false,
    },
    status_slug: {
      sourceColumn: 'Status Slug',
      targetField: 'status_slug',
      required: true,
    },
    closed_status: {
      sourceColumn: 'Closed Status',
      targetField: 'closed_status',
      required: false,
    },
    cancelled: {
      sourceColumn: 'Cancelled',
      targetField: 'cancelled',
      transform: 'boolean',
      required: false,
      defaultValue: false,
    },
    created_at: {
      sourceColumn: 'Created At',
      targetField: 'created_at',
      transform: 'datetime',
      required: true,
    },
    pickup_date: {
      sourceColumn: 'Pickup Date',
      targetField: 'pickup_date',
      transform: 'date',
      required: true,
    },
    pickup_time: {
      sourceColumn: 'Pickup Time',
      targetField: 'pickup_time',
      required: false,
    },
    pickup_address: {
      sourceColumn: 'Pickup Address',
      targetField: 'pickup_address',
      required: false,
    },
    dropoff_address: {
      sourceColumn: 'Dropoff Address',
      targetField: 'dropoff_address',
      required: false,
    },
    trip_type: {
      sourceColumn: 'Trip Type',
      targetField: 'trip_type',
      required: false,
    },
    passengers: {
      sourceColumn: 'Passengers',
      targetField: 'passengers',
      required: false,
    },
    vehicle_id: {
      sourceColumn: 'Vehicle ID',
      targetField: 'vehicle_id',
      required: false,
    },
    vehicle_type: {
      sourceColumn: 'Vehicle Type',
      targetField: 'vehicle_type',
      required: false,
    },
    email: {
      sourceColumn: 'Email',
      targetField: 'email',
      transform: 'email',
      required: false,
    },
    phone: {
      sourceColumn: 'Phone',
      targetField: 'phone',
      transform: 'phone',
      required: false,
    },
    req_source: {
      sourceColumn: 'Req Source',
      targetField: 'req_source',
      required: false,
    },
    query_string: {
      sourceColumn: 'Query String',
      targetField: 'query_string',
      required: false,
    },
    base_rate: {
      sourceColumn: 'Base Rate',
      targetField: 'base_rate',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    meet_greet: {
      sourceColumn: 'Meet & Greet',
      targetField: 'meet_greet',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    tolls: {
      sourceColumn: 'Tolls',
      targetField: 'tolls',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    tax: {
      sourceColumn: 'Tax',
      targetField: 'tax',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    discount: {
      sourceColumn: 'Discount',
      targetField: 'discount',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    refund: {
      sourceColumn: 'Refund',
      targetField: 'refund',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    gratuity: {
      sourceColumn: 'Gratuity',
      targetField: 'gratuity',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    total_amount: {
      sourceColumn: 'Total Amount',
      targetField: 'total_amount',
      transform: 'money',
      required: true,
    },
    amount_paid: {
      sourceColumn: 'Amount Paid',
      targetField: 'amount_paid',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    amount_due: {
      sourceColumn: 'Amount Due',
      targetField: 'amount_due',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    payment_method: {
      sourceColumn: 'Payment Method',
      targetField: 'payment_method',
      required: false,
    },
    payment_status: {
      sourceColumn: 'Payment Status',
      targetField: 'payment_status',
      required: false,
    },
    driver_id: {
      sourceColumn: 'Driver ID',
      targetField: 'driver_id',
      required: false,
    },
    driver_name: {
      sourceColumn: 'Driver Name',
      targetField: 'driver_name',
      required: false,
    },
    driver_payout: {
      sourceColumn: 'Driver Payout',
      targetField: 'driver_payout',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
    affiliate_name: {
      sourceColumn: 'Affiliate Name',
      targetField: 'affiliate_name',
      required: false,
    },
    affiliate_payable: {
      sourceColumn: 'Affiliate Payable',
      targetField: 'affiliate_payable',
      transform: 'money',
      required: false,
      defaultValue: 0,
    },
  };
}
