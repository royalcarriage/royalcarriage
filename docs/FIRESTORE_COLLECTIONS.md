# Firestore Collections Structure

## Overview

Royal Carriage Limousine uses a tenant-isolated Firestore database with comprehensive security rules and proper indexing. This document defines the complete data model and collection structure.

---

## Global Collections (Not Tenant-Specific)

### 1. `/users` Collection

Stores user authentication and profile data.

**Schema:**
```javascript
{
  email: string,                    // User's email address
  displayName: string,              // User's display name
  role: 'super_admin' | 'tenant_admin' | 'dispatcher' | 'driver' | 'viewer',
  permissions: string[],            // Array of permission codes
  createdAt: Timestamp,             // Account creation timestamp
  updatedAt: Timestamp,             // Last profile update
  status: 'active' | 'inactive' | 'suspended',
  tenantId: string (optional),      // Associated tenant ID for non-super_admin
  photoURL: string (optional),      // User's profile photo URL
  phone: string (optional),         // User's phone number
  superAdmin: boolean (optional)    // Legacy super admin flag
}
```

**Access Rules:**
- Users can read/update own profile
- Tenant admins can read users in their tenant
- Super admins can read/write all users

**Example:**
```
/users/user123abc {
  email: "john@company.com",
  displayName: "John Dispatcher",
  role: "dispatcher",
  tenantId: "tenant-royal-chicago",
  permissions: ["bookings.create", "bookings.read"],
  createdAt: 2025-01-16T10:00:00Z,
  status: "active"
}
```

---

### 2. `/roles` Collection

Defines role templates and their associated permissions.

**Schema:**
```javascript
{
  name: string,                     // Role name (e.g., "dispatcher")
  description: string,              // Role description
  permissions: Array<{
    resource: string,               // Resource name (e.g., "bookings")
    actions: string[]              // Actions allowed (create, read, update, delete)
  }>
}
```

**Access Rules:**
- Authenticated users can read roles
- Only super admins can write roles

**Example:**
```
/roles/dispatcher_role {
  name: "Dispatcher",
  description: "Manages bookings and driver assignments",
  permissions: [
    { resource: "bookings", actions: ["create", "read", "update"] },
    { resource: "drivers", actions: ["read"] },
    { resource: "customers", actions: ["read"] }
  ]
}
```

---

### 3. `/settings` Collection

Global system settings (super admin only).

**Schema:**
```javascript
{
  key: string,                      // Setting key
  value: any,                       // Setting value
  updatedAt: Timestamp,             // Last update
  updatedBy: string                 // User ID who updated
}
```

**Access Rules:**
- Super admins only

---

### 4. `/emailTemplates` Collection

Email template definitions.

