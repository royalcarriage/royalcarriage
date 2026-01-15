#!/usr/bin/env node
// Minimal emulator role test runner.
// Requires local server and (optionally) Firebase emulators.
import fetch from 'node-fetch';

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

async function login(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  return res;
}

async function run() {
  console.log('Running emulator role test (manual steps may be required)...');
  console.log(`Trying login as ${ADMIN_LOGIN}`);
  const res = await login(ADMIN_LOGIN, ADMIN_PASSWORD);
  console.log('Login status:', res.status);

  if (res.status !== 200) {
    console.error('Admin login failed; ensure an admin user exists (run npm run init-admin)');
    process.exit(2);
  }

  // Try admin-only endpoint
  const usersRes = await fetch(`${BASE}/api/users`, { method: 'GET', credentials: 'include' });
  console.log('/api/users ->', usersRes.status);

  if (usersRes.status >= 200 && usersRes.status < 300) {
    console.log('Role boundary test PASSED');
    process.exit(0);
  } else {
    console.error('Role boundary test FAILED');
    process.exit(3);
  }
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
