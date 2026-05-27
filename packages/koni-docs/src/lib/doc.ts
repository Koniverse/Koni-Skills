import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { parseMarkdown, stringifyMarkdown } from './markdown/ast.ts';
import type { Doc } from './types.ts';

export function readDoc(path: string): Doc {
  const raw = readFileSync(path, 'utf-8');
  return parseDoc(raw, path);
}

export function parseDoc(raw: string, path: string): Doc {
  const parsed = matter(raw);
  const body = parsed.content;
  return {
    path,
    frontmatter: { ...parsed.data },
    body,
    ast: parseMarkdown(body),
    raw,
  };
}

export function serializeDoc(doc: Doc): string {
  // Re-stringify AST → body to capture any AST edits.
  const newBody = stringifyMarkdown(doc.ast);
  // gray-matter.stringify handles the frontmatter block.
  return matter.stringify(newBody, doc.frontmatter);
}

export function writeDoc(path: string, doc: Doc): void {
  writeFileSync(path, serializeDoc(doc), 'utf-8');
}

export function updateFrontmatter(doc: Doc, partial: Record<string, unknown>): Doc {
  return { ...doc, frontmatter: { ...doc.frontmatter, ...partial } };
}
