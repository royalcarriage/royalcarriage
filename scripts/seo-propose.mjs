#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS_FILE = path.join(
  __dirname,
  "../packages/content/seo-bot/queue/topics.json",
);

async function loadTopics() {
  try {
    const data = await fs.readFile(TOPICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return { topics: [] };
    }
    throw error;
  }
}

async function saveTopics(data) {
  await fs.writeFile(TOPICS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateTopicId(topics) {
  const maxId = topics.reduce((max, topic) => {
    const num = parseInt(topic.id.replace("topic-", ""));
    return num > max ? num : max;
  }, 0);
  return `topic-${String(maxId + 1).padStart(3, "0")}`;
}

function validateTopic(topic, existingTopics) {
  const errors = [];

  if (!topic.keyword || topic.keyword.trim().length === 0) {
    errors.push("Keyword is required");
  }

  if (
    typeof topic.profitScore !== "number" ||
    topic.profitScore < 0 ||
    topic.profitScore > 100
  ) {
    errors.push("profitScore must be a number between 0 and 100");
  }

  if (
    typeof topic.estimatedTraffic !== "number" ||
    topic.estimatedTraffic < 0
  ) {
    errors.push("estimatedTraffic must be a non-negative number");
  }

  if (
    typeof topic.difficulty !== "number" ||
    topic.difficulty < 0 ||
    topic.difficulty > 100
  ) {
    errors.push("difficulty must be a number between 0 and 100");
  }

  // Check for duplicate keywords
  const normalizedKeyword = topic.keyword.toLowerCase().trim();
  const duplicate = existingTopics.find(
    (t) => t.keyword.toLowerCase().trim() === normalizedKeyword,
  );
  if (duplicate) {
    errors.push(
      `Duplicate keyword: "${topic.keyword}" already exists as ${duplicate.id}`,
    );
  }

  return errors;
}

async function proposeTopic(topicData) {
  console.log("📝 Loading existing topics...");
  const data = await loadTopics();

  const newTopic = {
    id: generateTopicId(data.topics),
    keyword: topicData.keyword,
    intent: topicData.intent || "informational",
    profitScore: topicData.profitScore,
    estimatedTraffic: topicData.estimatedTraffic,
    difficulty: topicData.difficulty,
    priority: topicData.priority || "medium",
    status: "queued",
    targetSite: topicData.targetSite || "main",
    createdAt: new Date().toISOString(),
  };

  console.log("✅ Validating topic...");
  const errors = validateTopic(newTopic, data.topics);

  if (errors.length > 0) {
    console.error("❌ Validation failed:");
    errors.forEach((err) => console.error(`   - ${err}`));
    process.exit(1);
  }

  data.topics.push(newTopic);

  console.log("💾 Saving topics...");
  await saveTopics(data);

  console.log("✅ Topic proposed successfully!");
  console.log(`   ID: ${newTopic.id}`);
  console.log(`   Keyword: ${newTopic.keyword}`);
  console.log(`   Profit Score: ${newTopic.profitScore}`);
  console.log(`   Estimated Traffic: ${newTopic.estimatedTraffic}`);
  console.log(`   Difficulty: ${newTopic.difficulty}`);
  console.log(`   Priority: ${newTopic.priority}`);
}

async function listTopics() {
  const data = await loadTopics();

  console.log(`\n📊 Topic Queue (${data.topics.length} topics)\n`);

  if (data.topics.length === 0) {
    console.log("   No topics in queue.");
    return;
  }

  const grouped = data.topics.reduce((acc, topic) => {
    if (!acc[topic.status]) acc[topic.status] = [];
    acc[topic.status].push(topic);
    return acc;
  }, {});

  for (const [status, topics] of Object.entries(grouped)) {
    console.log(`\n${status.toUpperCase()} (${topics.length}):`);
    topics.forEach((topic) => {
      console.log(`   ${topic.id}: "${topic.keyword}"`);
      console.log(
        `      Profit: ${topic.profitScore} | Traffic: ${topic.estimatedTraffic} | Difficulty: ${topic.difficulty}`,
      );
    });
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--list" || args[0] === "-l") {
    await listTopics();
    return;
  }

  if (args[0] === "--help" || args[0] === "-h") {
    console.log(`
Usage: node seo-propose.mjs [options]

Options:
  --list, -l              List all topics
  --add                   Add a new topic (interactive)
  --keyword <keyword>     Keyword for the topic
  --profit <score>        Profit score (0-100)
  --traffic <num>         Estimated monthly traffic
  --difficulty <num>      SEO difficulty (0-100)
  --priority <level>      Priority: low, medium, high (default: medium)
  --intent <type>         Intent: informational, commercial, navigational (default: informational)
  --site <target>         Target site: main, airport, partybus (default: main)
  --help, -h              Show this help message

Example:
  node seo-propose.mjs --keyword "luxury airport transfer" --profit 90 --traffic 500 --difficulty 40
    `);
    return;
  }

  const topicData = {};

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case "--keyword":
        topicData.keyword = value;
        break;
      case "--profit":
        topicData.profitScore = parseInt(value);
        break;
      case "--traffic":
        topicData.estimatedTraffic = parseInt(value);
        break;
      case "--difficulty":
        topicData.difficulty = parseInt(value);
        break;
      case "--priority":
        topicData.priority = value;
        break;
      case "--intent":
        topicData.intent = value;
        break;
      case "--site":
        topicData.targetSite = value;
        break;
    }
  }

  if (
    !topicData.keyword ||
    topicData.profitScore === undefined ||
    topicData.estimatedTraffic === undefined ||
    topicData.difficulty === undefined
  ) {
    console.error(
      "❌ Missing required arguments: --keyword, --profit, --traffic, --difficulty",
    );
    console.error("   Run with --help for usage information");
    process.exit(1);
  }

  await proposeTopic(topicData);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
