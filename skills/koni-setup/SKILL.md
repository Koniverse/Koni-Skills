---
name: koni-setup
description: >
  Use when bootstrapping a brand-new Koniverse repo or onboarding/auditing an
  existing one against the shared project standard — e.g. the user says "set up a
  new project", "scaffold a repo", "bootstrap a Koni project", "onboard this
  repo", "wire up CLAUDE.md / AGENTS.md", "add the skills / sprint structure to
  this repo", "make this repo match the others", or "audit this repo's setup" —
  even if they don't name koni-setup. Also use when a repo is missing its standard
  skeleton, its skill wiring (`.claude` / `.agents` symlinks), the Koniverse skill
  set, VERSION, `_bmad`, or the agile npm scripts, or when checking a repo against
  the shared standard.
---
# koni-setup — Koniverse project bootstrapper & onboarder

> **What this skill owns vs. what koni-docs owns.** This skill is the *day-0*
> layer: it lays down the directory skeleton, wires skills, writes the
> CLAUDE.md / AGENTS.md / `.active-context` integration surface, `.gitignore`,
> `VERSION`, and the `package.json` agile scripts. The moment a file needs
> *documentation content* (a real PRD body, a story template, koni-docs' rule set, a
> CHANGELOG entry), **hand off to the `koni-docs` skill** and load its
> templates. Never re-implement koni-docs templates here — that duplication is
> exactly what we are avoiding. koni-setup gets a repo to the starting line;
> koni-docs runs the race.

---

## 0. Pick a mode first

Two entry points. Decide which one the user is in before doing anything.

| Mode | User signal | What you do |
|---|---|---|
| **Bootstrap** | "new project", "start a repo", empty/near-empty dir | §2 — create the full skeleton from scratch |
| **Onboard / Audit** | "make this repo match the others", "add sprints/skills", "audit setup", repo already has code | §3 — detect what exists, report gaps, fill only what's missing |

When unsure, run the **detect** step (§1) first — its output tells you which mode fits.

---

## 1. Detect — repo type and current state

Always start by reading the ground truth. Run these and read the result before
proposing anything; never assume a stack.

```bash
ls -a                                   # root inventory
cat VERSION 2>/dev/null                  # already versioned?
ls docs/ docs/sprints/ 2>/dev/null       # docs surface present?
ls .claude/skills .agents/skills 2>/dev/null   # skills wired?
test -f package.json && cat package.json | grep -E '"(name|scripts|dependencies)"' -A20
test -f pyproject.toml && echo "python"; test -f go.mod && echo "go"
git remote -v 2>/dev/null
```

Then classify the repo into one **profile**. The profile decides which extra
files matter — full per-profile checklists live in
[`references/repo-types.md`](references/repo-types.md).

| Profile | Telltale | Extra scaffolding it needs |
|---|---|---|
| **code** | `package.json` / `pyproject.toml` / `go.mod` | `.env.example`, `Dockerfile`, `docs/ARCHITECTURE.md` + `PRD.md`, agile npm scripts, optional CI |
| **devops** | shell + `.gitmodules` / deploy scripts | `.devenvironment/` (gitignored), `scripts/`, `DEPLOY.md`, submodule init |
| **content** | Markdown / HTML, no package manifest | `REPO_STRUCTURE.md`, lighter `docs/` (often no ARCHITECTURE/PRD) |

A repo can be hybrid (e.g. code + content); take the union of what each profile
needs. Reference repos to copy patterns from: `Koni-ERP-02`, `Senti-Quant`
(code) · `koni-devops` (devops) · `koni-growth`, `koni-landing`,
`koni-training` (content).

---

## 2. Bootstrap workflow (new repo)

Do these in order. Each step is idempotent — re-running must not clobber a file
that already has real content; check first, write only if absent or a stub.

1. **Confirm scope with the user** — repo name, profile (from §1), whether it is
   solo (Active-Context Pattern A, inline in CLAUDE.md) or team
   (Pattern B, extracted `.active-context.md`). Pattern B is the default for
   anything with 2+ contributors.

2. **Init git + VERSION** — if the dir isn't a git repo yet, `git init`. Write
   `0.1.0` to `VERSION` at repo root if absent (bare semver, no `v`). (The
   create-the-tree command in `scaffold-checklist.md` does both.)

