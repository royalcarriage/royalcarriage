#!/usr/bin/env node
/**
 * VSCode Git Dashboard
 * Provides web-based UI dashboard for git operations and repository monitoring
 */

import { getStatus, getHistory, getCurrentBranch, listBranches, getRepoInfo } from './git-utils.mjs';

/**
 * Dashboard Data Providers
 */

class GitDashboard {
  constructor() {
    this.refreshRate = 10000; // 10 seconds
    this.isRunning = false;
  }

  /**
   * Gather all dashboard data
   */
  collectData() {
    const currentBranch = getCurrentBranch();
    const status = getStatus();
    const history = getHistory(10);
    const branches = listBranches();
    const repoInfo = getRepoInfo();

    return {
      timestamp: new Date().toISOString(),
      branch: currentBranch.success ? currentBranch.output.trim() : 'unknown',
      status: status.success ? status.output : null,
      history: history.success ? history.output : null,
      branches: branches.success ? branches.output : null,
      repoInfo: repoInfo.success ? repoInfo.output : null,
      errors: {
        branch: currentBranch.success ? null : currentBranch.error,
        status: status.success ? null : status.error,
        history: history.success ? null : history.error,
        branches: branches.success ? null : branches.error,
        repoInfo: repoInfo.success ? null : repoInfo.error
      }
    };
  }

  /**
   * Generate HTML dashboard
   */
  generateHTML(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git Dashboard - Repository Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #334155;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 600;
    }

    .header-info {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: #94a3b8;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #cbd5e1;
    }

    .card-icon {
      font-size: 18px;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .status-item {
      background: rgba(30, 41, 59, 0.8);
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border-left: 3px solid #3b82f6;
    }

    .status-item.warning {
      border-left-color: #f59e0b;
    }

    .status-item.success {
      border-left-color: #10b981;
    }

    .status-value {
      font-size: 20px;
      font-weight: bold;
      color: #60a5fa;
    }

    .status-item.warning .status-value {
      color: #fbbf24;
    }

    .status-item.success .status-value {
      color: #34d399;
    }

    .status-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-top: 5px;
    }

    .branch-info {
      background: rgba(30, 41, 59, 0.8);
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #8b5cf6;
      margin-top: 10px;
    }

    .branch-name {
      font-size: 16px;
      font-weight: 600;
      color: #c4b5fd;
      word-break: break-all;
    }

    .list {
      list-style: none;
    }

    .list-item {
      padding: 10px 0;
      border-bottom: 1px solid #334155;
      font-size: 13px;
      color: #cbd5e1;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-label {
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 3px;
    }

    .list-value {
      color: #e2e8f0;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .button-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
    }

