#!/bin/bash

# Firebase Deployment Script
# Automated deployment to Firebase (Hosting, Functions, Firestore)
#
# Usage: ./script/deploy.sh [options]
# Options:
#   --hosting-only    Deploy only hosting
#   --functions-only  Deploy only functions
#   --firestore-only  Deploy only firestore rules
#   --dry-run         Show what would be deployed without deploying
#   --help            Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
DEPLOY_HOSTING=true
DEPLOY_FUNCTIONS=true
DEPLOY_FIRESTORE=true
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --hosting-only)
            DEPLOY_HOSTING=true
            DEPLOY_FUNCTIONS=false
            DEPLOY_FIRESTORE=false
            shift
            ;;
        --functions-only)
            DEPLOY_HOSTING=false
            DEPLOY_FUNCTIONS=true
            DEPLOY_FIRESTORE=false
            shift
            ;;
        --firestore-only)
            DEPLOY_HOSTING=false
            DEPLOY_FUNCTIONS=false
            DEPLOY_FIRESTORE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Firebase Deployment Script"
            echo ""
            echo "Usage: ./script/deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --hosting-only    Deploy only hosting"
            echo "  --functions-only  Deploy only functions"
            echo "  --firestore-only  Deploy only firestore rules"
            echo "  --dry-run         Show what would be deployed without deploying"
            echo "  --help            Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo "========================================"
echo "Firebase Deployment Script"
echo "========================================"
echo ""

# Step 1: Check deployment readiness
echo -e "${BLUE}Step 1: Checking deployment readiness...${NC}"
if [ -f "script/check-deployment-readiness.sh" ]; then
    if bash script/check-deployment-readiness.sh; then
        echo -e "${GREEN}✓ Deployment readiness check passed${NC}"
    else
        echo -e "${RED}✗ Deployment readiness check failed${NC}"
        echo "Please fix the issues above before deploying."
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Deployment readiness checker not found, skipping...${NC}"
fi

echo ""

# Step 2: Build the project
echo -e "${BLUE}Step 2: Building the project...${NC}"
echo "Running: npm run build"

if [ "$DRY_RUN" = false ]; then
    if npm run build; then
        echo -e "${GREEN}✓ Build completed successfully${NC}"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}[DRY RUN] Would run: npm run build${NC}"
fi

echo ""

# Step 3: Build Firebase Functions
if [ "$DEPLOY_FUNCTIONS" = true ]; then
    echo -e "${BLUE}Step 3: Building Firebase Functions...${NC}"
    echo "Running: cd functions && npm run build && cd .."
    
    if [ "$DRY_RUN" = false ]; then
        if (cd functions && npm run build && cd ..); then
            echo -e "${GREEN}✓ Functions build completed successfully${NC}"
        else
            echo -e "${RED}✗ Functions build failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}[DRY RUN] Would run: cd functions && npm run build${NC}"
    fi
else
    echo -e "${YELLOW}Step 3: Skipping Functions build (not selected)${NC}"
fi

echo ""

# Step 4: Deploy to Firebase
echo -e "${BLUE}Step 4: Deploying to Firebase...${NC}"

DEPLOY_TARGETS=""

if [ "$DEPLOY_HOSTING" = true ]; then
    DEPLOY_TARGETS="${DEPLOY_TARGETS} hosting"
fi

if [ "$DEPLOY_FUNCTIONS" = true ]; then
    DEPLOY_TARGETS="${DEPLOY_TARGETS} functions"
fi

if [ "$DEPLOY_FIRESTORE" = true ]; then
    DEPLOY_TARGETS="${DEPLOY_TARGETS} firestore:rules,firestore:indexes"
fi

DEPLOY_TARGETS=$(echo $DEPLOY_TARGETS | xargs) # Trim whitespace

if [ -z "$DEPLOY_TARGETS" ]; then
    echo -e "${RED}✗ No deployment targets selected${NC}"
    exit 1
fi

echo "Deployment targets:$DEPLOY_TARGETS"

if [ "$DRY_RUN" = false ]; then
    # Get Firebase project
    PROJECT_ID=$(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)
    echo "Deploying to project: $PROJECT_ID"
    echo ""
    
    # Deploy
    if firebase deploy --only $DEPLOY_TARGETS; then
        echo ""
        echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    else
        echo ""
        echo -e "${RED}✗ Deployment failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}[DRY RUN] Would run: firebase deploy --only $DEPLOY_TARGETS${NC}"
fi

echo ""

# Step 5: Post-deployment verification
if [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}Step 5: Post-deployment verification...${NC}"
    
    PROJECT_ID=$(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)
    
    if [ "$DEPLOY_HOSTING" = true ]; then
        echo "Hosting URL: https://${PROJECT_ID}.web.app"
        echo "Admin Dashboard: https://${PROJECT_ID}.web.app/admin"
    fi
    
    if [ "$DEPLOY_FUNCTIONS" = true ]; then
        echo "Functions deployed to: https://us-central1-${PROJECT_ID}.cloudfunctions.net/"
        echo ""
        echo "Function endpoints:"
        echo "  - triggerPageAnalysis"
        echo "  - generateContent"
        echo "  - generateImage"
        echo "  - dailyPageAnalysis (scheduled)"
        echo "  - weeklySeoReport (scheduled)"
    fi
    
    if [ "$DEPLOY_FIRESTORE" = true ]; then
        echo "Firestore rules and indexes deployed"
    fi
else
    echo -e "${YELLOW}[DRY RUN] Skipping post-deployment verification${NC}"
fi

echo ""
echo "========================================"
echo "Deployment Summary"
echo "========================================"

if [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test the deployed site"
    echo "2. Check Firebase Console for function logs"
    echo "3. Verify Firestore rules are active"
    echo "4. Test image generation from admin dashboard"
    echo ""
    echo "Monitoring:"
    echo "  - Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}"
    echo "  - Functions logs: firebase functions:log"
    echo "  - Hosting logs: firebase hosting:channel:list"
else
    echo -e "${YELLOW}[DRY RUN] No actual deployment performed${NC}"
    echo ""
    echo "To deploy for real, run: ./script/deploy.sh"
fi

echo ""
echo "For troubleshooting, see: docs/DEPLOYMENT_GUIDE.md"
