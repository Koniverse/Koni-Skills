import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const changelogEntrySchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  commitSha: z.string().regex(/^[0-9a-f]{7,40}$/).nullable(),
});

export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;

export function validateChangelogEntry(data: unknown): ValidateResult<ChangelogEntry> {
  const r = changelogEntrySchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
