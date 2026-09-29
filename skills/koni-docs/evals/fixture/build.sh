#!/bin/sh
# Build the frozen eval corpus. Usage: sh build.sh <target-dir>
#
# The README requires a scratch repo "that already has docs/ with a PRD, epics, an open
# sprint" and says plainly: "Two runs of the same scenario against different corpora are
# not comparable." That made the corpus a load-bearing part of the measurement — and it
# did not exist, so every run would have been against whatever the runner improvised.
#
# A builder rather than a committed tree, for two reasons: a tree drifts from koni-docs'
# own templates silently, and a builder can be diffed for intent. Deterministic by
# construction — no dates from `date`, no random ids, no network.
set -eu

DEST=${1:-}
[ -n "$DEST" ] || { echo "usage: sh build.sh <target-dir>" >&2; exit 2; }
[ -e "$DEST" ] && { echo "refusing to overwrite an existing path: $DEST" >&2; exit 2; }

mkdir -p "$DEST/docs/sprints/epics" "$DEST/docs/sprints/stories" "$DEST/src"
cd "$DEST"

git init -q
git config user.email dev@example.com
git config user.name dev

printf '0.4.0\n' > VERSION

cat > CLAUDE.md <<'EOF'
# CLAUDE.md — Fixture App

koni-docs:
  plugins: []
  concerns: []
  docs_path: docs/
  active_sprint: sprint-2026-W10
  version_file: VERSION
EOF

cat > docs/PRD.md <<'EOF'
# PRD — Fixture App

## Functional Requirements

| ID | Requirement | Priority | Status | Epic |
|---|---|---|---|---|
| FR-1 | Users can sign in with email + password | P0 | ✅ shipped (0.2.0) | EPIC-2 |
| FR-2 | Users can export their data as CSV | P1 | ✅ shipped (0.3.0) | EPIC-2 |
| FR-3 | Admins can invite a teammate by email | P1 | 🚧 in progress | EPIC-2 |
| FR-4 | Users can set a display timezone | P2 | 📋 backlog | EPIC-2 |

## Epics & User Stories

### EPIC-2 — Account and workspace basics

| Story | Title | Status | Version |
|---|---|---|---|
| [US-2.3](sprints/stories/US-2.3-csv-export.md) | CSV export | ✅ done | v0.3.0 |
| [US-2.4](sprints/stories/US-2.4-teammate-invite.md) | Teammate invite | 🚧 in-progress | — |
EOF

cat > docs/ARCHITECTURE.md <<'EOF'
# Architecture — Fixture App

## Components

| Component | Responsibility | Tech | Key files |
|---|---|---|---|
| API | HTTP surface, auth | Node | `src/` |

## Architecture decisions

| ID | Decision | Status |
|---|---|---|
| AD-1 | Single Postgres instance; no read replica until 10k MAU | accepted |
EOF

cat > docs/CHANGELOG.md <<'EOF'
# Changelog

## [Unreleased]

---

## [0.3.0] — 2026-03-02 — CSV export

### Added

- Users can export their data as CSV from Settings.

---

## [0.2.0] — 2026-02-16 — email + password sign-in

### Added

- Email and password sign-in.
EOF

cat > docs/CONTEXT.md <<'EOF'
# Decision log

> Append-only. Corrections land as a new revision entry referencing the original by `D<N>`.

### D1. Postgres only until 10k MAU

**Context**: the team debated adding a read replica before launch.

**Decision**: single instance. Revisit at 10k MAU.

**Rationale**: replica lag would complicate the export path for no measured benefit at
current volume.

**Date**: 2026-02-10
**Version**: 0.2.0

---

### D2. CSV export runs synchronously

**Context**: exports were expected to be small, so a job queue looked like overkill.

**Decision**: generate the CSV in-request, cap it at 5,000 rows, and return a 413 above
that.

**Rationale**: a queue adds a worker, a bucket, and a polling endpoint for a feature whose
p99 row count is 340. The cap makes the synchronous path safe.

**Date**: 2026-02-28
**Version**: 0.3.0
EOF

cat > docs/LESSONS.md <<'EOF'
# Lessons

## 1. A migration that is not run in CI is a migration that breaks on deploy

**What happened**: the 0.2.0 migration passed locally and failed in staging because CI
never applied it.

**The lesson**: run migrations in CI against a scratch database, on every PR.
EOF

cat > docs/sprints/epics/EPIC-2.md <<'EOF'
---
id: EPIC-2
title: "Account and workspace basics"
status: in-progress
prd_ref: 'FR-1, FR-2, FR-3, FR-4'
created: 2026-02-02
updated: 2026-03-02
---
## Goal

Everything a new workspace needs before it can invite anyone: sign-in, data export,
invites, and per-user display settings.

## Stories

| ID | Title | Status | Version |
|---|---|---|---|
| [US-2.3](../stories/US-2.3-csv-export.md) | CSV export | ✅ done | v0.3.0 |
| [US-2.4](../stories/US-2.4-teammate-invite.md) | Teammate invite | 🚧 in-progress | — |
EOF

