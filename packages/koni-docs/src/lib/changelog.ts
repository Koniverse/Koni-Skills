export interface ChangelogEntryParsed {
  version: string;
  date: string;
  title: string;
  commitSha: string | null;
  body: string;
  headerLine: number;
  commitLine: number | null;
}

const HEADER_RE = /^## \[(\d+\.\d+\.\d+(?:[-.][A-Za-z0-9.]+)?)\]\s+—\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+?)(?:\s+—\s+v?\d+\.\d+\.\d+(?:[-.][A-Za-z0-9.]+)?)?\s*$/;
const COMMIT_RE = /^\*\*Commit\*\*:\s*(\S+)/;

export function parseChangelog(raw: string): ChangelogEntryParsed[] {
  const lines = raw.split('\n');
  const out: ChangelogEntryParsed[] = [];
  let current: ChangelogEntryParsed | null = null;
  let bodyStart = -1;

  const flush = (i: number) => {
    if (current) {
      current.body = lines.slice(bodyStart, i).join('\n').trim();
      out.push(current);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const m = line.match(HEADER_RE);
    if (m) {
      flush(i);
      current = {
        version: m[1] ?? '',
        date: m[2] ?? '',
        title: m[3] ?? '',
        commitSha: null,
        body: '',
        headerLine: i,
        commitLine: null,
      };
      bodyStart = i + 1;
      continue;
    }
    if (current) {
      const cm = line.match(COMMIT_RE);
      if (cm) {
        current.commitSha = cm[1] ?? null;
        current.commitLine = i;
      }
    }
  }
  flush(lines.length);
  return out;
}

export function findEntryByVersion(entries: ChangelogEntryParsed[], version: string): ChangelogEntryParsed | null {
  return entries.find(e => e.version === version) ?? null;
}

export function formatVersionHeader(opts: { version: string; date: string; title: string }): string {
  return `## [${opts.version}] — ${opts.date} — ${opts.title} — v${opts.version}`;
}

export function updateCommitSha(raw: string, version: string, sha: string): string {
  const entries = parseChangelog(raw);
  const entry = findEntryByVersion(entries, version);
  if (!entry || entry.commitLine === null) return raw;
  const lines = raw.split('\n');
  lines[entry.commitLine] = `**Commit**: ${sha}`;
  return lines.join('\n');
}

/**
 * Stub: serializing parsed entries back to a CHANGELOG file is not used by
 * Pillar B. Pillar C subcommands operate on raw + line-level updates (see
 * updateCommitSha). Exported for API completeness; throws if called.
 */
export function serializeChangelog(_entries: ChangelogEntryParsed[]): string {
  throw new Error('serializeChangelog: not implemented in Pillar B; use raw + updateCommitSha');
}
