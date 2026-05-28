/**
 * @koniverse/koni-docs lib — Mutation contract
 *
 * All functions exported from this lib are PURE: they take a value and return
 * a new value. Functions whose names start with `update*` (e.g. `updateCell`,
 * `updateFrontmatter`, `updateCommitSha`) take a value and return the modified
 * value — they do NOT mutate inputs.
 *
 * Exception: `parseTable(...).node` returns a reference to the underlying
 * mdast Table node; mutating fields on that node mutates `doc.ast`. This is
 * documented at the call site and intentional (avoids a deep clone for the
 * common "update one cell" path). See packages/koni-docs/src/lib/markdown/tables.ts.
 */

export const KONI_DOCS_LIB_VERSION = '0.7.0';

// Core types
export type { Doc, MatterEntry, Corpus } from './types.ts';

// Doc I/O
export {
  readDoc, parseDoc, serializeDoc, writeDoc, updateFrontmatter,
} from './doc.ts';

// Corpus
export {
  readFolderMatter, loadCorpus, getStories, getEpics, getSprints,
  getActiveSprint, resolveById,
} from './corpus.ts';

// Markdown primitives
export {
  findSection, findSectionStartingWith, getSectionText, replaceSection, appendToSection,
  removeSection, replaceSectionWithTable,
} from './markdown/sections.ts';
export type { SectionMatch } from './markdown/sections.ts';

export {
  findTable, parseTable, findRow, updateCell, appendRow, removeRow,
  updateSectionTable,
} from './markdown/tables.ts';
export type {
  TableLocator, ParsedTable, RowMatcher, UpdateCellOpts,
  AppendRowOpts, RemoveRowOpts, TableUpdate,
} from './markdown/tables.ts';

export {
  parseCheckboxes, setCheckboxState, appendCheckbox, replaceCheckboxes,
} from './markdown/checkboxes.ts';
export type { CheckboxItem } from './markdown/checkboxes.ts';

// Schemas
export * as Schemas from './schemas/index.ts';

// Refs
export { validateRefs, validateFrRefs, listChildrenOf, listReferrersTo } from './refs.ts';
export type { RefKind, RefValidationResult, FrRefMissing } from './refs.ts';

// Changelog
export {
  parseChangelog, findEntryByVersion, formatVersionHeader,
  updateCommitSha,
} from './changelog.ts';
export type { ChangelogEntryParsed } from './changelog.ts';

// Git
export {
  isGitRepo, findCommitForVersion, findCommitByTag, listVersionBumps,
} from './git.ts';
export type { VersionBump } from './git.ts';
