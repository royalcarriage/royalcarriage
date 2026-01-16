# 🎯 Royal Carriage - Data Import & System Population Master Plan

**Date**: January 16, 2026
**Data File**: `all_reservations_table_2026-01-14T03_47_51.287597097Z.csv`
**Records**: 1,660 booking records
**File Size**: 1.4 MB
**Date Range**: November 13 - December 6, 2025

---

## 📊 CSV Data Structure Analysis

### File Overview
- **Total Columns**: 120+
- **Total Rows**: 1,660 booking records
- **Data Quality**: HIGH (complete, well-formatted)
- **Date Range**: November 13 - December 6, 2025

### Key Data Categories

#### 1. Trip Information
```
✅ Trip Type: One-way, Round-trip Pickup, Hourly, Quote
✅ Trip Duration: Minutes (39-510 min range)
✅ Distance Miles: 18-64 miles
✅ Status: done, confirmed, Open
✅ Initial Stage: reservation, quote
✅ Pickup/Dropoff Addresses
✅ Passenger Count: 2-16 passengers
✅ Number of Stops: 1-3
✅ Trip ID: Unique identifiers
```

#### 2. Financial Data
```
✅ Base Rate: $139-$1,080
✅ Additional Charges:
   - Admin Fee: 2%
   - Meet & Greet Amount
   - Damage/Service Charges
✅ Tolls Amount
✅ Tax Amount: 4.8%
✅ Discount Amount: Percentages and dollar amounts
✅ Driver Gratuity: 0.25%
✅ Total Amount: $160-$1,401
✅ Amount Paid: Full or partial payments
✅ Amount Due: Outstanding balance
✅ Refund Amount: Returns processed
```

#### 3. Payment Information
```
✅ Payment Status: Paid, Not Paid
✅ Payment Method: card (single/multiple)
✅ Cancelled Status: true/false
✅ Closed Status: Closed, Open
✅ Driver Earning Status: Paid status
```

#### 4. Driver Information
```
✅ Driver Name: Full names
✅ Driver ID: Unique identifiers (UUID)
✅ Driver Payout:
   - Hourly Amount
   - Gratuity Amount
   - Flat Amount
   - Total Payout: $100-$400
✅ Total Drive Time: 0-500 minutes
✅ Driver App Used: true/false
✅ Driver Link Used: true/false
✅ Driver Rating: Star ratings
✅ Trip Classification: Standard
```

#### 5. Passenger Information
```
✅ Passenger Full Name
✅ Phone Number
✅ Email Address
✅ Contact ID (UUID)
✅ Booking Contact: Name & relationship
✅ Member Email
✅ Passenger Contact Email
```

#### 6. Vehicle Information
```
✅ Vehicle Type: suv, shuttle-van, party-bus, party-van, limousine
✅ Vehicle: Specific names (Black SUV, Party Bus, Sprinter Limo, etc.)
✅ Vehicle ID (UUID)
✅ Seating Capacity:
   - Forward Facing: Quantity & amount
   - Rear Facing: Quantity & amount
   - Booster Seats: Quantity & amount
```

#### 7. Booking & Order Information
```
✅ Reservation Conf (Order No): Unique codes (G9ZF, ZL71, etc.)
✅ Order Type: special-occasion, birthday, night-out, concert
✅ Trip Conf (Trip No): Trip codes
✅ Company Name: Royal Carriage Limousine
✅ Company ID (UUID)
✅ Plan: VIP
✅ Booking Contact Email
```

#### 8. UTM & Analytics Data
```
✅ Req Source: direct, google_ads
✅ Utm Source: Empty, google_ads
✅ Utm Medium: Empty
✅ Utm Campaign: Empty
✅ Utm Term: Empty
✅ Utm Content: Empty
✅ Utm ID: Empty
✅ Query String: Full URL query strings
✅ Promo Code: FIRSTTIME, etc.
✅ Promo Code Applied Amount
✅ Affiliate Name: Empty
✅ Affiliate Payable: Empty
```

