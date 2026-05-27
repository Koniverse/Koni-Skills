import type { Corpus, MatterEntry } from './types.ts';
import { getStories, resolveById } from './corpus.ts';

export type RefKind = 'epic' | 'sprint' | 'prd_ref' | 'sibling';

export interface RefValidationResult {
  source: string;   // file path
  ref: string;
  kind: RefKind;
  error: 'not_found' | 'wrong_type';
}

function refsFromStory(s: MatterEntry): Array<{ ref: string; kind: RefKind }> {
  const out: Array<{ ref: string; kind: RefKind }> = [];
  const fm = s.frontmatter;
  if (typeof fm.epic === 'string') out.push({ ref: fm.epic, kind: 'epic' });
  if (typeof fm.sprint === 'string' && fm.sprint.length > 0) out.push({ ref: fm.sprint, kind: 'sprint' });
  if (typeof fm.prd_ref === 'string' && fm.prd_ref.length > 0) {
    for (const r of fm.prd_ref.split(',').map(x => x.trim()).filter(Boolean)) {
      out.push({ ref: r, kind: 'prd_ref' });
    }
  } else if (Array.isArray(fm.prd_ref)) {
    for (const r of fm.prd_ref) {
      if (typeof r === 'string') out.push({ ref: r, kind: 'prd_ref' });
    }
  }
  return out;
}

export function listChildrenOf(corpus: Corpus, parentId: string): MatterEntry[] {
  if (parentId.startsWith('EPIC-')) {
    return getStories(corpus).filter(s => s.frontmatter.epic === parentId);
  }
  if (parentId.startsWith('sprint-')) {
    return getStories(corpus).filter(s => s.frontmatter.sprint === parentId);
  }
  return [];
}

export function listReferrersTo(corpus: Corpus, id: string): MatterEntry[] {
  const out: MatterEntry[] = [];
  for (const s of getStories(corpus)) {
    const refs = refsFromStory(s);
    if (refs.some(r => r.ref === id)) out.push(s);
  }
  return out;
}

export function validateRefs(corpus: Corpus): RefValidationResult[] {
  const out: RefValidationResult[] = [];
  for (const s of getStories(corpus)) {
    for (const r of refsFromStory(s)) {
      if (r.kind === 'epic') {
        if (!resolveById(corpus, r.ref)) out.push({ source: s.path, ref: r.ref, kind: r.kind, error: 'not_found' });
      } else if (r.kind === 'sprint') {
        if (!resolveById(corpus, r.ref)) out.push({ source: s.path, ref: r.ref, kind: r.kind, error: 'not_found' });
      }
      // FR refs validated against PRD §8 — deferred (Pillar C may extend)
    }
  }
  return out;
}
