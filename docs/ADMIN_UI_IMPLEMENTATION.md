# Admin Dashboard UI Implementation Guide

## Overview

This guide provides specifications for implementing the admin dashboard UI to integrate with the completed CSV import backend.

## Completed Backend (Ready to Use)

✅ **CSV Import Processor** (`shared/csv-import-processor.ts`)  
✅ **Cloud Functions** (`functions/src/csv-import-functions.ts`)  
✅ **Type Definitions** (`shared/import-types.ts`)  
✅ **Firestore Security Rules** (all collections configured)  
✅ **Firestore Indexes** (15 composite indexes)  
✅ **Documentation** (technical specs, assumptions, user guide)

## Pages to Implement

### 1. Enhanced Import Page (`/admin/imports`)

**Current State**: Basic UI exists in `client/src/pages/admin/ImportsPage.tsx`

**Enhancements Needed**:

#### Step 1: File Upload
```typescript
// Use Firebase Storage upload
const uploadFile = async (file: File) => {
  const reader = new FileReader();
  reader.onload = async () => {
    const base64Content = btoa(reader.result as string);
    
    const response = await fetch('/uploadCSV', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        filename: file.name,
        content: base64Content,
        importType: 'moovs',
      }),
    });
    
    const { batchId } = await response.json();
    // Poll for status...
  };
  reader.readAsBinaryString(file);
};
```

#### Step 2: Auto Column Mapping
```typescript
import { autoMapColumns } from '@shared/import-mapper';

// After file upload, parse headers
const { mappings, unmapped, suggestions } = autoMapColumns(headers);

// Display mapping table with dropdowns
<Table>
  {headers.map(header => (
    <TableRow key={header}>
      <TableCell>{header}</TableCell>
      <TableCell>
        <Select defaultValue={mappings[header]}>
          {systemFields.map(field => (
            <SelectItem value={field}>{field}</SelectItem>
          ))}
        </Select>
      </TableCell>
      <TableCell>{/* Preview data */}</TableCell>
    </TableRow>
  ))}
</Table>
```

#### Step 3: Import Progress
```typescript
// Poll import status
const pollStatus = async (batchId: string) => {
  const response = await fetch(`/getImportStatus?batchId=${batchId}`, {
    headers: {
      'Authorization': `Bearer ${await user.getIdToken()}`,
    },
  });
  
  const { batch, progress, statusCounts } = await response.json();
  
  return {
    status: batch.status,
    percentComplete: progress.percentComplete,
    processed: statusCounts.processed,
    failed: statusCounts.failed,
  };
};
```

#### Step 4: Audit Report Display
```typescript
// Fetch audit report from Firestore
const auditReport = await db.collection('raw_import_batches')
  .doc(batchId)
  .get()
  .then(doc => doc.data().auditReport);

// Display reconciliation
<Card>
  <CardHeader>Reconciliation</CardHeader>
  <CardContent>
    <div>Total Amount (CSV): ${auditReport.reconciliation.totalAmountSum}</div>
    <div>Revenue Lines: ${auditReport.reconciliation.revenueLinesTotal}</div>
    <div>Discrepancy: ${Math.abs(difference)}</div>
  </CardContent>
</Card>
```

### 2. Bookings Ledger (`/admin/bookings`)

**New Page**: Create comprehensive bookings view

**Query Firestore**:
```typescript
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const fetchBookings = async (filters: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}) => {
  let q = query(
    collection(db, 'bookings'),
    orderBy('pickupDatetime', 'desc'),
    limit(50)
  );
  
  if (filters.status) {
    q = query(q, where('status.statusSlug', '==', filters.status));
  }
  
  if (filters.startDate) {
    q = query(q, where('pickupDatetime', '>=', filters.startDate));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

**Table Component**:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Booking ID</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Pickup Date</TableHead>
      <TableHead>Route</TableHead>
      <TableHead>Vehicle</TableHead>
      <TableHead>Total</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {bookings.map(booking => (
      <TableRow key={booking.id}>
        <TableCell>{booking.bookingId}</TableCell>
        <TableCell>{booking.contacts.passengerName}</TableCell>
        <TableCell>{formatDate(booking.pickupDatetime)}</TableCell>
        <TableCell>
          {booking.pickupAddress} → {booking.dropoffAddress}
        </TableCell>
        <TableCell>{booking.vehicle.vehicleType}</TableCell>
        <TableCell>${booking.totalAmount}</TableCell>
        <TableCell>
          <Badge>{booking.status.statusSlug}</Badge>
        </TableCell>
        <TableCell>
          <Button onClick={() => viewDetails(booking.id)}>View</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Detail Modal**:
```typescript
// Fetch revenue lines for booking
const revenueLines = await getDocs(
  query(
    collection(db, 'revenue_lines'),
    where('bookingId', '==', bookingId)
  )
);

// Display in tabs
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="revenue">Revenue</TabsTrigger>
    <TabsTrigger value="payment">Payment</TabsTrigger>
    <TabsTrigger value="attribution">Attribution</TabsTrigger>
  </TabsList>
  
  <TabsContent value="revenue">
    {revenueLines.map(line => (
      <div key={line.id}>
        {line.lineType}: ${line.amount}
      </div>
    ))}
  </TabsContent>
