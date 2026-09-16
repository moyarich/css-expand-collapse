# Developer Guide

This repository is structured so new CSS shorthand support can be added without modifying a central registry implementation.

## Shorthand module architecture

Each CSS shorthand lives in its own file under:

```text
packages/css-expand-collapse/src/registry/shorthands/
```

The **filename is the CSS property name**. For example:

```text
margin.ts          -> margin
text-decoration.ts -> text-decoration
-webkit-text-stroke.ts -> -webkit-text-stroke
```

Every shorthand module must satisfy the same `ShorthandModule` interface:

```ts
export interface ShorthandModule {
  readonly longhands: readonly string[];
  readonly strategy: ShorthandStrategy | null;
  readonly initialValues?: readonly string[];
  readonly expand: ShorthandExpander;
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

Each shorthand owns its own `expand` function. `core.ts` does not contain a switch statement that knows how every shorthand expands. It builds the shared expansion context and delegates to the module:

```ts
definition.expand(value, context)
```

The shared context provides common infrastructure:

```ts
export interface ShorthandExpandContext {
  matchProperty(property: string, value: string): boolean;
  splitWhitespace(value: string): string[];
  splitSlash(value: string): string[];
  cssom(value: string): DeclarationMap | null;
}
```

Simple grammars should compose the shared expanders in `registry/expanders.ts`. Property-specific grammars such as `flex`, `border`, and `text-decoration` should keep their parsing logic in their own module.

A typical shorthand looks like this:

```ts
// registry/shorthands/margin.ts
import { expandQuad, withCssomFallback } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../module.js";

const longhands = quad("margin");

export default {
  longhands,
  strategy: "quad",
  expand: withCssomFallback(expandQuad(longhands)),
} satisfies ShorthandModule;
```

A shorthand with custom parsing can define its own expander in the same file:

```ts
import { withCssomFallback } from "../expanders.js";
import type { ShorthandExpander, ShorthandModule } from "../module.js";

const longhands = ["example-a", "example-b"] as const;

const expandPure: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  // Property-specific parsing belongs here.
  return {
    "example-a": tokens[0]!,
    "example-b": tokens[1] ?? "initial-value",
  };
};

export default {
  longhands,
  strategy: "components",
  expand: withCssomFallback(expandPure),
} satisfies ShorthandModule;
```

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

It is generated from the shorthand filenames and is type-checked as:

```ts
Readonly<Record<string, ShorthandModule>>
```

That means a newly discovered shorthand file with the wrong export shape fails TypeScript validation automatically.

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
4. Choose the collapse `strategy`, or use `null` only for a recognized non-transformable shorthand.
5. Add `initialValues` when missing-longhand completion needs them.
6. Implement the module's `expand` function. Reuse `expanders.ts` for common grammars and keep unique parsing local to the module.
7. Regenerate the registry:

```bash
npm run generate:registry
```

8. Add expansion and collapse regression tests.
9. Run validation:

```bash
npm test
npm run typecheck
npm run build
```

The registry freshness check is already included in package `test`, `typecheck`, and `build`, so CI catches a shorthand file that was added or removed without regenerating the barrel.

## Useful development commands

```bash
npm install
npm run dev
npm run generate:registry
npm test
npm run typecheck
npm run build
npm run build:lib
npm run build:playground
npm run pack:lib
```

The playground consumes the package source directly during development, so the library does not need to be built before running the playground.
