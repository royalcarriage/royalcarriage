# Royal Carriage Limousine - Complete Data Model

## Firestore Database Schema

### 1. Tenant Collection (`/tenants`)

```typescript
interface Tenant {
  id: string // Auto-generated
  name: string // Company name
  slug: string // URL-safe identifier (royalcarriage, acme-limo, etc.)
  domains: {
    admin?: string // admin.company.com
    airport?: string // airport.company.com
    corporate?: string // corporate.company.com
    wedding?: string // wedding.company.com
    partybus?: string // partybus.company.com
  }
  branding: {
    logo: string // Cloud Storage path
    favicon: string // Cloud Storage path
    colors: {
      primary: string // #FFFFFF
      secondary: string // #000000
      accent: string // #FF0000
    }
    fonts: {
      heading: string // Font family
      body: string // Font family
    }
    companyInfo: {
      name: string
      phone: string
      email: string
      address: string
      city: string
      state: string
      zip: string
    }
    socialLinks: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
    }
  }
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise'
    status: 'active' | 'suspended' | 'cancelled' | 'trial'
    billingCycle: 'monthly' | 'annual'
    startDate: Timestamp
    renewalDate: Timestamp
    price: number
    currency: 'USD' | 'EUR'
  }
  settings: {
    timezone: string // 'America/Chicago'
    currency: string // 'USD'
    language: string // 'en'
    dateFormat: string // 'MM/DD/YYYY'
    timeFormat: '12h' | '24h'
  }
  features: {
    dispatchSystem: boolean
    fleetManagement: boolean
    driverPayroll: boolean
    affiliateSystem: boolean
    accounting: boolean
    customerPortal: boolean
    blogSystem: boolean
    mobileApp: boolean
    smsNotifications: boolean
    aiCopilots: boolean
  }
  limits: {
    maxUsers: number
    maxDrivers: number
    maxVehicles: number
    maxBookingsPerMonth: number
    storageGB: number
  }
  created: Timestamp
  updated: Timestamp
  deletedAt: Timestamp | null
}
```

### 2. Users Collection (`/users`)

```typescript
interface User {
  id: string // Firebase UID
  tenantId: string // Reference to tenant
  email: string
  displayName: string
  phone: string
  photoUrl: string
  role: 'super_admin' | 'tenant_admin' | 'dispatcher' | 'fleet_manager' | 'accountant' | 'driver' | 'affiliate' | 'customer'

  // Profile details
  profile: {
    firstName: string
    lastName: string
    dateOfBirth: Timestamp
    gender: 'M' | 'F' | 'Other'
    ssn: string // Encrypted
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    emergencyContacts: {
      name: string
      relationship: string
      phone: string
    }[]
  }

  // Authentication
  auth: {
    passwordHash: string
    mfaEnabled: boolean
    mfaPhoneNumber: string
    lastLoginAt: Timestamp
    lastLoginIP: string
    accountLockedUntil: Timestamp | null
    failedLoginAttempts: number
  }

  // Permissions
  permissions: {
    resourceType: string // 'bookings', 'drivers', 'vehicles', etc.
    actions: ('create' | 'read' | 'update' | 'delete' | 'export')[]
  }[]

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'deleted'
  statusReason: string

  created: Timestamp
  updated: Timestamp
  deletedAt: Timestamp | null
}
```

### 3. Drivers Collection (`/drivers`)