3. **Directory skeleton** — create the canonical tree. The full file-by-file
   list (authoritative) is in
   [`references/scaffold-checklist.md`](references/scaffold-checklist.md); the
   `docs/` subtree follows koni-docs §0, and the `docs/tests/` subtree follows the
   koni-qc **test-organization** standard. Abridged (see scaffold-checklist.md for
   the exact tree):

   ```
   docs/{README,SETUP,BRIEF,PRD,ARCHITECTURE,CHANGELOG,CONTEXT,LESSONS}.md
   docs/sprints/{README.md,STATUS.md,epics/,stories/,archive/}
   docs/tests/{README.md,test-organization.md,STRATEGY.md,findings.md,test-plan/,test-cases/,bug-bash/,audits/}
   #   docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/  ← created on first run, never pre-made
   <app>/tests/epic/   ← test CODE root (by-epic tree; code repos) — koni-qc test-organization §2
   docs/design/
   ```
   Create the **directories and stub files**, but for the *contents* of each doc
   defer to koni-docs templates (next step).

4. **Fill doc bodies via koni-docs** — invoke the `koni-docs` skill and use its
   templates for any doc the user wants real content in now (`templates/brief.md`,
   `templates/prd.md`, `templates/architecture.md`, `templates/setup.md`,
   `templates/integration.md`, sprint/epic/story templates). koni-setup writes
   *empty scaffolds*; koni-docs writes *content*. Do not paste koni-docs template
   text into this skill.

5. **Install the skill set** — bring in the same skills the other Koniverse
   repos run, from their correct sources. **Baseline: the Koniverse core trio —
   `koni-docs` + `koni-harness` + `koni-qc` — is wired per-repo in every repo**
   (docs lifecycle + the agentic-loop/commit gate + QC methodology). Wiring the
   trio is the symlink step; **`koni-harness` additionally vendors its gate** —
   run its `install-gate.sh` so `.koni-harness/` + the pre-commit/pre-push hooks
   guard the repo from day 0 (the gate's doc/version checks rely on the `docs/`
   tree + VERSION created in steps 2–3, so install it after them). Then the
   **BMAD pack** (~40 skills) via `npx bmad-method install`, **gstack** confirmed
   global, plus profile extras (shadcn for UI code, the Anthropic doc/design
   skills for content repos). The full per-profile inventory + install mechanism
   for each is in [`references/skill-inventory.md`](references/skill-inventory.md);
   the `.claude` / `.agents` symlink mechanics + the trio-wiring + gate-install
   commands are in [`references/skill-wiring.md`](references/skill-wiring.md).
   This is the step people most often skip — a repo with koni-docs but no
   `bmad-*` skills means `bmad-method install` never ran; a repo with the trio
   wired but no `.koni-harness/` means the gate install was skipped.

6. **CLAUDE.md + AGENTS.md** — use the AGENTS-canonical convention: AGENTS.md is
   the single source of truth; CLAUDE.md is a thin pointer + the `Koni-Docs
   Integration` config block + Active Context pointer. Load
   `koni-docs/references/templates/integration.md` for the exact blocks — do not
   hand-author them here.

7. **Active Context** — Pattern A: inline block in CLAUDE.md between
   `<!-- koni-docs:auto-update -->` markers. Pattern B (default for teams):
   create `.active-context.example.md` (committed) + add `.active-context.md` to
   `.gitignore`. Copy the example from this repo's own `.active-context.example.md`.

8. **.gitignore** — ensure it covers `.active-context.md`, `node_modules/`,
   build output, `.env`, `_bmad-output/`, and `.claude/worktrees/`. See
   [`references/scaffold-checklist.md`](references/scaffold-checklist.md) §gitignore.

9. **Profile extras** — apply the per-profile rows from §1 / `references/repo-types.md`:
   code → `.env.example` + `Dockerfile` + agile npm scripts; devops → `scripts/` +
   `.devenvironment/` + submodule init; content → `REPO_STRUCTURE.md`.

10. **Agile scripts (code repos)** — add the koni-docs CLI as a devDep and the
    `agile:*` npm scripts (`status` / `sync` / `tasks` / `backfill` +
    `changelog:backfill`). Exact block in
    [`references/skill-wiring.md`](references/skill-wiring.md) §agile-scripts.

11. **Verify** — run §4 verification, then summarize what was created and the
    next action (usually: open koni-docs to draft BRIEF → PRD, or `npm install`).

---

## 3. Onboard / Audit workflow (existing repo)

The goal here is **fill the gaps, touch nothing that already works**. "Don't
overwrite" means *don't destroy existing content* — it does **not** mean "never
edit the file". **Appending a missing section is allowed and expected**; only
replacing or rewriting existing content is off-limits. The clearest case: an
existing CLAUDE.md with real content but no `## Koni-Docs Integration` block —
you *append* that block (and the Active Context pointer), you don't rewrite the
file. When in doubt between append and rewrite, append, and report exactly what
you added.

This applies even under the AGENTS-canonical convention: the machine-readable
`koni-docs:` config block (`docs_path` / `active_sprint` / `version_file`) lives
in **CLAUDE.md** regardless of profile — content repos included. AGENTS.md gets
only the human pointer. So onboarding a content repo still means appending the
config block to its CLAUDE.md; there is no profile where that block has "nowhere
to live".

