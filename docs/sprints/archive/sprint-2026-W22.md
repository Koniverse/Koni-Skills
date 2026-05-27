---
id: sprint-2026-W22
status: closed
start: 2026-05-25
end: 2026-05-27
goal: "Dogfood koni-docs on its own repo — ship full docs/ scaffolding + integration wiring + 2 conventions (Pattern B, AGENTS-canonical) + RULE-15 + CHANGELOG relocation, all under v0.2.0"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-1.2 | Add file-extracted active-context pattern (skill) | EPIC-1 | P0 | 3 | ✅ done (v0.2.0) | [../stories/US-1.2-active-context-split-pattern.md](../stories/US-1.2-active-context-split-pattern.md) |
| US-1.3 | Add RULE-15: assignee = GitHub login | EPIC-1 | P0 | 2 | ✅ done (v0.2.0) | [../stories/US-1.3-rule-15-assignee-github-login.md](../stories/US-1.3-rule-15-assignee-github-login.md) |
| US-1.4 | Document AGENTS-canonical convention in skill | EPIC-1 | P1 | 1 | ✅ done (v0.2.0) | [../stories/US-1.4-agents-canonical-convention.md](../stories/US-1.4-agents-canonical-convention.md) |
| US-2.1 | Bootstrap docs/ scaffolding | EPIC-2 | P0 | 5 | ✅ done (v0.2.0) | [../stories/US-2.1-bootstrap-docs-structure.md](../stories/US-2.1-bootstrap-docs-structure.md) |
| US-2.2 | Wire CLAUDE.md + AGENTS.md integration (Pattern B) | EPIC-2 | P0 | 3 | ✅ done (v0.2.0) | [../stories/US-2.2-wire-integration-blocks.md](../stories/US-2.2-wire-integration-blocks.md) |
| US-2.3 | Seed VERSION + CHANGELOG from git history | EPIC-2 | P1 | 2 | ✅ done (v0.2.0) | [../stories/US-2.3-version-changelog-seed.md](../stories/US-2.3-version-changelog-seed.md) |
| US-2.4 | Apply AGENTS-canonical convention to this repo | EPIC-2 | P1 | 1 | ✅ done (v0.2.0) | [../stories/US-2.4-apply-agents-canonical.md](../stories/US-2.4-apply-agents-canonical.md) |

**Total**: 17 points across 7 stories shipped (3 under EPIC-1, 4 under EPIC-2). EPIC-1 and EPIC-2 both close at 100%.

## Sprint goal recap (post-mortem)

Make the Koni-Skills meta-repo itself a worked example of "a fully
scaffolded Koni-Skills consumer." After this sprint **all three target
properties hold**:

1. ✅ **Full canonical docs exist.** Every artifact `koni-docs` claims
   to manage has a real file under `docs/` — BRIEF, PRD §1–§11,
   ARCHITECTURE, CONTEXT (10 decisions D1–D10), LESSONS (§1–§4), SETUP,
   sprints/ with 3 epics + 9 stories + 2 closed sprints (W19 archive,
   this W22 archive).
2. ✅ **CLAUDE.md + AGENTS.md are wired.** Pattern B (file-extracted
   Active Context) applied; AGENTS-canonical / CLAUDE-pointer
   convention applied. CLAUDE.md slimmed 40 → 28 lines.
3. ✅ **VERSION + CHANGELOG discipline started.** `VERSION` = `0.2.0`;
   `docs/CHANGELOG.md` (canonical location) holds [Unreleased] + [0.2.0]
   + [0.1.0] entries with real contributor data.

**Deliverable**: v0.2.0 shipped. Sprint closed 4 days ahead of original
schedule (planned end 2026-05-31; actual close 2026-05-27) because the
work compressed into a single-session push with the AI agent.

**Why this sprint mattered**: [CONTEXT D6](../../CONTEXT.md) — every
gap in `koni-docs` should be caught by the maintainer on their own
repo, not paid for by a downstream consumer team. **4 gaps were caught
mid-sprint** and codified into either skill changes or LESSONS entries
— see §What didn't below.

## Phased plan (executed)

