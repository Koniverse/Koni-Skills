# CONTEXT.md — Koni-Skills Decision Log

> Append-only (RULE-7). Never rewrite a past decision; record a revision
> entry that references the original by ID. Future-you reads this when
> wondering "why did we pick X over Y" — silently editing history breaks
> that contract.

---

## Phase 0 — Skill design & MVP (2026-05-06 .. 2026-05-26, shipped v0.1.0)

### D1. Skill = self-contained directory with bundled scripts/references

**Context**: The earliest sketch had skills sharing a `lib/` of common
helpers across `skills/`. This made versioning ambiguous — which version
of `lib/` does a consumer get when they install one skill?

**Decision**: Every skill is a self-contained directory under
`skills/<name>/`. No cross-skill imports. Bundled scripts run via
absolute paths into the skill (`node skills/<name>/scripts/<file>.mjs`).
References live under `skills/<name>/references/`. Assets under
`skills/<name>/assets/`.

**Rationale**: `npx skills add` resolves and installs ONE path. Allowing
cross-skill imports would force the CLI to walk a dependency graph and
produce surprising lockfile entries. Self-contained skills also mirror
the `anthropics/skills` / gstack conventions, so a Koniverse engineer
already knows the shape.

**Alternatives considered**:
- Shared `lib/` across skills — rejected: dependency graph, lockfile complexity.
- Skill-as-NPM-package — rejected: requires npm publish workflow and version
  pinning that GitHub-source-of-truth already gives us for free.

**Impact**: Established the directory layout used by every skill in this
repo. Codified in [ARCHITECTURE.md](ARCHITECTURE.md) §Skill anatomy.

**Date**: 2026-05-06
**Version**: pre-v0.1.0

---

### D2. Distribution via `npx skills add` + lockfile

**Context**: Initial setup instructions pointed users at `git submodule add`
to consume `koni-docs` from a Koniverse product repo. Onboarding hit
multiple papercuts (submodule init order, detached HEAD on update, no
hash drift detection).

**Decision**: Use the `npx skills` CLI for install / update / list /
remove. The CLI writes `skills-lock.json` at consumer-repo root recording
`source`, `sourceType`, `skillPath`, and `computedHash` per installed
skill. Fresh clones run `npx skills experimental_install` to restore
exactly what the lockfile declares.

**Rationale**: Lockfile-tracked content hashes catch silent upstream drift
(the same problem `pnpm-lock.yaml` solves for npm). Single command for
install AND update reduces onboarding from a half-page README to one
line.

**Alternatives considered**:
- Git submodule — rejected: above papercuts.
- Hand-copy with a refresh script in each consumer repo — rejected:
  repeats the very problem koni-docs is meant to remove.
- Publish to npm — rejected: extra release surface for no extra benefit
  over GitHub-as-source.

**Impact**: `README.md` install section, `AGENTS.md` quick reference,
`docs/SETUP.md` initial setup commands — all standardize on `npx skills`.

**Date**: 2026-05-07
**Version**: pre-v0.1.0

---

### D3. 9 project-agnostic core rules + plugin slot for tech-stack rules

**Context**: An earlier draft tried to bake Supabase-specific and
Next.js-specific rules directly into `koni-docs` (RLS guards, RSC vs
client component boundary checks). The rule list ballooned past 20
items, most irrelevant to projects on other stacks.

**Decision**: `koni-docs` ships with exactly 9 project-agnostic rules
(RULE-1, 2, 5, 6, 7, 10, 11, 13, 14 — gaps preserve historical numbering).
Tech-stack rules ship as **separate plugin skills** that a consumer
project declares in its CLAUDE.md via `koni-docs-plugins: [supabase,
nextjs]`. The core skill loads those plugin skills for additional rules.

**Rationale**: Keeps the core rule set sharp and grep-checkable. Lets a
Go / FastAPI / Rust Koniverse project consume `koni-docs` without
inheriting Next.js folklore it can't use. Mirrors the way ESLint plugins
extend core rules.

**Alternatives considered**:
- All-in-one mega rule set — rejected: token cost + irrelevance.
- Project-specific overrides in CLAUDE.md — rejected: undisciplined,
  not shareable across projects.

**Impact**: Established the 9-rule contract enforced by the pre-commit
checklist. Reserved the plugin slot in the Koni-Docs Integration block
shipped with v0.1.0.

**Date**: 2026-05-08
**Version**: pre-v0.1.0

---

### D4. Templates split one-file-per-type under `references/templates/`

**Context**: The first `references/templates.md` was a single 2000-line
file with all 11 template types inlined. Agents loaded the entire file
to render any one template — wasted tokens and slowed activation.

