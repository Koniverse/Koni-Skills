export interface ChangelogEntryParsed {
  version: string;
  date: string;
  title: string;
  commitSha: string | null;
  body: string;
  headerLine: number;
  commitLine: number | null;
}

const HEADER_RE = /^## \[(\d+\.\d+\.\d+)\]\s+—\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+?)(?:\s+—\s+v?\d+\.\d+\.\d+)?\s*$/;
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