#### 9. Operational Data
```
✅ Pickup Date/Time: Local timestamps
✅ Dropoff Time Local: Local timestamps
✅ On Location Time Local
✅ Garage In/Out Local: Timing
✅ Operator ID: System operator
✅ Last Run At: Timestamp
✅ Next Run At: Timestamp
✅ Month: Dec
✅ Day of week: Saturday, etc.
✅ Review Count
✅ Avg Rating: Star ratings
```

#### 10. Integration Data
```
✅ Griddnet Provider Reservation No
✅ Griddnet Json: Complex dispute data
✅ Farmed Route Accepted At
✅ Farmed Route Completed At
✅ Farmed Route Status
✅ Flight Info: Airport connection data
```

---

## 💾 Firestore Collection Mapping

### 1. **bookings** Collection
```firestore
/bookings/{bookingId}
├── reservationId: "G9ZF"
├── tripId: "77b0ab40-c034-11f0-8210-b38ff1d31e45"
├── companyId: "bcda2f8c-bcd7-11ee-85bf-5b7db1f68e70"
├── customerId: "762a1e96-c034-11f0-88a0-eb1ac57c2575"
├── driverId: "ff8cb720-3aab-11f0-939d-e3746dbb6471"
├── vehicleId: "9b522e68-4fe0-11ef-8d8c-8f769ab0fc1f"
├── tripType: "One-way"
├── orderType: "special-occasion"
├── status: "done"
├── paymentStatus: "Paid"
├── pickupDate: timestamp
├── dropoffDate: timestamp
├── pickupAddress: string
├── dropoffAddress: string
├── passengers: number
├── rating: number
├── numStops: number
├── createdAt: timestamp
├── updatedAt: timestamp
└── companyId: "default"
```

### 2. **payments** Collection
```firestore
/payments/{paymentId}
├── bookingId: string
├── companyId: string
├── amount: number
├── totalAmount: number
├── amountPaid: number
├── amountDue: number
├── refundAmount: number
├── status: "Paid" | "Not Paid"
├── method: "card"
├── baseRate: number
├── tax: number (4.8%)
├── discount: number
├── gratuity: number
├── adminFee: number
├── tolls: number
├── otherCharges: object
├── promoCode: string
├── promoAmount: number
├── processedAt: timestamp
└── metadata: object
```

### 3. **payroll** Collection
```firestore
/payroll/{payrollId}
├── driverId: string
├── companyId: string
├── bookingId: string
├── tripId: string
├── baseRate: number
├── hourlyAmount: number
├── gratuityAmount: number
├── flatAmount: number
├── totalPayout: number
├── tripType: string
├── tripDuration: number
├── driveTime: number
├── status: "Paid"
├── earnedAt: timestamp
├── paidAt: timestamp
└── payrollPeriod: "2025-12"
```

