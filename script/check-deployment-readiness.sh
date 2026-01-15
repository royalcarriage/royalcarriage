#!/bin/bash

# Deployment Readiness Checker
# Verifies all prerequisites before deploying to Firebase
#
# Usage: ./script/check-deployment-readiness.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

echo "========================================"
echo "Deployment Readiness Checker"
echo "========================================"
echo ""

# Function to print status messages
print_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check 1: Node.js version
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        print_pass "Node.js version: $NODE_VERSION"
    else
        print_fail "Node.js version $NODE_VERSION is below required v20.x"
    fi
else
    print_fail "Node.js is not installed"
fi

# Check 2: npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_pass "npm version: $NPM_VERSION"
else
    print_fail "npm is not installed"
fi

# Check 3: Firebase CLI
echo "Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    print_pass "Firebase CLI version: $FIREBASE_VERSION"
else
    print_fail "Firebase CLI is not installed. Run: npm install -g firebase-tools"
fi

# Check 4: gcloud CLI (optional but recommended)
echo "Checking gcloud CLI..."
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud --version | head -1)
    print_pass "$GCLOUD_VERSION"
else
    print_warning "gcloud CLI is not installed (optional for GCP setup)"
fi

# Check 5: Project dependencies
echo "Checking project dependencies..."
if [ -d "node_modules" ] && [ -d "functions/node_modules" ]; then
    print_pass "Dependencies installed"
else
    print_fail "Dependencies not installed. Run: npm install && cd functions && npm install"
fi

# Check 6: Environment configuration
echo "Checking environment configuration..."
if [ -f ".env" ]; then
    print_pass ".env file exists"
    
    # Check for required variables
    if grep -q "GOOGLE_CLOUD_PROJECT" .env; then
        print_pass "GOOGLE_CLOUD_PROJECT is set"
    else
        print_warning "GOOGLE_CLOUD_PROJECT not found in .env"
    fi
    
    if grep -q "SESSION_SECRET" .env; then
        print_pass "SESSION_SECRET is set"
    else
        print_warning "SESSION_SECRET not found in .env"
    fi
else
    print_warning ".env file not found (will use environment variables)"
fi

# Check 7: Firebase configuration
echo "Checking Firebase configuration..."
if [ -f ".firebaserc" ]; then
    PROJECT_ID=$(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        print_pass "Firebase project: $PROJECT_ID"
    else
        print_fail "Firebase project not configured in .firebaserc"
    fi
else
    print_fail ".firebaserc not found"
fi

if [ -f "firebase.json" ]; then
    print_pass "firebase.json exists"
else
    print_fail "firebase.json not found"
fi

# Check 8: Firestore rules
echo "Checking Firestore configuration..."
if [ -f "firestore.rules" ]; then
    print_pass "firestore.rules exists"
else
    print_fail "firestore.rules not found"
fi

if [ -f "firestore.indexes.json" ]; then
    print_pass "firestore.indexes.json exists"
else
    print_warning "firestore.indexes.json not found"
fi

# Check 9: Functions build
echo "Checking Functions..."
if [ -d "functions/src" ]; then
    print_pass "Functions source exists"
else
    print_fail "functions/src directory not found"
fi

if [ -f "functions/package.json" ]; then
    print_pass "Functions package.json exists"
else
    print_fail "functions/package.json not found"
fi

# Check 10: Build directory
echo "Checking build artifacts..."
if [ -d "dist" ]; then
    print_pass "dist directory exists"
else
    print_warning "dist directory not found (will be created during build)"
fi

# Check 11: TypeScript
echo "Checking TypeScript..."
if command -v tsc &> /dev/null; then
    print_pass "TypeScript compiler available"
else
    print_warning "TypeScript compiler not found globally"
fi

# Check 12: Git status
echo "Checking Git status..."
if git diff --quiet && git diff --cached --quiet; then
    print_pass "No uncommitted changes"
else
    print_warning "There are uncommitted changes in the repository"
fi

# Check 13: Firebase authentication
echo "Checking Firebase authentication..."
if firebase login:list &> /dev/null; then
    FIREBASE_USER=$(firebase login:list 2>&1 | grep "Logged in as" | head -1)
    if [ -n "$FIREBASE_USER" ]; then
        print_pass "$FIREBASE_USER"
    else
        print_warning "Firebase authentication status unclear"
    fi
else
    print_warning "Unable to check Firebase authentication. Run: firebase login"
fi

# Summary
echo ""
echo "========================================"
echo "Summary"
echo "========================================"
echo -e "Checks passed:  ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed:  ${RED}$CHECKS_FAILED${NC}"
echo -e "Warnings:       ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ System is ready for deployment!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Run: npm run build"
        echo "2. Run: ./script/deploy.sh"
        exit 0
    else
        echo -e "${YELLOW}⚠ System is mostly ready with some warnings${NC}"
        echo ""
        echo "Review warnings above and proceed if acceptable."
        echo "Next steps:"
        echo "1. Run: npm run build"
        echo "2. Run: ./script/deploy.sh"
        exit 0
    fi
else
    echo -e "${RED}✗ System is NOT ready for deployment${NC}"
    echo ""
    echo "Please fix the failed checks above before deploying."
    exit 1
fi