**Decision**: Each template lives in its own file:
`references/templates/brief.md`, `prd.md`, `architecture.md`,
`changelog.md`, `context.md`, `lessons.md`, `setup.md`, `epic.md`,
`story.md`, `sprint.md`, `design-spec.md`, `okr.md`, `integration.md`.
The top-level `references/templates.md` becomes a thin **index** with an
activation table mapping user requests to the single template file the
agent should load.

**Rationale**: Lets agents load only the template matching the user's
intent (token efficiency, NFR-1). Makes each template independently
reviewable and improvable without conflict noise across types.

**Alternatives considered**:
- Keep one mega file — rejected: token cost.
- One file per template type AND per project type (e.g. `prd-saas.md`,
  `prd-mobile.md`) — rejected: premature specialization; the BMad
  classification frontmatter already disambiguates.

**Impact**: Commit `3b75119 docs: split koni-docs templates into one
file per document type`. Index file
[`references/templates.md`](../skills/koni-docs/references/templates.md)
now drives navigation.

**Date**: 2026-05-22
**Version**: pre-v0.1.0

---

### D5. Pipeline integration as standardizer, not replacement

**Context**: There was a temptation to absorb BMad's brainstorm + brief +
PRD authoring flow directly into `koni-docs` ("one skill to rule them
all"). That would put us in competition with a tool that already
produces excellent planning content, AND would double the surface area
of the skill.

**Decision**: `koni-docs` positions itself as the **final stage** of the
pipeline: it maps BMad / GStack / Superpowers output into the canonical
`docs/` structure and enforces the rules. It does NOT replace upstream
brainstorming, design review, or implementation skills.

**Rationale**: Don't fight tools that are already excellent at their job.
Focus on the standardization gap nobody else fills.

**Impact**: Codified in [SKILL.md §1 Pipeline integration]
(../skills/koni-docs/SKILL.md) and PRD §1 Core Philosophies.

**Date**: 2026-05-06
**Version**: pre-v0.1.0

---

## Phase 1 — Dogfood + integration polish (2026-05-27 .. , sprint-2026-W22)

### D6. Dogfood koni-docs on this repo itself

**Context**: Up to v0.1.0, the `koni-docs` skill existed in
`skills/koni-docs/` but this repo's own `docs/` folder was empty (it
contained only superpowers planning artifacts). Consumers were
installing a skill whose home project did not run on it. The first
real-world test would be a downstream project — but if `koni-docs` had
gaps, the cost would fall on a consumer team instead of the maintainer.

**Decision**: Apply `koni-docs` to this repo end-to-end as EPIC-2 before
shipping v0.2.0:
- Create full `docs/` scaffolding (README, BRIEF, PRD, ARCH, CONTEXT,
  LESSONS, SETUP).
- Backfill VERSION (`0.1.0`) and CHANGELOG.md from existing git history.
- Wire the Koni-Docs Integration block into CLAUDE.md + AGENTS.md.
- Create `docs/sprints/` with EPIC-1 (retroactive), EPIC-2 (active dogfood
  scope), EPIC-3 (catalog expansion), and an active sprint file
  driving EPIC-2 work to ship.

**Rationale**: Every gap in the skill — missing template guidance,
broken sync script, awkward integration block — gets caught by the
maintainer on their own repo *before* a consumer hits it. Also gives
the next reader of this repo a worked example of a "fully scaffolded
Koni-Skills consumer".

**Alternatives considered**:
- Skip dogfooding, ship v0.2 from feedback in consumer repos — rejected:
  shifts cost to consumers and slows feedback loop.
- Dogfood only the `docs/` files, not the sprint discipline — rejected:
  sprint discipline is half the skill's value; not testing it leaves
  the riskiest surface unverified.

**Impact**: Creates EPIC-2 (US-2.1 / US-2.2 / US-2.3) shipping in
sprint-2026-W22. Bumps target VERSION for the close of that sprint to
`0.2.0`.

**Date**: 2026-05-27
**Version**: v0.2.0

---

### D7. Adopt file-extracted Active Context pattern (Pattern B)

**Context**: First-pass `CLAUDE.md` (committed 2026-05-27 morning)
inlined the koni-docs `Active Context` block between
`<!-- koni-docs:auto-update -->` markers. The user pointed at
[Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md)
which had moved Active Context out of `CLAUDE.md` precisely to avoid
multi-developer merge conflicts on parallel-branch sprint updates.
The Active Context block changes on every T1–T7 trigger (story
start / close, sprint roll, decision, lesson) — many times per week.
Two devs editing it on parallel branches always merges as a conflict.

**Decision**: Adopt **Pattern B (file-extracted)** for this repo and
add it to the `koni-docs` skill as the recommended option for teams.

- `CLAUDE.md` keeps only the static `Koni-Docs Integration` config
  block + a one-paragraph pointer.
