import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'json', 'bash', 'yaml', 'markdown', 'css', 'html', 'sql', 'toml'],
    });
  }
  return highlighterInstance;
}

export interface DocMetadata {
  id?: string;
  title: string;
  epic?: string;
  status?: string;
  priority?: string;
  points?: number;
  sprint?: string;
  assignee?: string;
  version_shipped?: string;
  [key: string]: unknown;
}

export interface TocItem {
  text: string;
  id: string;
  level: number;
}

export interface DocContent {
  metadata: DocMetadata;
  html: string;
  toc: TocItem[];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isExternal(href: string): boolean {
  return /^([a-z]+:|\/\/|#)/i.test(href);
}

/**
 * Rewrite relative .md links so docs cross-reference cleanly.
 * Resolves the link against the current doc's directory, strips `.md`,
 * and outputs `/docs/<resolved>` (preserving `#anchor` and `?query`).
 */
function rewriteDocLink(href: string, currentSlug: string): string {
  if (!href || isExternal(href) || href.startsWith('mailto:')) return href;
  let hash = '';
  let query = '';
  const hashIdx = href.indexOf('#');
  if (hashIdx >= 0) { hash = href.slice(hashIdx); href = href.slice(0, hashIdx); }
  const queryIdx = href.indexOf('?');
  if (queryIdx >= 0) { query = href.slice(queryIdx); href = href.slice(0, queryIdx); }
  const lineMatch = href.match(/^(.*\.md):(\d+)$/i);
  if (lineMatch && lineMatch[1]) href = lineMatch[1];
  if (!href.toLowerCase().endsWith('.md')) return href + query + hash;
  const currentDir = path.posix.dirname(currentSlug);
  const cleanHref = href.replace(/^\.\//, '');
  const resolved = path.posix.normalize(
    cleanHref.startsWith('/') ? cleanHref.slice(1) : path.posix.join(currentDir, cleanHref),
  );
  const withoutMd = resolved.replace(/\.md$/i, '');
  return `/docs/${withoutMd}${query}${hash}`;
}

export async function renderDocFromPath(absolutePath: string, slug: string): Promise<DocContent> {
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const metadata: DocMetadata = { title: String(data.title ?? slug), ...data };

  const toc: TocItem[] = [];
  const shiki = await getHighlighter();
  const marked = new Marked();

  const renderer = {
    heading(text: string, level: number, raw: string) {
      const slugId = raw.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (level >= 2 && level <= 3) toc.push({ text: raw, id: slugId, level });
      return `<h${level} id="${slugId}">${text}</h${level}>`;
    },
    link(href: string, title: string | null | undefined, text: string) {
      const resolved = rewriteDocLink(href, slug);
      const external = isExternal(resolved) && !resolved.startsWith('/') && !resolved.startsWith('#');
      const attrs = [`href="${escapeHtml(resolved)}"`];
      if (title) attrs.push(`title="${escapeHtml(title)}"`);
      if (external) attrs.push('target="_blank"', 'rel="noopener noreferrer"');
      return `<a ${attrs.join(' ')}>${text}</a>`;
    },
    code(code: string, infostring: string | undefined) {
      const lang = (infostring || '').match(/\S*/)?.[0] || 'text';
      if (lang === 'mermaid') {
        return `<pre class="mermaid" data-mermaid-source="${escapeHtml(code)}">${escapeHtml(code)}</pre>`;
      }
      try {
        return shiki.codeToHtml(code, {
          lang: shiki.getLoadedLanguages().includes(lang) ? lang : 'text',
          theme: 'github-dark',
        });
      } catch {
        return `<pre class="shiki text"><code>${escapeHtml(code)}</code></pre>`;
      }
    },
  };

  marked.use({ renderer } as any);
  const html = String(await marked.parse(content));
  return { metadata, html, toc };
}
