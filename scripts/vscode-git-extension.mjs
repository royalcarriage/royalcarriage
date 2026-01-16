#!/usr/bin/env node
/**
 * VSCode Git Extension - Git App Integration for VSCode
 * Provides command palette, source control integration, and UI components
 */

import {
  getCurrentBranch,
  getStatus,
  listBranches,
  getHistory,
  getRepoInfo,
  stageFiles,
  commit,
  push,
  pull,
  createBranch,
  switchBranch,
  mergeBranch,
  rebaseBranch,
  tagCommit,
  listTags
} from './git-utils.mjs';

import {
  featureBranchWorkflow,
  bugFixWorkflow,
  hotfixWorkflow,
  pullRequestWorkflow,
  releaseWorkflow,
  syncBranchesWorkflow,
  rebaseWorkflow,
  mergeWorkflow
} from './git-workflows.mjs';

/**
 * Git Extension Commands - Commands exposed to VSCode command palette
 */
const GIT_COMMANDS = {
  // Branch Commands
  'git.newFeatureBranch': {
    title: 'Git: Create Feature Branch',
    description: 'Create a new feature branch (feature/*)',
    handler: commandNewFeatureBranch
  },
  'git.newBugFixBranch': {
    title: 'Git: Create Bug Fix Branch',
    description: 'Create a new bug fix branch (bugfix/*)',
    handler: commandNewBugFixBranch
  },
  'git.newHotfixBranch': {
    title: 'Git: Create Hotfix Branch',
    description: 'Create a new hotfix branch (hotfix/*)',
    handler: commandNewHotfixBranch
  },
  'git.switchBranch': {
    title: 'Git: Switch Branch',
    description: 'Switch to a different branch',
    handler: commandSwitchBranch
  },
  'git.listBranches': {
    title: 'Git: List All Branches',
    description: 'Show all local and remote branches',
    handler: commandListBranches
  },

  // Workflow Commands
  'git.pullRequest': {
    title: 'Git: Prepare Pull Request',
    description: 'Stage, commit, and push for pull request',
    handler: commandPullRequest
  },
  'git.syncBranches': {
    title: 'Git: Sync Branches',
    description: 'Sync main and current branch with remote',
    handler: commandSyncBranches
  },
  'git.rebaseOnMain': {
    title: 'Git: Rebase on Main',
    description: 'Rebase current branch onto main',
    handler: commandRebaseOnMain
  },
  'git.mergeToMain': {
    title: 'Git: Merge to Main',
    description: 'Merge current branch to main',
    handler: commandMergeToMain
  },

  // Staging & Commit Commands
  'git.stageAll': {
    title: 'Git: Stage All Changes',
    description: 'Stage all modified and new files',
    handler: commandStageAll
  },
  'git.commit': {
    title: 'Git: Commit with Message',
    description: 'Create a commit with custom message',
    handler: commandCommit
  },
  'git.push': {
    title: 'Git: Push to Remote',
    description: 'Push current branch to remote',
    handler: commandPush
  },
  'git.pull': {
    title: 'Git: Pull from Remote',
    description: 'Pull latest changes from remote',
    handler: commandPull
  },

  // History & Info Commands
  'git.showHistory': {
    title: 'Git: Show Commit History',
    description: 'Display recent commit history',
    handler: commandShowHistory
  },
  'git.showStatus': {
    title: 'Git: Show Repository Status',
    description: 'Display current repository status',
    handler: commandShowStatus
  },
  'git.showRepoInfo': {
    title: 'Git: Show Repository Info',
    description: 'Display repository information',
    handler: commandShowRepoInfo
  },

  // Release Commands
  'git.createRelease': {
    title: 'Git: Create Release',
    description: 'Create a release with version tag',
    handler: commandCreateRelease
  },
  'git.createTag': {
    title: 'Git: Create Tag',
    description: 'Create a git tag for current commit',
    handler: commandCreateTag
  }
};

/**
 * Command Implementations
 */

async function commandNewFeatureBranch() {
  const featureName = await promptUser('Enter feature name:', '');
  if (!featureName) return;

  const message = await promptUser('Enter commit message:', `feat: ${featureName}`);
  if (!message) return;

  const result = await featureBranchWorkflow(featureName, message);
  showNotification(result.success, result);
}

async function commandNewBugFixBranch() {
  const bugName = await promptUser('Enter bug name:', '');
  if (!bugName) return;

  const message = await promptUser('Enter fix description:', '');
  if (!message) return;

  const result = await bugFixWorkflow(bugName, message);
  showNotification(result.success, result);
}

async function commandNewHotfixBranch() {
  const version = await promptUser('Enter version (e.g., 1.2.3):', '');
  if (!version) return;

  const message = await promptUser('Enter hotfix description:', '');
  if (!message) return;

  const result = await hotfixWorkflow(version, message);
  showNotification(result.success, result);
}

async function commandSwitchBranch() {
  const branchesResult = listBranches();
  if (!branchesResult.success) {
    showNotification(false, { error: 'Failed to list branches' });
    return;
  }

  const branches = branchesResult.output.split('\n').filter(b => b.trim());
  const selected = await promptUser(
    'Select branch to switch to:',
    branches[0],
    branches
  );
  if (!selected) return;

  const result = switchBranch(selected.trim().replace('* ', ''));
  showNotification(result.success, result);
}

async function commandListBranches() {
  const result = listBranches();
  if (result.success) {
    console.log('📋 Local Branches:\n' + result.output);
  } else {
    showNotification(false, result);
  }
}

