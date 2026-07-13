import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const sprintSchema = z.object({
  id: z.string().regex(/^sprint-\d{4}-W\d{2}$/),
  status: z.enum(['planned', 'in-progress', 'closed']),
  // js-yaml parses an unquoted `2026-06-29` into a JS Date and gray-matter
  // re-serializes it as a full ISO timestamp, so every sprint file in a
  // round-tripped corpus carries a Date, not a `YYYY-MM-DD` string. Accepting
  // only the string form rejected real sprint files.
  start: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}/), z.date()]),
  end: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}/), z.date()]),
  goal: z.string(),
});

export type Sprint = z.infer<typeof sprintSchema>;

export function validateSprint(data: unknown): ValidateResult<Sprint> {
  const r = sprintSchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
