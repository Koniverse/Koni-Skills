#!/usr/bin/env node

/**
 * agile-backfill-fields.mjs — Backfill missing frontmatter fields on story files.
 *
 * When setting up the sprint system in an existing project, some story files may
 * be missing fields like assignee, commit, sprint, version_shipped, etc.
 * This script adds any missing standard fields with empty defaults.
 *
 * Usage:
 *   node scripts/agile-backfill-fields.mjs [--docs-path Docs/]
 *   node scripts/agile-backfill-fields.mjs --dry-run
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// --- Config ---
const DOCS_PATH = process.argv.includes('--docs-path')
  ? process.argv[process.argv.indexOf('--docs-path') + 1]
  : 'Docs';

const STORIES_DIR = join(DOCS_PATH, 'sprints', 'stories');
const DRY_RUN = process.argv.includes('--dry-run');

// Standard fields with their default empty values (in insertion order)
const STANDARD_FIELDS = [
  { key: 'id',              default: '', required: true },
  { key: 'title',           default: '""', required: true },
  { key: 'epic',            default: '', required: true },
  { key: 'status',          default: 'backlog', required: true },
  { key: 'priority',        default: 'P2', required: false },
  { key: 'points',          default: '', required: false },
  { key: 'sprint',          default: '', required: false },
  { key: 'version_shipped', default: '', required: false },
  { key: 'prd_ref',         default: '', required: false },
  { key: 'assignee',        default: '', required: false },
  { key: 'commit',          default: '', required: false },
  { key: 'created',         default: '', required: false },
  { key: 'updated',         default: '', required: false },
];

// --- Inference helpers ---
// Infer `epic:` from story `id:` when `epic` is missing but `id` is present.
// `US-3.7` → `EPIC-3`. Nested IDs like `US-8.0.1` still derive `EPIC-8` (only
// the first dotted segment is the epic number). Returns `null` when id is
// malformed or absent.
//
// Real-world note (US-1.5 retro): Koni-Finance-Final had 5+ stories
// (US-4.24, US-8.0, US-8.0.1, US-8.0.2, US-8.7) shipped without an `epic:`
// field. Inference rescues every well-formed `US-X.Y` ID.
function inferEpicFromId(id) {
  if (!id) return null;
  const m = id.match(/^US-(\d+)\b/);
  return m ? `EPIC-${m[1]}` : null;
}

// --- Frontmatter parser ---
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value ?? '';
  }
  return data;
}

// --- Process one story ---
function processStory(filePath) {
  const fileName = filePath.split('/').pop();
  const raw = readFileSync(filePath, 'utf-8');

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.log(`  ⚠ ${fileName} — no frontmatter found, skipping`);
    return { missing: 0, added: 0 };
  }

  const existingFM = fmMatch[1];
  const parsed = parseFrontmatter(raw);
  const existingKeys = Object.keys(parsed).filter(k => parsed[k] !== undefined);

  // Find which standard fields are missing
  const missing = STANDARD_FIELDS.filter(f => !existingKeys.includes(f.key));

  if (missing.length === 0) {
    return { missing: 0, added: 0 };
  }

  // Build the new fields block — add at end of frontmatter
  const newLines = [];
  for (const field of missing) {
    const value = field.default.includes('"') ? field.default : `"${field.default}"`;
    // Don't add quotes for status values, just leave plain
    let finalValue = field.key === 'status' || field.key === 'priority'
      ? field.default
      : (field.default === '' ? '""' : field.default);

    // Inferred backfill: epic from id (US-1.5 / AC-5).
    if (field.key === 'epic') {
      const inferred = inferEpicFromId(parsed.id);
      if (inferred) finalValue = inferred;
    }

    // Only add if we actually have a meaningful default
    if (field.default !== undefined) {
      newLines.push(`${field.key}: ${finalValue}`);
    }
  }

  // Insert new fields at the end of frontmatter (before closing ---)
  const updatedFM = existingFM + '\n' + newLines.join('\n');
  const updated = raw.replace(fmMatch[1], updatedFM);

  if (!DRY_RUN) {
    writeFileSync(filePath, updated, 'utf-8');
  }

  return { missing: missing.length, added: newLines.length, fields: missing.map(f => f.key) };
}

// --- Main ---
function main() {
  if (!existsSync(STORIES_DIR)) {
    console.error(`✗ Stories directory not found: ${STORIES_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(STORIES_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No story files found.');
    return;
  }

  if (DRY_RUN) console.log('🔍 DRY RUN — no files will be modified\n');

  let totalAdded = 0;
  let totalFiles = 0;

  for (const file of files) {
    const filePath = join(STORIES_DIR, file);
    const result = processStory(filePath);

    if (result.missing > 0) {
      console.log(`  ✓ ${file} — added ${result.added} field(s): ${result.fields.join(', ')}`);
      totalAdded += result.added;
      totalFiles++;
    }
  }

  if (totalFiles === 0) {
    console.log('All story files have complete frontmatter. Nothing to backfill.');
  } else {
    console.log(`\nDone — added ${totalAdded} missing field(s) across ${totalFiles} file(s).`);
  }

  if (DRY_RUN) console.log('(dry run — no changes written)');

  // Also validate required fields. For `epic:` specifically, suggest the
  // inferred value when both `id` and `epic` are missing / blank — gives
  // the user a copy-paste fix instead of just flagging the gap.
  console.log('\n--- Validation ---');
  let errors = 0;
  for (const file of files) {
    const raw = readFileSync(join(STORIES_DIR, file), 'utf-8');
    const fm = parseFrontmatter(raw);
    for (const field of STANDARD_FIELDS.filter(f => f.required)) {
      if (!fm[field.key]) {
        const suggestion = field.key === 'epic' ? inferEpicFromId(fm.id) : null;
        const hint = suggestion ? ` (suggest \`epic: ${suggestion}\` from id ${fm.id})` : '';
        console.log(`  ⚠ ${file}: missing required field "${field.key}"${hint}`);
        errors++;
      }
    }
  }
  if (errors === 0) {
    console.log('  ✓ All required fields present in all story files.');
  }
}

main();
