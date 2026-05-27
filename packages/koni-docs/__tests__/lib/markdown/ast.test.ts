import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, stringifyMarkdown } from '../../../src/lib/markdown/ast.ts';

test('ast: parses and stringifies a trivial doc', () => {
  const md = '# Hello\n\nWorld.\n';
  const ast = parseMarkdown(md);
  assert.equal(ast.type, 'root');
  assert.equal(ast.children[0]?.type, 'heading');
});

test('ast: round-trip preserves table structure', () => {
  const md = '| A | B |\n| - | - |\n| 1 | 2 |\n';
  const ast = parseMarkdown(md);
  const out = stringifyMarkdown(ast);
  assert.match(out, /\| A \| B \|/);
  assert.match(out, /\| 1 \| 2 \|/);
});
