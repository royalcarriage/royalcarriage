#!/usr/bin/env node
/**
 * Git Workflows - Automated Git Operations
 * Provides high-level workflow automation for common git tasks
 */

import {
  getCurrentBranch,
  getStatus,
  stageFiles,
  commit,
  push,
  pull,
  createBranch,
  switchBranch,
  listBranches,
  mergeBranch,
  rebaseBranch
} from './git-utils.mjs';

/**
 * Feature branch workflow
 */
async function featureBranchWorkflow(featureName, message) {
  console.log(`🌿 Starting feature branch workflow for: ${featureName}`);

  try {
    // Create feature branch
    console.log('  → Creating feature branch...');
    const branchResult = createBranch(`feature/${featureName}`);
    if (!branchResult.success) throw new Error(branchResult.error);

    // Stage changes
    console.log('  → Staging all changes...');
    stageFiles();

    // Create commit
    console.log('  → Creating commit...');
    const commitResult = commit(message);
    if (!commitResult.success) throw new Error(commitResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: `origin feature/${featureName}` });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log(`✅ Feature branch workflow completed: ${commitResult.hash}`);
    return { success: true, branch: `feature/${featureName}`, hash: commitResult.hash };
  } catch (error) {
    console.error(`❌ Feature branch workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Bug fix workflow
 */
async function bugFixWorkflow(bugName, message) {
  console.log(`🐛 Starting bug fix workflow for: ${bugName}`);

  try {
    // Create bug branch
    console.log('  → Creating bug fix branch...');
    const branchResult = createBranch(`bugfix/${bugName}`);
    if (!branchResult.success) throw new Error(branchResult.error);

    // Stage changes
    console.log('  → Staging all changes...');
    stageFiles();

    // Create commit
    console.log('  → Creating commit...');
    const commitResult = commit(`fix: ${message}`);
    if (!commitResult.success) throw new Error(commitResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: `origin bugfix/${bugName}` });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log(`✅ Bug fix workflow completed: ${commitResult.hash}`);
    return { success: true, branch: `bugfix/${bugName}`, hash: commitResult.hash };
  } catch (error) {
    console.error(`❌ Bug fix workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Hotfix workflow
 */
async function hotfixWorkflow(version, message) {
  console.log(`🔥 Starting hotfix workflow for version: ${version}`);

  try {
    // Switch to main
    console.log('  → Switching to main branch...');
    let switchResult = switchBranch('main');
    if (!switchResult.success) throw new Error(switchResult.error);

    // Create hotfix branch
    console.log('  → Creating hotfix branch...');
    const branchResult = createBranch(`hotfix/${version}`);
    if (!branchResult.success) throw new Error(branchResult.error);

    // Stage changes
    console.log('  → Staging all changes...');
    stageFiles();

    // Create commit
    console.log('  → Creating commit...');
    const commitResult = commit(`hotfix: ${message}`);
    if (!commitResult.success) throw new Error(commitResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: `origin hotfix/${version}` });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log(`✅ Hotfix workflow completed: ${commitResult.hash}`);
    return { success: true, branch: `hotfix/${version}`, hash: commitResult.hash };
  } catch (error) {
    console.error(`❌ Hotfix workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Pull request workflow
 */
async function pullRequestWorkflow(targetBranch = 'main') {
  console.log(`📝 Starting pull request workflow to: ${targetBranch}`);

  try {
    const currentBranch = getCurrentBranch();
    const status = getStatus();

    console.log(`  → Current branch: ${currentBranch}`);
    console.log(`  → Modified files: ${status.modified.length}`);
    console.log(`  → Untracked files: ${status.untracked.length}`);

    if (currentBranch === targetBranch) {
      throw new Error(`Cannot create PR from ${targetBranch} to itself`);
    }

    // Stage all changes
    console.log('  → Staging all changes...');
    stageFiles();

    // Get status
    const finalStatus = getStatus();
    if (finalStatus.staged.length === 0) {
      console.warn('⚠️  No staged changes found');
      return { success: true, message: 'No changes to commit' };
    }

    // Create commit
    console.log('  → Creating commit...');
    const commitResult = commit('chore: prepare for pull request');
    if (!commitResult.success) throw new Error(commitResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: `origin ${currentBranch}` });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log(`✅ Pull request workflow completed`);
    console.log(`   Branch: ${currentBranch} → ${targetBranch}`);
    console.log(`   Commit: ${commitResult.hash}`);

    return {
      success: true,
      sourceBranch: currentBranch,
      targetBranch,
      hash: commitResult.hash
    };
  } catch (error) {
    console.error(`❌ Pull request workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Release workflow
 */
async function releaseWorkflow(version, releaseNotes) {
  console.log(`🚀 Starting release workflow for v${version}`);

  try {
    // Switch to main
    console.log('  → Switching to main branch...');
    let switchResult = switchBranch('main');
    if (!switchResult.success) throw new Error(switchResult.error);

    // Pull latest
    console.log('  → Pulling latest changes...');
    const pullResult = pull();
    if (!pullResult.success) throw new Error(pullResult.error);

    // Stage changes
    console.log('  → Staging all changes...');
    stageFiles();

    // Create release commit
    console.log('  → Creating release commit...');
    const commitResult = commit(`release: v${version}\n\n${releaseNotes}`);
    if (!commitResult.success) throw new Error(commitResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: 'origin main' });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log(`✅ Release workflow completed: v${version}`);
    return { success: true, version, hash: commitResult.hash };
  } catch (error) {
    console.error(`❌ Release workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Sync branches workflow
 */
async function syncBranchesWorkflow() {
  console.log('🔄 Starting branch sync workflow');

  try {
    const currentBranch = getCurrentBranch();

    // Pull latest from current branch
    console.log(`  → Pulling latest from ${currentBranch}...`);
    const pullResult = pull();
    if (!pullResult.success) throw new Error(pullResult.error);

    // Switch to main and pull
    console.log('  → Syncing main branch...');
    let switchResult = switchBranch('main');
    if (!switchResult.success) throw new Error(switchResult.error);

    const mainPullResult = pull();
    if (!mainPullResult.success) throw new Error(mainPullResult.error);

    // Switch back to original branch
    console.log(`  → Switching back to ${currentBranch}...`);
    switchResult = switchBranch(currentBranch);
    if (!switchResult.success) throw new Error(switchResult.error);

    console.log('✅ Branch sync workflow completed');
    return { success: true };
  } catch (error) {
    console.error(`❌ Branch sync workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Rebase workflow
 */
async function rebaseWorkflow(baseBranch) {
  console.log(`📊 Starting rebase workflow onto: ${baseBranch}`);

  try {
    const currentBranch = getCurrentBranch();

    if (currentBranch === baseBranch) {
      throw new Error(`Cannot rebase ${baseBranch} onto itself`);
    }

    // Pull latest from base branch
    console.log(`  → Fetching latest ${baseBranch}...`);
    const pullResult = pull();
    if (!pullResult.success) throw new Error(pullResult.error);

    // Rebase current branch onto base branch
    console.log(`  → Rebasing ${currentBranch} onto ${baseBranch}...`);
    const rebaseResult = rebaseBranch(baseBranch);
    if (!rebaseResult.success) throw new Error(rebaseResult.error);

    console.log('✅ Rebase workflow completed');
    return { success: true, currentBranch, baseBranch };
  } catch (error) {
    console.error(`❌ Rebase workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Merge workflow
 */
async function mergeWorkflow(sourceBranch, targetBranch = 'main') {
  console.log(`🔀 Starting merge workflow: ${sourceBranch} → ${targetBranch}`);

  try {
    // Switch to target branch
    console.log(`  → Switching to ${targetBranch}...`);
    let switchResult = switchBranch(targetBranch);
    if (!switchResult.success) throw new Error(switchResult.error);

    // Pull latest
    console.log(`  → Pulling latest from ${targetBranch}...`);
    const pullResult = pull();
    if (!pullResult.success) throw new Error(pullResult.error);

    // Merge source branch
    console.log(`  → Merging ${sourceBranch} into ${targetBranch}...`);
    const mergeResult = mergeBranch(sourceBranch, { noFastForward: true });
    if (!mergeResult.success) throw new Error(mergeResult.error);

    // Push to remote
    console.log('  → Pushing to remote...');
    const pushResult = push({ upstream: `origin ${targetBranch}` });
    if (!pushResult.success) throw new Error(pushResult.error);

    console.log('✅ Merge workflow completed');
    return { success: true, sourceBranch, targetBranch };
  } catch (error) {
    console.error(`❌ Merge workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export {
  featureBranchWorkflow,
  bugFixWorkflow,
  hotfixWorkflow,
  pullRequestWorkflow,
  releaseWorkflow,
  syncBranchesWorkflow,
  rebaseWorkflow,
  mergeWorkflow
};