### 4. **trips** Collection
```firestore
/trips/{tripId}
├── bookingId: string
├── companyId: string
├── tripNumber: string
├── tripType: "One-way" | "Round-trip" | "Hourly"
├── duration: number (minutes)
├── distance: number (miles)
├── pickupAddress: string
├── dropoffAddress: string
├── pickupTime: timestamp
├── dropoffTime: timestamp
├── status: "done" | "confirmed" | "open"
├── driverId: string
├── vehicleId: string
├── passengers: number
├── stops: array
├── notes: string
├── rating: number
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 5. **drivers** Collection (Enhanced)
```firestore
/drivers/{driverId}
├── name: string
├── email: string
├── phone: string
├── companyId: string
├── status: "active"
├── rideCount: number
├── averageRating: number
├── totalEarnings: number
├── payoutStatus: "Paid"
├── lastRideAt: timestamp
├── statistics:
│   ├── totalTrips: number
│   ├── totalEarnings: number
│   ├── totalDistance: number
│   ├── totalDriveTime: number
│   └── averageRating: number
└── updatedAt: timestamp
```

### 6. **customers** Collection (Enhanced)
```firestore
/customers/{customerId}
├── name: string
├── email: string
├── phone: string
├── companyId: string
├── bookingCount: number
├── averageRating: number
├── totalSpent: number
├── lastBookingAt: timestamp
├── preferences:
│   ├── preferredVehicle: string
│   ├── preferredDriver: string
│   └── notes: string
└── updatedAt: timestamp
```

### 7. **vehicles** Collection (Enhanced)
```firestore
/vehicles/{vehicleId}
├── name: string
├── type: "suv" | "shuttle-van" | "party-bus" | "party-van" | "limousine"
├── companyId: string
├── capacity: number
├── seating: {
│   ├── forwardFacing: number,
│   ├── rearFacing: number,
│   └── boosterSeats: number
├── status: "active"
├── totalTrips: number
├── lastUsedAt: timestamp
├── statistics:
│   ├── totalMiles: number
│   ├── totalRides: number
│   ├── totalRevenue: number
│   └── utilization: percentage
└── updatedAt: timestamp
```

### 8. **analytics** Collection
```firestore
/analytics/{analyticsId}
├── companyId: string
├── date: timestamp
├── period: "daily" | "weekly" | "monthly"
├── revenue: {
│   ├── gross: number,
│   ├── net: number,
│   ├── byType: { oneway: number, roundtrip: number, hourly: number },
│   └── bySource: { direct: number, google_ads: number }
├── trips: {
│   ├── total: number,
│   ├── completed: number,
│   ├── cancelled: number,
│   └── byType: { oneway: number, roundtrip: number, hourly: number }
├── payments: {
│   ├── processed: number,
│   ├── pending: number,
│   └── failed: number
├── drivers: {
│   ├── activeCount: number,
│   ├── totalEarnings: number,
│   └── averageRating: number
├── customers: {
│   ├── newCount: number,
│   ├── returningCount: number,
│   └── totalCount: number
└── metrics: object
```

### 9. **googleAds** Collection
```firestore
/googleAds/{analyticsId}
├── companyId: string
├── date: timestamp
├── source: "google_ads"
├── bookings: number
├── revenue: number
├── cost: number (from ads account)
├── roi: percentage
├── conversions: number
├── conversionValue: number
├── clicks: number
├── impressions: number
├── ctr: percentage
├── cpc: number
├── metrics: object
└── updatedAt: timestamp
```

### 10. **ga4Events** Collection
```firestore
/ga4Events/{eventId}
├── companyId: string
├── date: timestamp
├── eventName: string
├── eventCount: number
├── eventValue: number
├── source: "google_analytics"
├── eventType: "purchase" | "view_item" | "add_to_cart"
├── metadata: object
└── updatedAt: timestamp
```

---

## 🔧 Import Process & Cloud Functions

### Function 1: `importCSVData`
```typescript
Purpose: Parse CSV and trigger import pipeline
Input: CSV file
Process:
  1. Parse CSV file
  2. Validate data format
  3. Transform to Firestore schema
  4. Batch insert records
  5. Update analytics
Output: Import report with stats
```

### Function 2: `createBooking`
```typescript
Purpose: Create booking from CSV row
Input: Booking data object
Process:
  1. Validate booking data
  2. Create booking document
  3. Create payment record
  4. Create trip record
  5. Update customer
  6. Update driver
  7. Update vehicle
  8. Calculate analytics
Output: Booking ID
```

### Function 3: `processPayment`
```typescript
Purpose: Process and record payment
Input: Payment data
Process:
  1. Parse payment amount
  2. Record payment details
  3. Update booking status
  4. Calculate driver payout
  5. Generate invoice
  6. Update financial reports
Output: Payment confirmation
```

### Function 4: `calculatePayroll`
```typescript
Purpose: Calculate driver payroll from trips
Input: Driver ID, date range
Process:
  1. Fetch all driver trips
  2. Calculate base payout
  3. Add gratuities
  4. Deduct fees
  5. Calculate totals
  6. Create payroll record
  7. Generate pay stub
Output: Payroll record
```

### Function 5: `aggregateAnalytics`
```typescript
Purpose: Create daily/monthly analytics
Input: Date, company ID
Process:
  1. Fetch all bookings for period
  2. Calculate revenue by source
  3. Calculate trip metrics
  4. Calculate payment metrics
  5. Calculate driver metrics
  6. Create analytics document
Output: Analytics record
```

### Function 6: `syncGoogleAds`
```typescript
Purpose: Sync Google Ads data with bookings
Input: Date range
Process:
  1. Parse UTM parameters from bookings
  2. Identify google_ads source bookings
  3. Aggregate by date
  4. Create googleAds records
  5. Calculate ROI metrics
Output: Ads analytics
```

### Function 7: `syncGA4Events`
```typescript
Purpose: Create GA4 event records from bookings
Input: Date range
Process:
  1. Transform booking data to GA4 events
  2. Create purchase events
  3. Create view events
  4. Calculate event metrics
  5. Store in ga4Events collection
Output: Event records
```

---

## 📈 Dashboard Data Requirements

### 1. **Revenue Dashboard**
```
Data Needed:
✅ Total Revenue (from payments collection)
✅ Daily/Weekly/Monthly breakdown
✅ Revenue by Trip Type (one-way, round-trip, hourly)
✅ Revenue by Source (direct, google_ads)
✅ Outstanding Payments
✅ Refunds Processed
✅ Average Trip Value
```

### 2. **Operations Dashboard**
```
Data Needed:
✅ Active Trips (from trips collection)
✅ Completed Trips (status = done)
✅ Pending Trips (status = confirmed/open)
✅ Trip Types Breakdown
✅ Average Trip Duration
✅ Average Trip Distance
✅ Cancellation Rate
```

### 3. **Driver Analytics**
```
Data Needed:
✅ Active Drivers
✅ Total Earnings by Driver
✅ Trips per Driver
✅ Average Rating
✅ On-time Percentage
✅ Completion Rate
✅ Top Performing Drivers
```

### 4. **Customer Analytics**
```
Data Needed:
✅ Total Customers
✅ New vs Returning
✅ Customer Satisfaction (ratings)
✅ Repeat Booking Rate
✅ Average Customer Lifetime Value
✅ Customer Acquisition Source (google_ads vs direct)
```

### 5. **Financial Reports**
```
Data Needed:
✅ Gross Revenue
✅ Driver Payouts
✅ Taxes Collected
✅ Net Profit
✅ Cost per Trip
✅ Profit per Trip
✅ Monthly P&L
```

### 6. **Google Ads Performance**
```
Data Needed:
✅ Bookings from Google Ads
✅ Revenue from Google Ads
✅ Google Ads Cost (from ads account)
✅ ROI Calculation
✅ Conversion Rate
✅ Cost per Acquisition
✅ Trend Analysis
```

### 7. **Google Analytics (GA4)**
```
Data Needed:
✅ Page Views
✅ Event Tracking (booking events)
✅ Conversion Tracking
✅ Traffic Source
✅ Device/Location data
✅ User Journey
✅ Funnel Analysis
```

### 8. **Payroll Dashboard**
```
Data Needed:
✅ Total Payroll by Period
✅ Driver Earnings Breakdown
✅ Payment Status
✅ Pending Payments
✅ Deductions
✅ Net Pay
✅ Pay Stub Generation
```

---

## 🔄 Weekly Data Update Process

### Automated Weekly Import Schedule
```
Every Monday 2:00 AM (UTC):
1. Download latest CSV from source
2. Validate data integrity
3. Identify new records (since last import)
4. Process only new records (avoid duplicates)
5. Update analytics
6. Generate reports
7. Email reports to admin
8. Log import results
```

### Manual Steps
```
1. Export CSV from Moovs/source system
2. Save to Desktop: ~/Desktop/reservations-YYYY-MM-DD.csv
3. Trigger import via admin dashboard
4. Review import report
5. Verify data accuracy
6. Approve and publish
```

---

## 🎯 Implementation Steps

### Phase 1: Data Validation & Schema Mapping (Day 1)
- [ ] Load CSV file
- [ ] Validate all 1,660 records
- [ ] Map columns to Firestore schema
- [ ] Handle data type conversions
- [ ] Check for duplicates
- [ ] Generate validation report

### Phase 2: Create Import Functions (Day 1-2)
- [ ] `importCSVData` - Main import function
- [ ] `createBooking` - Booking creation
- [ ] `processPayment` - Payment processing
- [ ] `calculatePayroll` - Payroll calculation
- [ ] `aggregateAnalytics` - Analytics creation
- [ ] `syncGoogleAds` - Ads data sync
- [ ] `syncGA4Events` - GA4 event creation

### Phase 3: Deploy Functions (Day 2)
- [ ] Deploy all 7 functions to Firebase
- [ ] Test each function individually
- [ ] Test integration flows
- [ ] Monitor for errors

### Phase 4: Run Initial Import (Day 2)
- [ ] Execute importCSVData with full CSV
- [ ] Monitor progress
- [ ] Verify record counts
- [ ] Check data integrity
- [ ] Generate import report

### Phase 5: Populate Dashboard (Day 2-3)
- [ ] Create dashboard components
- [ ] Connect to Firestore collections
- [ ] Display real data from CSV
- [ ] Add filtering and sorting
- [ ] Test all dashboard features

### Phase 6: Setup Integrations (Day 3)
- [ ] Configure Google Ads integration
- [ ] Setup GA4 event tracking
- [ ] Connect Stripe (if using)
- [ ] Test payment processing
- [ ] Verify analytics tracking

### Phase 7: Full System Audit (Day 3)
- [ ] Test all import functions
- [ ] Verify data accuracy
- [ ] Test dashboard displays
- [ ] Test analytics calculations
- [ ] Test payroll calculations
- [ ] Test payment processing
- [ ] Performance testing
- [ ] Security review

### Phase 8: Documentation & Training (Day 3)
- [ ] Create import user guide
- [ ] Document weekly process
- [ ] Create troubleshooting guide
- [ ] Train team on system
- [ ] Setup automated schedule

---

## 📊 Expected Results After Import

### Data Population
```
✅ 1,660 Booking Records Loaded
✅ 1,660 Trip Records Created
✅ 1,660 Payment Records Created
✅ ~150 Unique Customers Created
✅ ~30 Unique Drivers Created
✅ ~10 Unique Vehicles Created
✅ Monthly Analytics Generated
✅ Google Ads Attribution Data
✅ GA4 Event Data
✅ Payroll Data for 30 days
```

### Financial Summary (from CSV data)
```
Total Revenue: ~$420,000+ (estimated from sample)
Total Trips: 1,660
Total Passengers: ~8,000
Total Driver Payouts: ~$100,000+ (estimated)
Google Ads Bookings: ~33% of total
Direct Bookings: ~67% of total
Average Booking Value: ~$250
```

### Dashboard Metrics
```
✅ Revenue Dashboard: Full month of data
✅ Operations Dashboard: Complete trip data
✅ Driver Analytics: Performance metrics
✅ Customer Analytics: Booking patterns
✅ Financial Reports: P&L available
✅ Payroll Dashboard: Ready to process
✅ Google Ads ROI: Calculated
✅ GA4 Tracking: Live data
```

---

## 🔐 Data Quality & Validation

### Validation Rules
```
✅ All numeric fields: Positive numbers
✅ Dates: Valid timestamp format
✅ Email: Valid email format
✅ Phone: Valid phone format
✅ Amounts: Consistent calculations (paid + due = total)
✅ Totals: Sum verification
✅ IDs: UUID format for Firebase
✅ Status: Enum validation
```

### Error Handling
```
✅ Skip invalid records (log errors)
✅ Validate required fields
✅ Check for duplicates by Trip ID
✅ Verify customer data
✅ Verify driver data
✅ Verify vehicle data
✅ Generate error report
```

---

## 🚀 Success Metrics

### Import Success
- [ ] All 1,660 records imported
- [ ] 0 duplicate records
- [ ] 0 data validation errors
- [ ] 100% data integrity
- [ ] Import completion time < 5 minutes

### Dashboard Success
- [ ] All 9 dashboards showing data
- [ ] Real-time data updates
- [ ] Correct calculations
- [ ] Performance < 2 seconds load
- [ ] All features functional

### Integration Success
- [ ] Google Ads data synced
- [ ] GA4 events tracked
- [ ] Payment processing working
- [ ] Payroll calculations correct
- [ ] Analytics accurate

### User Success
- [ ] Team trained on system
- [ ] Weekly import process documented
- [ ] No data loss
- [ ] Easy to understand interface
- [ ] Ready for production use

---

**STATUS**: Ready to implement
**PRIORITY**: HIGH
**TIMELINE**: 3 days for full implementation
**IMPACT**: Major - Populates entire system with real production data

Next: Execute Phase 1 - Data Validation & Schema Mapping
