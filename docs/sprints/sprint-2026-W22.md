---
id: sprint-2026-W22
status: closed
start: 2026-05-25
end: 2026-05-27
goal: "Two ships: v0.2.0 (dogfood koni-docs on its own repo — full docs/ scaffolding + Pattern B + AGENTS-canonical + RULE-15 + CHANGELOG relocation) AND v0.3.0 (real-world template + script audit from KFF + senti_quant retro — BLOCKER fix + RULE-16 + 4 new sprint sections). 8 stories / 25 pts / 1 contributor."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-1.2 | Add file-extracted active-context pattern (skill) | EPIC-1 | P0 | 3 | ✅ done | [stories/US-1.2-active-context-split-pattern.md](stories/US-1.2-active-context-split-pattern.md) |
| US-1.3 | Add RULE-15: assignee = GitHub login | EPIC-1 | P0 | 2 | ✅ done | [stories/US-1.3-rule-15-assignee-github-login.md](stories/US-1.3-rule-15-assignee-github-login.md) |
| US-1.4 | Document AGENTS-canonical convention in skill | EPIC-1 | P1 | 1 | ✅ done | [stories/US-1.4-agents-canonical-convention.md](stories/US-1.4-agents-canonical-convention.md) |
| US-2.1 | Bootstrap docs/ scaffolding | EPIC-2 | P0 | 5 | ✅ done | [stories/US-2.1-bootstrap-docs-structure.md](stories/US-2.1-bootstrap-docs-structure.md) |
| US-2.2 | Wire CLAUDE.md + AGENTS.md integration (Pattern B) | EPIC-2 | P0 | 3 | ✅ done | [stories/US-2.2-wire-integration-blocks.md](stories/US-2.2-wire-integration-blocks.md) |
| US-2.3 | Seed VERSION + CHANGELOG from git history | EPIC-2 | P1 | 2 | ✅ done | [stories/US-2.3-version-changelog-seed.md](stories/US-2.3-version-changelog-seed.md) |
| US-2.4 | Apply AGENTS-canonical convention to this repo | EPIC-2 | P1 | 1 | ✅ done | [stories/US-2.4-apply-agents-canonical.md](stories/US-2.4-apply-agents-canonical.md) |
| US-1.5 | Real-world template + script audit (KFF + senti_quant) | EPIC-1 | P0 | 8 | ✅ done | [stories/US-1.5-real-world-template-script-audit.md](stories/US-1.5-real-world-template-script-audit.md) |

**Total**: **25 points across 8 stories shipped** in this sprint window — 17 pts in v0.2.0 (3 EPIC-1 + 4 EPIC-2) + 8 pts in v0.3.0 (US-1.5 under EPIC-1). EPIC-1 closes at 100% (5/5 stories, 27/27 pts); EPIC-2 closes at 100% (4/4 stories, 11/11 pts).

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

**Why this sprint mattered**: [CONTEXT D6](../CONTEXT.md) — every
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

Sprint-2026-W22: **1 contributor, 8 stories, 25 points, 0 outside-help** (across v0.2.0 morning ship + v0.3.0 afternoon ship).

| GitHub login | Git name | Stories shipped | Points | Notes |
|---|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.2, US-1.3, US-1.4, US-1.5, US-2.1, US-2.2, US-2.3, US-2.4 | 25 | Per RULE-15 (introduced in v0.2.0), git `user.name=AnhMTV` ↔ GitHub login `saltict` |

Single-contributor sprint by design — the sprint was a focused dogfood
push with the AI agent. Future sprints opening EPIC-3 work will broaden
contributor surface.

## Retrospective

> Two ships in this sprint window: **v0.2.0** (morning, 7 stories /
> 17 pts) and **v0.3.0** (afternoon, 1 story / 8 pts). Retros for both
> below.

### v0.3.0 — What went well

- **Real-world data caught the BLOCKER first try.** The `escapeRegExp`
  bug existed since v0.1.0 but the small in-repo test fixtures never
  triggered it. One dry-run against Koni-Finance-Final's 198 stories
  exposed it within seconds. Lesson: **regression tests built from
  controlled fixtures are necessary but not sufficient — periodic
  dry-runs against real consumer repos are the only way to surface the
  trap class** (LESSONS §5).
