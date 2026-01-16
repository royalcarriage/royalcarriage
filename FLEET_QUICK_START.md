# Fleet Vehicles Quick Start Guide
**Royal Carriage SEO - Fleet Initialization**

## IMMEDIATE DEPLOYMENT STEPS

### 1. Deploy Functions (5 minutes)
```bash
cd /Users/admin/VSCODE/functions
npm run build
firebase deploy --only functions:initializeFleetVehicles,functions:getAllFleetVehicles,functions:getFleetVehicle,functions:updateFleetVehicle,functions:deleteFleetVehicle
```

### 2. Initialize Fleet Data (2 minutes)

**From Browser Console (Easiest):**
```javascript
// Open admin dashboard and run in console
const functions = getFunctions();
const initFleet = httpsCallable(functions, 'initializeFleetVehicles');

initFleet({}).then(result => {
  console.log('✓ Fleet initialized:', result.data);
}).catch(error => {
  console.error('✗ Error:', error);
});
```

**From Firebase CLI:**
```bash
firebase functions:call initializeFleetVehicles
```

### 3. Verify Success
```bash
# Check Firestore
# Go to: Firebase Console > Firestore > fleet_vehicles
# Should see 14 documents
```

---

## 14 VEHICLES SUMMARY

### Sedans (4)
1. **Lincoln Continental** - $85/hr, $75 airport
2. **Cadillac XTS** - $80/hr, $70 airport
3. **Mercedes S-Class** - $120/hr, $100 airport
4. **BMW 7 Series** - $115/hr, $95 airport

### SUVs (4)
5. **Cadillac Escalade ESV** - $130/hr, $110 airport (6 passengers)
6. **Lincoln Navigator** - $125/hr, $105 airport (6 passengers)
7. **Chevrolet Suburban** - $110/hr, $90 airport (6 passengers)
8. **GMC Yukon Denali** - $120/hr, $100 airport (6 passengers)

### Stretch Limo (1)
9. **Lincoln Stretch Limo** - $150/hr (8-10 passengers)

### Vans (2)
10. **Mercedes Sprinter 14-seat** - $140/hr, $180 airport
11. **Luxury Sprinter 12-seat** - $180/hr, $220 airport

### Party Buses (2)
12. **Full-Size Party Bus** - $250/hr (36 passengers)
13. **Mid-Size Party Bus** - $200/hr (24 passengers)

### Coach (1)
14. **Motor Coach** - $180/hr, $300 airport (56 passengers)

---

## QUICK API REFERENCE

### Get All Vehicles
```typescript
const result = await getAllFleetVehicles({});
// Returns: { success: true, count: 14, vehicles: [...] }
```

### Get Vehicle by ID
```typescript
const result = await getFleetVehicle({ vehicleId: 'lincoln-continental' });
// Returns: { success: true, vehicle: {...} }
```

### Filter by Category
```typescript
const suvs = await getAllFleetVehicles({ category: 'suv' });
// Returns 4 SUVs
```

### Filter by Capacity
```typescript
const largeVehicles = await getAllFleetVehicles({ minCapacity: 10 });
// Returns vans, party buses, coach
```

---

## TESTING COMMANDS

### Test with Dry Run (No Data Written)
```javascript
initFleet({ dryRun: true }).then(result => {
  console.log('Dry run result:', result.data);
});
```

### Overwrite Existing Data
```javascript
initFleet({ overwrite: true }).then(result => {
  console.log('Overwrite result:', result.data);
});
```

---

## TROUBLESHOOTING

**Problem**: "Permission denied"
**Fix**: Check user role in Firestore users collection (must be admin or super_admin)

**Problem**: "Fleet vehicles already exist"
**Fix**: Use `{ overwrite: true }` option

**Problem**: Functions not found
**Fix**: `firebase deploy --only functions`

---

## FILES CREATED
- `/functions/src/scripts/addFleetVehicles.ts` - Vehicle data
- `/functions/src/fleetInitializationFunction.ts` - Cloud Functions
- `/functions/src/index.ts` - Exports (updated)
- `/FLEET_VEHICLES_IMPLEMENTATION.md` - Full documentation
- `/FLEET_QUICK_START.md` - This guide

---

**Status**: ✅ Built and ready to deploy
**Next**: Deploy functions and run initialization
