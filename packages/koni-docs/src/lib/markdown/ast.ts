import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

/** Shared parser: GFM-enabled (tables, task lists). Pure read. */
export function createParser() {
  return unified().use(remarkParse).use(remarkGfm);
}

/** Shared stringifier: GFM + stable bullet/emphasis output. */
export function createStringifier() {
  return unified()
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '*',
      strong: '*',
      fence: '`',
      fences: true,
      listItemIndent: 'one',
      rule: '-',
    })
    .use(remarkGfm);
}

export function parseMarkdown(body: string): Root {
  return createParser().parse(body) as Root;
}

export function stringifyMarkdown(ast: Root): string {
  return String(createStringifier().stringify(ast));
}
