import type { Root, Heading, Content } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { parseMarkdown, stringifyMarkdown } from './ast.ts';
import type { Doc } from '../types.ts';

export interface SectionMatch {
  heading: Heading;
  /** Index of the heading node in root.children. */
  headingIndex: number;
  /** Slice of root.children that belongs to this section (excluding the heading). */
  body: Content[];
  /** Index in root.children where the section ends (exclusive). */
  endIndex: number;
}

function findSectionNodes(ast: Root, heading: string, level?: number): SectionMatch | null {
  for (let i = 0; i < ast.children.length; i++) {
    const node = ast.children[i];
    if (node?.type !== 'heading') continue;
    if (level !== undefined && node.depth !== level) continue;
    if (nodeToString(node) !== heading) continue;
    const startDepth = node.depth;
    let end = ast.children.length;
    for (let j = i + 1; j < ast.children.length; j++) {
      const next = ast.children[j];
      if (next?.type === 'heading' && next.depth <= startDepth) {
        end = j;
        break;
      }
    }
    return {
      heading: node,
      headingIndex: i,
      body: ast.children.slice(i + 1, end) as Content[],
      endIndex: end,
    };
  }
  return null;
}

export function findSection(doc: Doc, heading: string, level?: number): SectionMatch | null {
  return findSectionNodes(doc.ast, heading, level);
}

export function getSectionText(doc: Doc, heading: string): string {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return '';
  const partialAst: Root = { type: 'root', children: match.body as any };
  return stringifyMarkdown(partialAst);
}

export function replaceSection(doc: Doc, heading: string, newContent: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const newAst = parseMarkdown(newContent);
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.headingIndex + 1),
      ...(newAst.children as Content[]),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function appendToSection(doc: Doc, heading: string, content: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const newAst = parseMarkdown(content);
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.endIndex),
      ...(newAst.children as Content[]),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function removeSection(doc: Doc, heading: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.headingIndex),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function replaceSectionWithTable(doc: Doc, heading: string, tableMarkdown: string): Doc {
  // Convenience wrapper — tableMarkdown is a valid GFM table source.
  return replaceSection(doc, heading, tableMarkdown);
}

/**
 * Find the first heading whose rendered text starts with `prefix`. Generic
 * prefix-based section lookup — e.g. `## A.` matches any H2 starting with
 * "A.". PRD-specific call sites should prefer `findSectionByLabel`, which
 * matches by clean label and falls back to a legacy numeric prefix for
 * backwards-compat with older PRDs that still carry "## 8. …" headings.
 */
export function findSectionStartingWith(doc: Doc, prefix: string): SectionMatch | null {
  const m = prefix.match(/^(#+)\s+(.*)$/);
  if (!m) return null;
  const depth = m[1]!.length;
  const textPrefix = m[2]!.trim();
  for (let i = 0; i < doc.ast.children.length; i++) {
    const node = doc.ast.children[i];
    if (node?.type !== 'heading') continue;
    if (node.depth !== depth) continue;
    const text = nodeToString(node).trim();
    if (!text.startsWith(textPrefix)) continue;
    const startDepth = node.depth;
    let end = doc.ast.children.length;
    for (let j = i + 1; j < doc.ast.children.length; j++) {
      const next = doc.ast.children[j];
      if (next?.type === 'heading' && next.depth <= startDepth) {
        end = j;
        break;
      }
    }
    return {
      heading: node,
      headingIndex: i,
      body: doc.ast.children.slice(i + 1, end) as Content[],
      endIndex: end,
    };
  }
  return null;
}

/**
 * Find a section by its clean label (e.g. "Functional Requirements"). If no
 * exact match is found and `legacyNumber` is provided, fall back to a numeric
 * prefix lookup (`## <N>.`) so PRDs that still carry numbered headings keep
 * working. Tolerates a trailing parenthetical on legacy headings — e.g.
 * "## 8. Functional Requirements (FR)" matches when `legacyNumber: 8`.
 */
export function findSectionByLabel(
  doc: Doc,
  label: string,
  opts: { level?: number; legacyNumber?: number } = {},
): SectionMatch | null {
  const level = opts.level ?? 2;
  const exact = findSectionNodes(doc.ast, label, level);
  if (exact) return exact;
  if (opts.legacyNumber === undefined) return null;
  return findSectionStartingWith(doc, `${'#'.repeat(level)} ${opts.legacyNumber}.`);
}
