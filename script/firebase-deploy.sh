#!/bin/bash

###############################################################################
# Firebase Deployment Script
# Project: Chicago Airport Black Car Service
# Firebase Project ID: royalcarriagelimoseo
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
FIREBASE_PROJECT_ID="royalcarriagelimoseo"
BUILD_DIR="dist/public"
REQUIRED_FILES=("$BUILD_DIR/index.html" "$BUILD_DIR/assets")
DEPLOYMENT_TIMEOUT=300  # 5 minutes

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

###############################################################################
# Pre-Deployment Checks
###############################################################################

check_prerequisites() {
    print_header "Running Pre-Deployment Checks"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js $(node --version) detected"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version) detected"
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed"
        print_info "Install with: npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI $(firebase --version) detected"
    
    # Check Firebase authentication
    if ! firebase projects:list &> /dev/null; then
        print_error "Not authenticated with Firebase"
        print_info "Run: firebase login"
        exit 1
    fi
    print_success "Firebase authentication verified"
    
    # Check Firebase project
    if ! firebase projects:list | grep -q "$FIREBASE_PROJECT_ID"; then
        print_error "Firebase project '$FIREBASE_PROJECT_ID' not found"
        print_info "Available projects:"
        firebase projects:list
        exit 1
    fi
    print_success "Firebase project '$FIREBASE_PROJECT_ID' found"
    
    echo ""
}

verify_build() {
    print_header "Verifying Build Output"
    
    # Check if build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory '$BUILD_DIR' does not exist"
        print_info "Run: npm run build"
        exit 1
    fi
    print_success "Build directory exists"
    
    # Check required files
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Required file/directory '$file' not found"
            print_info "Run: npm run build"
            exit 1
        fi
        print_success "Found: $file"
    done
    
    # Check if index.html is not empty
    if [ ! -s "$BUILD_DIR/index.html" ]; then
        print_error "index.html is empty"
        exit 1
    fi
    print_success "index.html is not empty"
    
    # Get build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    print_info "Build size: $BUILD_SIZE"
    
    echo ""
}

run_build() {
    print_header "Building Application"
    
    print_info "Running: npm run build"
    
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
    
    echo ""
}

###############################################################################
# Deployment Functions
###############################################################################

deploy_to_firebase() {
    print_header "Deploying to Firebase Hosting"
    
    print_info "Target: Production"
    print_info "Project: $FIREBASE_PROJECT_ID"
    
    # Ensure correct project is selected
    firebase use "$FIREBASE_PROJECT_ID"
    
    # Deploy with timeout
    print_info "Deploying (timeout: ${DEPLOYMENT_TIMEOUT}s)..."
    
    if timeout $DEPLOYMENT_TIMEOUT firebase deploy --only hosting; then
        print_success "Deployment completed successfully"
        return 0
    else
        print_error "Deployment failed or timed out"
        return 1
    fi
    
    echo ""
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    # Get deployment URL
    print_info "Fetching deployment URL..."
    DEPLOYMENT_URL=$(firebase hosting:sites:list 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        DEPLOYMENT_URL="https://$FIREBASE_PROJECT_ID.web.app"
    fi
    
    print_info "Site URL: $DEPLOYMENT_URL"
    
    # Check if site is reachable
    print_info "Checking site availability..."
    
    HTTP_STATUS=$(curl --max-time 30 -o /dev/null -s -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        print_success "Site is live (HTTP $HTTP_STATUS)"
    else
        print_warning "Site returned HTTP $HTTP_STATUS"
        print_info "Note: It may take a few minutes for changes to propagate"
    fi
    
    echo ""
}

###############################################################################
# Rollback Functions
###############################################################################

show_rollback_instructions() {
    print_header "Rollback Instructions"
    
    echo "If you need to rollback this deployment:"
    echo ""
    echo "1. Via Firebase Console:"
    echo "   - Go to: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID/hosting/sites"
    echo "   - Click on 'Release history'"
    echo "   - Find the previous working version"
    echo "   - Click ⋮ (three dots) → Rollback"
    echo ""
    echo "2. Via CLI:"
    echo "   - View releases: firebase hosting:releases"
    echo "   - Rollback is done via Firebase Console"
    echo ""
    echo "3. Re-deploy previous version:"
    echo "   - git checkout <previous-commit>"
    echo "   - npm run build"
    echo "   - bash script/firebase-deploy.sh"
    echo ""
}

###############################################################################
# Main Execution
###############################################################################

main() {
    # Only clear in interactive mode
    if [ -t 0 ]; then
        clear
    fi
    print_header "Firebase Deployment Script"
    print_info "Project: Chicago Airport Black Car Service"
    print_info "Firebase Project ID: $FIREBASE_PROJECT_ID"
    echo ""
    
    # Parse command line arguments
    SKIP_BUILD=false
    VERIFY_ONLY=false
    
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --skip-build) SKIP_BUILD=true ;;
            --verify-only) VERIFY_ONLY=true ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-build    Skip the build step (use existing build)"
                echo "  --verify-only   Only verify prerequisites and build, don't deploy"
                echo "  -h, --help      Show this help message"
                echo ""
                exit 0
                ;;
            *) 
                print_error "Unknown parameter: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
        shift
    done
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Build application (unless skipped)
    if [ "$SKIP_BUILD" = false ]; then
        run_build
    else
        print_warning "Skipping build step"
    fi
    
    # Step 3: Verify build output
    verify_build
    
    # If verify-only mode, stop here
    if [ "$VERIFY_ONLY" = true ]; then
        print_success "Verification complete (deployment skipped)"
        exit 0
    fi
    
    # Step 4: Deploy to Firebase
    if deploy_to_firebase; then
        DEPLOY_SUCCESS=true
    else
        DEPLOY_SUCCESS=false
    fi
    
    # Step 5: Verify deployment
    if [ "$DEPLOY_SUCCESS" = true ]; then
        verify_deployment
    fi
    
    # Step 6: Show rollback instructions
    show_rollback_instructions
    
    # Final status
    if [ "$DEPLOY_SUCCESS" = true ]; then
        print_header "Deployment Complete"
        print_success "Your site has been deployed successfully!"
        print_info "View your site: https://$FIREBASE_PROJECT_ID.web.app"
        print_info "Firebase Console: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID/hosting"
        exit 0
    else
        print_header "Deployment Failed"
        print_error "There were errors during deployment"
        print_info "Check the logs above for details"
        print_info "If you need help, see: docs/FIREBASE_SETUP.md"
        exit 1
    fi
}

# Run main function
main "$@"
