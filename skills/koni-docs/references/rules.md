# Core Rules — Detailed Reference

> These 9 rules apply to ALL Koniverse projects regardless of technology stack.
> Technology-specific rules live in plugin skills (koni-docs-supabase, koni-docs-nextjs, etc.)

## Rule Groups

| Group | When enforced |
|-------|---------------|
| Pre-commit | Before `git commit` |
| During work | While writing code/docs |
| Post-generation | After running scripts |

---

## Pre-commit Rules

### RULE-1: VERSION + CHANGELOG in same commit

**Severity**: BLOCKER — violations block merge

**What**: Every code-shipping commit must update both the `VERSION` file AND `Docs/CHANGELOG.md` in the SAME commit. Never defer documentation to a follow-up commit.

**Why**: Keeps version tracking and changelog atomically linked to the code change. A follow-up commit can be missed; a `git bisect` won't find the changelog entry.

**How to comply**:
1. Bump `VERSION` file according to semver rules
2. Add new CHANGELOG entry at top (below `[Unreleased]`)
3. Commit both together with the code changes

**Semver rules**:
| Change type | Bump |
|---|---|
| Breaking schema / public API change | MAJOR |
| New backward-compatible feature (default) | MINOR |
| Bug fix, no new feature | PATCH |

**Grep check**: `git diff --cached --name-only | grep -E "VERSION|CHANGELOG" | wc -l` — must be 2 when code files are staged.

**See**: `templates.md` §CHANGELOG entry, §CHANGELOG safe insertion

---

### RULE-2: Commit hash in CHANGELOG mandatory

**Severity**: BLOCKER

**What**: Every CHANGELOG entry must end with `**Commit**: <7-char SHA>`. The SHA must be real — `pending` is NEVER acceptable.

**Why**: Allows `git log --grep` to find which commit shipped which version. A placeholder SHA breaks bisectability and erodes trust.

**How to comply**:
1. Write the CHANGELOG entry with all content
2. Commit everything
3. Note the 7-char SHA from `git log -1 --format=%h`
4. `git commit --amend` to fill in the SHA
5. Push

**Grep check**: `grep -n "Commit.*pending" Docs/CHANGELOG.md` — must return empty.

**See**: `templates.md` §CHANGELOG entry

---

### RULE-11: New env var → update all three files

**Severity**: BLOCKER

**What**: Adding a new environment variable requires updating ALL three files in the same commit: `Docs/SETUP.md` + `DEPLOY.md` + `.env.example`.

**Why**: A missing env var in SETUP.md blocks new developers. Missing in DEPLOY.md causes production outages. Missing in .env.example makes it undiscoverable.

**How to comply** — all three in same commit:
1. `Docs/SETUP.md` — add to the `.env.local` example block + one-line description
2. `DEPLOY.md` — add to the production env vars table
3. `.env.example` — add the key with placeholder value

**Format for .env.example**:
```bash
# <Category / Feature name> (added in vX.Y.Z)
# <One sentence: what this controls, where to get the value>
NEW_ENV_VAR=<placeholder_or_description>
```

**Format for SETUP.md env block**:
```markdown
# <Category name> (added in vX.Y.Z)
# <What it does — 1 line>
NEW_ENV_VAR=<example_value_or_instructions>
```

**See**: `templates.md` §SETUP.md + DEPLOY.md + .env.example

---

### RULE-14: Commit message prefix

**Severity**: WARNING

**What**: Every commit message must use a conventional prefix: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`.

**Why**: Enables automatic changelog generation and makes `git log --oneline` scannable by intent.

**Note**: Doc-only commits (typo, formatting) do NOT bump VERSION.

---

## During-Work Rules

### RULE-6: Story ID must match across all docs

**Severity**: BLOCKER

**What**: A story's `id:` in frontmatter must exactly match:
1. The filename prefix (e.g., `US-3.7` in `US-3.7-pod-project-management.md`)
2. The PRD §7 entry identifier

One canonical ID per story across all documentation layers.

**Why**: Prevents ID drift between the story file, the sprint board, and the PRD. Mismatched IDs break the 5-layer consistency system.

**How to comply**:
1. Before creating a story, check PRD §7 to confirm the ID
2. If the story doesn't exist in PRD §7, add it first
3. Use the exact same ID in filename, frontmatter `id:`, and PRD reference

**Grep check**: `grep -rn "US-X.Y" Docs/sprints/stories/ Docs/PRD.md` — all references to a story ID must be consistent.

**See**: `templates.md` §Story file, `sprint-system.md` §Naming conventions

---

### RULE-7: CONTEXT.md is append-only

**Severity**: BLOCKER

**What**: Never edit or delete a past CONTEXT.md entry. Corrections get a new `D<N> (revision of D<M>)` entry appended at the end of the current phase.

**Why**: The decision log is a historical record. Rewriting history destroys the "why did we choose X?" trail that future contributors depend on.

**How to comply**:
- **Correction needed?** → Append `### D<N>. <Title> (revision of D<M>)` with `What changed`, `New decision`, `Rationale`
- **Wrong entry?** → Add correction entry; never delete the original
- **Missing rationale?** → "because Y" is mandatory in every entry

**Anti-patterns**:
| Wrong | Correct |
|---|---|
| Edit body of past entry D<M> | Add new D<N> (revision of D<M>) |
| Delete a wrong decision | Add correction entry |
| Leave rationale blank | Always include "because Y" |
| One huge entry for 10 decisions | One entry per decision |

**See**: `templates.md` §CONTEXT.md, §CONTEXT revision entry

---

### RULE-10: Mark tasks as you complete them

**Severity**: WARNING

**What**: Mark story Tasks `[x]` individually as each task is completed, not all at once when the story finishes. Same rule applies to Acceptance Criteria checkboxes.

**Why**: Incremental checkmarks give visibility into progress. Batch-marking at the end hides blockers and makes sprint status inaccurate.

**How to comply**: After completing each Task or AC, immediately update its checkbox from `[ ]` to `[x]` using the Edit tool.

**See**: `sprint-system.md` §Story status flow

---

### RULE-13: English-only for all deliverables

**Severity**: WARNING

**What**: All code, comments, UI strings, error messages, commit messages, and documentation must be in English. Vietnamese is reserved for user chat prompts only.

**Why**: English is the lingua franca of software. Non-English strings in code or docs create barriers for international contributors and tooling.

---

## Post-Generation Rules

### RULE-5: STATUS.md is auto-generated

**Severity**: BLOCKER

**What**: `Docs/sprints/STATUS.md` is auto-generated by `npm run agile:status`. Never hand-edit it.

**Why**: Hand-edits to STATUS.md will be overwritten by the next script run. The file is a derived artifact from story frontmatter — the source of truth is the story files.

**How to comply**: Always run `npm run agile:status` before committing any story status change. If STATUS.md looks wrong, fix the story frontmatter, not STATUS.md.

**Grep check**: N/A — this is a process rule. The script regeneration is the enforcement mechanism.

**See**: `sprint-system.md` §Scripts reference
