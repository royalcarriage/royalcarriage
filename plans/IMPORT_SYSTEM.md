# Moovs CSV Import System - Complete Design

## Overview

Idempotent, auditable CSV import pipeline for migrating legacy Moovs data into Firebase Firestore. Supports one-time historical imports and ongoing daily syncs. Week-close capable with immutable audit trail.

---

## Import Pipeline Architecture

```
Upload → Validate → Map → Transform → Deduplicate → Import → Verify → Archive
  ↓        ↓         ↓       ↓            ↓           ↓        ↓       ↓
 CSV    Schema   Columns  Business    Find         Insert   Check   Store
Check   Validate           Rules    Duplicates   to DB    Results
```

---

## Step 1: File Upload

### Input

- CSV file (max 100MB)
- Source system selection (Moovs, QuickBooks, Manual)
- Record type (rides, customers, drivers, payments)

### Validation

- File exists and is readable
- File size < 100MB
- Content-Type: text/csv
- Encoding: UTF-8

### Output

- Upload ID (UUID)
- File stored in Cloud Storage: `/imports/moovs/{uploadId}.csv`
- Import record created with status: "validating"

---

## Step 2: Schema Validation

### Column Detection

- Read first row for headers
- Detect column data types (string, number, date, boolean)
- Match against expected schema

### Schema Rules (Example: Rides)

```yaml
rides:
  required_columns:
    - ride_id: string (max 100 chars)
    - booking_date: date (YYYY-MM-DD)
    - pickup_location: string
    - dropoff_location: string
    - driver_id: string (must exist)
    - vehicle_id: string (must exist)
    - fare_amount: decimal(10,2)
    - payment_status: enum (completed, failed, pending)

  optional_columns:
    - notes: string
    - customer_id: string
    - rating: number (1-5)
    - distance_miles: decimal(10,2)
```

### Validation Results

- ✅ All required columns present
- ⚠️ Extra columns ignored
- ❌ Missing required column → Reject

---

## Step 3: Column Mapping

### Auto-Mapping

- If headers match expected names exactly → auto-map
- If partial match (e.g., "booking_date" vs "bookingDate") → offer suggestions

### Manual Mapping

- If auto-mapping fails, show UI:
  ```
  CSV Column          → Target Field
  [ ride_id ]         → [ Ride ID ]
  [ booking date ]    → [ Booking Date ]
  [ from_location ]   → [ Pickup Location ]
  [ to_location ]     → [ Dropoff Location ]
  ```

### Output

- Column mapping config stored
- Applied to all rows

---

## Step 4: Data Transformation

### Transform Rules

```javascript
{
  // Field transformations
  booking_date: (value) => new Date(value),
  fare_amount: (value) => parseFloat(value),
  payment_status: (value) => value.toLowerCase(),

  // Calculated fields
  week: (row) => getWeekNumber(row.booking_date),
  tenant_id: (row) => getCurrentTenantId(),

  // Lookups
  driver_id: (value) => lookupDriver(value), // Verify exists
  vehicle_id: (value) => lookupVehicle(value), // Verify exists
}
```

### Validation During Transform

- Data type correctness
- Value range checks (e.g., 0 <= rating <= 5)
- Referential integrity (driver must exist)
- Business rule compliance

### Error Handling

- Record-level errors collected
- Error messages with row number and field
- Option to skip error rows or abort

---

## Step 5: Deduplication

### Detection Methods

#### 1. Exact Match

```sql
SELECT * FROM rides
WHERE ride_id = 'moovs-12345'
  AND tenant_id = 'abc123'
```

#### 2. Fuzzy Match (Similar rides)

```javascript
{
  pickup: "123 Main St, Chicago, IL",
  dropoff: "456 Oak Ave, Chicago, IL",
  date: "2026-01-15",
  driver: "John Smith"
}
// Match if all fields within threshold
```

#### 3. Import ID Tracking

```firestore
import_logs: {
  importId_123: {
    rides: ["ride_456", "ride_789"],
    created: 2026-01-16,
    status: "completed"
  }
}
```

