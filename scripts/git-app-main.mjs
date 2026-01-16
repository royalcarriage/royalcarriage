#!/usr/bin/env node
/**
 * Git App - Main Entry Point
 * Complete git workflow automation system for VSCode
 */

import { runCLI as runExtensionCLI } from './vscode-git-extension.mjs';
import { formatForCLI as formatStatusBar } from './vscode-status-bar.mjs';
import { GitDashboard } from './vscode-git-dashboard.mjs';

/**
 * Git App Main Interface
 */

const APP_VERSION = '1.0.0';
const APP_NAME = 'Git App';

function showHeader() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              🚀 Git App - Workflow Automation                  ║
║                                                                ║
║  Complete git workflow automation for VSCode and CLI          ║
║  Version: ${APP_VERSION.padEnd(45, ' ')}║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

function showMenu() {
  console.log(`\nAvailable Commands:\n`);
  console.log(`  1. vscode-extension    - Show VSCode commands and features`);
  console.log(`  2. status-bar          - Display status bar items and quick actions`);
  console.log(`  3. dashboard           - Start web dashboard server`);
  console.log(`  4. dashboard-cli       - Show dashboard in CLI`);
  console.log(`  5. help                - Show this help message`);
  console.log(`  6. version             - Show version information`);
  console.log(`\nUsage: node git-app-main.mjs <command>\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  showHeader();

  switch (command) {
    case 'vscode-extension':
      console.log('\n📋 VSCode Extension Commands\n');
      await runExtensionCLI();
      break;

    case 'status-bar':
      console.log('\n📊 Status Bar Integration\n');
      const statusBar = formatStatusBar();
      break;

    case 'dashboard':
      console.log('\n🌐 Git Dashboard Server\n');
      const dashboard = new GitDashboard();
      dashboard.startServer(3001);
      // In real implementation, would start actual HTTP server
      console.log('💡 Dashboard is running on http://localhost:3001');
      console.log('   Displaying CLI version:\n');
      dashboard.displayCLI();
      break;

    case 'dashboard-cli':
      console.log('\n📊 Git Dashboard (CLI Mode)\n');
      const dashboardCLI = new GitDashboard();
      dashboardCLI.displayCLI();
      break;

    case 'version':
      console.log(`\n${APP_NAME} v${APP_VERSION}`);
      console.log('Complete git workflow automation system');
      console.log('Built for VSCode and CLI environments\n');
      break;

    case 'help':
    default:
      showMenu();
      break;
  }
}

// Run main
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

export { APP_NAME, APP_VERSION };
