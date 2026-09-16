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

The playground consumes the package source directly during development, so the library does not need to be built before starting the playground.

## Repository setup

```bash
npm install
npm run dev
```

`npm run dev` starts the playground workspace.

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

Production URL:

```text
https://moyarich.github.io/css-expand-collapse/
```

The Vite production base path is `/css-expand-collapse/` when the GitHub Pages build is running.

## Runtime architecture

Transformation logic must be runtime-neutral. Do not use `document`, detached elements, or mutable `CSSStyleDeclaration` objects to parse a shorthand. The same shorthand implementation should run in:

```text
Node.js
Chrome extension service workers
Chrome extension content scripts
browser pages
workers
CLI processes
```

CSSTree provides CSS parsing and grammar matching. The package provides shorthand-specific semantics such as omitted-value defaults, component assignment, slash groups, comma-separated layers, and safe serialization.

`core.ts` owns orchestration and shared CSSTree grammar matching. Property-specific behavior belongs to the shorthand module.

## Shorthand module architecture

Each CSS shorthand lives in its own file under:

```text
packages/css-expand-collapse/src/registry/shorthands/
```

The **filename is the CSS property name**. For example:

```text
margin.ts               -> margin
text-decoration.ts      -> text-decoration
background.ts           -> background
-webkit-text-stroke.ts  -> -webkit-text-stroke
```

Every shorthand module must satisfy the same `ShorthandModule` interface:

```ts
export interface ShorthandModule {
  readonly longhands: readonly string[];
  readonly strategy: ShorthandStrategy | null;
  readonly initialValues?: readonly string[];
  readonly expand: ShorthandExpander;
  readonly collapse?: ShorthandCollapser;
}
```

The property name is intentionally not repeated inside the object. The generated registry derives it from the filename.

`strategy: null` is reserved for recognized shorthands that do not expose a finite transform in this package, such as `all`.

`TransformableShorthandModule` is the narrower contract for modules with a real strategy:

```ts
export type TransformableShorthandModule = ShorthandModule & {
  readonly strategy: ShorthandStrategy;
};
```

`ShorthandDefinition` remains only as a compatibility alias for `TransformableShorthandModule`. New shorthand modules should use `ShorthandModule` directly.

## Expansion belongs to the shorthand module

Each shorthand owns its own `expand` function. `core.ts` does not contain a switch that knows how every shorthand expands. It builds the shared expansion context and delegates to the module:

```ts
definition.expand(value, context)
```

The shared context is intentionally runtime-neutral:

```ts
export interface ShorthandExpandContext {
  matchProperty(property: string, value: string): boolean;
  splitWhitespace(value: string): string[];
  splitSlash(value: string): string[];
}
```

`matchProperty()` delegates to CSSTree's lexer. It should be used as the grammar authority instead of handwritten keyword tables where possible.

Simple grammars should compose shared expanders from `registry/expanders.ts`:

```ts
// registry/shorthands/margin.ts
import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../module.js";

const longhands = quad("margin");

export default {
  longhands,
  strategy: "quad",
  expand: expandQuad(longhands),
} satisfies ShorthandModule;
```

Property-specific grammars keep their semantics in the property file. For example, a multi-layer or slash-based property can combine top-level splitting with CSSTree validation:

```ts
import { splitTopLevelComma } from "../expanders.js";
import type { ShorthandExpander, ShorthandModule } from "../module.js";

const longhands = ["example-a", "example-b"] as const;

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length) return null;

  // Property-specific defaulting and assignment belongs here.
  // Validate components with context.matchProperty(...).
  return {
    "example-a": layers.join(", "),
    "example-b": "initial-value",
  };
};

export default {
  longhands,
  strategy: "csstree",
  expand,
} satisfies ShorthandModule;
```

## Collapse belongs to the module when the grammar is property-specific

Generic strategies such as `quad`, `pair`, `triple`, `flex`, and `slash-pair` have shared collapse behavior in `core.ts`.

A `csstree` module should provide `collapse()` when reconstruction needs property-specific ordering, slash syntax, layer alignment, or reset checks:

```ts
export default {
  longhands,
  strategy: "csstree",
  expand,
  collapse(declarations, context) {
    const candidate = buildCandidate(declarations);
    return context.matchProperty("example", candidate)
      ? candidate
      : null;
  },
} satisfies ShorthandModule;
```

Collapse should be conservative. If the module cannot reconstruct an equivalent shorthand without guessing, return `null` and leave the longhands unchanged.

## Complex shorthand rules

For complex shorthands:

- validate the entire shorthand with CSSTree when useful;
- split only at the top level so commas/slashes inside functions are preserved;
- explicitly encode CSS initial/reset values;
- preserve layer counts across comma-separated longhands;
- keep property-specific precedence and ambiguity rules in the module;
- return `null` for grammar forms that cannot be deterministically represented;
- add round-trip tests when collapse is supported.

Examples of `csstree` modules include `background`, `mask`, `animation`, `transition`, `font`, `grid`, `border-image`, `offset`, and timeline shorthands.

System-font keywords such as `font: menu` are user-agent dependent and intentionally cannot be decomposed deterministically by a runtime-neutral library. Explicit font shorthands are supported.

## Non-transformable shorthand modules

`all.ts` still follows the common interface even though it is intentionally non-transformable:

```ts
import type { ShorthandModule } from "../module.js";

export default {
  longhands: [],
  strategy: null,
  expand: () => null,
} satisfies ShorthandModule;
```

## Generated registry

Do not manually edit:

```text
packages/css-expand-collapse/src/registry/shorthands/index.ts
```

It is generated from shorthand filenames and type-checked as:

```ts
Readonly<Record<string, ShorthandModule>>
```

A newly discovered shorthand file with the wrong export shape therefore fails TypeScript validation automatically.

The package derives these structures from the generated registry:

```text
SHORTHAND_MODULES
SHORTHAND_PROPERTIES
SHORTHAND_DEFINITIONS
SHORTHAND_SET
LONGHAND_TO_SHORTHANDS
```

There is no separate hand-maintained shorthand-property list.

## Adding a new CSS shorthand

1. Create `packages/css-expand-collapse/src/registry/shorthands/<property>.ts`.
2. Default-export an object that `satisfies ShorthandModule`.
3. Define the constituent `longhands`.
4. Choose a generic collapse `strategy`, or use `"csstree"` for property-specific grammar. Use `null` only for a recognized non-transformable shorthand.
5. Add `initialValues` when omitted constituents or `fillMissingLonghands: "initial"` require them.
6. Implement the module's runtime-neutral `expand` function. Reuse `expanders.ts` for common grammars and use CSSTree matching for grammar validation.
7. Implement `collapse()` when a generic collapse strategy cannot safely reconstruct the shorthand.
8. Regenerate the registry:

```bash
npm run generate:registry
```

9. Add expansion, collapse, and round-trip regression tests as appropriate.
10. Run validation:

```bash
npm test
npm run typecheck
npm run build
```

The registry freshness check is already included in package `test`, `typecheck`, and `build`, so CI catches a shorthand file that was added or removed without regenerating the barrel.

## Validation before publishing

Before publishing a package version, run:

```bash
npm test
npm run typecheck
npm run build:lib
npm run pack:lib
```

`npm run pack:lib` performs an npm dry run so the packaged files can be inspected before publishing.
