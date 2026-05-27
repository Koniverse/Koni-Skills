export const KONI_DOCS_LIB_VERSION = '0.2.0-dev.0';

export type { Doc, MatterEntry, Corpus } from './types.ts';

export { readDoc, parseDoc, serializeDoc, writeDoc, updateFrontmatter } from './doc.ts';

export {
  readFolderMatter,
  loadCorpus,
  getStories,
  getEpics,
  getSprints,
  getActiveSprint,
  resolveById,
} from './corpus.ts';