```typescript
interface Driver {
  id: string
  tenantId: string
  userId: string // Reference to user account

  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: Timestamp
    licenseNumber: string
    licenseState: string
    licenseExpiration: Timestamp
    ssn: string // Encrypted
  }

  employment: {
    status: 'active' | 'inactive' | 'on_leave' | 'terminated'
    hireDate: Timestamp
    terminationDate: Timestamp | null
    employmentType: 'employee' | 'contractor' | '1099'
  }

  documents: {
    licenseImage: string // Cloud Storage path
    backgroundCheck: {
      status: 'pending' | 'passed' | 'failed'
      date: Timestamp
      expirationDate: Timestamp
      provider: string
    }
    certifications: {
      name: string
      issueDate: Timestamp
      expirationDate: Timestamp
      documentUrl: string
    }[]
    insuranceCard: string // Cloud Storage path
    insuranceExpiration: Timestamp
  }

  performance: {
    totalRides: number
    completedRides: number
    cancelledRides: number
    averageRating: number // 1-5
    totalRatings: number
    acceptanceRate: number // 0-100%
    cancellationRate: number // 0-100%
  }

  pay: {
    paymentMethod: 'direct_deposit' | 'check' | 'wallet'
    bankAccount: {
      routingNumber: string // Encrypted
      accountNumber: string // Encrypted
      accountType: 'checking' | 'savings'
    }
    basePay: number // Per ride
    payStructure: 'percentage' | 'flat_rate'
    payPercentage: number // 70%
    deductions: {
      type: string // 'vehicle_rent', 'fuel', 'insurance'
      amount: number
      description: string
    }[]
  }

  availability: {
    currentStatus: 'offline' | 'online' | 'on_ride' | 'on_break'
    availableVehicleIds: string[]
    schedule: {
      dayOfWeek: 0-6 // 0 = Sunday
      startTime: string // '09:00'
      endTime: string // '17:00'
      isWorking: boolean
    }[]
  }

  ratings: {
    totalRatings: number
    averageRating: number
    byCategory: {
      cleanliness: number
      professionalism: number
      safetyDriving: number
      customerService: number
    }
  }

  created: Timestamp
  updated: Timestamp
}
```

### 4. Vehicles Collection (`/vehicles`)

```typescript
interface Vehicle {
  id: string
  tenantId: string

  basicInfo: {
    make: string // Toyota
    model: string // Camry
    year: number
    color: string
    vin: string
    licensePlate: string
    licensePlateState: string
  }

  classification: {
    type: 'sedan' | 'suv' | 'stretch_limo' | 'party_bus' | 'minivan' | 'van'
    passengerCapacity: number
    luggageCapacity: string // 'Large', 'Medium', 'Small'
    specialFeatures: string[] // 'WiFi', 'Bar', 'Sound System', 'Sunroof'
  }

  registration: {
    registrationNumber: string
    registrationExpiration: Timestamp
    ownershipType: 'owned' | 'leased'
    leaseExpirationDate: Timestamp | null
  }

  insurance: {
    provider: string
    policyNumber: string
    expirationDate: Timestamp
    coverageType: 'liability' | 'comprehensive' | 'full'
    limitsLiability: string // '$100,000'
    policyCopy: string // Cloud Storage path
  }

  maintenance: {
    lastServiceDate: Timestamp
    nextServiceDate: Timestamp
    odometer: number
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
    maintenanceSchedule: {
      serviceType: string // 'Oil Change', 'Tire Rotation', 'Inspection'
      intervalMiles: number
      intervalMonths: number
      nextDueDate: Timestamp
    }[]
    serviceHistory: {
      date: Timestamp
      type: string
      cost: number
      provider: string
      notes: string
    }[]
  }

  pricing: {
    baseRate: number // Per mile or per hour
    surgeMultiplier: number // 1.5 during peak hours
    minimumRide: number
    cancellationFee: number
    specialServiceRates: {
      airportTransfer: number
      hourlyCharter: number
      eveningService: number
    }
  }

  images: {
    mainImage: string // Cloud Storage path
    thumbnailImage: string // Cloud Storage path
    galleryImages: string[]
  }

  status: 'active' | 'maintenance' | 'out_of_service' | 'retired'
  assignedDriverIds: string[]
  currentLocation: {
    latitude: number
    longitude: number
    timestamp: Timestamp
  }

  created: Timestamp
  updated: Timestamp
}
```

### 5. Bookings Collection (`/bookings`)

