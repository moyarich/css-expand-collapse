# Changelog

## 0.1.0 (unreleased)

Initial release of the optional `@moyarich/css-experimental-shorthands` companion package. Installing it alone does not change the core transformer's behavior.

### Expand and collapse background-repeat

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [experimentalShorthands] });
css.expandShorthand("background-repeat", "repeat-x");
// declarations: { "background-repeat-x": "repeat", "background-repeat-y": "no-repeat" }
```

Supports physical X/Y repeat axes, aliases, paired keywords and multiple layers. Unsupported logical aliases and unequal layer counts are preserved rather than rewritten. The named `backgroundRepeatPlugin` is also available for selective registration.

### Choose the draft animation-trigger reset

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

const source = ".target{animation-trigger:--reveal play;animation:1s ease fade}";
const compatible = createCssTransformer();
const experimental = createCssTransformer();

experimental.addPlugin(animationTriggerPlugin, { override: true });

const preserved = compatible.expandCss(source);
const reset = experimental.expandCss(source);
```

The default transformer preserves the earlier trigger; the experimental transformer emits `animation-trigger: none`. A later explicit trigger remains effective in both cases. Removing the plugin restores the default behavior.

### Compatibility

Experimental output may differ from native browser behavior. The animation reset plugin requires separate explicit authorization and is not included in the aggregate plugin. Other recognized-only shorthands remain deferred. The package provides typed ESM, CommonJS and browser entry points and uses the core package as a peer dependency.
