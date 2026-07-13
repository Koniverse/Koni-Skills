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

[refstyle]: references/ok.md

~~~markdown
## Heading inside a tilde fence — not a real heading
[this resolves in the generated doc](../../PRD.md)
~~~

````markdown
## Heading inside a backtick fence
```yaml
key: value
```
````
