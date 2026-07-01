// End-to-end I/O test for report.mjs in HOOK mode: a hook fire reads new transcript
// lines, projects them, and appends a content-free batch to the queue; offsets advance so
// a second fire does NOT double-count; a partial trailing line is not consumed until
// complete. Runs against a temp KONI_AGENT_OPS_HOME with no config (so the detached drain
// exits quietly — nothing is POSTed).
import { mkdtempSync, writeFileSync, appendFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORT = join(HERE, '..', 'report.mjs');
let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log('ok   - ' + m); };
const no = (m) => { FAIL++; console.log('FAIL - ' + m); };
const eq = (a, b, m) => (a === b ? ok(m) : no(`${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`));

const home = mkdtempSync(join(tmpdir(), 'kam-'));
const transcript = join(home, 'sess-1.jsonl');
const env = { ...process.env, KONI_AGENT_OPS_HOME: home };
// no KONI_AGENT_OPS_URL/TOKEN → drain is a quiet no-op (nothing leaves the box)
delete env.KONI_AGENT_OPS_URL; delete env.KONI_AGENT_OPS_TOKEN;

function fire(hookEvent) {
  const payload = JSON.stringify({ session_id: 'sess-1', transcript_path: transcript, hook_event_name: hookEvent, cwd: '/w/proj' });
  const r = spawnSync(process.execPath, [REPORT], { input: payload, env, encoding: 'utf8', timeout: 15000 });
  return r;
}
const queue = () => (existsSync(join(home, 'queue.jsonl')) ? readFileSync(join(home, 'queue.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const offsets = () => JSON.parse(readFileSync(join(home, 'offsets.json'), 'utf8'));

// fire 1: header + one assistant turn
writeFileSync(transcript, [
  '{"type":"summary","summary":"E2E task","cwd":"/w/proj","gitBranch":"main"}',
  '{"type":"assistant","message":{"model":"claude-opus-4-8","usage":{"input_tokens":100,"output_tokens":40},"content":[{"type":"tool_use","name":"Read","input":{"file_path":"/w/proj/a.ts"}}]}}',
  '',
].join('\n'));
const r1 = fire('SessionStart');
eq(r1.status, 0, 'fire1: reporter exits 0 (never blocks the hook)');
const q1 = queue();
eq(q1.length, 1, 'fire1: one batch enqueued');
eq(q1[0].session.input_tokens, 100, 'fire1: snapshot input=100');
eq(q1[0].session.task_summary, 'E2E task', 'fire1: task_summary from summary');
eq(q1[0].session.current_file, '/w/proj/a.ts', 'fire1: current_file path only');
eq(JSON.stringify(q1[0]).includes('a.ts') && !JSON.stringify(q1[0]).includes('file_path'), true, 'fire1: no raw tool input keys leak');
const off1 = offsets()['sess-1'];
eq(off1 > 0, true, 'fire1: offset advanced');

// fire 2 WITHOUT new lines → no double-count, no new usage batch
const r2 = fire('Stop');
eq(r2.status, 0, 'fire2: exits 0');
eq(offsets()['sess-1'], off1, 'fire2: offset unchanged (no new lines)');
const totalIn = queue().reduce((s, b) => Math.max(s, b.session.input_tokens), 0);
eq(totalIn, 100, 'fire2: no double-count (snapshot still 100)');

// fire 3: append a NEW assistant turn → delta accrues to 130
appendFileSync(transcript, '{"type":"assistant","message":{"model":"claude-opus-4-8","usage":{"input_tokens":30,"output_tokens":10}}}\n');
fire('PostToolUse');
const latest = queue().slice(-1)[0];
eq(latest.session.input_tokens, 130, 'fire3: new lines accrue (100+30)');
eq(offsets()['sess-1'] > off1, true, 'fire3: offset advanced past fire1');

// partial trailing line must NOT be consumed until it ends in newline
const offBefore = offsets()['sess-1'];
appendFileSync(transcript, '{"type":"assistant","message":{"model":"claude-opus-4-8","usage":{"input_tokens":5'); // no newline, incomplete
fire('PostToolUse');
eq(offsets()['sess-1'], offBefore, 'partial line: offset held (not consumed until newline)');

console.log(`\nreporter-io-test: ${PASS} passed, ${FAIL} failed`);
process.exit(FAIL === 0 ? 0 : 1);