| Phase | Focus | Stories | Result |
|---|---|---|---|
| 1 | Docs scaffolding | US-2.1 | ✅ 19 files created (~2,800 lines) |
| 2 | Integration wiring | US-2.2 | ✅ CLAUDE.md + AGENTS.md + .active-context.example + .active-context |
| 3 | VERSION + CHANGELOG seed | US-2.3 | ✅ VERSION 0.1.0 created; CHANGELOG with retro v0.1.0 entry |
| 4 | Mid-sprint pickup #1 — Active Context split | US-1.2 + US-2.2 expansion | ✅ Pattern B added to skill + applied to repo |
| 5 | Mid-sprint pickup #2 — RULE-15 | US-1.3 | ✅ Rule catalog 9 → 10; 4 stories' assignee fixed |
| 6 | Mid-sprint pickup #3 — AGENTS-canonical | US-1.4 + US-2.4 | ✅ Convention added to skill template; CLAUDE.md slimmed |
| 7 | Mid-sprint pickup #4 — CHANGELOG relocation | folded into US-2.3 (AC-2/5, TASK-2.3.4) | ✅ Root → docs/; CONTEXT D10 |
| 8 | Verify + close | sprint close | ✅ Sync + STATUS regenerated; 7 stories → done; this archive |

## Per-Epic Retrospective

| Epic | Retro Status | Notes |
|------|-------------|-------|
| EPIC-1 | done | Three stories (US-1.2/1.3/1.4) shipped; epic closes 100% (4/4 stories, 19/19 points) |
| EPIC-2 | done | Four stories (US-2.1/2.2/2.3/2.4) shipped; epic closes 100% (4/4 stories, 11/11 points) |

## Contributors

Sprint-2026-W22: **1 contributor, 7 stories, 17 points, 0 outside-help**.

| GitHub login | Git name | Stories shipped | Points | Notes |
|---|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4 | 17 | Per RULE-15 (introduced this sprint), git `user.name=AnhMTV` ↔ GitHub login `saltict` |

Single-contributor sprint by design — the sprint was a focused dogfood
push with the AI agent. Future sprints opening EPIC-3 work will broaden
contributor surface.

## Retrospective

### What went well

