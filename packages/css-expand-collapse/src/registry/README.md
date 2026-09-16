# Shorthand registry

Each CSS shorthand is defined in its own module under `shorthands/`. The **filename is the CSS property name**, and that module owns the property's longhands, collapse strategy metadata, initial values, and `expand` implementation.

A simple shorthand composes a shared parser primitive but still chooses and exports its own expander:

```ts
// shorthands/margin.ts
import { expandQuad, withCssomFallback } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = quad("margin");
const expand = withCssomFallback(expandQuad(longhands));

export default { longhands, strategy: "quad", expand } satisfies ShorthandDefinition;
```

Shorthands with unique grammars such as `flex`, `border`, and `text-decoration` implement their parsing logic directly in their property module. `core.ts` does not switch on shorthand strategies for expansion; it only creates the shared expansion context and calls `definition.expand(...)`.

To add a new CSS shorthand:

1. Add `shorthands/<property>.ts`.
2. Declare its longhands and its `expand` function. Reuse primitives from `expanders.ts` when the grammar matches, or implement the grammar locally when it is property-specific.
3. Keep `strategy` only for collapse behavior/metadata.
4. Run `npm run generate:registry`.
5. Add expansion and collapse tests for the property.

`shorthands/index.ts` is generated from filenames and must not be edited manually. `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are derived from that generated map.

`all.ts` intentionally exports `null`: `all` is a recognized shorthand name but does not have a finite constituent-longhand set that this package can enumerate safely.
