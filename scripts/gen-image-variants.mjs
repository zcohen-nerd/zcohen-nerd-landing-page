#!/usr/bin/env node
// Generates responsive WebP variants for the home-page imagery.
// Usage: node scripts/gen-image-variants.mjs   (requires devDependency: sharp)
//
// The originals stay in static/img/ as the full-resolution source of record;
// this writes width-descriptor variants next to them under responsive/ so the
// page can hand the browser a size that matches the box it renders into.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(import.meta.dirname, '..');
const imgDir = path.join(root, 'static', 'img');

// [source relative to static/img, output widths]
const JOBS = [
  ['zachary-cohen-headshot.jpg', [52, 104, 156]], // 52px avatar, up to 3x
  ['work/surfer-on-water.webp', [340, 512, 768, 1024]],
  ['work/sentry-turret-labeled.webp', [340, 512, 768, 1024]],
  ['work/spark-board-perspective.webp', [340, 512, 768, 1024]],
];

const QUALITY = 76;
let written = 0;

for (const [rel, widths] of JOBS) {
  const input = path.join(imgDir, rel);
  const dir = path.join(path.dirname(input), 'responsive');
  const base = path.basename(rel).replace(/\.[^.]+$/, '');
  fs.mkdirSync(dir, {recursive: true});
  const meta = await sharp(input).metadata();
  for (const w of widths) {
    if (meta.width && w >= meta.width) continue; // never upscale
    const out = path.join(dir, `${base}-${w}w.webp`);
    await sharp(input).resize({width: w}).webp({quality: QUALITY}).toFile(out);
    const kb = (fs.statSync(out).size / 1024).toFixed(1);
    console.log(`  ${path.relative(root, out)}  (${w}w, ${kb} KiB)`);
    written += 1;
  }
}
console.log(`\nwrote ${written} variant(s)`);
