# Cost Monitoring and Budget Alerts Setup Guide

**Purpose:** Configure cost monitoring and budget alerts for AI image generation  
**Target:** $20/month budget with alerts at 50%, 90%, and 100%  
**Date:** January 15, 2026

---

## Overview

This guide provides step-by-step instructions for setting up comprehensive cost monitoring and budget alerts for the Google Cloud AI image generation system.

---

## Part 1: Budget Alerts Setup

### Option A: Using gcloud CLI (Recommended)

#### Step 1: Get Billing Account ID

```bash
# List all billing accounts
gcloud billing accounts list

# Expected output:
# ACCOUNT_ID            NAME                OPEN  MASTER_ACCOUNT_ID
# 01XXXX-XXXXXX-XXXXXX  My Billing Account  True
```

Copy your billing account ID (format: `01XXXX-XXXXXX-XXXXXX`)

#### Step 2: Create Budget with Alerts

```bash
# Create budget for Vertex AI with $20 limit and 3 thresholds
gcloud billing budgets create \
  --billing-account=01XXXX-XXXXXX-XXXXXX \
  --display-name="Royal Carriage AI Image Generation Budget" \
  --budget-amount=20 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 \
  --all-updates-rule-monitoring-notification-channels=projects/royalcarriagelimoseo/notificationChannels/CHANNEL_ID
```

**Threshold Explanation:**

- **50%** ($10 spent) - Early warning to monitor usage
- **90%** ($18 spent) - Critical warning to reduce usage
- **100%** ($20 spent) - Budget fully utilized

#### Step 3: Create Service-Specific Budgets (Optional)

```bash
# Budget specifically for Vertex AI API
gcloud billing budgets create \
  --billing-account=01XXXX-XXXXXX-XXXXXX \
  --display-name="Vertex AI API Budget" \
  --budget-amount=15 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 \
  --filter-services=aiplatform.googleapis.com

# Budget for Cloud Storage
gcloud billing budgets create \
  --billing-account=01XXXX-XXXXXX-XXXXXX \
  --display-name="Cloud Storage Budget" \
  --budget-amount=5 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 \
  --filter-services=storage.googleapis.com
```

### Option B: Using Google Cloud Console

#### Step 1: Navigate to Billing

1. Go to: https://console.cloud.google.com/billing
2. Select your billing account
3. Click on "Budgets & alerts" in the left menu

#### Step 2: Create Budget

1. Click "CREATE BUDGET"
2. Fill in the details:

**Step 1: Set budget scope**

- Projects: Select "royalcarriagelimoseo"
- Services:
  - Select "Vertex AI API"
  - Select "Cloud Storage"
- Credits: Include credits in cost
- Click "NEXT"

**Step 2: Set budget amount**

- Budget type: Specified amount
- Target amount: $20.00
- Budget time period: Monthly
- Budget starting month: Current month
- Click "NEXT"

**Step 3: Set threshold rules**

- Add threshold: 50% ($10.00)
- Add threshold: 90% ($18.00)
- Add threshold: 100% ($20.00)
- Click "NEXT"

**Step 4: Manage notifications**

- Email alerts recipients:
  - devops@royalcarriage.com
  - finance@royalcarriage.com
  - Add your team members
- Connect a Pub/Sub topic: (optional)
- Click "FINISH"

#### Step 3: Verify Budget Creation

You should see your budget listed with:

- Name: "Royal Carriage AI Image Generation Budget"
- Amount: $20.00/month
- Alerts: 3 thresholds configured

---

## Part 2: Email Notification Setup

### Configure Notification Channels

#### Method 1: Using gcloud CLI

```bash
# Create email notification channel
gcloud alpha monitoring channels create \
  --display-name="DevOps Team Alert" \
  --type=email \
  --channel-labels=email_address=devops@royalcarriage.com

# Create additional channels
gcloud alpha monitoring channels create \
  --display-name="Finance Team Alert" \
  --type=email \
  --channel-labels=email_address=finance@royalcarriage.com

# List all notification channels
gcloud alpha monitoring channels list
```

#### Method 2: Using Console

1. Go to: https://console.cloud.google.com/monitoring/alerting/notifications
2. Click "ADD NEW"
3. Select "Email"
4. Enter email address
5. Add display name
6. Click "SAVE"

Repeat for all team members who should receive alerts.

---

## Part 3: Cloud Monitoring Dashboard

### Create Custom Dashboard

#### Step 1: Navigate to Monitoring

