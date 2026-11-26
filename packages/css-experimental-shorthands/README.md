# Experimental CSS shorthands

Opt-in experimental plugin for @moyarich/css-expand-collapse. Not a guarantee of browser interoperability.

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [experimentalShorthands] });
css.expandShorthand("background-repeat", "repeat-x");
```

The initial module implements physical background-repeat axes, single and paired keywords, aliases and comma-separated layers. Logical aliases, unresolved variables and unequal layer counts are not decomposed. Axis properties are draft-defined; support varies. Overlapping background and repeat-axis declarations are preserved conservatively in map and stylesheet transformations. Native equivalence is not guaranteed. No browser detection. Other emerging shorthands remain deferred except for the separately opt-in animation-trigger reset below.

## Selective registration

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "@moyarich/css-experimental-shorthands";

const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
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

## Development

From the repository root, build the workspaces before checking the public package entry points:

```sh
npm run build
npm run typecheck --workspace @moyarich/css-experimental-shorthands
npm test --workspace @moyarich/css-experimental-shorthands
```

The companion package uses the core public API as a peer dependency. Its public exports test imports the built package by name, not a private source path. The package is not published yet.

## Release

Use the existing workspace release tooling. Publish a compatible core version before publishing the companion package.

```sh
npm run pack:verify -- css-experimental-shorthands
PACKAGE_DIRECTORY=packages/css-experimental-shorthands npm run release:check
npm run release -- css-experimental-shorthands=patch --dry-run
```

The package archive includes the public distribution files, README, license and changelog. The release validator builds local peer dependencies before checking the selected package. Actual publication requires the configured registry credentials and an explicit publish command.