1. **Detect** (§1) — build the current-state inventory.
2. **Gap report** — produce a checklist of present vs. missing against the
   profile's expected set. The full audit matrix is in
   [`references/onboarding-audit.md`](references/onboarding-audit.md). Present it
   to the user before writing anything:

   ```
   ✅ present   ⬜ missing   ⚠️ stub/partial
   ✅ VERSION            ✅ CLAUDE.md         ⬜ AGENTS.md
   ✅ docs/CHANGELOG.md  ⚠️ docs/PRD.md (stub) ⬜ docs/sprints/STATUS.md
   ⬜ .active-context.example.md   ⬜ agile npm scripts
   ✅ koni-docs   ⬜ koni-harness   ⬜ koni-qc   ⬜ .koni-harness/ gate
   ```

3. **Fill missing scaffolding only** — for each ⬜, create it (skeleton via this
   skill, content via koni-docs). For each ⚠️ stub, ask before touching.
4. **Re-wire skills if broken** — confirm the **core trio** (koni-docs +
   koni-harness + koni-qc) is wired and re-point any dangling symlink (see
   `references/skill-wiring.md` §repair); if koni-harness is wired but
   `.koni-harness/gate-runner.sh` is absent, run its `install-gate.sh` (the
   repo's `docs/` tree + VERSION already exist on an onboard, so its checks read
   them fine). Also check
   the BMAD pack: `find .claude/skills -maxdepth 1 -name 'bmad-*' | wc -l` near
   zero means `npx bmad-method install` was never run — the most common onboarding
   gap (see
   [`references/skill-inventory.md`](references/skill-inventory.md) §audit).
5. **Hand off doc backfill to koni-docs** — if stories/CHANGELOG/PRD need real
   content or a consistency sweep, that's koni-docs' job: run its audit loop
   (`koni-docs validate` / `backfill-fields` / `status`).
6. **Verify** (§4) and summarize the diff.

---

## 4. Verify the setup

After bootstrap or onboard, confirm the wiring actually holds:

```bash
test -f VERSION && echo "VERSION ok"
# Koniverse core trio — all three wired
for s in koni-docs koni-harness koni-qc; do
  test -e ".claude/skills/$s" && echo "$s wired ($(readlink ".claude/skills/$s" 2>/dev/null))" || echo "$s ⬜ not wired"
done
test -f .koni-harness/gate-runner.sh && echo "koni-harness gate installed" || echo "koni-harness gate ⬜ run install-gate.sh"
echo "bmad pack: $(find .claude/skills -maxdepth 1 -name 'bmad-*' 2>/dev/null | wc -l | tr -d ' ') skills"   # ~40+ if bmad-method install ran (find, not a bare glob — zsh errors on no-match)
test -d ~/.claude/skills/gstack && echo "gstack global ok"
test -d docs/sprints && echo "sprints ok"
grep -q "Koni-Docs Integration" CLAUDE.md && echo "integration block ok"
# code repos only:
test -f package.json && grep -q "agile:status" package.json && echo "agile scripts ok"
```

The `agile:status` / devDep lines apply to **code repos only** — a content or
devops repo has no `package.json`, so skip that check and instead confirm
`koni-docs` resolves and (if needed) is reachable globally:
`koni-docs --version`.

A dangling symlink (readlink prints a path that doesn't exist) is the #1
silent failure — always resolve it. If koni-docs is installed as a devDep,
`npx koni-docs --version` should print a version.

---

## 5. Reference files

Load on demand based on the step you're in:

| File | When to load |
|---|---|
| [`references/repo-types.md`](references/repo-types.md) | Classifying the repo + per-profile (code / devops / content) expected file sets, with the reference repo to copy each pattern from |
| [`references/scaffold-checklist.md`](references/scaffold-checklist.md) | The exact directory skeleton + stub files + `.gitignore` contents to create during bootstrap |
| [`references/skill-inventory.md`](references/skill-inventory.md) | **Which AI skills to install** and from which source — the BMAD pack (~40, via `bmad-method install`), koni-docs, global gstack, and the per-profile extras (shadcn, Anthropic doc/design skills). Load whenever installing or auditing the skill set |
| [`references/skill-wiring.md`](references/skill-wiring.md) | Wiring `.claude` / `.agents` skill dirs, symlink-vs-vendor decision, repairing dangling links, the `agile:*` npm scripts + devDep block |
| [`references/onboarding-audit.md`](references/onboarding-audit.md) | The present/missing audit matrix for onboarding an existing repo |

**Boundary reminder**: anything about *documentation content* — koni-docs' rule set,
story/epic/PRD/CHANGELOG templates, the doc pre-commit checklist, the
`koni-docs` CLI subcommands — belongs to the **koni-docs** skill. Invoke it;
don't reproduce it here.
