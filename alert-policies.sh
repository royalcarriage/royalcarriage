#!/bin/bash

PROJECT_ID="royalcarriagelimoseo"
NOTIFICATION_CHANNEL="" # Will get the email channel

# Get the email notification channel
EMAIL_CHANNEL=$(gcloud alpha monitoring channels list \
  --filter="displayName:Email" \
  --format="value(name)" \
  --project=$PROJECT_ID | head -1)

if [ -z "$EMAIL_CHANNEL" ]; then
  echo "Creating email notification channel..."
  EMAIL_CHANNEL=$(gcloud alpha monitoring channels create \
    --display-name="Admin Email" \
    --type="email" \
    --channel-labels="email_address=info@royalcarriagelimo.com" \
    --project=$PROJECT_ID \
    --format="value(name)")
fi

echo "Using notification channel: $EMAIL_CHANNEL"

# Alert 1: Cloud Functions High Error Rate
echo "Creating alert for Cloud Functions error rate..."
gcloud alpha monitoring policies create \
  --notification-channels=$EMAIL_CHANNEL \
  --display-name="[CRITICAL] Cloud Functions - High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-duration=300s \
  --project=$PROJECT_ID \
  2>/dev/null || echo "Alert policy may already exist"

# Alert 2: Firestore Write Quota Usage
echo "Creating alert for Firestore write quota usage..."
gcloud alpha monitoring policies create \
  --notification-channels=$EMAIL_CHANNEL \
  --display-name="[WARNING] Firestore - Write Quota > 80%" \
  --condition-display-name="Write quota usage > 80%" \
  --condition-threshold-value=80 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-duration=300s \
  --project=$PROJECT_ID \
  2>/dev/null || echo "Alert policy may already exist"

# Alert 3: Firestore Read Quota Usage
echo "Creating alert for Firestore read quota usage..."
gcloud alpha monitoring policies create \
  --notification-channels=$EMAIL_CHANNEL \
  --display-name="[WARNING] Firestore - Read Quota > 80%" \
  --condition-display-name="Read quota usage > 80%" \
  --condition-threshold-value=80 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-duration=300s \
  --project=$PROJECT_ID \
  2>/dev/null || echo "Alert policy may already exist"

echo "Alert setup complete!"
