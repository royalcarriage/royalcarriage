#!/usr/bin/env node

/**
 * Repository Audit Script
 * Analyzes repository structure, dependencies, and configuration
 * Generates comprehensive audit report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function checkDirectory(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function getPackageInfo() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!checkFile(pkgPath)) return null;
  
  const content = fs.readFileSync(pkgPath, 'utf8');
  return JSON.parse(content);
}

function analyzeStructure() {
  const dirs = {
    client: checkDirectory(path.join(ROOT, 'client')),
    server: checkDirectory(path.join(ROOT, 'server')),
    functions: checkDirectory(path.join(ROOT, 'functions')),
    shared: checkDirectory(path.join(ROOT, 'shared')),
    docs: checkDirectory(path.join(ROOT, 'docs')),
    apps: checkDirectory(path.join(ROOT, 'apps')),
    scripts: checkDirectory(path.join(ROOT, 'scripts')),
  };
  
  return dirs;
}

function generateAuditReport() {
  const pkg = getPackageInfo();
  const structure = analyzeStructure();
  const date = new Date().toISOString().split('T')[0];
  
  let report = `# Repository Audit Report\n\n`;
  report += `**Audit Date:** ${date}\n`;
  report += `**Repository:** royalcarriage/royalcarriage\n\n`;
  
  report += `## Repository Structure\n\n`;
  report += `\`\`\`\n`;
  report += `royalcarriage/\n`;
  if (structure.client) report += `├── client/              # React frontend (Vite + TypeScript)\n`;
  if (structure.server) report += `├── server/              # Express.js backend\n`;
  if (structure.functions) report += `├── functions/           # Firebase Functions\n`;
  if (structure.shared) report += `├── shared/              # Shared types and utilities\n`;
  if (structure.apps) report += `├── apps/                # Additional applications\n`;
  if (structure.scripts) report += `├── scripts/             # Build and utility scripts\n`;
  if (structure.docs) report += `├── docs/                # Documentation\n`;
  report += `\`\`\`\n\n`;
  
  if (pkg) {
    report += `## Package Information\n\n`;
    report += `- **Name:** ${pkg.name || 'N/A'}\n`;
    report += `- **Version:** ${pkg.version || 'N/A'}\n`;
    report += `- **Node:** ${pkg.engines?.node || 'Not specified'}\n\n`;
  }
  
  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const report = generateAuditReport();
    const outputPath = path.join(ROOT, 'reports', 'repo-audit.md');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, report);
    console.log(`✓ Audit report generated: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Audit generation failed:', error.message);
    process.exit(1);
  }
}

export { generateAuditReport };
