#!/usr/bin/env node
/**
 * VSCode Status Bar Integration
 * Displays git status, current branch, and quick actions in VSCode status bar
 */

import { getCurrentBranch, getStatus, getRepoInfo } from './git-utils.mjs';

/**
 * Status Bar Item Configuration
 */
const STATUS_BAR_ITEMS = {
  branch: {
    id: 'git.statusBar.branch',
    alignment: 'left',
    priority: 100,
    command: 'git.switchBranch',
    tooltip: 'Click to switch branch',
    getValue: getBranchStatus
  },
  status: {
    id: 'git.statusBar.status',
    alignment: 'left',
    priority: 99,
    command: 'git.showStatus',
    tooltip: 'Click to view repository status',
    getValue: getRepositoryStatus
  },
  sync: {
    id: 'git.statusBar.sync',
    alignment: 'right',
    priority: 50,
    command: 'git.pull',
    tooltip: 'Click to sync with remote',
    getValue: getSyncStatus
  },
  commit: {
    id: 'git.statusBar.commit',
    alignment: 'right',
    priority: 51,
    command: 'git.commit',
    tooltip: 'Click to create a commit',
    getValue: getCommitStatus
  },
  push: {
    id: 'git.statusBar.push',
    alignment: 'right',
    priority: 52,
    command: 'git.push',
    tooltip: 'Click to push changes',
    getValue: getPushStatus
  }
};

/**
 * Status Bar Value Generators
 */

function getBranchStatus() {
  const result = getCurrentBranch();
  if (!result.success) {
    return '$(git-branch) —';
  }

  const branch = result.output.trim();
  const icon = branch === 'main' ? '$(git-branch)' : '$(git-branch)';
  return `${icon} ${branch}`;
}

function getRepositoryStatus() {
  const result = getStatus();
  if (!result.success) {
    return '$(files) —';
  }

  const status = result.output;
  const modified = status.modified?.length || 0;
  const untracked = status.untracked?.length || 0;
  const staged = status.staged?.length || 0;

  if (modified === 0 && untracked === 0 && staged === 0) {
    return '$(pass-filled) Clean';
  }

  const parts = [];
  if (staged > 0) parts.push(`+${staged}`);
  if (modified > 0) parts.push(`~${modified}`);
  if (untracked > 0) parts.push(`?${untracked}`);

  return `$(files) ${parts.join(' ')}`;
}

function getSyncStatus() {
  // This would check if branch is ahead/behind remote
  // For now, returns static indicator
  return '$(cloud-download) Sync';
}

function getCommitStatus() {
  const status = getStatus();
  if (!status.success) {
    return '$(git-commit)';
  }

  const hasChanges = (status.output?.modified?.length || 0) > 0 ||
                     (status.output?.untracked?.length || 0) > 0;

  if (hasChanges) {
    return '$(git-commit) Commit...';
  }
  return '$(git-commit)';
}

function getPushStatus() {
  // Would check if commits are ahead of remote
  return '$(cloud-upload) Push';
}

/**
 * Status Bar Manager Class
 */

class GitStatusBar {
  constructor() {
    this.items = new Map();
    this.updateInterval = 5000; // Update every 5 seconds
    this.isRunning = false;
  }

  /**
   * Create a status bar item
   */
  createItem(config) {
    return {
      id: config.id,
      alignment: config.alignment,
      priority: config.priority,
      command: config.command,
      tooltip: config.tooltip,
      text: config.getValue?.() || '—',
      show: true
    };
  }

  /**
   * Initialize all status bar items
   */
  initialize() {
    console.log('🔧 Initializing status bar items...\n');

    Object.entries(STATUS_BAR_ITEMS).forEach(([key, config]) => {
      const item = this.createItem(config);
      this.items.set(config.id, item);
      console.log(`  ✅ Created: ${config.id}`);
      console.log(`     Text: ${item.text}`);
      console.log(`     Command: ${config.command}`);
      console.log(`     Tooltip: ${config.tooltip}\n`);
    });

    return this;
  }

  /**
   * Update all status bar items
   */
  update() {
    let updated = 0;

    Object.entries(STATUS_BAR_ITEMS).forEach(([key, config]) => {
      const item = this.items.get(config.id);
      if (!item) return;

      const newText = config.getValue();
      if (item.text !== newText) {
        item.text = newText;
        updated++;
      }
    });

    if (updated > 0) {
      console.log(`📊 Status bar updated (${updated} items changed)`);
    }

    return this;
  }

