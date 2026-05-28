import type { Corpus, MatterEntry } from './types.ts';
import { getStories, resolveById } from './corpus.ts';
import { readDoc } from './doc.ts';
import { findSectionByLabel } from './markdown/sections.ts';
import {
  PRD_FUNCTIONAL_REQUIREMENTS_LABEL,
  PRD_FUNCTIONAL_REQUIREMENTS_LEGACY_NUMBER,
} from './prd-constants.ts';
import { parseTable } from './markdown/tables.ts';

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
      // FR refs validated against PRD Functional Requirements — see validateFrRefs
    }
  }
  return out;
}

export interface FrRefMissing {
  /** Story id (e.g. "US-4.1"). */
  id: string;
  /** Story file path. */
  source: string;
  /** FR refs the story claims that PRD Functional Requirements table does not contain. */
  missingFr: string[];
}

// Used only by the early-return branch when the FR section cannot be located.
function storyFrRefsAll(s: MatterEntry): FrRefMissing | null {
  const refs = refsFromStory(s).filter(r => r.kind === 'prd_ref').map(r => r.ref);
  const missing = refs.filter(r => /^FR-/.test(r));
  if (missing.length === 0) return null;
  return {
    id: String(s.frontmatter.id ?? ''),
    source: s.path,
    missingFr: missing,
  };
}

/**
 * For each story with a `prd_ref:` frontmatter value, verify each `FR-N` ref
 * is present as a row in PRD's Functional Requirements table. Returns the
 * list of stories with at least one missing FR ref. An empty list means every
 * story's FR refs resolve. Stories without `prd_ref` are skipped entirely.
 *
 * Section lookup uses the label form ("## Functional Requirements") and
 * transparently falls back to the legacy numbered form ("## 8. …") for PRDs
 * that haven't migrated.
 *
 * If PRD.md is missing or the FR section has no table, every FR ref counts as
 * missing (better-safe-than-silent).
 */
export function validateFrRefs(corpus: Corpus): FrRefMissing[] {
  const prdEntry = corpus.singletons.prd;
  if (!prdEntry) {
    return getStories(corpus)
      .map(storyFrRefsAll)
      .filter((x): x is FrRefMissing => x !== null);
  }
  const prdDoc = readDoc(prdEntry.path);
  const frSection = findSectionByLabel(prdDoc, PRD_FUNCTIONAL_REQUIREMENTS_LABEL, {
    legacyNumber: PRD_FUNCTIONAL_REQUIREMENTS_LEGACY_NUMBER,
  });
  if (!frSection) {
    return getStories(corpus)
      .map(storyFrRefsAll)
      .filter((x): x is FrRefMissing => x !== null);
  }
  // Find the first table inside the FR section body.
  const tableNode = frSection.body.find(n => n.type === 'table');
  if (!tableNode || tableNode.type !== 'table') {
    return getStories(corpus)
      .map(storyFrRefsAll)
      .filter((x): x is FrRefMissing => x !== null);
  }
  const parsed = parseTable(tableNode);
  const idCol = parsed.headers.indexOf('ID');
  const validIds = new Set<string>();
  if (idCol >= 0) {
    for (const row of parsed.rows) {
      const v = row[idCol];
      if (v) validIds.add(v);
    }
  }

  const out: FrRefMissing[] = [];
  for (const s of getStories(corpus)) {
    const refs = refsFromStory(s).filter(r => r.kind === 'prd_ref').map(r => r.ref);
    const missing = refs.filter(r => /^FR-/.test(r) && !validIds.has(r));
    if (missing.length > 0) {
      out.push({
        id: String(s.frontmatter.id ?? ''),
        source: s.path,
        missingFr: missing,
      });
    }
  }
  return out;
}
