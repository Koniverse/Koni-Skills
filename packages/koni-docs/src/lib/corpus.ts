import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import type { Corpus, MatterEntry } from './types.ts';

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

function readSingleton(path: string): MatterEntry | null {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf-8');
  const parsed = matter(raw);
  return {
    filename: basename(path),
    path,
    frontmatter: { ...parsed.data },
    body: parsed.content,
  };
}

const SINGLETON_NAMES = ['PRD', 'ARCHITECTURE', 'CHANGELOG', 'CONTEXT', 'LESSONS', 'BRIEF', 'SETUP'];

export function loadCorpus(docsPath: string): Corpus {
  const stories = readFolderMatter(join(docsPath, 'sprints', 'stories'));
  const epics = readFolderMatter(join(docsPath, 'sprints', 'epics'));
  const sprintsDir = join(docsPath, 'sprints');
  const sprints = existsSync(sprintsDir)
    ? readdirSync(sprintsDir)
        .filter(n => n.startsWith('sprint-') && n.endsWith('.md'))
        .map(n => {
          const full = join(sprintsDir, n);
          const raw = readFileSync(full, 'utf-8');
          const parsed = matter(raw);
          return {
            filename: n,
            path: full,
            frontmatter: { ...parsed.data },
            body: parsed.content,
          };
        })
    : [];

  const singletons: Record<string, MatterEntry | null> = {};
  for (const name of SINGLETON_NAMES) {
    singletons[name.toLowerCase()] = readSingleton(join(docsPath, `${name}.md`));
  }

  return { docsPath, stories, epics, sprints, singletons };
}

export function getStories(corpus: Corpus): MatterEntry[] {
  return corpus.stories.filter(s => typeof s.frontmatter.id === 'string');
}

export function getEpics(corpus: Corpus): MatterEntry[] {
  return corpus.epics.filter(e => typeof e.frontmatter.id === 'string');
}

export function getSprints(corpus: Corpus): MatterEntry[] {
  return corpus.sprints.filter(s => typeof s.frontmatter.id === 'string');
}

export function getActiveSprint(corpus: Corpus): MatterEntry | null {
  return getSprints(corpus).find(s => s.frontmatter.status === 'in-progress') ?? null;
}

export function resolveById(corpus: Corpus, id: string): MatterEntry | null {
  if (id.startsWith('US-')) return getStories(corpus).find(s => s.frontmatter.id === id) ?? null;
  if (id.startsWith('EPIC-')) return getEpics(corpus).find(e => e.frontmatter.id === id) ?? null;
  if (id.startsWith('sprint-')) return getSprints(corpus).find(s => s.frontmatter.id === id) ?? null;
  return null;
}