```typescript
interface Booking {
  id: string
  tenantId: string
  customerId: string

  bookingDetails: {
    bookingType: 'asap' | 'scheduled' | 'recurring' | 'charter' | 'airport' | 'event'
    status: 'pending' | 'confirmed' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'
    bookingTime: Timestamp
    pickupTime: Timestamp
    dropoffTime: Timestamp | null
  }

  locations: {
    pickup: {
      address: string
      latitude: number
      longitude: number
      instructions: string // Gate code, etc.
    }
    dropoff: {
      address: string
      latitude: number
      longitude: number
      instructions: string
    }
  }

  passengers: {
    count: number
    specialRequests: string // "Booster seat needed"
    accessibility: string // "Wheelchair accessible"
  }

  vehicle: {
    requestedType: 'sedan' | 'suv' | 'stretch_limo' | 'party_bus'
    assignedVehicleId: string | null
    assignedDriverId: string | null
  }

  pricing: {
    estimatedDistance: number // miles
    estimatedDuration: number // minutes
    estimatedFare: number
    finalFare: number
    baseFare: number
    distanceFare: number
    timeFare: number
    surgeFare: number
    discount: number
    tip: number
    tax: number
    total: number
  }

  payment: {
    method: 'credit_card' | 'cash' | 'corporate_account' | 'wallet'
    paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
    transactionId: string
    receiptUrl: string // Cloud Storage path
  }

  customer: {
    name: string
    email: string
    phone: string
    previousRideCount: number
  }

  specialRequests: {
    musicPreference: string
    temperature: string // 'cool', 'warm'
    route: string // "Avoid highways"
    languages: string[]
  }[]

  ratings: {
    driverRating: number | null // 1-5
    vehicleRating: number | null // 1-5
    comments: string
  }

  created: Timestamp
  updated: Timestamp
}
```

### 6. Rides Collection (`/rides`)

```typescript
interface Ride {
  id: string
  tenantId: string
  bookingId: string // Reference to booking
  driverId: string
  vehicleId: string

  details: {
    status: 'waiting_pickup' | 'en_route_to_pickup' | 'arrived_pickup' | 'in_progress' | 'completed' | 'cancelled'
    startTime: Timestamp
    pickupTime: Timestamp | null
    completionTime: Timestamp | null
  }

  tracking: {
    pickupLocation: { lat: number, lng: number, timestamp: Timestamp }
    currentLocation: { lat: number, lng: number, timestamp: Timestamp }
    dropoffLocation: { lat: number, lng: number, timestamp: Timestamp }
    locationHistory: { lat: number, lng: number, timestamp: Timestamp }[]
    estimatedArrival: Timestamp
    actualArrival: Timestamp | null
  }

  mileage: {
    estimatedDistance: number
    actualDistance: number
    actualDuration: number // minutes
  }

  incidents: {
    type: string // 'accident', 'traffic', 'customer_complaint'
    timestamp: Timestamp
    description: string
    photosUrls: string[]
  }[]

  created: Timestamp
  updated: Timestamp
}
```

### 7. Customers Collection (`/customers`)

```typescript
interface Customer {
  id: string
  tenantId: string

  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: Timestamp | null
  }

  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }

  savedAddresses: {
    name: string // "Home", "Work", "Airport"
    address: string
    latitude: number
    longitude: number
    isDefault: boolean
  }[]

  payment: {
    savedPaymentMethods: {
      type: 'credit_card' | 'debit_card' | 'wallet'
      cardLast4: string
      expirationDate: string
      isDefault: boolean
    }[]
    preferredPaymentMethod: string
  }

  preferences: {
    vehicleType: 'sedan' | 'suv' | 'stretch_limo'
    driverPreferences: string // "Quiet driver", "Conversational"
    temperaturePreference: 'cool' | 'warm' | 'moderate'
    musicPreference: string
    languages: string[]
  }

  loyalty: {
    memberSince: Timestamp
    totalRides: number
    totalSpent: number
    loyaltyPoints: number
    memberTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  }

  communication: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    marketing_emails: boolean
    optOutReasons: string[]
  }

  rideHistory: {
    bookingId: string
    date: Timestamp
    pickup: string
    dropoff: string
    amount: number
    driverRating: number
    riderRating: number
  }[]

  status: 'active' | 'inactive' | 'suspended'
  created: Timestamp
  updated: Timestamp
}
```

### 8. Affiliates Collection (`/affiliates`)

