#!/usr/bin/env node

/**
 * Example workflow for testing the SEO automation scripts
 * This demonstrates the full pipeline in action
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║      SEO Automation Pipeline - Example Workflow           ║
╚════════════════════════════════════════════════════════════╝

This example demonstrates how to use the SEO automation scripts.

STEP 1: VIEW EXISTING TOPICS
─────────────────────────────────────────────────────────────
$ node scripts/seo-propose.mjs --list


STEP 2: PROPOSE A NEW TOPIC
─────────────────────────────────────────────────────────────
$ node scripts/seo-propose.mjs \\
    --keyword "Midway airport limo service" \\
    --profit 90 \\
    --traffic 800 \\
    --difficulty 42 \\
    --priority high \\
    --intent commercial \\
    --site airport


STEP 3: GENERATE DRAFT (requires OPENAI_API_KEY)
─────────────────────────────────────────────────────────────
$ export OPENAI_API_KEY="sk-your-key-here"
$ node scripts/seo-draft.mjs --topic topic-001

Or draft all queued topics:
$ node scripts/seo-draft.mjs --all


STEP 4: RUN QUALITY GATES
─────────────────────────────────────────────────────────────
$ node scripts/seo-gate.mjs --all

Or check a specific draft:
$ node scripts/seo-gate.mjs --draft topic-001-chicago-airport-limo.json


STEP 5: PUBLISH CONTENT (requires clean git working directory)
─────────────────────────────────────────────────────────────
$ node scripts/seo-publish.mjs --draft topic-001-chicago-airport-limo.json

This will:
- Create a new branch: seo/topic-001-chicago-airport-limo
- Move draft to published/
- Create manifest entry
- Commit changes
- Push to remote
- Create a Pull Request (if gh CLI is installed)


STEP 6: RUN FULL PIPELINE
─────────────────────────────────────────────────────────────
$ node scripts/seo-run.mjs --run

For auto-publishing (creates PRs automatically):
$ node scripts/seo-run.mjs --run --auto-publish


STEP 7: VIEW RUN HISTORY
─────────────────────────────────────────────────────────────
$ node scripts/seo-run.mjs --list


╔════════════════════════════════════════════════════════════╗
║                      TYPICAL WORKFLOW                      ║
╚════════════════════════════════════════════════════════════╝

1. Marketing team proposes topics:
   → node scripts/seo-propose.mjs --keyword "..." --profit 85 ...

2. Content team runs draft generation:
   → node scripts/seo-draft.mjs --all

3. Quality gates automatically validate:
   → node scripts/seo-gate.mjs --all

4. Passing drafts are published via PR:
   → node scripts/seo-publish.mjs --draft topic-xxx.json

5. Team reviews PR and merges to deploy

Or use the automated pipeline:
   → node scripts/seo-run.mjs --run --auto-publish


╔════════════════════════════════════════════════════════════╗
║                     DIRECTORY STRUCTURE                    ║
╚════════════════════════════════════════════════════════════╝

packages/content/seo-bot/
├── queue/
│   └── topics.json              # Topic queue with metadata
├── drafts/                      # Generated content drafts
│   └── topic-001-keyword.json
├── published/                   # Published content
│   └── topic-001-keyword.json
├── manifests/                   # Publication manifests
│   └── manifest-topic-001-*.json
└── runs/                        # Pipeline execution logs
    ├── run-2026-01-16-*.log
    └── run-2026-01-16-*-results.json


╔════════════════════════════════════════════════════════════╗
║                         NOTES                              ║
╚════════════════════════════════════════════════════════════╝

• Set OPENAI_API_KEY environment variable for drafting
• Install GitHub CLI (gh) for automatic PR creation
• Ensure clean git working directory before publishing
• Review quality gate failures before proceeding
• All drafts should pass gates before publishing
• PRs require manual review before merging

For detailed documentation, see:
→ scripts/SEO_AUTOMATION_README.md

`);
