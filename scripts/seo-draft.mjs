#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS_FILE = path.join(__dirname, '../packages/content/seo-bot/queue/topics.json');
const DRAFTS_DIR = path.join(__dirname, '../packages/content/seo-bot/drafts');

// Helper function to count words accurately
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

async function loadTopics() {
  const data = await fs.readFile(TOPICS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveTopics(data) {
  await fs.writeFile(TOPICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function callOpenAI(prompt, systemMessage = 'You are a helpful SEO content writer.') {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateDraft(topic) {
  console.log(`📝 Generating draft for: "${topic.keyword}"`);
  
  const systemMessage = `You are an expert SEO content writer for Royal Carriage, a luxury transportation service in Chicago. 
Write engaging, informative content that ranks well while genuinely helping potential customers.
Focus on benefits, user experience, and clear calls-to-action.`;

  const prompt = `Create a comprehensive blog post outline and content for the keyword: "${topic.keyword}"

Target site: ${topic.targetSite}
Intent: ${topic.intent}
Difficulty: ${topic.difficulty}

Please provide a JSON response with the following structure:
{
  "title": "SEO-optimized title (60 chars max)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "h1": "Main heading for the page",
  "slug": "url-friendly-slug",
  "outline": [
    { "heading": "Introduction", "subheadings": [] },
    { "heading": "Main Point 1", "subheadings": ["Sub point 1.1", "Sub point 1.2"] },
    { "heading": "Main Point 2", "subheadings": [] }
  ],
  "sections": [
    {
      "heading": "Introduction",
      "content": "Full paragraph content here..."
    }
  ],
  "keywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2"],
  "internalLinks": [
    { "anchor": "link text", "url": "/suggested-page", "context": "where to place it" }
  ],
  "images": [
    { "alt": "descriptive alt text", "caption": "image caption", "placement": "after intro" }
  ],
  "schema": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article headline",
    "description": "Article description"
  }
}

Make the content at least 1500 words, informative, and naturally incorporate the keyword. Include specific Chicago-area information where relevant.`;

  const responseText = await callOpenAI(prompt, systemMessage);
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonText = responseText;
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  } else {
    // Try to find JSON object directly
    const objMatch = responseText.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonText = objMatch[0];
    }
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse OpenAI response as JSON');
    console.error('Response:', responseText);
    throw new Error('Invalid JSON response from OpenAI');
  }
}

async function saveDraft(topic, content) {
  const draft = {
    topicId: topic.id,
    keyword: topic.keyword,
    targetSite: topic.targetSite,
    status: 'draft',
    createdAt: new Date().toISOString(),
    content
  };

  const filename = `${topic.id}-${topic.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
  const filepath = path.join(DRAFTS_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(draft, null, 2), 'utf-8');
  
  console.log(`💾 Draft saved: ${filename}`);
  return filename;
}

async function updateTopicStatus(topicId, status, draftFile = null) {
  const data = await loadTopics();
  const topic = data.topics.find(t => t.id === topicId);
  
  if (!topic) {
    throw new Error(`Topic ${topicId} not found`);
  }
  
  topic.status = status;
  topic.draftFile = draftFile;
  topic.draftedAt = new Date().toISOString();
  
  await saveTopics(data);
}

async function draftTopic(topicId) {
  const data = await loadTopics();
  const topic = data.topics.find(t => t.id === topicId);
  
  if (!topic) {
    console.error(`❌ Topic ${topicId} not found`);
    process.exit(1);
  }
  
  if (topic.status !== 'queued') {
    console.error(`❌ Topic ${topicId} is not in 'queued' status (current: ${topic.status})`);
    process.exit(1);
  }
  
  console.log(`\n🚀 Starting draft generation for topic: ${topic.id}`);
  console.log(`   Keyword: "${topic.keyword}"`);
  console.log(`   Target Site: ${topic.targetSite}`);
  
  try {
    const content = await generateDraft(topic);
    const filename = await saveDraft(topic, content);
    await updateTopicStatus(topic.id, 'draft', filename);
    
    console.log('\n✅ Draft generation complete!');
    console.log(`   Title: ${content.title}`);
    console.log(`   Sections: ${content.sections.length}`);
    const wordCount = content.sections.reduce((sum, s) => sum + countWords(s.content), 0);
    console.log(`   Word count: ~${wordCount}`);
  } catch (error) {
    console.error('\n❌ Draft generation failed:', error.message);
    process.exit(1);
  }
}

async function draftAll() {
  const data = await loadTopics();
  const queuedTopics = data.topics.filter(t => t.status === 'queued');
  
  if (queuedTopics.length === 0) {
    console.log('📭 No queued topics to draft');
    return;
  }
  
  console.log(`\n📝 Found ${queuedTopics.length} queued topic(s)\n`);
  
  for (const topic of queuedTopics) {
    try {
      await draftTopic(topic.id);
      console.log('');
    } catch (error) {
      console.error(`Failed to draft ${topic.id}:`, error.message);
      console.log('Continuing with next topic...\n');
    }
  }
  
  console.log('✅ Batch drafting complete!');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node seo-draft.mjs [options]

Options:
  --topic <id>     Generate draft for specific topic ID
  --all            Generate drafts for all queued topics
  --help, -h       Show this help message

Examples:
  node seo-draft.mjs --topic topic-001
  node seo-draft.mjs --all
    `);
    return;
  }
  
  if (args[0] === '--all') {
    await draftAll();
  } else if (args[0] === '--topic' && args[1]) {
    await draftTopic(args[1]);
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
