#!/usr/bin/env node
// koni-agent-report — the reporter. A Claude Code hook entrypoint + a detached drain.
// It NEVER blocks the editor: on a hook it reads only new transcript lines, projects
// them to the content-free allowlist (agent-report-core), appends to a local queue, and
// spawns a detached drain that POSTs to the ERP ingest API. Network never happens in the
// hook's own process. (handoff §2/§5/§6/§12)
//
// Modes:
//   (default, stdin = hook JSON)   one hook fire → enqueue + spawn drain, return immediately
//   --drain                        drain the queue → POST batches (run detached)
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, statSync, openSync, readSync, closeSync, renameSync, rmSync } from 'node:fs';
import { homedir, hostname, networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { request } from 'node:https';
import { request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';
import { buildBatch, parseNewLines } from './agent-report-core.mjs';

const HOME = homedir();
const DIR = process.env.KONI_AGENT_OPS_HOME || join(HOME, '.koni-agent-monitoring');
const OFFSETS = join(DIR, 'offsets.json');
const SESSIONS = join(DIR, 'sessions.json');
const QUEUE = join(DIR, 'queue.jsonl');
const LOCK = join(DIR, 'drain.lock');
const WARN = join(DIR, 'WARN-token-invalid.txt');
const MAX_EVENTS = 500;          // per POST batch (handoff §3)
const MAX_QUEUE_BYTES = 5_000_000; // buffer cap — trim oldest beyond this (handoff §6)
const POST_TIMEOUT_MS = 8000;

const readJson = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return d; } };
const writeJsonAtomic = (p, o) => { const t = p + '.tmp'; writeFileSync(t, JSON.stringify(o)); renameSync(t, p); };

function loadConfig() {
  const cfg = {
    url: process.env.KONI_AGENT_OPS_URL || '', token: process.env.KONI_AGENT_OPS_TOKEN || '',
    account: process.env.KONI_AGENT_OPS_ACCOUNT || '',
  };
  const f = join(DIR, 'config.env');
  if (existsSync(f)) {
    for (const raw of readFileSync(f, 'utf8').split('\n')) {
      const line = raw.trim(); if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('='); if (i < 0) continue;
      const k = line.slice(0, i).trim(); const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (k === 'KONI_AGENT_OPS_URL' && !process.env.KONI_AGENT_OPS_URL) cfg.url = v;
      if (k === 'KONI_AGENT_OPS_TOKEN' && !process.env.KONI_AGENT_OPS_TOKEN) cfg.token = v;
      if (k === 'KONI_AGENT_OPS_ACCOUNT' && !process.env.KONI_AGENT_OPS_ACCOUNT) cfg.account = v;
    }
  }
  return cfg;
}

// Machine facts for the session snapshot (all optional; set once). host + local_ip come
// from the OS; account_email is the Anthropic identity — best-effort from config/env
// (KONI_AGENT_OPS_ACCOUNT), omitted if unknown (open item: auto-resolving the live login).
function localIp() {
  const ifs = networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const i of ifs[name] || []) if (i.family === 'IPv4' && !i.internal) return i.address;
  }
  return undefined;
}
function machineFacts(cfg) {
  return { host: hostname(), local_ip: localIp(), account_email: cfg.account || undefined };
}

// read transcript bytes [offset..EOF], but only CONSUME up to the last complete line so a
// partial (mid-write) trailing line is re-read next fire — no lost lines, no double-count.
function readNewLines(path, offset) {
  if (!path || !existsSync(path)) return { lines: [], nextOffset: offset };
  const size = statSync(path).size;
  let off = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  if (off > size) off = 0; // file truncated / rotated → restart
  if (off === size) return { lines: [], nextOffset: off };
  const len = size - off;
  const buf = Buffer.alloc(len);
  const fd = openSync(path, 'r');
  try { readSync(fd, buf, 0, len, off); } finally { closeSync(fd); }
  const text = buf.toString('utf8');
  const lastNl = text.lastIndexOf('\n');
  if (lastNl < 0) return { lines: [], nextOffset: off }; // no complete line yet
  const complete = text.slice(0, lastNl + 1);
  const consumed = Buffer.byteLength(complete, 'utf8');
  return { lines: parseNewLines(complete), nextOffset: off + consumed };
}

