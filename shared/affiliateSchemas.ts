export const affiliateSchemas = {
  partnerProfiles: {
    name: { type: 'string', required: true },
    contactPerson: { type: 'string', optional: true },
    email: { type: 'string', required: true, unique: true },
    phone: { type: 'string' },
    address: { type: 'string' },
    website: { type: 'string', optional: true },
    commissionRate: { type: 'number', required: true }, // e.g., 0.10 for 10%
    commissionType: { type: 'string', required: true, enum: ['percentage', 'fixed'] },
    status: { type: 'string', required: true, enum: ['active', 'inactive', 'pending'] },
    createdAt: { type: 'timestamp', required: true },
    createdBy: { type: 'string', optional: true }, // User ID
  },
  settlementsPayable: {
    partnerId: { type: 'string', required: true },
    settlementPeriodStart: { type: 'timestamp', required: true },
    settlementPeriodEnd: { type: 'timestamp', required: true },
    totalAmount: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['pending', 'processing', 'paid'] },
    paymentDate: { type: 'timestamp' },
    paymentMethod: { type: 'string' },
    transactionId: { type: 'string', optional: true },
    notes: { type: 'string', optional: true },
  },
  settlementsReceivable: {
    partnerId: { type: 'string', required: true },
    settlementPeriodStart: { type: 'timestamp', required: true },
    settlementPeriodEnd: { type: 'timestamp', required: true },
    totalAmount: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['pending', 'processing', 'paid'] },
    paymentReceivedDate: { type: 'timestamp' },
    paymentMethod: { type: 'string' },
    transactionId: { type: 'string', optional: true },
    notes: { type: 'string', optional: true },
  },
  disputes: {
    settlementId: { type: 'string', required: true }, // Link to settlement
    disputeDate: { type: 'timestamp', required: true },
    reason: { type: 'string', required: true },
    amountInDispute: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['open', 'under_review', 'resolved', 'rejected'] },
    resolution: { type: 'string', optional: true },
    resolvedDate: { type: 'timestamp' },
    resolvedBy: { type: 'string', optional: true }, // User ID
  }
};
