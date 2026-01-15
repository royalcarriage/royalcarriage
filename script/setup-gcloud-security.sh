#!/bin/bash

# Google Cloud Security Configuration Script
# Automates the setup of Google Cloud services for AI image generation
# 
# Usage: ./setup-gcloud-security.sh
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Project: royalcarriagelimoseo

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ID="royalcarriagelimoseo"
BUCKET_NAME="${PROJECT_ID}-ai-images"
REGION="us-central1"

echo "========================================"
echo "Google Cloud Security Configuration"
echo "Project: ${PROJECT_ID}"
echo "========================================"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_error "Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

print_status "gcloud CLI is installed and authenticated"

# Set the project
echo ""
echo "Setting active project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}
print_status "Project set to ${PROJECT_ID}"

# Step 1: Enable required APIs
echo ""
echo "Step 1: Enabling required APIs..."
echo "-----------------------------------"

apis=(
    "aiplatform.googleapis.com:Vertex AI API"
    "storage-api.googleapis.com:Cloud Storage API"
    "secretmanager.googleapis.com:Secret Manager API"
    "cloudbuild.googleapis.com:Cloud Build API"
)

for api in "${apis[@]}"; do
    IFS=':' read -r api_name api_display <<< "$api"
    echo "Enabling ${api_display}..."
    if gcloud services enable ${api_name} --project=${PROJECT_ID} 2>&1 | grep -q "already enabled"; then
        print_warning "${api_display} already enabled"
    else
        print_status "${api_display} enabled successfully"
    fi
done

# Step 2: Create Cloud Storage bucket
echo ""
echo "Step 2: Creating Cloud Storage bucket..."
echo "----------------------------------------"

if gsutil ls -b gs://${BUCKET_NAME} &> /dev/null; then
    print_warning "Bucket gs://${BUCKET_NAME} already exists"
else
    echo "Creating bucket gs://${BUCKET_NAME}..."
    gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${BUCKET_NAME}/
    print_status "Bucket created successfully"
fi

# Step 3: Configure bucket CORS
echo ""
echo "Step 3: Configuring CORS for bucket..."
echo "---------------------------------------"

