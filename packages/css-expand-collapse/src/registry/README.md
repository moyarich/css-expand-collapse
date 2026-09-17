# Shorthand registry

Each CSS shorthand lives in its own module under `shorthands/`. The **filename is the CSS property name**, and every default export satisfies the same `ShorthandModule` contract.

```ts
export interface ShorthandModule {
  readonly longhands: LonghandMap;
  readonly expand: ShorthandExpander;
  readonly collapse: ShorthandCollapser;
  readonly safeToDropWhenFullyShadowed?: boolean;
}
```

There is no strategy dispatcher. A shorthand module owns both transformation directions. Adding a new shorthand should not require adding a case to `core.ts`.

## Registry responsibilities

```text
registry/
├── context.ts       # CSSTree matching and top-level value splitting
├── expanders.ts     # reusable expansion factories
├── collapsers.ts    # reusable collapse factories
├── helpers.ts       # longhand-name helpers
├── module.ts        # common module contract
├── index.ts         # derived lookup tables
└── shorthands/      # one module per CSS shorthand
```

`shorthands/index.ts` is generated from filenames and must not be edited manually. `SHORTHAND_MODULES`, `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are derived from that generated map.

## Simple shorthand

Simple grammars compose reusable expand/collapse factories:

```ts
// shorthands/margin.ts
import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = quad("margin");
const expand = expandQuad(longhands);
const collapse = collapseQuad(longhands);

export default {
  longhands,
  expand,
  collapse,
} satisfies ShorthandModule;
```

Available shared collapse factories include `collapseQuad`, `collapsePair`, `collapseTriple`, `collapseComponents`, `collapseSlashPair`, and `collapseLogicalBorderAxis`.

## Property-specific shorthand

Complex grammars keep their own parsing, defaulting, and serialization rules in the property module. CSSTree grammar validation is available through the shared contexts.

```ts
const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("example", value)) return null;

  return {
    "example-a": "...",
    "example-b": "...",
  };
};

const collapse: ShorthandCollapser = (declarations, context) => {
  const candidate = buildCandidate(declarations);
  return context.matchProperty("example", candidate)
    ? candidate
    : null;
};

export default {
  longhands,
  expand,
  collapse,
} satisfies ShorthandModule;
```

`flex`, `text-decoration`, `border`, `background`, `mask`, `animation`, `transition`, `font`, `grid`, and other special grammars own their property-specific collapse behavior in their respective modules.

## Shared context

`context.ts` owns runtime-neutral CSS grammar matching and top-level splitting:

```ts
shorthandExpandContext = {
  matchProperty,
  splitWhitespace,
  splitSlash,
};

shorthandCollapseContext = {
  matchProperty,
};
```

It also exports top-level comma, slash, and whitespace splitting helpers. Transformation modules must not depend on `document`, detached elements, or mutable `CSSStyleDeclaration` objects.

## Cascade safety metadata

`safeToDropWhenFullyShadowed` is metadata only. It does not select an implementation.

Set it to `false` when a shorthand has reset/cascade effects beyond the registered longhands. `css.ts` uses this fact while preserving source order and `!important` behavior. If omitted, the registered longhand set is treated as complete for shadow-removal purposes.

## Adding a shorthand

1. Add `shorthands/<property>.ts`.
2. Declare its `longhands` map, pairing each longhand with its initial value.
3. Implement `expand` and `collapse` in that module.
4. Reuse `expanders.ts` and `collapsers.ts` factories when the grammar matches.
5. Keep special parsing/serialization semantics in the shorthand file and validate candidates with `context.matchProperty(...)`.
6. Set `safeToDropWhenFullyShadowed: false` only when the registered longhands do not represent every cascade/reset effect.
7. Run `npm run generate:registry`.
8. Add expansion, collapse, and round-trip tests.

Collapse must be conservative. If an equivalent shorthand cannot be reconstructed without guessing, return `null` and leave the longhands unchanged.

`all.ts` follows the same interface but has an empty longhand set, so it remains recognized by `isShorthand()` while `supportsTransform("all")` returns `false`.
