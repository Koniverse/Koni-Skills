#!/usr/bin/env node

/**
 * changelog-backfill-commits.mjs — Replace "pending" commit SHAs in CHANGELOG
 * with real commit SHAs from git history.
 *
 * Scans Docs/CHANGELOG.md for entries where Commit is "pending" or missing,
 * then searches git history for the commit that bumped VERSION to match each
 * entry's version tag. Amends each CHANGELOG entry with the correct 7-char SHA.
 *
 * Usage:
 *   node scripts/changelog-backfill-commits.mjs [--docs-path Docs/]
 *   node scripts/changelog-backfill-commits.mjs --dry-run
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

// --- Config ---
const DOCS_PATH = process.argv.includes('--docs-path')
  ? process.argv[process.argv.indexOf('--docs-path') + 1]
  : 'Docs';

const CHANGELOG_PATH = `${DOCS_PATH}/CHANGELOG.md`;
const DRY_RUN = process.argv.includes('--dry-run');

// --- Git helpers ---
function findCommitForVersion(version) {
  // Search for the commit that changed VERSION to this version string
  // Strategy 1: Look for commits that modified VERSION file with this version
  try {
    const log = execSync(
      `git log --all --oneline --diff-filter=M -- VERSION | head -20`,
      { encoding: 'utf-8' }
    );

    for (const line of log.trim().split('\n')) {
      if (!line) continue;
      const sha = line.slice(0, 7);
      try {
        const diff = execSync(
          `git show ${sha} -- VERSION 2>/dev/null`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        // Check if this commit set the version to our target
        if (diff.includes(`+${version}`)) {
          return sha;
        }
      } catch {
        // Skip commits we can't read
      }
    }

    // Strategy 2: Search commit messages for the version tag
    const logMsg = execSync(
      `git log --all --oneline --grep="${version}" -- VERSION | head -5`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    const firstMatch = logMsg.trim().split('\n')[0];
    if (firstMatch) {
      return firstMatch.slice(0, 7);
    }
  } catch {
    // Git commands may fail if no repo
  }

  return null;
}

// --- Parse CHANGELOG ---
function parseChangelog(content) {
  const entries = [];
  const lines = content.split('\n');

  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match version header: ## [X.Y.Z] — YYYY-MM-DD — <title> — vX.Y.Z
    const versionMatch = line.match(/^## \[(\d+\.\d+\.\d+)\].*—\s+v?(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      if (currentEntry) entries.push(currentEntry);
      currentEntry = {
        version: versionMatch[1],
        headerLine: i,
        commitLine: -1,
        commitSha: null,
      };
      continue;
    }

    // Match commit line: **Commit**: <sha>
    if (currentEntry) {
      const commitMatch = line.match(/^\*\*Commit\*\*:\s*(\S+)/);
      if (commitMatch) {
        currentEntry.commitLine = i;
        currentEntry.commitSha = commitMatch[1];
        entries.push(currentEntry);
        currentEntry = null;
      }
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

// --- Main ---
function main() {
  if (!existsSync(CHANGELOG_PATH)) {
    console.error(`✗ CHANGELOG not found: ${CHANGELOG_PATH}`);
    process.exit(1);
  }

  // Check we're in a git repo
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
  } catch {
    console.error('✗ Not in a git repository. Cannot backfill commit SHAs.');
    process.exit(1);
  }

  const content = readFileSync(CHANGELOG_PATH, 'utf-8');
  const entries = parseChangelog(content);

  const pending = entries.filter(e => !e.commitSha || e.commitSha === 'pending');

  if (pending.length === 0) {
    console.log('✓ No pending commit SHAs found in CHANGELOG.');
    return;
  }

  if (DRY_RUN) console.log('🔍 DRY RUN — no files will be modified\n');

  const lines = content.split('\n');
  let backfilled = 0;

  for (const entry of pending) {
    console.log(`\n🔍 Looking up v${entry.version}...`);

    const sha = findCommitForVersion(entry.version);

    if (sha) {
      console.log(`  ✓ Found commit ${sha}`);

      if (!DRY_RUN) {
        lines[entry.commitLine] = `**Commit**: ${sha}`;
      }
      backfilled++;
    } else {
      console.log(`  ⚠ No matching commit found for v${entry.version}`);
      // Try the [Unreleased] section approach — look at all version bumps
      try {
        const tags = execSync(`git tag -l "v${entry.version}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
        if (tags.trim()) {
          const tagSha = execSync(`git rev-list -n 1 v${entry.version}`, { encoding: 'utf-8' }).trim().slice(0, 7);
          console.log(`  ✓ Found via tag v${entry.version}: ${tagSha}`);
          if (!DRY_RUN) {
            lines[entry.commitLine] = `**Commit**: ${tagSha}`;
          }
          backfilled++;
        }
      } catch {
        // No tag found either
      }
    }
  }

  if (!DRY_RUN && backfilled > 0) {
    writeFileSync(CHANGELOG_PATH, lines.join('\n'), 'utf-8');
  }

  console.log(`\nDone — ${backfilled}/${pending.length} pending commit SHAs backfilled.`);
  if (DRY_RUN) console.log('(dry run — no changes written)');
}

main();
