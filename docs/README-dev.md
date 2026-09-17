# Developer Guide

This document contains repository setup, workspace commands, architecture notes, and the workflow for extending CSS shorthand support. User-facing installation and API examples belong in [`README.md`](../README.md) and [`packages/css-expand-collapse/README.md`](../packages/css-expand-collapse/README.md).

## Repository structure

```text
css-expand-collapse/
├── apps/
│   └── playground/                  # React + Vite playground
├── docs/
│   └── README-dev.md                # repository/developer documentation
├── packages/
│   └── css-expand-collapse/         # publishable npm package
├── README.md                        # user-facing package overview
└── package.json                     # workspace scripts
```

The two workspaces are:

- `packages/css-expand-collapse` — publishable `@moyarich/css-expand-collapse` package.
- `apps/playground` — React + Vite playground for exercising the package against real CSS.

The playground consumes package source directly during development, so the library does not need to be built before starting it.

## Repository setup

```bash
npm install
npm run dev
```

## Workspace commands

```bash
npm run dev               # Start the playground
npm run generate:registry # Regenerate shorthand registry barrel
npm test                  # Run library tests
npm run typecheck         # Typecheck all workspaces
npm run build             # Build library + playground
npm run build:lib         # Build only the npm package
npm run build:playground  # Build only the playground
npm run pack:lib          # Preview npm package contents
```

The package also exposes `check:registry`; package `test`, `typecheck`, and `build` run that freshness check automatically.

## Playground deployment

The playground lives in `apps/playground` and is deployed to GitHub Pages by GitHub Actions.

```text
https://moyarich.github.io/css-expand-collapse/
```

The Vite production base path is `/css-expand-collapse/` for the Pages build.

## Runtime architecture

Transformation logic must be runtime-neutral. Do not use `document`, detached elements, or mutable `CSSStyleDeclaration` objects to parse or serialize a shorthand. The same implementation must work in:

```text
Node.js
Chrome extension service workers
Chrome extension content scripts
browser pages
workers
CLI processes
```

CSSTree provides CSS grammar matching. The package owns shorthand-specific semantics such as omitted-value defaults, component assignment, slash groups, comma-separated layers, and safe serialization.

The source layout is intentionally divided by responsibility:

```text
src/
├── core.ts                 # public transformation orchestration
├── css.ts                  # stylesheet/cascade orchestration
└── registry/
    ├── index.ts            # lookup tables derived from modules
    ├── module.ts           # common shorthand contract
    ├── context.ts          # CSSTree matching + value splitting
    ├── expanders.ts        # reusable expand factories
    ├── collapsers.ts       # reusable collapse factories
    ├── helpers.ts          # longhand-map helpers
    └── shorthands/         # one implementation per shorthand
```

`core.ts` does not contain property-family parsing or collapse strategy switches. It normalizes input, resolves the module, handles shared global-value/initial-fill behavior, and delegates to that module.

`css.ts` owns stylesheet-level behavior: source order, `!important`, declaration consumption, overlapping shorthands, AST replacement, and cascade-safe removal. Those concerns do not belong in individual shorthand files.

## Shorthand module architecture

Each CSS shorthand lives in its own file under:

```text
packages/css-expand-collapse/src/registry/shorthands/
```

The **filename is the CSS property name**:

```text
margin.ts               -> margin
text-decoration.ts      -> text-decoration
background.ts           -> background
-webkit-text-stroke.ts  -> -webkit-text-stroke
```

Every module satisfies the same contract:

```ts
export interface ShorthandModule {
  readonly longhands: LonghandMap;
  readonly expand: ShorthandExpander;
  readonly collapse: ShorthandCollapser;
  readonly safeToDropWhenFullyShadowed?: boolean;
}
```

`LonghandMap` is the single source of truth for both constituent property names and CSS initial values:

```ts
export type LonghandMap = ReadonlyMap<string, string>;
```

The property name is intentionally not repeated inside the object. The generated registry derives it from the filename.

There is no executable `strategy` field and no central strategy switch. A shorthand module owns both transformation directions.

`all.ts` still satisfies the interface, but its longhand set is empty, so it is recognized by `isShorthand()` while remaining non-transformable.

## Shared transformation context

`registry/context.ts` owns CSSTree matching and top-level value splitting.

