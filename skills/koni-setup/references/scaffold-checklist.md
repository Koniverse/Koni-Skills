# Scaffold checklist — the exact skeleton to create

This is what **bootstrap** lays down. Create directories and **stub** files only;
the *content* of every doc comes from koni-docs templates, not from here. A stub
is a file with a single `# Title` heading and a one-line `> TODO: drafted via
koni-docs templates/<x>.md` pointer, so the structure validates while signalling
the content is pending.

Idempotency rule: before writing any file, check it doesn't already exist with
real content. Bootstrap must be safe to re-run.

## Directory tree

```
<repo>/
├── VERSION                         # "0.1.0"
├── README.md                       # human overview (stub ok)
├── CLAUDE.md                       # pointer + Koni-Docs Integration + Active Context
├── AGENTS.md                       # canonical source of truth (recommended)
├── .gitignore                      # see §gitignore below
├── .active-context.example.md      # Pattern B (team) — copy from Koni-Skills
├── docs/
│   ├── README.md                   # doc hub + pre-commit checklist
│   ├── SETUP.md
│   ├── BRIEF.md
│   ├── PRD.md                      # code repos (content repos: optional)
│   ├── ARCHITECTURE.md             # code repos (content repos: usually omit)
│   ├── CHANGELOG.md                # starts with [Unreleased] anchor
│   ├── CONTEXT.md                  # append-only decision log
│   ├── LESSONS.md
│   ├── design/                     # per-story design specs
│   └── sprints/
│       ├── README.md               # agile schema + workflow
│       ├── STATUS.md               # AUTO-GENERATED — leave empty, koni-docs status fills it
│       ├── epics/                  # EPIC-N.md
│       ├── stories/                # US-X.Y-<slug>.md
│       ├── archive/                # closed sprints
│       └── sprint-YYYY-WNN.md      # the first active sprint
├── docs/tests/                     # test surface — standard: koni-qc references/test-organization.md
│   ├── README.md                   # QA hub
│   ├── test-organization.md        # the standard (stub → koni-qc)
│   ├── findings.md                 # open QA findings tracker
│   ├── test-plan/                  # EPIC-NN-<slug>.md (strategy: scope · risk · priority)
│   ├── test-cases/                 # EPIC-N.md + README.md (koni-qc specs + AC↔TC matrix)
│   ├── test-reports/               # EPIC-NN/<MMDDYYYY>/ — created on first run, never pre-made
│   ├── bug-bash/                   # sprint-YYYY-WNN.md
│   └── audits/                     # dated one-off analyses (historical)
├── .claude/skills/                 # see skill-wiring.md
├── .agents/skills/                 # see skill-wiring.md
└── _bmad/  _bmad-output/           # BMAD framework (output dir gitignored)
```

Root-level extras (per profile — see repo-types.md): `DEPLOY.md`, `DESIGN.md`,
`.env.example`, `Dockerfile`, `REPO_STRUCTURE.md`, `scripts/`, `.devenvironment/`,
`.gitmodules`.

## Create-the-tree command

This single **bash** block (it uses brace expansion — run it with `bash`, not a
bare POSIX `sh`) matches the tree above exactly, is profile-aware, is re-runnable
(only writes absent files), and keeps empty dirs alive in git with `.gitkeep`.
Set `PROFILE` first.

