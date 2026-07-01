// MANDATORY content-leak assertion (handoff §8). Feed the extractor a fixture transcript
// containing real prompt text, assistant responses, tool inputs/outputs, and file
// contents, and assert the produced batch (serialized JSON) contains NONE of those
// strings and ONLY allowlisted keys. This is the client-side half of the ERP's
// ingest-schema content-rejection guarantee (ERP LESSONS §214).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseNewLines, buildBatch, ALLOWLIST_SESSION, ALLOWLIST_EVENT, ALLOWLIST_META } from '../agent-report-core.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log('ok   - ' + m); };
const no = (m) => { FAIL++; console.log('FAIL - ' + m); };

// Every sensitive string that MUST NOT appear anywhere in the serialized batch.
const FORBIDDEN = [
  'SECRET_PROMPT', 'hunter2', 'sk-leak-999',           // prompt text + secrets
  'ASSISTANT_SECRET_RESPONSE',                          // assistant response text
  'FILE_SECRET_CONTENTS', 'MORE_FILE_SECRETS',          // file contents / diff bodies (Edit input)
  'TOOL_OUTPUT_SECRET',                                 // tool result output
  'BASH_SECRET_VALUE', 'AKIALEAK', 'cat .env',          // tool input (Bash command) + secrets
];

const raw = readFileSync(join(HERE, 'fixtures', 'transcript.jsonl'), 'utf8');
const lines = parseNewLines(raw);
const { snapshot, events } = buildBatch({ sessionId: 'leak-sid', prev: null, lines, hookEvent: 'SessionStart', seqStart: 0, now: '2026-07-01T00:00:00Z' });
const batch = { session: snapshot, events };
const wire = JSON.stringify(batch);

// 1. no forbidden substring appears anywhere in the wire payload
for (const f of FORBIDDEN) {
  if (wire.includes(f)) no(`leak: "${f}" appears in the batch`); else ok(`no leak: "${f}"`);
}

// 2. only allowlisted keys — session
for (const k of Object.keys(snapshot)) {
  if (!ALLOWLIST_SESSION.has(k)) no(`session has non-allowlisted key "${k}"`);
}
ok('session keys all allowlisted');

// 3. only allowlisted keys — every event + its metadata
for (const e of events) {
  for (const k of Object.keys(e)) if (!ALLOWLIST_EVENT.has(k)) no(`event has non-allowlisted key "${k}"`);
  if (e.metadata) for (const k of Object.keys(e.metadata)) if (!ALLOWLIST_META.has(k)) no(`metadata has non-allowlisted key "${k}"`);
}
ok('event + metadata keys all allowlisted');

// 4. the ALLOWED content-free projections DID make it through (proves we extract, not just drop)
if (snapshot.primary_model === 'claude-opus-4-8') ok('kept: model'); else no('missing model');
if (snapshot.current_file === '/Users/x/proj/koni-erp/src/auth.ts') ok('kept: current_file (path only)'); else no('missing current_file');
if (snapshot.task_summary === 'Implement auth refactor') ok('kept: task_summary = the Claude summary, NOT the raw prompt'); else no(`task_summary wrong: ${snapshot.task_summary}`);
if ((snapshot.recent_tools || []).join(',') === 'Edit,Bash') ok('kept: recent_tools (names only)'); else no(`recent_tools wrong: ${snapshot.recent_tools}`);
if (snapshot.git_branch === 'main') ok('kept: git_branch'); else no('missing git_branch');
if (snapshot.project_name === 'koni-erp') ok('kept: project_name (basename of cwd)'); else no(`project_name wrong: ${snapshot.project_name}`);
if (snapshot.input_tokens === 2000 && snapshot.output_tokens === 600) ok('kept: absolute token totals'); else no(`totals wrong: ${snapshot.input_tokens}/${snapshot.output_tokens}`);

// 5. FALLBACK PATH — with NO summary line, task_summary comes from the first prompt (the
// one allowed prompt-derived field). Prove the CAP actually protects: a prompt whose secret
// sits AFTER char 300 must be truncated so the tail never reaches the wire, and the result
// must be single-line. (This exercises the path the main fixture's summary line skips.)
const longPrompt = 'x'.repeat(300) + 'SECRET_TAIL_AFTER_CAP';
const fbLines = parseNewLines([
  JSON.stringify({ type: 'user', message: { content: longPrompt } }),
  JSON.stringify({ type: 'assistant', message: { model: 'claude-opus-4-8', usage: { input_tokens: 10, output_tokens: 5 } } }),
].join('\n'));
const fb = buildBatch({ sessionId: 'fb-sid', prev: null, lines: fbLines, hookEvent: 'SessionStart', seqStart: 0, now: '2026-07-01T00:00:00Z' });
if (fb.snapshot.task_summary === 'x'.repeat(300)) ok('fallback: task_summary = first prompt capped to 300'); else no(`fallback cap wrong (len ${fb.snapshot.task_summary.length})`);
if (!JSON.stringify(fb).includes('SECRET_TAIL_AFTER_CAP')) ok('fallback: secret PAST the 300-char cap is truncated away'); else no('fallback: tail secret leaked past the cap');
if (!/\n/.test(fb.snapshot.task_summary)) ok('fallback: task_summary is single-line'); else no('fallback: newline in task_summary');

console.log(`\nleak-test: ${PASS} passed, ${FAIL} failed`);
process.exit(FAIL === 0 ? 0 : 1);
