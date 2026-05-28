import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { parseMarkdown, stringifyMarkdown } from './markdown/ast.ts';
import type { Doc } from './types.ts';

const QUOTED_VALUE_RE = /^(\w[\w-]*):\s*(["']).*\2\s*$/;

function detectQuotedKeys(raw: string): Map<string, '"' | "'"> {
  const out = new Map<string, '"' | "'">();
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return out;
  const fmBody = m[1] ?? '';
  for (const line of fmBody.split('\n')) {
    const km = line.match(QUOTED_VALUE_RE);
    if (km) out.set(km[1]!, km[2] as '"' | "'");
  }
  return out;
}

export function readDoc(path: string): Doc {
  const raw = readFileSync(path, 'utf-8');
  return parseDoc(raw, path);
}

export function parseDoc(raw: string, path: string): Doc {
  const parsed = matter(raw);
  const body = parsed.content;
  const frontmatterQuoting = detectQuotedKeys(raw);
  return {
    path,
    frontmatter: { ...parsed.data },
    body,
    ast: parseMarkdown(body),
    raw,
    frontmatterQuoting,
  };
}

export function serializeDoc(doc: Doc): string {
  const newBody = stringifyMarkdown(doc.ast);
  const out = matter.stringify(newBody, doc.frontmatter);
  if (!doc.frontmatterQuoting || doc.frontmatterQuoting.size === 0) return out;
  return reapplyQuoting(out, doc.frontmatterQuoting);
}

/**
 * Post-process gray-matter's output: for each key in `quotedKeys`, wrap its
 * value in the recorded quote character if gray-matter emitted it bare. Only
 * touches the frontmatter block between the first two `---` lines.
 */
function reapplyQuoting(serialized: string, quotedKeys: Map<string, '"' | "'">): string {
  const m = serialized.match(/^(---\n)([\s\S]*?)(\n---\n?)([\s\S]*)$/);
  if (!m) return serialized;
  const [, open, fmBody, close, rest] = m;
  const patched = (fmBody ?? '').split('\n').map(line => {
    const km = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!km) return line;
    const key = km[1]!;
    const value = km[2] ?? '';
    const q = quotedKeys.get(key);
    if (!q) return line;
    if (/^(['"]).*\1$/.test(value)) return line;
    if (value === '' || value === 'null' || value === '~') return line;
    // Skip YAML block-scalar indicators (`>`, `>-`, `>+`, `|`, `|-`, `|+`)
    // emitted by js-yaml when a long string is dumped in folded/literal style.
    // Quoting these would turn the indicator into a literal string and orphan
    // the continuation lines below.
    if (/^[>|][-+]?$/.test(value)) return line;
    const escaped = q === '"' ? value.replace(/"/g, '\\"') : value.replace(/'/g, "''");
    return `${key}: ${q}${escaped}${q}`;
  }).join('\n');
  return `${open}${patched}${close}${rest}`;
}

export function writeDoc(path: string, doc: Doc): void {
  writeFileSync(path, serializeDoc(doc), 'utf-8');
}

export function updateFrontmatter(doc: Doc, partial: Record<string, unknown>): Doc {
  return { ...doc, frontmatter: { ...doc.frontmatter, ...partial } };
}
