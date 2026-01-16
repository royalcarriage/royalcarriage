#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';
import fs from 'fs';

// create-admin-clean.mjs - single clean script (promoted to canonical create-admin.mjs)
const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1] || null;
}

const email = getArg('--email');
const uidArg = getArg('--uid');
const password = getArg('--password');
const serviceAccount = getArg('--serviceAccount');
const createIfMissing = argv.includes('--create');

function usage() {
  console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
}

try {
  if (serviceAccount) {
    if (!fs.existsSync(serviceAccount)) {
      console.error('Service account file not found:', serviceAccount);
      process.exit(1);
    }
    const raw = fs.readFileSync(serviceAccount, 'utf8');
    const json = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('Warning: GOOGLE_APPLICATION_CREDENTIALS not set; attempting applicationDefault()');
    }
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e.message || e);
  process.exit(1);
}

async function main() {
  if (!uidArg && !email) {
    usage();
    process.exit(1);
  }

  let targetUid = uidArg;
  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log(`Found existing user uid=${targetUid}`);
    } catch (err) {
      if ((err && err.code === 'auth/user-not-found') || createIfMissing) {
        if (!createIfMissing) {
          console.log('User not found. To create, re-run with --create');
          process.exit(1);
        }
        const pwd = password || (Math.random().toString(36).slice(2, 10) + 'A1!');
        const created = await admin.auth().createUser({ email, password: pwd });
        targetUid = created.uid;
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching user by email:', err.message || err);
        process.exit(1);
      }
    }
  }

  if (!targetUid) {
    console.error('No target uid available to set claims.');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim 'role: admin' set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';
import fs from 'fs';

// create-admin.mjs - clean implementation
// Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]

const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1] || null;
}

const email = getArg('--email');
const uidArg = getArg('--uid');
const password = getArg('--password');
const serviceAccount = getArg('--serviceAccount');
const createIfMissing = argv.includes('--create');

function usage() {
  console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
}

// Initialize Admin SDK
try {
  if (serviceAccount) {
    if (!fs.existsSync(serviceAccount)) {
      console.error('Service account file not found:', serviceAccount);
      process.exit(1);
    }
    const raw = fs.readFileSync(serviceAccount, 'utf8');
    const json = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('Warning: GOOGLE_APPLICATION_CREDENTIALS not set; attempting applicationDefault()');
    }
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e.message || e);
  process.exit(1);
}

async function main() {
  if (!uidArg && !email) {
    usage();
    process.exit(1);
  }

  let targetUid = uidArg;

  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log(`Found existing user uid=${targetUid} for email=${email}`);
    } catch (err) {
      const code = err && err.code ? err.code : '';
      if (code === 'auth/user-not-found' || createIfMissing) {
        if (!createIfMissing) {
          console.log('User not found. To create, re-run with --create');
          process.exit(1);
        }
        const pwd = password || (Math.random().toString(36).slice(2, 10) + 'A1!');
        const created = await admin.auth().createUser({ email, password: pwd });
        targetUid = created.uid;
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching user by email:', err);
        process.exit(1);
      }
    }
  }

  if (!targetUid) {
    console.error('No target uid available to set claims.');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim 'role: admin' set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';
import fs from 'fs';

// create-admin.mjs
// Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]

const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  return argv[i + 1] || null;
}

const email = getArg('--email');
const uidArg = getArg('--uid');
const password = getArg('--password');
const serviceAccount = getArg('--serviceAccount');
const createIfMissing = argv.includes('--create');

function usage() {
  console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
}

// Initialize Admin SDK
try {
  if (serviceAccount) {
    if (!fs.existsSync(serviceAccount)) {
      console.error('Service account file not found:', serviceAccount);
      process.exit(1);
    }
    const raw = fs.readFileSync(serviceAccount, 'utf8');
    const json = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('Warning: GOOGLE_APPLICATION_CREDENTIALS not set; attempting applicationDefault()');
    }
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e.message || e);
  process.exit(1);
}