```typescript
interface Affiliate {
  id: string
  tenantId: string

  companyInfo: {
    name: string
    website: string
    contactEmail: string
    contactPhone: string
    address: {
      street: string
      city: string
      state: string
      zip: string
    }
  }

  businessRelationship: {
    affiliateType: 'referral_partner' | 'vehicle_provider' | 'driver_provider' | 'reseller'
    relationshipStartDate: Timestamp
    commissionStructure: {
      type: 'percentage' | 'flat_fee'
      percentage: number // 10%
      minimumCommission: number
      maximumCommission: number
      tieringStructure: {
        minRides: number
        maxRides: number
        commissionRate: number
      }[]
    }
    paymentTerms: 'weekly' | 'bi_weekly' | 'monthly'
    paymentMethod: 'direct_deposit' | 'check' | 'wire_transfer'
  }

  bankAccount: {
    bankName: string
    accountType: 'checking' | 'savings'
    routingNumber: string // Encrypted
    accountNumber: string // Encrypted
  }

  performance: {
    totalRideReferences: number
    totalCommissionEarned: number
    averageOrderValue: number
    customerRetentionRate: number // 0-100%
  }

  status: 'active' | 'inactive' | 'suspended'
  created: Timestamp
  updated: Timestamp
}
```

### 9. Payments Collection (`/payments`)

```typescript
interface Payment {
  id: string
  tenantId: string

  transactionDetails: {
    type: 'charge' | 'refund' | 'payout'
    bookingId: string // Reference to booking
    amount: number
    currency: 'USD'
    status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
    timestamp: Timestamp
  }

  payer: {
    type: 'customer' | 'corporate_account'
    id: string
    name: string
    email: string
  }

  method: {
    type: 'credit_card' | 'debit_card' | 'cash' | 'wallet' | 'corporate_account'
    cardLast4: string | null
    processor: 'stripe' | 'square' | 'manual'
    processorTransactionId: string
  }

  breakdown: {
    baseFare: number
    distanceFare: number
    timeFare: number
    surgeFare: number
    discount: number
    tip: number
    tax: number
  }

  settlement: {
    settledAt: Timestamp | null
    bankDepositDate: Timestamp | null
    bankAccount: {
      bankName: string
      accountLast4: string
    }
  }

  receipt: {
    receiptUrl: string // Cloud Storage path
    emailedTo: string
    emailedAt: Timestamp
  }

  created: Timestamp
  updated: Timestamp
}
```

### 10. Invoices Collection (`/invoices`)

```typescript
interface Invoice {
  id: string
  tenantId: string

  basics: {
    invoiceNumber: string
    type: 'customer_invoice' | 'driver_invoice' | 'affiliate_invoice'
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
    issueDate: Timestamp
    dueDate: Timestamp
    paidDate: Timestamp | null
  }

  from: {
    companyName: string
    address: string
    email: string
    phone: string
    taxId: string
  }

  to: {
    type: 'customer' | 'driver' | 'affiliate'
    name: string
    email: string
    address: string
    taxId: string
  }

  lineItems: {
    description: string
    quantity: number
    unitPrice: number
    amount: number
    serviceDate: Timestamp
  }[]

  totals: {
    subtotal: number
    tax: number
    total: number
  }

  payment: {
    method: 'credit_card' | 'direct_deposit' | 'check' | 'ach_transfer'
    paymentReceivedAmount: number
    outstandingBalance: number
  }

  notes: {
    internalNotes: string
    customerNotes: string
    termsAndConditions: string
  }

  pdfUrl: string // Cloud Storage path
  created: Timestamp
  updated: Timestamp
}
```

### 11. Driver Payroll Collection (`/driverPayroll/{payPeriodId}/entries`)

