#!/usr/bin/env node
/**
 * Git Utilities - Core Git Operations
 * Provides unified git command interface for all workflows
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Execute git command safely
 */
function execGit(command, options = {}) {
  try {
    const {
      cwd = REPO_ROOT,
      encoding = 'utf8',
      stdio = 'pipe',
      throwOnError = true
    } = options;

    const result = execSync(`git ${command}`, {
      cwd,
      encoding,
      stdio,
      ...options
    });

    return {
      success: true,
      output: result.trim(),
      error: null
    };
  } catch (error) {
    if (options.throwOnError) {
      throw error;
    }
    return {
      success: false,
      output: null,
      error: error.message
    };
  }
}

/**
 * Get current branch name
 */
function getCurrentBranch() {
  const result = execGit('rev-parse --abbrev-ref HEAD', { throwOnError: false });
  return result.success ? result.output : 'unknown';
}

/**
 * Get repository status
 */
function getStatus() {
  const statusOutput = execGit('status --porcelain', { throwOnError: false });
  if (!statusOutput.success) {
    return { modified: [], untracked: [], staged: [] };
  }

  const lines = statusOutput.output.split('\n').filter(l => l.trim());
  const modified = lines.filter(l => l.startsWith(' M')).map(l => l.substring(3));
  const untracked = lines.filter(l => l.startsWith('??')).map(l => l.substring(3));
  const staged = lines.filter(l => l.startsWith('M ')).map(l => l.substring(3));

  return { modified, untracked, staged };
}

/**
 * Get commit history
 */
function getHistory(count = 10) {
  const result = execGit(`log --oneline -${count}`, { throwOnError: false });
  if (!result.success) return [];

  return result.output.split('\n').filter(l => l.trim()).map(line => {
    const [hash, ...message] = line.split(' ');
    return { hash, message: message.join(' ') };
  });
}

/**
 * Get repository info
 */
function getRepoInfo() {
  const remoteUrl = execGit('config --get remote.origin.url', { throwOnError: false });
  const branch = getCurrentBranch();
  const status = getStatus();
  const history = getHistory(5);

  return {
    branch,
    remote: remoteUrl.success ? remoteUrl.output : null,
    status,
    recentCommits: history,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Stage files
 */
function stageFiles(files = []) {
  if (files.length === 0) {
    execGit('add .');
    return { staged: 'all files' };
  }

  files.forEach(file => {
    execGit(`add "${file}"`);
  });

  return { staged: files };
}

/**
 * Create commit
 */
function commit(message, options = {}) {
  const { author = null, amend = false } = options;

  let cmd = 'commit -m';
  if (amend) cmd += ' --amend';
  if (author) cmd += ` --author="${author}"`;
  cmd += ` "${message}"`;

  const result = execGit(cmd, { throwOnError: false });

  if (result.success) {
    return {
      success: true,
      message: 'Commit created successfully',
      hash: execGit('rev-parse --short HEAD', { throwOnError: false }).output
    };
  }

  return {
    success: false,
    message: 'Commit failed',
    error: result.error
  };
}

/**
 * Push to remote
 */
function push(options = {}) {
  const {
    force = false,
    upstream = null,
    tags = false
  } = options;

  let cmd = 'push';
  if (force) cmd += ' --force';
  if (tags) cmd += ' --tags';
  if (upstream) cmd += ` ${upstream}`;

  const result = execGit(cmd, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Pull from remote
 */
function pull(options = {}) {
  const { rebase = false } = options;
  let cmd = 'pull';
  if (rebase) cmd += ' --rebase';

  const result = execGit(cmd, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Create branch
 */
function createBranch(name) {
  const result = execGit(`checkout -b ${name}`, { throwOnError: false });

  return {
    success: result.success,
    branch: name,
    message: result.output,
    error: result.error
  };
}

/**
 * Switch branch
 */
function switchBranch(name) {
  const result = execGit(`checkout ${name}`, { throwOnError: false });

  return {
    success: result.success,
    branch: name,
    message: result.output,
    error: result.error
  };
}

/**
 * Get diff statistics
 */
function getDiffStats() {
  const result = execGit('diff --stat', { throwOnError: false });
  if (!result.success) return null;

  return result.output;
}

/**
 * Create tag
 */
function createTag(name, message = null) {
  let cmd = `tag ${name}`;
  if (message) cmd += ` -m "${message}"`;

  const result = execGit(cmd, { throwOnError: false });

  return {
    success: result.success,
    tag: name,
    message: result.output,
    error: result.error
  };
}

/**
 * Get all branches
 */
function listBranches() {
  const result = execGit('branch -a', { throwOnError: false });
  if (!result.success) return [];

  return result.output.split('\n').map(b => b.trim()).filter(b => b);
}

/**
 * Get remote branches
 */
function listRemoteBranches() {
  const result = execGit('branch -r', { throwOnError: false });
  if (!result.success) return [];

  return result.output.split('\n').map(b => b.trim()).filter(b => b);
}

/**
 * Merge branches
 */
function mergeBranch(sourceBranch, options = {}) {
  const { noFastForward = false, squash = false } = options;

  let cmd = 'merge';
  if (noFastForward) cmd += ' --no-ff';
  if (squash) cmd += ' --squash';
  cmd += ` ${sourceBranch}`;

  const result = execGit(cmd, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Rebase branch
 */
function rebaseBranch(target) {
  const result = execGit(`rebase ${target}`, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Stash changes
 */
function stash(message = null) {
  let cmd = 'stash push';
  if (message) cmd += ` -m "${message}"`;

  const result = execGit(cmd, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Apply stash
 */
function applyStash(index = 0) {
  const result = execGit(`stash apply stash@{${index}}`, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * List stashes
 */
function listStashes() {
  const result = execGit('stash list', { throwOnError: false });
  if (!result.success) return [];

  return result.output.split('\n').filter(s => s.trim());
}

/**
 * Revert commit
 */
function revertCommit(hash) {
  const result = execGit(`revert ${hash} --no-edit`, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Reset to commit
 */
function resetTo(hash, mode = 'mixed') {
  const result = execGit(`reset --${mode} ${hash}`, { throwOnError: false });

  return {
    success: result.success,
    message: result.output,
    error: result.error
  };
}

/**
 * Get commit details
 */
function getCommitDetails(hash) {
  const result = execGit(`show ${hash}`, { throwOnError: false });

  if (!result.success) return null;

  return result.output;
}

/**
 * Search commits by message
 */
function searchCommits(pattern) {
  const result = execGit(`log --grep="${pattern}" --oneline`, { throwOnError: false });

  if (!result.success) return [];

  return result.output.split('\n').filter(l => l.trim());
}

export {
  execGit,
  getCurrentBranch,
  getStatus,
  getHistory,
  getRepoInfo,
  stageFiles,
  commit,
  push,
  pull,
  createBranch,
  switchBranch,
  getDiffStats,
  createTag,
  listBranches,
  listRemoteBranches,
  mergeBranch,
  rebaseBranch,
  stash,
  applyStash,
  listStashes,
  revertCommit,
  resetTo,
  getCommitDetails,
  searchCommits
};