- `.active-context.md` (gitignored) holds the live snapshot: a
  `Local developer` block (GitHub login, git name/email, workspace,
  current branch) AND the auto-update `Project sprint context` block.
- `.active-context.example.md` (committed) is the team template;
  contributors copy it on first checkout and fill in local-developer
  details.
- Durable record stays in `docs/sprints/`, `CHANGELOG.md`,
  `CONTEXT.md`, `LESSONS.md` — the gitignored file is just a fast
  session-start snapshot, never the source of truth.

The `koni-docs` skill keeps Pattern A (inline) as a documented
fallback for solo developers / low-merge projects. Two patterns are
explicitly named so a project picks one and does not mix.

**Rationale**: zero merge conflicts on Active Context across parallel
branches. Costs almost nothing (one new gitignored file + one
template + one gitignore line) and the team's friction drops from
"every PR" to "never".

**Alternatives considered**:
- Inline only (Pattern A) — rejected for this repo: confirmed
  pain point on Koni-Finance-Final.
- Move the entire `Koni-Docs Integration` config block out, not just
  Active Context — rejected: the config block is static (changes
  rarely) and team-shared, so `CLAUDE.md` is the right home.
- Make `.active-context.md` committed — rejected: defeats the
  purpose; conflicts return.

**Impact**:
- Codified as PRD AD-7, FR-11.
- This repo: `.active-context.example.md` + `.active-context.md` +
  `.gitignore` line + `CLAUDE.md` pointer ship in sprint-2026-W22.
- Skill: [`references/templates/integration.md`](../skills/koni-docs/references/templates/integration.md)
  rewritten with §0 pattern-picker, §1 Pattern A, §2 Pattern B
  step-by-step, §5/§6 filled examples.
- Skill: [`SKILL.md`](../skills/koni-docs/SKILL.md) §4 grows a
  pattern-picker table; activation §5 adds a row for "adopt
  active-context split".

**Follow-ups (not part of this decision)**:
- Koni-Finance-Final's `CLAUDE.md` also references **RULE-15**
  (`assignee:` = GitHub login, NOT git `user.name`) and **RULE-16**
  (`version_shipped:` uses bare semver, NOT `v`-prefixed). These
  are real wins (RULE-16 directly fixes [LESSONS §4](LESSONS.md))
  but expanding the 9-rule catalog to 11 needs template-pass
  touch-ups across story / epic / sprint frontmatter. Filed as
  follow-up for a later EPIC-1 sprint.

**Date**: 2026-05-27
**Version**: v0.2.0
**Reference**: Koni-Finance-Final adopted this pattern May 2026.

---

### D8. Adopt RULE-15 — `assignee:` is the GitHub login, never git `user.name`

