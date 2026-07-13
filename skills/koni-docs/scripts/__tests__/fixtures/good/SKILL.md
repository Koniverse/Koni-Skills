---
name: fixture
description: clean control
---
# Fixture

**Contents**: [Real section](#real-section)

## Real section

[live file](references/ok.md)
[live anchor](references/ok.md#alive)
[live local](#real-section)
[titled link](references/ok.md "with a title")
[angle](<references/ok.md>)
See `ok.md` §Alive for details.
See [`ok.md`](references/ok.md) §Alive for details.
See ok.md §Alive for details.
The `real-tool.py` script does the thing.
<a href="references/ok.md">html link</a>
<!-- [a link in a comment is not a link](references/gone.md) -->
[the consumer repo's own docs](../../PRD.md)
[live setext anchor](#a-setext-heading)
[live emoji anchor](#-deploy-it)
[live duplicate-heading anchor](#real-section-1)
[live fragment in an href](references/ok.md#alive)
[live explicit HTML anchor](#custom-anchor)
[live anchor on an id= attribute](#id-anchor)
[live same-directory link](references/ok.md)
[live H1 anchor](#fixture)
[live anchor whose heading has code](#a-code-heading)
See `ok.md` §3 for details.
The old `PRD §8` form was retired by the label-only migration — naming it here is fine.
LESSONS §17 is a real numbered entry, not a retired section.

<h3 id="id-anchor">explicit id</h3>

## A `code` heading


<a name="custom-anchor"></a>

A setext heading
================

## 🚀 Deploy it

## Real section


[refstyle]: references/ok.md

~~~markdown
## Heading inside a tilde fence — not a real heading
[this resolves in the generated doc](../../PRD.md)
[and so does this in-page anchor](#a-section-of-the-generated-doc)
~~~

````markdown
## Heading inside a backtick fence
```yaml
key: value
```
````
