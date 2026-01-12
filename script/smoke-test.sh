#!/bin/bash
# Smoke tests to verify build output

set -e

echo "🧪 Running smoke tests..."
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found"
  echo "   Run 'npm run build' first"
  exit 1
fi

# Check if index.html exists
if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Error: dist/public/index.html not found"
  exit 1
fi
echo "✓ index.html exists"

# Check if server bundle exists
if [ ! -f "dist/index.cjs" ]; then
  echo "❌ Error: dist/index.cjs not found"
  exit 1
fi
echo "✓ Server bundle (index.cjs) exists"

# Check if assets directory exists
if [ ! -d "dist/public/assets" ]; then
  echo "❌ Error: dist/public/assets directory not found"
  exit 1
fi
echo "✓ Assets directory exists"

# Check if favicon exists
if [ ! -f "dist/public/favicon.png" ]; then
  echo "⚠️  Warning: favicon.png not found"
else
  echo "✓ favicon.png exists"
fi

# Check for CSS files
CSS_COUNT=$(find dist/public/assets -name "*.css" | wc -l)
if [ "$CSS_COUNT" -eq 0 ]; then
  echo "❌ Error: No CSS files found in assets"
  exit 1
fi
echo "✓ CSS files found ($CSS_COUNT)"

# Check for JS files
JS_COUNT=$(find dist/public/assets -name "*.js" | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
  echo "❌ Error: No JavaScript files found in assets"
  exit 1
fi
echo "✓ JavaScript files found ($JS_COUNT)"

# Check index.html has required elements
if ! grep -q '<div id="root">' dist/public/index.html; then
  echo "❌ Error: index.html missing root div"
  exit 1
fi
echo "✓ index.html has root div"

# Check file sizes (basic sanity check)
INDEX_SIZE=$(wc -c < dist/public/index.html)
if [ "$INDEX_SIZE" -lt 1000 ]; then
  echo "❌ Error: index.html seems too small ($INDEX_SIZE bytes)"
  exit 1
fi
echo "✓ index.html is reasonable size ($INDEX_SIZE bytes)"

echo ""
echo "✅ All smoke tests passed!"
echo ""
echo "Build output summary:"
echo "  - Client: dist/public/"
echo "  - Server: dist/index.cjs"
echo "  - Ready for deployment to Firebase Hosting"
