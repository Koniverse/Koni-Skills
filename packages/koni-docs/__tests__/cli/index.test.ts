import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from './_helpers.ts';

test('cli: --version prints lib version', () => {
  const r = runCli(['--version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\d+\.\d+\.\d+/);
});

test('cli: --help prints program name', () => {
  const r = runCli(['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /koni-docs/);
});

test('cli: unknown command exits non-zero', () => {
  const r = runCli(['nope-this-doesnt-exist']);
  assert.notEqual(r.status, 0);
});
