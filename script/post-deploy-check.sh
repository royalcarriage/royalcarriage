#!/bin/bash
# Post-deployment validation script
# Usage: ./script/post-deploy-check.sh [URL]

# Default to production URL if not provided
URL="${1:-https://chicagoairportblackcar.com}"

echo "🔍 Running post-deployment checks for: $URL"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Function to check URL
check_url() {
    local path=$1
    local full_url="$URL$path"
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
    
    if [ "$status" == "200" ]; then
        echo -e "${GREEN}✅ $path: OK (Status: $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ $path: Failed (Status: $status)${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check header
check_header() {
    local header=$1
    local response=$(curl -s -I "$URL")
    
    if echo "$response" | grep -qi "$header"; then
        echo -e "${GREEN}✅ $header header: Present${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $header header: Missing${NC}"
        return 1
    fi
}

# Check homepage
echo "📄 Checking main pages..."
check_url "/"
check_url "/ohare-airport-limo"
check_url "/midway-airport-limo"
check_url "/airport-limo-downtown-chicago"
check_url "/airport-limo-suburbs"
check_url "/fleet"
check_url "/pricing"
check_url "/about"
check_url "/contact"

echo ""
echo "🔒 Checking security headers..."
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "X-XSS-Protection"
check_header "Referrer-Policy"
check_header "Content-Security-Policy"

echo ""
echo "🔐 Checking HTTPS..."
if curl -s -I "$URL" | grep -q "HTTP/"; then
    # Check if HTTPS is being used
    if echo "$URL" | grep -q "https://"; then
        echo -e "${GREEN}✅ HTTPS: Enabled${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS: Not using HTTPS URL${NC}"
    fi
else
    echo -e "${RED}❌ HTTPS: Unable to verify${NC}"
    FAILED=$((FAILED + 1))
fi

# Check if HTTP redirects to HTTPS (if using https URL)
if echo "$URL" | grep -q "https://"; then
    HTTP_URL=$(echo "$URL" | sed 's/https:/http:/')
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HTTP_URL")
    if [ "$HTTP_STATUS" == "301" ] || [ "$HTTP_STATUS" == "302" ] || [ "$HTTP_STATUS" == "308" ]; then
        echo -e "${GREEN}✅ HTTP → HTTPS redirect: Working${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP → HTTPS redirect: Not detected (Status: $HTTP_STATUS)${NC}"
    fi
fi

echo ""
echo "📊 Performance checks..."

# Check page load time
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")
LOAD_TIME_INT=$(echo "$LOAD_TIME * 1000" | bc | cut -d. -f1)

if [ "$LOAD_TIME_INT" -lt 3000 ]; then
    echo -e "${GREEN}✅ Page load time: ${LOAD_TIME}s (Good)${NC}"
elif [ "$LOAD_TIME_INT" -lt 5000 ]; then
    echo -e "${YELLOW}⚠️  Page load time: ${LOAD_TIME}s (Could be better)${NC}"
else
    echo -e "${RED}❌ Page load time: ${LOAD_TIME}s (Slow)${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED critical check(s) failed${NC}"
    exit 1
fi
