import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const epicSchema = z.object({
  id: z.string().regex(/^EPIC-\d+$/),
  title: z.string(),
  status: z.enum(['backlog', 'in-progress', 'done']),
  prd_ref: z.union([z.string(), z.array(z.string())]).optional(),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type Epic = z.infer<typeof epicSchema>;

export function validateEpic(data: unknown): ValidateResult<Epic> {
  const r = epicSchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
