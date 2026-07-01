// agent-report-core — the PURE, privacy-critical heart of Koni-Agent-Monitoring.
// No I/O, no network, no globals — every function here is deterministic and testable.
// It turns Claude Code transcript lines into the CONTENT-FREE ingest projection and
// enforces the strict allowlist that is the privacy boundary (handoff §3/§4/§13/§14).
//
// INVARIANT: nothing prompt/response/code/tool-IO ever leaves this module except the
// single capped `task_summary` (≤300 chars, single line). enforceAllowlist() is the
// last line of defence — the final batch is filtered to the allowlist keys regardless
// of what upstream produced.

// ── §14 pricing (USD per 1e6 tokens), matched by family substring, case-insensitive ──
export const PRICING = {
  opus:   { input: 15, output: 75, cacheRead: 1.5,  cacheWrite: 18.75 },
  sonnet: { input: 3,  output: 15, cacheRead: 0.3,  cacheWrite: 3.75 },
  haiku:  { input: 1,  output: 5,  cacheRead: 0.1,  cacheWrite: 1.25 },
};

export function priceFor(model) {
  const m = String(model || '').toLowerCase();
  for (const family of Object.keys(PRICING)) if (m.includes(family)) return PRICING[family];
  return null; // unknown → caller treats cost as 0 (and may log the model)
}

// cost of a token bundle for one model. Unknown model → 0 (never throws — cost must
// never crash the reporter, handoff §14).
export function costUsd(usage = {}, model) {
  const p = priceFor(model);
  if (!p) return 0;
  // coerce EVERY field via num() — a non-numeric token count must never yield NaN (which
  // would serialize as null and fail the strict schema with 400). Exported-API safety.
  const inT = num(usage.input_tokens), outT = num(usage.output_tokens);
  const cR = num(usage.cache_read_tokens), cC = num(usage.cache_creation_tokens);
  const c = (inT / 1e6) * p.input + (outT / 1e6) * p.output + (cR / 1e6) * p.cacheRead + (cC / 1e6) * p.cacheWrite;
  return Math.round(c * 1e6) / 1e6; // 6dp, avoid float noise
}

// ── the strict allowlists (handoff §3/§4). Any key outside these is a privacy leak. ──
export const ALLOWLIST_SESSION = new Set([
  'session_id', 'host', 'project_path', 'project_name', 'git_branch',
  'models', 'primary_model', 'started_at', 'ended_at', 'status',
  'local_ip', 'account_email', 'task_summary', 'current_file', 'recent_tools',
  'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_creation_tokens',
  'total_tokens', 'cost_usd',
]);
export const ALLOWLIST_EVENT = new Set([
  'seq', 'event_type', 'model',
  'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_creation_tokens',
  'cost_usd', 'tool_name', 'ts', 'metadata',
]);
export const ALLOWLIST_META = new Set(['cwd', 'project_name', 'git_branch', 'num_turns', 'duration_ms']);

const EVENT_TYPES = new Set(['session_start', 'tool_used', 'usage_snapshot', 'heartbeat', 'session_end']);
const TASK_SUMMARY_MAX = 300;
const RECENT_TOOLS_MAX = 10;

// keep an object to exactly the allowed keys (drop everything else). Defensive: even a
// bug upstream cannot smuggle a non-allowlisted field into the wire payload.
function pick(obj, allow) {
  const out = {};
  for (const k of Object.keys(obj || {})) if (allow.has(k)) out[k] = obj[k];
  return out;
}

export function capTaskSummary(s) {
  if (typeof s !== 'string') return undefined;
  const oneLine = s.replace(/\s+/g, ' ').trim();
  if (!oneLine) return undefined;
  return oneLine.length > TASK_SUMMARY_MAX ? oneLine.slice(0, TASK_SUMMARY_MAX) : oneLine;
}