cat > /tmp/cors-config.json << 'EOF'
[
  {
    "origin": ["https://royalcarriagelimoseo.web.app", "https://chicagoairportblackcar.com", "http://localhost:5000"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors-config.json gs://${BUCKET_NAME}/
print_status "CORS configured successfully"

# Step 4: Make bucket publicly readable
echo ""
echo "Step 4: Configuring bucket permissions..."
echo "------------------------------------------"

gsutil iam ch allUsers:objectViewer gs://${BUCKET_NAME}/
print_status "Bucket set to publicly readable"

# Step 5: Get service account and grant permissions
echo ""
echo "Step 5: Configuring IAM permissions..."
echo "---------------------------------------"

SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=${PROJECT_ID} \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

if [ -z "$SERVICE_ACCOUNT" ]; then
    print_error "Firebase service account not found. Please ensure Firebase is initialized."
    exit 1
fi

print_status "Found service account: ${SERVICE_ACCOUNT}"

# Grant required roles
roles=(
    "roles/aiplatform.user:Vertex AI User"
    "roles/storage.objectCreator:Storage Object Creator"
    "roles/storage.objectViewer:Storage Object Viewer"
)

for role in "${roles[@]}"; do
    IFS=':' read -r role_name role_display <<< "$role"
    echo "Granting ${role_display}..."
    
    if gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="${role_name}" \
        --condition=None 2>&1 | grep -q "already has"; then
        print_warning "Service account already has ${role_display}"
    else
        print_status "${role_display} granted successfully"
    fi
done

# Step 6: Grant storage permissions on bucket
echo ""
echo "Granting storage permissions on bucket..."
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectCreator gs://${BUCKET_NAME}/
print_status "Storage permissions granted on bucket"

# Step 7: Verify configuration
echo ""
echo "Step 6: Verifying configuration..."
echo "-----------------------------------"

echo "Checking enabled APIs..."
enabled_apis=$(gcloud services list --enabled --project=${PROJECT_ID} --format="value(config.name)" 2>&1)

if echo "$enabled_apis" | grep -q "aiplatform.googleapis.com"; then
    print_status "Vertex AI API is enabled"
else
    print_error "Vertex AI API is NOT enabled"
fi

if echo "$enabled_apis" | grep -q "storage-api.googleapis.com"; then
    print_status "Cloud Storage API is enabled"
else
    print_error "Cloud Storage API is NOT enabled"
fi

echo ""
echo "Checking bucket existence..."
if gsutil ls -b gs://${BUCKET_NAME} &> /dev/null; then
    print_status "Bucket gs://${BUCKET_NAME} exists"
else
    print_error "Bucket gs://${BUCKET_NAME} does NOT exist"
fi

echo ""
echo "Checking service account permissions..."
permissions=$(gcloud projects get-iam-policy ${PROJECT_ID} \
    --flatten="bindings[].members" \
    --filter="bindings.members:${SERVICE_ACCOUNT}" \
    --format="value(bindings.role)" 2>&1)

required_roles=("roles/aiplatform.user" "roles/storage.objectCreator" "roles/storage.objectViewer")
for required_role in "${required_roles[@]}"; do
    if echo "$permissions" | grep -q "$required_role"; then
        print_status "Service account has ${required_role}"
    else
        print_warning "Service account may not have ${required_role}"
    fi
done

# Step 8: Create .env configuration
echo ""
echo "Step 7: Creating environment configuration..."
echo "----------------------------------------------"

if [ -f ".env" ]; then
    print_warning ".env file already exists. Creating .env.gcloud-config instead."
    ENV_FILE=".env.gcloud-config"
else
    ENV_FILE=".env"
fi

cat > ${ENV_FILE} << EOF
# Google Cloud Configuration
# Generated by setup-gcloud-security.sh on $(date)

GOOGLE_CLOUD_PROJECT=${PROJECT_ID}
GOOGLE_CLOUD_LOCATION=${REGION}
GOOGLE_CLOUD_STORAGE_BUCKET=${BUCKET_NAME}

# Vertex AI Configuration
VERTEX_AI_LOCATION=${REGION}
IMAGEN_MODEL=imagen-3.0-generate-001

# Image Generation Limits
MAX_IMAGES_PER_DAY=50
MAX_IMAGE_SIZE_MB=10

# API Rate Limiting
API_RATE_LIMIT=100

# Security
# Generate a secure session secret with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-random-session-secret-at-least-32-characters-long

# Note: For production, use GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
# For Firebase Functions, Application Default Credentials (ADC) are used automatically.
EOF

print_status "Environment configuration created: ${ENV_FILE}"

# Summary
echo ""
echo "========================================"
echo "Configuration Summary"
echo "========================================"
echo ""
echo "✓ Vertex AI API: Enabled"
echo "✓ Cloud Storage API: Enabled"
echo "✓ Storage Bucket: gs://${BUCKET_NAME}"
echo "✓ Service Account: ${SERVICE_ACCOUNT}"
echo "✓ IAM Permissions: Configured"
echo "✓ Environment File: ${ENV_FILE}"
echo ""
echo "Next Steps:"
echo "1. Review and merge ${ENV_FILE} into your .env file"
echo "2. Update SESSION_SECRET with a secure value"
echo "3. Deploy your application: firebase deploy"
echo "4. Test image generation from admin dashboard"
echo ""
echo "For detailed information, see:"
echo "- docs/GOOGLE_CLOUD_SECURITY_AUDIT.md"
echo "- docs/ENABLE_IMAGE_GENERATION.md"
echo ""
echo "========================================"
echo "Setup Complete! 🎉"
echo "========================================"
