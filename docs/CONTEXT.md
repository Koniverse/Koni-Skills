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

---

### D14. Phase-built work is ONE story with phase sub-sections, not N stories

**Context**: koni-harness was tracked as five separate stories (US-3.3 P1,
US-3.4 P2, US-3.5 P3a, US-3.6 P2.5, US-3.7 P3b) — one per ship increment of a
single skill. On review the user flagged this as story sprawl: the tracker had
seven EPIC-3 stories where three real deliverables exist (koni-setup,
koni-harness, koni-nextjs/plugin-pattern). Fragmenting one skill's phased build
into one-story-per-version inflates the story count, scatters the AC across
files, and makes the epic harder to read.

**Decision**: When one skill/deliverable is built in sequential phases, track it
as **one story** with per-phase sub-sections (a version→commit table + AC grouped
by phase), not one story per phase. Applied retroactively: US-3.4..US-3.7 were
merged into **US-3.3** (consolidated koni-harness story, 16 pts, FR-21..25,
shipped across v0.10.0–v0.14.0); the four files were deleted. koni-setup (US-3.2)
and koni-nextjs/plugin-pattern (US-3.1) stay separate — they are distinct skills,
not phases of one.

**Rationale**:

- **A story is a deliverable, not a release.** Versions/commits record the
  increments; the story records the unit of work. Five versions of one skill are
  one story shipped five times, not five stories.
- **Less sprawl, same traceability.** The version→commit table + the append-only
  CHANGELOG (left intact — it keeps the per-phase v0.10.0–v0.14.0 history) fully
  preserve the increment-level record; the live tracker just stops duplicating it.
- **Right-sizing alignment.** Mirrors the harness's own "right-size the loop"
  tier model — scale the artifact to the work, don't multiply ceremony.

**What this does NOT change**: shipped versions, commits, and CHANGELOG history
are untouched (append-only). The superpowers spec/plan files (one per phase)
remain as point-in-time design artifacts.

**Going forward**: a multi-phase skill build opens ONE story up front; each phase
appends an AC sub-section + a version-table row at ship time. Split into separate
stories only when the pieces are genuinely independent deliverables.

**Date**: 2026-06-28
**Version**: 0.15.1
**Reference**: [US-3.3](sprints/stories/US-3.3-koni-harness-agentic-loop.md) (consolidated), [EPIC-3](sprints/epics/EPIC-3.md).

---

### D15. The loop's tool-split: implement with Anthropic Skills only; Superpowers + gstack are brainstorm/review

**Context**: the koni-harness loop originally mapped Execute → Superpowers and
Review → gstack generically. Operating it surfaced a sharper division of labour the
team wants enforced.

