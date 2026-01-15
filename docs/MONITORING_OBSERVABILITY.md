# Monitoring and Observability Guide

This guide covers monitoring, logging, and observability setup for the Royal Carriage AI Image Generation system.

## Table of Contents

1. [Application Monitoring](#application-monitoring)
2. [Error Tracking](#error-tracking)
3. [Performance Monitoring](#performance-monitoring)
4. [Log Management](#log-management)
5. [Alerting](#alerting)
6. [Dashboards](#dashboards)
7. [Health Checks](#health-checks)

## Application Monitoring

### Firebase Console Monitoring

Firebase provides built-in monitoring for Functions, Firestore, and Hosting.

**Access Monitoring:**
```bash
# Open Firebase Console
https://console.firebase.google.com/project/{your-project}/overview
```

**Key Metrics to Monitor:**
- Function invocations and errors
- Function execution time
- Firestore reads/writes
- Storage operations
- Authentication events

### Google Cloud Monitoring

For advanced monitoring, use Google Cloud Operations:

```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com

# Create monitoring workspace
gcloud monitoring channels create \
  --channel-content-from-file=monitoring-config.yaml
```

## Error Tracking

### Firebase Crashlytics

Setup error tracking for the application:

```typescript
// In your application
import { getAnalytics, logEvent } from 'firebase/analytics';

function trackError(error: Error, context: Record<string, any>) {
  logEvent(analytics, 'error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}
```

### Cloud Error Reporting

Errors in Firebase Functions are automatically sent to Cloud Error Reporting:

**View Errors:**
```bash
# Open Cloud Console
https://console.cloud.google.com/errors?project={your-project}
```

**Configure Error Notifications:**
```bash
# Create error notification channel
gcloud beta error-reporting events list \
  --project={your-project} \
  --limit=10
```

## Performance Monitoring

### Firebase Performance Monitoring

Add Performance Monitoring SDK to track app performance:

```typescript
// client/src/lib/performance.ts
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();

export async function measureImageGeneration(fn: () => Promise<any>) {
  const t = trace(perf, 'image_generation');
  t.start();
  
  try {
    const result = await fn();
    t.putMetric('success', 1);
    return result;
  } catch (error) {
    t.putMetric('error', 1);
    throw error;
  } finally {
    t.stop();
  }
}
```

### Custom Performance Metrics

Track custom metrics for AI operations:

```typescript
// server/ai/metrics.ts
export class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();
  
  record(metricName: string, value: number) {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    this.metrics.get(metricName)!.push(value);
  }
  
  getStats(metricName: string) {
    const values = this.metrics.get(metricName) || [];
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}
```

## Log Management

### Structured Logging

Implement structured logging for better queryability:

```typescript
// server/lib/logger.ts
export class Logger {
  private context: Record<string, any>;
  
  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }
  
  info(message: string, data?: Record<string, any>) {
    console.log(JSON.stringify({
      severity: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    }));
  }
  
  error(message: string, error?: Error, data?: Record<string, any>) {
    console.error(JSON.stringify({
      severity: 'ERROR',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    }));
  }
  
  warn(message: string, data?: Record<string, any>) {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    }));
  }
}

// Usage
const logger = new Logger({ service: 'image-generation' });
logger.info('Image generation started', { userId, purpose });
```

### Log Queries

Query logs in Cloud Logging:

```bash
# View all errors in the last hour
gcloud logging read "severity>=ERROR AND timestamp>=\"$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%S')\"" \
  --project={your-project} \
  --limit=50

# View image generation logs
gcloud logging read "resource.type=\"cloud_function\" AND textPayload=~\"image.*generation\"" \
  --project={your-project} \
  --limit=20

# Export logs to BigQuery for analysis
gcloud logging sinks create image-gen-logs \
  bigquery.googleapis.com/projects/{your-project}/datasets/logs \
  --log-filter='resource.type="cloud_function" AND textPayload=~"image"'
```

## Alerting

### Budget Alerts

Budget alerts are covered in COST_MONITORING_SETUP.md, but here are additional alerts:

**Function Error Rate Alert:**
```bash
# Create alerting policy for high error rate
gcloud alpha monitoring policies create \
  --notification-channels={CHANNEL_ID} \
  --display-name="High Function Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

**Response Time Alert:**
```bash
# Alert on slow function execution
gcloud alpha monitoring policies create \
  --notification-channels={CHANNEL_ID} \
  --display-name="Slow Image Generation" \
  --condition-display-name="P95 latency > 30s" \
  --condition-threshold-value=30000 \
  --condition-threshold-duration=300s
```

### Email Notifications

Configure email notifications:

```bash
# Create notification channel
gcloud alpha monitoring channels create \
  --display-name="DevOps Email" \
  --type=email \
  --channel-labels=email_address=devops@example.com
```

## Dashboards

### Cloud Monitoring Dashboard

Create a comprehensive monitoring dashboard:

```yaml
# monitoring-dashboard.yaml
displayName: "AI Image Generation Dashboard"
mosaicLayout:
  columns: 12
  tiles:
    - width: 6
      height: 4
      widget:
        title: "Function Invocations"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_function"'
                  aggregation:
                    alignmentPeriod: 60s
                    perSeriesAligner: ALIGN_RATE
    
    - width: 6
      height: 4
      widget:
        title: "Function Errors"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_function" AND metric.type="cloudfunctions.googleapis.com/function/execution_count" AND metric.label.status="error"'
    
    - width: 6
      height: 4
      widget:
        title: "Image Generation Latency"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_function" AND resource.label.function_name="generateImage"'
                  aggregation:
                    alignmentPeriod: 60s
                    perSeriesAligner: ALIGN_DELTA
    
    - width: 6
      height: 4
      widget:
        title: "Storage Usage"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="gcs_bucket"'
                  aggregation:
                    alignmentPeriod: 3600s
```

**Create Dashboard:**
```bash
gcloud monitoring dashboards create --config-from-file=monitoring-dashboard.yaml
```

### Custom Metrics Dashboard

For Firestore usage statistics:

```typescript
// Track daily image generation stats
async function recordDailyStats(userId: string, purpose: string) {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = db.collection('usage_stats').doc(`${userId}_${today}`);
  
  await statsRef.set({
    userId,
    date: today,
    imageGenerations: FieldValue.increment(1),
    purposes: FieldValue.arrayUnion(purpose),
    lastGeneration: FieldValue.serverTimestamp(),
  }, { merge: true });
}
```

## Health Checks

### Endpoint Health Checks

Create health check endpoints:

```typescript
// server/api/health.ts
import express from 'express';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      vertexAI: await checkVertexAI(),
      storage: await checkStorage(),
      firestore: await checkFirestore(),
    },
  };
  
  const allHealthy = Object.values(health.checks).every(c => c.status === 'ok');
  res.status(allHealthy ? 200 : 503).json(health);
});

async function checkVertexAI() {
  try {
    // Lightweight check
    return { status: 'ok', message: 'Vertex AI accessible' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkStorage() {
  try {
    // Check bucket accessibility
    return { status: 'ok', message: 'Storage accessible' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkFirestore() {
  try {
    // Simple read operation
    await db.collection('_health').doc('check').get();
    return { status: 'ok', message: 'Firestore accessible' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export default router;
```

### Uptime Monitoring

Set up external uptime monitoring:

```bash
# Create uptime check
gcloud monitoring uptime create https-check \
  --display-name="Image Gen API Health" \
  --resource-type=uptime-url \
  --host=your-domain.com \
  --path=/api/health \
  --period=60 \
  --timeout=10s
```

## Key Metrics to Track

### System Metrics

1. **Availability**: % of successful requests
   - Target: >99.5%

2. **Latency**: P50, P95, P99 response times
   - Target P95: <30s for image generation

3. **Error Rate**: % of requests resulting in errors
   - Target: <1%

4. **Throughput**: Requests per minute
   - Monitor for capacity planning

### Business Metrics

1. **Daily Active Users**: Admins using image generation
2. **Images Generated**: Total daily image generation count
3. **Cost Per Image**: Average cost per generated image
4. **Fallback Rate**: % of requests using fallback images

### Resource Metrics

1. **Function Memory Usage**: Peak and average memory
2. **Function CPU Usage**: CPU utilization
3. **Storage Size**: Total size of generated images
4. **Firestore Reads/Writes**: Daily document operations

## Monitoring Best Practices

1. **Set Baseline Metrics**: Establish normal behavior patterns
2. **Create Runbooks**: Document response procedures for alerts
3. **Regular Reviews**: Weekly review of metrics and trends
4. **Incident Post-Mortems**: Document and learn from incidents
5. **Capacity Planning**: Monitor growth trends for scaling decisions
6. **Cost Optimization**: Track cost metrics alongside performance

## Troubleshooting

### High Error Rate

1. Check Cloud Error Reporting for error patterns
2. Review recent deployments for issues
3. Check external dependencies (Vertex AI, Storage)
4. Verify configuration and environment variables

### Slow Performance

1. Check Cloud Trace for bottlenecks
2. Review function memory allocation
3. Check cold start frequency
4. Analyze Vertex AI API latency

### Cost Spikes

1. Review usage patterns in BigQuery
2. Check for unexpected API calls
3. Verify rate limiting is working
4. Review image generation logs

## Additional Resources

- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [Cloud Monitoring Documentation](https://cloud.google.com/monitoring/docs)
- [Cloud Logging Query Language](https://cloud.google.com/logging/docs/view/logging-query-language)
- [Alerting Best Practices](https://cloud.google.com/monitoring/alerts)