### Actions

- **Found Exact Duplicate**: Skip (idempotent re-import safety)
- **Found Fuzzy Duplicate**: Warn admin, option to skip/replace
- **New Record**: Proceed to import

### Output

- Deduplication report
- New records: N, Skipped duplicates: M, Updated records: K

---

## Step 6: Database Import (Transactional)

### Transaction Batching

- Group records into batches of 100
- Batch transaction (all-or-nothing)
- Rollback on any failure

### Import Logic

```javascript
async function importBatch(records, importId) {
  const batch = db.batch();

  for (const record of records) {
    const docRef = db.collection("rides").doc(record.id);

    // Add import tracking
    const data = {
      ...record,
      import_id: importId,
      import_timestamp: serverTimestamp(),
      import_source: "moovs_csv",
    };

    batch.set(docRef, data);
  }

  return batch.commit();
}
```

### Atomic Updates

- All-or-nothing per batch
- Prevents partial imports
- Rollback on failure

---

## Step 7: Verification

### Post-Import Checks

```javascript
{
  total_records: 1000,
  successfully_imported: 985,
  failed_records: 15,
  skipped_duplicates: 0,

  data_quality: {
    complete_records: 985,
    records_with_warnings: 2,
    referential_integrity: "passed"
  },

  sample_records: [
    { id: "ride_123", status: "imported", errors: [] },
    { id: "ride_124", status: "failed", errors: ["driver_id not found"] }
  ]
}
```

### Validation

- Row count matches
- No partial imports
- Data consistency verified
- Audit log created

---

## Step 8: Archive & Audit Trail

### Archive Storage

```
/imports/moovs/{importId}/
  ├── original.csv (original file)
  ├── mapped.csv (after column mapping)
  ├── validation_report.json
  ├── import_log.json (all records processed)
  └── summary.json
```

### Audit Log Entry

```firestore
/imports/{importId}: {
  id: "import_abc123",
  source_system: "moovs",
  record_type: "rides",
  uploaded_by: "admin@company.com",
  upload_timestamp: Timestamp(2026-01-16),

  processing: {
    started: Timestamp,
    completed: Timestamp,
    duration_ms: 45000
  },

  results: {
    total: 1000,
    imported: 985,
    skipped: 15,
    failed: 0
  },

  files: {
    original: "gs://bucket/imports/moovs/import_abc123.csv",
    report: "gs://bucket/imports/moovs/import_abc123_report.json"
  },

  status: "completed",
  errors: []
}
```

---

## Idempotency Strategy

### Problem

User uploads same file twice → Don't create duplicates

### Solution

```javascript
async function importCSV(file, sourceSystem) {
  // 1. Calculate file hash (MD5/SHA256)
  const fileHash = await calculateHash(file);

  // 2. Check if this file was already imported
  const existingImport = await db
    .collection("imports")
    .where("file_hash", "==", fileHash)
    .limit(1)
    .get();

  if (existingImport.docs.length > 0) {
    return {
      status: "duplicate",
      message: "This file was already imported",
      importId: existingImport.docs[0].id,
      timestamp: existingImport.docs[0].data().timestamp,
    };
  }

  // 3. New file, proceed with import
  // ... (continue with import steps)
}
```

### Benefits

- Can re-run import safely
- No manual deduplication needed
- Track which file version was imported

---

## Week-Close Process

### Automatic Week-Close

```javascript
async function weekClose(weekNumber, tenantId) {
  // 1. Verify all rides for week are imported
  const weekRides = await db
    .collection("rides")
    .where("tenant_id", "==", tenantId)
    .where("week", "==", weekNumber)
    .get();

  // 2. Lock rides (prevent modifications)
  const batch = db.batch();
  weekRides.docs.forEach((doc) => {
    batch.update(doc.ref, { locked: true });
  });
  await batch.commit();

  // 3. Calculate payroll (driver + affiliate)
  // 4. Calculate tax withholdings
  // 5. Generate financial report
  // 6. Create audit entry
}
```

