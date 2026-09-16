# Shorthand registry

Each CSS shorthand is defined in its own module under `shorthands/`. The module owns the property name, constituent longhands, strategy, and any initial values needed by the transform engine.

Example:

```ts
import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("margin", {
  longhands: quad("margin"),
  strategy: "quad",
});

export default shorthand;
```

To add a new CSS shorthand:

1. Add `shorthands/<property>.ts` and export one `defineShorthand(...)` registration.
2. Reuse an existing strategy/helper when the grammar matches, or add a focused strategy to `core.ts` when it does not.
3. Run `npm run generate:registry --workspace @moyarich/css-expand-collapse` from the repository root.
4. Add expansion/collapse tests for the property.

`shorthands/index.ts` is generated from the directory and must not be edited manually. `SHORTHAND_PROPERTIES`, `SHORTHAND_DEFINITIONS`, `SHORTHAND_SET`, and `LONGHAND_TO_SHORTHANDS` are all derived from the registered modules, so there is no second property list to keep synchronized.

`all` is intentionally registered with `definition: null`: it is a recognized shorthand name but does not have a finite constituent-longhand set that this package can enumerate safely.