</Tabs>
```

### 3. Driver Payroll (`/admin/payroll`)

**Query by Pay Period**:
```typescript
const fetchPayroll = async (payPeriod: string) => {
  const payouts = await getDocs(
    query(
      collection(db, 'driver_payouts'),
      where('payPeriod', '==', payPeriod),
      orderBy('driverName')
    )
  );
  
  // Group by driver
  const byDriver = new Map();
  payouts.forEach(doc => {
    const payout = doc.data();
    if (!byDriver.has(payout.driverId)) {
      byDriver.set(payout.driverId, {
        driverId: payout.driverId,
        driverName: payout.driverName,
        tripCount: 0,
        totalPayout: 0,
        flatPayout: 0,
        hourlyPayout: 0,
        gratuity: 0,
      });
    }
    
    const driver = byDriver.get(payout.driverId);
    driver.tripCount++;
    driver.totalPayout += payout.totalDriverPayout;
    driver.flatPayout += payout.payoutFlat;
    driver.hourlyPayout += payout.payoutHourly;
    driver.gratuity += payout.payoutGratuity;
  });
  
  return Array.from(byDriver.values());
};
```

**Pay Period Selector**:
```typescript
import { calculatePayPeriod } from '@shared/import-parsers';

const currentPeriod = calculatePayPeriod(new Date());

<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
  <SelectTrigger>
    <SelectValue placeholder="Select pay period" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={currentPeriod.payPeriod}>
      Current Week ({formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)})
    </SelectItem>
    {/* Previous weeks... */}
  </SelectContent>
</Select>
```

### 4. Receivables AR Aging (`/admin/receivables`)

**Query Open Receivables**:
```typescript
const fetchReceivables = async () => {
  const receivables = await getDocs(
    query(
      collection(db, 'receivables'),
      where('amountDue', '>', 0),
      orderBy('dueDate')
    )
  );
  
  // Calculate aging buckets
  const today = new Date();
  const aging = {
    current: 0,
    days30: 0,
    days60: 0,
    days90Plus: 0,
  };
  
  receivables.forEach(doc => {
    const receivable = doc.data();
    const daysOverdue = Math.floor(
      (today.getTime() - receivable.dueDate.toDate().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysOverdue <= 30) {
      aging.current += receivable.amountDue;
    } else if (daysOverdue <= 60) {
      aging.days30 += receivable.amountDue;
    } else if (daysOverdue <= 90) {
      aging.days60 += receivable.amountDue;
    } else {
      aging.days90Plus += receivable.amountDue;
    }
  });
  
  return { receivables: receivables.docs, aging };
};
```

### 5. Fleet Utilization (`/admin/fleet`)

**Query Fleet Metrics**:
```typescript
const fetchFleetUtilization = async () => {
  const vehicles = await getDocs(
    query(
      collection(db, 'fleet'),
      where('status', '==', 'active'),
      orderBy('totalRevenue', 'desc')
    )
  );
  
  // Calculate weekly metrics
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyTrips = new Map();
  const bookings = await getDocs(
    query(
      collection(db, 'bookings'),
      where('pickupDatetime', '>=', oneWeekAgo)
    )
  );
  
  bookings.forEach(doc => {
    const booking = doc.data();
    const vehicleId = booking.vehicle.vehicleId;
    if (!weeklyTrips.has(vehicleId)) {
      weeklyTrips.set(vehicleId, { trips: 0, revenue: 0 });
    }
    const metrics = weeklyTrips.get(vehicleId);
    metrics.trips++;
    // Would need to fetch revenue lines to sum revenue
  });
  
  return vehicles.docs.map(doc => {
    const vehicle = doc.data();
    const weekly = weeklyTrips.get(vehicle.vehicleId) || { trips: 0, revenue: 0 };
    return {
      ...vehicle,
      tripsPerWeek: weekly.trips,
      revenuePerWeek: weekly.revenue,
    };
  });
};
```

### 6. Affiliate Payables (`/admin/affiliates`)

**Query Unpaid Payables**:
```typescript
const fetchAffiliatePayables = async (status?: string) => {
  let q = query(collection(db, 'affiliate_payables'));
  
  if (status) {
    q = query(q, where('payableStatus', '==', status));
  }
  
  q = query(q, orderBy('dueDate'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

**Mark as Paid**:
```typescript
const markAsPaid = async (payableIds: string[], paidDate: Date) => {
  const batch = writeBatch(db);
  
  payableIds.forEach(id => {
    const ref = doc(db, 'affiliate_payables', id);
    batch.update(ref, {
      payableStatus: 'paid',
      paidAt: paidDate,
      updatedAt: new Date(),
    });
  });
  
  await batch.commit();
};
```

## Shared Components

### Currency Formatter
```typescript
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

### Date Formatter
```typescript
export const formatDate = (date: Date | Timestamp) => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | Timestamp) => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
```

### Status Badge
```typescript
export const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};
```

## Firebase Configuration

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

## Testing

### With Firebase Emulators
```bash
# Start emulators
firebase emulators:start

# In separate terminal
npm run dev:admin
```

### Sample Data
Use `npm run import:local` with sample CSV to populate test data.

## Deployment

1. Build admin app: `npm run build`
2. Deploy functions: `firebase deploy --only functions`
3. Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes`
4. Deploy hosting: `firebase deploy --only hosting`

## Next Steps

1. Update existing `ImportsPage.tsx` with enhanced upload flow
2. Create new pages: `BookingsPage.tsx`, `PayrollPage.tsx`, `ReceivablesPage.tsx`, `FleetPage.tsx`, `AffiliatesPage.tsx`
3. Add shared components for currency, dates, status badges
4. Configure Firebase in admin app
5. Test with Firebase emulators
6. Deploy to production

---

**Backend Status**: ✅ Complete  
**Frontend Status**: Ready for implementation  
**Estimated Effort**: 2-3 days for full UI
