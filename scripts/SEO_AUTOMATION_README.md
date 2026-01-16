# SEO Content Automation Scripts

This directory contains automation scripts for the Royal Carriage SEO content pipeline.

## Overview

The SEO automation system consists of 5 main scripts that work together to create, validate, and publish SEO-optimized content:

1. **seo-propose.mjs** - Topic proposal and queue management
2. **seo-draft.mjs** - AI-powered content generation
3. **seo-gate.mjs** - Quality validation and gating
4. **seo-publish.mjs** - Git-based publication workflow
5. **seo-run.mjs** - Full pipeline orchestration

## Prerequisites

```bash
# Required
export OPENAI_API_KEY="your-openai-api-key"

# Optional (for automatic PR creation)
gh auth login
```

## Quick Start

### 1. Propose a New Topic

```bash
node scripts/seo-propose.mjs \
  --keyword "luxury airport shuttle Chicago" \
  --profit 88 \
  --traffic 600 \
  --difficulty 40 \
  --priority high \
  --intent commercial \
  --site airport
```

### 2. List Current Topics

```bash
node scripts/seo-propose.mjs --list
```

### 3. Generate Content Drafts

```bash
# Draft a specific topic
node scripts/seo-draft.mjs --topic topic-001

# Draft all queued topics
node scripts/seo-draft.mjs --all
```

### 4. Run Quality Gates

```bash
# Check a specific draft
node scripts/seo-gate.mjs --draft topic-001-chicago-airport-limo.json

# Check all drafts
node scripts/seo-gate.mjs --all
```

### 5. Publish Content

```bash
# Publish a draft (creates PR)
node scripts/seo-publish.mjs --draft topic-001-chicago-airport-limo.json
```

### 6. Run Full Pipeline

```bash
# Generate drafts and run quality gates
node scripts/seo-run.mjs --run

# Full pipeline with auto-publish
node scripts/seo-run.mjs --run --auto-publish

# List recent runs
node scripts/seo-run.mjs --list
```

## Script Details

### seo-propose.mjs

Manages the topic queue. Add new topics with SEO metadata.

**Features:**
- Keyword validation
- Duplicate detection
- Priority and difficulty scoring
- Target site assignment (main, airport, partybus)

**Usage:**
```bash
# Add a topic
node seo-propose.mjs --keyword "topic" --profit 90 --traffic 500 --difficulty 45

# List all topics
node seo-propose.mjs --list
```

### seo-draft.mjs

Generates AI-powered content drafts using OpenAI.

**Features:**
- SEO-optimized titles and meta descriptions
- Comprehensive content outlines
- Section-based content generation
- Automatic internal linking suggestions
- Schema markup generation
- Image placement recommendations

**Usage:**
```bash
# Draft one topic
node seo-draft.mjs --topic topic-001

# Draft all queued topics
node seo-draft.mjs --all
```

**Output:** JSON files in `packages/content/seo-bot/drafts/`

### seo-gate.mjs

Quality validation with hard gates for critical issues.

**Quality Checks:**
- ✓ Duplicate content detection (70%+ similarity = FAIL)
- ✓ Thin content (< 1000 words = FAIL)
- ✓ Schema markup validation
- ✓ Link validation (internal/external)
- ✓ Image requirements (alt text, placement)
- ✓ Metadata validation (title, description, slug)

**Usage:**
```bash
# Check one draft
node seo-gate.mjs --draft topic-001-chicago-airport-limo.json

# Check all drafts
node seo-gate.mjs --all
```

**Exit Codes:**
- 0 = PASS
- 1 = FAIL (critical issues found)

### seo-publish.mjs

PR-based publishing workflow using Git.

**Workflow:**
1. Creates feature branch: `seo/<topic-id>-<slug>`
2. Moves draft to published/ directory
3. Creates manifest entry
4. Updates topic status
5. Commits changes
6. Pushes to remote
7. Creates Pull Request (if GitHub CLI available)

**Usage:**
```bash
# Publish with PR creation
node seo-publish.mjs --draft topic-001-chicago-airport-limo.json

# Publish without PR
node seo-publish.mjs --draft topic-001-chicago-airport-limo.json --no-pr
```

