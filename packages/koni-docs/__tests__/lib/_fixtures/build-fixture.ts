import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function buildFixture(root: string): string {
  const docs = join(root, 'docs');
  mkdirSync(join(docs, 'sprints', 'stories'), { recursive: true });
  mkdirSync(join(docs, 'sprints', 'epics'), { recursive: true });

  writeFileSync(join(docs, 'sprints', 'stories', 'US-1.1-foo.md'), `---
id: US-1.1
title: "Foo"
epic: EPIC-1
status: done
priority: P0
points: 5
sprint: sprint-2026-W01
version_shipped: "0.1.0"
prd_ref: FR-1
---

## Goal

Foo.

## Acceptance criteria

- [x] AC-1: First criterion
- [x] AC-2: Second criterion
`);

  writeFileSync(join(docs, 'sprints', 'stories', 'US-1.2-bar.md'), `---
id: US-1.2
title: "Bar"
epic: EPIC-1
status: in-progress
priority: P1
points: 3
sprint: sprint-2026-W01
prd_ref: FR-2
---

## Goal

Bar.

## Acceptance criteria

- [ ] AC-1: Pending criterion
`);

  // Helpful: a non-story file in stories/ that should be skipped
  writeFileSync(join(docs, 'sprints', 'stories', 'README.md'), `# Stories\n`);

  writeFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), `---
id: EPIC-1
title: "Epic 1"
status: in-progress
prd_ref: FR-1, FR-2
---

## Goal

Epic 1 goal.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-1.1](../stories/US-1.1-foo.md) | Foo | foo goal | 📋 backlog | — |
| [US-1.2](../stories/US-1.2-bar.md) | Bar | bar goal | 📋 backlog | — |
`);

  writeFileSync(join(docs, 'sprints', 'sprint-2026-W01.md'), `---
id: sprint-2026-W01
status: in-progress
start: 2026-01-01
end: 2026-01-07
goal: "Ship foo + bar"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-1.1 | Foo | EPIC-1 | P0 | 5 | 📋 backlog | new | [link](stories/US-1.1-foo.md) |
| US-1.2 | Bar | EPIC-1 | P1 | 3 | 🚧 in-progress | new | [link](stories/US-1.2-bar.md) |
`);

  writeFileSync(join(docs, 'PRD.md'), `# PRD

## 8. Functional requirements

| ID | Requirement | Priority | Status | Epic |
|---|---|---|---|---|
| FR-1 | Foo support | P0 | 📋 Backlog | EPIC-1 |
| FR-2 | Bar support | P1 | 📋 Backlog | EPIC-1 |

## 11. Epics & User Stories

### EPIC-1 — Epic 1
| Story | Title | Status | Version |
|---|---|---|---|
| US-1.1 | Foo | 📋 Backlog | — |
| US-1.2 | Bar | 📋 Backlog | — |
`);

  writeFileSync(join(docs, 'CHANGELOG.md'), `# Changelog

## [Unreleased]

(empty)

## [0.1.0] — 2026-01-05 — Initial release — v0.1.0

Shipped foo and bar.

### Added
- Foo
- Bar

**Commit**: pending
`);

  writeFileSync(join(docs, 'sprints', 'sprint-2026-W23.md'), `---
id: sprint-2026-W23
status: in-progress
start: 2026-05-27
end: 2026-06-03
goal: "8-column scope table for W23 BLOCKER fixture"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-1.1 | Foo | EPIC-1 | P0 | 5 | 🟢 ready | new | [link](stories/US-1.1-foo.md) |
| US-1.2 | Bar | EPIC-1 | P1 | 3 | 🟢 ready | new | [link](stories/US-1.2-bar.md) |
`);

  return docs;
}