function onHook(payload) {
  const sessionId = payload.session_id || payload.sessionId;
  const transcript = payload.transcript_path || payload.transcriptPath;
  const hookEvent = payload.hook_event_name || payload.hookEventName || null;
  if (!sessionId) return; // nothing to do
  mkdirSync(DIR, { recursive: true });

  const offsets = readJson(OFFSETS, {});
  const sessions = readJson(SESSIONS, {});
  const { lines, nextOffset } = readNewLines(transcript, offsets[sessionId] ?? 0);

  const prevWrap = sessions[sessionId] || null;
  const prev = prevWrap ? prevWrap.snapshot : null;
  const seqStart = prevWrap ? (prevWrap.seq || 0) : 0;
  const facts = machineFacts(loadConfig());
  const { snapshot, events, nextSeq } = buildBatch({ sessionId, prev, lines, hookEvent, seqStart, now: new Date().toISOString(), facts });

  offsets[sessionId] = nextOffset;
  sessions[sessionId] = { snapshot, seq: nextSeq };
  writeJsonAtomic(OFFSETS, offsets);
  writeJsonAtomic(SESSIONS, sessions);

  if (events.length || hookEvent === 'SessionEnd') {
    appendFileSync(QUEUE, JSON.stringify({ session_id: sessionId, session: snapshot, events }) + '\n');
  }
  // fire-and-forget drain: detached child, no await, hook returns now.
  try {
    const self = fileURLToPath(import.meta.url);
    const child = spawn(process.execPath, [self, '--drain'], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch { /* drain will also run on the next hook; never block */ }
}

const LOCK_TTL_MS = 600_000; // 10 min — steal a lock left by a killed drain so delivery can't wedge
function acquireLock() {
  try { mkdirSync(LOCK); return true; } catch { /* held */ }
  try { if (Date.now() - statSync(LOCK).mtimeMs > LOCK_TTL_MS) { rmSync(LOCK, { recursive: true, force: true }); mkdirSync(LOCK); return true; } } catch {}
  return false;
}
function releaseLock() { try { rmSync(LOCK, { recursive: true, force: true }); } catch {} }

async function drain() {
  if (!existsSync(QUEUE)) return;
  if (!acquireLock()) return; // another drain is running
  try {
    const cfg = loadConfig();
    if (!cfg.url || !cfg.token) return; // not configured → leave queue, exit quietly

    // buffer cap: trim oldest lines if the queue got huge (ERP down a long time)
    let rawQ = readFileSync(QUEUE, 'utf8');
    if (Buffer.byteLength(rawQ, 'utf8') > MAX_QUEUE_BYTES) {
      const kept = rawQ.split('\n').filter(Boolean);
      const dropped = Math.floor(kept.length / 2);
      rawQ = kept.slice(dropped).join('\n') + '\n'; // drop oldest half
      writeFileSync(QUEUE, rawQ);
      // record the gap so a silent under-count is visible (spec §6: "log that a gap occurred")
      try { appendFileSync(join(DIR, 'gaps.log'), `${new Date().toISOString()} trimmed ${dropped} oldest queued item(s) at buffer cap\n`); } catch {}
    }
    const items = rawQ.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    if (!items.length) { try { rmSync(QUEUE); } catch {} return; }

    // group by session: latest snapshot wins (last-write-wins), events concatenated
    const bySession = new Map();
    for (const it of items) {
      const g = bySession.get(it.session_id) || { session: it.session, events: [] };
      g.session = it.session;                 // keep the newest absolute snapshot
      if (Array.isArray(it.events)) g.events.push(...it.events);
      bySession.set(it.session_id, g);
    }

    const failed = []; // items to keep for retry
    let retryAfterMs = 0;
    for (const [, g] of bySession) {
      // chunk events ≤ MAX_EVENTS; every chunk carries the same latest session snapshot
      const chunks = g.events.length ? chunk(g.events, MAX_EVENTS) : [[]];
      for (const evs of chunks) {
        const res = await postBatch(cfg, { session: g.session, events: evs });
        const keep = { session_id: g.session.session_id, session: g.session, events: evs };
        if (res.status >= 200 && res.status < 300) { if (existsSync(WARN)) { try { rmSync(WARN); } catch {} } continue; } // accepted → drop
        if (res.status === 401) {
          writeFileSync(WARN, 'Koni-Agent-Monitoring: token invalid or revoked (401). Re-issue in the ERP: Agent Ops → Settings → Tokens, then update ~/.koni-agent-monitoring/config.env\n');
          failed.push(keep); rewriteQueue(failed); return; // stop; keep everything until fixed
        }
        if (res.status === 400) {
          // invalid batch — retrying will never succeed (stray key / bad datetime). DROP it
          // and record why, so one poison batch can't head-of-line the queue forever (spec §Responses).
          try { appendFileSync(join(DIR, 'gaps.log'), `${new Date().toISOString()} dropped a 400 (invalid) batch for ${g.session.session_id}; check the projection against the ingest schema\n`); } catch {}
          continue;
        }
        if (res.status > 400 && res.status < 500 && res.status !== 429) {
          // other 4xx (e.g. 403/404) — not transient; drop rather than loop forever
          try { appendFileSync(join(DIR, 'gaps.log'), `${new Date().toISOString()} dropped a ${res.status} batch for ${g.session.session_id}\n`); } catch {}
          continue;
        }
        // 429 / 5xx / network → keep for retry with backoff (429 may carry Retry-After)
        if (res.status === 429 && res.retryAfterMs) retryAfterMs = Math.max(retryAfterMs, res.retryAfterMs);
        failed.push(keep);
      }
    }
    rewriteQueue(failed);
    // if anything failed, schedule a backoff retry (detached) — honor Retry-After if present
    if (failed.length) scheduleRetry(retryAfterMs);
  } finally {
    releaseLock();
  }
}

function rewriteQueue(items) {
  if (!items.length) { try { rmSync(QUEUE); } catch {} return; }
  writeFileSync(QUEUE, items.map((i) => JSON.stringify(i)).join('\n') + '\n');
}

function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }

function postBatch(cfg, body) {
  return new Promise((resolve) => {
    let u; try { u = new URL(cfg.url); } catch { return resolve({ status: 0 }); }
    const data = Buffer.from(JSON.stringify(body));
    const lib = u.protocol === 'http:' ? httpRequest : request;
    const req = lib(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length, Authorization: `Bearer ${cfg.token}` },
      timeout: POST_TIMEOUT_MS,
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        let retryAfterMs = 0;
        const ra = res.headers && res.headers['retry-after'];
        if (ra) { const s = Number(ra); if (Number.isFinite(s)) retryAfterMs = Math.min(s * 1000, 300_000); } // seconds form; cap 5min
        resolve({ status: res.statusCode || 0, retryAfterMs });
      });
    });
    req.on('error', () => resolve({ status: 0 }));      // network error → transient
    req.on('timeout', () => { req.destroy(); resolve({ status: 0 }); });
    req.end(data);
  });
}

