---
id: sprint-2026-W21
status: closed
start: 2026-05-18T00:00:00.000Z
end: 2026-05-24T00:00:00.000Z
goal: >-
  Ship v0.2.0 — make Koni-Skills its own first canonical koni-docs consumer
  (full docs/ scaffolding + Pattern B active-context + RULE-15 +
  AGENTS-canonical + CHANGELOG-at-docs canon). 7 stories / 17 pts / 1 primary
  contributor + 2 cross-repo collaborators.
---
## Sprint scope

| US     | Title                                              | Epic   | Pri | Points | Status | Pillar | Ship   | Story file                                                                                         |
| ------ | -------------------------------------------------- | ------ | --- | ------ | ------ | ------ | ------ | -------------------------------------------------------------------------------------------------- |
> **Correction note (2026-07-03, [CONTEXT D34](CONTEXT.md))**: the 7 v0.2.0
> stories planned here (US-1.2 → US-1.4, US-2.1 → US-2.4, 17 pts) actually
> shipped **2026-05-27** — inside the W22 window — and their story files were
> created that same day. Per the sprint-membership rule (D32) they now live in
> [sprint-2026-W22](sprint-2026-W22.md). W21's narrative below is kept as
> history of the planning/work that started here; the v0.2.0 *ship* belongs to
> W22. The first run of the `story-lint` gate caught this months-old drift.

## Sprint goal recap (post-mortem)

Make the Koni-Skills meta-repo itself a worked example of "a fully scaffolded Koni-Skills consumer." After v0.2.0 ship, **all three target properties hold**:

1. ✅ **Full canonical docs exist.** Every artifact `koni-docs` claims to manage has a real file under `docs/` — BRIEF, PRD §1–§11, ARCHITECTURE, CONTEXT (10 decisions D1–D10), LESSONS (§1–§4), SETUP, sprints/ with 3 epics + initial stories + 1 archived sprint (W19 archive).
2. ✅ **CLAUDE.md + AGENTS.md are wired.** Pattern B (file-extracted Active Context) applied; AGENTS-canonical / CLAUDE-pointer convention applied. CLAUDE.md slimmed 40 → 28 lines.
3. ✅ **VERSION + CHANGELOG discipline started.** `VERSION` = `0.2.0`; `docs/CHANGELOG.md` (canonical location) holds \[Unreleased] + \[0.2.0] + \[0.1.0] entries with real contributor data.

