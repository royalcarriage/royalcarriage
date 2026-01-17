#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const issues = [];

function read(p) {
  try {
    return fs.readFileSync(path.join(root, p), "utf8");
  } catch (e) {
    return null;
  }
}

// Check .codex config
const codex = read(".codex/config.toml");
if (codex) {
  const m = codex.match(/^\s*model\s*=\s*(.*)$/m);
  if (m) {
    const val = m[1].trim();
    if (val.startsWith("{") || val.startsWith("[")) {
      issues.push(
        ".codex/config.toml: `model` appears to be a map/array; expected a string.",
      );
    }
  }
} else {
  issues.push("Missing .codex/config.toml in repo (recommended).");
}

// Check firestore.rules for permissive rules
const rules = read("firestore.rules");
if (rules) {
  if (
    /allow\s+read\s*:\s*if\s+true/.test(rules) ||
    /allow\s+write\s*:\s*if\s+true/.test(rules)
  ) {
    issues.push(
      "firestore.rules: contains global allow read/write -> enforce least-privilege.",
    );
  }
} else {
  issues.push("Missing firestore.rules");
}

// Check firebase.json
const fjson = read("firebase.json");
if (fjson) {
  try {
    const jf = JSON.parse(fjson);
    if (!jf.hosting) issues.push("firebase.json: hosting not configured");
  } catch (e) {
    issues.push("firebase.json: invalid JSON");
  }
} else {
  issues.push("Missing firebase.json");
}

// Check .vscode settings
const vsettings = read(".vscode/settings.json");
if (!vsettings) issues.push(".vscode/settings.json missing");

// Check GitHub workflows reference secrets
const wfPaths = fs
  .readdirSync(path.join(root, ".github/workflows"))
  .map((f) => `.github/workflows/${f}`);
for (const wf of wfPaths) {
  const txt = read(wf);
  if (
    txt &&
    /FIREBASE_SERVICE_ACCOUNT|FIREBASE_PROJECT_ID|GCP_SA_KEY|WORKLOAD_IDENTITY_PROVIDER/.test(
      txt,
    )
  ) {
    // presence is fine; just note
  }
}

// Summarize
console.log("Repository Audit Report");
console.log("=======================");
if (issues.length === 0) {
  console.log("No immediate repository-level issues found.");
} else {
  console.log("Issues found:");
  for (const it of issues) console.log("- " + it);
  process.exitCode = 2;
}

console.log("\nRecommendations:");
console.log(
  "- Inspect local user configs at ~/.codex/config.toml for `model` typed as map and convert to string.",
);
console.log(
  "- Run `npm run gates` and fix lint/typecheck if you replace placeholders with real tools.",
);
console.log("- Use Firebase emulator to validate `firestore.rules`.");
