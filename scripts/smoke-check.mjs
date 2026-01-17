#!/usr/bin/env node
// Basic smoke check that fetches / and /admin (or provided URLs)
import fetch from "node-fetch";

const targets = process.env.SMOKE_URLS
  ? process.env.SMOKE_URLS.split(",")
  : ["http://localhost:5000/", "http://localhost:5000/admin"];

async function check(url) {
  try {
    const res = await fetch(url, { method: "GET" });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${url} -> ${res.status} ${ok ? "OK" : "FAIL"}`);
    return ok;
  } catch (e) {
    console.error(`${url} -> ERROR:`, e.message || e);
    return false;
  }
}

async function main() {
  let allOk = true;
  for (const url of targets) {
    const ok = await check(url);
    if (!ok) allOk = false;
  }

  if (!allOk) {
    console.error("Smoke check failed");
    process.exit(2);
  }

  console.log("Smoke check passed");
  process.exit(0);
}

main();