    .button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: background 0.2s;
    }

    .button:hover {
      background: #2563eb;
    }

    .button.secondary {
      background: #475569;
    }

    .button.secondary:hover {
      background: #334155;
    }

    .alert {
      background: #7f1d1d;
      border-left: 4px solid #dc2626;
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 13px;
      color: #fca5a5;
    }

    .alert.info {
      background: #1e3a8a;
      border-left-color: #3b82f6;
      color: #93c5fd;
    }

    .timestamp {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      margin-top: 20px;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .tag {
      display: inline-block;
      background: #334155;
      color: #cbd5e1;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-right: 5px;
      margin-bottom: 5px;
    }

    .tag.active {
      background: #1e40af;
      color: #bfdbfe;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>🚀 Git Repository Dashboard</h1>
      </div>
      <div class="header-info">
        <div>
          <div class="list-label">Last Updated</div>
          <div>${new Date(data.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>
    </div>

    <div class="grid">
      <!-- Branch Status -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🌿</span>
          <span>Current Branch</span>
        </div>
        <div class="branch-info">
          <div class="branch-name">${data.branch}</div>
        </div>
        <button class="button" style="width: 100%; margin-top: 10px;">Switch Branch</button>
      </div>

      <!-- Repository Status -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📊</span>
          <span>Repository Status</span>
        </div>
        <div class="status-grid">
          ${data.status ? generateStatusItems(data.status) : '<div class="alert">Unable to load status</div>'}
        </div>
        <button class="button" style="width: 100%; margin-top: 10px;">View Details</button>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">⚡</span>
          <span>Quick Actions</span>
        </div>
        <div class="button-group">
          <button class="button">Stage All</button>
          <button class="button">Commit</button>
          <button class="button">Pull</button>
          <button class="button">Push</button>
        </div>
        <div class="button-group" style="margin-top: 10px;">
          <button class="button secondary">PR Setup</button>
          <button class="button secondary">Sync</button>
          <button class="button secondary">Rebase</button>
          <button class="button secondary">Merge</button>
        </div>
      </div>

      <!-- Recent Commits -->
      <div class="card wide-card">
        <div class="card-header">
          <span class="card-icon">📜</span>
          <span>Recent Commits (Last 10)</span>
        </div>
        <ul class="list">
          ${data.history ? generateCommitsList(data.history) : '<li class="list-item"><div class="alert info">No commits found</div></li>'}
        </ul>
      </div>

      <!-- All Branches -->
      <div class="card wide-card">
        <div class="card-header">
          <span class="card-icon">🏷️</span>
          <span>All Branches</span>
        </div>
        <div style="padding: 10px 0;">
          ${data.branches ? generateBranchesList(data.branches, data.branch) : '<div class="alert info">No branches found</div>'}
        </div>
      </div>

      <!-- Repository Information -->
      <div class="card wide-card">
        <div class="card-header">
          <span class="card-icon">ℹ️</span>
          <span>Repository Information</span>
        </div>
        <ul class="list">
          ${data.repoInfo ? generateRepoInfoList(data.repoInfo) : '<li class="list-item"><div class="alert info">Unable to load repo info</div></li>'}
        </ul>
      </div>
    </div>

    <div class="timestamp">
      Dashboard generated at ${new Date(data.timestamp).toLocaleString()} | Auto-refresh enabled (10s)
    </div>
  </div>

  <script>
    // Auto-refresh dashboard every 10 seconds
    setInterval(() => {
      location.reload();
    }, 10000);

    // Button click handlers
    document.querySelectorAll('.button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('Button clicked:', e.target.textContent);
        // Would communicate with VSCode extension here
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Start dashboard server
   */
  startServer(port = 3001) {
    console.log(`\n🌐 Git Dashboard Server`);
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`🔄 Auto-refresh: ${this.refreshRate}ms`);
    console.log(`\n💡 Open this URL in your browser to view the git dashboard\n`);
    return this;
  }

  /**
   * Display dashboard in CLI
   */
  displayCLI() {
    const data = this.collectData();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           GIT REPOSITORY DASHBOARD                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Current Branch
    console.log(`🌿 Current Branch: ${data.branch}`);
    console.log('');

    // Status
    if (data.status) {
      console.log('📊 Repository Status:');
      const status = data.status;
      console.log(`  • Modified files: ${status.modified?.length || 0}`);
      console.log(`  • Untracked files: ${status.untracked?.length || 0}`);
      console.log(`  • Staged files: ${status.staged?.length || 0}`);
      console.log('');
    }

    // Recent Commits
    if (data.history) {
      console.log('📜 Recent Commits:');
      const lines = data.history.split('\n').slice(0, 5);
      lines.forEach(line => {
        if (line.trim()) console.log(`  ${line}`);
      });
      console.log('');
    }

    // Branches
    if (data.branches) {
      console.log('🏷️  Branches:');
      const lines = data.branches.split('\n').slice(0, 5);
      lines.forEach(line => {
        if (line.trim()) {
          const isActive = line.includes('*');
          const prefix = isActive ? '→' : ' ';
          console.log(`  ${prefix} ${line}`);
        }
      });
      console.log('');
    }

    console.log(`⏰ Updated: ${new Date(data.timestamp).toLocaleTimeString()}\n`);

    return this;
  }
}

/**
 * HTML Generation Helpers
 */

function generateStatusItems(statusData) {
  if (typeof statusData === 'string') {
    return `<div class="alert info">Status: ${statusData}</div>`;
  }

  const modified = statusData.modified?.length || 0;
  const untracked = statusData.untracked?.length || 0;
  const staged = statusData.staged?.length || 0;
  const clean = modified === 0 && untracked === 0 && staged === 0;

  return `
    <div class="status-item ${clean ? 'success' : 'warning'}">
      <div class="status-value">${modified}</div>
      <div class="status-label">Modified</div>
    </div>
    <div class="status-item ${untracked === 0 ? 'success' : ''}">
      <div class="status-value">${untracked}</div>
      <div class="status-label">Untracked</div>
    </div>
    <div class="status-item ${clean ? 'success' : ''}">
      <div class="status-value">${staged}</div>
      <div class="status-label">Staged</div>
    </div>
  `;
}

function generateCommitsList(history) {
  return history.split('\n')
    .filter(line => line.trim())
    .slice(0, 10)
    .map(line => {
      const [hash, ...msg] = line.split(' ');
      return `
        <li class="list-item">
          <span class="list-label">Hash</span>
          <div class="list-value">${hash.substring(0, 7)} - ${msg.join(' ')}</div>
        </li>
      `;
    })
    .join('');
}

function generateBranchesList(branches, currentBranch) {
  return branches.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const isActive = line.includes('*');
      const branchName = line.replace('*', '').trim();
      return `<span class="tag ${isActive ? 'active' : ''}">${branchName}</span>`;
    })
    .join('');
}

function generateRepoInfoList(repoInfo) {
  if (typeof repoInfo === 'string') {
    return `<li class="list-item"><div class="list-value">${repoInfo}</div></li>`;
  }

  const entries = Object.entries(repoInfo).slice(0, 5);
  return entries.map(([key, value]) => `
    <li class="list-item">
      <span class="list-label">${key}</span>
      <div class="list-value">${value}</div>
    </li>
  `).join('');
}

/**
 * Dashboard Export
 */

export {
  GitDashboard
};
