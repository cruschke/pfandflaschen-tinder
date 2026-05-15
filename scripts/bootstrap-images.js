#!/usr/bin/env node
/**
 * Populates assets/images/ and assets/data/bottles.json from scripts/image-sources.json.
 * Safe to re-run: skips entries whose sourceUrl already exists in bottles.json (idempotent).
 * Increments patch version on each run that adds at least one new item.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCES_PATH   = join(__dirname, 'image-sources.json');
const MANIFEST_PATH  = join(ROOT, 'assets', 'data', 'bottles.json');
const IMAGES_DIR     = join(ROOT, 'assets', 'images');
const MAX_PX         = 800;
const WEBP_QUALITY   = 80;

function bumpPatch(version) {
  const parts = version.split('.').map(Number);
  parts[2] = (parts[2] ?? 0) + 1;
  return parts.join('.');
}

const DELAY_MS = 1500;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'pfandflaschen-tinder/bootstrap (+https://github.com)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function toWebP(inputBuffer, outPath) {
  await sharp(inputBuffer)
    .resize(MAX_PX, MAX_PX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outPath);
}

async function main() {
  mkdirSync(IMAGES_DIR, { recursive: true });

  const sources = JSON.parse(readFileSync(SOURCES_PATH, 'utf8'));

  let manifest = { version: '0.0.0', items: [] };
  if (existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    manifest.items ??= [];
  }

  const knownUrls = new Set(manifest.items.map(i => i.sourceUrl));
  const toProcess = sources.filter(s => !knownUrls.has(s.sourceUrl));

  if (toProcess.length === 0) {
    console.log('Nothing to do — all sources already in bottles.json.');
    return;
  }

  console.log(`Processing ${toProcess.length} new source(s)…`);

  const added = [];
  for (const source of toProcess) {
    const filename = `${source.id}.webp`;
    const outPath  = join(IMAGES_DIR, filename);
    process.stdout.write(`  ↓ ${source.id} … `);
    try {
      const buf = await downloadBuffer(source.sourceUrl);
      await toWebP(buf, outPath);
      manifest.items.push({
        id:            source.id,
        filename,
        sourceUrl:     source.sourceUrl,
        containerType: source.containerType,
        brand:         source.brand,
        description:   source.description,
        isReturnable:  source.isReturnable,
        hints:         source.hints,
        license:       source.license,
        attribution:   source.attribution,
      });
      added.push(source.id);
      console.log('ok');
    } catch (err) {
      console.error(`FAILED — ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  if (added.length > 0) {
    manifest.version = bumpPatch(manifest.version);
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`\nAdded ${added.length} item(s). bottles.json is now v${manifest.version} with ${manifest.items.length} items.`);
  } else {
    console.log('\nNo items were added (all downloads failed).');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
