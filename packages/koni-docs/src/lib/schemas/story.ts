import { z } from 'zod';

export const storySchema = z.object({
  id: z.string().regex(/^US-\d+\.\d+$/),
  title: z.string(),
  epic: z.string().regex(/^EPIC-\d+$/),
  status: z.enum(['backlog', 'ready', 'in-progress', 'review', 'done', 'blocked', 'deprecated']),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  points: z.union([
    z.literal(''), z.literal(1), z.literal(2), z.literal(3),
    z.literal(5), z.literal(8), z.literal(13),
  ]).optional(),
  sprint: z.union([z.string().regex(/^sprint-\d{4}-W\d{2}$/), z.literal('')]).optional(),
  // Hard deadline imposed from outside the sprint cadence. Empty = no deadline
  // of its own; there is no fallback to sprint.end (see lib/deadlines.ts).
  // `z.date()` is not sloppiness: js-yaml parses an unquoted `2026-07-20` into a
  // JS Date, so both forms reach the schema from real corpora.
  due: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.date()]).optional(),
  version_shipped: z.union([z.string().regex(/^v?\d+\.\d+\.\d+$/), z.literal('')]).optional(),
  prd_ref: z.union([z.string(), z.array(z.string())]).optional(),
  arch_ref: z.union([z.string(), z.array(z.string())]).optional(),
  depends_on: z.union([z.string(), z.array(z.string())]).optional(),
  assignee: z.string().optional(),
  commit: z.string().optional(),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type Story = z.infer<typeof storySchema>;

export const STORY_DEFAULTS: Record<string, unknown> = {
  status: 'backlog',
  priority: 'P2',
  points: '',
  sprint: '',
  due: '',
  version_shipped: '',
  prd_ref: [],
  arch_ref: [],
  depends_on: [],
  assignee: '',
  commit: '',
  created: '',
  updated: '',
};

export type ValidateResult<T> = { ok: true; data: T } | { ok: false; errors: z.ZodError };

export function validateStory(data: unknown): ValidateResult<Story> {
  const r = storySchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
