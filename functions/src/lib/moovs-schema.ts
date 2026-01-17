/**
 * Moovs CSV Schema
 * Schema definition and validation for Moovs trip import data
 */

export interface MoovsTrip {
  tripId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  pickupLocation: string;
  dropoffLocation: string;
  passengerName: string;
  passengerPhone?: string;
  passengerEmail?: string;
  vehicleType: string;
  driverName?: string;
  driverId?: string;
  fare: number;
  tip?: number;
  total: number;
  status: "completed" | "cancelled" | "no_show" | "pending";
  paymentMethod?: string;
  notes?: string;
  distance?: number; // miles
  duration?: number; // minutes
}

export interface MoovsImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  duplicates: string[];
}

/**
 * Column mapping for Moovs CSV files
 * Maps CSV column names to our schema fields
 */
export const MOOVS_COLUMN_MAP: { [key: string]: keyof MoovsTrip } = {
  "Trip ID": "tripId",
  trip_id: "tripId",
  id: "tripId",
  Date: "date",
  date: "date",
  Time: "time",
  time: "time",
  Pickup: "pickupLocation",
  pickup: "pickupLocation",
  pickup_location: "pickupLocation",
  Dropoff: "dropoffLocation",
  dropoff: "dropoffLocation",
  dropoff_location: "dropoffLocation",
  Passenger: "passengerName",
  passenger: "passengerName",
  passenger_name: "passengerName",
  Phone: "passengerPhone",
  phone: "passengerPhone",
  passenger_phone: "passengerPhone",
  Email: "passengerEmail",
  email: "passengerEmail",
  passenger_email: "passengerEmail",
  Vehicle: "vehicleType",
  vehicle: "vehicleType",
  vehicle_type: "vehicleType",
  Driver: "driverName",
  driver: "driverName",
  driver_name: "driverName",
  "Driver ID": "driverId",
  driver_id: "driverId",
  Fare: "fare",
  fare: "fare",
  base_fare: "fare",
  Tip: "tip",
  tip: "tip",
  Total: "total",
  total: "total",
  total_amount: "total",
  Status: "status",
  status: "status",
  trip_status: "status",
  Payment: "paymentMethod",
  payment: "paymentMethod",
  payment_method: "paymentMethod",
  Notes: "notes",
  notes: "notes",
  comments: "notes",
  Distance: "distance",
  distance: "distance",
  miles: "distance",
  Duration: "duration",
  duration: "duration",
  minutes: "duration",
};

/**
 * Validate a Moovs trip record
 */
export function validateMoovsTrip(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.tripId || typeof data.tripId !== "string") {
    errors.push("Trip ID is required and must be a string");
  }

  if (!data.date || typeof data.date !== "string") {
    errors.push("Date is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push("Date must be in YYYY-MM-DD format");
  }

  if (!data.time || typeof data.time !== "string") {
    errors.push("Time is required");
  } else if (!/^\d{2}:\d{2}(:\d{2})?$/.test(data.time)) {
    errors.push("Time must be in HH:MM or HH:MM:SS format");
  }

  if (!data.pickupLocation || typeof data.pickupLocation !== "string") {
    errors.push("Pickup location is required");
  }

  if (!data.dropoffLocation || typeof data.dropoffLocation !== "string") {
    errors.push("Dropoff location is required");
  }

  if (!data.passengerName || typeof data.passengerName !== "string") {
    errors.push("Passenger name is required");
  }

  if (!data.vehicleType || typeof data.vehicleType !== "string") {
    errors.push("Vehicle type is required");
  }

  // Numeric validations
  if (data.fare !== undefined && (isNaN(data.fare) || data.fare < 0)) {
    errors.push("Fare must be a positive number");
  }

  if (
    data.tip !== undefined &&
    data.tip !== null &&
    (isNaN(data.tip) || data.tip < 0)
  ) {
    errors.push("Tip must be a positive number or zero");
  }

  if (data.total !== undefined && (isNaN(data.total) || data.total < 0)) {
    errors.push("Total must be a positive number");
  }

  if (
    data.distance !== undefined &&
    data.distance !== null &&
    (isNaN(data.distance) || data.distance < 0)
  ) {
    errors.push("Distance must be a positive number");
  }

  if (
    data.duration !== undefined &&
    data.duration !== null &&
    (isNaN(data.duration) || data.duration < 0)
  ) {
    errors.push("Duration must be a positive number");
  }

  // Status validation
  const validStatuses = ["completed", "cancelled", "no_show", "pending"];
  if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize a Moovs trip record
 */
export function normalizeMoovsTrip(data: any): MoovsTrip {
  return {
    tripId: String(data.tripId || "").trim(),
    date: String(data.date || "").trim(),
    time: String(data.time || "").trim(),
    pickupLocation: String(data.pickupLocation || "").trim(),
    dropoffLocation: String(data.dropoffLocation || "").trim(),
    passengerName: String(data.passengerName || "").trim(),
    passengerPhone: data.passengerPhone
      ? String(data.passengerPhone).trim()
      : undefined,
    passengerEmail: data.passengerEmail
      ? String(data.passengerEmail).trim()
      : undefined,
    vehicleType: String(data.vehicleType || "").trim(),
    driverName: data.driverName ? String(data.driverName).trim() : undefined,
    driverId: data.driverId ? String(data.driverId).trim() : undefined,
    fare: parseFloat(data.fare) || 0,
    tip: data.tip ? parseFloat(data.tip) : undefined,
    total: parseFloat(data.total) || 0,
    status: (data.status || "pending").toLowerCase() as MoovsTrip["status"],
    paymentMethod: data.paymentMethod
      ? String(data.paymentMethod).trim()
      : undefined,
    notes: data.notes ? String(data.notes).trim() : undefined,
    distance: data.distance ? parseFloat(data.distance) : undefined,
    duration: data.duration ? parseFloat(data.duration) : undefined,
  };
}
