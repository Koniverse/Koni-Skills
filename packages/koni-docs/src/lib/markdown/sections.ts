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
