import { execFileSync } from 'node:child_process';

function safeExec(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export function isGitRepo(): boolean {
  return safeExec(['rev-parse', '--git-dir']) !== null;
}

export function findCommitForVersion(version: string, versionFile = 'VERSION'): string | null {
  // List recent commits that touched VERSION; find the one whose +version is `version`.
  const log = safeExec(['log', '--all', '--diff-filter=AM', '--pretty=%H', '--', versionFile]);
  if (!log) return null;
  for (const fullSha of log.split('\n').filter(Boolean)) {
    const diff = safeExec(['show', fullSha, '--', versionFile]);
    if (diff && diff.includes(`+${version}`)) return fullSha.slice(0, 7);
  }
  return null;
}

export function findCommitByTag(tag: string): string | null {
  const sha = safeExec(['rev-list', '-n', '1', tag]);
  return sha ? sha.slice(0, 7) : null;
}

export interface VersionBump {
  sha: string;
  version: string;
}

export function listVersionBumps(versionFile = 'VERSION', limit = 50): VersionBump[] {
  const log = safeExec(['log', '--all', '--diff-filter=AM', '--pretty=%H', '--', versionFile]);
  if (!log) return [];
  const out: VersionBump[] = [];
  for (const fullSha of log.split('\n').filter(Boolean).slice(0, limit)) {
    const diff = safeExec(['show', fullSha, '--', versionFile]);
    if (!diff) continue;
    const m = diff.match(/^\+(\d+\.\d+\.\d+)$/m);
    if (m && m[1]) out.push({ sha: fullSha.slice(0, 7), version: m[1] });
  }
  return out;
}
