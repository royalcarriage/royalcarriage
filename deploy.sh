#!/bin/bash
# Deployment Automation Script for AI System
# This script helps deploy the AI-powered website management system

set -e  # Exit on error

echo "🚀 Royal Carriage AI System Deployment"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Firebase CLI $(firebase --version)${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Running type check..."
npm run check

echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env with your configuration${NC}"
fi

# Check Firebase configuration
echo ""
echo "🔥 Checking Firebase configuration..."

if ! grep -q "YOUR_FIREBASE_PROJECT_ID" .firebaserc; then
    echo -e "${YELLOW}⚠️  Firebase project ID not configured in .firebaserc${NC}"
    echo "Current .firebaserc:"
    cat .firebaserc
    echo ""
    read -p "Enter your Firebase project ID: " firebase_project_id
    if [ ! -z "$firebase_project_id" ]; then
        sed -i "s/YOUR_FIREBASE_PROJECT_ID/$firebase_project_id/g" .firebaserc
        echo -e "${GREEN}✓ Updated .firebaserc${NC}"
    fi
fi

echo ""
echo "📊 Deployment Readiness Summary"
echo "================================"
echo ""

# Check all critical items
READY=true

echo "Critical Items:"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${RED}✗ .env file missing${NC}"
    READY=false
fi

if [ -f dist/public/index.html ]; then
    echo -e "${GREEN}✓ Build artifacts present${NC}"
else
    echo -e "${RED}✗ Build artifacts missing${NC}"
    READY=false
fi

if ! grep -q "YOUR_FIREBASE_PROJECT_ID" .firebaserc; then
    echo -e "${GREEN}✓ Firebase project configured${NC}"
else
    echo -e "${RED}✗ Firebase project not configured${NC}"
    READY=false
fi

echo ""
echo "Optional Items:"
if [ -d functions/node_modules ]; then
    echo -e "${GREEN}✓ Firebase Functions dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Firebase Functions dependencies not installed${NC}"
    echo "   Run: cd functions && npm install"
fi

if [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo -e "${GREEN}✓ Google Cloud project configured${NC}"
else
    echo -e "${YELLOW}⚠️  Google Cloud project not configured (optional for AI features)${NC}"
fi

echo ""
echo "📚 Next Steps:"
echo ""

if [ "$READY" = true ]; then
    echo -e "${GREEN}System is ready for deployment!${NC}"
    echo ""
    echo "To deploy:"
    echo "1. Login to Firebase:    firebase login"
    echo "2. Deploy Firestore:     firebase deploy --only firestore"
    echo "3. Deploy Functions:     firebase deploy --only functions"
    echo "4. Deploy Hosting:       firebase deploy --only hosting"
    echo "5. Or deploy all:        firebase deploy"
    echo ""
    echo "Admin Dashboard: https://your-domain.com/admin"
else
    echo -e "${RED}System needs configuration before deployment${NC}"
    echo ""
    echo "1. Configure Firebase project in .firebaserc"
    echo "2. Set up environment variables in .env"
    echo "3. Run this script again"
fi

echo ""
echo "📖 Documentation:"
echo "   - Deployment Guide: docs/DEPLOYMENT_GUIDE.md"
echo "   - AI System Guide: docs/AI_SYSTEM_GUIDE.md"
echo "   - Implementation Summary: docs/IMPLEMENTATION_SUMMARY.md"
echo ""

if [ "$READY" = true ]; then
    read -p "Deploy now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v firebase &> /dev/null; then
            echo ""
            echo "🚀 Starting deployment..."
            firebase deploy
        else
            echo -e "${RED}Firebase CLI not available. Install it first.${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo "✨ Done!"
