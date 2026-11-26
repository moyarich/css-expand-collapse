# Experimental CSS shorthands

Opt-in experimental plugin for @moyarich/css-expand-collapse. Not a guarantee of browser interoperability.

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [experimentalShorthands] });
css.expandShorthand("background-repeat", "repeat-x");
```

The initial module implements physical background-repeat axes, single and paired keywords, aliases and comma-separated layers. Logical aliases, unresolved variables and unequal layer counts are not decomposed. Axis properties are draft-defined; support varies. Overlapping background and repeat-axis declarations are preserved conservatively in map and stylesheet transformations. Native equivalence is not guaranteed. No browser detection. All other emerging shorthands remain deferred.

Selective registration: import backgroundRepeat and backgroundRepeatGrammars and supply them in a custom plugin.

Build the core package first, then run npm run build --workspace @moyarich/css-experimental-shorthands. The package is not published yet.
