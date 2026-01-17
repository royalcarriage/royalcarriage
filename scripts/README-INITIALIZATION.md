# Enterprise Data Initialization - Quick Start Guide

## Overview

This directory contains scripts to initialize Royal Carriage enterprise data in Firestore.

## Quick Start

### One-Command Initialization

```bash
./scripts/run-init.sh
```

This will:

1. Verify prerequisites (Node.js, Firebase CLI)
2. Check authentication
3. Initialize 14 fleet vehicles
4. Initialize 91 services (20 per website)
5. Display results

## Scripts

### Main Scripts

#### `run-init.sh` (Recommended)

Complete initialization with pre-flight checks

```bash
./scripts/run-init.sh
```

#### `initializeEnterpriseData.cjs`

Core initialization script (Node.js)

```bash
node scripts/initializeEnterpriseData.cjs
```

#### `expandServices.cjs`

Service-only initialization

```bash
node scripts/expandServices.cjs
```

#### `verifyEnterpriseData.cjs`

Verify data in Firestore

```bash
node scripts/verifyEnterpriseData.cjs
```

## Data Initialized

### Fleet Vehicles (14 total)

- 4 Luxury Sedans (Lincoln, Cadillac, Mercedes, BMW)
- 4 Luxury SUVs (Escalade, Navigator, Suburban, Yukon)
- 1 Stretch Limousine (Lincoln)
- 2 Executive Vans (Sprinter 14-seat, Luxury 12-seat)
- 2 Party Buses (36-passenger, 24-passenger)
- 1 Coach Bus (56-passenger)

### Services (91 total)

- 20 Airport services (chicagoairportblackcar)
- 20 Corporate services (chicagoexecutivecarservice)
- 20 Wedding services (chicagoweddingtransportation)
- 20 Party Bus services (chicago-partybus)
- 11 Shared services

## Prerequisites

### Required

- Node.js (v20+)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase authentication (`firebase login`)

### Optional

- gcloud CLI (for application default credentials)

## Authentication

The scripts use Firebase Admin SDK with application default credentials:

```bash
# Option 1: Firebase login
firebase login

# Option 2: gcloud authentication
gcloud auth application-default login

# Check current user
firebase login:list
```

## Firestore Collections

### `fleet_vehicles`

Contains all vehicle data with:

- Specifications (capacity, amenities)
- Pricing (hourly, airport rates)
- SEO keywords
- Availability schedule
- Image URLs

### `services`

Contains all service data with:

- Descriptions (short and long)
- Website assignment
- Pricing structure
- Applicable vehicles
- SEO keywords
- FAQs (3 per service)

## Troubleshooting

### "Not authenticated with Firebase"

```bash
firebase login
```

### "No Firebase project selected"

```bash
firebase use royalcarriagelimoseo
```

### "require is not defined"

The script should use `.cjs` extension. If you see this error:

```bash
# Rename .js to .cjs
mv script.js script.cjs
```

### "Cannot find module"

```bash
# Ensure you're in the project root
cd /Users/admin/VSCODE

# Run from project root
node scripts/initializeEnterpriseData.cjs
```

## Verification

After initialization, verify the data:

```bash
node scripts/verifyEnterpriseData.cjs
```

Expected output:

- ✓ 14 fleet vehicles (by category)
- ✓ 91 services (20 per website + 11 shared)
- ✓ All data successfully verified

## Next Steps

After initialization:

1. **Generate Content**

   ```bash
   node scripts/generateContent.cjs
   ```

2. **Build Websites**

   ```bash
   pnpm run build:all-sites
   ```

3. **Deploy**

   ```bash
   firebase deploy
   ```

4. **Access Admin Dashboard**
   ```
   https://royalcarriagelimoseo.web.app
   ```

## Files Reference

| File                           | Purpose                 | Usage                                       |
| ------------------------------ | ----------------------- | ------------------------------------------- |
| `run-init.sh`                  | Main runner with checks | `./scripts/run-init.sh`                     |
| `initializeEnterpriseData.cjs` | Core init script        | `node scripts/initializeEnterpriseData.cjs` |
| `expandServices.cjs`           | Services only           | `node scripts/expandServices.cjs`           |
| `verifyEnterpriseData.cjs`     | Data verification       | `node scripts/verifyEnterpriseData.cjs`     |
| `INITIALIZATION_SUMMARY.md`    | Detailed report         | Documentation                               |
| `README-INITIALIZATION.md`     | This file               | Quick reference                             |

## Support

For issues or questions:

1. Check `INITIALIZATION_SUMMARY.md` for detailed information
2. Review Firebase Console for data status
3. Check script output for specific error messages

## Project Structure

```
/Users/admin/VSCODE/
├── scripts/
│   ├── run-init.sh                      # Main runner
│   ├── initializeEnterpriseData.cjs     # Core init
│   ├── expandServices.cjs               # Services init
│   ├── verifyEnterpriseData.cjs        # Verification
│   ├── INITIALIZATION_SUMMARY.md        # Report
│   └── README-INITIALIZATION.md         # This file
├── functions/
│   └── src/
│       └── scripts/
│           ├── addFleetVehicles.ts      # Vehicle data
│           └── expandServices.ts        # Service data source
└── firebase.json                        # Firebase config
```

## Important Notes

- Scripts use Firebase Admin SDK (no auth required)
- Data is written directly to Firestore
- Running multiple times will update existing records
- All timestamps are server-side
- Status is set to 'active' by default

## Production Deployment

Before deploying to production:

1. ✅ Verify all data (run verification script)
2. ✅ Test admin dashboard
3. ✅ Generate initial content
4. ✅ Build all websites
5. ✅ Deploy to Firebase

## License

Royal Carriage Limousine - Internal Tool