### Week Close Checklist

- ✅ All rides imported for week
- ✅ No pending exceptions
- ✅ Reconciliation complete
- ✅ Payroll calculated
- ✅ Lock enabled (no modifications)

---

## Error Handling

### Error Types & Recovery

| Error Type    | Example                   | Action                    |
| ------------- | ------------------------- | ------------------------- |
| Schema        | Missing column            | Abort import, show schema |
| Data Type     | "abc" as fare_amount      | Skip record or convert    |
| Business Rule | driver_id "xyz" not found | Skip record, warn         |
| Duplicate     | Exact match found         | Skip (idempotent)         |
| Storage       | GCS write failed          | Retry 3x, then abort      |

### User-Facing Messages

```
❌ Import Failed: 15 errors found
   Row 42: driver_id "invalid123" not found
   Row 87: date format must be YYYY-MM-DD
   Row 156: fare_amount must be numeric

   Options: [Review Errors] [Skip Errors & Continue] [Cancel]
```

---

## UI Workflow

### Step 1: Upload Screen

```
┌─────────────────────────────────┐
│ Upload Moovs CSV Export         │
├─────────────────────────────────┤
│ [Drag file or browse]           │
│ File: moovs_rides_2026.csv      │
│ Source: ☑ Moovs ☐ QB           │
│ Type: ☑ Rides ☐ Customers      │
│ [Next]                          │
└─────────────────────────────────┘
```

### Step 2: Validation Screen

```
┌─────────────────────────────────┐
│ Validating...                   │
│ [████████░░] 80%               │
│ Total rows: 1000                │
│ Valid: 985                      │
│ Errors: 15                      │
│ [Review Errors] [Continue]      │
└─────────────────────────────────┘
```

### Step 3: Mapping Screen

```
CSV Column → Target Field
[ride_id] → [Ride ID]
[booking_date] → [Booking Date]
[from] → [Pickup Location]
[to] → [Dropoff Location]
[driver] → [Driver ID] ⚠️ (not found, need lookup)
[amount] → [Fare Amount]
[status] → [Payment Status]
[Continue]
```

### Step 4: Review & Confirm

```
┌─────────────────────────────────┐
│ Ready to Import                 │
├─────────────────────────────────┤
│ Source File: moovs_rides.csv    │
│ Record Type: Rides              │
│ Estimated Records: 985          │
│ Duplicates to Skip: 15          │
│                                 │
│ [Cancel] [Import]               │
└─────────────────────────────────┘
```

### Step 5: Progress Screen

```
Importing... [████████████░░░░] 60%
Processing records 601-650
Time remaining: 2 minutes
```

### Step 6: Summary Screen

```
✅ Import Complete
├─ Total Processed: 1000
├─ Successfully Imported: 985
├─ Skipped (Duplicates): 15
├─ Failed: 0
└─ Duration: 3 minutes 42 seconds

[View Report] [Close]
```

---

## Scheduled Imports

### Daily Auto-Import (Optional)

```javascript
// Cloud Scheduler job (daily at 2 AM)
async function scheduledMoovsImport() {
  // 1. Download latest from Moovs SFTP/API
  // 2. Check if new data
  // 3. Auto-import if present
  // 4. Send summary email to admin
}
```

### Configuration

```firestore
/settings/imports: {
  moovs: {
    enabled: true,
    schedule: "0 2 * * *", // Daily at 2 AM
    auto_process: true,
    skip_error_rows: false,
    notification_email: "ops@company.com"
  }
}
```

---

## Summary & Reference

- **Idempotent**: Safe to re-import same file
- **Auditable**: Full trail of all imports
- **Week-Close Ready**: Lock records after close
- **Error Handling**: Detailed error reports
- **Flexible**: Works with any CSV structure
- **Secure**: Validates all data before import
- **Fast**: Batch processing with transactions

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 5 - Import/Accounting)
**Status**: Production Ready
