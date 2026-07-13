#!/usr/bin/env python3
"""The checker's own test suite — planted defects, asserted caught.

Why this file exists, stated plainly: `check-references.py` shipped three
consecutive false greens. Each time it was "verified" by running it on a clean
corpus and reading `0`, and each time an author-blind reviewer found a whole
syntax it could not see. **A checker that always prints 0 also prints 0.**

So the checker is no longer trusted because it is quiet. It is trusted because
this suite plants one defect per class it claims to catch and asserts it fails —
and plants a clean control and asserts it passes. A widening that relocates the
blind spot now breaks a test instead of shipping.

    python3 skills/koni-docs/scripts/__tests__/test-check-references.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHECKER = HERE.parent / 'check-references.py'
GOOD = HERE / 'fixtures' / 'good'
BAD = HERE / 'fixtures' / 'bad'

# Every defect class the checker's docstring and the gate's promise cover.
# The key is a substring that must appear in the report for that defect.
MUST_CATCH = {
    'dead file link': 'gone.md',
    'dead in-page anchor': 'no-such-heading',
    'dead link with a title attribute': 'gone2.md',
    'dead angle-bracket destination': 'gone3.md',
    'dead cross-file anchor': 'not-there',
    'dead HTML href': 'gone4.md',
    'dead HTML img src': 'gone5.png',
    'dead reference-style definition': 'gone6.md',
    'dead §-pointer, backticked form': '§Ghost',
    'dead §-pointer, wrong path': 'wrong/path/ok.md',
    'named script that does not exist (backticked)': 'never-existed.mjs',
    'named script that does not exist (bare)': 'never-existed-too.mjs',
    'named helper that does not exist': 'ghost-lib.sh',
    'phantom anchor from a ~~~ fence': 'phantom-heading',
    'defect after an indented closing fence (the silent-trapdoor bug)': 'gone7.md',
}


def run(target: Path) -> tuple[int, str]:
    p = subprocess.run(
        [sys.executable, str(CHECKER), str(target)],
        capture_output=True, text=True,
    )
    return p.returncode, p.stdout + p.stderr


def main() -> int:
    failures: list[str] = []

    # 1. The clean control must pass. A checker that cries wolf gets ignored,
    #    which is the same outcome as one that stays silent.
    rc, out = run(GOOD)
    if rc != 0:
        failures.append(f'FALSE POSITIVE — the clean fixture must pass, got:\n{out}')

    # 2. Every planted defect must be reported by name.
    rc, out = run(BAD)
    if rc == 0:
        failures.append('FALSE GREEN — the fixture full of dangling references passed')
    for label, needle in MUST_CATCH.items():
        if needle not in out:
            failures.append(f'MISSED [{label}] — nothing in the report mentioned "{needle}"')

    if failures:
        print('check-references self-test FAILED\n')
        for f in failures:
            print(f'  ✗ {f}')
        print(f'\n{len(failures)} failure(s). The guard is not trustworthy until these pass.')
        return 1

    print(f'✓ check-references self-test: clean fixture passes, '
          f'{len(MUST_CATCH)} planted defect classes all caught')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
