---
id: US-4.38
title: "npm run typecheck has not run at all — TS2209, then a viewer self-import through the export map"
epic: EPIC-4
status: backlog
priority: P2
points: 3
sprint:
due:
version_shipped:
prd_ref: []
arch_ref: []
depends_on: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
external_deps:
---

## Goal

`packages/koni-docs` ships a `typecheck` script. It does not typecheck anything — it exits
non-zero before compiling a single file:

```
$ npm run typecheck
error TS2209: The project root is ambiguous, but is required to resolve export map
entry '.' in file 'packages/koni-docs/package.json'. Supply the `rootDir` compiler
option to disambiguate.
```

Make the script actually check the package, so the package's declared quality gate stops
being decoration.

## Background

**Lessons applied:** §36 (a guard that does not run is a false green) — the reason a
broken `typecheck` script was filed rather than folded into the parent story. Marker
line backfilled 2026-08-02; the citation was already in Dev notes.

Found while shipping [US-4.37](US-4.37-single-line-frontmatter.md), which listed
`npm run typecheck` in its verification plan. Confirmed **pre-existing**: the identical
error reproduces on a clean tree with no working-copy changes, so no story has ever
verified against it. US-4.37 typechecked its own file with a scoped `tsc` invocation
instead, and filed this rather than claiming a green it did not have.

It is not a one-line fix. Adding `"rootDir": "."` clears TS2209 and immediately surfaces a
second layer:

```
src/viewer/lib/corpus.ts(4,63): error TS2307: Cannot find module '@koniverse/koni-docs/lib'
src/viewer/lib/corpus.ts(181,57): error TS7006: Parameter 's' implicitly has an 'any' type
… (and more)
```

Two distinct problems behind one error message:

1. **`rootDir` is unset** while `include` spans `src/cli`, `src/lib` and `__tests__` —
   TypeScript cannot infer a single project root, and needs one to resolve the package's
   own export map.
2. **The viewer self-imports the package through its own export map** —
   `src/viewer/lib/corpus.ts` imports `@koniverse/koni-docs/lib`, which resolves to
   `dist/`. So typechecking depends on a prior build, and `exclude: ["src/viewer"]` does
   not help because exclusion does not apply to files reached by import. The viewer's own
   `src/viewer/tsconfig.json` is a separate project that the root config does not reference.

Deciding between "relative-import the lib from the viewer", "project references", or
"typecheck the viewer as its own project" is a real design call, which is why this is a
story and not a chore.

## Acceptance criteria

- [ ] **AC-1** — `npm run typecheck` exits 0 from a clean checkout after `npm install`,
  with no prior `npm run build`.
- [ ] **AC-2** — it genuinely covers `src/lib`, `src/cli` and `__tests__`: a deliberately
  planted type error in each of the three is caught (the check is proven to **speak**).
- [ ] **AC-3** — the viewer is either covered by the same command or excluded by an
  explicit, documented decision — not by an exclusion that silently fails to apply.
- [ ] **AC-4** — the resolution of the `@koniverse/koni-docs/lib` self-import is written
  down (CONTEXT decision) so the next person does not re-derive it.
- [ ] **AC-5** — `npm test` and `npm run build` still pass unchanged.

## Tasks

- [ ] **TASK-4.38.1** — decide the project layout: `rootDir` + a single project, or project
  references splitting cli/lib/tests from viewer (AC: 1, 3)
- [ ] **TASK-4.38.2** — resolve the viewer's self-import of `@koniverse/koni-docs/lib` (AC: 3, 4)
- [ ] **TASK-4.38.3** — prove the check speaks: plant a type error in each covered area (AC: 2)
- [ ] **TASK-4.38.4** — record the decision; confirm test + build unaffected (AC: 4, 5)

## Dev notes

### What we explicitly did NOT do in US-4.37

Fix it inline. It is unrelated to the serializer defect, and the second layer makes it a
design decision rather than a config tweak. Folding it in would have made a 3-point fix
carry an open-ended refactor.

### References

- [Source: US-4.37](US-4.37-single-line-frontmatter.md) — the story that found it
- [Source: LESSONS §36](../../LESSONS.md) — a guard that does not run is a false green;
  a guard that cannot even start is the same failure, louder

## Verification commands

| AC | Command |
|---|---|
| AC-1 | fresh clone → `cd packages/koni-docs && npm install && npm run typecheck` → exit 0 |
| AC-2 | plant `const x: string = 1;` in each of `src/lib`, `src/cli`, `__tests__` → each is reported |
| AC-5 | `npm test` (147 tests) and `npm run build` unchanged |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [US-4.37](US-4.37-single-line-frontmatter.md)