// Project ONE parsed transcript object → a content-free bag of scalars. NEVER returns
// prompt/response/message.content/tool input or output — only names, counts, paths,
// model, and a capped task-summary CANDIDATE. Unknown/garbage line → empty projection.
export function projectLine(obj) {
  const out = { toolNames: [] };
  if (!obj || typeof obj !== 'object') return out;
  const type = obj.type;

  if (type === 'assistant' && obj.message && typeof obj.message === 'object') {
    const msg = obj.message;
    if (typeof msg.model === 'string') out.model = msg.model;
    const u = msg.usage && typeof msg.usage === 'object' ? msg.usage : null;
    if (u) {
      out.usage = {
        input_tokens: num(u.input_tokens),
        output_tokens: num(u.output_tokens),
        cache_read_tokens: num(u.cache_read_input_tokens),
        cache_creation_tokens: num(u.cache_creation_input_tokens),
      };
    }
    // content[] may hold tool_use blocks — take the NAME only (never input/output).
    if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block && block.type === 'tool_use' && typeof block.name === 'string') {
          out.toolNames.push(block.name.slice(0, 80)); // contract: tool names ≤80 chars
          // an Edit/Write/Read tool_use MAY yield current_file (path only, never contents)
          const fp = block.input && typeof block.input.file_path === 'string' ? block.input.file_path : null;
          if (fp && /^(Edit|Write|Read|NotebookEdit)$/.test(block.name)) out.currentFile = fp.slice(0, 512);
        }
      }
    }
    return out;
  }

  if (type === 'user' && obj.message && typeof obj.message === 'object') {
    // ONLY a plain-text first prompt yields a task-summary candidate (capped). Array
    // content (tool_result etc.) is ignored entirely — never emitted.
    const c = obj.message.content;
    if (typeof c === 'string') out.taskSummaryCandidate = capTaskSummary(c);
    return out;
  }

  if (type === 'summary' || type === 'session' || obj.cwd || obj.gitBranch) {
    // header/summary line: cwd, gitBranch, a Claude-generated summary (preferred title)
    if (typeof obj.cwd === 'string') out.cwd = obj.cwd;
    if (typeof obj.gitBranch === 'string') out.gitBranch = obj.gitBranch;
    if (typeof obj.summary === 'string') out.summaryCandidate = capTaskSummary(obj.summary);
    return out;
  }
  return out;
}

function num(x) { const n = Number(x); return Number.isFinite(n) ? n : 0; }

// Fold new projected lines into the session snapshot + produce the per-hook events.
// Returns { snapshot, events } — both already allowlist-clean. `seqStart` is the next
// unused per-session seq; events use monotonic seqs from there.
export function buildBatch({ sessionId, prev = null, lines = [], hookEvent = null, seqStart = 0, now = null, facts = {} }) {
  if (!sessionId || typeof sessionId !== 'string') throw new Error('buildBatch: sessionId required');
  const snap = normalizeSnapshot(prev, sessionId);
  // machine facts (set ONCE): host / local_ip / account_email come from the reporter's OS
  // + auth resolution (report.mjs); started_at is stamped at SessionStart. All optional.
  if (typeof facts.host === 'string' && !snap.host) snap.host = facts.host.slice(0, 200);
  if (typeof facts.local_ip === 'string' && !snap.local_ip) snap.local_ip = facts.local_ip.slice(0, 200);
  if (typeof facts.account_email === 'string' && !snap.account_email) snap.account_email = facts.account_email.slice(0, 200);
  if (hookEvent === 'SessionStart' && !snap.started_at && now) snap.started_at = now;
  const projections = lines.map(projectLine);

  let dIn = 0, dOut = 0, dCacheR = 0, dCacheC = 0;
  const newTools = [];
  let sawUsage = false;
  for (const p of projections) {
    if (p.model) { snap.primary_model = p.model; if (!snap.models.includes(p.model)) snap.models.push(p.model); }
    if (p.usage) {
      sawUsage = true;
      dIn += p.usage.input_tokens; dOut += p.usage.output_tokens;
      dCacheR += p.usage.cache_read_tokens; dCacheC += p.usage.cache_creation_tokens;
    }
    for (const t of p.toolNames) newTools.push(t);
    if (p.currentFile) snap.current_file = p.currentFile;
    if (p.cwd && !snap.project_path) { snap.project_path = p.cwd; snap.project_name = basename(p.cwd); }
    if (p.gitBranch && !snap.git_branch) snap.git_branch = p.gitBranch;
    // task_summary is set ONCE (prefer a Claude summary; else the first prompt). Don't churn.
    if (!snap.task_summary) snap.task_summary = p.summaryCandidate || p.taskSummaryCandidate || snap.task_summary;
  }

  // absolute snapshot totals (recomputed cumulative — last-write-wins on the server)
  snap.input_tokens += dIn; snap.output_tokens += dOut;
  snap.cache_read_tokens += dCacheR; snap.cache_creation_tokens += dCacheC;
  snap.total_tokens = snap.input_tokens + snap.output_tokens + snap.cache_read_tokens + snap.cache_creation_tokens;
  snap.cost_usd = costUsd(snap, snap.primary_model);
  if (newTools.length) snap.recent_tools = [...snap.recent_tools, ...newTools].slice(-RECENT_TOOLS_MAX);
  if (Array.isArray(snap.models) && snap.models.length > 20) snap.models = snap.models.slice(-20);

  // ── events for THIS hook (per-event token/cost are DELTAS; §3/§12) ──
  let seq = Number.isInteger(seqStart) && seqStart >= 0 ? seqStart : 0;
  const events = [];
  const model = snap.primary_model;
  if (hookEvent === 'SessionStart') events.push(evt(seq++, 'session_start', { model, ts: now }));
  if (sawUsage && (dIn || dOut || dCacheR || dCacheC)) {
    events.push(evt(seq++, 'usage_snapshot', {
      model, ts: now,
      input_tokens: dIn, output_tokens: dOut, cache_read_tokens: dCacheR, cache_creation_tokens: dCacheC,
      cost_usd: costUsd({ input_tokens: dIn, output_tokens: dOut, cache_read_tokens: dCacheR, cache_creation_tokens: dCacheC }, model),
    }));
  }
  for (const t of newTools) events.push(evt(seq++, 'tool_used', { model, tool_name: t, ts: now }));
  if (hookEvent === 'SessionEnd') { snap.ended_at = now || snap.ended_at; snap.status = 'ended'; events.push(evt(seq++, 'session_end', { model, ts: now })); }

  return { snapshot: sanitizeSession(snap), events, nextSeq: seq };
}