**Requirements:**
- Clean working directory
- Git credentials configured
- GitHub CLI (optional, for auto PR creation)

### seo-run.mjs

Orchestrates the full pipeline with logging.

**Pipeline Steps:**
1. Propose Topics (optional)
2. Generate Drafts (all queued)
3. Quality Gate (all drafts)
4. Publish (optional, requires flag)

**Usage:**
```bash
# Basic run (draft + gate)
node seo-run.mjs --run

# Full pipeline with publishing
node seo-run.mjs --run --auto-publish

# Continue on errors
node seo-run.mjs --run --continue-on-error

# List previous runs
node seo-run.mjs --list
```

**Logging:**
All runs create two files:
- `run-<timestamp>.log` - Detailed execution log
- `run-<timestamp>-results.json` - Structured results

## Directory Structure

```
packages/content/seo-bot/
├── queue/
│   └── topics.json              # Topic queue with metadata
├── drafts/                      # Generated content drafts
├── published/                   # Published content
├── manifests/                   # Publication manifests
└── runs/                        # Pipeline execution logs
```

## Topic Schema

```json
{
  "id": "topic-001",
  "keyword": "Chicago airport limo service",
  "intent": "commercial",           // informational, commercial, navigational
  "profitScore": 95,                // 0-100
  "estimatedTraffic": 1200,         // monthly visits
  "difficulty": 45,                 // 0-100 SEO difficulty
  "priority": "high",               // low, medium, high
  "status": "queued",               // queued, draft, published
  "targetSite": "airport",          // main, airport, partybus
  "createdAt": "2026-01-16T00:00:00Z"
}
```

## Draft Content Schema

```json
{
  "topicId": "topic-001",
  "keyword": "Chicago airport limo service",
  "targetSite": "airport",
  "status": "draft",
  "createdAt": "2026-01-16T00:00:00Z",
  "content": {
    "title": "SEO-optimized title (60 chars max)",
    "metaDescription": "Meta description (150-160 chars)",
    "h1": "Main heading",
    "slug": "url-friendly-slug",
    "outline": [...],
    "sections": [...],
    "keywords": [...],
    "internalLinks": [...],
    "images": [...],
    "schema": {...}
  }
}
```

## Best Practices

1. **Always validate topics** - Run `--list` before proposing to avoid duplicates
2. **Review gates carefully** - Don't ignore warnings, they indicate quality issues
3. **Never bypass gates** - Critical issues must be fixed before publishing
4. **Review PRs manually** - Auto-publish creates PRs, but human review is required
5. **Monitor OpenAI costs** - Each draft costs ~$0.01-0.05 depending on model
6. **Keep logs** - Pipeline logs are essential for debugging

## Error Handling

All scripts have proper error handling and will:
- Exit with code 1 on failure
- Print clear error messages
- Log errors to run logs (for seo-run.mjs)
- Rollback changes on publish failures

## Environment Variables

```bash
# Required for content generation
export OPENAI_API_KEY="sk-..."

# Optional: Override default model
export OPENAI_MODEL="gpt-4o-mini"  # default

# Optional: Git configuration
export GIT_AUTHOR_NAME="SEO Bot"
export GIT_AUTHOR_EMAIL="seo-bot@royalcarriage.com"
```

## Troubleshooting

### "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY="your-key"
```

### "Topic already exists"
Check with `--list` and use a different keyword or update the existing topic.

### "Quality gate failed"
Review the specific issues and fix them in the draft JSON file manually, or regenerate.

### "Failed to push branch"
Ensure git credentials are configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### "GitHub CLI not available"
Install gh CLI or use `--no-pr` flag and create PR manually.

## Development

### Testing

```bash
# Test individual scripts
node scripts/seo-propose.mjs --help
node scripts/seo-draft.mjs --help
node scripts/seo-gate.mjs --help
node scripts/seo-publish.mjs --help
node scripts/seo-run.mjs --help
```

### Adding New Quality Checks

Edit `seo-gate.mjs` and add new check functions following this pattern:

```javascript
function checkNewThing(draft) {
  const issues = [];
  const warnings = [];
  
  // Your validation logic
  if (problem) {
    issues.push('Description of issue');
  }
  
  return { issues, warnings };
}
```

## License

MIT - Royal Carriage Project
