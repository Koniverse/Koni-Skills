import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { z } from 'zod';

const ConfigSchema = z.object({
  title: z.string().optional(),
  folderOrder: z.array(z.string()).optional(),
  topLevelOrder: z.array(z.string()).optional(),
});

export type KoniDocsViewerConfig = z.infer<typeof ConfigSchema>;

/**
 * Look for `koni-docs.config.json` then `koni-docs.config.mjs` at the docs-tree
 * root and load + validate it. Returns `{}` if neither file exists. Throws
 * with a clear message on schema-validation failure.
 *
 * Sync by design: viewer corpus init must stay sync to remain compatible with
 * Astro's data-loading model. For `.mjs` support we spawn a short-lived child
 * `node` that dynamic-imports the module and dumps `default` as JSON. JSON
 * remains the lower-friction recommended form because the config has no need
 * for code — only strings and string-arrays.
 */
export function loadViewerConfig(docsDir: string): KoniDocsViewerConfig {
  const jsonPath = join(docsDir, 'koni-docs.config.json');
  const mjsPath = join(docsDir, 'koni-docs.config.mjs');

  let raw: unknown = null;
  let source = '';
  if (existsSync(jsonPath)) {
    source = jsonPath;
    try {
      raw = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    } catch (e) {
      throw new Error(
        `koni-docs.config.json: invalid JSON — ${(e as Error).message}`,
      );
    }
  } else if (existsSync(mjsPath)) {
    source = mjsPath;
    raw = childResolveMjs(mjsPath);
  } else {
    return {};
  }

  const parsed = ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('\n');
    throw new Error(`${source}: schema validation failed:\n${issues}`);
  }
  return parsed.data;
}

function childResolveMjs(mjsPath: string): unknown {
  const url = pathToFileURL(mjsPath).href;
  const script = `import(${JSON.stringify(url)}).then(m => process.stdout.write(JSON.stringify(m.default ?? m))).catch(e => { process.stderr.write(String(e && e.stack || e)); process.exit(1); });`;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf-8',
  });
  if (r.status !== 0) {
    throw new Error(`${mjsPath}: failed to load — ${(r.stderr || '').trim()}`);
  }
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(
      `${mjsPath}: default export is not JSON-serializable — ${(e as Error).message}`,
    );
  }
}
