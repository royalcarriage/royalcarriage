/**
 * Ads/Marketing CSV Schema
 * Schema definition and validation for advertising metrics import data
 */

export interface AdsMetric {
  metricId: string;
  date: string; // YYYY-MM-DD
  platform: 'google' | 'facebook' | 'instagram' | 'bing' | 'linkedin' | 'other';
  campaignName: string;
  campaignId?: string;
  adGroupName?: string;
  adGroupId?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue?: number;
  ctr?: number; // Click-through rate (%)
  cpc?: number; // Cost per click
  cpa?: number; // Cost per acquisition
  roas?: number; // Return on ad spend
  adType?: string;
  targetLocation?: string;
  deviceType?: string;
  notes?: string;
}

export interface AdsImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  duplicates: string[];
}

/**
 * Column mapping for Ads CSV files
 */
export const ADS_COLUMN_MAP: { [key: string]: keyof AdsMetric } = {
  'Metric ID': 'metricId',
  'metric_id': 'metricId',
  'id': 'metricId',
  'Date': 'date',
  'date': 'date',
  'day': 'date',
  'Platform': 'platform',
  'platform': 'platform',
  'source': 'platform',
  'Campaign': 'campaignName',
  'campaign': 'campaignName',
  'campaign_name': 'campaignName',
  'Campaign ID': 'campaignId',
  'campaign_id': 'campaignId',
  'Ad Group': 'adGroupName',
  'ad_group': 'adGroupName',
  'adgroup': 'adGroupName',
  'ad_group_name': 'adGroupName',
  'Ad Group ID': 'adGroupId',
  'ad_group_id': 'adGroupId',
  'adgroup_id': 'adGroupId',
  'Impressions': 'impressions',
  'impressions': 'impressions',
  'impr': 'impressions',
  'Clicks': 'clicks',
  'clicks': 'clicks',
  'Conversions': 'conversions',
  'conversions': 'conversions',
  'conv': 'conversions',
  'Cost': 'cost',
  'cost': 'cost',
  'spend': 'cost',
  'Revenue': 'revenue',
  'revenue': 'revenue',
  'conv_value': 'revenue',
  'conversion_value': 'revenue',
  'CTR': 'ctr',
  'ctr': 'ctr',
  'click_through_rate': 'ctr',
  'CPC': 'cpc',
  'cpc': 'cpc',
  'cost_per_click': 'cpc',
  'avg_cpc': 'cpc',
  'CPA': 'cpa',
  'cpa': 'cpa',
  'cost_per_acquisition': 'cpa',
  'cost_per_conversion': 'cpa',
  'ROAS': 'roas',
  'roas': 'roas',
  'return_on_ad_spend': 'roas',
  'Ad Type': 'adType',
  'ad_type': 'adType',
  'type': 'adType',
  'Location': 'targetLocation',
  'location': 'targetLocation',
  'target_location': 'targetLocation',
  'Device': 'deviceType',
  'device': 'deviceType',
  'device_type': 'deviceType',
  'Notes': 'notes',
  'notes': 'notes',
  'comments': 'notes',
};

/**
 * Validate an Ads metric record
 */
export function validateAdsMetric(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.metricId || typeof data.metricId !== 'string') {
    errors.push('Metric ID is required and must be a string');
  }

  if (!data.date || typeof data.date !== 'string') {
    errors.push('Date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  // Platform validation
  const validPlatforms = ['google', 'facebook', 'instagram', 'bing', 'linkedin', 'other'];
  if (!data.platform || !validPlatforms.includes(data.platform.toLowerCase())) {
    errors.push(`Platform must be one of: ${validPlatforms.join(', ')}`);
  }

  if (!data.campaignName || typeof data.campaignName !== 'string') {
    errors.push('Campaign name is required');
  }

  // Numeric validations
  if (data.impressions === undefined || isNaN(data.impressions) || data.impressions < 0) {
    errors.push('Impressions must be a non-negative number');
  }

  if (data.clicks === undefined || isNaN(data.clicks) || data.clicks < 0) {
    errors.push('Clicks must be a non-negative number');
  }

  if (data.conversions === undefined || isNaN(data.conversions) || data.conversions < 0) {
    errors.push('Conversions must be a non-negative number');
  }

  if (data.cost === undefined || isNaN(data.cost) || data.cost < 0) {
    errors.push('Cost must be a non-negative number');
  }

  if (data.revenue !== undefined && data.revenue !== null && (isNaN(data.revenue) || data.revenue < 0)) {
    errors.push('Revenue must be a non-negative number');
  }

  if (data.ctr !== undefined && data.ctr !== null && (isNaN(data.ctr) || data.ctr < 0 || data.ctr > 100)) {
    errors.push('CTR must be between 0 and 100');
  }

  if (data.cpc !== undefined && data.cpc !== null && (isNaN(data.cpc) || data.cpc < 0)) {
    errors.push('CPC must be a non-negative number');
  }

  if (data.cpa !== undefined && data.cpa !== null && (isNaN(data.cpa) || data.cpa < 0)) {
    errors.push('CPA must be a non-negative number');
  }

  if (data.roas !== undefined && data.roas !== null && (isNaN(data.roas) || data.roas < 0)) {
    errors.push('ROAS must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize an Ads metric record
 */
export function normalizeAdsMetric(data: any): AdsMetric {
  const normalized: AdsMetric = {
    metricId: String(data.metricId || '').trim(),
    date: String(data.date || '').trim(),
    platform: (data.platform || 'other').toLowerCase() as AdsMetric['platform'],
    campaignName: String(data.campaignName || '').trim(),
    campaignId: data.campaignId ? String(data.campaignId).trim() : undefined,
    adGroupName: data.adGroupName ? String(data.adGroupName).trim() : undefined,
    adGroupId: data.adGroupId ? String(data.adGroupId).trim() : undefined,
    impressions: parseInt(data.impressions) || 0,
    clicks: parseInt(data.clicks) || 0,
    conversions: parseInt(data.conversions) || 0,
    cost: parseFloat(data.cost) || 0,
    revenue: data.revenue ? parseFloat(data.revenue) : undefined,
    ctr: data.ctr ? parseFloat(data.ctr) : undefined,
    cpc: data.cpc ? parseFloat(data.cpc) : undefined,
    cpa: data.cpa ? parseFloat(data.cpa) : undefined,
    roas: data.roas ? parseFloat(data.roas) : undefined,
    adType: data.adType ? String(data.adType).trim() : undefined,
    targetLocation: data.targetLocation ? String(data.targetLocation).trim() : undefined,
    deviceType: data.deviceType ? String(data.deviceType).trim() : undefined,
    notes: data.notes ? String(data.notes).trim() : undefined,
  };

  // Calculate derived metrics if not provided
  if (normalized.ctr === undefined && normalized.impressions > 0) {
    normalized.ctr = (normalized.clicks / normalized.impressions) * 100;
  }

  if (normalized.cpc === undefined && normalized.clicks > 0) {
    normalized.cpc = normalized.cost / normalized.clicks;
  }

  if (normalized.cpa === undefined && normalized.conversions > 0) {
    normalized.cpa = normalized.cost / normalized.conversions;
  }

  if (normalized.roas === undefined && normalized.revenue !== undefined && normalized.cost > 0) {
    normalized.roas = normalized.revenue / normalized.cost;
  }

  return normalized;
}