1. Go to: https://console.cloud.google.com/monitoring
2. Click "Dashboards" in left menu
3. Click "CREATE DASHBOARD"
4. Name: "AI Image Generation Monitoring"

#### Step 2: Add Vertex AI Metrics

**Chart 1: API Request Count**

1. Click "ADD CHART"
2. Chart type: Line
3. Resource type: "Vertex AI API"
4. Metric: "Request count"
5. Filter: method="GenerateImages"
6. Aggregation: Sum
7. Group by: none
8. Chart title: "Vertex AI Image Generation Requests"
9. Click "SAVE"

**Chart 2: API Error Rate**

1. Click "ADD CHART"
2. Chart type: Line
3. Resource type: "Vertex AI API"
4. Metric: "Request count"
5. Filter: response_code!=200
6. Aggregation: Rate
7. Chart title: "API Error Rate"
8. Click "SAVE"

**Chart 3: API Latency**

1. Click "ADD CHART"
2. Chart type: Heatmap
3. Resource type: "Vertex AI API"
4. Metric: "Request latencies"
5. Aggregation: 95th percentile
6. Chart title: "API Latency (P95)"
7. Click "SAVE"

#### Step 3: Add Cloud Storage Metrics

**Chart 4: Storage Usage**

1. Click "ADD CHART"
2. Chart type: Stacked area
3. Resource type: "GCS Bucket"
4. Metric: "Total bytes"
5. Filter: bucket_name="royalcarriagelimoseo-ai-images"
6. Aggregation: Mean
7. Chart title: "Storage Bucket Size"
8. Click "SAVE"

**Chart 5: Object Count**

1. Click "ADD CHART"
2. Chart type: Line
3. Resource type: "GCS Bucket"
4. Metric: "Total object count"
5. Filter: bucket_name="royalcarriagelimoseo-ai-images"
6. Chart title: "Total Images Stored"
7. Click "SAVE"

#### Step 4: Add Cost Metrics

**Chart 6: Estimated Daily Cost**

1. Click "ADD CHART"
2. Chart type: Line
3. Use custom query:
   ```
   fetch gce_instance
   | metric 'cost'
   | filter resource.project_id == 'royalcarriagelimoseo'
   | group_by 1d, [value_cost_sum: sum(value.cost)]
   ```
4. Chart title: "Estimated Daily Cost"
5. Click "SAVE"

#### Step 5: Add Firebase Functions Metrics

**Chart 7: Function Invocations**

1. Click "ADD CHART"
2. Chart type: Stacked bar
3. Resource type: "Cloud Function"
4. Metric: "Execution count"
5. Filter: function_name=~"._Image._"
6. Group by: function_name
7. Chart title: "Image-Related Function Calls"
8. Click "SAVE"

**Chart 8: Function Errors**

1. Click "ADD CHART"
2. Chart type: Line
3. Resource type: "Cloud Function"
4. Metric: "Execution error count"
5. Filter: function_name=~"._Image._"
6. Chart title: "Function Error Count"
7. Click "SAVE"

#### Step 6: Save Dashboard

1. Click "SAVE DASHBOARD"
2. Verify all charts are displaying data
3. Bookmark the dashboard URL

---

## Part 4: Alerting Policies

### Create Alert: High Error Rate

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="AI Image Generation - High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-threshold-comparison=COMPARISON_GT
```

### Create Alert: Approaching Budget Limit

Via Console:

1. Go to: https://console.cloud.google.com/monitoring/alerting/policies/create
2. Click "ADD CONDITION"
3. **Target:**
   - Resource type: Billing Account
   - Metric: Costs (forecasted)
4. **Configuration:**
   - Threshold position: Above threshold
   - Threshold value: 18 (90% of $20)
   - Duration: 0 minutes
5. Click "ADD"
6. **Notifications:**
   - Select notification channels
   - Add documentation: "Budget nearly exhausted. Review usage immediately."
7. Click "SAVE"

### Create Alert: Storage Quota

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Storage Bucket Size Warning" \
  --condition-display-name="Bucket size > 10GB" \
  --condition-threshold-value=10737418240 \
  --condition-threshold-duration=0s
```

### Create Alert: Daily Image Generation Spike

Via Console:

1. Create alert policy
2. Target: Vertex AI API request count
3. Condition: Rate of increase > 200% compared to previous day
4. Notification: Email + SMS for critical spike

---

## Part 5: Cost Analysis Reports

### Enable Cost Breakdown Reports