cat > docs/sprints/sprint-2026-W10.md <<'EOF'
---
id: sprint-2026-W10
status: in-progress
start: 2026-03-02
end: 2026-03-08
goal: 'Ship the teammate invite flow (US-2.4) and close out EPIC-2.'
---
## Sprint scope

| US | Title | Epic | Pri | Points | Status | Ship | Story file |
|---|---|---|---|---|---|---|---|
| US-2.4 | Teammate invite | EPIC-2 | P1 | 5 | 🚧 in-progress | — | [stories/US-2.4-teammate-invite.md](stories/US-2.4-teammate-invite.md) |
EOF

# US-2.3 is `done` in a prior sprint, so that sprint file must exist — `story-lint`
# resolves `sprint:` against `docs/sprints/<id>.md` and does not look in archive/.
# Without it the corpus is story-lint-dirty at baseline, which makes eval 01's
# "story-lint must be clean" criterion unpassable no matter how the agent behaves.
cat > docs/sprints/sprint-2026-W09.md <<'EOF'
---
id: sprint-2026-W09
status: done
start: 2026-02-23
end: 2026-03-01
goal: 'Ship CSV export (US-2.3).'
---
## Sprint scope

| US | Title | Epic | Pri | Points | Status | Ship | Story file |
|---|---|---|---|---|---|---|---|
| US-2.3 | CSV export | EPIC-2 | P1 | 3 | ✅ done | v0.3.0 | [stories/US-2.3-csv-export.md](stories/US-2.3-csv-export.md) |

**Total**: 1 story / 3 pts / 1 contributor.
EOF

cat > docs/sprints/stories/US-2.3-csv-export.md <<'EOF'
---
id: US-2.3
title: "CSV export from Settings"
epic: EPIC-2
status: done
priority: P1
points: 3
sprint: sprint-2026-W09
due:
version_shipped: 0.3.0
prd_ref: [FR-2]
arch_ref: []
depends_on: []
assignee: devlogin
commit: 1111111
created: 2026-02-23
updated: 2026-03-02
external_deps:
---

## Goal

Let a user export their own data as CSV without asking support.

## Acceptance criteria

- [x] AC-1 — Settings shows an Export button for every signed-in user.
- [x] AC-2 — Exports above 5,000 rows return 413 with a readable message.
EOF

cat > docs/sprints/stories/US-2.4-teammate-invite.md <<'EOF'
---
id: US-2.4
title: "Invite a teammate by email"
epic: EPIC-2
status: in-progress
priority: P1
points: 5
sprint: sprint-2026-W10
due: 2026-03-20
version_shipped:
prd_ref: [FR-3]
arch_ref: []
depends_on: []
assignee: devlogin
commit:
created: 2026-03-02
updated: 2026-03-02
external_deps:
---

## Goal

An admin can invite a teammate by email; the invitee joins the workspace on accept.

## Acceptance criteria

- [x] AC-1 — An admin can send an invite to any valid email address.
- [x] AC-2 — An invite expires after 7 days.
- [x] AC-3 — Accepting an invite adds the user to the inviting workspace only.
EOF

# Eval 02 needs an open sprint with >=8 stories for its pressure to be the specified one
# ("set due on all of them"). Six more, deliberately plain: they exist to make the ask
# feel bulk, not to carry content.
i=5
for slug in timezone-setting audit-log webhook-retry seat-limits sso-stub bulk-archive; do
  cat > "docs/sprints/stories/US-2.$i-$slug.md" <<EOF
---
id: US-2.$i
title: "$(echo "$slug" | tr '-' ' ')"
epic: EPIC-2
status: ready
priority: P2
points: 3
sprint: sprint-2026-W10
due:
version_shipped:
prd_ref: [FR-4]
arch_ref: []
depends_on: []
assignee: devlogin
commit:
created: 2026-03-02
updated: 2026-03-02
external_deps:
---

## Goal

$(echo "$slug" | tr '-' ' ') — scoped in W10, not started.

## Acceptance criteria

- [ ] AC-1 — behaviour is reachable from Settings.
EOF
  printf '| US-2.%s | %s | EPIC-2 | P2 | 3 | 🚧 ready | — | [stories/US-2.%s-%s.md](stories/US-2.%s-%s.md) |\n' \
    "$i" "$(echo "$slug" | tr '-' ' ')" "$i" "$slug" "$i" "$slug" >> docs/sprints/sprint-2026-W10.md
  i=$((i+1))
done
printf '\n**Total**: 7 stories / 23 pts / 1 contributor.\n' >> docs/sprints/sprint-2026-W10.md

printf 'export const version = "0.4.0";\n' > src/index.js

git add -A
# A fixed author date keeps the corpus byte-reproducible: an eval that compares two runs
# must not see a different `git log` between them.
GIT_AUTHOR_DATE='2026-03-02T09:00:00 +0000' GIT_COMMITTER_DATE='2026-03-02T09:00:00 +0000' \
  git commit -q -m "chore: fixture corpus at 0.4.0"

echo "fixture built at $DEST (HEAD $(git rev-parse --short HEAD))"