- **Dogfooding caught real gaps within the same session.** Four
  mid-sprint pickups (Pattern B, RULE-15, AGENTS-canonical, CHANGELOG
  relocation) were spotted by the user reading the produced artifacts —
  every gap was caught here, not by a downstream consumer team. This
  validates [CONTEXT D6](../../CONTEXT.md) (dogfood before ship) and
  [AD-6](../../PRD.md#6-background--strategic-decisions).
- **Koni-Finance-Final mining produced 3 of 4 mid-sprint pickups.**
  Pattern B, RULE-15 awareness, and AGENTS-canonical convention all
  came from referencing
  [Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md).
  Treating a peer Koniverse repo as a reference implementation
  short-circuited a lot of design work.
- **The skill's own §0 orientation acted as the source of truth.** When
  CHANGELOG was wrongly shipped at repo root, the skill's own SKILL.md
  §0 was the authority that caught it. The skill survived its first
  "skill canon vs developer habit" test ([CONTEXT D10](../../CONTEXT.md)).
- **5-layer sync stayed clean across 9 epic updates.** All
  `agile-sync-up.mjs` runs returned `0 skipped`. The `epicStoryRowMatcher`
  boundary fix from W19 (LESSONS §1) paid off — no false matches across
  US-1.1 / US-1.2 / US-1.3 / US-1.4 / etc.
- **Single-session ship of 7 stories.** The sprint compressed
  Mon-through-Sun work into a single day. Possible because each
  mid-sprint pickup was tiny (1-3 points) and the templates+scripts
  shipped in W19 took the rest of the cost off the table.

### What didn't

- **Scope expanded 4 times within the sprint.** Original scope was 9
  points (US-2.1/2.2/2.3). Final scope was 17 points (added US-1.2,
  US-1.3, US-1.4, US-2.4). Each pickup was small enough to absorb, but
  a stricter sprint discipline would have parked them in W23. The
  trade-off was worth it because each pickup was *exposed* by the
  scaffolding work and pushing them later would have left half-shipped
  patterns dangling.
- **WIP limit (3) exceeded throughout the sprint.** Sprint W22 ran with
  up to 7 stories in-progress simultaneously. STATUS.md printed
  `⚠️ WIP limit exceeded` every regen. Excused because all 7 stories
  closed atomically in v0.2.0 — splitting would have been
  bureaucratic. **Followup**: revisit WIP limit guidance in the
  sprint-system reference for single-session-with-agent sprints.
- **CHANGELOG-location bug should have been caught in US-2.1's docs
  hub authoring.** `docs/README.md` listed CHANGELOG.md under
  "Repo-root" — anchoring the wrong choice. Took 6 more story files
  before the user spotted it. **Lesson**: when authoring the docs hub,
  cross-check every "where does this live" claim against the skill's
  §0 orientation, not against intuition. Codified as the new "What
  didn't" entry in [archived sprint-2026-W19](sprint-2026-W19.md)
  retrospective + as [CONTEXT D10](../../CONTEXT.md).
- **`vv0.1.0` double-prefix bug.** US-1.1's `version_shipped: v0.1.0`
  produced `vv0.1.0` in synced epic table. Fixed by changing
  frontmatter to bare semver. RULE-16 (formalize bare semver) remains
  deferred because adopting it now would need template touch-ups
  across all six frontmatter-bearing artifact types
  ([LESSONS §4](../../LESSONS.md)).
- **CLAUDE.md initially shipped with `## Quick start` and
  `## Documentation` duplicating AGENTS.md.** Drift hazard introduced
  in US-2.1 without first reading AGENTS.md. Caught and fixed via
  US-2.4. The fix is small (~10 lines removed); the avoidance lesson
  is bigger: **author CLAUDE.md AFTER reading AGENTS.md, not in
  parallel**.

### Followups

- **EPIC-3 next sprint.** US-3.1 (plugin-skill pattern: Supabase /
  Next.js) is the next major work. Needs an `/office-hours` brainstorm
  to scope it + identify the second non-docs skill candidate. Likely
  opens sprint-2026-W2x in 1-2 weeks.
- **RULE-16 (bare-semver `version_shipped:`) — deferred.** Would close
  [LESSONS §4](../../LESSONS.md) cleanly. Filed for a later EPIC-1
  sprint; needs template touch-ups across story / epic / sprint / PRD
  frontmatter and a sweep of existing `version_shipped` values across
  consumer repos.
- **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](../../ARCHITECTURE.md).
- **WIP limit guidance review.** Sprint-system reference should
  acknowledge "single-session-with-agent" sprints where atomic ship
  legitimately exceeds the 3-WIP limit.
- **Push v0.2.0 to GitHub.** This sprint's commit isn't tagged yet.
  After tagging `v0.2.0`, consumer repos can `npx skills update
  koni-docs` and pick up: Pattern B, RULE-15, AGENTS-canonical
  convention, CHANGELOG-at-docs canon. `.agents/skills/koni-docs/`
  mirror in this repo is stale until `npx skills update` runs.

## Cross-references

- [EPIC-1](../epics/EPIC-1.md) — parent epic (done at v0.2.0)
- [EPIC-2](../epics/EPIC-2.md) — parent epic (done at v0.2.0)
- All 7 sprint stories: [US-1.2](../stories/US-1.2-active-context-split-pattern.md) · [US-1.3](../stories/US-1.3-rule-15-assignee-github-login.md) · [US-1.4](../stories/US-1.4-agents-canonical-convention.md) · [US-2.1](../stories/US-2.1-bootstrap-docs-structure.md) · [US-2.2](../stories/US-2.2-wire-integration-blocks.md) · [US-2.3](../stories/US-2.3-version-changelog-seed.md) · [US-2.4](../stories/US-2.4-apply-agents-canonical.md)
- [PRD FR-6..FR-13](../../PRD.md#8-functional-requirements)
- [CONTEXT D6..D10](../../CONTEXT.md)
- [LESSONS §1..§4](../../LESSONS.md) — §4 motivates deferred RULE-16
- [CHANGELOG v0.2.0](../../CHANGELOG.md)
- [Previous sprint: W19](sprint-2026-W19.md) — koni-docs initial release (v0.1.0)
- [README.md](../README.md) — sprint schema + scripts
- [STATUS.md](../STATUS.md) — current auto-generated kanban
