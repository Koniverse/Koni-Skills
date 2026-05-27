import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { MatterEntry } from './types.ts';

export function readFolderMatter(dir: string, opts: { recursive?: boolean } = {}): MatterEntry[] {
  if (!existsSync(dir)) return [];
  const out: MatterEntry[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name.endsWith('.md')) {
      const raw = readFileSync(full, 'utf-8');
      const parsed = matter(raw);
      out.push({
        filename: name,
        path: full,
        frontmatter: { ...parsed.data },
        body: parsed.content,
      });
    }
    // recursive walk omitted — current koni-docs layout is flat per dir
  }
  return out;
}
