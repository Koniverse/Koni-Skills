import type { Root } from 'mdast';

export interface Doc {
  /** Absolute or repo-relative path the doc was read from. */
  path: string;
  /** Parsed YAML frontmatter, plain object. */
  frontmatter: Record<string, unknown>;
  /** Markdown body without the frontmatter block. */
  body: string;
  /** mdast root parsed from `body` via remark+remark-gfm. */
  ast: Root;
  /** Original raw file content as read from disk. */
  raw: string;
}

export interface MatterEntry {
  filename: string;
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface Corpus {
  docsPath: string;
  stories: MatterEntry[];
  epics: MatterEntry[];
  sprints: MatterEntry[];
  /** Singleton docs: PRD, ARCHITECTURE, CHANGELOG, CONTEXT, LESSONS, BRIEF, SETUP. Keyed by base filename without extension, lowercase. */
  singletons: Record<string, MatterEntry | null>;
}
