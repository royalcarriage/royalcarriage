/**
 * Data Freshness Tracking
 * Tracks last import timestamps and alerts if data is stale
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DataSource {
  name: string;
  type: 'daily' | 'weekly';
  path: string;
  description: string;
}

export interface FreshnessStatus {
  source: string;
  lastUpdated: Date | null;
  age: number; // hours since last update
  status: 'fresh' | 'stale' | 'critical' | 'missing';
  threshold: number; // hours
  message: string;
}

// Define all data sources
export const DATA_SOURCES: DataSource[] = [
  {
    name: 'Moovs CSV',
    type: 'daily',
    path: 'data/moovs',
    description: 'Trip and revenue data from Moovs platform'
  },
  {
    name: 'Google Ads CSV',
    type: 'weekly',
    path: 'data/google-ads',
    description: 'Ad performance and spend data'
  },
  {
    name: 'GA4 Data',
    type: 'daily',
    path: 'packages/content/metrics',
    description: 'Google Analytics 4 engagement data'
  },
  {
    name: 'GSC Data',
    type: 'weekly',
    path: 'data/gsc',
    description: 'Google Search Console indexing and performance'
  },
  {
    name: 'SEO Bot Queue',
    type: 'daily',
    path: 'packages/content/seo-bot/queue',
    description: 'SEO content generation queue'
  }
];

/**
 * Get threshold in hours based on data type
 */
function getThreshold(type: 'daily' | 'weekly'): number {
  return type === 'daily' ? 24 : 168; // 24 hours or 7 days
}

/**
 * Get status based on age and threshold
 */
function getStatus(age: number | null, threshold: number): 'fresh' | 'stale' | 'critical' | 'missing' {
  if (age === null) return 'missing';
  if (age < threshold) return 'fresh';
  if (age < threshold * 2) return 'stale';
  return 'critical';
}

/**
 * Find most recent file in directory
 */
async function findMostRecentFile(dirPath: string): Promise<Date | null> {
  try {
    const fullPath = path.join(__dirname, '..', dirPath);
    const files = await fs.readdir(fullPath);
    
    if (files.length === 0) return null;
    
    let mostRecent: Date | null = null;
    
    for (const file of files) {
      try {
        const filePath = path.join(fullPath, file);
        const stats = await fs.stat(filePath);
        
        if (!mostRecent || stats.mtime > mostRecent) {
          mostRecent = stats.mtime;
        }
      } catch {
        // Skip files we can't read
        continue;
      }
    }
    
    return mostRecent;
  } catch (error) {
    return null;
  }
}

/**
 * Check freshness of a single data source
 */
export async function checkDataSource(source: DataSource): Promise<FreshnessStatus> {
  const lastUpdated = await findMostRecentFile(source.path);
  const threshold = getThreshold(source.type);
  
  let age: number | null = null;
  if (lastUpdated) {
    age = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60); // Convert to hours
  }
  
  const status = getStatus(age, threshold);
  
  let message = '';
  if (status === 'missing') {
    message = `No data found in ${source.path}`;
  } else if (status === 'fresh') {
    message = `Updated ${Math.floor(age!)} hours ago`;
  } else if (status === 'stale') {
    message = `Stale: ${Math.floor(age!)} hours old (threshold: ${threshold}h)`;
  } else {
    message = `CRITICAL: ${Math.floor(age!)} hours old (threshold: ${threshold}h)`;
  }
  
  return {
    source: source.name,
    lastUpdated,
    age: age || 0,
    status,
    threshold,
    message
  };
}

/**
 * Check freshness of all data sources
 */
export async function checkAllDataSources(): Promise<FreshnessStatus[]> {
  const checks = await Promise.all(
    DATA_SOURCES.map(source => checkDataSource(source))
  );
  
  return checks;
}

/**
 * Get alert summary
 */
export function getAlertSummary(statuses: FreshnessStatus[]): {
  fresh: number;
  stale: number;
  critical: number;
  missing: number;
  alerts: FreshnessStatus[];
} {
  return {
    fresh: statuses.filter(s => s.status === 'fresh').length,
    stale: statuses.filter(s => s.status === 'stale').length,
    critical: statuses.filter(s => s.status === 'critical').length,
    missing: statuses.filter(s => s.status === 'missing').length,
    alerts: statuses.filter(s => s.status === 'stale' || s.status === 'critical' || s.status === 'missing')
  };
}

/**
 * Format status for display
 */
export function formatStatus(status: FreshnessStatus): string {
  const icons = {
    fresh: '🟢',
    stale: '🟡',
    critical: '🔴',
    missing: '⚫'
  };
  
  return `${icons[status.status]} ${status.source}: ${status.message}`;
}

/**
 * Generate freshness report
 */
export async function generateFreshnessReport(): Promise<{
  timestamp: string;
  statuses: FreshnessStatus[];
  summary: ReturnType<typeof getAlertSummary>;
}> {
  const statuses = await checkAllDataSources();
  const summary = getAlertSummary(statuses);
  
  return {
    timestamp: new Date().toISOString(),
    statuses,
    summary
  };
}