1. Go to: https://console.cloud.google.com/billing/reports
2. Select project: royalcarriagelimoseo
3. Configure report:
   - Group by: Service
   - Filter: Vertex AI API, Cloud Storage
   - Date range: Last 30 days
4. Click "SAVE VIEW"
5. Name: "AI Image Generation Costs"

### Schedule Weekly Reports

1. In billing reports page
2. Click "SCHEDULE EMAIL"
3. Recipients: finance@royalcarriage.com, devops@royalcarriage.com
4. Frequency: Weekly (Monday morning)
5. Format: PDF
6. Click "SAVE"

### Export to BigQuery (Advanced)

For detailed analysis:

```bash
# Enable billing export to BigQuery
gcloud billing accounts update BILLING_ACCOUNT_ID \
  --billing-data-export-dataset=billing_export \
  --billing-data-export-project=royalcarriagelimoseo
```

---

## Part 6: Usage Tracking in Firestore

### Query Current Usage

You can query Firestore to see real-time usage:

```javascript
// Get today's usage for a user
const today = new Date().toISOString().split("T")[0];
const userId = "admin-user-id";

const usageRef = firestore.collection("usage_stats").doc(`${userId}_${today}`);
const doc = await usageRef.get();

if (doc.exists) {
  console.log("Images generated today:", doc.data().imageGenerations);
  console.log("Estimated cost:", doc.data().totalCost);
} else {
  console.log("No usage today");
}
```

### Weekly Usage Report Query

```javascript
// Get last 7 days of usage
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const usageSnapshot = await firestore
  .collection("usage_stats")
  .where("date", ">=", sevenDaysAgo.toISOString().split("T")[0])
  .get();

let totalImages = 0;
let totalCost = 0;

usageSnapshot.forEach((doc) => {
  totalImages += doc.data().imageGenerations;
  totalCost += doc.data().totalCost;
});

console.log(`Last 7 days: ${totalImages} images, $${totalCost.toFixed(2)}`);
```

---

## Part 7: Verification Checklist

After completing setup, verify:

### Budget Alerts

- [ ] Budget created with $20 monthly limit
- [ ] Three threshold alerts configured (50%, 90%, 100%)
- [ ] Email notifications configured
- [ ] Test notification received

### Monitoring Dashboard

- [ ] Dashboard created and accessible
- [ ] Vertex AI metrics displaying
- [ ] Cloud Storage metrics displaying
- [ ] Function metrics displaying
- [ ] Cost estimates visible
- [ ] Dashboard URL bookmarked

### Alerting Policies

- [ ] High error rate alert configured
- [ ] Budget warning alert configured
- [ ] Storage quota alert configured
- [ ] Notification channels tested

### Reporting

- [ ] Weekly cost reports scheduled
- [ ] Report recipients confirmed
- [ ] First report received

---

## Part 8: Monitoring Best Practices

### Daily Checks

- Review dashboard for unusual spikes
- Check error rates
- Verify storage growth is expected

### Weekly Reviews

- Review cost reports
- Compare actual vs budgeted costs
- Analyze usage patterns
- Adjust budgets if needed

### Monthly Reviews

- Full cost analysis
- Usage trend analysis
- ROI evaluation
- Budget planning for next month

### Quarterly Reviews

- Comprehensive audit
- Security review
- Optimization opportunities
- Feature usage analysis

---

## Part 9: Troubleshooting

### Issue: Not Receiving Budget Alerts

**Check:**

1. Email addresses are correct
2. Notification channels are active
3. Emails not in spam folder
4. Budget thresholds are properly set

**Fix:**

```bash
# Verify notification channels
gcloud alpha monitoring channels list

# Test notification
gcloud alpha monitoring channels send-verification-code CHANNEL_ID
```

### Issue: Dashboard Not Showing Data

**Check:**

1. Correct project selected
2. Time range is appropriate
3. Metrics exist (need some usage first)
4. Permissions are correct

**Fix:**

- Wait 5-10 minutes for initial data
- Generate a test image to create data
- Verify API calls are being made

### Issue: Cost Reports Not Generating

**Check:**

1. Billing export is enabled
2. Permissions are set correctly
3. Destination exists (email/BigQuery)

**Fix:**

```bash
# Re-enable billing export
gcloud billing accounts update BILLING_ACCOUNT_ID \
  --billing-data-export-dataset=billing_export
```

---

## Support Contacts

- **Budget/Billing Issues:** finance@royalcarriage.com
- **Technical Issues:** devops@royalcarriage.com
- **Google Cloud Support:** https://cloud.google.com/support

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Next Review:** February 15, 2026