**Decision** (v0.17.0–0.17.1, refining [D13](#d13-koni-harness-composes-the-existing-toolchain--delegates-the-gate-is-the-one-new-primitive)):

- **Implement with Anthropic Skills only** (`frontend-design` for UI, etc.).
  **Superpowers + gstack never write feature code** — they are for brainstorm/plan
  (and gstack `/design-review` for the review stage) only. This keeps "who built
  this" unambiguous and planning rigor separate from execution craft.
- **The Review stage runs a fixed four-step order**: (1) spec-compliance →
  (2) **koni-qc** (the AC↔TC coverage gate) → (3) gstack **`/design-review`** (UI
  vs the repo's `DESIGN.md`) → (4) code-quality. So koni-qc and design-review are
  first-class review steps, not optional add-ons.
- **TDD stays the discipline** in Execute (test-first), but it is a *practice* —
  the implementation tool is an Anthropic Skill, not the Superpowers TDD skill.

**Why it matters**: it wires koni-qc and `/design-review` into the harness loop
(cross-skill composition), and makes the implement-vs-brainstorm boundary a hard
rule the pressure-tests verify.

**What this does NOT change**: koni-harness still *composes* and never reproduces
the tools it invokes (D13 holds); brainstorm/plan still use BMAD + Superpowers + gstack.

**Date**: 2026-06-30
**Version**: 0.17.2
**Reference**: [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md) (principle 7 + six-stage table), [loop-runner.md](../skills/koni-harness/references/loop-runner.md), CHANGELOG [0.17.0]–[0.17.2].

---

### D16. The test-doc/test-code organization standard lives in koni-qc; scaffolding is koni-setup's (koni-qc self-scaffolds as fallback)

**Context**: Senti-Quant matured a clean `docs/tests/` organization (2026-06-30
reorg). koni-qc only assumed `test-cases/EPIC-N.md` + a single `test-report.md`;
koni-setup scaffolded a thinner `test-reports/{runs,releases}` tree. We folded the
matured standard into the catalog.

**Decision** (v0.19.0, US-5.3, FR-28):

- **koni-qc owns the standard** — a new `references/test-organization.md`: the
  `docs/tests/` taxonomy (test-plan / test-cases / test-reports/EPIC-NN/<MMDDYYYY>/ /
  bug-bash / audits + standing docs), the **by-epic + file-suffix** test-code
  layout, the **3-place sync rule** (spec ↔ code ↔ coverage story), state-cleanup/
  idempotency, and the status legend.
- **TC-ID stays TYPE-based** (`TC-<EPIC>.<TYPE>-<n>`, per [`traceability.md`]) — we
  did **not** adopt Senti-Quant's GROUP-based codes. The file **suffix** carries run
  *cadence* (`.e2e`/`.smoke`/`.integration`/`.unit`), which is orthogonal to the TC
  TYPE (*category*: FUNC/NEG/BND/…). Feature grouping uses the existing domain-prefix
  allowance, not a scheme change. (Decision (a).)
- **Ownership of creation** (decision (b)): if the repo is bootstrapped by
  **koni-setup**, it creates the `docs/tests/` skeleton; if not, **koni-qc
  self-scaffolds** the missing tree. koni-docs still owns the doc-body templates.

**Why it matters**: every Koniverse repo now gets the same test surface, and the
"where does this test go" question has one answer — without breaking koni-qc's
TYPE-based traceability or the compose boundary (koni-qc never owns scaffolding
outright; it composes koni-setup + koni-docs).

**Date**: 2026-06-30
**Version**: 0.19.0
**Reference**: [test-organization.md](../skills/koni-qc/references/test-organization.md), [koni-setup scaffold-checklist.md](../skills/koni-setup/references/scaffold-checklist.md), source Senti-Quant `docs/tests/`, CHANGELOG [0.19.0].

---

### D17. The setup baseline is the Koniverse core trio (koni-docs + koni-harness + koni-qc) + the harness gate — not koni-docs alone

**Context**: koni-setup historically wired only **koni-docs** as the per-repo
baseline (harness/qc were optional, hand-added). Now that all three are mature, a
new repo should get the whole methodology stack on day 0.

**Decision** (v0.20.0, refines FR-20):

- **Baseline = the core trio**, all wired per-repo: koni-docs (docs lifecycle) +
  koni-harness (agentic-loop standard **+ the commit/release gate**) + koni-qc (QC
  methodology). koni-setup additionally **runs koni-harness `install-gate.sh`** so
  `.koni-harness/` + the pre-commit/pre-push hooks guard the repo from the first
  commit.
- **Order matters**: wire + install the gate **after** the `docs/` tree + VERSION
  exist, because the gate's `koni-docs-validate` / `changelog-anchor` /
  `version-phase` checks read them.
- **Boundaries unchanged** (D12/D13): koni-setup *scaffolds and wires*; it does not
  reproduce any skill — it symlinks them and invokes koni-harness's own installer.
  A repo with genuinely no test/QC surface may defer koni-qc, but the default is
  all three.

**Why it matters**: "set up a Koni repo" now yields a repo that documents, gates,
and QCs itself out of the box — the three skills compose instead of being wired by
hand one at a time (the #1 onboarding gap was a repo with docs but no gate/QC).

**Date**: 2026-06-30
**Version**: 0.20.0
**Reference**: [koni-setup SKILL.md](../skills/koni-setup/SKILL.md) (step 5 + verify), [skill-inventory.md](../skills/koni-setup/references/skill-inventory.md), [skill-wiring.md](../skills/koni-setup/references/skill-wiring.md), CHANGELOG [0.20.0].

---

### D18. Test coverage is organized by **user story**, not by epic (epic is the file container, US is the unit)

**Context**: koni-qc's test-organization (D16) framed everything "by epic"
(test-cases/EPIC-NN.md, test-reports/EPIC-NN/<date>/, app/tests/epic/EPIC-NN/).
Re-checking Senti-Quant's matured QA practice (the 2026-06-30 `QC-PLAN-BY-US`)
showed the epic is too coarse a unit for *coverage*: "EPIC-04 tested" hid that only
14 of its stories had a case. Coverage there is measured and planned **per US**
(12.5% = done-stories-with-a-case ÷ done-stories), even though the spec files stay
grouped per epic.

**Decision** (v0.21.0, refines FR-26/FR-28):

- **The unit of coverage, traceability, and QC planning is the user story (US)** —
  not the epic. Coverage % = (done stories with ≥1 covering TC) ÷ (done stories).
  The QC backlog is a **per-US, risk-tiered list** (Tier 1 security/money/external
  → Tier 2 core/perf → Tier 3 UI), captured as an `audits/QC-PLAN-BY-US-<date>.md`.
- **Every TC carries a mandatory `maps_to.us`** (plus `fr`/`ac`); the AC↔TC matrix
  is anchored per US (it already was). This is what makes per-US coverage computable.
- **Epic stays the file *container*** — spec files (`test-cases/EPIC-NN.md`), test
  code (`…/epic/EPIC-NN/`), and reports (`test-reports/EPIC-NN/<date>/`) still group
  by epic, and the **TC-ID stays TYPE-based with an epic namespace** (`TC-<EPIC>.<TYPE>-<n>`,
  D16) — the epic prefix is an ID namespace, not the coverage unit.

**Why it matters**: "epic tested" is a misleading metric; per-US coverage is the
honest, actionable one and drives a risk-ordered backlog. No file moves, no TC-ID
change — only the *granularity of measurement/planning* shifts from epic to US.

**Date**: 2026-06-30
**Version**: 0.21.0
**Reference**: [test-organization.md](../skills/koni-qc/references/test-organization.md) §0, [traceability.md](../skills/koni-qc/references/traceability.md), [qc-workflow.md](../skills/koni-qc/references/qc-workflow.md), source Senti-Quant `QC-PLAN-BY-US-2026-06-30.md`, CHANGELOG [0.21.0].

---

### D19. ≥95/100 skill-grading is the catalog standard; re-grade the whole skill after any change

**Context**: koni-qc's skill-grading (FR-27) shipped with a soft bar ("≥90 ship;
≥95 foundational"). Grading the catalog showed every shipped skill can reach the
mid-90s (koni-harness 96, koni-qc 97, koni-setup 96), and that a "passing" skill
silently slipped to ~91 after later edits because only the *diff* was re-reviewed,
not the whole skill. Both gaps are now closed by a firm standard.

**Decision** (v0.22.0, refines FR-21/FR-27):

- **The pass bar is ≥95/100 for every skill in the catalog** — not 90. A skill that
  scores <95 does **not** pass the koni-harness **Review** stage; fix and re-grade
  until it clears 95. Foundational/high-blast-radius skills may set a higher bar,
  never lower.
- **Re-grade the *whole* skill (all four dimensions), not just the changed file**,
  after *any* edit to a skill that already passed — a change can drop a dimension
  elsewhere (a new reference drifts a rule; a description edit shifts triggering).
  Never infer "still ≥95" from a passing review of the change alone.
- **Enforced where**: koni-qc `skill-grading.md` (the bar + the re-grade rule) and
  the koni-harness Review stage (`agentic-loop-standard.md` + `loop-runner.md`),
  which runs skill-grading whenever the deliverable is a skill.

**Why it matters**: "≥95 or it doesn't ship" makes skill quality a hard gate, not a
suggestion, and the whole-skill re-grade rule prevents the exact silent-regression
(95 → 91) that prompted this. The four dimensions stay: triggering · rule-robustness ·
author-blind content · best-practices, D4 variance-averaged ×2.

**Date**: 2026-06-30
**Version**: 0.22.0
**Reference**: [skill-grading.md](../skills/koni-qc/references/skill-grading.md), [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md), [loop-runner.md](../skills/koni-harness/references/loop-runner.md), [LESSONS §8](LESSONS.md), CHANGELOG [0.22.0].

---

### D20. Unit tests are a distinct layer *below* the AC↔TC matrix — Dev authors, koni-qc gates, harness Self-verify enforces

**Context**: the loop had a TDD *discipline* line in Execute and a "tests green"
Self-verify, but **no per-function unit-test process and no unit-coverage gate** —
a logic-bearing change with zero unit tests still passed Self-verify if the build
was green. koni-qc's coverage gate is the **AC↔TC matrix**, which is per *user
story* (functional/e2e/integration), not per function.

**Decision** (v0.23.0, US-5.4, FR-29; refines FR-21 + FR-26):

- **Two complementary test layers.** *Unit* proves each function/branch in
  isolation (per function); the *AC↔TC matrix* proves each story's behaviour (per
  US). A feature needs both — neither substitutes for the other.
- **koni-qc owns the unit-coverage *standard*** (`references/unit-coverage.md`: the
  per-function rule — happy + each branch + boundary + error path — the RED→GREEN→
  REFACTOR cycle, and the coverage bar, default ≥80% line-and-branch on changed
  code). **Dev authors** the unit tests during Execute; the **repo's runner**
  (vitest/jest/pytest) executes them. koni-qc never runs or writes them.
- **koni-harness drives + gates it.** *Execute* does per-function TDD; *Self-verify*
  becomes a real gate — new/changed logic must have unit tests meeting the bar
  ("build green" alone no longer passes). A `unit-coverage` `passthrough` gate check
  (repo coverage command with a threshold) is the deterministic backing.
- **Granularity chosen: both** (Execute drives + koni-qc gates), per the request —
  not one or the other.

**Why it matters**: the loop now proves code at *two* levels — every function (unit)
and every story (AC↔TC) — closing the "green build, zero unit tests" hole. The old
"unit = Dev owns, QA skips" framing becomes "Dev authors, koni-qc gates": authorship
stays with Dev, the *standard and the gate* are koni-qc's.

**Date**: 2026-06-30
**Version**: 0.23.0
**Reference**: [unit-coverage.md](../skills/koni-qc/references/unit-coverage.md), [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md) (Execute + Self-verify), [loop-runner.md](../skills/koni-harness/references/loop-runner.md), [gate-catalog.md](../skills/koni-harness/references/gate-catalog.md), CHANGELOG [0.23.0].

### D21. koni-qc ships the automation spine (generate → report → sync → CI), not just authoring — the delegated "run/report tooling" is now a defined contract

**Context**: koni-qc was deployed from scratch on **koni-erp-02** (2026-07-01) and
the agent **could not automate the test workflow**. Evidence: 12 `test-cases/EPIC-*.md`
specs authored + a whole-project coverage audit — but every TC `— (manual)`, no
`tests/epic/` tree, `test-reports/` empty, zero story write-back, no `.github/workflows`.
The skill was complete on the **authoring** half yet delegated *running/gating* to
tooling it named but never defined ("gstack `qa`", "a repo `/run-test`", "the run/report
tooling") — and omitted spec→test **generation** + the tree scaffold. An author-blind
analyst ranked five gaps: (1) no spec→runnable-test generation, (2) `tests/epic/` never
materialised, (3) no reporter contract, (4) no code→story sync mechanism, (5) no
CI-gate/runner bootstrap.

**Decision** (v0.24.0, US-5.5, FR-30; completes FR-21/FR-26/FR-29):

- **koni-qc defines the automation spine** in `references/test-automation.md`:
  §1 **Generate** (spec → runnable TC-ID-named test + materialise `tests/epic/EPIC-NN/`,
  write `Covered-by` back), §2 the **reporter contract** (runner JSON → parse the
  leading TC-ID token → `report.md`), §3 **story write-back** (Status + coverage% +
  link), §4 **CI gate + runner bootstrap** (`test:cov` at ≥80% + `.github/workflows` +
  `gates.conf` rows). Portable across vitest/jest/pytest/playwright.
- **The delegated tooling is now a contract, not a name-drop.** The phantom
  "automated by gstack `qa` or a repo `/run-test`" assertions are removed;
  `qc-workflow.md` gains a **§3b Generate** stage and runs code tests via the
  runner+reporter (gstack `/design-review` scoped to UI); "a CI test gate exists" is a
  Release exit criterion.
- **Ownership holds** (D-series invariant): koni-qc contributes the *contracts +
  procedure* (portable, no vendored binary); the repo's runner executes; koni-harness/CI
  enforces. koni-qc still never runs a test — it now *specifies how the run happens*.

**Why it matters**: the koni-erp-02 stall — "specs written, `— (manual)`, nothing
runs" — is exactly the failure a QC skill must prevent. Authoring without a running,
self-reporting, CI-gated loop is a half-skill; D21 closes the half that blocked full
automation, grounded in a real deployment rather than a hypothetical.

**Date**: 2026-07-01
**Version**: 0.24.0
**Reference**: [test-automation.md](../skills/koni-qc/references/test-automation.md), [qc-workflow.md](../skills/koni-qc/references/qc-workflow.md) (§3b + §Execute + §Release), [test-organization.md](../skills/koni-qc/references/test-organization.md) (§3 sync), [unit-coverage.md](../skills/koni-qc/references/unit-coverage.md), [US-5.5](sprints/stories/US-5.5-test-automation.md), CHANGELOG [0.24.0].

### D22. A standard stated in prose drifts; scaffold the shape and reject the deviation — the ERP-02-vs-Senti-Quant test-doc lesson

**Context**: Koni-ERP-02 adopted the koni-qc test-doc standard but **drifted from
Senti-Quant** (the reference repo the standard was synthesized from). An author-blind
audit of both `docs/tests/` trees + test-code layouts against the koni-qc yardstick
found 10 deviations, the structural ones being: run output at a flat
`test-reports/<YYYY-MM-DD>/` (no `EPIC-NN` level, ISO date) instead of
`test-reports/EPIC-NN/<MMDDYYYY>/`; all suites flat at `tests/*.test.ts` with **no**
`tests/epic/` tree; the whole-repo strategy overloaded into `test-plan/README.md`
(no `STRATEGY.md`); an ad-hoc `PROPOSED:` `Covered-by` value; and spec TC-IDs
colliding with Dev-authored unit-file IDs. The common root cause: **the skills
*stated* the standard in prose but nothing created the shape at bootstrap or rejected
the drift at first run** — koni-setup scaffolded only the `docs/tests/` doc tree,
never the `<app>/tests/epic/` code root, and the report path was a diagram, not a MUST.

**Decision** (v0.25.0, US-5.6, FR-31; refines FR-26/FR-28/FR-30):

- **Scaffold the shape, don't just describe it.** koni-setup now bootstraps **both**
  trees (`docs/tests/` **and** `<app>/tests/epic/`) + `STRATEGY.md` + `test-cases/README`,
  and koni-qc's self-scaffold snippet does the same — a first run can no longer invent
  its own layout because the layout already exists.
- **Make the invariants MUSTs with checkers.** The report path is a MUST + validator
  regex (`EPIC-NN` grouping, `MMDDYYYY` not ISO, no flat `<date>/`); the flat
  `tests/*.test.ts` layout is non-conformant and migration is a step, not "as you go";
  the reporter flags off-tree suites and TC-ID orphans/collisions. onboarding-audit
  gains matching drift checks.
- **Legitimize the real need, name one home.** `PROPOSED:<path>::name` is blessed as
  the third `Covered-by` state (planned automation, counts *uncovered*) — fresh
  adoptions are mostly this; and whole-repo strategy has exactly one home
  (`docs/tests/STRATEGY.md`), `test-plan/` staying per-epic. The spec is the **sole
  authority** for a TC-ID (no Dev-authored unit-file collisions).
- **Ownership stays clean across the trio.** koni-qc owns the *standard + path*,
  koni-docs owns the report *body* template (its legacy `test-reports/runs/…` path is
  reconciled to the unified layout), koni-setup *scaffolds* both trees. The pervasive
  koni-docs `Docs/`→`docs/` casing is logged as a separate follow-up (out of scope).

**Why it matters**: one deployment drifting is a bug report; the *pattern* — a prose
standard with no scaffold and no checker drifts on every fresh adoption — is the
lesson. D22 converts the standard from "documented" to "generated and enforced" so
the next repo gets the Senti-Quant-grade structure by default, not by diligence.

**Date**: 2026-07-01
**Version**: 0.25.0
**Reference**: [test-organization.md](../skills/koni-qc/references/test-organization.md), [test-automation.md](../skills/koni-qc/references/test-automation.md) (§2/§4), [traceability.md](../skills/koni-qc/references/traceability.md) (Covered-by), [scaffold-checklist.md](../skills/koni-setup/references/scaffold-checklist.md), [onboarding-audit.md](../skills/koni-setup/references/onboarding-audit.md), [test-report.md](../skills/koni-docs/references/templates/test-report.md), [US-5.6](sprints/stories/US-5.6-test-doc-standardization.md), CHANGELOG [0.25.0].

### D23. Whole-project QC needs a layer above the per-epic lifecycle: a QA-tracking epic, a Definition-of-Done, and a depth bar — else it ships specs-only and thin stubs

**Context**: a koni-qc learning note from Koni-ERP-02 (`docs/tests/audits/
koni-qc-learning-2026-07-01.md`, ERP LESSONS §213) found that running koni-qc
end-to-end still produced a result **worse than Senti-Quant** on five whole-project
concerns the skill left to operator memory: (1) no dedicated QA-tracking epic — QC was
filed as 2 stories under a feature epic, vs Senti's `EPIC-37 "Test & QA Coverage
Tracking"` (~30 `US-37.X`: one coverage story per app epic + infra/process stories);
(2) `test-plan/`/strategy left empty (no author-the-strategy step); (3) misplaced
artifacts (`QC-PLAN-BY-US` at root, baseline report at flat `test-reports/<date>/`);
(4) execution never run — QC declared "done" on specs-only; (5) 21 stories bulk-
generated as ~30-line stubs and called done (rewritten to 123-140 lines each). The
per-epic `qc-workflow.md` is sound; what was missing is the *whole-project orchestration
+ completion gate* above it.

**Decision** (v0.26.0, US-5.7, FR-32; refines FR-26/FR-28/FR-30/FR-31):

- **New `references/whole-project-qc.md`** — the layer above the per-epic lifecycle:
  §1 stand up the **QA-tracking epic** (a coverage story per app epic + infra/process
  stories + the **QA ownership model** — dev authors spec+code, koni-qc AI owns the
  review side); §2 **author the strategy** (`STRATEGY.md` + per-epic `test-plan/`);
  §3 **artifact-location MUSTs** (`audits/QC-PLAN-BY-US-<date>.md`, per-epic dated
  reports); §4 **execution required** (≥1 real `report.md`, not specs-only); §5 a
  whole-project **Definition-of-Done** checklist; §6 the **depth bar** — "creating a
  file is not authoring it", refuse to close a create step below bar, spot-check 3.
- **Enforced, not just described.** The DoD is a gate koni-qc checks before declaring
  whole-project QC done; the depth bar is cross-linked into `quality-bar.md`; the
  QC-PLAN location is a MUST in `test-organization.md` §0; `qc-workflow.md` §Frame
  routes whole-repo scope through the new file.
- **Ownership holds.** koni-qc owns the method + the done-bar; the QA-epic stories are
  authored via **koni-docs** templates, the tree scaffolded by **koni-setup**, execution
  by **gstack** + the repo runner, the gate by **koni-harness** — koni-qc invokes, never
  reproduces them.

**Why it matters**: D22 made the *structure* generate + enforce itself; D23 does the
same for the *process* — a QA backlog with per-epic visibility, a strategy, real run
reports, and a depth bar mean whole-repo QC reaches the Senti-Quant bar by procedure,
so "looks tracked but is empty" stops being the default outcome of a fresh adoption.

**Date**: 2026-07-01
**Version**: 0.26.0
**Reference**: [whole-project-qc.md](../skills/koni-qc/references/whole-project-qc.md), [qc-workflow.md](../skills/koni-qc/references/qc-workflow.md) (§Frame), [test-organization.md](../skills/koni-qc/references/test-organization.md) (§0), [quality-bar.md](../skills/koni-qc/references/quality-bar.md) (depth bar), [US-5.7](sprints/stories/US-5.7-whole-project-qc.md), CHANGELOG [0.26.0].

### D24. koni-harness gains a multi-agent execution mode: a parallel sprint swarm (worktree per story) + within-story fan-out — orchestration around the loop, not a new loop

**Context**: koni-harness drove work **single-agent** — `loop.sh` runs one story through
the six stages; `sprint.sh` (read-only) only *suggests* the next dependency-ready story,
so an agent runs them one at a time even when several independent, ready stories could run
concurrently. Two enabling pieces already existed: `sprint.sh` computes the ready set over
the `depends_on` DAG, and `loop.sh` takes `--state PATH` (N concurrent loops, zero shared
state). What was missing was the orchestration layer + an isolation model for parallel
writers (the harness is additive-only, so parallel edits to one tree are unsafe).

**Decision** (v0.27.0, US-3.8, FR-33; extends FR-21/FR-22/FR-24):

- **Two tiers of parallelism** (both, per the user's choice): **Tier A — sprint swarm**
  runs whole *stories* concurrently, wave-by-wave over the DAG (one worker per ready
  story); **Tier B — within-story fan-out** runs a stage's *independent sub-tasks* at once
  (the four read-only Review passes, per-function TDD on disjoint files, the four
  skill-grading dimensions). Neither changes the six stages or the gates.
- **Isolation = one git worktree per story** (the user's choice) — matches Claude's native
  `isolation:'worktree'` and the additive-only invariant; each worker has its own edits,
  `--state` loop-state, and in-worktree gate. **The gate runs twice**: per worktree at
  `work-commit`, then again on an **integration branch** after the wave merges (integration
  is where cross-story conflicts surface). A **human owns the final merge** to the default
  branch — the swarm never auto-pushes `main`.
- **Planner in core, spawning in adapter** (the portability contract): `swarm.sh` is a
  **read-only** wave planner (emits the worktree + `loop.sh` worker command per ready
  story + the integrate/re-plan step); it **single-sources readiness from `sprint.sh`**
  and never re-derives the DAG, spawns an agent, or writes state. *Spawning* is the thin
  per-tool adapter (Claude Agent/Workflow with worktree isolation); tools without parallel
  agents run the identical plan sequentially — parallelism is an optimization, never a
  correctness requirement.

**Why it matters**: the sprint's wall-clock drops from sum-of-stories to
sum-of-DAG-depth-waves, while the safety model is unchanged — the gate still fires per
worktree and again at integration, and a human still approves the merge. The harness
stays tool-neutral (the plan is POSIX; only spawning is per-tool) and additive-only (each
worker is isolated in its own worktree). A `set -e` bug in `swarm.sh` (a trailing
`[ test ] && echo` returning non-zero) was caught by the new `swarm-test.sh` before ship.

**Date**: 2026-07-01
**Version**: 0.27.0
**Reference**: [parallel-orchestration.md](../skills/koni-harness/references/parallel-orchestration.md), [swarm.sh](../skills/koni-harness/scripts/swarm.sh), [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md) (execution modes), [loop-runner.md](../skills/koni-harness/references/loop-runner.md), [sprint-sequencer.md](../skills/koni-harness/references/sprint-sequencer.md), [US-3.8](sprints/stories/US-3.8-harness-parallel-orchestration.md), CHANGELOG [0.27.0].

### D25. First product/client skill — `koni-agent-monitoring`: content-free by construction, built through the harness

**Context**: the ERP shipped Agent Ops (ingest API, token mint, Live/History dashboard —
Koni-ERP-02 EPIC-13, through US-13.6) but had no **client** — the per-machine piece that
watches Claude Code transcripts and reports usage. A FINAL handoff spec
(`Koni-ERP-02/docs/handoffs/2026-07-01-koni-agent-monitoring-client.md`) asked for it to be
built in koni-skills. This is the catalog's **first product/client skill**: unlike the
meta-skills (koni-docs/qc/harness/setup) that ship *method*, it ships **runnable code** — a
reporter + installer that run on staff machines.

**Decision** (v0.28.0, US-6.1, FR-34; new EPIC-6):

- **Content-free by construction is the defining invariant.** The client streams metrics +
  light activity, **never** prompt text, code, or tool input/output. Enforced in three
  layers (defence in depth): `projectLine` extracts only names/counts/paths; `buildBatch`
  writes only allowlisted keys; `pick()` filters the final `session`/`events`/`metadata` to
  the strict allowlist. The **only** prompt-derived field is a capped `task_summary`
  (≤300, single line). A **mandatory content-leak test** (`leak-test.mjs`) proves the whole
  chain — the client half of the ERP's schema-rejection guarantee (ERP LESSONS §214).
- **Pure-core / thin-I/O split.** All privacy + pricing logic is a pure, stdlib-only module
  (`agent-report-core.mjs`) so the leak test exercises the exact code that builds the wire
  payload; `report.mjs` is only fs/queue/detached-drain/backoff. **Never blocks the editor**
  — the hook enqueues and returns; the POST resolves in a detached child.
- **The ERP schema wins.** The client mirrors `POST /api/agent-ops/ingest`; on any
  disagreement the schema is authoritative. No double-count (byte-offset advances only past
  complete lines); `seq` is the per-session idempotency key; resends are safe.
- **Built through koni-harness** at tier 2; Review used koni-qc **skill-grading** (≥95, D19)
  plus an author-blind code review of the reporter. The installer follows the harness
  "settings.json is merged manually" invariant (opt-in `--merge-hooks` via jq + backup).

**Why it matters**: it proves the catalog can host **product/client** skills (with real code
+ tests), not only methodology skills, and it sets the bar that such a skill's privacy/safety
guarantee must be *tested*, not asserted. The content-free boundary makes org-wide agent
observability adoptable without a surveillance tradeoff.

**Date**: 2026-07-01
**Version**: 0.28.0
**Reference**: [koni-agent-monitoring SKILL.md](../skills/koni-agent-monitoring/SKILL.md), [privacy-allowlist.md](../skills/koni-agent-monitoring/references/privacy-allowlist.md), [agent-report-core.mjs](../skills/koni-agent-monitoring/scripts/agent-report-core.mjs), [leak-test.mjs](../skills/koni-agent-monitoring/scripts/__tests__/leak-test.mjs), [EPIC-6](sprints/epics/EPIC-6.md), [US-6.1](sprints/stories/US-6.1-koni-agent-monitoring.md), CHANGELOG [0.28.0].

### D26. The loop captures lessons, not just reads them — an explicit `LESSONS.md` step at the Doc + Version gate

**Context**: an audit of the koni-harness flow found the loop only **read** `LESSONS.md`
(Execute "skims" it; context-load indexes its titles) but never had an explicit step to
**write** one. Lesson-writing existed only as a conditional line in koni-docs' pre-commit
checklist ("LESSONS.md has new entry if a trap was discovered") — a koni-docs reminder, not
a named koni-harness loop step, and the loop's Doc + Version gate never mentioned it. Ironic
given how often recent work cited high-value lessons (ERP LESSONS §9/§213/§214) the loop
had no step to produce.

**Decision** (v0.29.0; refines FR-21 — no new capability, a process step):

- **Capture lessons at the Doc + Version gate.** If Review or Execute surfaced a trap, a
  tool/library quirk, a non-obvious gotcha, or a time-saving fix, append a `LESSONS.md`
  entry — via koni-docs [`templates/lessons.md`](../skills/koni-docs/references/templates/lessons.md)
  (append-only, numbered `## <n>.`) — in the **same commit** as the code + CHANGELOG +
  CONTEXT. The loop now **reads** lessons at Execute and **writes** them at the Doc-gate.
- **Conditional process step, deliberately not a deterministic gate.** Like CONTEXT ("new
  entry *if* a decision was made"), it fires only when there's a real lesson — capture only
  genuine ones, never filler. It is **not** a gate check: "was a lesson learned?" is a
  judgment the gate-runner can't make, and a check that fired on every code commit would be
  pure noise (harness principle: add a gate only for a real, deterministic failure).
- **Compose, don't reproduce.** koni-docs owns the LESSONS.md template + the checklist item;
  koni-harness only names *when in the loop* it happens (Doc-gate) and *when to read it*
  (Execute). Wired into `agentic-loop-standard.md` (capture rule + context-layer note),
  `loop-runner.md` (doc-gate drive), `example-loop.md` (worked write), and SKILL.md.

**Why it matters**: closing the read→write loop makes the harness *accumulate* institutional
knowledge, not just consume it — the mechanism that produced the §-numbered lessons this very
project keeps leaning on. Keeping it a process step (not a gate) preserves the harness's "gates
are deterministic, process is judgment" split.

**Date**: 2026-07-01
**Version**: 0.29.0
**Reference**: [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md) (capture rule + Doc-gate), [loop-runner.md](../skills/koni-harness/references/loop-runner.md) (doc-gate drive), [example-loop.md](../skills/koni-harness/references/example-loop.md), [templates/lessons.md](../skills/koni-docs/references/templates/lessons.md), CHANGELOG [0.29.0].

### D27. UI design-review conformance requires **DESIGN.md + the shadcn standard** — mandatory, authored in test design, enforced at Review

**Context**: the design-review gate (koni-qc `nfr.md`, the `UI` TC type, the koni-harness
Review stage) only cited the repo's `DESIGN.md`. But Koniverse UI repos are built on
**shadcn/ui** (koni-setup vendors it; the koni-docs design-spec template names shadcn
primitives), and a UI that "works" + matches DESIGN.md can still be wrong if it hand-rolls
a component, bypasses the design tokens, or strips the Radix a11y. shadcn conformance was an
unstated expectation, so it wasn't a test case and wasn't gated.

**Decision** (v0.30.0; refines FR-26 (koni-qc) + FR-21 (koni-harness) — no new capability):

- **Two-part, mandatory visual contract.** Every UI-bearing case MUST pass gstack
  `/design-review` against **both** `DESIGN.md` **and** the shadcn standard. The canonical
  criteria live once in koni-qc [`nfr.md`](../skills/koni-qc/references/nfr.md) §UI: shadcn/ui
  primitives (don't re-invent), the repo's design tokens/theme (Tailwind vars + `components.json`,
  no ad-hoc hex/px), `cva`+`cn()` variants, preserved Radix a11y. Everything else points at it.
- **Authored in test design, not discovered at Execute.** koni-qc `test-design.md` step 8 +
  `qc-workflow.md` Design make it a rule: a UI AC is **not done** until it has a
  `TC-<EPIC>.UI-<n>` whose pass condition is "passes `/design-review` vs DESIGN.md + shadcn".
  The `UI` TC type (`traceability.md`) and Execute both carry the two-part requirement.
- **Enforced at the harness Review stage.** The fixed four-step Review's design-review step
  (agentic-loop-standard, loop-runner, example-loop, parallel-orchestration) now reads "UI vs
  DESIGN.md **+ the shadcn standard**, both mandatory". It stays a **process step** (gstack
  `/design-review` is judgment, not a deterministic gate) — consistent with the harness split.
- **Repo-honest.** A repo not on shadcn substitutes its declared component system in the
  shadcn slot; Koniverse UI repos default to shadcn (via koni-setup).

**Why it matters**: it closes the "green + matches the mockup but off-system" gap — the exact
AI-slop failure mode design-review exists to catch — and makes the component standard a
*tested, authored* requirement rather than a reviewer's memory.

**Date**: 2026-07-01
**Version**: 0.30.0
**Reference**: [nfr.md](../skills/koni-qc/references/nfr.md) §UI (canonical criteria), [test-design.md](../skills/koni-qc/references/test-design.md) (step 8), [traceability.md](../skills/koni-qc/references/traceability.md) (UI type), [qc-workflow.md](../skills/koni-qc/references/qc-workflow.md), [agentic-loop-standard.md](../skills/koni-harness/references/agentic-loop-standard.md) (Review), CHANGELOG [0.30.0].

### D28. Suites are authored by layer and reports are decision-grade — the exemplar bar (US-001.001 suites + the backup's checklist rounds)

**Context**: reviewed via koni-harness: the `koni-docs.backup` `Checklist - Test case`
practice (round-based bug-fix retest — each bug an Actual/Expect pair + screenshot/GIF +
build link, re-verified per round; Checklist↔Testcase pairing; a test-data acquisition
guideline) and two user-supplied exemplar suites (US-001.001 API + functional). The
exemplars are structurally ahead of what koni-qc prescribed: API cases **by endpoint**
with real Actual Responses / Response Time / DB Changes; **orthogonal coverage matrices**
(endpoint, HTTP status-code, error-code · pages, components, validation+a11y); category
prefixes (`[Happy Path]/[Error]/[Validation]/[Verification]`); per-failure **evidence
links** (spec `file:line` + video); a **named test-data registry** with Used-In; `## Open
Questions`; and execution reports carrying skipped/blocked **reason + action**,
failed-by-category **root cause**, perf min/max/avg, implementation status, and
recommendations. koni-qc's canonical table + AC↔TC matrix covered none of the suite
*structure* or report *content* dimensions.

**Decision** (v0.31.0, US-5.8, FR-35; extends FR-26/FR-28/FR-30):

- **`references/layered-suites.md`** — the suite-structure standard: split a mixed
  surface into **API + functional sibling suites** with mutual scope contracts; API
  by-endpoint tables (headers/payload split, real actuals, response time, DB changes) +
  four required API classes (auth guard, RLS isolation incl. write-rejection, events +
  idempotency, audit); functional category prefixes + UI-component traceability +
  evidence per executed case; the **orthogonal matrices** (surface coverage — a status
  code or page with zero TCs is a visible gap the AC↔TC axis can't see); the **named
  test-data registry** (fixture → state → Used-In + acquisition notes); **Open
  Questions** as a first-class artifact; **round-based bug-fix retest** (rounds until
  clean → survivors graduate to `RC-`).
- **`references/report-quality.md`** — the execution-report **content bar**: the
  **honest-actuals rule** (Actual = real observed output, never a paraphrase or a copy of
  Expected — a copy-of-expected actual is a review finding), nine required sections
  (overview %, results-by-group, skipped/blocked reason+action, failed-by-category root
  cause, contract-coverage verification, perf stats, implementation status,
  recommendations, command reference), and the evidence rule (every failure/blocker links
  spec `file:line` + video/screenshot/log). Applies to auto `report.md` and manual
  `report-manual.md` alike.
- **Single-source wiring**: SKILL.md routes; test-design shapes its output into the
  layers; traceability pairs requirements-coverage with surface-coverage; qc-workflow
  Design/Execute carry the steps; test-automation §2 points its output at the bar;
  quality-bar grades "Real execution reports" against it. Criteria live once.

**Why it matters**: the AC↔TC matrix made suites *requirements-complete*; D28 makes them
*surface-complete* and makes reports answer "what do we do next?" instead of tallying
pass/fail. The bar comes from real, working artifacts (the exemplar suites + the matured
backup practice), not invented criteria — the same evidence-first route as D16/D22.

**Date**: 2026-07-02
**Version**: 0.31.0
**Reference**: [layered-suites.md](../skills/koni-qc/references/layered-suites.md), [report-quality.md](../skills/koni-qc/references/report-quality.md), [traceability.md](../skills/koni-qc/references/traceability.md) (orthogonal-matrices note), [qc-workflow.md](../skills/koni-qc/references/qc-workflow.md) (§Design/§Execute), [quality-bar.md](../skills/koni-qc/references/quality-bar.md), [US-5.8](sprints/stories/US-5.8-layered-suites-report-quality.md), CHANGELOG [0.31.0].