async function main() {
  if (!uidArg && !email) {
    usage();
    process.exit(1);
  }

  let targetUid = uidArg;

  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log(`Found existing user uid=${targetUid} for email=${email}`);
    } catch (err) {
      const code = err && err.code ? err.code : '';
      if (code === 'auth/user-not-found' || createIfMissing) {
        if (!createIfMissing) {
          console.log('User not found. To create, re-run with --create');
          process.exit(1);
        }
        const pwd = password || (Math.random().toString(36).slice(2, 10) + 'A1!');
        const created = await admin.auth().createUser({ email, password: pwd });
        targetUid = created.uid;
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching user by email:', err);
        process.exit(1);
      }
    }
  }

  if (!targetUid) {
    console.error('No target uid available to set claims.');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim 'role: admin' set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';
import fs from 'fs';

// Simple CLI to create/set an admin user
const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  return argv[i + 1] || null;
}

const email = getArg('--email');
const uidArg = getArg('--uid');
const password = getArg('--password');
const serviceAccount = getArg('--serviceAccount');
const createIfMissing = argv.includes('--create');

function usage() {
  console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
  console.log('\nExamples:');
  console.log('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa.json"');
  console.log('  node scripts/create-admin.mjs --uid USER_UID');
  console.log('  node scripts/create-admin.mjs --email admin@example.com --create --password S3cret123 --serviceAccount ./sa.json');
}

try {
  if (serviceAccount) {
    const raw = fs.readFileSync(serviceAccount, 'utf8');
    const json = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(json),
    });
  } else {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('Warning: GOOGLE_APPLICATION_CREDENTIALS not set; attempting applicationDefault()');
    }
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
} catch (e) {
  // allow errors to surface later
}

async function main() {
  if (!uidArg && !email) {
    usage();
    process.exit(1);
  }

  let targetUid = uidArg;

  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log(`Found existing user uid=${targetUid} for email=${email}`);
    } catch (err) {
      const code = err && err.code ? err.code : '';
      if (code === 'auth/user-not-found' || createIfMissing) {
        if (!createIfMissing) {
          console.log('User not found. To create, re-run with --create');
          process.exit(1);
        }
        const pwd = password || (Math.random().toString(36).slice(2, 10) + 'A1!');
        const created = await admin.auth().createUser({ email, password: pwd });
        targetUid = created.uid;
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching user by email:', err);
        process.exit(1);
      }
    }
  }

  if (!targetUid) {
    console.error('No target uid available to set claims.');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim 'role: admin' set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';

const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  return argv[i + 1] || null;
}

const email = getArg('--email');
const uidArg = getArg('--uid');
const password = getArg('--password');
const serviceAccount = getArg('--serviceAccount');
const createIfMissing = argv.includes('--create');

if (serviceAccount) process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccount;

function usage() {
  console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
  console.log('\nExamples:');
  console.log('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa.json"');
  console.log('  node scripts/create-admin.mjs --uid USER_UID');
  console.log('  node scripts/create-admin.mjs --email admin@example.com --create --password S3cret123 --serviceAccount ./sa.json');
}

try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or pass --serviceAccount <path>');
  }
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (e) {
  // continue; initialization errors will surface when calling admin APIs
}

async function main() {
  if (!uidArg && !email) {
    try {
      if (serviceAccount) process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccount;

      function usage() {
        console.log('Usage: node scripts/create-admin.mjs --uid <uid> | --email <email> [--create] [--password <pw>] [--serviceAccount <path>]');
        console.log('\nExamples:');
        console.log('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa.json"');
        console.log('  node scripts/create-admin.mjs --uid USER_UID');
        console.log('  node scripts/create-admin.mjs --email admin@example.com --create --password S3cret123 --serviceAccount ./sa.json');
      }

      if (serviceAccount) {
        const fs = await import('fs');
        const raw = fs.readFileSync(serviceAccount, 'utf8');
        const json = JSON.parse(raw);
        admin.initializeApp({
          credential: admin.credential.cert(json),
        });
      } else {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          console.error('Set GOOGLE_APPLICATION_CREDENTIALS or pass --serviceAccount <path>');
        }
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      }
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching user by email:', err);
        process.exit(1);
      }
    }
  }

  if (!targetUid) {
    console.error('No target uid available to set claims.');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim 'role: admin' set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
