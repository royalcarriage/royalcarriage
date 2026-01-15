# Firebase Emulator Quick Start Guide

This guide helps you set up and use Firebase emulators for local development and testing.

## Why Use Firebase Emulators?

Firebase emulators allow you to:
- ✅ Test functions, Firestore, and Storage locally without affecting production
- ✅ Develop offline without internet connectivity
- ✅ Iterate faster with instant deployments
- ✅ Avoid costs during development
- ✅ Test security rules safely

## Prerequisites

1. **Node.js 20+** installed
2. **Firebase CLI** installed globally
3. **Java JDK 11+** (for Firestore emulator)

## Installation

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### 2. Login to Firebase

```bash
firebase login
```

This opens a browser for authentication.

### 3. Initialize Firebase (if needed)

If this is your first time:
```bash
firebase init
```

Select:
- ☑ Functions
- ☑ Firestore
- ☑ Hosting
- ☑ Storage
- ☑ Emulators

## Starting Emulators

### Start All Emulators

```bash
firebase emulators:start
```

This starts:
- **Functions** on http://localhost:5001
- **Firestore** on http://localhost:8080
- **Hosting** on http://localhost:5000
- **Storage** on http://localhost:9199
- **Emulator UI** on http://localhost:4000

### Start Specific Emulators

```bash
# Only Functions and Firestore
firebase emulators:start --only functions,firestore

# Only Hosting
firebase emulators:start --only hosting

# Only Storage
firebase emulators:start --only storage
```

### Start with Data Import

```bash
# Export current data first
firebase emulators:export ./emulator-data

# Start with imported data
firebase emulators:start --import ./emulator-data
```

## Using the Emulators

### Accessing Emulator UI

Open http://localhost:4000 in your browser to access:
- 📊 Function logs and execution details
- 📁 Firestore data browser and editor
- 🖼️ Storage file browser
- 📈 Request logs and performance metrics

### Connecting Your App to Emulators

#### In Server Code (Node.js)

Add to your `server/index.ts` or initialization file:

```typescript
import * as admin from 'firebase-admin';

// Initialize Admin SDK
admin.initializeApp();

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const db = admin.firestore();
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
  
  // For Storage
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}
```

#### In Client Code (Web)

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Testing Functions

#### Call HTTP Functions

```bash
# Using curl
curl http://localhost:5001/${FIREBASE_PROJECT_ID}/us-central1/triggerPageAnalysis \
  -H "Content-Type: application/json" \
  -d '{"pageUrl": "/test", "pageName": "Test Page", "pageContent": "<html>test</html>"}'

# Using Firebase CLI
firebase functions:shell
```

#### View Function Logs

```bash
# In Emulator UI
Open http://localhost:4000 → Functions → Logs

# In terminal (where emulators are running)
# Logs appear in real-time
```

### Testing Firestore Rules

Create a test file `firestore.rules.test.js`:

```javascript
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

// Test admin access
test('Admin can read users', async () => {
  const admin = testEnv.authenticatedContext('user123', { role: 'admin' });
  await assertSucceeds(admin.firestore().collection('users').doc('test').get());
});

// Test non-admin access
test('Non-admin cannot read users', async () => {
  const user = testEnv.authenticatedContext('user456', { role: 'user' });
  await assertFails(user.firestore().collection('users').doc('test').get());
});
```

Run tests:
```bash
npm test -- firestore.rules.test.js
```

### Testing Storage Rules

#### Upload Test File

```bash
# Using curl
curl -X POST \
  http://localhost:9199/v0/b/your-bucket/o/ai-images%2Ftest.jpg \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-image.jpg
```

#### View Storage Files

Open http://localhost:4000 → Storage → Browse files

### Managing Emulator Data

#### Export Data

```bash
# Export all emulator data
firebase emulators:export ./backup

# Export specific emulators
firebase emulators:export ./backup --only firestore,storage
```

#### Import Data

```bash
# Import on startup
firebase emulators:start --import ./backup

# Import and auto-export on shutdown
firebase emulators:start --import ./backup --export-on-exit
```

#### Clear Data

