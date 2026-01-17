#!/bin/bash
###############################################################################
# Royal Carriage Enterprise Data Initialization Runner
#
# Purpose: Execute the enterprise data initialization script
# - Initializes 14 fleet vehicles across 6 categories
# - Initializes 91 services (20 per website)
#
# Usage:
#   ./scripts/run-init.sh
#
# Requirements:
#   - Firebase CLI installed and authenticated
#   - Node.js installed
#   - Firebase Admin SDK credentials configured
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ROYAL CARRIAGE ENTERPRISE DATA INITIALIZATION          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}✗ Firebase CLI is not installed${NC}"
    echo "Please install Firebase CLI:"
    echo "  npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI found: $(firebase --version)${NC}"

# Check Firebase authentication
echo -e "${YELLOW}→ Checking Firebase authentication...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}✗ Not authenticated with Firebase${NC}"
    echo "Please authenticate:"
    echo "  firebase login"
    exit 1
fi

echo -e "${GREEN}✓ Firebase authenticated${NC}"

# Check project configuration
echo -e "${YELLOW}→ Checking Firebase project configuration...${NC}"
# Set the Firebase project explicitly
firebase use royalcarriagelimoseo &> /dev/null || true
FIREBASE_PROJECT=$(cat "$PROJECT_ROOT/.firebaserc" 2>/dev/null | grep -o '"default"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
if [ -z "$FIREBASE_PROJECT" ]; then
    FIREBASE_PROJECT="royalcarriagelimoseo"
fi

echo -e "${GREEN}✓ Using Firebase project: $FIREBASE_PROJECT${NC}"

# Set GOOGLE_APPLICATION_CREDENTIALS if not already set
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo -e "${YELLOW}→ Setting up application default credentials...${NC}"

    # Try to use gcloud authentication
    if command -v gcloud &> /dev/null; then
        echo -e "${YELLOW}→ Using gcloud application-default credentials...${NC}"
        export GOOGLE_APPLICATION_CREDENTIALS=""
    else
        echo -e "${YELLOW}→ GOOGLE_APPLICATION_CREDENTIALS not set, using Firebase Auth...${NC}"
    fi
else
    echo -e "${GREEN}✓ GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS${NC}"
fi

# Navigate to project root
cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Data Initialization...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Run the initialization script
node "$SCRIPT_DIR/initializeEnterpriseData.cjs"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              INITIALIZATION SUCCESSFUL!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ Fleet vehicles initialized${NC}"
    echo -e "${GREEN}✓ Services initialized${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. View data in Firebase Console"
    echo "  2. Test the admin dashboard"
    echo "  3. Generate content for services"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              INITIALIZATION FAILED!                        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please check the error messages above and try again."
    echo ""
fi

exit $EXIT_CODE
