import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { parseMarkdown, stringifyMarkdown } from './markdown/ast.ts';
import type { Doc } from './types.ts';

const QUOTED_VALUE_RE = /^(\w[\w-]*):\s*(["']).*\2\s*$/;

/**
 * gray-matter forwards its options object verbatim to the YAML engine's
 * `safeDump` — its own JSDoc says "Options to pass to gray-matter and
 * [js-yaml]" — but `GrayMatterOption` types only gray-matter's own keys, so the
 * js-yaml half needs an assertion. Assert one narrow object, never `any` on the
 * call, so a typo in a gray-matter key is still caught.
 */
type MatterStringifyOptions = NonNullable<Parameters<typeof matter.stringify>[2]>;

/**
 * `lineWidth: -1` = never wrap. js-yaml's default is 80, so any plain scalar
 * longer than that is re-emitted as a folded block (`title: >-` plus indented
 * continuation lines), which line-based external readers render literally as
 * `>-`. A no-op readDoc → writeDoc round-trip was enough to trigger it, so
 * `sync` silently folded titles nobody had asked it to touch.
 *
 * Quoting is unaffected: js-yaml quotes on *content* (a `:`, a leading `>`),
 * not on width — a long value that needs quotes still gets them, on one line.
 * A value carrying real newlines is still emitted as a `|` literal block; see
 * `reapplyQuoting`.
 */
const SINGLE_LINE_YAML = { lineWidth: -1 } as MatterStringifyOptions;

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
  const out = matter.stringify(newBody, doc.frontmatter, SINGLE_LINE_YAML);
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
    // Skip YAML block-scalar indicators (`>`, `>-`, `>+`, `|`, `|-`, `|+`).
    // Quoting one would turn the indicator into a literal string and orphan the
    // continuation lines below it.
    //
    // Since SINGLE_LINE_YAML, the folded (`>`) forms no longer reach here —
    // width-folding is off at the source. The literal (`|`) forms still do, and
    // must: js-yaml emits `|` for a value carrying real newlines at any line
    // width, and that is the correct encoding. Do NOT "fix" this branch by
    // collapsing the block — that would destroy the newlines it is protecting.
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
