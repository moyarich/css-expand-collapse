# Shorthand registry

Each CSS shorthand lives in its own module under `shorthands/<feature>/`. The **filename is the CSS property name**, and every default export satisfies the same `ShorthandModule` contract.

```ts
export interface ShorthandModule {
  readonly longhands: LonghandMap;
  readonly excludedLonghands?: readonly string[];
  readonly experimental?: boolean;
  readonly expand?: ShorthandExpander;
  readonly collapse?: ShorthandCollapser;
  readonly equivalentLonghandValues?: ReadonlyMap<
    string,
    LonghandValueEquivalence
  >;
  readonly safeToDropWhenFullyShadowed?: boolean;
}
```

`LonghandMap` is the source of truth for both constituent property names and CSS initial values:

```ts
export type LonghandMap = ReadonlyMap<string, string>;
```

There is no strategy dispatcher. A shorthand module owns its implemented transformation directions. Capabilities are derived from callable handlers and a nonempty active constituent set. Adding a new shorthand should not require adding a case to `core.ts`.

## Registry responsibilities

```text
registry/
├── context.ts       # CSSTree matching and top-level value splitting
├── expanders.ts     # reusable expansion factories
├── collapsers.ts    # reusable collapse factories
├── helpers.ts       # longhand-map helpers
├── families/         # reusable behavior for related CSS property families
├── module.ts        # common module contract
├── index.ts         # derived lookup tables
└── shorthands/      # feature folders, one module per CSS shorthand
```

`shorthands/index.ts` is generated from filenames and must not be edited manually. `SHORTHAND_MODULES`, `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are derived from that generated map.

The optional `excludedLonghands` field retains known constituents in discovery while excluding them from active transformation definitions. Modules with exclusions use the shared `activeLonghands` helper to select the same constituents for their handlers. Excluded constituents are not emitted for CSS-wide values or consumed during collapse. This is a temporary compatibility mechanism, not a browser-support check.

## Simple shorthand

Simple grammars compose reusable expand/collapse factories:

```ts
// shorthands/spacing/margin.ts
import { collapseQuad } from "../../collapsers.js";
import { expandQuad } from "../../expanders.js";
import type { ShorthandModule } from "../../types.js";

const longhands = new Map([
  ["margin-top", "0"],
  ["margin-right", "0"],
  ["margin-bottom", "0"],
  ["margin-left", "0"],
] as const);

const expand = expandQuad(longhands);
const collapse = collapseQuad(longhands);

export default {
  longhands,
  expand,
  collapse,
} satisfies ShorthandModule;
```

Available shared collapse factories include `collapseQuad`, `collapsePair`, `collapseTriple`, `collapseComponents`, and `collapseSlashPair`. Property-family behavior such as logical border axes lives under `families/`.

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
  return context.matchProperty("example", candidate) ? candidate : null;
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

It also exports top-level comma, slash, and whitespace splitting helpers. The scanner uses named Unicode code-point constants and CSS-defined whitespace characters. Transformation modules must not depend on `document`, detached elements, or mutable `CSSStyleDeclaration` objects.

## Longhand value equivalence

A shorthand may provide `equivalentLonghandValues` when browsers serialize an equivalent longhand value differently from the module's canonical expansion. Keep these rules in the property module rather than adding property-name checks to `css.ts`.

## Cascade safety metadata

`safeToDropWhenFullyShadowed` is metadata only. It does not select an implementation.

Set it to `false` when a shorthand has reset/cascade effects beyond the registered longhands. `css.ts` uses this fact while preserving source order and `!important` behavior. If omitted, the registered longhand set is treated as complete for shadow-removal purposes.

## Adding a shorthand

1. Add `shorthands/<feature>/<property>.ts`.
2. Declare its `LonghandMap`, pairing every longhand with its CSS initial value.
3. Implement either or both supported directions; omit unavailable handlers.
4. Reuse `expanders.ts` and `collapsers.ts` factories when the grammar matches.
5. Keep special parsing/serialization semantics in the shorthand file and validate candidates with `context.matchProperty(...)`.
6. Set `safeToDropWhenFullyShadowed: false` only when the registered longhands do not represent every cascade/reset effect.
7. Run `npm run generate:registry`.
8. Add expansion, collapse, and round-trip tests.

Collapse must be conservative. If an equivalent shorthand cannot be reconstructed without guessing, return `null` and leave the longhands unchanged.

`all.ts` follows the same interface but has an empty longhand set, so it remains recognized by `isShorthand()` while `supportsTransform("all")` returns `false`.

Feature folders organize related modules; the basename remains the public property key. Shared local helpers must use an underscore-prefixed filename. Longhand lookup tables are derived from shorthand modules; no parallel longhand registry is required.
