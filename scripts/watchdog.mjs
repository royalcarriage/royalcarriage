#!/usr/bin/env node
// Minimal watchdog that hits configured health endpoints and exits non-zero on failure
import { setTimeout } from 'timers/promises';
import fetch from 'node-fetch';

const TARGETS = process.env.WATCHDOG_TARGETS ? process.env.WATCHDOG_TARGETS.split(',') : ['http://localhost:5000/health', 'http://localhost:5000/admin'];
const RETRIES = Number(process.env.WATCHDOG_RETRIES || 3);
const INTERVAL = Number(process.env.WATCHDOG_INTERVAL_MS || 5000);

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('watchdog: targets=', TARGETS);

  for (const url of TARGETS) {
    let ok = false;
    for (let i = 0; i < RETRIES; i++) {
      process.stdout.write(`Checking ${url} (attempt ${i + 1}/${RETRIES})... `);
      ok = await checkUrl(url);
      console.log(ok ? 'OK' : 'FAIL');
      if (ok) break;
      await setTimeout(INTERVAL);
    }

    if (!ok) {
      console.error(`watchdog: FAILURE - ${url} did not respond successfully`);
      process.exit(2);
    }
  }

  console.log('watchdog: all targets healthy');
  process.exit(0);
}

main();
