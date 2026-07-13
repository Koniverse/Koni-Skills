#!/usr/bin/env python3
"""Assert every cross-reference in a skill points at something that exists.

Three defect classes, all found the hard way (LESSONS §18, §19), all invisible
to a human re-reading their own edit:

1. **Dead file links** — a doc routes to `references/migration-from-bmad.md`
   that was never written, or a moved file's link was not re-based.
2. **Dead anchors** — `](#some-heading)` where no such heading exists. The trap:
   `## ` lines *inside* a fenced code block are template skeletons, not headings,
   and GitHub emits no anchor for them. A checker that forgets this certifies
   150 dead links as green.
3. **Dead section pointers** — `See: templates.md §Story file` after
   `templates.md` became a thin index with no such section.

Run from the repo root:

    python3 skills/koni-docs/scripts/check-references.py skills/koni-docs

Exits non-zero if anything dangles. Silence means every pointer resolves.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HEADING = re.compile(r'^#{1,6} (.+)$', re.M)   # H1 too — `](#title)` is a legal link
# Setext form: a line underlined by === or ---. GitHub emits an anchor for it; a
# checker that only knows ATX headings calls a live link dead.
SETEXT = re.compile(r'^(?!\s*$)([^\n]+)\n(?:=+|-{2,})[ \t]*$', re.M)
ANCHOR_LINK = re.compile(r'\]\(\s*#([^)\s"]+)(?:\s+"[^"]*")?\s*\)')
# Every destination form CommonMark allows, because each has hidden a dead link here:
#   ](path)   ](path#anchor)   ](path "Title")   ](<path>)   ](<path> "Title")
FILE_LINK = re.compile(
    r'\]\(\s*<?([^)>#\s"]+)>?(?:#([^)\s">]+))?(?:\s+"[^"]*")?\s*\)'
)
# Reference-style definitions: [label]: path/to/file.md
REF_DEF = re.compile(r'^\[[^\]]+\]:\s*<?([^\s>]+)>?', re.M)
# A skill's markdown renders as HTML, so <a href> and <img src> are links too.
HTML_SRC = re.compile(r'<(?:a|img|source)\b[^>]*?\b(?:href|src)\s*=\s*"([^"]+)"', re.I)
# `file.md` §Section, the linked form [`file.md`](path) §Section, and the bare form
# SKILL.md §3a-bis — all three have shipped dead in this repo.
SECTION_POINTER = re.compile(
    r'\[?`?([A-Za-z][\w./-]*\.md)`?(?:\]\(([^)]*)\))?,?\s*§([^\n,.;()\[\]|`+]+)'
)

# Backticked OR bare. The first version required backticks — so `agile-sync-up.mjs`,
# the very ghost this check was written for, would still have slipped through unquoted.
#
# Scope, stated honestly: this covers the **runnable tooling a skill tells you to
# execute** (.sh / .py / .mjs), not every source file a doc may cite. `.ts` / `.js`
# were in scope briefly and produced false positives on legitimate cross-repo
# references (koni-agent-monitoring cites Koni-ERP-02's `ingest-schema.ts`) — a check
# that cries wolf gets ignored, which ends in the same place as silence.
SCRIPT_NAME = re.compile(r'(?<![\w/.\-…*])([\w-]+(?:\.[\w-]+)*\.(?:mjs|py|sh))(?![\w-])')


def is_external(target: str) -> bool:
    """An http(s) URL is not ours to resolve."""
    return target.startswith(('http://', 'https://'))


# Docs that live in the CONSUMER's repo (docs/), not in the skill. A template may
# legitimately point a generated document at them; the skill cannot resolve them.
CONSUMER_DOCS = {
    'DESIGN.md', 'LESSONS.md', 'CONTEXT.md', 'PRD.md', 'ARCHITECTURE.md',
    'CHANGELOG.md', 'SETUP.md', 'BRIEF.md', 'DEPLOY.md', 'STATUS.md', 'VERSION',
}


def is_placeholder(target: str) -> bool:
    """`US-X.Y-<slug>.md` is a shape, not a path — it resolves in the generated
    document, not in the template that describes it. `checks/foo.sh` is an
    illustration of a file the reader would author, not a claim that it exists."""
    if '<' in target or 'X.Y' in target or 'X.Z' in target or 'EPIC-N' in target:
        return True
    if '*' in target:
        return True          # `*.spec.ts` is a glob — a shape, not a file
    stem = Path(target).stem.lower()
    return (stem in {'foo', 'bar', 'baz', 'example'}
            or stem.startswith(('your-', 'my-', 'example-', 'foo')))


def is_prose_not_a_script(name: str) -> bool:
    """Only for the SCRIPT_NAME pass.

    `Next.js` is a product, not a tool; `crypto.test.ts` is a naming convention shown
    in prose. Both must be exempt — but ONLY here. An earlier version applied the
    capitalized-stem rule to *every* reference class, which made the checker blind to
    `SKILL.md` and `README.md` — and therefore to `[SKILL.md §5](../SKILL.md)`, the
    pointer that had just replaced a deleted mirror. A fix that opened a bigger hole
    than the one it closed. Scope the exemption to the pass that needs it.
    """
    stem = Path(name).stem
    if stem[:1].isupper():
        return True          # `Next.js`, `React.js` — product names
    return bool(re.search(r'\.(test|spec|integration|e2e|unit)$', stem))


def strip_fences(text: str) -> str:
    """Blank out fenced blocks. A `## ` inside one is sample content, not a heading."""
    out = list(text)
    for start, end in fence_spans(text):
        for i in range(start, end):
            if out[i] != '\n':
                out[i] = ' '
    return ''.join(out)


def github_slug(heading: str) -> str:
    """GitHub's algorithm: drop backticks and punctuation, then hyphenate EACH
    remaining space — it does not collapse runs (`a — b` → `a--b`) and it does not
    trim the gap a stripped leading emoji leaves behind (`## 🚀 Deploy` → `#-deploy`)."""
    h = heading.replace('`', '')
    h = re.sub(r'[^\w\s-]', '', h.lower())
    h = h.strip('\n\t')                 # newlines only — a leading space is significant
    return h.replace(' ', '-')


def anchors_of(text: str) -> set[str]:
    """Every anchor GitHub will actually emit for this file."""
    seen: dict[str, int] = {}
    out: set[str] = set()
    body = strip_fences(text)
    for h in HEADING.findall(body) + SETEXT.findall(body):
        slug = github_slug(h.strip())
        n = seen.get(slug, 0)
        seen[slug] = n + 1
        out.add(slug if n == 0 else f'{slug}-{n}')
    return out


def fence_spans(text: str) -> list[tuple[int, int]]:
    """Character ranges covered by a fenced block.

    A fence closes only on a marker of *at least* its own length, so a ``` block
    nested inside a ```` block does not close it. Counting ``` parity — which an
    earlier version of this script did — misreads exactly that case, which is the
    same defect class the script exists to catch. Fixed, not rationalized.
    """
    spans: list[tuple[int, int]] = []
    open_at: int | None = None
    open_len = 0
    open_char = ''
    for m in re.finditer(r'^[ \t]{0,3}(`{3,}|~{3,})', text, re.M):
        marker = m.group(1)
        char, length = marker[0], len(marker)
        if open_at is None:
            open_at, open_len, open_char = m.start(), length, char
        elif char == open_char and length >= open_len:
            spans.append((open_at, m.end()))
            open_at, open_len, open_char = None, 0, ''
    if open_at is not None:
        spans.append((open_at, len(text)))
    return spans


def comment_spans(text: str) -> list[tuple[int, int]]:
    """HTML comments. A link inside one is not a link."""
    return [(m.start(), m.end()) for m in re.finditer(r'<!--.*?-->', text, re.S)]


def in_fence(text: str, index: int) -> bool:
    """A link inside a fence belongs to the *generated* document, not this one.
    A link inside an HTML comment belongs to nobody."""
    return any(start <= index < end for start, end in fence_spans(text) + comment_spans(text))


def check(root: Path) -> list[str]:
    problems: list[str] = []
    repo = root.parent.parent  # repo root — a cited script may live in packages/ or scripts/
    cache: dict[Path, str] = {}

    def read(p: Path) -> str:
        if p not in cache:
            cache[p] = p.read_text(encoding='utf-8')
        return cache[p]

    for md in sorted(root.rglob('*.md')):
        # The self-test's fixtures are deliberately broken — that is their job. Skip
        # them when sweeping a skill, but NOT when they are themselves the target
        # (relative_to(root)), or the self-test would silently pass on garbage.
        if '__tests__' in md.relative_to(root).parts:
            continue
        text = read(md)
        own_anchors = anchors_of(text)

        for m in ANCHOR_LINK.finditer(text):
            if in_fence(text, m.start()):
                continue
            if m.group(1) not in own_anchors:
                problems.append(f'{md}: dead anchor #{m.group(1)}')

        for m in FILE_LINK.finditer(text):
            target_raw = m.group(1)
            # `](...)` / `](path)` in prose are illustrations, not links.
            if '/' not in target_raw and '.' not in target_raw:
                continue
            if set(target_raw) <= {'.'}:
                continue
            if in_fence(text, m.start()) or is_external(target_raw) or is_placeholder(target_raw):
                continue
            if Path(target_raw).name in CONSUMER_DOCS:
                continue          # lives in the consumer's docs/, not in the skill
            target = (md.parent / m.group(1)).resolve()
            if not target.exists():
                problems.append(f'{md}: dead link -> {m.group(1)}')
                continue
            if m.group(2) and target.suffix == '.md':
                if m.group(2) not in anchors_of(read(target)):
                    problems.append(f'{md}: dead anchor {m.group(1)}#{m.group(2)}')

        for pattern in (REF_DEF, HTML_SRC):
            for m in pattern.finditer(text):
                t = m.group(1)
                if in_fence(text, m.start()) or is_external(t) or is_placeholder(t):
                    continue
                if '/' not in t and '.' not in t:
                    continue
                path, _, frag = t.partition('#')
                if Path(path).name in CONSUMER_DOCS:
                    continue
                tgt = md.parent / path
                if path and not tgt.exists():
                    problems.append(f'{md}: dead link -> {t}')
                    continue
                # The fragment was previously split off and thrown away, so a dead
                # anchor inside an HTML href or a reference definition was invisible.
                anchors = own_anchors if not path else (
                    anchors_of(read(tgt)) if tgt.suffix == '.md' else set())
                if frag and tgt.suffix in ('', '.md') and frag not in anchors:
                    problems.append(f'{md}: dead anchor {t}')

        siblings = root.parent  # sibling skills — cross-skill pointers are legitimate
        for m in SECTION_POINTER.finditer(text):
            if is_placeholder(m.group(1)) or Path(m.group(1)).name in CONSUMER_DOCS:
                continue
            # In the linked form [`label.md`](real/path.md) §Sec, the BACKTICK is a
            # label and the HREF is the path. Resolving the label was how a correct
            # pointer got reported dead — a false positive is the same failure as a
            # false green: it teaches people to ignore the gate.
            cited = m.group(2) or m.group(1)
            cited = cited.split('#')[0]
            target = md.parent / cited
            if not target.exists():
                if '/' in cited:
                    problems.append(f'{md}: §-pointer path does not resolve -> {cited}')
                    continue
                matches = list(root.rglob(cited)) or list(siblings.rglob(cited))
                if not matches:
                    problems.append(f'{md}: §-pointer to a file that does not exist -> {cited}')
                    continue
                target = matches[0]
            named = m.group(3).strip()
            if '–' in named or '—' in named:
                continue    # "§0–§1" is a range, not a heading
            # "§3 for the per-document contract" names section 3; the rest is prose.
            head = named.split()[0] if named.split() else named
            if re.fullmatch(r'\d+[a-z]?', head):
                named = head
            wanted = github_slug(named)
            headings = [h.strip() for h in HEADING.findall(strip_fences(read(target)))]
            slugs = [github_slug(h) for h in headings]
            if re.fullmatch(r'\d+[a-z]?', named):
                # "§3" means the section numbered 3 — match "## 3. Title", never "## 30.".
                # "§2b" is a sub-label a heading carries inline, e.g. "## Deadline (§2b …)".
                ok = any(re.match(rf'{re.escape(named)}\.\s', h) or f'§{named}' in h
                         for h in headings)
            else:
                # A §pointer may be shorter than the heading ("§Scripts" → "## Scripts
                # reference") or trail into prose ("§Alive for details" → "## Alive").
                # Accept either direction, on a word boundary.
                ok = any(sl == wanted
                         or sl.startswith(wanted + '-')
                         or wanted.startswith(sl + '-')
                         for sl in slugs)
            if not ok:
                problems.append(f'{md}: dead §-pointer -> {m.group(1)} §{named}')

        for m in SCRIPT_NAME.finditer(text):
            if (in_fence(text, m.start()) or is_placeholder(m.group(1))
                    or is_prose_not_a_script(m.group(1))):
                continue
            name = Path(m.group(1)).name
            found = list(root.rglob(name)) or [
                q for q in repo.rglob(name)
                if 'node_modules' not in q.parts and '.git' not in q.parts
            ]
            if not found:
                problems.append(f'{md}: names a script that does not exist -> {m.group(1)}')

    return problems


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else 'skills/koni-docs').resolve()
    if not root.is_dir():
        print(f'not a directory: {root}', file=sys.stderr)
        return 2
    problems = check(root)
    for p in problems:
        print(p)
    print(f'\n{len(problems)} dangling reference(s) in {root}')
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
