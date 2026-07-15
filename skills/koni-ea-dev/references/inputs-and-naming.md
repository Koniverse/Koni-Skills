# Inputs & naming

The conventions that make an EA readable in the MT5 Inputs tab and consistent to
read. Where the corpus diverges, the **canonical** form is stated and the
divergence flagged so old EAs can migrate.

**Contents**: [Inputs](#inputs) · [Enums](#enums) · [Naming](#naming) ·
[English-code rule](#english-code-rule)

## Inputs

- **Prefix every input `Inp` + PascalCase**: `InpMagicNumber`, `InpShortPeriod`,
  `InpAtrSLMult`. *Canonical.* (`GRID_DCA` ships bare names like `MagicNumber`,
  `BaseLot` — the one outlier; do not copy it.)
- **Group with `input group`** dividers using a consistent fence:
  `input group "==== Risk Management ===="`. Pick `====` (4) and keep it uniform
  within a file. (`===` vs `====` and plain `// ----` comment dividers all appear
  in the corpus; standardise on `input group "==== … ===="`.)
- **Every input carries an inline `// comment`** — it is the human-facing label
  MT5 shows. Put the unit and the formula in it:
  ```mq5
  input double InpATRMultiplier = 2.0;  // ATR multiplier for SL (SL distance = ATR * n)
  ```
- **Mark dependent inputs** with a bracketed guard naming the controlling input:
  ```mq5
  input int InpTPPoints = 300;  // [InpTPMode=TP_BY_POINTS] Take Profit in points
  ```
- **Types**: base lot `double = 0.01`; periods `int`; multipliers `double`;
  toggles `bool`; magic `long` (`POSITION_MAGIC` is a `long`; the corpus commonly
  uses `int`, which also works via implicit widening). Everything is `input` —
  `sinput` is not used.
- **MagicNumber** is `> 0` and **unique per running instance** — MT5 does not
  enforce uniqueness, and a shared magic silently merges two EAs' positions in every
  query ([magic collision](mql5-pitfalls.md#magicnumber-collision)). Validate
  `InpMagicNumber > 0` in `OnInit`.

## Enums

`ENUM_`-prefixed name, `UPPER_SNAKE` members, each member commented (the comment
is the dropdown label):

```mq5
enum ENUM_BREAKOUT_MODE {
   BREAKOUT_HIGH_LOW,           // buy and sell
   BREAKOUT_HIGH_ONLY,          // only buy
   BREAKOUT_LOW_ONLY,           // only sell
   BREAKOUT_ONE_PER_RANGE       // one trade per range
};
input ENUM_BREAKOUT_MODE InpBreakoutMode = BREAKOUT_HIGH_LOW;  // breakout mode
```

Use the built-in `ENUM_TIMEFRAMES` directly for a timeframe input.

## Naming

| Kind | Convention | Example |
|---|---|---|
| Input | `Inp` + PascalCase | `InpMagicNumber` |
| Global | `g_` + camelCase | `g_trade`, `g_lastBarTime`, `g_basket` |
| Local / param | camelCase | `lotSize`, `slDist` |
| Struct / enum | PascalCase / `ENUM_…` | `BasketState`, `ENUM_TP_MODE` |
| Struct member | camelCase | `range.high`, `basket.avgEntry` |
| `#define` const | `UPPER_SNAKE` | `MAX_ORDERS_PER_SIDE` |
| Function | PascalCase | `CountMyPositions()`, `CalcLotSize()` |
| Log tag | bracketed UPPER | `[ORB]`, `[SL]`, `[DCA-BLOCK]`, `[RECOVER]` |

For **class** naming (`C`-prefix), member (`m_`) and file conventions in reusable
modules, see [`shared-library.md`](shared-library.md#naming). Wrap every function
in a `//+---…---+` banner box; number the file's major sections in comments.

## English-code rule

**English for all code, identifiers, comments, and commit messages.** The corpus
has Vietnamese input comments in places (`STP`) — tolerated legacy, not a model.
New code is English throughout.