```typescript
interface DriverPayrollEntry {
  id: string
  tenantId: string
  driverId: string

  payPeriod: {
    startDate: Timestamp
    endDate: Timestamp
    payDate: Timestamp
  }

  earnings: {
    totalRides: number
    earnedAmount: number // From rides
    bonus: number
    incentives: number
    totalEarnings: number
  }

  deductions: {
    vehicleRent: number
    fuelCharge: number
    damageDeduction: number
    insuranceDeduction: number
    otherDeductions: {
      reason: string
      amount: number
    }[]
    totalDeductions: number
  }

  taxes: {
    federalWithholding: number
    stateWithholding: number
    socialSecurityTax: number
    medicareWithholding: number
    totalTaxes: number
  }

  summary: {
    grossPay: number
    totalDeductions: number
    totalTaxes: number
    netPay: number
  }

  payment: {
    paymentMethod: 'direct_deposit' | 'check'
    status: 'pending' | 'processed' | 'paid'
    paidDate: Timestamp | null
    bankAccount: {
      bankName: string
      accountLast4: string
    }
  }

  created: Timestamp
  updated: Timestamp
}
```

### 12. Affiliate Payroll Collection (`/affiliatePayroll/{payPeriodId}/entries`)

```typescript
interface AffiliatePayrollEntry {
  id: string
  tenantId: string
  affiliateId: string

  payPeriod: {
    startDate: Timestamp
    endDate: Timestamp
    payDate: Timestamp
  }

  earnings: {
    totalRideReferences: number
    commissionRate: number
    totalCommission: number
    bonusCommission: number
    totalEarnings: number
  }

  summary: {
    grossCommission: number
    deductions: number
    netCommission: number
  }

  payment: {
    paymentMethod: 'direct_deposit' | 'check' | 'wire_transfer'
    status: 'pending' | 'processed' | 'paid'
    paidDate: Timestamp | null
  }

  created: Timestamp
  updated: Timestamp
}
```

### 13. Site Content Collection (`/siteContent/{siteId}/pages`)

```typescript
interface SiteContentPage {
  id: string
  tenantId: string
  siteId: string // 'airport', 'corporate', 'wedding', 'partybus'

  metadata: {
    slug: string // 'services', 'fleet', 'pricing'
    title: string
    metaDescription: string
    metaKeywords: string[]
    ogTitle: string
    ogDescription: string
    ogImage: string // Cloud Storage path
    canonicalUrl: string
  }

  content: {
    sectionType: 'hero' | 'services' | 'fleet' | 'testimonials' | 'pricing' | 'faq' | 'cta'
    heading: string
    subheading: string
    bodyText: string // Markdown or HTML
    images: {
      url: string // Cloud Storage path
      altText: string
      caption: string
    }[]
    ctaButton: {
      text: string
      url: string
      style: 'primary' | 'secondary'
    }
  }[]

  seo: {
    h1: string
    focusKeyword: string
    readabilityScore: number
    seoScore: number
  }

  status: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt: Timestamp | null
  scheduledAt: Timestamp | null

  created: Timestamp
  updated: Timestamp
}
```

### 14. Blog Posts Collection (`/blog`)

```typescript
interface BlogPost {
  id: string
  tenantId: string

  metadata: {
    slug: string // 'tips-for-airport-transfers'
    title: string
    excerpt: string
    metaDescription: string
    metaKeywords: string[]
    ogImage: string // Cloud Storage path
    author: string
  }

  content: {
    bodyHtml: string // Rich HTML content
    wordCount: number
    estimatedReadTime: number // minutes
  }

  images: {
    featuredImage: string // Cloud Storage path
    thumbnailImage: string // Cloud Storage path
    inlineImages: string[]
  }

  categorization: {
    categories: string[] // 'tips', 'news', 'fleet'
    tags: string[] // 'airport', 'corporate', 'safety'
    relatedPostIds: string[]
  }

  seo: {
    h1: string
    focusKeyword: string
    readabilityScore: number
    seoScore: number
  }

  publishing: {
    status: 'draft' | 'scheduled' | 'published' | 'archived'
    publishedAt: Timestamp | null
    scheduledAt: Timestamp | null
    schedule: {
      autoRepublish: boolean
      republishDates: Timestamp[]
    }
  }

  engagement: {
    viewCount: number
    shareCount: number
    commentCount: number
    readingTime: number // minutes
  }

  created: Timestamp
  updated: Timestamp
}
```

### 15. Images Collection (`/images`)

