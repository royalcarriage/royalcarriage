import fs from 'fs';
import path from 'path';

const repo = process.cwd();
const contentDir = path.join(repo, 'packages/content/sites');
const appBySlug = {
  airport: 'apps/airport',
  corporate: 'apps/corporate',
  wedding: 'apps/wedding',
  partybus: 'apps/partybus',
};

function walk(obj, visit) {
  if (Array.isArray(obj)) {
    for (const item of obj) walk(item, visit);
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      visit(k, v);
      walk(v, visit);
    }
  }
}

let totalMissing = 0;
for (const file of fs.readdirSync(contentDir)) {
  if (!file.endsWith('.json')) continue;
  const full = path.join(contentDir, file);
  const raw = fs.readFileSync(full, 'utf8');
  const data = JSON.parse(raw);
  const slug = data.targetSlug;
  const appRel = appBySlug[slug];
  if (!appRel) continue;
  const publicDir = path.join(repo, appRel, 'public');

  const referenced = new Set();
  walk(data, (_k, v) => {
    if (typeof v === 'string' && v.startsWith('/images/')) referenced.add(v);
  });

  const missing = [];
  for (const img of referenced) {
    const disk = path.join(publicDir, img);
    if (!fs.existsSync(disk)) missing.push(img);
  }

  if (missing.length) {
    totalMissing += missing.length;
    console.log(`
[${slug}] ${missing.length} missing of ${referenced.size} referenced (public: ${appRel}/public)`);
    for (const m of missing) console.log(`  - ${m}`);
  } else {
    console.log(`[${slug}] OK (${referenced.size} referenced)`);
  }
}

if (totalMissing) {
  console.log(`
TOTAL missing images: ${totalMissing}`);
  process.exit(2);
} else {
  console.log('\nAll referenced images exist.');
}
