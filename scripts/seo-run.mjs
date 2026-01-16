#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUNS_DIR = path.join(__dirname, '../packages/content/seo-bot/runs');

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: __dirname
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function logToFile(logPath, message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  await fs.appendFile(logPath, logLine, 'utf-8');
}

class PipelineLogger {
  constructor(logPath) {
    this.logPath = logPath;
  }

  async log(message, toConsole = true) {
    if (toConsole) {
      console.log(message);
    }
    await logToFile(this.logPath, message);
  }

  async error(message, toConsole = true) {
    if (toConsole) {
      console.error(message);
    }
    await logToFile(this.logPath, `ERROR: ${message}`);
  }

  async section(title) {
    const line = '═'.repeat(60);
    await this.log(`\n${line}`);
    await this.log(title);
    await this.log(line);
  }
}

async function runPipeline(options = {}) {
  const timestamp = getTimestamp();
  const runId = `run-${timestamp}`;
  const logPath = path.join(RUNS_DIR, `${runId}.log`);
  
  const logger = new PipelineLogger(logPath);
  
  await logger.section('🚀 SEO Content Pipeline Started');
  await logger.log(`Run ID: ${runId}`);
  await logger.log(`Started at: ${new Date().toISOString()}`);
  await logger.log(`Options: ${JSON.stringify(options, null, 2)}`);
  
  const results = {
    runId,
    startTime: new Date().toISOString(),
    steps: [],
    status: 'running'
  };
  
  try {
    // Step 1: Propose (optional - only if topics provided)
    if (options.proposeTopics && options.proposeTopics.length > 0) {
      await logger.section('📝 Step 1: Propose Topics');
      
      for (const topic of options.proposeTopics) {
        try {
          await logger.log(`Proposing: ${topic.keyword}`);
          await runScript(
            path.join(__dirname, 'seo-propose.mjs'),
            [
              '--keyword', topic.keyword,
              '--profit', String(topic.profitScore),
              '--traffic', String(topic.estimatedTraffic),
              '--difficulty', String(topic.difficulty),
              ...(topic.priority ? ['--priority', topic.priority] : []),
              ...(topic.intent ? ['--intent', topic.intent] : []),
              ...(topic.targetSite ? ['--site', topic.targetSite] : [])
            ]
          );
          results.steps.push({ step: 'propose', topic: topic.keyword, status: 'success' });
        } catch (error) {
          await logger.error(`Failed to propose topic: ${error.message}`);
          results.steps.push({ step: 'propose', topic: topic.keyword, status: 'failed', error: error.message });
          if (!options.continueOnError) throw error;
        }
      }
    } else {
      await logger.log('📝 Step 1: Propose Topics - SKIPPED (no topics to propose)');
    }
    
    // Step 2: Draft
    await logger.section('✍️  Step 2: Generate Drafts');
    try {
      await runScript(path.join(__dirname, 'seo-draft.mjs'), ['--all']);
      results.steps.push({ step: 'draft', status: 'success' });
    } catch (error) {
      await logger.error(`Draft generation failed: ${error.message}`);
      results.steps.push({ step: 'draft', status: 'failed', error: error.message });
      if (!options.continueOnError) throw error;
    }
    
    // Step 3: Quality Gate
    await logger.section('🚪 Step 3: Quality Gate');
    try {
      await runScript(path.join(__dirname, 'seo-gate.mjs'), ['--all']);
      results.steps.push({ step: 'gate', status: 'success' });
    } catch (error) {
      await logger.error(`Quality gate failed: ${error.message}`);
      results.steps.push({ step: 'gate', status: 'failed', error: error.message });
      if (!options.continueOnError) throw error;
    }
    
    // Step 4: Publish (optional - requires manual approval by default)
    if (options.autoPublish) {
      await logger.section('📦 Step 4: Publish');
      await logger.log('⚠️  Auto-publish is enabled - this will create PRs for all passing drafts');
      
      // Read drafts directory to find what to publish
      const draftsDir = path.join(__dirname, '../packages/content/seo-bot/drafts');
      const draftFiles = await fs.readdir(draftsDir);
      const jsonFiles = draftFiles.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        await logger.log('No drafts available to publish');
      } else {
        for (const draftFile of jsonFiles) {
          try {
            await logger.log(`Publishing: ${draftFile}`);
            await runScript(
              path.join(__dirname, 'seo-publish.mjs'),
              ['--draft', draftFile, ...(options.noPr ? ['--no-pr'] : [])]
            );
            results.steps.push({ step: 'publish', draft: draftFile, status: 'success' });
          } catch (error) {
            await logger.error(`Failed to publish ${draftFile}: ${error.message}`);
            results.steps.push({ step: 'publish', draft: draftFile, status: 'failed', error: error.message });
            if (!options.continueOnError) throw error;
          }
        }
      }
    } else {
      await logger.section('📦 Step 4: Publish - SKIPPED');
      await logger.log('Use --auto-publish flag to enable automatic publishing');
      await logger.log('Or run: node seo-publish.mjs --draft <filename>');
    }
    
    results.status = 'completed';
    results.endTime = new Date().toISOString();
    
    await logger.section('✅ Pipeline Completed Successfully');
    await logger.log(`Completed at: ${results.endTime}`);
    await logger.log(`Log file: ${logPath}`);
    
  } catch (error) {
    results.status = 'failed';
    results.endTime = new Date().toISOString();
    results.error = error.message;
    
    await logger.section('❌ Pipeline Failed');
    await logger.error(`Error: ${error.message}`);
    await logger.log(`Log file: ${logPath}`);
    
    // Save results
    const resultsPath = path.join(RUNS_DIR, `${runId}-results.json`);
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
    
    process.exit(1);
  }
  
  // Save results
  const resultsPath = path.join(RUNS_DIR, `${runId}-results.json`);
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
  
  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PIPELINE SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Run ID: ${results.runId}`);
  console.log(`Status: ${results.status}`);
  const durationMs = new Date(results.endTime) - new Date(results.startTime);
  console.log(`Duration: ${Math.round(durationMs / 1000)}s (${durationMs}ms)`);
  console.log(`\nSteps completed:`);
  results.steps.forEach(step => {
    const icon = step.status === 'success' ? '✅' : '❌';
    const detail = step.topic || step.draft || '';
    console.log(`  ${icon} ${step.step}${detail ? ` - ${detail}` : ''}`);
  });
  console.log(`\nLog: ${logPath}`);
  console.log(`Results: ${resultsPath}`);
  console.log('═'.repeat(60) + '\n');
}

async function listRuns() {
  const files = await fs.readdir(RUNS_DIR);
  const logFiles = files.filter(f => f.endsWith('.log'));
  const resultFiles = files.filter(f => f.endsWith('-results.json'));
  
  console.log(`\n📊 Pipeline Runs (${resultFiles.length})\n`);
  
  if (resultFiles.length === 0) {
    console.log('   No runs found');
    return;
  }
  
  // Sort by timestamp (newest first)
  const sortedFiles = resultFiles.sort().reverse();
  
  for (const file of sortedFiles.slice(0, 10)) {
    const filepath = path.join(RUNS_DIR, file);
    const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
    
    const durationMs = data.endTime 
      ? new Date(data.endTime) - new Date(data.startTime)
      : null;
    const duration = durationMs ? Math.round(durationMs / 1000) + 's' : 'N/A';
    
    const statusIcon = data.status === 'completed' ? '✅' : 
                      data.status === 'failed' ? '❌' : '⏳';
    
    console.log(`${statusIcon} ${data.runId}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Started: ${new Date(data.startTime).toLocaleString()}`);
    console.log(`   Duration: ${duration}`);
    console.log(`   Steps: ${data.steps.length}`);
    console.log('');
  }
  
  if (sortedFiles.length > 10) {
    console.log(`   ... and ${sortedFiles.length - 10} more`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node seo-run.mjs [options]

Options:
  --run                   Run the full pipeline
  --auto-publish          Automatically publish passing drafts (creates PRs)
  --no-pr                 Skip PR creation when auto-publishing
  --continue-on-error     Continue pipeline even if a step fails
  --list                  List recent pipeline runs
  --help, -h              Show this help message

Pipeline Steps:
  1. Propose Topics (optional - only if topics provided via config)
  2. Generate Drafts (all queued topics)
  3. Quality Gate (check all drafts)
  4. Publish (optional - requires --auto-publish flag)

Examples:
  # Run pipeline (draft + gate only)
  node seo-run.mjs --run

  # Run full pipeline with auto-publish
  node seo-run.mjs --run --auto-publish

  # List recent runs
  node seo-run.mjs --list

Logs:
  All runs are logged to packages/content/seo-bot/runs/
  Each run creates:
    - run-<timestamp>.log (detailed log)
    - run-<timestamp>-results.json (structured results)
    `);
    return;
  }
  
  if (args.includes('--list')) {
    await listRuns();
    return;
  }
  
  if (args.includes('--run')) {
    const options = {
      autoPublish: args.includes('--auto-publish'),
      noPr: args.includes('--no-pr'),
      continueOnError: args.includes('--continue-on-error'),
      proposeTopics: [] // Could be extended to accept topics from config file
    };
    
    await runPipeline(options);
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