- **Two reference repos provided complementary signal.** KFF (multi-dev
  team-sprint, messy data) caught the BLOCKER. senti_quant (single
  maintainer, cleaner data) confirmed the script worked end-to-end at
  scale (266 stories). Neither alone would have surfaced everything.
- **Template additions came from observed practice, not aspiration.**
  Every new sprint section (`Carry`, `Why <US>`, `Parked`, `Closed
  mid-sprint`, `Risks`, `Carry-overs`) was already in use by at least
  one of the two reference repos. We just standardized them.
- **RULE-16 finally landed.** Deferred 3 times since v0.2.0; the
  real-world retro made the trade-off (template touch-ups vs.
  long-term `vv` corruption) obvious. Sweep across this repo's existing
  `version_shipped:` values was zero-touch — all already bare semver
  per the LESSONS §4 fix.

### v0.3.0 — What didn't

- **Single-session shipped 8 pts in one sitting.** AC-1..15 implemented
  + 30-line LESSONS entry + 200-line CHANGELOG without a checkpoint. The
  WIP-limit guidance update (AC-13, declared limit = 3) was written WHILE
  exceeding it. Excused as before (atomic ship at sprint close), but a
  cleaner story breakdown would have been: US-1.5a (BLOCKER fix only,
  ship as v0.2.1 patch) → US-1.5b (template additions) → US-1.5c
  (RULE-16). Filed as retro note for future single-agent sprints.
- **PRD §11 entry-finder still imperfect.** AC-4 reduced
  KFF warning count from ~190 → 0 (via downgrade to info), but the
  underlying script doesn't actually *match* KFF's per-epic-only PRD
  layout — it just doesn't complain. The data is real (their PRD has
  per-epic Story tables, not per-story sections AND no §11 master
  index). Real fix is a future story to support that third layout.
- **`.agents/skills/koni-docs/` mirror not refreshed.** As with v0.2.0,
  the installed copy in `.agents/` stays at v0.1.0+misc; consumers pick
  up v0.3.0 via `npx skills update koni-docs` after this is pushed.

### v0.3.0 — Followups

- Push v0.2.0 + v0.3.0 to `origin/main` and tag both retroactively.
- **EPIC-4** (viewer/CLI — US-4.1..4.4 added by user after v0.2.0)
  needs scoping; either roll into next sprint or `/office-hours` first.
- **EPIC-3** (plugin pattern + non-docs skill) still backlog.
- PRD §11 entry-finder real fix (third layout: per-epic-only tables,
  no master §11 index) — file as new story when picked up.

### v0.2.0 — What went well