  /**
   * Start auto-update loop
   */
  startAutoUpdate() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('▶️  Starting status bar auto-update...');

    this.updateInterval = setInterval(() => {
      this.update();
    }, this.updateInterval);

    return this;
  }

  /**
   * Stop auto-update loop
   */
  stopAutoUpdate() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    console.log('⏹️  Status bar auto-update stopped');

    return this;
  }

  /**
   * Get all items as array
   */
  getItems() {
    return Array.from(this.items.values());
  }

  /**
   * Get item by ID
   */
  getItem(id) {
    return this.items.get(id);
  }

  /**
   * Display all items
   */
  display() {
    console.log('\n📍 Git Status Bar Items:\n');

    // Left aligned items
    const leftItems = this.getItems()
      .filter(item => item.alignment === 'left')
      .sort((a, b) => b.priority - a.priority);

    console.log('  LEFT:');
    leftItems.forEach(item => {
      console.log(`    ${item.text.padEnd(20)} [${item.command}]`);
    });

    // Right aligned items
    const rightItems = this.getItems()
      .filter(item => item.alignment === 'right')
      .sort((a, b) => b.priority - a.priority);

    console.log('\n  RIGHT:');
    rightItems.forEach(item => {
      console.log(`    ${item.text.padEnd(20)} [${item.command}]`);
    });

    console.log();
  }

  /**
   * Get configuration for VSCode extension manifest
   */
  getExtensionConfig() {
    return {
      statusBarItems: Object.values(STATUS_BAR_ITEMS).map(config => ({
        id: config.id,
        alignment: config.alignment,
        priority: config.priority,
        command: config.command,
        tooltip: config.tooltip,
        autoUpdate: true,
        updateInterval: this.updateInterval
      }))
    };
  }
}

/**
 * Quick Actions Available from Status Bar
 */

const QUICK_ACTIONS = {
  'Branch Operations': [
    { label: 'Switch Branch', command: 'git.switchBranch', icon: '$(git-branch)' },
    { label: 'Create Feature', command: 'git.newFeatureBranch', icon: '$(add)' },
    { label: 'Create Hotfix', command: 'git.newHotfixBranch', icon: '$(flame)' },
    { label: 'List Branches', command: 'git.listBranches', icon: '$(list-unordered)' }
  ],
  'Commit & Push': [
    { label: 'Stage All', command: 'git.stageAll', icon: '$(pass)' },
    { label: 'Commit', command: 'git.commit', icon: '$(git-commit)' },
    { label: 'Pull', command: 'git.pull', icon: '$(cloud-download)' },
    { label: 'Push', command: 'git.push', icon: '$(cloud-upload)' }
  ],
  'Workflows': [
    { label: 'Pull Request', command: 'git.pullRequest', icon: '$(git-pull-request)' },
    { label: 'Sync Branches', command: 'git.syncBranches', icon: '$(sync)' },
    { label: 'Rebase on Main', command: 'git.rebaseOnMain', icon: '$(move)' },
    { label: 'Merge to Main', command: 'git.mergeToMain', icon: '$(combine)' }
  ],
  'Release': [
    { label: 'Create Release', command: 'git.createRelease', icon: '$(rocket)' },
    { label: 'Create Tag', command: 'git.createTag', icon: '$(tag)' },
    { label: 'Show History', command: 'git.showHistory', icon: '$(history)' }
  ]
};

/**
 * Get quick actions for display
 */
function getQuickActions() {
  return QUICK_ACTIONS;
}

/**
 * Format status bar for display in different contexts
 */

function formatForVSCode() {
  return {
    items: Object.values(STATUS_BAR_ITEMS).map(config => ({
      id: config.id,
      alignment: config.alignment,
      priority: config.priority,
      command: config.command,
      tooltip: config.tooltip
    })),
    actions: QUICK_ACTIONS
  };
}

function formatForCLI() {
  const statusBar = new GitStatusBar();
  statusBar.initialize();
  statusBar.update();
  statusBar.display();
  return statusBar;
}

export {
  GitStatusBar,
  STATUS_BAR_ITEMS,
  QUICK_ACTIONS,
  getQuickActions,
  formatForVSCode,
  formatForCLI,
  getBranchStatus,
  getRepositoryStatus,
  getSyncStatus,
  getCommitStatus,
  getPushStatus
};
