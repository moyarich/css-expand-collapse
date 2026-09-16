# Shorthand registry

Each CSS shorthand is defined in its own module under `shorthands/`. The **filename is the CSS property name**, and the module exports only that property's transform definition.

Example:

```ts
// shorthands/margin.ts
import { quad } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: quad("margin"),
  strategy: "quad",
} satisfies ShorthandDefinition;
```

To add a new CSS shorthand:

1. Add `shorthands/<property>.ts` and default-export its `ShorthandDefinition`.
2. Reuse an existing strategy/helper when the grammar matches, or add a focused strategy to `core.ts` when it does not.
3. Run `npm run generate:registry`.
4. Add expansion/collapse tests for the property.

`shorthands/index.ts` is generated from filenames and must not be edited manually. `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are derived from that generated map, so the property name is not duplicated inside each module.

`all.ts` intentionally exports `null`: `all` is a recognized shorthand name but does not have a finite constituent-longhand set that this package can enumerate safely.
