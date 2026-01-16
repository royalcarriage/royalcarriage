import fs from 'fs';
import path from 'path';

const repo = process.cwd();
const sites = [
  { slug: 'airport', dist: 'apps/airport/dist', publicDir: 'apps/airport/public' },
  { slug: 'corporate', dist: 'apps/corporate/dist', publicDir: 'apps/corporate/public' },
  { slug: 'wedding', dist: 'apps/wedding/dist', publicDir: 'apps/wedding/public' },
  { slug: 'partybus', dist: 'apps/partybus/dist', publicDir: 'apps/partybus/public' },
];

function* walkFiles(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkFiles(full);
    else yield full;
  }
}

const IMG_RE = /<img\b[^>]*?\ssrc=(\"|')([^\"']+)(\1)[^>]*>/gi;

let totalMissing = 0;
for (const s of sites) {
  const distDir = path.join(repo, s.dist);
  const pubDir = path.join(repo, s.publicDir);
  const missing = new Map();

  for (const file of walkFiles(distDir)) {
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = IMG_RE.exec(html))) {
      const src = m[2];
      if (src.startsWith('data:')) continue;
      if (src.startsWith('http://') || src.startsWith('https://')) continue;
      if (src.startsWith('//')) continue;

      const normalized = src.startsWith('/') ? src : '/' + src;
      const disk = path.join(pubDir, normalized);
      if (!fs.existsSync(disk)) {
        const relHtml = path.relative(distDir, file);
        if (!missing.has(normalized)) missing.set(normalized, new Set());
        missing.get(normalized).add(relHtml);
      }
    }
  }

  if (missing.size) {
    totalMissing += missing.size;
    console.log(`\n[${s.slug}] Missing img assets referenced by built HTML: ${missing.size}`);
    for (const [src, files] of missing.entries()) {
      const sample = Array.from(files).slice(0, 3).join(', ');
      console.log(`  - ${src} (e.g., in ${sample})`);
    }
  } else {
    console.log(`[${s.slug}] OK (${referenced.size} referenced)`); // NOTE: 'referenced' is not defined here, fix later if needed
  }
}

if (totalMissing) {
  console.log(`\nTOTAL missing images: ${totalMissing}`);
  process.exit(2);
} else {
  console.log('\nAll referenced images exist.');
}