**Deliverable**: v0.2.0 shipped on the morning of 2026-05-21 as a single-session push with the AI agent. Sprint closed mid-week ahead of original schedule; the remaining W21 window absorbed audit feedback + non-sprint cross-repo collaboration (see [Cross-contributor activity](#cross-contributor-activity)).

**Why this sprint mattered**: [CONTEXT D6](../CONTEXT.md) — every gap in `koni-docs` should be caught by the maintainer on their own repo, not paid for by a downstream consumer team. **4 gaps were caught mid-sprint** and codified into either skill changes or LESSONS entries — see §What didn't below.

## Pillar plan (executed)

| Pillar | Focus                                 | Stories                               | Result                                                                                                                    |
| ------ | ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **A**  | Skill dogfood + canonical scaffolding | US-1.2..1.4 + US-2.1..2.4 (7 stories) | ✅ All 7 done at v0.2.0. Pattern B + RULE-15 + AGENTS-canonical + CHANGELOG-at-docs landed. 4 mid-sprint pickups absorbed. |

## Closed mid-sprint W21

- **Pickup #1 — Active Context split (Pattern B)** — surfaced during US-2.2 wiring; landed as [US-1.2](stories/US-1.2-active-context-split-pattern.md). Pattern added to skill template + applied to this repo.
- **Pickup #2 — RULE-15 (assignee = GitHub login)** — surfaced reading the AnhMTV / saltict mismatch during US-2.3 contributor seeding; landed as [US-1.3](stories/US-1.3-rule-15-assignee-github-login.md). Rule catalog 9 → 10. Note: later softened in v0.7.0+ post-feedback from `jindo9986` (see [Cross-contributor activity](#cross-contributor-activity)) to "commit AUTHOR from `git log %an`, not session user".
- **Pickup #3 — AGENTS-canonical convention** — surfaced after reading [Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md); landed as [US-1.4](stories/US-1.4-agents-canonical-convention.md) + [US-2.4](stories/US-2.4-apply-agents-canonical.md). CLAUDE.md slimmed 40 → 28 lines.
- **Pickup #4 — CHANGELOG relocation (root → `docs/`)** — surfaced during US-2.3 review against the skill's §0 orientation; folded into [US-2.3](stories/US-2.3-version-changelog-seed.md) AC-2/5 + TASK-2.3.4. Codified as [CONTEXT D10](../CONTEXT.md).

## Cross-contributor activity

Sprint-2026-W21 was the first sprint where the `koni-docs` skill received **external feedback + script-level contributions from non-primary contributors**. Both are non-sprint-scoped (no US-X.Y assigned) but materially shaped the v0.2.0 surface and later releases.

### From `jindo9986` (Koniverse cross-repo collaboration)

| Date       | Commit                                                             | Change                                                                       | Impact on W21 / followup                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-21 | [b0b7a79](https://github.com/Koniverse/Koni-Skills/commit/b0b7a79) | docs: audit koni-docs skill against Koni-ERP-02 practice                     | Independent audit against another Koniverse repo (Koni-ERP-02) that consumes koni-docs. Surfaced consistency gaps between this repo's dogfood and Koni-ERP-02's adoption. Notes folded into v0.2.0 scope adjustments.                                                                                                |
| 2026-05-23 | [df88d59](https://github.com/Koniverse/Koni-Skills/commit/df88d59) | feat(koni-docs): add story-sizing evaluation rule for sales + marketing work | Adds explicit sizing guidance for non-engineering work (sales / marketing) where calendar-time outside dev control dominates. Affects `points:` field comment in story template + adds an `external_deps:` field. Landed in skill template; later codified inline in W22 ship of US-1.5 (real-world template audit). |

### From `bluezdot` (script-layer hardening)

| Date       | Commit                                                             | Change                                                                                         | Impact on W21 / followup                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-20 | [44f9c01](https://github.com/Koniverse/Koni-Skills/commit/44f9c01) | fix(scripts): enhance story parsing to skip files without an 'id' frontmatter and log warnings | Hardens `agile-sync-up.mjs` against partially-authored story files; the script no longer crashes when a story is mid-creation. Folded into the v0.2.0 script set; this is the trap that later W22 work codifies via Pillar B Zod schemas (US-4.7). |
| 2026-05-20 | [facd9a6](https://github.com/Koniverse/Koni-Skills/commit/facd9a6) | feat(templates): add 'deprecated' status to story and changelog templates                      | Extends the story-status enum with `deprecated` so retired stories can be marked rather than deleted. Template change shipped with v0.2.0; same enum carried forward into the Pillar B Zod schema in W22.                                          |

These contributions were merged into the v0.2.0 ship but did not consume sprint points (cross-repo skill-catalog work). Future cross-contributor work should either land before sprint open or open a new story per [RULE-11 (no scope creep without a story)](../../skills/koni-docs/SKILL.md).

## Per-Epic Retrospective

| Epic   | Retro Status | Notes                                                                                                                                                                                                                        |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EPIC-1 | partial-done | 3 of 5 stories shipped at v0.2.0 (US-1.2 / 1.3 / 1.4). US-1.1 archived from W19. US-1.5 carries to W22 as v0.3.0 (real-world template + script audit triggered by `jindo9986` audit feedback). Epic closes at v0.3.0 in W22. |
| EPIC-2 | done         | All 4 stories shipped at v0.2.0 (US-2.1 / 2.2 / 2.3 / 2.4). Epic closes 100% (4/4 stories, 11/11 points).                                                                                                                    |

## Contributors

Sprint-2026-W21: **1 primary contributor (story-scoped), 2 collaborators (script + skill-template), 17 sprint pts shipped + 4 unsized cross-contributor commits.**

| GitHub login                                | Git name  | Role         | Stories shipped                                        | Points | Notes                                                                                                                                             |
| ------------------------------------------- | --------- | ------------ | ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`saltict`](https://github.com/saltict)     | AnhMTV    | primary      | US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4 | 17     | Single-session ship of v0.2.0. Per RULE-15 (introduced this sprint), git `user.name=AnhMTV` ↔ GitHub login `saltict`.                             |
| [`jindo9986`](https://github.com/jindo9986) | jindo9986 | collaborator | *(unsized; see Cross-contributor activity)*            | —      | Skill audit + story-sizing rule for non-eng work. Feedback later drove RULE-15 softening in v0.7.0+ (assignee = commit AUTHOR, not session user). |
| [`bluezdot`](https://github.com/bluezdot)   | bluezdot  | collaborator | *(unsized; see Cross-contributor activity)*            | —      | Script parsing hardening + `deprecated` status template extension. Sat under the v0.2.0 ship without consuming sprint points.                     |

## Retrospective

### v0.2.0 — What went well

- **Dogfooding caught real gaps within the same session.** Four mid-sprint pickups (Pattern B, RULE-15, AGENTS-canonical, CHANGELOG relocation) were spotted by the user reading the produced artifacts — every gap was caught here, not by a downstream consumer team. Validates [CONTEXT D6](../CONTEXT.md) (dogfood before ship) and [AD-6](../PRD.md#6-background--strategic-decisions).
- **Koni-Finance-Final mining produced 3 of 4 mid-sprint pickups.** Pattern B, RULE-15 awareness, and AGENTS-canonical convention all came from referencing [KFF's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md). Treating a peer Koniverse repo as a reference implementation short-circuited a lot of design work.
- **External audit by `jindo9986` against Koni-ERP-02 caught skill-vs-practice drift.** A second cross-repo audit (in addition to KFF mining) surfaced consistency gaps that informed the v0.3.0 template + script audit (US-1.5 in W22). Without this independent read, the gaps would have stayed hidden until a third consumer onboarded.
- **`bluezdot`'s script hardening** prevented a class of crash (missing `id:` frontmatter) that would have hit the next consumer team. Caught at the script layer in v0.2.0 — paid down properly via Zod schemas in W22 Pillar B (US-4.7).
- **The skill's own §0 orientation acted as the source of truth.** When CHANGELOG was wrongly shipped at repo root, the skill's own SKILL.md §0 was the authority that caught it. The skill survived its first "skill canon vs developer habit" test ([CONTEXT D10](../CONTEXT.md)).

### v0.2.0 — What didn't

- **Scope expanded 4 times within the sprint.** Original scope 9 pts (US-2.1 / 2.2 / 2.3) → final 17 pts (added US-1.2 / 1.3 / 1.4 / 2.4). Each pickup small enough to absorb, but a stricter discipline would have parked them. Trade-off worth it because each pickup was *exposed* by the scaffolding work.
- **WIP limit (3) exceeded throughout.** Up to 7 stories in-progress simultaneously. Excused because all 7 closed atomically in v0.2.0 — splitting would have been bureaucratic. WIP-limit guidance update queued for v0.3.0 retro (US-1.5 in W22).
- **CHANGELOG-location bug should have been caught in US-2.1's docs-hub authoring.** `docs/README.md` listed CHANGELOG.md under "Repo-root" — anchoring the wrong choice. Took 6 more story files before the user spotted it. Codified as the new "What didn't" entry in [archived sprint-2026-W19](archive/sprint-2026-W19.md) + as [CONTEXT D10](../CONTEXT.md).
- **`vv0.1.0` double-prefix bug.** US-1.1's `version_shipped: v0.1.0` produced `vv0.1.0` in synced epic table. Fixed by changing frontmatter to bare semver. RULE-16 (formalize bare semver) deferred to W22 v0.3.0 ship.
- **Cross-contributor work landed without sized stories.** `jindo9986`'s audit + sizing rule and `bluezdot`'s script + template changes all landed in v0.2.0 without a US-X.Y assigned — they're tracked in [Cross-contributor activity](#cross-contributor-activity) but invisible to point totals. Followup: define a lightweight `collab/` story shape (US-X.Y-collab) for cross-repo contributions that ship inside a sprint.

### v0.2.0 — Followups (status at sprint close)

- ✅ **Pattern B applied** (US-1.2 + US-2.2 expansion).
- ✅ **RULE-15 shipped** (US-1.3). Catalog 9 → 10.
- ✅ **AGENTS-canonical convention shipped** (US-1.4 + US-2.4).
- ✅ **CHANGELOG relocated** to `docs/` (folded into US-2.3).
- 🚧 **Real-world template + script audit** (US-1.5) opened mid-sprint based on `jindo9986`'s audit signal — too large to absorb into W21. Carries to W22 as v0.3.0.
- 🚧 **EPIC-3** (plugin-skill pattern: Supabase / Next.js) — still backlog. Unblocked once EPIC-4 is far enough along that the `packages/` vs `skills/` boundary is established.
- 🚧 **Cross-contributor sizing pattern** — `jindo9986` and `bluezdot` contributions landed unsized. Filed as retro note.

## Cross-references

- [EPIC-1](epics/EPIC-1.md) — 3 of 5 stories shipped at v0.2.0; closes at v0.3.0 in W22
- [EPIC-2](epics/EPIC-2.md) — closed at v0.2.0 (4/4 stories, 11/11 pts)
- All 7 sprint stories: [US-1.2](stories/US-1.2-active-context-split-pattern.md) · [US-1.3](stories/US-1.3-rule-15-assignee-github-login.md) · [US-1.4](stories/US-1.4-agents-canonical-convention.md) · [US-2.1](stories/US-2.1-bootstrap-docs-structure.md) · [US-2.2](stories/US-2.2-wire-integration-blocks.md) · [US-2.3](stories/US-2.3-version-changelog-seed.md) · [US-2.4](stories/US-2.4-apply-agents-canonical.md)
- [PRD FR-6..FR-14, AD-6..AD-10](../PRD.md#8-functional-requirements)
- [CONTEXT D6..D10](../CONTEXT.md)
- [LESSONS §1..§4](../LESSONS.md)
- [CHANGELOG v0.2.0](../CHANGELOG.md)
- [Previous sprint: W19](archive/sprint-2026-W19.md) — koni-docs initial release (v0.1.0)
- [Next sprint: W22](sprint-2026-W22.md) — v0.3.0 → v0.7.0 (real-world audit, lib, CLI, viewer, publish)
- [README.md](../README.md) — sprint schema + scripts
- [STATUS.md](STATUS.md) — current auto-generated kanban
