#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function tryRequireSharp() {
  try {
    return require('sharp');
  } catch (e) {
    console.warn('Optional dependency `sharp` not installed. Install it to enable image optimization: `npm i -D sharp`.');
    return null;
  }
}

async function optimizeAssets(dir) {
  const sharp = await tryRequireSharp();
  if (!sharp) return;

  const exts = ['.png', '.jpg', '.jpeg'];
  const files = [];

  function walk(d) {
    const items = fs.readdirSync(d);
    for (const item of items) {
      const full = path.join(d, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (exts.includes(path.extname(item).toLowerCase())) files.push({ full, size: stat.size });
    }
  }

  if (!fs.existsSync(dir)) {
    console.warn('Assets directory not found:', dir);
    return;
  }

  walk(dir);

  const threshold = 200 * 1024; // 200 KB
  for (const f of files) {
    try {
      if (f.size > threshold) {
        const outPath = f.full.replace(path.extname(f.full), '.webp');
        await sharp(f.full)
          .webp({ quality: 80 })
          .toFile(outPath);
        console.log('Optimized:', path.relative(process.cwd(), f.full), '->', path.relative(process.cwd(), outPath));
      }
    } catch (err) {
      console.error('Failed to optimize', f.full, err.message || err);
    }
  }
}

const target = path.join(process.cwd(), 'dist', 'public', 'assets');
optimizeAssets(target).then(() => console.log('Image optimization complete.'));
