/**
 * KPI Thresholds for Production-Grade SEO System
 * All threshold values for Green/Yellow/Red indicators
 */

export interface ThresholdRange {
  green: number;
  yellow: number;
  unit?: string;
}

export interface DataFreshnessThreshold extends ThresholdRange {
  unit: 'hours' | 'days';
}

// A. Data Freshness Thresholds
export const DATA_FRESHNESS_THRESHOLDS = {
  googleAds: { green: 24, yellow: 72, unit: 'hours' as const },
  ga4Events: { green: 24, yellow: 72, unit: 'hours' as const },
  moovsCsv: { green: 24, yellow: 72, unit: 'hours' as const },
  gscData: { green: 7, yellow: 14, unit: 'days' as const }
};

// B. Revenue & Profit Proxy Thresholds
export const REVENUE_THRESHOLDS = {
  revenueWoW: { green: 0, yellow: -5, red: -10 }, // % change
  adSpendVsRevenue: {
    green: 'revenue > spend',
    yellow: 'near breakeven',
    red: 'spend > revenue'
  },
  profitProxy: {
    green: 'positive',
    yellow: 'near zero',
    red: 'negative'
  },
  avgOrderValue: { green: 0, yellow: -5, red: -10 } // % change
};

// C. Conversion Health Thresholds (Per Page)
export const CONVERSION_THRESHOLDS = {
  clickToCall: { green: 0, yellow: -5, red: -10 }, // vs baseline %
  bookNowClicks: { green: 0, yellow: -5, red: -10 },
  scroll75Pct: { green: 40, yellow: 25, red: 0 }, // % of visitors
  bounceRate: { green: 0, yellow: 5, red: 10 } // % above baseline
};

// D. SEO System Health Thresholds
export const SEO_THRESHOLDS = {
  indexedPages: {
    description: 'stable or up = 🟢, small drop = 🟡, large drop = 🔴',
    thresholds: { green: 0, yellow: -5, red: -15 } // % change
  },
  coverageErrors: { green: 2, yellow: 10 }, // max count
  cannibalization: {
    none: '🟢',
    suspected: '🟡',
    confirmed: '🔴'
  },
  seoGateStatus: {
    PASS: '🟢',
    WARN: '🟡',
    FAIL: '🔴'
  }
};

// E. Content Pipeline Status Thresholds
export const PIPELINE_THRESHOLDS = {
  draftsAwaitingReview: { green: 20, yellow: 50 },
  pagesPublishedMonth: {
    green: { min: 3, max: 10 },
    yellow: { min: 1, max: 15 }
  },
  pagesBlockedByGate: { green: 2, yellow: 5 }
};

// Helper functions for status calculation
export function getDataFreshnessStatus(hoursOrDays: number, threshold: DataFreshnessThreshold): 'green' | 'yellow' | 'red' {
  if (hoursOrDays <= threshold.green) return 'green';
  if (hoursOrDays <= threshold.yellow) return 'yellow';
  return 'red';
}

export function getRevenueWoWStatus(percentChange: number): 'green' | 'yellow' | 'red' {
  if (percentChange >= REVENUE_THRESHOLDS.revenueWoW.green) return 'green';
  if (percentChange >= REVENUE_THRESHOLDS.revenueWoW.yellow) return 'yellow';
  return 'red';
}

export function getConversionStatus(value: number, baseline: number, type: 'clickToCall' | 'bookNowClicks'): 'green' | 'yellow' | 'red' {
  const percentChange = ((value - baseline) / baseline) * 100;
  const threshold = CONVERSION_THRESHOLDS[type];
  
  if (percentChange >= threshold.green) return 'green';
  if (percentChange >= threshold.yellow) return 'yellow';
  return 'red';
}

export function getScroll75Status(percentage: number): 'green' | 'yellow' | 'red' {
  if (percentage >= CONVERSION_THRESHOLDS.scroll75Pct.green) return 'green';
  if (percentage >= CONVERSION_THRESHOLDS.scroll75Pct.yellow) return 'yellow';
  return 'red';
}

export function getBounceRateStatus(current: number, baseline: number): 'green' | 'yellow' | 'red' {
  const change = current - baseline;
  
  if (change <= CONVERSION_THRESHOLDS.bounceRate.green) return 'green';
  if (change <= CONVERSION_THRESHOLDS.bounceRate.yellow) return 'yellow';
  return 'red';
}

export function getPagesPublishedStatus(count: number): 'green' | 'yellow' | 'red' {
  const { green, yellow } = PIPELINE_THRESHOLDS.pagesPublishedMonth;
  
  if (count >= green.min && count <= green.max) return 'green';
  if (count >= yellow.min && count <= yellow.max) return 'yellow';
  return 'red'; // Too aggressive if >15 or too few if <1
}

export function shouldFreezePublishing(dataFreshness: Record<string, number>): boolean {
  // Check if ANY data source is red
  return (
    getDataFreshnessStatus(dataFreshness.googleAds, DATA_FRESHNESS_THRESHOLDS.googleAds) === 'red' ||
    getDataFreshnessStatus(dataFreshness.ga4Events, DATA_FRESHNESS_THRESHOLDS.ga4Events) === 'red' ||
    getDataFreshnessStatus(dataFreshness.moovsCsv, DATA_FRESHNESS_THRESHOLDS.moovsCsv) === 'red' ||
    getDataFreshnessStatus(dataFreshness.gscData, DATA_FRESHNESS_THRESHOLDS.gscData) === 'red'
  );
}