// Final defence-in-depth layer for the session object: keep only allowlisted keys AND
// coerce leaves to scalars — arrays become string-only (capped), any stray nested object
// is dropped. Independent of projectLine's guards, so a nested blob cannot ride through.
const SESSION_STRING_ARRAYS = { models: 200, recent_tools: 80 };
function sanitizeSession(s) {
  const out = pick(s, ALLOWLIST_SESSION);
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (k in SESSION_STRING_ARRAYS) {
      out[k] = Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => x.slice(0, SESSION_STRING_ARRAYS[k])) : [];
    } else if (v !== null && typeof v === 'object') {
      delete out[k]; // no non-array object belongs in a session leaf — drop it
    }
  }
  return out;
}

function evt(seq, event_type, extra) {
  if (!EVENT_TYPES.has(event_type)) throw new Error(`buildBatch: bad event_type ${event_type}`);
  const e = { seq, event_type, ...extra };
  for (const k of Object.keys(e)) if (e[k] === undefined || e[k] === null) delete e[k];
  if (e.metadata) e.metadata = pick(e.metadata, ALLOWLIST_META);
  return pick(e, ALLOWLIST_EVENT);
}

function normalizeSnapshot(prev, sessionId) {
  const base = {
    session_id: sessionId, models: [], recent_tools: [],
    input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_creation_tokens: 0,
    total_tokens: 0, cost_usd: 0, status: 'active',
  };
  if (prev && typeof prev === 'object') {
    for (const k of Object.keys(prev)) if (ALLOWLIST_SESSION.has(k)) base[k] = prev[k];
    base.session_id = sessionId; // never let a stale/foreign id override
    base.models = Array.isArray(base.models) ? [...base.models] : [];
    base.recent_tools = Array.isArray(base.recent_tools) ? [...base.recent_tools] : [];
  }
  return base;
}

function basename(p) { const s = String(p).replace(/[/\\]+$/, ''); const i = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\')); return i >= 0 ? s.slice(i + 1) : s; }

// Read a transcript file's lines from a byte offset; return {lines:[], nextOffset}. The
// content-free projection happens in projectLine — this only splits JSONL. (I/O helper
// kept pure-ish: takes the raw text + offset so it is unit-testable without the fs.)
export function parseNewLines(rawFromOffset) {
  const lines = [];
  for (const raw of String(rawFromOffset).split('\n')) {
    const s = raw.trim();
    if (!s) continue;
    try { lines.push(JSON.parse(s)); } catch { /* skip a partial/corrupt line */ }
  }
  return lines;
}
