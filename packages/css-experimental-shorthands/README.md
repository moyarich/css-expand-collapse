# @moyarich/css-experimental-shorthands

Optional plugins for [@moyarich/css-expand-collapse](https://github.com/moyarich/css-expand-collapse). Choose experimental CSS transformations without changing the default transformer or other instances.

**Use the core alone for ordinary website CSS.** Experimental output may differ from native browser behavior.

## Install

```sh
npm install @moyarich/css-expand-collapse @moyarich/css-experimental-shorthands
```

Requires a compatible core release exposing transformer plugins and `getShorthandModule()`. The companion is not published yet; the install command applies once published.

## Choose a plugin

| Plugin | What it does | How to enable |
| --- | --- | --- |
| `backgroundRepeatPlugin` | Expands physical repeat axes and collapses compatible axis values | Aggregate or selective registration |
| `animationTriggerPlugin` | Enables the draft-defined animation-trigger reset | Explicit runtime override |

## Quick start

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [experimentalShorthands] });
css.expandShorthand("background-repeat", "repeat-x");
// declarations: { "background-repeat-x": "repeat", "background-repeat-y": "no-repeat" }
```

The aggregate plugin enables physical background-repeat axes, single and paired keywords, aliases and comma-separated layers. Logical aliases, unresolved variables and unequal layer counts are not decomposed. Axis properties are draft-defined; support varies. Overlapping background and repeat-axis declarations are preserved conservatively in map and stylesheet transformations. Native equivalence is not guaranteed. No browser detection. Other emerging shorthands remain deferred except for the separately opt-in animation-trigger reset below.

## Selective registration

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
css.listPlugins();
css.removePlugin(backgroundRepeatPlugin.name);
```

The named plugin registers only the physical repeat module and its grammar predicates. The lower-level `backgroundRepeat` and `backgroundRepeatGrammars` exports remain available for custom plugins.

## Animation-trigger reset