- **Dogfooding caught real gaps within the same session.** Four
  mid-sprint pickups (Pattern B, RULE-15, AGENTS-canonical, CHANGELOG
  relocation) were spotted by the user reading the produced artifacts —
  every gap was caught here, not by a downstream consumer team. This
  validates [CONTEXT D6](../CONTEXT.md) (dogfood before ship) and
  [AD-6](../PRD.md#6-background--strategic-decisions).
- **Koni-Finance-Final mining produced 3 of 4 mid-sprint pickups.**
  Pattern B, RULE-15 awareness, and AGENTS-canonical convention all
  came from referencing
  [Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md).
  Treating a peer Koniverse repo as a reference implementation
  short-circuited a lot of design work.
- **The skill's own §0 orientation acted as the source of truth.** When
  CHANGELOG was wrongly shipped at repo root, the skill's own SKILL.md
  §0 was the authority that caught it. The skill survived its first
  "skill canon vs developer habit" test ([CONTEXT D10](../CONTEXT.md)).
- **5-layer sync stayed clean across 9 epic updates.** All
  `agile-sync-up.mjs` runs returned `0 skipped`. The `epicStoryRowMatcher`
  boundary fix from W19 (LESSONS §1) paid off — no false matches across
  US-1.1 / US-1.2 / US-1.3 / US-1.4 / etc.
- **Single-session ship of 7 stories.** The sprint compressed
  Mon-through-Sun work into a single day. Possible because each
  mid-sprint pickup was tiny (1-3 points) and the templates+scripts
  shipped in W19 took the rest of the cost off the table.

### v0.2.0 — What didn't

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
  retrospective + as [CONTEXT D10](../CONTEXT.md).
- **`vv0.1.0` double-prefix bug.** US-1.1's `version_shipped: v0.1.0`
  produced `vv0.1.0` in synced epic table. Fixed by changing
  frontmatter to bare semver. RULE-16 (formalize bare semver) remains
  deferred because adopting it now would need template touch-ups
  across all six frontmatter-bearing artifact types
  ([LESSONS §4](../LESSONS.md)).
- **CLAUDE.md initially shipped with `## Quick start` and
  `## Documentation` duplicating AGENTS.md.** Drift hazard introduced
  in US-2.1 without first reading AGENTS.md. Caught and fixed via
  US-2.4. The fix is small (~10 lines removed); the avoidance lesson
  is bigger: **author CLAUDE.md AFTER reading AGENTS.md, not in
  parallel**.

### v0.2.0 — Followups (status at v0.3.0 close)

- ✅ **RULE-16 shipped** in v0.3.0 (US-1.5 AC-10). Catalog 10 → 11.
- ✅ **Real-world script audit shipped** in v0.3.0 (US-1.5). BLOCKER
  fix on regex-escape; KFF + senti_quant exit 0 in dry-run.
- 🚧 **EPIC-3 next sprint.** US-3.1 (plugin-skill pattern: Supabase /
  Next.js) is the next major work. Needs an `/office-hours` brainstorm
  to scope it + identify the second non-docs skill candidate. Plus user
  added EPIC-4 (US-4.1..4.4 viewer/CLI work) to backlog after v0.2.0
  ship — that becomes a candidate too.
- 🚧 **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](../ARCHITECTURE.md).
- **WIP limit guidance review.** Sprint-system reference should
  acknowledge "single-session-with-agent" sprints where atomic ship
  legitimately exceeds the 3-WIP limit.
- **Push v0.2.0 to GitHub.** This sprint's commit isn't tagged yet.
  After tagging `v0.2.0`, consumer repos can `npx skills update
  koni-docs` and pick up: Pattern B, RULE-15, AGENTS-canonical
  convention, CHANGELOG-at-docs canon. `.agents/skills/koni-docs/`
  mirror in this repo is stale until `npx skills update` runs.

## Cross-references

- [EPIC-1](epics/EPIC-1.md) — parent epic (done at v0.2.0)
- [EPIC-2](epics/EPIC-2.md) — parent epic (done at v0.2.0)
- All 8 sprint stories: [US-1.2](stories/US-1.2-active-context-split-pattern.md) · [US-1.3](stories/US-1.3-rule-15-assignee-github-login.md) · [US-1.4](stories/US-1.4-agents-canonical-convention.md) · [US-1.5](stories/US-1.5-real-world-template-script-audit.md) · [US-2.1](stories/US-2.1-bootstrap-docs-structure.md) · [US-2.2](stories/US-2.2-wire-integration-blocks.md) · [US-2.3](stories/US-2.3-version-changelog-seed.md) · [US-2.4](stories/US-2.4-apply-agents-canonical.md)
- [PRD FR-6..FR-14, AD-6..AD-10](../PRD.md#8-functional-requirements)
- [CONTEXT D6..D10](../CONTEXT.md)
- [LESSONS §1..§5](../LESSONS.md) — §4 → RULE-16 (v0.3.0); §5 = regex-escape trap (v0.3.0)
- [CHANGELOG v0.2.0 + v0.3.0](../CHANGELOG.md)
- [Previous sprint: W19](sprint-2026-W19.md) — koni-docs initial release (v0.1.0)
- [README.md](../README.md) — sprint schema + scripts
- [STATUS.md](../STATUS.md) — current auto-generated kanban
