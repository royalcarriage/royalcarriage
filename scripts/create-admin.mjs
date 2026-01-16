#!/usr/bin/env node
import admin from 'firebase-admin';
import process from 'process';
import fs from 'fs';

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

function initAdmin() {
  if (admin.apps && admin.apps.length) return;
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
}

async function main() {
  if (!uidArg && !email) {
    usage();
    process.exit(1);
  }

  initAdmin();

  let targetUid = uidArg;

  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log(`Found existing user uid=${targetUid} for email=${email}`);
    } catch (err) {
      const code = err && err.code ? err.code : null;
      if (code === 'auth/user-not-found' || createIfMissing) {
        if (!createIfMissing && code === 'auth/user-not-found') {
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
  } finally {
    if (admin.apps && admin.apps.length) {
      await Promise.all(admin.apps.map((app) => app.delete().catch(() => {})));
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
