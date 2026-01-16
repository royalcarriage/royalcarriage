export const payrollSchemas = {
  driverProfiles: {
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    email: { type: "string", required: true, unique: true },
    phone: { type: "string" },
    hireDate: { type: "timestamp", required: true },
    status: {
      type: "string",
      required: true,
      enum: ["active", "inactive", "on_leave"],
    },
    payRate: { type: "number", required: true }, // Hourly rate
    payRateType: {
      type: "string",
      required: true,
      enum: ["hourly", "salary", "commission"],
    },
    paymentMethod: {
      type: "string",
      enum: ["direct_deposit", "check", "cash"],
    },
    bankInfo: {
      type: "object",
      properties: {
        accountNumber: { type: "string" },
        routingNumber: { type: "string" },
        bankName: { type: "string" },
      },
      optional: true,
    },
    deductions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["percentage", "fixed"] },
          frequency: {
            type: "string",
            enum: ["weekly", "biweekly", "monthly"],
          },
        },
      },
      optional: true,
    },
  },
  payRules: {
    ruleName: { type: "string", required: true },
    description: { type: "string" },
    rateMultipliers: {
      type: "object",
      properties: {
        overtime: { type: "number", default: 1.5 },
        holiday: { type: "number", default: 2.0 },
      },
      optional: true,
    },
    // Add other rule types as needed (e.g., bonuses, commissions)
  },
  payrollRuns: {
    runDate: { type: "timestamp", required: true },
    periodStart: { type: "timestamp", required: true },
    periodEnd: { type: "timestamp", required: true },
    status: {
      type: "string",
      required: true,
      enum: ["pending", "processing", "completed", "failed"],
    },
    totalGrossPay: { type: "number", default: 0 },
    totalDeductions: { type: "number", default: 0 },
    totalNetPay: { type: "number", default: 0 },
    processedBy: { type: "string" }, // User ID or system identifier
  },
  payrollStatements: {
    payrollRunId: { type: "string", required: true },
    driverId: { type: "string", required: true },
    grossPay: { type: "number", required: true },
    deductions: {
      type: "object",
      properties: {
        // Map deduction name to amount
        // Example: { '401k': 100, 'taxes': 500 }
      },
      optional: true,
    },
    netPay: { type: "number", required: true },
    paymentDate: { type: "timestamp" },
    paymentMethod: {
      type: "string",
      enum: ["direct_deposit", "check", "cash"],
    },
    status: { type: "string", enum: ["pending", "paid", "processing"] },
  },
  carryover: {
    driverId: { type: "string", required: true },
    payrollRunId: { type: "string", required: true },
    type: { type: "string", required: true, enum: ["vacation", "sick", "pto"] },
    hours: { type: "number", required: true },
    accruedDate: { type: "timestamp", required: true },
  },
};
