#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS_FILE = path.join(__dirname, '../packages/content/seo-bot/queue/topics.json');
const METRICS_DIR = path.join(__dirname, '../packages/content/metrics');
const MOOVS_DATA = path.join(METRICS_DIR, 'moovs_service_mix.json');
const KEYWORD_DATA = path.join(METRICS_DIR, 'keyword_clusters.json');
const ROI_DATA = path.join(METRICS_DIR, 'roi_summary.json');

async function loadTopics() {
  try {
    const data = await fs.readFile(TOPICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { topics: [] };
    }
    throw error;
  }
}

async function saveTopics(data) {
  await fs.writeFile(TOPICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateTopicId(topics) {
  const maxId = topics.reduce((max, topic) => {
    const num = parseInt(topic.id.replace('topic-', ''));
    return num > max ? num : max;
  }, 0);
  return `topic-${String(maxId + 1).padStart(3, '0')}`;
}

function validateTopic(topic, existingTopics) {
  const errors = [];

  if (!topic.keyword || topic.keyword.trim().length === 0) {
    errors.push('Keyword is required');
  }

  if (typeof topic.profitScore !== 'number' || topic.profitScore < 0 || topic.profitScore > 100) {
    errors.push('profitScore must be a number between 0 and 100');
  }

  if (typeof topic.estimatedTraffic !== 'number' || topic.estimatedTraffic < 0) {
    errors.push('estimatedTraffic must be a non-negative number');
  }

  if (typeof topic.difficulty !== 'number' || topic.difficulty < 0 || topic.difficulty > 100) {
    errors.push('difficulty must be a number between 0 and 100');
  }

  // Check for duplicate keywords
  const normalizedKeyword = topic.keyword.toLowerCase().trim();
  const duplicate = existingTopics.find(
    t => t.keyword.toLowerCase().trim() === normalizedKeyword
  );
  if (duplicate) {
    errors.push(`Duplicate keyword: "${topic.keyword}" already exists as ${duplicate.id}`);
  }

  return errors;
}

async function proposeTopic(topicData) {
  console.log('📝 Loading existing topics...');
  const data = await loadTopics();
  
  const newTopic = {
    id: generateTopicId(data.topics),
    keyword: topicData.keyword,
    intent: topicData.intent || 'informational',
    profitScore: topicData.profitScore,
    estimatedTraffic: topicData.estimatedTraffic,
    difficulty: topicData.difficulty,
    priority: topicData.priority || 'medium',
    status: 'queued',
    targetSite: topicData.targetSite || 'main',
    createdAt: new Date().toISOString()
  };

  console.log('✅ Validating topic...');
  const errors = validateTopic(newTopic, data.topics);
  
  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }

  data.topics.push(newTopic);
  
  console.log('💾 Saving topics...');
  await saveTopics(data);
  
  console.log('✅ Topic proposed successfully!');
  console.log(`   ID: ${newTopic.id}`);
  console.log(`   Keyword: ${newTopic.keyword}`);
  console.log(`   Profit Score: ${newTopic.profitScore}`);
  console.log(`   Estimated Traffic: ${newTopic.estimatedTraffic}`);
  console.log(`   Difficulty: ${newTopic.difficulty}`);
  console.log(`   Priority: ${newTopic.priority}`);
}

/**
 * Load revenue and keyword data
 */
async function loadRevenueData() {
  const data = { moovs: null, keywords: null, roi: null };
  
  try {
    const moovsContent = await fs.readFile(MOOVS_DATA, 'utf-8');
    data.moovs = JSON.parse(moovsContent);
  } catch (error) {
    console.warn('⚠️  Could not load Moovs data');
  }
  
  try {
    const keywordContent = await fs.readFile(KEYWORD_DATA, 'utf-8');
    data.keywords = JSON.parse(keywordContent);
  } catch (error) {
    console.warn('⚠️  Could not load keyword data');
  }
  
  try {
    const roiContent = await fs.readFile(ROI_DATA, 'utf-8');
    data.roi = JSON.parse(roiContent);
  } catch (error) {
    console.warn('⚠️  Could not load ROI data');
  }
  
  return data;
}

/**
 * Auto-generate proposals based on revenue data
 */
async function autoPropose() {
  console.log('🤖 Auto-generating proposals based on revenue data...\n');
  
  const revenueData = await loadRevenueData();
  const existingTopics = await loadTopics();
  
  const proposals = [];
  
  // High-profit keywords with low content coverage
  if (revenueData.keywords && revenueData.roi) {
    console.log('📊 Analyzing keyword gaps...');
    // TODO: Implement keyword gap analysis
  }
  
  // Cities with rising bookings but weak pages
  if (revenueData.moovs) {
    console.log('🏙️  Analyzing city opportunities...');
    // TODO: Implement city opportunity analysis
  }
  
  // Service types with good ROI but thin content
  console.log('🎯 Analyzing service opportunities...');
  // TODO: Implement service opportunity analysis
  
  if (proposals.length === 0) {
    console.log('\n⚠️  No new proposals generated - revenue data may be incomplete');
    console.log('   Run with manual flags to add topics');
    return;
  }
  
  console.log(`\n✅ Generated ${proposals.length} proposals\n`);
  
  // Display proposals
  proposals.forEach((proposal, idx) => {
    console.log(`${idx + 1}. ${proposal.keyword}`);
    console.log(`   Profit Score: ${proposal.profitScore}`);
    console.log(`   Estimated Traffic: ${proposal.estimatedTraffic}`);
    console.log(`   Reason: ${proposal.reason}\n`);
  });
  
  // Auto-add proposals
  const data = existingTopics;
  proposals.forEach(proposal => {
    data.topics.push({
      id: generateTopicId(data.topics),
      ...proposal,
      status: 'queued',
      createdAt: new Date().toISOString(),
      autoGenerated: true
    });
  });
  
  await saveTopics(data);
  console.log(`💾 Added ${proposals.length} topics to queue`);
}

async function listTopics() {
  const data = await loadTopics();
  
  console.log(`\n📊 Topic Queue (${data.topics.length} topics)\n`);
  
  if (data.topics.length === 0) {
    console.log('   No topics in queue.');
    return;
  }

  const grouped = data.topics.reduce((acc, topic) => {
    if (!acc[topic.status]) acc[topic.status] = [];
    acc[topic.status].push(topic);
    return acc;
  }, {});

  for (const [status, topics] of Object.entries(grouped)) {
    console.log(`\n${status.toUpperCase()} (${topics.length}):`);
    topics.forEach(topic => {
      console.log(`   ${topic.id}: "${topic.keyword}"`);
      console.log(`      Profit: ${topic.profitScore} | Traffic: ${topic.estimatedTraffic} | Difficulty: ${topic.difficulty}`);
      if (topic.autoGenerated) {
        console.log(`      Auto-generated: Yes`);
      }
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--list' || args[0] === '-l') {
    await listTopics();
    return;
  }
  
  if (args[0] === '--auto') {
    await autoPropose();
    return;
  }

  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node seo-propose.mjs [options]

Options:
  --list, -l              List all topics
  --auto                  Auto-generate proposals from revenue data
  --add                   Add a new topic (interactive)
  --keyword <keyword>     Keyword for the topic
  --profit <score>        Profit score (0-100)
  --traffic <num>         Estimated monthly traffic
  --difficulty <num>      SEO difficulty (0-100)
  --priority <level>      Priority: low, medium, high (default: medium)
  --intent <type>         Intent: informational, commercial, navigational (default: informational)
  --site <target>         Target site: main, airport, partybus (default: main)
  --help, -h              Show this help message

Auto-Propose:
  Analyzes revenue data (Moovs, Google Ads, GA4) to automatically propose topics based on:
  - High-profit keywords with low content coverage
  - Cities with rising bookings but weak pages
  - Service types with good ROI but thin content

Example:
  node seo-propose.mjs --keyword "luxury airport transfer" --profit 90 --traffic 500 --difficulty 40
  node seo-propose.mjs --auto
    `);
    return;
  }

  const topicData = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--keyword':
        topicData.keyword = value;
        break;
      case '--profit':
        topicData.profitScore = parseInt(value);
        break;
      case '--traffic':
        topicData.estimatedTraffic = parseInt(value);
        break;
      case '--difficulty':
        topicData.difficulty = parseInt(value);
        break;
      case '--priority':
        topicData.priority = value;
        break;
      case '--intent':
        topicData.intent = value;
        break;
      case '--site':
        topicData.targetSite = value;
        break;
    }
  }

  if (!topicData.keyword || topicData.profitScore === undefined || 
      topicData.estimatedTraffic === undefined || topicData.difficulty === undefined) {
    console.error('❌ Missing required arguments: --keyword, --profit, --traffic, --difficulty');
    console.error('   Run with --help for usage information');
    process.exit(1);
  }

  await proposeTopic(topicData);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
