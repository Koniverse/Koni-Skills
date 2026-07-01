// Unit tests for agent-report-core (the pure core): cost math, projection, offset/
// no-double-count, idempotent seq, task_summary cap, machine facts, and the
// defense-in-depth hardening (unknown-model/non-numeric → 0, tool-name cap, nested-blob
// drop). (handoff §12–§14; grading D2/D3.)
import { costUsd, priceFor, projectLine, buildBatch, capTaskSummary, parseNewLines } from '../agent-report-core.mjs';

let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log('ok   - ' + m); };
const no = (m) => { FAIL++; console.log('FAIL - ' + m); };
const eq = (a, b, m) => (a === b ? ok(m) : no(`${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`));

// ── pricing / cost ──
eq(costUsd({ input_tokens: 1_000_000 }, 'claude-opus-4-8'), 15, 'cost: 1M opus input = $15');
eq(costUsd({ output_tokens: 1_000_000 }, 'sonnet'), 15, 'cost: 1M sonnet output = $15');
eq(costUsd({ cache_read_tokens: 1_000_000 }, 'haiku'), 0.1, 'cost: 1M haiku cache-read = $0.10');
eq(costUsd({ input_tokens: 1_000_000 }, 'gpt-what'), 0, 'cost: unknown model → 0 (never throws)');
eq(costUsd({ input_tokens: 'abc', output_tokens: {} }, 'opus'), 0, 'cost: non-numeric fields → 0, never NaN');
eq(priceFor('CLAUDE-OPUS-4-8') && priceFor('CLAUDE-OPUS-4-8').input, 15, 'priceFor: case-insensitive substring match');

// ── projection: content-free extraction ──
const a = projectLine({ type: 'assistant', message: { model: 'claude-opus-4-8', usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 2, cache_creation_input_tokens: 1 }, content: [{ type: 'text', text: 'LEAK' }, { type: 'tool_use', name: 'Edit', input: { file_path: '/p/f.ts', old_string: 'LEAK2' } }] } });
eq(a.model, 'claude-opus-4-8', 'project: model');
eq(a.usage.input_tokens, 10, 'project: input tokens');
eq(a.usage.cache_creation_tokens, 1, 'project: cache-creation mapped from cache_creation_input_tokens');
eq(a.toolNames.join(','), 'Edit', 'project: tool name only');
eq(a.currentFile, '/p/f.ts', 'project: current_file from Edit input.file_path (path only)');
eq(JSON.stringify(a).includes('LEAK'), false, 'project: no text/input content leaks into the projection');

const u = projectLine({ type: 'user', message: { content: [{ type: 'tool_result', content: 'RESULT_LEAK' }] } });
eq(JSON.stringify(u).includes('RESULT_LEAK'), false, 'project: user tool_result content ignored');

// tool name >80 capped (contract: recent_tools/tool_name ≤80)
const tn = projectLine({ type: 'assistant', message: { model: 'opus', content: [{ type: 'tool_use', name: 'X'.repeat(200) }] } });
eq(tn.toolNames[0].length, 80, 'project: tool name capped ≤80');

// ── task_summary cap ──
eq(capTaskSummary('  multi\nline   prompt  '), 'multi line prompt', 'cap: collapses whitespace, trims');
eq(capTaskSummary('x'.repeat(500)).length, 300, 'cap: truncates to 300');

// ── machine facts (set once) + started_at at SessionStart ──
const bf = buildBatch({ sessionId: 'sf', lines: [], hookEvent: 'SessionStart', now: 't0', facts: { host: 'mac-1', local_ip: '192.168.1.9', account_email: 'me@koni.ai' } });
eq(bf.snapshot.host, 'mac-1', 'facts: host set');
eq(bf.snapshot.local_ip, '192.168.1.9', 'facts: local_ip set');
eq(bf.snapshot.account_email, 'me@koni.ai', 'facts: account_email set');
eq(bf.snapshot.started_at, 't0', 'facts: started_at stamped at SessionStart');

// ── defense-in-depth: sanitizeSession drops stray nested objects / non-string array items ──
const bn = buildBatch({ sessionId: 'sn', prev: { host: { SECRET_NESTED: 'x' }, models: ['opus', { x: 'BADMODEL' }] }, lines: [], hookEvent: null });
eq(JSON.stringify(bn.snapshot).includes('SECRET_NESTED'), false, 'sanitize: stray nested object dropped from a session leaf');
eq(JSON.stringify(bn.snapshot).includes('BADMODEL'), false, 'sanitize: non-string array item filtered');

// ── offset / no double-count across two hook fires ──
const raw1 = '{"type":"summary","summary":"Task A","cwd":"/w/proj","gitBranch":"dev"}\n{"type":"assistant","message":{"model":"claude-opus-4-8","usage":{"input_tokens":100,"output_tokens":50}}}';
const b1 = buildBatch({ sessionId: 's1', prev: null, lines: parseNewLines(raw1), hookEvent: 'SessionStart', seqStart: 0, now: 't1' });
eq(b1.snapshot.input_tokens, 100, 'fire1: input=100');
eq(b1.snapshot.task_summary, 'Task A', 'fire1: task_summary from summary');
eq(b1.snapshot.project_name, 'proj', 'fire1: project_name basename');
const raw2 = '{"type":"assistant","message":{"model":"claude-opus-4-8","usage":{"input_tokens":30,"output_tokens":20}}}';
const b2 = buildBatch({ sessionId: 's1', prev: b1.snapshot, lines: parseNewLines(raw2), hookEvent: 'PostToolUse', seqStart: b1.nextSeq, now: 't2' });
eq(b2.snapshot.input_tokens, 130, 'fire2: absolute total accumulates (100+30, no double-count)');
eq(b2.snapshot.output_tokens, 70, 'fire2: output accumulates (50+20)');
eq(b2.snapshot.task_summary, 'Task A', 'fire2: task_summary set once (not overwritten)');

// ── seq monotonic + never reused across fires ──
const seqs1 = b1.events.map((e) => e.seq);
const seqs2 = b2.events.map((e) => e.seq);
eq(Math.min(...seqs2) > Math.max(...seqs1), true, 'seq: fire2 seqs strictly after fire1 (monotonic, no reuse)');
eq(b1.events[0].event_type, 'session_start', 'fire1: emits session_start');
eq(b1.events.some((e) => e.event_type === 'usage_snapshot'), true, 'fire1: emits usage_snapshot on token delta');

// ── per-event token/cost are DELTAS, session totals are ABSOLUTE ──
const snap = b2.events.find((e) => e.event_type === 'usage_snapshot');
eq(snap.input_tokens, 30, 'event: usage_snapshot carries the DELTA (30), not the absolute');
eq(b2.snapshot.cost_usd > 0, true, 'snapshot: absolute cost computed');

// ── session_end ──
const be = buildBatch({ sessionId: 's1', prev: b2.snapshot, lines: [], hookEvent: 'SessionEnd', seqStart: b2.nextSeq, now: 't3' });
eq(be.snapshot.status, 'ended', 'end: status ended');
eq(be.snapshot.ended_at, 't3', 'end: ended_at stamped');
eq(be.events.some((e) => e.event_type === 'session_end'), true, 'end: emits session_end');

console.log(`\ncore-test: ${PASS} passed, ${FAIL} failed`);
process.exit(FAIL === 0 ? 0 : 1);
