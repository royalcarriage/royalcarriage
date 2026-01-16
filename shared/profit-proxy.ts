import type { Booking, MarginConfig } from './admin-types';

/**
 * Default margin configurations by service type
 */
export const DEFAULT_MARGINS: Record<string, MarginConfig> = {
  airport: {
    serviceType: 'airport',
    taxRate: 0.1025, // 10.25% Chicago tax
    payoutRate: 0.40, // 40% to driver
  },
  corporate: {
    serviceType: 'corporate',
    taxRate: 0.1025,
    payoutRate: 0.38,
  },
  wedding: {
    serviceType: 'wedding',
    taxRate: 0.1025,
    payoutRate: 0.35,
  },
  partybus: {
    serviceType: 'partybus',
    taxRate: 0.1025,
    payoutRate: 0.42,
  },
  default: {
    serviceType: 'default',
    taxRate: 0.1025,
    payoutRate: 0.40,
  },
};

/**
 * Get attributed ad spend for a booking based on UTM params or gclid
 * This would query the ads imports to find matching spend
 */
export function getAttributedAdSpend(booking: Booking): number {
  // TODO: Implement actual ad spend attribution logic
  // For now, return 0 as placeholder
  // This should:
  // 1. Check if booking has gclid or UTM params
  // 2. Query ads_imports for matching campaign/keyword spend
  // 3. Use attribution model (last-click, linear, etc.)
  return 0;
}

/**
 * Compute profit proxy for a booking
 * Profit Proxy = Revenue - Tax - Driver Payout - Ad Spend
 */
export function computeProfitProxy(
  booking: Booking,
  config?: MarginConfig
): number {
  // Get config for service type or use default
  const marginConfig = config || DEFAULT_MARGINS[booking.serviceType] || DEFAULT_MARGINS.default;

  // Calculate components
  const revenue = booking.totalAmount;
  const tax = revenue * marginConfig.taxRate;
  const payout = booking.baseRate * marginConfig.payoutRate;
  const adSpend = getAttributedAdSpend(booking);

  // Profit proxy calculation
  const profitProxy = revenue - tax - payout - adSpend;

  return profitProxy;
}

/**
 * Compute profit proxy for multiple bookings
 */
export function computeBatchProfitProxy(
  bookings: Booking[],
  config?: MarginConfig
): {
  totalRevenue: number;
  totalTax: number;
  totalPayout: number;
  totalAdSpend: number;
  totalProfit: number;
  bookingCount: number;
  avgProfit: number;
} {
  const results = bookings.map(b => ({
    revenue: b.totalAmount,
    tax: b.totalAmount * (config?.taxRate || DEFAULT_MARGINS.default.taxRate),
    payout: b.baseRate * (config?.payoutRate || DEFAULT_MARGINS.default.payoutRate),
    adSpend: getAttributedAdSpend(b),
    profit: computeProfitProxy(b, config),
  }));

  const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);
  const totalTax = results.reduce((sum, r) => sum + r.tax, 0);
  const totalPayout = results.reduce((sum, r) => sum + r.payout, 0);
  const totalAdSpend = results.reduce((sum, r) => sum + r.adSpend, 0);
  const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);

  return {
    totalRevenue,
    totalTax,
    totalPayout,
    totalAdSpend,
    totalProfit,
    bookingCount: bookings.length,
    avgProfit: totalProfit / bookings.length || 0,
  };
}

/**
 * Analyze profit by service type
 */
export function analyzeProfitByServiceType(bookings: Booking[]): {
  serviceType: string;
  bookingCount: number;
  totalRevenue: number;
  totalProfit: number;
  avgProfit: number;
  profitMargin: number; // percentage
}[] {
  const grouped = bookings.reduce((acc, booking) => {
    const type = booking.serviceType || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  return Object.entries(grouped).map(([serviceType, serviceBookings]) => {
    const analysis = computeBatchProfitProxy(serviceBookings);
    return {
      serviceType,
      bookingCount: analysis.bookingCount,
      totalRevenue: analysis.totalRevenue,
      totalProfit: analysis.totalProfit,
      avgProfit: analysis.avgProfit,
      profitMargin: (analysis.totalProfit / analysis.totalRevenue) * 100,
    };
  }).sort((a, b) => b.totalProfit - a.totalProfit); // Sort by profit descending
}

/**
 * Identify upgrade opportunities for AOV boost
 */
export function identifyUpgradeOpportunities(booking: Booking): {
  hasOpportunity: boolean;
  suggestion: string;
  estimatedIncrease: number;
} {
  // One-way airport with >30 min wait → suggest hourly
  if (
    booking.serviceType === 'airport' &&
    booking.totalAmount < 150 // Typical one-way price
  ) {
    return {
      hasOpportunity: true,
      suggestion: 'Upgrade one-way airport to hourly service',
      estimatedIncrease: 100, // Estimated additional revenue
    };
  }

  // Group size indicators (would need actual passenger count)
  // For now, check if vehicle type suggests group
  if (booking.vehicleType?.toLowerCase().includes('suv')) {
    return {
      hasOpportunity: true,
      suggestion: 'Suggest Sprinter upgrade for larger groups',
      estimatedIncrease: 150,
    };
  }

  return {
    hasOpportunity: false,
    suggestion: '',
    estimatedIncrease: 0,
  };
}