```typescript
interface ImageAsset {
  id: string
  tenantId: string

  metadata: {
    originalFileName: string
    uploadedBy: string // userId
    uploadDate: Timestamp
    fileSize: number // bytes
    mimeType: string // 'image/jpeg'
    dimensions: {
      width: number
      height: number
    }
  }

  storage: {
    originalImageUrl: string // Cloud Storage path
    thumbnailUrl: string // Cloud Storage path (200px)
    mediumUrl: string // Cloud Storage path (600px)
    largeUrl: string // Cloud Storage path (1200px)
  }

  seo: {
    altText: string
    title: string
    caption: string
    keywords: string[]
  }

  usage: {
    entityType: 'vehicle' | 'driver' | 'blog' | 'site_content' | 'marketing'
    entityId: string
    usageCount: number
    lastUsedAt: Timestamp
  }

  ai: {
    generatedByAI: boolean
    generationPrompt: string
    model: string // 'dall-e-3'
  }

  status: 'active' | 'archived' | 'flagged'
  created: Timestamp
  updated: Timestamp
}
```

### 16. Imports Collection (`/imports`)

```typescript
interface DataImport {
  id: string
  tenantId: string

  fileInfo: {
    originalFileName: string
    fileSize: number
    fileType: 'csv' | 'json' | 'xlsx'
    uploadedBy: string // userId
    uploadDate: Timestamp
    sourceSystem: 'moovs' | 'quickbooks' | 'manual'
  }

  importDetails: {
    recordType: 'rides' | 'customers' | 'drivers' | 'vehicles' | 'payments'
    totalRecords: number
    successfulRecords: number
    failedRecords: number
    skippedRecords: number // Duplicates
    status: 'pending' | 'processing' | 'completed' | 'failed'
  }

  validation: {
    validationErrors: {
      rowNumber: number
      field: string
      error: string
      value: string
    }[]
    duplicatesFound: {
      field: string
      value: string
      existingRecordId: string
    }[]
  }

  mapping: {
    sourceColumns: string[]
    targetColumns: string[]
    transformationRules: {
      sourceColumn: string
      targetColumn: string
      transformation: string // 'uppercase', 'date_parse', etc.
    }[]
  }

  execution: {
    startTime: Timestamp
    endTime: Timestamp | null
    duration: number // milliseconds
    processedAt: Timestamp | null
  }

  archive: {
    fileUrl: string // Cloud Storage path - original file
    reportUrl: string // Cloud Storage path - summary report
  }

  created: Timestamp
  updated: Timestamp
}
```

### 17. Analytics Collection (`/analytics/{metricId}`)

```typescript
interface AnalyticsMetric {
  id: string
  tenantId: string

  date: Timestamp
  period: 'daily' | 'weekly' | 'monthly'

  rides: {
    totalRides: number
    completedRides: number
    cancelledRides: number
    averageDistance: number
    averageEarnings: number
  }

  revenue: {
    totalRevenue: number
    avgRevPerRide: number
    revByVehicleType: {
      vehicleType: string
      revenue: number
    }[]
    revBySource: {
      source: 'website' | 'phone' | 'app' | 'affiliate'
      revenue: number
    }[]
  }

  customers: {
    newCustomers: number
    repeatCustomers: number
    totalCustomers: number
    customerRetentionRate: number // 0-100%
    avgCustomerLTV: number
  }

  drivers: {
    activeDrivers: number
    totalEarnings: number
    avgEarningsPerDriver: number
    driverRetentionRate: number
  }

  vehicles: {
    totalVehicles: number
    activeVehicles: number
    utilizationRate: number // 0-100%
    avgRidesPerVehicle: number
  }

  created: Timestamp
  updated: Timestamp
}
```

---

## Realtime Database Schema

### Live Rides (`/liveRides/{rideId}`)

```typescript
interface LiveRide {
  status: 'waiting_pickup' | 'en_route_to_pickup' | 'arrived_pickup' | 'in_progress' | 'completed'
  driverId: string
  vehicleId: string
  customerId: string

  currentLocation: {
    latitude: number
    longitude: number
    accuracy: number
    heading: number // 0-360 degrees
    timestamp: number // Unix timestamp
  }

  eta: number // Unix timestamp
  estimatedFare: number
  rideProgress: {
    distanceTraveled: number // miles
    timeElapsed: number // seconds
    distanceRemaining: number // miles
  }
}
```

