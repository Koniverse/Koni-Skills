export const KONI_DOCS_LIB_VERSION = '0.5.0';

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
  findSection, getSectionText, replaceSection, appendToSection,
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
export { validateRefs, listChildrenOf, listReferrersTo } from './refs.ts';
export type { RefKind, RefValidationResult } from './refs.ts';

// Changelog
export {
  parseChangelog, findEntryByVersion, formatVersionHeader,
  updateCommitSha, serializeChangelog,
} from './changelog.ts';
export type { ChangelogEntryParsed } from './changelog.ts';

// Git
export {
  isGitRepo, findCommitForVersion, findCommitByTag, listVersionBumps,
} from './git.ts';
export type { VersionBump } from './git.ts';