// backoff via a detached self re-invocation. Honor a server Retry-After (429) when given;
// otherwise exponential w/ jitter, capped ~5min.
function scheduleRetry(retryAfterMs = 0) {
  try {
    const base = 2000, cap = 300_000;
    const attempt = readJson(join(DIR, 'retry.json'), { n: 0 }).n || 0;
    const backoff = Math.min(cap, base * 2 ** attempt) * (0.5 + Math.random());
    const delay = retryAfterMs > 0 ? Math.min(retryAfterMs, cap) : backoff; // server's Retry-After wins
    writeJsonAtomic(join(DIR, 'retry.json'), { n: Math.min(attempt + 1, 8) });
    const self = fileURLToPath(import.meta.url);
    const child = spawn('/bin/sh', ['-c', `sleep ${(delay / 1000).toFixed(1)}; "${process.execPath}" "${self}" --drain`], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch { /* next hook fire will drain anyway */ }
}

// ── entry ──
async function main() {
  if (process.argv.includes('--drain')) { await drain(); return; }
  // hook mode: read the hook JSON from stdin (Claude Code passes it there)
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { raw = ''; }
  let payload = {};
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = {}; }
  try { onHook(payload); } catch { /* never fail the hook */ }
  // reset backoff counter on a successful enqueue path
  try { writeJsonAtomic(join(DIR, 'retry.json'), { n: 0 }); } catch {}
  process.exit(0);
}
main();