```bash
PROFILE=code     # code | devops | content  — decides whether PRD/ARCHITECTURE stub

# 0. new repo? initialise git (skip if already a repo)
[ -d .git ] || git init -q

# 1. directories  (docs/tests standard: koni-qc references/test-organization.md)
mkdir -p docs/sprints/{epics,stories,archive} docs/design \
         docs/tests/{test-plan,test-cases,bug-bash,audits} \
         .claude/skills .agents/skills _bmad-output
# test-reports/EPIC-NN/<MMDDYYYY>/ is created on first run, never pre-made

# 2. VERSION (bare semver, only if absent)
[ -f VERSION ] || echo "0.1.0" > VERSION

# 3. root-level doc stubs — note these include the docs/ root README and the
#    per-subtree READMEs that the tree shows. CHANGELOG is handled separately
#    in step 4 (it needs the [Unreleased] anchor, not a generic stub).
docs_root="README SETUP BRIEF CONTEXT LESSONS"
[ "$PROFILE" = content ] || docs_root="$docs_root PRD ARCHITECTURE"   # code/devops only
for f in $docs_root; do
  [ -f "docs/$f.md" ] || printf '# %s\n\n> TODO: draft via koni-docs templates/%s.md\n' \
    "$f" "$(echo $f | tr A-Z a-z)" > "docs/$f.md"
done

# 4. sub-tree READMEs + STATUS + first sprint (all shown in the tree)
[ -f docs/sprints/README.md ]      || printf '# Sprints\n\n> TODO: agile schema via koni-docs sprint-system.md\n' > docs/sprints/README.md
[ -f docs/tests/test-cases/README.md ] || printf '# Test cases\n\n> TODO: via koni-docs templates/test-cases.md\n' > docs/tests/test-cases/README.md
# docs/tests standing docs (standard owned by koni-qc references/test-organization.md)
[ -f docs/tests/README.md ]            || printf '# docs/tests — QA hub\n\n> Standard: koni-qc references/test-organization.md\n' > docs/tests/README.md
[ -f docs/tests/test-organization.md ] || printf '# Test organization\n\n> Follows koni-qc references/test-organization.md (taxonomy · by-epic layout · 3-place sync).\n' > docs/tests/test-organization.md
[ -f docs/tests/findings.md ]          || printf '# Open QA findings\n' > docs/tests/findings.md
[ -f docs/sprints/STATUS.md ]      || : > docs/sprints/STATUS.md   # koni-docs status regenerates this
# first sprint file: name from current ISO week (see "Active sprint" note below)
WEEK="$(date +%G-W%V)"
[ -f "docs/sprints/sprint-$WEEK.md" ] || printf '# Sprint %s\n\n> TODO: open via koni-docs templates/sprint.md\n' "$WEEK" > "docs/sprints/sprint-$WEEK.md"

# 5. CHANGELOG with the [Unreleased] anchor (single source — not in step 3 loop)
[ -f docs/CHANGELOG.md ] || printf '# Changelog\n\nAll notable changes are documented here (RULE-1, RULE-2).\n\n## [Unreleased]\n' > docs/CHANGELOG.md

# 6. keep empty leaf dirs in git
for d in docs/sprints/{epics,stories,archive} docs/design \
         docs/tests/{test-plan,bug-bash,audits}; do
  [ -z "$(ls -A "$d" 2>/dev/null)" ] && : > "$d/.gitkeep"
done
```

Why `.gitkeep`: git won't track empty directories, so `epics/`, `stories/`,
`archive/`, `design/`, and the empty `docs/tests/` framework dirs
(`test-plan/`, `bug-bash/`, `audits/`) would silently vanish on the first commit
— breaking the "structure validates" promise. (`test-reports/` is *not* kept — it
is created on the first run, never pre-made.) The `.gitkeep` files are removed
naturally once real content lands.

**Active sprint value**: a brand-new repo has no planned sprint yet. The command
seeds a first sprint file named for the current ISO week and uses that same
`YYYY-WNN` for `active_sprint:` in CLAUDE.md, so the config is internally
consistent from day 0. The body is a stub — opening the sprint for real (goal,
scope table) is koni-docs' job. If you'd rather not imply a sprint exists, leave
`active_sprint: sprint-YYYY-WNN` as a literal placeholder and skip the sprint
file; just keep CLAUDE.md and the file in agreement either way.

## .gitignore — baseline

Merge these into any existing `.gitignore` (don't drop lines the repo already
has):

```gitignore
# deps / build
node_modules/
dist/
.next/
build/

# secrets / env
.env
.env.local
.env.*.local

# per-developer running snapshot (Active Context Pattern B)
.active-context.md

# BMAD scratch output
_bmad-output/

# agent worktrees
.claude/worktrees/

# OS
.DS_Store
```

devops profile adds:
```gitignore
.devenvironment/
```
content/code repos with a skills workspace add:
```gitignore
*-workspace/
```

## CHANGELOG — canonical location

The CHANGELOG lives at **`docs/CHANGELOG.md`** (matches the tree, the audit
matrix, and koni-docs §0). Step 5 of the command above seeds it with the
`## [Unreleased]` anchor that koni-docs' `backfill-commits` and changelog-entry
insertion target. When you wire AGENTS.md / CLAUDE.md doc links, point the
CHANGELOG link at `docs/CHANGELOG.md` — not a repo-root `CHANGELOG.md`. (Some
koni-docs template examples show a root path; the repo-relative truth for these
Koniverse repos is `docs/CHANGELOG.md`.)

Everything past this point — real PRD bodies, story files, epic files,
ARCHITECTURE content, the 12 rules — is **koni-docs territory**. Switch to that
skill and load the matching `templates/*.md`.
