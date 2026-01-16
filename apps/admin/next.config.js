const { execSync } = require('child_process');

// Get build info
function getBuildSHA() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return 'unknown';
  }
}

function getBuildTimestamp() {
  return new Date().toISOString();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', 'undici', 'firebase', '@firebase/storage', '@firebase/app'],

  // Client-side app with Firebase backend
  output: 'export',
  outputFileTracing: false,

  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for Firebase Hosting
  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // Inject build info and Firebase config as environment variables
  env: {
    NEXT_PUBLIC_BUILD_SHA: getBuildSHA(),
    NEXT_PUBLIC_BUILD_TIME: getBuildTimestamp(),
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  // Security headers were removed because `output: 'export'` (static export)
  // disallows custom server headers. If you later switch to dynamic server
  // output, re-add appropriate headers here.

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@firebase/firestore', '@firebase/storage'],
  },
};

module.exports = nextConfig;
