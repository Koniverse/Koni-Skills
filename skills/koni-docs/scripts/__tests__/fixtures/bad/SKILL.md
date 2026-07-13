# Bad

## Section

[dead file](references/gone.md)
[dead anchor](#no-such-heading)
[dead titled link](references/gone2.md "title")
[dead angle](<references/gone3.md>)
[dead cross-anchor](references/ok.md#not-there)
<a href="references/gone4.md">dead html link</a>
<img src="references/gone5.png">

[deadref]: references/gone6.md

See `ok.md` §Ghost for details.
See [`ok.md`](references/ok.md) §Ghost for details.
See ok.md §Ghost for details.
See `wrong/path/ok.md` §Alive for details.
The `never-existed.mjs` script runs it.
Run never-existed-too.mjs to sync.
The `ghost-lib.sh` helper runs it.

~~~markdown
## Phantom heading in a tilde fence
~~~
[link to the phantom](#phantom-heading-in-a-tilde-fence)

```yaml
key: value
   ```

[dead link after an indented closing fence](references/gone7.md)
