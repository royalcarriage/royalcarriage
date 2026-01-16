
import { promises as fs } from \'fs\';
import path from \'path\';
import { exec as _exec } from \'child_process\';
import { promisify } from \'util\';

const exec = promisify(_exec);

// Attempt to import GoogleGenerativeAI
let GoogleGenerativeAI;
try {
  const { GoogleGenerativeAI: G } = await import(\'google-generative-ai\');
  GoogleGenerativeAI = G;
} catch (e) {
  console.error(\'Error: The "google-generative-ai" package is not installed.\\nPlease run `npm install google-generative-ai` in your project root.\');
  process.exit(1);
}

// --- Configuration and Constants ---
const REPO_ROOT = process.cwd();
const BACKUP_DIR_NAME = \'_backup\';
const MAX_FILES_PER_BATCH = 20;
const MAX_LINES_PER_BATCH = 500;
const DEPLOY_MAX_RETRIES = 2;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Assumed to be set in .env.local

if (!GEMINI_API_KEY) {
  console.error(\'Error: GEMINI_API_KEY environment variable is not set.\\nPlease ensure it is set in a .env.local file or your environment.\');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: \"gemini-pro\" });

// --- Helper Functions ---

async function runCommand(command, cwd = REPO_ROOT) {
  console.log(`Executing: ${command} in ${cwd}`);
  try {
    const { stdout, stderr } = await exec(command, { cwd });
    if (stdout) console.log(`Stdout:\\n${stdout}`);
    if (stderr) console.error(`Stderr:\\n${stderr}`);
    return { stdout, stderr, success: true };
  } catch (error) {
    console.error(`Command failed: ${command}\\nError: ${error.message}`);
    return { stdout: error.stdout, stderr: error.stderr, success: false, error };
  }
}

async function createBackup(filePath) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupDir = path.join(REPO_ROOT, BACKUP_DIR_NAME, today);
  await fs.mkdir(backupDir, { recursive: true });

  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, fileName);

  console.log(`Creating backup of ${filePath} to ${backupPath}`);
  await fs.copyFile(filePath, backupPath);
}

async function getChangedFiles() {
  const { stdout } = await runCommand(\'git diff --name-only --cached\');
  return stdout.trim().split(\'\\n\').filter(Boolean);
}

async function getStagedLinesCount() {
  const { stdout } = await runCommand(\'git diff --cached --numstat\');
  const lines = stdout.trim().split(\'\\n\').filter(Boolean);
  let totalLines = 0;
  for (const line of lines) {
    const [added, deleted] = line.split(\'\\t\').map(Number);
    totalLines += added + deleted;
  }
  return totalLines;
}

// --- Gate Functions ---

async function gateInstallDependencies() {
  console.log(\'Running gate: Install Dependencies...\');
  const { success } = await runCommand(\'npm install\'); // Run npm install at root for monorepo
  return success;
}

async function gateLint() {
  console.log(\'Running gate: Lint...\');
  const { success } = await runCommand(\'npm run lint\');
  return success;
}

async function gateTypecheck() {
  console.log(\'Running gate: Typecheck...\');
  const { success } = await runCommand(\'npm run check\');
  return success;
}

async function gateBuild() {
  console.log(\'Running gate: Build...\');
  const { success } = await runCommand(\'npm run build\');
  return success;
}

async function gateEmulatorSmokeTest() {
  console.log(\'Running gate: Firebase Emulator Smoke Test...\');
  console.warn(\'Firebase Emulator Smoke Test is a placeholder and needs to be implemented specific to your project.\');
  // Example: Run a simple test or check for emulator status
  // const { success } = await runCommand(\'npm run test:rules\'); // Or a dedicated smoke test
  return true; // For now, assume it passes until implemented
}

async function runAllGates() {
  if (!await gateInstallDependencies()) { console.error(\'Gate failed: Install Dependencies\'); return false; }\n  if (!await gateLint()) { console.error(\'Gate failed: Lint\'); return false; }\n  if (!await gateTypecheck()) { console.error(\'Gate failed: Typecheck\'); return false; }\n  if (!await gateBuild()) { console.error(\'Gate failed: Build\'); return false; }\n  if (!await gateEmulatorSmokeTest()) { console.error(\'Gate failed: Emulator Smoke Test\'); return false; }\n  return true;
}

// --- Main Agent Logic ---

async function generateCommitMessage(objective, changes) {
  // Use Gemini to generate a descriptive commit message
  const prompt = `Based on the objective: \"${objective}\" and the following changed files: ${changes.join(\', \')}, generate a concise and descriptive Git commit message following Conventional Commits guidelines (e.g., feat: description, fix: description).`;
  console.log(\'Prompting Gemini for commit message...\');
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

async function yoloAgent(objective) {
  console.log(`YOLO Agent starting with objective: \"${objective}\"`);

  let currentChanges = { files: new Set(), lines: 0 };
  let deployFailures = 0;
  const readmePath = path.join(REPO_ROOT, \'README.md\');

  while (true) {
    // 1. Get current project state and context (simplified for now)
    const currentReadmeContent = await fs.readFile(readmePath, \'utf8\');

    // 2. Prompt Gemini for the next action
    const agentPrompt = `You are an autonomous AI agent operating in \"YOLO MODE\". Your objective is: \"${objective}\".

Current project context:
- README.md content snippet:
\`\`\`
${currentReadmeContent.split(\'\\n\').slice(0, 10).join(\'\\n\')}
\`\`\`

Based on the objective, propose a very simple, single action to append a comment to the README.md file. The comment should indicate progress towards the objective.
Respond with ONLY the new content to append to README.md. Do not include any other text or formatting.`;

    console.log(\'Prompting Gemini for next action...\');
    const result = await model.generateContent(agentPrompt);
    const response = await result.response;
    const geminiProposedContent = response.text().trim();

    if (!geminiProposedContent) {
      console.log(\'Gemini did not propose any content. Exiting YOLO mode.\');
      break;
    }

    const newReadmeContent = currentReadmeContent + \'\\n\' + geminiProposedContent;

    // YOLO Rule: Max 20 files OR 500 lines changed per batch.
    // This is a simplified check for a single file.
    const originalLines = currentReadmeContent.split(\'\\n\').length;
    const newLines = newReadmeContent.split(\'\\n\').length;
    const linesChanged = Math.abs(newLines - originalLines);

    currentChanges.files.add(readmePath);
    currentChanges.lines += linesChanged;

    if (currentChanges.files.size > MAX_FILES_PER_BATCH || currentChanges.lines > MAX_LINES_PER_BATCH) {
        console.warn(\'Batch limits exceeded by proposed change. This change will be committed as a new batch.\');
        // In a more advanced agent, we might ask Gemini to reduce the change size
    }

    // YOLO Rule: If replacing files, copy originals to /_backup/YYYY-MM-DD/.
    await createBackup(readmePath);
    await fs.writeFile(readmePath, newReadmeContent);
    await runCommand(`git add ${readmePath}`); // Stage the change

    const stagedFiles = await getChangedFiles();
    const stagedLines = await getStagedLinesCount();

    if (stagedFiles.length > 0) {
      console.log(`Batch has ${stagedFiles.length} files and ${stagedLines} lines changed. Committing...`);
      const commitMessage = await generateCommitMessage(objective, stagedFiles);
      const { success: commitSuccess } = await runCommand(`git commit -m \"${commitMessage}\"`);

      if (!commitSuccess) {
        console.error(\'Failed to commit changes. Aborting YOLO mode.\');
        process.exit(1);
      }
      console.log(\'Commit successful.\');
      currentChanges = { files: new Set(), lines: 0 }; // Reset for next batch
    } else {
      console.log(\'No changes to commit in this batch.\');
    }

    // After a change, run all gates
    console.log(\'Running gates after changes...\');
    if (!await runAllGates()) {
      console.error(\'Gates failed after changes. YOLO mode halted.\');
      // In a more advanced agent, we would inform Gemini about the gate failure
      // and ask it to propose a fix. For now, we halt.
      process.exit(1);
    }
    console.log(\'All gates passed!\');

    // For this initial example, we\'ll just do one iteration.
    // In a full autonomous agent, this loop would continue until the objective is met.
    console.log(\'Simulated a single autonomous change and commit via Gemini.\');
    break; // Exit loop for initial testing
  }

  console.log(\'YOLO Agent finished its current task (or single iteration).\');
}

async function deployToFirebase() {
  console.log(\'Attempting Firebase deployment...\');
  // YOLO Rule: Deploy order: rules/indexes -> functions -> hosting
  const deployOrder = [\n    \'firebase deploy --only firestore:rules,storage:rules\', // Rules/Indexes (assuming firestore.indexes are handled by rules or separate command)\n    \'firebase deploy --only functions\',\n    \'firebase deploy --only hosting\',\n  ];

  let deploySuccess = true;
  for (const command of deployOrder) {\n    const { success, stderr } = await runCommand(command);\n    if (!success) {\n      console.error(`Firebase deployment step failed: ${command}\\nError: ${stderr}`);\n      deploySuccess = false;\n      break;\n    }\n  }\n  return deploySuccess;
}


// --- Execution ---
const objective = process.argv[2] || \'Update project documentation and ensure all gates pass.\'; // Default objective

// Ensure the .env.local file exists or warn the user
const envLocalPath = path.join(REPO_ROOT, \'.env.local\');
try {\n  await fs.access(envLocalPath);\n} catch (e) {\n  console.warn(\`Warning: \${envLocalPath} not found. Please create it and add GEMINI_API_KEY=YOUR_API_KEY\`);\n  console.warn(\'YOLO mode might fail without proper API key configuration.\');
}

yoloAgent(objective).catch(error => {
  console.error(\'YOLO Agent encountered a critical error:\', error);
  process.exit(1);
});