The draft defines `animation-trigger` as a reset-only constituent of `animation` with initial value `none`. See [CSS Animation Triggers](https://drafts.csswg.org/animation-triggers-1/#propdef-animation-trigger).

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer();
css.addPlugin(animationTriggerPlugin, { override: true });
css.expandShorthand("animation", "1s fade");
css.removePlugin(animationTriggerPlugin.name);
```

The plugin reuses core animation handlers, adds the reset to ordinary and CSS-wide expansion, and refuses ordinary collapse with a noninitial trigger. It is deliberately not part of the default aggregate plugin: overriding an already active shorthand requires explicit authorization. Tested Chromium behavior can differ from the draft; the plugin may change computed styles there. It does not perform runtime browser detection or claim native equivalence. The core remains unchanged when the plugin is absent.

### Processing CSS from a website

```ts
const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
const compatible = createCssTransformer();
const draft = createCssTransformer();
draft.addPlugin(animationTriggerPlugin, { override: true });

const preserved = compatible.expandCss(source);
const reset = draft.expandCss(source);
```

For the earlier-trigger scenario, the default expansion keeps the authored trigger and does not emit a reset. The draft expansion emits `animation-trigger: none` instead. A later explicit trigger overrides the draft reset. Parsing or inspecting a stylesheet without rewriting it does not change its behavior.

| Scenario | Default | Draft plugin |
| --- | --- | --- |
| Trigger before animation | Preserve authored trigger | Reset to none |
| Trigger after animation | Preserve later trigger | Preserve later trigger |
| CSS-wide animation keyword | Exclude trigger from expansion | Apply keyword to trigger |
| Noninitial trigger during collapse | Do not consume trigger | Refuse incompatible collapse |

These are transformation policies, not a promise of identical native behavior. Browser specs compare authored CSS to transformed CSS and report the observed trigger reset; unsupported syntax is skipped. Use the default for website CSS unless deliberately targeting the draft behavior.

## Candidate compatibility audit

The core recognizes all eight candidates but intentionally does not enable their transformations by default. Specification-defined constituents are not proof of native interoperability.

| Candidate | Draft-defined constituents | Initial values | Policy and limitation |
| --- | --- | --- | --- |
| background-repeat | background-repeat-x, background-repeat-y | repeat, repeat | Physical-axis plugin available; logical aliases and overlapping declarations are preserved. Native axis support varies. |
| line-clamp | max-lines, block-ellipsis, continue | auto, no-ellipsis, normal | Deferred: independently exposed longhands and fragmentation equivalence not established. |
| -webkit-line-clamp | max-lines, block-ellipsis, continue | auto, no-ellipsis, normal | Deferred: legacy box display/orientation constraints require separate layout verification. |
| text-spacing | text-spacing-trim, text-autospace | normal, normal | Deferred: shorthand/longhand grammar and native support differ; text-autospace-size is independent. |
| timeline-trigger | timeline-trigger-name, timeline-trigger-source, activation and active range endpoints | none, auto, normal/normal, auto/auto | Deferred: nested range grammar and native support require verification. |
| timeline-trigger-activation-range | timeline-trigger-activation-range-start, timeline-trigger-activation-range-end | normal, normal | Deferred: named ranges and omitted endpoint resolution. |
| timeline-trigger-active-range | timeline-trigger-active-range-start, timeline-trigger-active-range-end | auto, auto | Deferred: contextual active range resolution. |
| event-trigger | event-trigger-name, event-trigger-source | none, none | Deferred: event-function lists, enter/exit syntax and native support. |

Specification references: [CSS Backgrounds 4](https://drafts.csswg.org/css-backgrounds-4/#background-repeat), [CSS Overflow 4](https://drafts.csswg.org/css-overflow-4/#line-clamp), [CSS Text 4](https://drafts.csswg.org/css-text-4/#text-spacing), [CSS Animation Triggers 1](https://drafts.csswg.org/animation-triggers-1/). Drafts reviewed November 2026.

Grammar validation does not guarantee native browser support or equivalent computed styles. The animation-trigger plugin targets the draft reset rather than observed Chromium behavior. No runtime browser detection is used.

## Build your own plugin

You can create independent plugins using the core package's public types and factories; importing this companion is not required.

Define a plugin in your application or publish it as a separate package.

### 1. Define a shorthand and its grammar

This example creates an application-specific `example-gap` alias for the standard `row-gap` and `column-gap` properties. One value applies to both axes; two values specify the row and column separately. The alias is illustrative, not native CSS: expand it before sending CSS to a browser.

```ts
import {
  createCssTransformer,
  expandPair,
  collapsePair,
  matchProperty,
  splitTopLevelWhitespace,
  type CssTransformerPlugin,
  type ShorthandModule,
} from "@moyarich/css-expand-collapse";

const longhands = new Map([
  ["row-gap", "normal"],
  ["column-gap", "normal"],
]);

const exampleGap: ShorthandModule = {
  longhands,
  expand: expandPair(longhands),
  collapse: collapsePair(longhands),
};

export const exampleGapPlugin: CssTransformerPlugin = {
  name: "example-gap-plugin",
  shorthands: { "example-gap": exampleGap },
  grammars: {
    "example-gap": (value) => {
      const tokens = splitTopLevelWhitespace(value);
      return (
        tokens.length >= 1 &&
        tokens.length <= 2 &&
        matchProperty("row-gap", tokens[0]!) &&
        matchProperty("column-gap", tokens[1] ?? tokens[0]!)
      );
    },
  },
};

const css = createCssTransformer({ plugins: [exampleGapPlugin] });

css.expandShorthand("example-gap", "8px 16px")?.declarations;
// { "row-gap": "8px", "column-gap": "16px" }

css.collapseToShorthand("example-gap", {
  "row-gap": "8px",
  "column-gap": "16px",
})?.value;
// "8px 16px"

css.validateProperty("example-gap", "red").valid;
// false
```

The `longhands` map defines constituent order and initial values. The public pair factories handle one- and two-value transformations. The grammar predicate validates the application-specific shorthand, while the expansion helper validates its constituents using the owning transformer's context.

### 2. Write custom transformation handlers when needed

Instead of factories, a module can provide its own functions. For example, replace the two handler fields in the module above with these:

```ts
const customGap: ShorthandModule = {
  longhands,
  expand(value, context) {
    const tokens = context.splitWhitespace(value);
    if (tokens.length < 1 || tokens.length > 2) return null;
    const row = tokens[0]!;
    const column = tokens[1] ?? row;
    if (
      !context.matchProperty("row-gap", row) ||
      !context.matchProperty("column-gap", column)
    ) return null;
    return { "row-gap": row, "column-gap": column };
  },
  collapse(values, context) {
    const row = values["row-gap"];
    const column = values["column-gap"];
    if (!row || !column) return null;
    const candidate = row === column ? row : row + " " + column;
    return context.matchProperty("example-gap", candidate) ? candidate : null;
  },
};
```

Expansion returns a declaration object or `null`; collapse returns a shorthand value or `null`. Return `null` when a safe rewrite cannot be determined. Use the supplied context so validation respects the instance's configured grammar. An omitted handler means that direction is unavailable.

### 3. Install, inspect and remove

```ts
const css = createCssTransformer();

css.addPlugin(exampleGapPlugin);
css.hasPlugin(exampleGapPlugin.name); // true
css.listPlugins();
css.removePlugin(exampleGapPlugin.name);
css.hasPlugin(exampleGapPlugin.name); // false
```

Other transformers are unaffected. To distribute the plugin, export its typed plugin object from your own package and declare the compatible core package as a peer dependency. Consumers install your package and pass the exported plugin to their transformer.

Replacing a recognized-only definition requires declaring it in `replaceRecognized`; replacing an active built-in requires `css.addPlugin(plugin, { override: true })`. Named dependencies can be declared with `requires` and must be installed first. Test valid and invalid values, both directions, CSS-wide values, removal and isolation. For real CSS properties, verify computed-style equivalence before claiming browser compatibility.



### Reuse an experimental module

The companion exposes its modules separately so you can build your own named plugin without copying their implementation:

```ts
import { createCssTransformer, type CssTransformerPlugin } from "@moyarich/css-expand-collapse";
import { backgroundRepeat, backgroundRepeatGrammars } from "@moyarich/css-experimental-shorthands";

const repeatPlugin: CssTransformerPlugin = {
  name: "my-repeat-plugin",
  shorthands: { "background-repeat": backgroundRepeat },
  grammars: backgroundRepeatGrammars,
  replaceRecognized: ["background-repeat"],
};

const css = createCssTransformer({ plugins: [repeatPlugin] });
css.expandShorthand("background-repeat", "repeat-x");
```

This retains the experimental module's limitations. Install either this custom plugin or the supplied background-repeat plugin, not both.

## Resources

[Core documentation](https://github.com/moyarich/css-expand-collapse#readme) · [Changelog](https://github.com/moyarich/css-expand-collapse/blob/main/packages/css-experimental-shorthands/CHANGELOG.md) · [Custom plugin guide](https://github.com/moyarich/css-expand-collapse/blob/main/docs/08-plugin-authoring/page.mdx) · [Report an issue](https://github.com/moyarich/css-expand-collapse/issues)

## License

MIT