```ts
export const shorthandExpandContext = {
  matchProperty,
  splitWhitespace,
  splitSlash,
};

export const shorthandCollapseContext = {
  matchProperty,
};
```

`matchProperty()` delegates to CSSTree's lexer and should be used as the grammar authority instead of maintaining duplicate keyword tables where possible.

Top-level splitting preserves commas, slashes, CSS whitespace, strings, brackets, and functions correctly rather than using naive `String.split()` calls. The scanner compares named Unicode code-point constants instead of repeatedly allocating one-character strings or using a JavaScript whitespace regex whose definition is broader than CSS whitespace.

## Simple shorthand implementations

Simple grammars should compose reusable helpers from `registry/expanders.ts` and `registry/collapsers.ts`.

```ts
// registry/shorthands/margin.ts
import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

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

Reusable collapse factories currently include:

```text
collapseQuad
collapsePair
collapseTriple
collapseComponents
collapseSlashPair
collapseLogicalBorderAxis
```

The inverse expansion factories live in `expanders.ts`.

## Property-specific implementations

When a shorthand has special ordering, ambiguity, reset behavior, layer alignment, or serialization rules, keep those semantics inside its own module.

For example, `flex.ts` owns `none` and `auto` collapse semantics; `text-decoration.ts` owns omission of its default style/color/thickness components; and `border.ts` owns the requirement that all four side triples agree before producing `border`.

A property-specific module should validate the shorthand candidate with CSSTree before returning it:

```ts
const collapse: ShorthandCollapser = (declarations, context) => {
  const candidate = buildCandidate(declarations);
  return context.matchProperty("example", candidate)
    ? candidate
    : null;
};
```

Collapse should be conservative. If an equivalent shorthand cannot be reconstructed without guessing, return `null` and leave the longhands unchanged.

## Cascade safety metadata

`safeToDropWhenFullyShadowed` is metadata only; it never chooses expansion/collapse code.

Most simple modules can omit it. Set it to `false` when the shorthand has reset or cascade effects beyond the registered longhands. `css.ts` uses this to decide whether an earlier shorthand can be removed after a complete later longhand set is collapsed.

For example, complex reset shorthands such as `background` remain conservative, while a shorthand whose registered longhands completely describe its effect can be safely replaced.

## Adding a shorthand

1. Add `packages/css-expand-collapse/src/registry/shorthands/<property>.ts`.
2. Declare one `LonghandMap` that pairs every registered longhand with its CSS initial value.
3. Implement `expand` and `collapse` in that module.
4. Reuse factories from `expanders.ts` and `collapsers.ts` when appropriate.
5. Keep property-specific parsing and serialization in the module itself.
6. Use `context.matchProperty(...)` to validate CSS grammar.
7. Set `safeToDropWhenFullyShadowed: false` only when the registered longhands are not the complete cascade/reset effect.
8. Run `npm run generate:registry`.
9. Add expansion, collapse, and round-trip tests.

Adding a new shorthand should not require editing `core.ts`.

## Generated registry

`packages/css-expand-collapse/src/registry/shorthands/index.ts` is generated by:

```bash
npm run generate:registry
```

Do not edit that file by hand. The generated map is typed as `Record<string, ShorthandModule>`, so a module that does not satisfy the common contract fails typecheck.

The registry derives:

```text
SHORTHAND_MODULES
SHORTHAND_PROPERTIES
SHORTHAND_DEFINITIONS
SHORTHAND_SET
LONGHAND_TO_SHORTHANDS
```

`SHORTHAND_DEFINITIONS` contains modules with non-empty longhand sets. This is how transformability is determined; there is no strategy discriminator.

## Testing expectations

For each shorthand, add tests that cover the forms its grammar supports. When both directions are supported, include round-trip checks where practical.

Important areas include:

- omitted/default shorthand components;
- one-, two-, three-, and four-value families;
- slash-separated grammar;
- comma-separated layers;
- global values such as `inherit` and `initial`;
- `!important` and source-order behavior at the stylesheet layer;
- computed/export CSS containing a shorthand followed by its resolved longhands;
- values containing functions, strings, commas, or slashes;
- `fillMissingLonghands: "initial"` behavior.

Before publishing or merging a structural change, run:

```bash
npm test
npm run typecheck
npm run build
```
