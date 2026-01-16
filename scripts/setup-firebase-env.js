#!/usr/bin/env node

/**
 * Firebase Environment Setup Helper
 *
 * This script helps you configure Firebase credentials for the admin dashboard.
 *
 * Usage:
 *   node scripts/setup-firebase-env.js
 *
 * It will:
 * 1. Read from Firebase Console config
 * 2. Create/update .env.local with values
 * 3. Validate the configuration
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

const firebaseConfigTemplate = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "Firebase API Key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "Auth Domain",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "Project ID",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "Storage Bucket",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "Messaging Sender ID",
  NEXT_PUBLIC_FIREBASE_APP_ID: "Firebase App ID",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "GA Measurement ID (optional)",
};

async function main() {
  console.log("\n🔐 Firebase Authentication Setup\n");
  console.log("Get these values from: https://console.firebase.google.com/");
  console.log("Project: royalcarriagelimoseo → Settings → Project Settings\n");

  const config = {};

  for (const [key, description] of Object.entries(firebaseConfigTemplate)) {
    const value = await question(`Enter ${description} (${key}): `);
    if (value.trim()) {
      config[key] = value.trim();
    }
  }

  const envLocalPath = path.join(__dirname, "../.env.local");
  let envContent = "";

  // Read existing .env.local if it exists
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, "utf-8");
  }

  // Update or add Firebase config
  for (const [key, value] of Object.entries(config)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  // Also add admin email setup
  console.log("\n👤 Admin Email Setup");
  const adminEmail = await question(
    "Enter your admin email (for dashboard access): "
  );

  if (adminEmail.trim()) {
    envContent += `\n\n# Admin Configuration\nADMIN_EMAIL=${adminEmail.trim()}`;

    console.log(`\n📝 Update the admin email in: apps/admin/src/lib/dataStore.ts`);
    console.log(
      `Line 208: role: user.email === "${adminEmail.trim()}" ? "superadmin" : "viewer",`
    );
  }

  // Write .env.local
  fs.writeFileSync(envLocalPath, envContent.trim() + "\n", "utf-8");

  console.log("\n✅ Configuration saved to .env.local");
  console.log(`📍 File: ${envLocalPath}\n`);

  console.log("Next steps:");
  console.log("1. Update admin email in apps/admin/src/lib/dataStore.ts line 208");
  console.log("2. Rebuild admin app: cd apps/admin && npm run build");
  console.log("3. Start dev server: npm run dev");
  console.log("4. Visit http://localhost:3000 and sign in with Google\n");

  rl.close();
}

main().catch(console.error);