**Context**: 2026-05-27 PM, immediately after [D7](#d7-adopt-file-extracted-active-context-pattern-pattern-b)
landed, the user noticed the `assignee: AnhMTV` line in
[US-1.1](sprints/stories/US-1.1-koni-docs-initial-release.md) and
asked: "Bổ sung thêm trong skills luôn sử dụng github login thay
cho assignee." `AnhMTV` is the maintainer's git `user.name`; the
matching GitHub login is `saltict`. The mismatch had silently
propagated to four story files. D7 explicitly deferred RULE-15
("filed as follow-up for a later EPIC-1 sprint") — the user
overrode that deferral and pulled the rule into the current
sprint.

**Decision**: Adopt **RULE-15** in the `koni-docs` core catalog. The
rule expands the catalog from 9 to 10 project-agnostic rules.

- `assignee:` in every koni-docs artifact MUST be the contributor's
  GitHub login (the `username` half of `github.com/<username>`).
- NEVER git `user.name`. NEVER a display name. NEVER an email handle.
- Severity: BLOCKER (same tier as RULE-1, RULE-2, RULE-5, RULE-6).
- Applies to: story frontmatter, sprint scope-table assignee columns
  (where present), `.active-context.md` "Local developer.GitHub login",
  CONTEXT / LESSONS authorship attribution (where recorded).
- Comply via `gh api user --jq .login` for self, `gh api users/<guess>`
  to validate a teammate's login.

**Rationale**: GitHub login is the only identifier that survives across
@-mentions, PR reviewer assignment, `gh api users/<login>`,
CODEOWNERS, and audit attribution. Git `user.name` is per-machine
and per-developer; a mismatched `assignee:` silently breaks every
downstream lookup (PR ping never fires, CODEOWNERS skips them,
status reports route to the wrong person). The cost of fixing now
(2-point story, ~20 minutes of work, 1 grep-check) is dramatically
less than the cost of repeatedly chasing "why didn't @AnhMTV get
pinged on this PR" across the team's lifecycle.

**Alternatives considered**:
- **Stay deferred** (as D7 originally said) — rejected: the user's
  prompt was a strong signal that the cost-of-delay is already
  visible (they noticed within hours of D7 landing). Defer was the
  wrong default.
- **Allow either git user.name OR GitHub login** — rejected: a soft
  rule is unenforceable; the whole point of catalog rules is one
  canonical value per identifier.
- **Add to a plugin skill (e.g. `koni-supabase`)** — rejected: RULE-15
  is stack-agnostic. Every Koniverse project on every stack hits the
  same `gh api / CODEOWNERS / @-mention` surface.

**Impact**:
- Codified as PRD AD-8, FR-12.
- Skill: [`references/rules.md`](../skills/koni-docs/references/rules.md)
  gets a new §RULE-15 (BLOCKER, full grep checks).
- Skill: [`SKILL.md`](../skills/koni-docs/SKILL.md) §2 — "9 rules"
  → "10 rules", new row.
- Skill: [`references/templates/story.md`](../skills/koni-docs/references/templates/story.md)
  frontmatter `assignee:` comment now flags MANDATORY + names
  the `gh api user --jq .login` lookup.
- This repo: four pre-existing stories (US-1.1, US-2.1, US-2.2,
  US-2.3) get `assignee: AnhMTV` → `assignee: saltict`.
- Story [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md)
  tracks the work; ships in v0.2.0 alongside US-1.2.
- US-1.2's "What we did NOT do" trimmed: RULE-15 removed from
  deferred list; RULE-16 (bare-semver `version_shipped`) remains
  the only deferred companion convention.

**Follow-up (still deferred)**:
- **RULE-16** (bare-semver `version_shipped`). Documented in
  Koni-Finance-Final's CLAUDE.md; would close
  [LESSONS §4](LESSONS.md) cleanly. Needs template touch-ups
  across story / epic / sprint / PRD frontmatter AND a sweep of
  this repo's existing `version_shipped: 0.1.0` values. Filed as
  US-1.4 for the next sprint.

**Date**: 2026-05-27
**Version**: v0.2.0
**Reference**: Koni-Finance-Final RULE-15 (CLAUDE.md L29-50).

---

### D9. AGENTS.md is canonical; CLAUDE.md is a thin pointer

**Context**: 2026-05-27 PM (third request in the same session, after
[D7](#d7-adopt-file-extracted-active-context-pattern-pattern-b) Active
Context split and [D8](#d8-adopt-rule-15--assignee-is-the-github-login-never-git-username)
RULE-15). The user pointed at Koni-Finance-Final's
[`CLAUDE.md`](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md)
line 3: *"This project uses **[AGENTS.md](AGENTS.md)** as the single
source of truth for all AI instructions — phase gates, skill selection,
review sequence, task lifecycle, commit discipline, and behavioral
guidelines."*

This repo's first-pass `CLAUDE.md` ([US-2.1](sprints/stories/US-2.1-bootstrap-docs-structure.md))
shipped with `## Quick start` and `## Documentation` sections that
duplicated content from `AGENTS.md` (the duplication was introduced
when CLAUDE.md was authored without first checking AGENTS.md's existing
scope). Drift hazard: when project structure changes, you have to
remember to update both files; in practice one drifts and an agent
reads stale guidance.

**Decision**: Adopt the convention **AGENTS.md is the single source of
truth for all AI instructions; CLAUDE.md is a thin pointer** that holds
only the Claude-Code-specific activation surface.

- **What stays in CLAUDE.md**:
  1. One-line pointer to AGENTS.md as canonical.
  2. `## Koni-Docs Integration` config block (`plugins`, `docs_path`,
     `active_sprint`, `version_file`).
  3. `## Active Context` — Pattern A inline OR Pattern B pointer.
  4. Claude-Code-specific routing/behavioral blocks (none today; if
     the repo adopts agentcohort or custom slash commands later, they
     land here).
- **What goes in AGENTS.md**: project purpose, structure, conventions,
  skill catalog, quick-reference, Koni-Docs reference block, and the
  consolidated Documentation links (BRIEF / PRD / ARCH / CONTEXT /
  LESSONS / SETUP / sprints / VERSION / CHANGELOG).
- **Convention is recommended, not enforced.** No new RULE-N is added.
  Some Koniverse projects may legitimately prefer CLAUDE.md primary
  (e.g. a Claude-Code-only internal tool). The skill documents it as
  the recommended shape, with rationale, so consumers can opt in.

**Rationale**:

- **Multi-agent reach.** Cursor, Gemini, Codex CLI, Copilot CLI all
  read `AGENTS.md` natively. Claude Code reads both. Durable content
  in AGENTS.md reaches every agent.
- **Single source of truth.** Drift between two copies of the same
  content is the recurring papercut this convention prevents.
- **Stacks cleanly with Pattern B (D7).** With Active Context already
  in `.active-context.md` (gitignored), slimming CLAUDE.md to a near-
  static pointer means CLAUDE.md edits drop to "almost never" — and
  the few remaining edits are well-isolated config-block changes that
  don't conflict.

**Alternatives considered**:

- **Symlink CLAUDE.md → AGENTS.md** — rejected: defeats the
  Claude-Code-specific surface (Koni-Docs Integration + Active Context
  pointer must live in CLAUDE.md). Symlinks force identical content.
- **Keep CLAUDE.md duplicated, accept drift** — rejected: drift is the
  problem this decision is solving.
- **Make it a numbered RULE-17** — rejected: project-level architecture
  preference, not a BLOCKER invariant. Recommendation > enforcement.

**Impact**:

- Codified as PRD AD-9, FR-13 (cross-cuts EPIC-1 + EPIC-2).
- Skill: [`references/templates/integration.md`](../skills/koni-docs/references/templates/integration.md)
  §3 split into §3.1 (new convention with filled examples) and §3.2
  (existing Koni-Docs Reference Block).
- Skill: [`SKILL.md`](../skills/koni-docs/SKILL.md) §5 activation table
  adds a row for "make AGENTS.md canonical" / "slim CLAUDE.md".
- This repo: `CLAUDE.md` slimmed from 40 → ~27 lines (US-2.4);
  `AGENTS.md` gains canonical preamble + `## Documentation` section +
  updated structure diagram + two-convention pointer block.
- Two new stories in sprint-2026-W22: [US-1.4](sprints/stories/US-1.4-agents-canonical-convention.md)
  (skill side, 1pt) and [US-2.4](sprints/stories/US-2.4-apply-agents-canonical.md)
  (repo side, 1pt). Total sprint scope 15 → 17 points / 5 → 7 stories.

**Date**: 2026-05-27
**Version**: v0.2.0
**Reference**: Koni-Finance-Final CLAUDE.md L1-5.

---

### D10. Relocate `CHANGELOG.md` from repo root → `docs/CHANGELOG.md`

**Context**: First-pass [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md)
landed `CHANGELOG.md` at the repo root (a habit borrowed from
generic OSS projects). The koni-docs skill's own §0 orientation in
[`SKILL.md`](../skills/koni-docs/SKILL.md) explicitly places
`CHANGELOG.md` inside `docs/` — alongside BRIEF, PRD, ARCHITECTURE,
CONTEXT, LESSONS, SETUP. Two artifacts stay at repo root by skill
canon (VERSION + .env.example); CHANGELOG.md is NOT one of them.

The drift went unnoticed in the first dogfood pass because:
1. Many real-world OSS projects (Vue, React, Vite, …) put CHANGELOG
   at repo root.
2. Generic "Keep a Changelog" guidance also picks root.
3. Both habits override the skill canon if the agent's intuition
   isn't anchored.

User caught the location mismatch during the sprint-W22 retrospective
pass: "*Move change logs và đúng vị trí*".

**Decision**: Relocate `CHANGELOG.md` from repo root to
`docs/CHANGELOG.md`. Update every cross-reference (in
[docs/README.md](README.md) hub, [AGENTS.md](../AGENTS.md)
Documentation + Project structure, story files US-1.1 / US-2.3,
archived sprint W19, PRD §3 Phase-2 + §8 FR-8) to the new path.
Delete the repo-root copy.

**Rationale**:
- **Skill canon is the source of truth.** When the skill's §0
  orientation conflicts with intuition, the skill wins — that is the
  entire purpose of having a documented canonical layout. Letting
  this drift in our own dogfood repo would invalidate the skill we
  ship.
- **Co-location with other doc artifacts.** Reviewers reading
  `docs/PRD.md` Section "Phase X" expect to navigate sideways to
  `docs/CHANGELOG.md` to see what shipped — not to context-switch up
  one level to repo root.
- **Mirrors the agile-sync-up + changelog-backfill-commits scripts.**
  Both already take `--docs-path docs/` and read `CHANGELOG.md` from
  inside that path (commit `changelog-backfill-commits.mjs:N`). Moving
  the file there means the scripts work out-of-the-box without a flag
  override.

**Alternatives considered**:
- **Keep at repo root, change the skill canon to allow either.** —
  rejected: weakens the "one canonical layout" guarantee the skill
  sells consumers. If we accept root for ourselves, every consumer
  has to negotiate the choice individually.
- **Symlink root → docs/CHANGELOG.md.** — rejected: extra step on
  every clone, breaks on Windows. The agent should just use the path
  the skill recommends.

**Impact**:
- `docs/CHANGELOG.md` becomes the canonical file. Repo-root `CHANGELOG.md`
  deleted. Cross-references in 6 files updated (no dangling links).
- [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md) AC-2
  rewritten ("at repo root" → "at docs/, not repo root"); new AC-5
  for cross-reference cleanup; new TASK-2.3.4 for the relocation
  itself.
- [Archived sprint-2026-W19](sprints/archive/sprint-2026-W19.md)
  Retrospective grew a "What didn't" entry calling out the location
  miss as a lesson for future skill adoptions: trust the skill canon
  over general OSS habit.

**No follow-up needed**: this is a one-shot correction. The canon
itself doesn't change.

**Date**: 2026-05-27
**Version**: v0.2.0
**Reference**: [`skills/koni-docs/SKILL.md`](../skills/koni-docs/SKILL.md) §0 orientation.

---

## Phase 1 — Catalog expansion + docs preview tooling (2026-05-27 ..)

### D11. Adopt `@koniverse/docs-viewer` as the canonical docs preview CLI; create EPIC-4 separate from EPIC-3

**Context**: `Koni-Finance-Final` shipped an in-repo Astro 4 app at
`apps/docs/` that previews its `docs/` folder beautifully — file tree
sidebar, epic dashboard, shiki + mermaid, theme toggle. The same need
exists in every Koniverse project that adopts the koni-docs structure.
The choices in front of us were:

1. Copy `apps/docs/` into every consumer repo. (Status quo. ~85% code
   duplication, drift inevitable.)
2. Add it as a `koni-docs` skill artifact under `skills/`. (Conflates
   "instructions for AI agents" with "runtime program for humans" —
   forces a 30-50 MB Astro runtime into every skill consumer's agent
   context.)
3. Publish as a standalone npm CLI under `packages/`, distributed via
   `npx`, kept as a *companion artifact* to the skill.

User asked for option 3 on 2026-05-27, citing convenience ("chỉ cần
chạy `koni-docs-viewer` trong cli") and pointing at the
Koni-Finance-Final reference impl as ~85% reusable.

**Decision**: Build `@koniverse/docs-viewer` as a scoped npm package
under `packages/koni-docs-viewer/`. Migrate the reference impl from
static build (`getStaticPaths`) to Astro Node SSR (`@astrojs/node`
standalone) so docs edits land without rebuild. Make schema-graceful so
the same CLI works on a one-`README.md` folder and on a fully-sprinted
Koniverse repo. Create a new **EPIC-4 (Docs preview tooling)**
separate from EPIC-3 (skill catalog expansion). Add four functional
requirements FR-15..FR-18.

This decision bundles three sub-decisions, all logged together:

| # | Sub-decision | Lean | Final |
|---|---|---|---|
| D11.a | Package name | between `koni-docs-viewer` (unscoped) and `@koniverse/docs-viewer` (scoped) | `@koniverse/docs-viewer` (scoped — cleaner namespace, gates under the org) |
| D11.b | Repo location | `packages/`, `apps/`, or `skills/` | `packages/koni-docs-viewer/` (publishable code; "skills are for AI agents") |
| D11.c | EPIC home | EPIC-3 (fold under FR-10 "first non-docs Koniverse skill") or new EPIC-4 | New **EPIC-4 (Docs preview tooling)** — the viewer is a CLI for humans, not a "Koniverse skill" per the PRD §1 definition |

**Rationale**:

- **Skill vs package distinction matters.** Skills under `skills/` ship
  through `npx skills add` and are loaded into AI agent context.
  Packages under `packages/` ship through `npm publish` and run on
  developers' machines. Conflating them would force agent consumers to
  pay an Astro runtime cost they don't need, and would force human
  consumers to install via a CLI they don't use.
- **EPIC-4 separation prevents EPIC-3 scope creep.** EPIC-3 is about
  the plugin-skill *pattern* (how `koni-supabase` extends `koni-docs`
  rules). Bundling a CLI tool under the same epic would muddy the
  pillar boundary and make the epic harder to scope.
- **`@koniverse` scope future-proofs the namespace.** A future
  `@koniverse/cli`, `@koniverse/eslint-config`, etc. all sit under the
  same npm org. Easier brand recognition; org-level publish controls.
- **SSR over static build is non-negotiable.** A docs preview tool
  whose value prop is "see your edit instantly" cannot require a
  rebuild on every save.

**Alternatives considered**:

- **Stay with per-consumer `apps/docs/`.** Rejected — every Koniverse
  project re-implementing the same Astro app is exactly the kind of
  drift `koni-docs` was created to eliminate.
- **Build as a `koni-docs` skill artifact**. Rejected — see Skill vs
  package distinction above. Also: skills target ≤ 500 LoC SKILL.md
  body; the viewer source is ~1000 LoC across multiple files.
- **Use a static-site generator (Docusaurus, VitePress).** Rejected —
  the reference impl is already 85% done in Astro, and switching
  framework throws that work away for a marginal UX gain.
- **Lock-step versioning between viewer and Koni-Skills repo `VERSION`.**
  Lean: independent semver (see [spec §11.4](superpowers/specs/2026-05-27-koni-docs-viewer-design.md#still-open-for-plan-eng-review)).
  Still open for `/plan-eng-review`.

**Impact**:

- 4 new artifacts on disk:
  [spec](superpowers/specs/2026-05-27-koni-docs-viewer-design.md),
  [plan](superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md),
  [EPIC-4](sprints/epics/EPIC-4.md),
  [4 stories US-4.1..4.4](sprints/stories/).
- PRD §8 FR table gains FR-15..FR-18 (all `📋 backlog`).
- PRD §11 epics list gains EPIC-4.
- `.active-context.md` will refresh once the next sprint opens.
- Repo-root `VERSION` (currently `0.2.0`) does NOT bump — that file
  tracks the skill catalog, not the viewer.
- The four stories total 18 points — fits a one-developer one-week
  sprint when picked up.

**Open follow-ups** (tracked in spec §11 "Still open"):

- Independent semver vs lock-step (default: independent).
- Mermaid CDN vs bundled offline mode (default: CDN for v0.1).
- Tailwind v4 vs vanilla CSS (default: keep TW v4 from ref impl).

**Date**: 2026-05-27
**Version**: pending (v0.3.0 candidate when EPIC-4 ships)
**Reference**: [spec](superpowers/specs/2026-05-27-koni-docs-viewer-design.md), [plan](superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md), [EPIC-4](sprints/epics/EPIC-4.md).

---

### D12. `koni-setup` is a sibling skill that DELEGATES doc bodies to koni-docs (independence boundary)

**Context**: The user wanted a reusable skill to set up new Koniverse projects
fast, reusing the patterns already established across the six live repos
(`koni-devops`, `Koni-ERP-02`, `koni-growth`, `koni-landing`, `koni-training`,
`Senti-Quant`). The explicit ask was to build it "theo đúng chuẩn koni-docs …
nhưng khởi tạo để không xung đột với koni-docs và độc lập nhất có thể" — i.e.
follow the koni-docs standard, but keep the new skill independent and
non-conflicting. The open design question: where is the line between "setup"
and "docs management", given both touch the same `docs/` surface.

**Decision**: Ship `koni-setup` as a **day-0 orchestrator** that owns
scaffolding + skill wiring + skill-set install + repo-type detection +
onboard/audit, and **delegates every documentation-body need to koni-docs**
(the 12 rules, the PRD / story / epic / CHANGELOG / sprint templates, the
pre-commit doc checklist). koni-setup writes *empty scaffolds and the
integration surface*; koni-docs writes *content*. The skill states this
boundary at the top of SKILL.md and repeats it as a closing reminder, and never
reproduces a koni-docs template. File it under **EPIC-3** (catalog expansion) as
the realization of FR-10 ("first non-docs Koniverse skill"), plus a new FR-20
for the specific deliverable.

**Rationale**:

- **No duplication = no drift = no conflict.** The single biggest failure mode
  for two skills over the same `docs/` tree is divergent copies of the same
  template. By making koni-docs the sole owner of doc bodies, koni-setup can
  never disagree with it — there is nothing to disagree about.
- **Matches the EPIC-3 cross-cutting invariant** already on the books: "sibling
  skills MUST NOT duplicate koni-docs core; they extend or specialize." D12 is
  that invariant applied to a concrete skill.
- **Clean mental model**: koni-setup gets a repo to the starting line; koni-docs
  runs the race. Bootstrap vs. lifecycle.
- **Independent wiring**: koni-setup installs into `.claude/skills/` +
  `.agents/skills/` exactly like koni-docs (mirrored symlink), so the two are
  peers, neither importing the other's files — only invoking across the boundary.

**Alternatives considered**:

- **Fold setup into koni-docs as a new mode/subcommand.** Rejected — bloats the
  koni-docs SKILL.md past its ≤500-line budget and couples two concerns
  (one-time bootstrap vs. continuous doc discipline) that have different
  triggers and lifecycles.
- **Make koni-setup self-contained (copy the doc templates in).** Rejected —
  exactly the duplication/drift this decision exists to prevent; would also
  re-state the 12 rules in two places.
- **A new EPIC-5 for koni-setup.** Rejected — EPIC-3/FR-10 already reserved
  "first non-docs Koniverse skill"; koni-setup *is* that deliverable, so it
  belongs under EPIC-3, not a new epic.

**Impact**:

- New skill `skills/koni-setup/` (SKILL.md + 5 references) + repo wiring.
- US-3.2 + sprint-2026-W26; EPIC-3 backlog → in-progress; FR-10 shipped + FR-20
  added; VERSION 0.8.1 → 0.9.0; CLAUDE.md `active_sprint` → W26.
- Establishes the reusable boundary contract any future sibling skill follows.

**Date**: 2026-06-26
**Version**: 0.9.0
**Reference**: [US-3.2](sprints/stories/US-3.2-koni-setup-bootstrapper.md), [skills/koni-setup/SKILL.md](../skills/koni-setup/SKILL.md), [LESSONS §6](LESSONS.md).

---

### D13. `koni-harness` composes the existing toolchain + delegates; the gate is the one new primitive

**Context**: Research into "Harness Engineering" and "Agentic loops" for Koni
projects (referencing `Koni-ERP-02`, `Senti-Quant`, `koni-devops`) asked for a
**portable, standardized** harness (priority B) plus **orchestration** of the
agentic loop (priority D), running Claude-Code-first but compatible with
Gemini/Codex, **hybrid** (compose existing tools + add a few primitives), and —
the user's explicit constraint — organized so it **does not affect existing
data**. The audit showed Koni already owns every loop stage (BMAD / Superpowers /
gstack / koni-docs / koni-setup); the gap is the connective tissue + a portable
verification gate. The open design question: how does a new harness skill sit
over the same `docs/` + repo surface without conflicting with — or duplicating —
those tools.

**Decision**: Ship `koni-harness` as a **hybrid** skill that (1) *composes* the
existing toolchain via a tool-neutral **standard** (the six loop stages + the
gates between them), and (2) adds exactly **one new primitive** — a portable,
dependency-free POSIX pre-commit gate. It **delegates**: doc bodies → koni-docs,
scaffold → koni-setup, plan → BMAD, execute → Superpowers, review → gstack. It
reproduces none of them. Phase 1 (this decision) ships the standard + gate;
Phases 2 (loop orchestrator) and 3 (context-loader + multi-tool adapters + DAG)
are roadmap. Filed under EPIC-3 as FR-21 (a second non-docs Koniverse skill).

Two sub-decisions locked:

| # | Sub-decision | Choice | Why |
|---|---|---|---|
| D13.a | Gate config format | line-format `gates.conf`, not YAML | zero parser dependency (no `yq`) → genuinely portable to any tool/host; resolves the spec §9 open question |
| D13.b | Gate distribution | **vendored** into the consumer repo's `.koni-harness/` | self-contained, survives without the central checkout, works under Gemini/Codex on any machine |

**Rationale**:

- **Compose-don't-reinvent keeps the two skills conflict-free.** The gate calls
  `koni-docs validate`; it never re-implements koni-docs rules. Same boundary
  pattern as D12 (koni-setup) — sibling skills extend/orchestrate, never
  duplicate (the EPIC-3 cross-cutting invariant).
- **Additive-only is a hard invariant, by user mandate.** Adoption chains/wraps/
  merges behind reversible marker blocks and refuses to touch a foreign hook —
  never clobbers existing data. This is enforced in `install-gate.sh` and proven
  by an author-blind non-destructive verification (foreign hook left byte-intact;
  `settings.json` untouched; idempotent).
- **Portable core, thin adapter** satisfies "Claude-first but compatible": the
  gate-runner + config + checks are POSIX/plain-text; Claude `settings.json`
  hooks, git hooks, and a Gemini/Codex one-liner are all thin shims over the same
  runner.

**Alternatives considered**:

- **Fold the harness into koni-docs.** Rejected — couples one-time/continuous
  concerns and blows the koni-docs SKILL.md budget.
- **Build a full orchestrator / gate DSL now (option ② / ③ from brainstorm).**
  Deferred — B (portability) was the stated priority and the gate must exist
  before the loop that depends on it; a YAML DSL would add a `yq` dependency that
  breaks tool-neutrality. Orchestration is Phase 2.
- **Symlink the gate from the central repo instead of vendoring.** Rejected —
  breaks portability to machines/tools without the central checkout.

**Impact**:

- New skill `skills/koni-harness/` (SKILL.md + 4 references + gate-runner + 6
  checks + installer + 34-test harness) + repo wiring.
- US-3.3 + EPIC-3 FR-21; sprint-2026-W26 now 2 stories / 10 pts; VERSION
  0.9.0 → 0.10.0. Spec + Phase-1 plan under `docs/superpowers/`.
- Establishes the portable-gate primitive other repos (ERP-02, devops) can adopt
  additively, and the loop standard Phases 2–3 build on.

**Date**: 2026-06-27
**Version**: 0.10.0
**Reference**: [US-3.3](sprints/stories/US-3.3-koni-harness-agentic-loop.md), [spec](superpowers/specs/2026-06-27-koni-harness-agentic-loop-design.md), [plan](superpowers/plans/2026-06-27-koni-harness-phase1.md), [D12](#d12-koni-setup-is-a-sibling-skill-that-delegates-doc-bodies-to-koni-docs-independence-boundary).
