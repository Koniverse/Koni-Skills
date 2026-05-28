import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadViewerConfig } from '../../src/viewer/lib/config.ts';

test('loadViewerConfig: returns {} when neither config file exists', () => {
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-config-'));
  try {
    const result = loadViewerConfig(dir);
    assert.deepEqual(result, {});
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('loadViewerConfig: loads koni-docs.config.json', () => {
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-config-'));
  try {
    writeFileSync(
      join(dir, 'koni-docs.config.json'),
      JSON.stringify({
        title: 'My Project',
        folderOrder: ['sprints', 'custom'],
        topLevelOrder: ['INDEX', 'PRD'],
      }),
    );
    const result = loadViewerConfig(dir);
    assert.equal(result.title, 'My Project');
    assert.deepEqual(result.folderOrder, ['sprints', 'custom']);
    assert.deepEqual(result.topLevelOrder, ['INDEX', 'PRD']);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('loadViewerConfig: loads koni-docs.config.mjs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-config-'));
  try {
    writeFileSync(
      join(dir, 'koni-docs.config.mjs'),
      `export default { title: 'From MJS', folderOrder: ['a', 'b'] };\n`,
    );
    const result = loadViewerConfig(dir);
    assert.equal(result.title, 'From MJS');
    assert.deepEqual(result.folderOrder, ['a', 'b']);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('loadViewerConfig: throws on schema error with clear path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-config-'));
  try {
    writeFileSync(
      join(dir, 'koni-docs.config.json'),
      JSON.stringify({
        title: 123,
        folderOrder: 'not-array',
      }),
    );
    assert.throws(
      () => loadViewerConfig(dir),
      /koni-docs\.config|title|folderOrder/,
    );
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('loadViewerConfig: JSON takes precedence when both exist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-config-'));
  try {
    writeFileSync(
      join(dir, 'koni-docs.config.json'),
      JSON.stringify({ title: 'JSON wins' }),
    );
    writeFileSync(
      join(dir, 'koni-docs.config.mjs'),
      `export default { title: 'MJS' };\n`,
    );
    const result = loadViewerConfig(dir);
    assert.equal(result.title, 'JSON wins');
  } finally {
    rmSync(dir, { recursive: true });
  }
});
