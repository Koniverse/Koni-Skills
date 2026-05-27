import type { Command } from 'commander';

export interface GlobalOpts {
  docsPath: string;
  dryRun: boolean;
  json: boolean;
  verbose: boolean;
}

/**
 * Read merged global options from the commander program.
 * Subcommands call this in their action handler.
 */
export function getGlobalOpts(cmd: Command): GlobalOpts {
  const root = cmd.parent ?? cmd;
  const opts = root.opts<{ docsPath?: string; dryRun?: boolean; json?: boolean; verbose?: boolean }>();
  return {
    docsPath: opts.docsPath ?? 'docs/',
    dryRun: Boolean(opts.dryRun),
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
  };
}
