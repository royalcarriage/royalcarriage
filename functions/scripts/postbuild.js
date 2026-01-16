// Normalize build output for Firebase: ensure lib/index.js exists.
const fs = require("fs");
const path = require("path");

const OUTPUT_INDEX = path.join(
  __dirname,
  "..",
  "lib",
  "functions",
  "src",
  "index.js",
);
const OUTPUT_MAP = path.join(
  __dirname,
  "..",
  "lib",
  "functions",
  "src",
  "index.js.map",
);
const TARGET_INDEX = path.join(__dirname, "..", "lib", "index.js");
const TARGET_MAP = path.join(__dirname, "..", "lib", "index.js.map");

if (!fs.existsSync(OUTPUT_INDEX)) {
  console.warn(
    "postbuild: functions/lib/functions/src/index.js not found; skipping copy.",
  );
  process.exit(0);
}

fs.mkdirSync(path.dirname(TARGET_INDEX), { recursive: true });
fs.copyFileSync(OUTPUT_INDEX, TARGET_INDEX);

if (fs.existsSync(OUTPUT_MAP)) {
  fs.copyFileSync(OUTPUT_MAP, TARGET_MAP);
}

console.log("postbuild: copied index.js to lib/index.js for Firebase deploy.");