**Schema:**
```javascript
{
  name: string,                     // Template name
  subject: string,                  // Email subject
  body: string,                     // HTML email body
  variables: string[],              // Template variables (e.g., {{userName}})
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Access Rules:**
- Authenticated users can read
- Super admins can write

**Examples:**
- `booking_confirmation`
- `driver_assignment`
- `payment_receipt`
- `password_reset`

---

### 5. `/smsTemplates` Collection

SMS template definitions.

**Schema:**
```javascript
{
  name: string,                     // Template name
  message: string,                  // SMS message text
  variables: string[],              // Template variables
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Access Rules:**
- Authenticated users can read
- Super admins can write

---

### 6. `/notifications` Collection

User notifications (real-time updates, ride alerts, etc.).

**Schema:**
```javascript
{
  userId: string,                   // Target user ID
  type: string,                     // Notification type (e.g., "booking_update")
  title: string,                    // Notification title
  message: string,                  // Notification message
  data: Object,                     // Additional data (bookingId, etc.)
  read: boolean,                    // Read status
  createdAt: Timestamp,
  expiresAt: Timestamp (optional)  // Auto-delete timestamp
}
```

**Access Rules:**
- Users can read their own notifications
- Users can update/delete their own
- Super admins can access all

---

### 7. `/auditLogs` Collection

System audit trail (super admin only).

**Schema:**
```javascript
{
  tenantId: string,                 // Associated tenant
  userId: string,                   // User performing action
  action: string,                   // Action type (e.g., "user.created")
  resourceType: string,             // Resource type (e.g., "user", "booking")
  resourceId: string,               // Resource ID
  changes: Object,                  // Changed fields
  timestamp: Timestamp,
  ipAddress: string (optional),
  userAgent: string (optional)
}
```

**Access Rules:**
- Super admins only

---

## Tenant Collections (Multi-Tenant)

All collections below are organized under `/tenants/{tenantId}/` to enable complete tenant isolation.

### Structure:
```
/tenants/{tenantId}/
  ├── bookings/
  ├── customers/
  ├── drivers/
  ├── vehicles/
  ├── pricing/
  ├── invoices/
  ├── payments/
  ├── financial/
  └── reports/
```

---

### 1. `/tenants/{tenantId}/bookings` Collection

Represents individual ride bookings.

**Schema:**
```javascript
{
  customerId: string,               // Customer who booked
  driverId: string (optional),      // Assigned driver
  pickupLocation: {
    address: string,
    latitude: number,
    longitude: number,
    placeId: string (optional)     // Google Maps Place ID
  },
  dropoffLocation: {
    address: string,
    latitude: number,
    longitude: number,
    placeId: string (optional)
  },
  scheduledTime: Timestamp,         // When ride is scheduled
  actualPickupTime: Timestamp (optional),
  actualDropoffTime: Timestamp (optional),
  vehicleType: string,              // e.g., "sedan", "suv", "stretch_limo"
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  price: {
    baseFare: number,
    distance: number,
    distanceFare: number,
    timeFare: number,
    discount: number (optional),
    tax: number,
    total: number
  },
  paymentMethod: string,            // "card", "cash", "wallet"
  paymentStatus: 'pending' | 'completed' | 'refunded',
  notes: string (optional),
  rating: number (optional),        // 1-5 star rating
  feedback: string (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string                  // Denormalized for indexing
}
```

**Indexes:**
- (tenantId, status, createdAt DESC)
- (tenantId, customerId, createdAt DESC)
- (tenantId, driverId, createdAt DESC)

**Access Rules:**
- Customers can read their own bookings
- Drivers can read assigned bookings
- Tenant admins can read all
- Super admins can read/write

---

### 2. `/tenants/{tenantId}/customers` Collection

Customer profiles and contact information.

**Schema:**
```javascript
{
  email: string,                    // Customer email
  firstName: string,
  lastName: string,
  phone: string,
  address: string (optional),
  preferredPaymentMethod: string (optional),
  totalBookings: number,            // Denormalized for analytics
  totalSpent: number,               // Denormalized for analytics
  averageRating: number (optional),
  tags: string[],                   // Internal tags (e.g., "vip", "frequent")
  notes: string (optional),
  status: 'active' | 'inactive' | 'blocked',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string                  // Denormalized for indexing
}
```

**Subcollection: `/preferences`**
```javascript
{
  phoneNotifications: boolean,
  emailNotifications: boolean,
  preferredDriverId: string (optional),
  preferredVehicleType: string (optional),
  specialRequests: string (optional)
}
```

**Access Rules:**
- Customers can read their own profile
- Tenant admins can read all
- Super admins can read/write

---

### 3. `/tenants/{tenantId}/drivers` Collection

Driver profiles and information.

**Schema:**
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  licenseNumber: string,
  licenseExpiry: Timestamp,
  ssn: string (encrypted),          // Social Security Number
  dateOfBirth: Timestamp,
  address: string,
  bankAccount: string (encrypted),  // For payroll
  status: 'available' | 'on_duty' | 'off_duty' | 'on_leave' | 'suspended' | 'terminated',
  rating: number,                   // Average rating
  totalRides: number,               // Denormalized
  totalEarnings: number,            // Denormalized
  hireDate: Timestamp,
  backgroundCheckStatus: 'pending' | 'approved' | 'rejected',
  backgroundCheckDate: Timestamp (optional),
  insuranceExpiry: Timestamp,
  certifications: string[],         // e.g., "chauffeur", "defensive_driving"
  currentLocation: {
    latitude: number,
    longitude: number,
    timestamp: Timestamp,
    heading: number (optional)
  } (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string
}
```

**Subcollection: `/documents`**
```javascript
{
  type: string,                     // "license", "insurance", "background_check"
  fileUrl: string,                  // Cloud Storage URL
  expiryDate: Timestamp (optional),
  status: 'pending_review' | 'approved' | 'rejected',
  uploadedAt: Timestamp,
  reviewedAt: Timestamp (optional),
  reviewedBy: string (optional)
}
```

**Subcollection: `/performance`**
```javascript
{
  date: Timestamp,
  ridesCompleted: number,
  cancellations: number,
  averageRating: number,
  totalEarnings: number,
  acceptanceRate: number,
  onTimePercentage: number,
  complaintCount: number,
  bonus: number (optional)
}
```

**Indexes:**
- (tenantId, status, rating DESC)

**Access Rules:**
- Drivers can read their own profile
- Tenant admins can read all
- Super admins can read/write

---

### 4. `/tenants/{tenantId}/vehicles` Collection

Fleet vehicles and their specifications.

**Schema:**
```javascript
{
  licensePlate: string,
  make: string,                     // e.g., "Lincoln"
  model: string,                    // e.g., "Continental"
  year: number,
  color: string,
  vin: string,                      // Vehicle Identification Number
  type: string,                     // "sedan", "suv", "stretch_limo", "party_bus"
  capacity: number,                 // Passenger capacity
  amenities: string[],              // e.g., ["wifi", "champagne", "sound_system"]
  mileage: number,
  fuelType: string,                 // "gas", "hybrid", "electric"
  registrationExpiry: Timestamp,
  inspectionExpiry: Timestamp,
  insuranceExpiry: Timestamp,
  maintenanceSchedule: Array<{
    type: string,                   // "oil_change", "tire_rotation"
    dueDate: Timestamp,
    lastCompleted: Timestamp (optional)
  }>,
  status: 'available' | 'maintenance' | 'retired' | 'damaged',
  photos: string[],                 // Cloud Storage URLs
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string
}
```

**Indexes:**
- (tenantId, type, status)

**Access Rules:**
- Authenticated users can read
- Tenant admins can write
- Super admins can read/write

---

### 5. `/tenants/{tenantId}/pricing` Collection

Pricing rules and fare calculations.

**Schema:**
```javascript
{
  name: string,                     // e.g., "Standard Pricing"
  vehicleType: string,              // Applied to vehicle type
  baseFare: number,
  costPerMile: number,
  costPerMinute: number,
  minimumFare: number,
  peakHours: Array<{
    startTime: string,              // "17:00"
    endTime: string,                // "20:00"
    surgeMultiplier: number         // e.g., 1.5
  }>,
  zoneMultipliers: Array<{
    zoneName: string,
    multiplier: number
  }>,
  discounts: Array<{
    code: string,
    type: 'percentage' | 'fixed',
    value: number,
    maxUses: number,
    expiryDate: Timestamp
  }>,
  tax: number,                      // Tax percentage (e.g., 0.08)
  active: boolean,
  effectiveDate: Timestamp,
  expiryDate: Timestamp (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string
}
```

**Access Rules:**
- Authenticated users can read
- Tenant admins can write
- Super admins can read/write

---

### 6. `/tenants/{tenantId}/invoices` Collection

Generated invoices for bookings.

**Schema:**
```javascript
{
  invoiceNumber: string,            // Unique invoice number
  customerId: string,
  bookingId: string,
  issueDate: Timestamp,
  dueDate: Timestamp,
  items: Array<{
    description: string,
    quantity: number,
    unitPrice: number,
    amount: number
  }>,
  subtotal: number,
  tax: number,
  discount: number (optional),
  total: number,
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled',
  paymentMethod: string (optional),
  paymentDate: Timestamp (optional),
  notes: string (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  tenantId: string
}
```

**Indexes:**
- (tenantId, customerId, createdAt DESC)

**Access Rules:**
- Customers can read their invoices
- Tenant admins can read/write all
- Super admins can read/write

---

### 7. `/tenants/{tenantId}/payments` Collection

Payment transaction records.

**Schema:**
```javascript
{
  customerId: string,
  bookingId: string (optional),
  amount: number,
  currency: string,                 // "USD"
  method: 'card' | 'cash' | 'wallet' | 'check',
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
  stripePaymentIntentId: string (optional),
  stripeChargeId: string (optional),
  cardLast4: string (optional),
  description: string,
  refundAmount: number (optional),
  refundReason: string (optional),
  errorMessage: string (optional),
  createdAt: Timestamp,
  processedAt: Timestamp (optional),
  refundedAt: Timestamp (optional),
  tenantId: string
}
```

**Indexes:**
- (tenantId, status, createdAt DESC)

**Access Rules:**
- Customers can read their own payments
- Tenant admins can read/write all
- Super admins can read/write

---

### 8. `/tenants/{tenantId}/financial` Collection

Financial summaries and analytics (denormalized).

**Schema:**
```javascript
{
  date: Timestamp,                  // Date of financial record
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  totalRevenue: number,
  totalRides: number,
  totalPaymentProcessingFees: number,
  totalDriverPayouts: number,
  totalExpenses: number,
  netProfit: number,
  averageRidePrice: number,
  topCustomers: Array<{
    customerId: string,
    totalSpent: number,
    rideCount: number
  }>,
  topDrivers: Array<{
    driverId: string,
    totalEarnings: number,
    rideCount: number
  }>,
  vehicleUtilization: Array<{
    vehicleId: string,
    ridesCompleted: number,
    revenue: number
  }>,
  createdAt: Timestamp,
  tenantId: string
}
```

**Indexes:**
- (tenantId, date DESC)

**Access Rules:**
- Tenant admins can read
- Super admins can read/write

---

### 9. `/tenants/{tenantId}/reports` Collection

Generated reports (analytics, performance, etc.).

**Schema:**
```javascript
{
  type: 'revenue' | 'driver_performance' | 'customer_activity' | 'fleet_utilization' | 'custom',
  title: string,
  description: string,
  period: {
    startDate: Timestamp,
    endDate: Timestamp
  },
  filters: Object,                  // Applied filters
  data: Object,                     // Report data
  exportFormats: string[],          // "pdf", "csv", "xlsx"
  fileUrl: string (optional),       // If exported
  createdBy: string,
  createdAt: Timestamp,
  expiryDate: Timestamp (optional),
  tenantId: string
}
```

**Indexes:**
- (tenantId, type, createdAt DESC)

**Access Rules:**
- Tenant admins can read/write
- Super admins can read/write

---

## Tenant Collection

### 1. `/tenants/{tenantId}` Document

Parent tenant configuration.

**Schema:**
```javascript
{
  name: string,                     // e.g., "Royal Carriage Chicago"
  slug: string,                     // URL slug
  domain: string (optional),        // Custom domain
  address: string,
  phone: string,
  email: string,
  website: string (optional),
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise',
    status: 'active' | 'inactive' | 'cancelled',
    startDate: Timestamp,
    renewalDate: Timestamp,
    cancelledDate: Timestamp (optional)
  },
  billing: {
    contactEmail: string,
    paymentMethod: string,
    lastPaymentDate: Timestamp,
    nextPaymentDue: Timestamp
  },
  settings: {
    currency: string,               // "USD"
    timeZone: string,               // "America/Chicago"
    language: string,               // "en"
    bookingConfirmationRequired: boolean,
    autoAssignDriver: boolean,
    allowCashPayments: boolean,
    maintenanceMode: boolean
  },
  features: string[],               // Enabled features
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Security Model

### Authentication
- Firebase Authentication for user management
- Email/Password, Google OAuth, Microsoft OAuth support
- Custom claims for role-based access control (can be added via Cloud Functions)

### Authorization (Firestore Security Rules)
- **Super Admin**: Full access to all collections and tenants
- **Tenant Admin**: Full access to their tenant's collections
- **Dispatcher**: Limited access to bookings, customers, drivers
- **Driver**: Access to assigned bookings and own profile
- **Viewer**: Read-only access to specific collections

### Data Isolation
- All tenant data is stored under `/tenants/{tenantId}/`
- Security rules enforce tenant isolation
- Cross-tenant queries are not possible at the Firestore level

---

## Indexing Strategy

Total of 14 composite indexes created for optimal query performance:

1. Bookings by status and date
2. Bookings by customer and date
3. Bookings by driver and date
4. Payments by status and date
5. Invoices by customer and date
6. Drivers by status and rating
7. Customers by date
8. Customers by email
9. Vehicles by type, status
10. Financial by date
11. Reports by type and date
12. Audit logs by date
13. Driver performance by date
14. Notifications by user and read status

---

## Denormalized Fields

To optimize read performance, certain fields are denormalized:

**Customers Collection:**
- `totalBookings` - Count of all bookings
- `totalSpent` - Sum of all booking amounts
- `averageRating` - From booking ratings

**Drivers Collection:**
- `totalRides` - Count of completed bookings
- `totalEarnings` - Sum of driver payouts
- `rating` - Average rating from bookings

**Financial Collection:**
- All data is denormalized from transactions for daily/monthly summaries

These fields must be updated via Cloud Functions whenever related data changes.

---

## Cloud Functions to Maintain Data Consistency

Required Cloud Functions:

1. `onCreate:users` - Initialize new user profile
2. `onUpdate:bookings` - Update customer/driver stats
3. `onCreate:payments` - Update financial records
4. `onCreate:invoices` - Update customer invoice count
5. `scheduled:generateDailyFinancialReport` - Daily financial summary

---

## Backup & Recovery

- Automated daily backups to Cloud Storage
- Point-in-time recovery available
- Regular testing of restore procedures
- Critical data (bookings, payments) backed up every 6 hours

---

## Compliance Notes

- PII (SSN, bank accounts) encrypted at rest and in transit
- Audit logs maintained for all write operations
- Data retention policies enforced (delete old notifications after 30 days)
- GDPR compliance: User deletion removes all personal data
- SOC 2 Type II compliant hosting via Google Cloud

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: Backend Team
**Status**: Complete
