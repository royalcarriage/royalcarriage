#!/usr/bin/env node
/**
 * Watchdog: runs gates (npm ci, lint, typecheck, test, build)
 * Logs failures and exits non-zero if any gate fails.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const logDir = ".agent/logs";
fs.mkdirSync(logDir, { recursive: true });

const cmds = [
  ["install", "npm ci"],
  ["lint", "npm run lint"],
  ["typecheck", "npm run typecheck"],
  ["test", "npm test"],
  ["build", "npm run build"],
];

function run(name, cmd) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = `${logDir}/${stamp}-${name}.log`;
  try {
    console.log(`\n[${name}] Running: ${cmd}`);
    const out = execSync(cmd, { stdio: "pipe" }).toString();
    fs.writeFileSync(logFile, out);
    console.log(`[${name}] ✓ PASS (log: ${logFile})`);
    return { ok: true, logFile };
  } catch (e) {
    const out = (e.stdout?.toString() || "") + "\n" + (e.stderr?.toString() || "");
    fs.writeFileSync(logFile, out);
    console.error(`[${name}] ✗ FAIL (log: ${logFile})`);
    return { ok: false, logFile };
  }
}

let failures = 0;
for (const [name, cmd] of cmds) {
  const r = run(name, cmd);
  if (!r.ok) failures++;
}

console.log(`\n=== GATES SUMMARY ===`);
console.log(`Total: ${cmds.length} | Passed: ${cmds.length - failures} | Failed: ${failures}`);

if (failures > 0) {
  console.error(`\nGates failed. Check logs in ${logDir}/`);
  process.exit(1);
}

console.log("\n✓ All gates passed!");
process.exit(0);
