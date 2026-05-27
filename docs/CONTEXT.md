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
