#!/usr/bin/env python3
"""Mutation-test the *test suite*, not the checker.

An author-blind reviewer took `check-references.py`, regressed `SECTION_POINTER`
to backticks-only — blinding it to two of the three §-pointer syntaxes, the exact
class it was written for — and the self-test **still printed green**. Its
assertions were substrings matched against the whole report, so one surviving
form satisfied all three.

That is the failure this file exists to prevent. A suite that survives a mutant
checker is not a suite; it is a fifteenth way to print `0`.

So: break the checker on purpose, one rule at a time, and assert the suite
*notices*. If a mutant survives, the suite has a hole and the mutant names it.

    python3 skills/koni-docs/scripts/__tests__/test-mutations.py
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHECKER = HERE.parent / 'check-references.py'
SUITE = HERE / 'test-check-references.py'

# Each mutation is a (label, find, replace) that plausibly *narrows* the checker —
# the shape every real regression in this file's history has taken.
MUTATIONS: list[tuple[str, str, str]] = [
    (
        'SECTION_POINTER sees only the backticked form (the reviewer’s own mutant)',
        r"    r'\[?`?([A-Za-z][\w./-]*\.md)`?(?:\]\(([^)]*)\))?,?\s*§([^\n,.;()\[\]|`+]+)'",
        r"    r'`([A-Za-z][\w./-]*\.md)`()()?,?\s*§([^\n,.;()\[\]|`+]+)'",
    ),
    (
        'fences are backticks only — ~~~ blocks become phantom headings again',
        r"    for m in re.finditer(r'^[ \t]{0,3}(`{3,}|~{3,})', text, re.M):",
        r"    for m in re.finditer(r'^[ \t]{0,3}(`{3,})', text, re.M):",
    ),
    (
        'script names must be backticked — the agile-sync-up.mjs ghost slips through',
        r"SCRIPT_NAME = re.compile(r'(?<![\w/.\-…*])([\w-]+(?:\.[\w-]+)*\.(?:mjs|py|sh))(?![\w-])')",
        r"SCRIPT_NAME = re.compile(r'`([\w./-]+\.(?:mjs|py|sh))`')",
    ),
    (
        'HTML and reference-style definitions stop being scanned',
        '        for pattern in (REF_DEF, HTML_SRC):',
        '        for pattern in ():',
    ),
    (
        'a §-pointer with a wrong path is rescued by basename again',
        "                if '/' in cited:",
        "                if False:",
    ),
    (
        'the uppercase-stem exemption returns, blinding the checker to SKILL.md',
        "    if '*' in target:\n        return True          # `*.spec.ts` is a glob — a shape, not a file",
        "    if '*' in target or Path(target).stem[:1].isupper():\n        return True",
    ),
]


def run_suite(checker_source: str) -> tuple[int, str]:
    """Run the real suite against a temporarily-mutated checker."""
    original = CHECKER.read_text(encoding='utf-8')
    try:
        CHECKER.write_text(checker_source, encoding='utf-8')
        p = subprocess.run(
            [sys.executable, str(SUITE)], capture_output=True, text=True,
        )
        return p.returncode, p.stdout + p.stderr
    finally:
        CHECKER.write_text(original, encoding='utf-8')


def main() -> int:
    source = CHECKER.read_text(encoding='utf-8')
    survivors: list[str] = []

    # Sanity: the unmutated checker must pass, or every result below is noise.
    rc, out = run_suite(source)
    if rc != 0:
        print('The suite fails on the UNMUTATED checker — fix that first:\n')
        print(out)
        return 1

    for label, find, replace in MUTATIONS:
        if find not in source:
            survivors.append(f'{label}\n      (the mutation no longer applies — the '
                             f'checker was refactored; re-anchor this mutant)')
            continue
        rc, _ = run_suite(source.replace(find, replace, 1))
        if rc == 0:
            survivors.append(f'{label}\n      SURVIVED — the suite passed a checker '
                             f'that cannot do this. That hole is real.')

    if survivors:
        print('mutation test FAILED — the suite does not notice these regressions:\n')
        for s in survivors:
            print(f'  ✗ {s}')
        print(f'\n{len(survivors)} surviving mutant(s). Add a fixture that kills each one.')
        return 1

    print(f'✓ mutation test: all {len(MUTATIONS)} mutant checkers were killed by the suite')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
