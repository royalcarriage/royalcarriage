export const accountingSchemas = {
  ledger: {
    amount: { type: 'number', required: true },
    date: { type: 'timestamp', required: true },
    description: { type: 'string', required: true },
    category: { type: 'string', required: true },
    accountId: { type: 'string', required: true }, // e.g., COA ID
    transactionType: { type: 'string', required: true, enum: ['credit', 'debit'] },
  },
  chartOfAccounts: {
    name: { type: 'string', required: true },
    type: { type: 'string', required: true, enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] },
    balance: { type: 'number', default: 0 },
  },
  invoices: {
    customerId: { type: 'string', required: true },
    invoiceDate: { type: 'timestamp', required: true },
    dueDate: { type: 'timestamp', required: true },
    amount: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['draft', 'sent', 'paid', 'overdue', 'void'] },
    items: {
      type: 'array',
      items: {
        productId: { type: 'string' },
        description: { type: 'string' },
        quantity: { type: 'number' },
        unitPrice: { type: 'number' },
        lineTotal: { type: 'number' },
      },
    },
  },
  accountsReceivable: {
    invoiceId: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    amountDue: { type: 'number', required: true },
    paymentDate: { type: 'timestamp' },
    status: { type: 'string', required: true, enum: ['open', 'closed', 'partially_paid'] },
  },
  accountsPayable: {
    vendorId: { type: 'string', required: true },
    billDate: { type: 'timestamp', required: true },
    dueDate: { type: 'timestamp', required: true },
    amountDue: { type: 'number', required: true },
    paymentDate: { type: 'timestamp' },
    status: { type: 'string', required: true, enum: ['open', 'paid', 'overdue'] },
  },
  reconciliation: {
    bankStatementDate: { type: 'timestamp', required: true },
    bankStatementBalance: { type: 'number', required: true },
    ledgerBalance: { type: 'number', required: true },
    difference: { type: 'number', required: true },
    status: { type: 'string', required: true, enum: ['pending', 'reconciled', 'discrepancy'] },
    discrepancies: { type: 'array', items: { type: 'string' } },
  },
  profitAndLoss: {
    period: { type: 'string', required: true }, // e.g., '2024-01', '2024-Q1'
    revenue: { type: 'number', required: true },
    expenses: { type: 'number', required: true },
    netProfit: { type: 'number', required: true },
  }
};