### Driver Status (`/driverStatus/{driverId}`)

```typescript
interface DriverStatus {
  online: boolean
  currentRideId: string | null
  currentLocation: {
    latitude: number
    longitude: number
    timestamp: number
  }
  lastUpdate: number // Unix timestamp
  acceptanceRate: number // Last 30 days
  currentEarningsToday: number
}
```

### Dispatch Board (`/dispatchBoard`)

```typescript
interface DispatchBoard {
  pendingRideIds: string[] // Rides waiting for driver assignment
  availableDriverIds: string[] // Drivers online and available
  activeRideIds: string[] // Rides in progress
  lastUpdate: number // Unix timestamp
}
```

### Notifications (`/notifications/{userId}/{notificationId}`)

```typescript
interface Notification {
  type: 'booking_confirmation' | 'driver_assigned' | 'ride_started' | 'arrival_soon' | 'ride_completed' | 'payment_received'
  title: string
  message: string
  data: {
    rideId?: string
    bookingId?: string
    amount?: number
  }
  read: boolean
  timestamp: number // Unix timestamp
  expiresAt: number // Auto-delete after 30 days
}
```

---

## Cloud Storage Directory Structure

```
/firebase-storage-bucket/
│
├── /vehicles/{vehicleId}/
│   ├── /exterior/
│   │   ├── front.jpg
│   │   ├── side.jpg
│   │   ├── back.jpg
│   │   ├── interior.jpg
│   │   ├── trunk.jpg
│   │   └── full_view_[size].jpg
│   │
│   ├── /interior/
│   │   ├── seats.jpg
│   │   ├── entertainment.jpg
│   │   ├── bar.jpg
│   │   └── amenities.jpg
│   │
│   └── /documents/
│       ├── registration.pdf
│       ├── insurance_policy.pdf
│       └── inspection_report.pdf
│
├── /drivers/{driverId}/
│   ├── profile.jpg
│   ├── /documents/
│   │   ├── license.pdf
│   │   ├── insurance_card.pdf
│   │   ├── background_check.pdf
│   │   └── certifications.pdf
│   │
│   └── /pay_stubs/
│       └── 2026_01_pay_stub.pdf
│
├── /blog/{postId}/
│   ├── featured_image.jpg
│   ├── featured_image_[size].jpg
│   └── /inline_images/
│       └── image_1.jpg
│
├── /marketing/{siteId}/
│   ├── /airport/
│   │   ├── hero.jpg
│   │   ├── fleet.jpg
│   │   └── testimonials/
│   │
│   ├── /corporate/
│   ├── /wedding/
│   └── /partybus/
│
├── /exports/
│   ├── /firestore/
│   │   ├── 2026_01_16.json
│   │   └── 2026_01_15.json
│   │
│   └── /reports/
│       ├── monthly_revenue_2026_01.pdf
│       └── driver_performance_2026_01.pdf
│
└── /imports/
    ├── /moovs/
    │   ├── moovs_import_12345.csv
    │   └── import_summary_12345.json
    │
    └── /archives/
        └── [historical imports]
```

---

## Indexes Required

```typescript
// Composite indexes for complex queries
[
  {
    collection: 'bookings',
    fields: [
      { field: 'tenantId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' }
    ]
  },
  {
    collection: 'rides',
    fields: [
      { field: 'tenantId', direction: 'asc' },
      { field: 'driverId', direction: 'asc' },
      { field: 'startTime', direction: 'desc' }
    ]
  },
  {
    collection: 'payments',
    fields: [
      { field: 'tenantId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'timestamp', direction: 'desc' }
    ]
  },
  {
    collection: 'drivers',
    fields: [
      { field: 'tenantId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'performance.averageRating', direction: 'desc' }
    ]
  },
  {
    collection: 'blog',
    fields: [
      { field: 'tenantId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'publishedAt', direction: 'desc' }
    ]
  }
]
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 1 - System Architect)
**Status**: Production Ready
