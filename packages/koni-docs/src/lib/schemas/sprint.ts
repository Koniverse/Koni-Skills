import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const sprintSchema = z.object({
  id: z.string().regex(/^sprint-\d{4}-W\d{2}$/),
  status: z.enum(['planned', 'in-progress', 'closed']),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal: z.string(),
});

export type Sprint = z.infer<typeof sprintSchema>;

export function validateSprint(data: unknown): ValidateResult<Sprint> {
  const r = sprintSchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
