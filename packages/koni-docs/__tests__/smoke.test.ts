import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KONI_DOCS_LIB_VERSION } from '../src/lib/index.ts';

test('smoke: lib version exported', () => {
  assert.equal(KONI_DOCS_LIB_VERSION, '0.11.10');
});