async function commandPullRequest() {
  const targetBranch = await promptUser('Target branch for PR:', 'main');
  if (!targetBranch) return;

  const result = await pullRequestWorkflow(targetBranch);
  showNotification(result.success, result);
}

async function commandSyncBranches() {
  const result = await syncBranchesWorkflow();
  showNotification(result.success, result);
}

async function commandRebaseOnMain() {
  const result = await rebaseWorkflow('main');
  showNotification(result.success, result);
}

async function commandMergeToMain() {
  const currentBranch = getCurrentBranch();
  const result = await mergeWorkflow(currentBranch.output, 'main');
  showNotification(result.success, result);
}

async function commandStageAll() {
  const result = stageFiles();
  if (result.success) {
    showNotification(true, { message: 'All changes staged ✅' });
  } else {
    showNotification(false, result);
  }
}

async function commandCommit() {
  const message = await promptUser('Enter commit message:', '');
  if (!message) return;

  const result = commit(message);
  showNotification(result.success, result);
}

async function commandPush() {
  const result = push();
  showNotification(result.success, result);
}

async function commandPull() {
  const result = pull();
  showNotification(result.success, result);
}

async function commandShowHistory() {
  const count = await promptUser('Number of commits to show:', '10');
  const result = getHistory(parseInt(count) || 10);
  if (result.success) {
    console.log('📜 Commit History:\n' + result.output);
  } else {
    showNotification(false, result);
  }
}

async function commandShowStatus() {
  const result = getStatus();
  if (result.success) {
    const status = result.output;
    console.log('📊 Repository Status:');
    console.log('  Modified files:', status.modified.length);
    console.log('  Untracked files:', status.untracked.length);
    console.log('  Staged files:', status.staged.length);
  } else {
    showNotification(false, result);
  }
}

async function commandShowRepoInfo() {
  const result = getRepoInfo();
  if (result.success) {
    console.log('ℹ️  Repository Info:\n', result.output);
  } else {
    showNotification(false, result);
  }
}

async function commandCreateRelease() {
  const version = await promptUser('Enter version (e.g., 1.0.0):', '');
  if (!version) return;

  const notes = await promptUser('Enter release notes:', '');
  if (!notes) return;

  const result = await releaseWorkflow(version, notes);
  showNotification(result.success, result);
}

async function commandCreateTag() {
  const tagName = await promptUser('Enter tag name:', '');
  if (!tagName) return;

  const message = await promptUser('Enter tag message (optional):', '');
  const result = tagCommit(tagName, message);
  showNotification(result.success, result);
}

/**
 * UI Helper Functions
 */

async function promptUser(question, defaultValue = '', options = []) {
  // In real VSCode extension, this would use vscode.window.showInputBox or showQuickPick
  console.log(`\n❓ ${question}`);
  if (defaultValue) console.log(`   (default: ${defaultValue})`);
  if (options.length > 0) {
    console.log('   Options:');
    options.forEach((opt, i) => console.log(`     ${i + 1}. ${opt}`));
  }

  // For CLI mode, return default or first option
  if (options.length > 0) return options[0];
  return defaultValue;
}

function showNotification(success, data = {}) {
  if (success) {
    const message = data.message || `✅ ${data.branch || 'Operation completed successfully'}`;
    console.log(`\n✅ SUCCESS: ${message}`);
    if (data.hash) console.log(`   Commit: ${data.hash.substring(0, 7)}`);
  } else {
    const error = data.error || 'Unknown error occurred';
    console.error(`\n❌ ERROR: ${error}`);
  }
}

/**
 * Extension Registration & Status
 */

function getCommandRegistry() {
  const registry = {};
  Object.entries(GIT_COMMANDS).forEach(([id, cmd]) => {
    registry[id] = {
      title: cmd.title,
      description: cmd.description,
      callable: cmd.handler
    };
  });
  return registry;
}

function getExtensionInfo() {
  return {
    name: 'git-app',
    version: '1.0.0',
    description: 'Git workflow automation for VSCode',
    commands: Object.keys(GIT_COMMANDS).length,
    features: [
      'Feature branch workflow',
      'Bug fix workflow',
      'Hotfix workflow',
      'Pull request preparation',
      'Release management',
      'Branch synchronization',
      'Rebase automation',
      'Merge automation',
      'Repository status',
      'Commit history'
    ]
  };
}

/**
 * Command Execution
 */

async function executeCommand(commandId, args = {}) {
  const command = GIT_COMMANDS[commandId];
  if (!command) {
    console.error(`❌ Command not found: ${commandId}`);
    return { success: false, error: `Unknown command: ${commandId}` };
  }

  try {
    console.log(`\n▶️  Executing: ${command.title}`);
    const result = await command.handler(args);
    return result;
  } catch (error) {
    console.error(`❌ Command execution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * CLI Interface for Testing
 */

async function runCLI() {
  const info = getExtensionInfo();
  console.log(`\n🚀 ${info.name} v${info.version}`);
  console.log(`   ${info.description}\n`);
  console.log('Available commands:');

  Object.entries(GIT_COMMANDS).forEach(([id, cmd], index) => {
    console.log(`  ${String(index + 1).padStart(2, ' ')}. [${id}] ${cmd.title}`);
  });

  console.log('\n📊 Features:');
  info.features.forEach(feature => {
    console.log(`  • ${feature}`);
  });

  console.log('\nTo use this extension in VSCode:');
  console.log('  1. Install as extension in VSCode');
  console.log('  2. Use Ctrl+Shift+P to open command palette');
  console.log('  3. Search for "Git:" to find available commands');
}

export {
  GIT_COMMANDS,
  executeCommand,
  getCommandRegistry,
  getExtensionInfo,
  runCLI
};
