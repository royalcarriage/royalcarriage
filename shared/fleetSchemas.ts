export const fleetSchemas = {
  vehicles: {
    make: { type: 'string', required: true },
    model: { type: 'string', required: true },
    year: { type: 'number', required: true },
    vin: { type: 'string', required: true, unique: true },
    licensePlate: { type: 'string', required: true, unique: true },
    color: { type: 'string' },
    purchaseDate: { type: 'timestamp' },
    purchasePrice: { type: 'number' },
    currentMileage: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['active', 'maintenance', 'sold', 'retired'] },
    assignedDriverId: { type: 'string', optional: true }, // Link to driver profile
    imageUrl: { type: 'string', optional: true }, // For vehicle image
  },
  maintenanceSchedules: {
    vehicleId: { type: 'string', required: true }, // Link to vehicle
    scheduleType: { type: 'string', required: true, enum: ['oil_change', 'tire_rotation', 'brakes', 'inspection', 'other'] },
    nextServiceDate: { type: 'timestamp' },
    nextServiceMileage: { type: 'number' },
    notes: { type: 'string' },
    lastServiceDate: { type: 'timestamp' },
    lastServiceMileage: { type: 'number' },
  },
  maintenanceTickets: {
    vehicleId: { type: 'string', required: true },
    ticketDate: { type: 'timestamp', required: true },
    reportedMileage: { type: 'number', required: true },
    issueDescription: { type: 'string', required: true },
    resolutionDescription: { type: 'string' },
    serviceCost: { type: 'number' },
    serviceDate: { type: 'timestamp' },
    serviceProvider: { type: 'string' },
    status: { type: 'string', required: true, enum: ['open', 'in_progress', 'resolved', 'closed'] },
  },
  receipts: {
    ticketId: { type: 'string', required: true }, // Link to maintenance ticket
    receiptDate: { type: 'timestamp', required: true },
    amount: { type: 'number', required: true },
    provider: { type: 'string' },
    description: { type: 'string' },
    documentUrl: { type: 'string' }, // URL to stored receipt image/PDF
  },
  // Utilization could be tracked via trip data, but a summary might be stored here
  utilizationSummary: {
    vehicleId: { type: 'string', required: true },
    period: { type: 'string', required: true }, // e.g., '2024-01'
    totalMiles: { type: 'number', default: 0 },
    totalHours: { type: 'number', default: 0 },
    idleHours: { type: 'number', default: 0 },
  },
  // Total Cost of Ownership (TCO) might be calculated or summarized
  tcoSummary: {
    vehicleId: { type: 'string', required: true },
    period: { type: 'string', required: true }, // e.g., '2024-01'
    totalCost: { type: 'number', default: 0 }, // Includes purchase, maintenance, fuel, etc.
  },
};