```bash
# Stop emulators
# Delete data directory
rm -rf ./emulator-data

# Or use UI: click "Clear all data" in Emulator UI
```

## Development Workflow

### Recommended Workflow

1. **Start emulators in one terminal:**
   ```bash
   firebase emulators:start --import ./emulator-data --export-on-exit
   ```

2. **Start dev server in another terminal:**
   ```bash
   npm run dev
   ```

3. **Make changes and test:**
   - Code changes auto-reload (HMR)
   - Function changes require rebuild: `cd functions && npm run build`
   - Rules changes auto-reload (save file)

4. **Stop emulators:**
   - Press `Ctrl+C` in emulator terminal
   - Data auto-exports to ./emulator-data

### Hot Reload for Functions

For faster iteration:

```bash
# Terminal 1: Watch and build functions
cd functions && npm run build:watch

# Terminal 2: Start emulators
firebase emulators:start
```

When you save a function file:
1. TypeScript rebuilds automatically
2. Emulator detects changes and reloads
3. Test immediately

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 4000 (example)
lsof -ti:4000 | xargs kill -9

# Or use different ports
firebase emulators:start --only functions --functions-port 5002
```

### Emulator Won't Start

```bash
# Clear Firebase cache
firebase emulators:kill
rm -rf ~/.config/firebase/

# Reinstall emulators
firebase setup:emulators:firestore
firebase setup:emulators:storage
```

### Java Not Found (Firestore Emulator)

```bash
# Install Java 11+
# Ubuntu/Debian
sudo apt-get install openjdk-11-jdk

# macOS
brew install openjdk@11

# Verify
java -version
```

### Function Not Found

Make sure functions are built:
```bash
cd functions
npm run build
# Check lib/ directory exists with compiled JS files
```

### Connection Refused

Check if emulators are running:
```bash
# Should show running emulators
firebase emulators:list
```

Make sure your code connects to emulators (see "Connecting Your App" above).

## Configuration Files

### firebase.json (Already Configured)

```json
{
  "emulators": {
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Custom Emulator Ports

Edit `firebase.json` to change ports if needed.

## Best Practices

### 1. Use Emulators for All Development

```bash
# Add to package.json scripts
{
  "scripts": {
    "dev:emulators": "firebase emulators:start --import ./emulator-data --export-on-exit",
    "dev:server": "npm run dev",
    "dev": "concurrently \"npm run dev:emulators\" \"npm run dev:server\""
  }
}
```

### 2. Commit Seed Data

```bash
# Create seed data
firebase emulators:start
# Add test data via UI
# Export
firebase emulators:export ./seed-data

# Commit seed-data/ to git
git add seed-data/
git commit -m "Add emulator seed data"
```

### 3. Test Rules Before Deploy

```bash
# Test rules locally
firebase emulators:start --only firestore

# Manual testing via UI or code

# Deploy rules
firebase deploy --only firestore:rules
```

### 4. Use Different Data Sets

```bash
# Development data
firebase emulators:start --import ./dev-data

# Testing data
firebase emulators:start --import ./test-data

# Demo data
firebase emulators:start --import ./demo-data
```

## CI/CD with Emulators

### GitHub Actions Example

```yaml
- name: Install Firebase CLI
  run: npm install -g firebase-tools

- name: Install Functions dependencies
  run: cd functions && npm ci

- name: Build Functions
  run: cd functions && npm run build

- name: Start Emulators
  run: firebase emulators:exec --only firestore,functions 'npm test'
```

## Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)
- [Local Function Testing](https://firebase.google.com/docs/functions/local-emulator)

## Quick Reference

```bash
# Start all emulators
firebase emulators:start

# Start with data
firebase emulators:start --import ./data --export-on-exit

# Start specific emulators
firebase emulators:start --only functions,firestore

# Stop emulators
# Press Ctrl+C

# List emulators
firebase emulators:list

# View logs
# Check terminal or http://localhost:4000

# Export data
firebase emulators:export ./backup

# Clear cache
firebase emulators:kill
```

---

**Next Steps:**
1. Start emulators: `firebase emulators:start`
2. Open Emulator UI: http://localhost:4000
3. Connect your app to emulators
4. Start developing!
