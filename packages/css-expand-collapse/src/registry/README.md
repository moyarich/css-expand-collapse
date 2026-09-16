# Shorthand registry

Each CSS shorthand lives in its own module under `shorthands/`. The **filename is the CSS property name**, and every default export must satisfy the same `ShorthandModule` contract.

```ts
export interface ShorthandModule {
  readonly longhands: readonly string[];
  readonly strategy: ShorthandStrategy | null;
  readonly initialValues?: readonly string[];
  readonly expand: ShorthandExpander;
  readonly collapse?: ShorthandCollapser;
}
```

The generated registry is typed as `Record<string, ShorthandModule>`, so adding a file that does not satisfy the contract fails typecheck automatically.

## Simple shorthand

A simple grammar can compose a shared runtime-neutral expander:

```ts
// shorthands/margin.ts
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

## Property-specific shorthand

Complex grammars use `strategy: "csstree"` and keep their parsing/defaulting rules in the property module. CSSTree's lexer is available through `context.matchProperty(...)` for CSS grammar validation.

```ts
const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("example", value)) return null;

  // Parse the shorthand's own component/layer/slash semantics here.
  return {
    "example-a": "...",
    "example-b": "...",
  };
};

export default {
  longhands,
  strategy: "csstree",
  expand,
  collapse(declarations, context) {
    const candidate = buildCandidate(declarations);
    return context.matchProperty("example", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
```

The transform path must not depend on `document` or `CSSStyleDeclaration`. The same module should work in Node.js, Chrome extension service workers, content scripts, browser pages, workers, and CLI processes.

`core.ts` does not switch on property names for expansion. It creates the shared CSSTree-backed context and calls the module's `expand(...)` function. Generic collapse strategies are centralized; complex modules own `collapse(...)` when reconstruction is property-specific.

## Adding a shorthand

1. Add `shorthands/<property>.ts`.
2. Default-export an object satisfying `ShorthandModule`.
3. Declare its longhands, strategy, optional initial values, and runtime-neutral `expand` implementation.
4. Reuse primitives from `expanders.ts` when the grammar matches; otherwise keep property-specific parsing in the module and use CSSTree matching for validation.
5. Add `collapse()` when the generic strategy cannot safely reconstruct the shorthand. Return `null` rather than guessing.
6. Run `npm run generate:registry`.
7. Add expansion/collapse/round-trip tests for the property.

`shorthands/index.ts` is generated from filenames and must not be edited manually. `SHORTHAND_MODULES`, `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are derived from that generated map.

`all.ts` also satisfies `ShorthandModule`; it uses `strategy: null`, an empty longhand list, and an expander that returns `null` because `all` does not expose a finite longhand set that this package can enumerate safely.

`ShorthandDefinition` remains only as a compatibility alias for `TransformableShorthandModule`. New shorthand modules should use `ShorthandModule` directly.
