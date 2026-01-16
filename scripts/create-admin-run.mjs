#!/usr/bin/env node
import admin from 'firebase-admin';
import fs from 'fs';
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

if (!uidArg && !email) {
  console.error('Usage: node scripts/create-admin-run.mjs --uid <uid> | --email <email> [--create] [--password <pw>] --serviceAccount <path>');
  process.exit(1);
}

try {
  const raw = fs.readFileSync(serviceAccount, 'utf8');
  const json = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(json) });
} catch (e) {
  console.error('Failed to initialize Admin SDK with provided service account:', e.message || e);
  process.exit(1);
}

async function run() {
  let targetUid = uidArg;
  if (!targetUid && email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
      console.log('Found existing user uid=' + targetUid);
    } catch (err) {
      if (err && err.code === 'auth/user-not-found' && createIfMissing) {
        const pwd = password || (Math.random().toString(36).slice(2, 10) + 'A1!');
        const created = await admin.auth().createUser({ email, password: pwd });
        targetUid = created.uid;
        console.log(`Created user uid=${targetUid} email=${email} password=${pwd}`);
      } else {
        console.error('Error fetching/creating user:', err.message || err);
        process.exit(1);
      }
    }
  }

  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`Custom claim set for uid=${targetUid}`);
    const u = await admin.auth().getUser(targetUid);
    console.log('User customClaims:', u.customClaims);
  } catch (err) {
    console.error('Error setting custom claims:', err.message || err);
    process.exit(1);
  }
}

run();
