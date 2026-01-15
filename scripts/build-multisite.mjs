#!/usr/bin/env node

/**
 * Multi-Site Build Script
 * Builds all 4 Astro marketing sites for Firebase hosting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const sites = [
  { name: 'airport', domain: 'chicagoairportblackcar.com', app: 'apps/airport' },
  { name: 'partybus', domain: 'chicago-partybus.com', app: 'apps/partybus' },
  { name: 'executive', domain: 'chicagoexecutivecarservice.com', app: 'apps/corporate' },
  { name: 'wedding', domain: 'chicagoweddingtransportation.com', app: 'apps/wedding' }
];

console.log('🚀 Multi-Site Build System Starting...\n');

// Ensure output directory exists
const distDir = path.join(ROOT, 'dist', 'sites');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

for (const site of sites) {
  console.log(`\n📦 Building ${site.name} (${site.domain})...`);
  
  const appDir = path.join(ROOT, site.app);
  const outputDir = path.join(distDir, site.name);
  
  try {
    // Check if app exists
    if (!fs.existsSync(appDir)) {
      console.log(`⚠️  Skipping ${site.name} - directory not found`);
      continue;
    }
    
    // Check if package.json exists
    if (!fs.existsSync(path.join(appDir, 'package.json'))) {
      console.log(`⚠️  Skipping ${site.name} - no package.json found`);
      continue;
    }
    
    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync(path.join(appDir, 'node_modules'))) {
      console.log(`   Installing dependencies for ${site.name}...`);
      execSync('npm install', {
        cwd: appDir,
        stdio: 'inherit'
      });
    }
    
    // Build the site
    console.log(`   Building ${site.name}...`);
    execSync('npm run build', {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        SITE_NAME: site.name,
        SITE_DOMAIN: site.domain
      }
    });
    
    // Copy build output to dist/sites
    const builtDir = path.join(appDir, 'dist');
    if (fs.existsSync(builtDir)) {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
      }
      fs.cpSync(builtDir, outputDir, { recursive: true });
      console.log(`   ✅ Built ${site.name} successfully`);
    } else {
      console.log(`   ⚠️  Build output not found for ${site.name}`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error building ${site.name}:`, error.message);
  }
}

console.log('\n✨ Multi-site build complete!\n');
console.log('Built sites:');
sites.forEach(site => {
  const outputDir = path.join(distDir, site.name);
  if (fs.existsSync(outputDir)) {
    console.log(`  ✅ ${site.name}: dist/sites/${site.name}/`);
  } else {
    console.log(`  ⏭️  ${site.name}: skipped`);
  }
});

console.log('\nNext steps:');
console.log('  1. Configure Firebase hosting targets:');
console.log('     firebase target:apply hosting airport chicagoairportblackcar');
console.log('     firebase target:apply hosting partybus chicago-partybus');
console.log('     firebase target:apply hosting executive chicagoexecutivecarservice');
console.log('     firebase target:apply hosting wedding chicagoweddingtransportation');
console.log('  2. Deploy: firebase deploy --only hosting');
