# @moyarich/css-expand-collapse

Expand CSS shorthands into longhands and safely collapse compatible longhands back into shorthands.

[Playground](https://moyarich.github.io/css-expand-collapse/) · [Source](https://github.com/moyarich/css-expand-collapse) · [Issues](https://github.com/moyarich/css-expand-collapse/issues) · [Changelog](https://github.com/moyarich/css-expand-collapse/blob/main/CHANGELOG.md)

The package works with individual CSS properties, declaration maps, declaration fragments, full stylesheets, browser computed styles, Node.js, and Chrome extension contexts. It uses [CSSTree](https://github.com/csstree/csstree) for parsing, generation, and CSS grammar matching; shorthand transforms do not require browser CSSOM.

## Highlights

- Expand supported CSS shorthands without depending on browser CSSOM.
- Collapse compatible longhands while preserving cascade-sensitive behavior.
- Transform complete stylesheets, declaration fragments, declaration maps, or individual properties.
- Resolve known custom properties conservatively while preserving authored `var()` references.
- Use the same package from ESM, CommonJS, browsers, Node.js, and Manifest V3 extension contexts.
- Inspect and experiment with the API in the live playground.

## Install

```bash
npm install @moyarich/css-expand-collapse
```

The supported Node.js runtime is 22.22.0 or newer. The package includes TypeScript declarations for both ESM and CommonJS consumers.

## Quick start

```js
import { expandShorthand, collapseToShorthand } from "@moyarich/css-expand-collapse";

expandShorthand("margin", "10px 20px");
// {
//   property: "margin",
//   value: "10px 20px",
//   declarations: {
//     "margin-top": "10px",
//     "margin-right": "20px",
//     "margin-bottom": "10px",
//     "margin-left": "20px"
//   }
// }

collapseToShorthand("inset", {
  top: "0",
  right: "0",
  bottom: "0",
  left: "auto",
});
// {
//   property: "inset",
//   value: "0 0 0 auto",
//   declarations: {
//     top: "0",
//     right: "0",
//     bottom: "0",
//     left: "auto"
//   },
//   consumed: ["top", "right", "bottom", "left"]
// }
```

## Node.js

ES modules:

```js
import { expandShorthand, collapseCss } from "@moyarich/css-expand-collapse";

console.log(expandShorthand("padding", "8px 16px"));
```

CommonJS is also supported:

```js
const { expandShorthand, collapseCss } = require("@moyarich/css-expand-collapse");
```

All registered transformable shorthands use runtime-neutral JavaScript + CSSTree. Complex properties such as `background`, `mask`, `animation`, `transition`, `font`, and `grid` do not require `document` or a `CSSStyleDeclaration`.

```js
import { supportsTransform } from "@moyarich/css-expand-collapse";

supportsTransform("background");
// true
```

## Chrome extensions / Manifest V3

The package can be bundled into content scripts, DevTools pages, side panels, popups, and Manifest V3 background service workers. Transform APIs do not depend on the DOM.

For an element inspector, computed styles can be collected in a DOM-capable extension context and compacted directly:

```ts
import {
  collapseLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

const computedStyle = window.getComputedStyle(element);
const declarations = styleToDeclarations(computedStyle);

const compact = collapseLonghands(declarations, {
  fillMissingLonghands: "initial",
});
```

Raw declaration text such as an inline style can be expanded directly:

```ts
import { expandDeclarations } from "@moyarich/css-expand-collapse";

expandDeclarations("text-decoration: underline;");
```

A service worker can use the transform APIs on CSS strings or declaration objects without `document`:

```ts
import {
  expandShorthand,
  supportsTransform,
} from "@moyarich/css-expand-collapse";

supportsTransform("background");
// true

expandShorthand("transition", "opacity 200ms ease");
```

## Property result symmetry

`expandShorthand()` and `collapseToShorthand()` share the same core result shape:

```ts
interface ShorthandResult {
  property: string;
  value: string;
  declarations: Record<string, string>;
}
```

For both operations, `declarations` means the longhand declarations represented by the shorthand operation. Collapse adds `consumed` because it also reports which input longhands were actually consumed.

```ts
const expanded = expandShorthand("inset", "0 0 0 auto");

const collapsed = expanded
  ? collapseToShorthand("inset", expanded.declarations)
  : null;
```

## Declaration map symmetry

Declaration objects have a direct expand/collapse pair:

```ts
import {
  collapseLonghands,
  expandShorthands,
} from "@moyarich/css-expand-collapse";

const expanded = expandShorthands({
  margin: "10px 20px",
  color: "red",
});
// {
//   "margin-top": "10px",
//   "margin-right": "20px",
//   "margin-bottom": "10px",
//   "margin-left": "20px",
//   color: "red"
// }

const collapsed = collapseLonghands(expanded);
// {
//   color: "red",
//   margin: "10px 20px"
// }
```

`expandShorthands()` processes entries in declaration-object order, so later shorthand and longhand entries override earlier represented longhands.

## Custom properties

Custom-property references can participate in shorthand decisions instead of being
automatically ignored. Resolved values are used only to validate CSS grammar; the
authored `var(--name)` reference is preserved in transformed output.

```js
import { expandShorthand } from "@moyarich/css-expand-collapse";

expandShorthand("border-color", "var(--color)", {
  customProperties: {
    "--color": "red",
  },
});
// declarations:
// {
//   "border-top-color": "var(--color)",
//   "border-right-color": "var(--color)",
//   "border-bottom-color": "var(--color)",
//   "border-left-color": "var(--color)"
// }
```

Full stylesheet transforms automatically collect custom properties declared in the
current rule plus unconditional top-level `:root`, `html`, `:host`, and
`html:root` rules. Local declarations override inherited root values. Custom
property names remain case-sensitive.

```css
:root {
  --bg-color: #123456;
}

.card {
  background: var(--bg-color);
}
```

This can expand because `--bg-color` proves that `var(--bg-color)` is a valid
background color, while the resulting `background-color` still contains
`var(--bg-color)`.

The resolver is conservative. It does not guess values from arbitrary ancestor
selectors, conditional at-rules, external stylesheets, or missing variables. It also
leaves a shorthand unchanged when one variable expands to multiple components that
cannot be safely represented by each generated longhand.

### Locally scoped multi-component variables

Locally declared variables participate in the same safety checks. A multi-component
value stays attached to its shorthand when copying the same `var()` reference into
individual longhands would change or invalidate the CSS.

```css
.card {
  --space: 8px 16px;
  margin: var(--space);
}
```

The transform preserves that declaration:

```css
.card {
  --space: 8px 16px;
  margin: var(--space);
}
```

This also respects local scope over a root value:

```css
:root {
  --space: 8px;
}

.card {
  --space: 8px 16px;
  margin: var(--space);
}
```

Even though the root value could be copied safely into each margin longhand, the local
`--space` is the value that applies to `.card`, so the shorthand remains intact.

The same rule applies to compound background values:

```css
.hero {
  --surface: url(hero.png) center / cover no-repeat #111;
  background: var(--surface);
}
```

Because `--surface` represents several background components, the transformer keeps
`background: var(--surface)` rather than incorrectly producing declarations such as
`background-image: var(--surface)` or `background-color: var(--surface)`.

Collapse is conservative too. If a locally scoped multi-component variable is used
where an individual longhand requires a single component, those longhands are not
collapsed into a shorthand merely because their authored text matches.

The low-level resolver is also public:

```js
import { resolveCustomProperties } from "@moyarich/css-expand-collapse";

resolveCustomProperties("calc(var(--space) * 2)", {
  "--space": "var(--base)",
  "--base": "8px",
});
// "calc(8px * 2)"
```

## Transform CSS

Expand a stylesheet:

```js
import { expandCss } from "@moyarich/css-expand-collapse";

const css = expandCss(`
.card {
  margin: 10px 20px;
  padding: 8px 16px;
}
`);
```

Collapse compatible longhands:

```js
import { collapseCss } from "@moyarich/css-expand-collapse";

const css = collapseCss(`
.card {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}
`);
```

Result:

```css
.card {
  margin: 10px 20px;
}
```

Collapse is cascade-aware within declaration blocks. Source order, overlapping shorthands, duplicate constituents, and `!important` are considered before a replacement is emitted.

## Transformation diagnostics

Pass an optional `onDiagnostic` callback to stylesheet transforms to receive
structured reasons for unsuccessful attempts, with source locations when
available. Existing string results are unchanged. Diagnostics are best-effort,
not an exhaustive explanation of every possible collapse candidate.

```ts
expandCss(".card { all: initial; }", {
  onDiagnostic: (diagnostic) => console.log(diagnostic),
});
```

## Partial longhands

Raw stylesheet collapse is conservative by default. Missing longhands are not invented because that could override values supplied by another matching rule.

For computed/export CSS, missing constituents can explicitly use module-owned initial values:

```js
import { collapseCss } from "@moyarich/css-expand-collapse";

collapseCss(
  `
.box {
  top: 0;
  right: 0;
  bottom: 0;
}
`,
  {
    fillMissingLonghands: "initial",
  },
);

// .box{inset:0 0 0 auto}
```

Use `fillMissingLonghands: "initial"` only when omitted longhands should be treated as their CSS initial values.

## Declaration fragments

```js
import {
  expandDeclarations,
  collapseDeclarations,
} from "@moyarich/css-expand-collapse";

expandDeclarations(`margin: 10px 20px; padding: 1rem;`);

collapseDeclarations(`
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
`);
```

## Format declaration fragments

```ts
formatDeclarations("margin:0;padding:8px", { indent: "  " });
// "  margin: 0;\n  padding: 8px;"
```

Formatting preserves declaration order, duplicate declarations, priority, and
authored value tokens. Invalid fragments and fragments containing comments
between declarations are preserved unchanged. Grouping that would reorder
declarations is intentionally deferred until cascade safety can be established.

## CSS and JavaScript property names

```ts
toCamelCaseDeclarations({ "background-color": "red", "--Space": "8px" });
// { backgroundColor: "red", "--Space": "8px" }

toKebabCaseDeclarations({ WebkitTextStroke: "1px red", cssFloat: "left" });
// { "-webkit-text-stroke": "1px red", float: "left" }
```

Use `toCamelCaseProperty` and `toKebabCaseProperty` for individual names.
Custom properties are case-sensitive and remain untouched. Values are not
converted; if multiple source keys normalize to one key, the last value wins.
These helpers use CSSOM-style naming, not framework-specific style conventions.

## Style declarations

The style-declaration APIs accept any read-only `CSSStyleDeclaration`-like object, including the value returned by `getComputedStyle()`:

```js
import {
  collapseStyleDeclaration,
  getStyleLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

const computed = getComputedStyle(element);

getStyleLonghands(computed, "margin");
collapseStyleDeclaration(computed, "margin");
styleToDeclarations(computed);
```

## Background position

`background-position` supports physical x/y axes and equal-length layer lists. Logical-axis syntax and unresolved variables are preserved conservatively. Unequal axis lists are not collapsed.

## Layered CSS values

`splitCssLayers(value)` returns authored top-level layers with source offsets.
`parseCssLayers(property, value)` also returns grammar diagnostics and expanded
declarations (including defaults) when safe. It supports background, mask,
animation and transition. Unresolved variables remain authored and do not
produce expanded declarations.

```ts
parseCssLayers("background", "linear-gradient(red, blue), white");
```

## Registry metadata

```ts
getShorthandMetadata("margin");
// { property: "margin", category: "spacing", longhands: [...], transformable: true }

listShorthands({ category: "background", transformable: true });
```

Metadata is derived from the registered shorthand modules. Categories are
library browsing groups rather than CSS specification classifications.
Recognized but non-transformable shorthands are included unless filtered out.

## Property helpers

```js
import {
  isShorthand,
  isLonghand,
  getLonghands,
  getShorthands,
} from "@moyarich/css-expand-collapse";

isShorthand("margin"); // true
isLonghand("margin-top"); // true
getLonghands("margin");
// ["margin-top", "margin-right", "margin-bottom", "margin-left"]
getShorthands("margin-top");
// includes "margin"
```

## Newer shorthand coverage

`white-space` expands the legacy aliases and supported collapse/wrap keyword
combinations, including the CSS Text Level 4 trim reset. Explicit non-default
trim values are not transformed yet. Browser support for trim is incomplete.
Other candidates (line-clamp, text-spacing, background-repeat axis decomposition
and animation-trigger) remain deferred until their grammar and reset semantics
are verified.

## Notes

System-font keywords such as `font: menu` are user-agent dependent and cannot be deterministically decomposed in a runtime-neutral way. Explicit `font` shorthand values are supported.

## Validate CSS

Validation is independent of expansion and collapse. Use `validateProperty` for
one value, `validateDeclarations` for declaration fragments, and `validateCss`
for stylesheets.

```ts
import {
  validateCss,
  validateDeclarations,
  validateProperty,
} from "@moyarich/css-expand-collapse";

validateProperty("margin", "10px 20px");
// { valid: true, diagnostics: [] }

validateDeclarations("padding: red;");
// { valid: false, diagnostics: [...] }

validateCss(".card { margin: var(--space); }");
// { valid: null, diagnostics: [...] }

validateProperty("margin", "var(--space)", {
  customProperties: { "--space": "8px 16px" },
});
// { valid: true, diagnostics: [] }
```

A result of `null` means static validity is indeterminate, for example when a
variable is unresolved or grammar is unavailable. Errors take precedence over
indeterminate diagnostics. Source diagnostics include one-based lines and
columns and zero-based offsets where available. Validation uses CSSTree's
available grammar, not a browser's computed cascade; it does not infer custom
property values from selectors or check at-rule descriptor and registered
custom-property grammar. It cannot guarantee browser support.

### Handling validation results

```ts
const result = validateDeclarations("margin: 8px; padding: red;");

for (const diagnostic of result.diagnostics) {
  console.log(diagnostic.severity, diagnostic.message, diagnostic.location?.start);
}

if (result.valid === false) {
  // Report errors before applying CSS.
} else if (result.valid === null) {
  // Defer checks requiring runtime information.
}
```

Unknown property grammar produces a warning, unresolved runtime values produce
an informational diagnostic, and invalid syntax or values produce errors. A
valid result is not a browser compatibility or cascade guarantee.

## Public API

| Category          | Function                                                     | Purpose                                                                                                        |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Validation        | `validateProperty(property, value, options?)`               | Checks one CSS property value against available grammar.                                                       |
| Validation        | `validateDeclarations(css, options?)`                        | Checks declaration text and reports source-aware diagnostics.                                                  |
| Validation        | `validateCss(css, options?)`                                 | Checks stylesheet declarations without transforming them.                                                      |
| Registry          | `isShorthand(property)`                                      | Returns whether a property is a recognized CSS shorthand.                                                      |
| Registry          | `isLonghand(property)`                                       | Returns whether a property is registered as a longhand of one or more shorthands.                              |
| Registry          | `getLonghands(shorthand)`                                    | Returns the registered longhand property names for a shorthand.                                                |
| Registry          | `getShorthands(longhand)`                                    | Returns shorthands that include the supplied longhand.                                                         |
| Registry          | `supportsTransform(property)`                                | Returns whether the package implements expansion/collapse for the shorthand.                                   |
| Property          | `expandShorthand(property, value)`                           | Expands one shorthand value into a structured result containing the represented longhand declarations.         |
| Property          | `collapseToShorthand(shorthand, declarations, options?)`     | Collapses a declaration object into one requested shorthand.                                                   |
| Declaration map   | `expandShorthands(declarations)`                             | Expands every supported shorthand in a declaration object while preserving entry-order override semantics.     |
| Declaration map   | `collapseLonghands(declarations, options?)`                  | Collapses compatible longhand groups across a declaration object.                                              |
| Discovery         | `findCollapsibleShorthands(declarations, options?)`          | Finds every shorthand that can be produced from a declaration object.                                          |
| Stylesheet        | `expandCss(css)`                                             | Expands supported shorthand declarations in a stylesheet.                                                      |
| Stylesheet        | `collapseCss(css, options?)`                                 | Collapses compatible longhands in a stylesheet while preserving cascade semantics.                             |
| Stylesheet        | `transformCss(css, { mode, ...options })`                    | Runs the generic stylesheet transformer in `expand` or `collapse` mode.                                        |
| Declarations      | `expandDeclarations(css)`                                    | Expands shorthand declarations in declaration-only CSS text.                                                   |
| Declarations      | `collapseDeclarations(css, options?)`                        | Collapses longhands in declaration-only CSS text.                                                              |
| Style declaration | `styleToDeclarations(style, properties?)`                    | Converts a read-only style declaration into a plain declaration object.                                        |
| Style declaration | `getStyleLonghands(style, shorthand)`                        | Reads the registered longhands for one shorthand from a read-only style declaration.                           |
| Style declaration | `collapseStyleDeclaration(style, shorthand, options?)`       | Collapses one shorthand from a read-only style declaration.                                                    |
| Style declaration | `collapseStyleDeclarations(style, shorthands?, options?)`    | Collapses multiple shorthands from a read-only style declaration.                                              |
| Utility           | `resolveCustomProperties(value, customProperties, options?)` | Resolves nested `var()` references against a known case-sensitive custom-property map.                         |
| Utility           | `collectCustomProperties(declarations)`                      | Collects custom-property declarations without lowercasing their names.                                         |
| Utility           | `mergeCustomProperties(...maps)`                             | Merges known custom-property maps while preserving CSS custom-property name casing.                            |
| Utility           | `isCustomProperty(property)`                                 | Returns whether a property name is a CSS custom property.                                                      |
| Utility           | `hasCustomPropertyReference(value)`                          | Returns whether a CSS value contains a real `var()` reference outside strings/comments.                        |
| Utility           | `splitTopLevelWhitespace(value)`                             | Splits a CSS value on top-level whitespace while preserving strings, functions, brackets, commas, and slashes. |

The package also exports `SHORTHAND_PROPERTIES` and public TypeScript types such as `DeclarationMap`, `LonghandMap`, `ShorthandResult`, `ExpandShorthandResult`, `CollapseShorthandResult`, `TransformOptions`, `TransformCssOptions`, `TransformMode`, `ReadonlyStyleDeclaration`, `CustomPropertyMap`, `ResolveCustomPropertiesOptions`, `ValidationOptions`, `ValidationResult`, `ValidationDiagnostic`, `ValidationDiagnosticCode`, `ValidationLocation`, and `ValidationPosition`.

## Playground

Try the package interactively in the [playground](https://moyarich.github.io/css-expand-collapse/). Browse searchable API and developer documentation, experiment with CSS conversions, and run API examples using resizable editor and output panes.

## Benchmarks

Run the opt-in transformation benchmarks with
`npm run bench --workspace @moyarich/css-expand-collapse`.
See the library's `bench/README.md` for workloads and comparison methodology.

## Package development

From the repository root:

```bash
npm ci
npm run typecheck
npm test
npm run build:lib
npm run release:check
```

`npm run release:check` runs release validation and verifies a real temporary npm archive without publishing. Run `npm run pack:verify` separately to inspect the library archive, export targets, required documentation and absence of build source maps. The verifier requires the system `tar` command and reports archive size. Consumer installation checks remain separate.

### Workspace release CLI

The repository exposes `workspace-release` through the root package `bin` field. With `fzf` installed, running it without arguments opens the interactive release flow:

```bash
workspace-release
```

Choose the workspace, choose a calculated SemVer change, review the release plan, and confirm.

You can also select the package first:

```bash
workspace-release css-expand-collapse
```

For a deterministic release, provide the version directly:

```bash
workspace-release css-expand-collapse=patch
workspace-release css-expand-collapse=minor
workspace-release css-expand-collapse=1.0.0
```

Preview a release without modifying files, committing, or tagging:

```bash
workspace-release css-expand-collapse=minor --dry-run
```

Browse the calculated SemVer choices without changing anything:

```bash
workspace-release css-expand-collapse --explain
```

The same arguments can be passed through npm:

```bash
npm run release -- css-expand-collapse=minor --dry-run
```

## License

MIT

## Declaration grouping

`formatDeclarations(css, { groupBy: "family" })` adds a separator between adjacent property families. Use `groupBy: "side"` to group adjacent physical directional properties. Both modes preserve declaration order, duplicate declarations and priorities; they never sort declarations across groups.

```ts
formatDeclarations("margin:0; padding:1px; margin-top:2px", {
  groupBy: "family",
});
```

## Transformation diagnostics

The optional `onDiagnostic` callback is available on property, declaration-map
and CSS text transformation APIs. Failed expansion attempts distinguish
unsupported shorthands, invalid grammar, unresolved runtime values, unknown
grammar and otherwise unsafe transformations. CSS text diagnostics can include
source coordinates (relative to the supplied stylesheet or declaration fragment); object inputs do not have source coordinates. Collapse
diagnostics describe rejected candidates and are not an exhaustive cascade trace. Stylesheet collapse diagnostics include an optional structured `reason` for missing longhands, duplicate longhands, mixed priority, overlapping shorthands or incompatible values.

```ts
expandShorthand("margin", "var(--missing)", {
  onDiagnostic: (diagnostic) => console.log(diagnostic),
});
```

## CSS transformation source maps

Use the opt-in API to trace generated CSS to the original stylesheet:

```ts
import { transformCssWithSourceMap } from "@moyarich/css-expand-collapse";

const { css, map } = transformCssWithSourceMap(".card { margin: 10px 20px; }", {
  mode: "expand",
  filename: "styles.css",
  outputFilename: "styles.expanded.css",
});
```

The returned map is a JSON-serializable Source Map v3 object with original CSS
embedded. Generated longhands map to the shorthand's starting position.
A collapsed shorthand maps to the first consumed longhand; it does not encode
all contributing declarations. Unchanged nodes retain their original positions.
Existing string APIs are unchanged. No source-map comment is appended
automatically. See the declaration provenance and fragment examples below.

### Declaration provenance

Pass `includeProvenance: true` to obtain an optional `provenance` array alongside the standard map. Each entry identifies the generated declaration by its zero-based traversal index and property and lists original contributing declaration names and source ranges. A collapsed shorthand lists all consumed longhands, not earlier shadowed declarations or synthetic initial values. Expanded longhands share their original shorthand range. Unchanged declarations list themselves. The standard map continues to use the first consumed declaration for collapse.

```ts
const { css, map, provenance } = transformCssWithSourceMap(source, {
  mode: "collapse",
  includeProvenance: true,
});
```

### Declaration fragment maps

Use `transformDeclarationsWithSourceMap` for declaration-only CSS (such as an inline style), rather than wrapping the input in a stylesheet. The returned CSS, map, diagnostic locations and optional provenance use fragment-relative coordinates, without a synthetic selector. This API expects declaration lists, not nested style rules.

```ts
import { transformDeclarationsWithSourceMap } from "@moyarich/css-expand-collapse";

const { css, map, provenance } = transformDeclarationsWithSourceMap("margin: 1px 2px", {
  mode: "expand",
  filename: "inline.css",
  includeProvenance: true,
});
```

### Compose an upstream source map

Pass a flat, JSON-compatible Source Map v3 object as `inputSourceMap` when the supplied CSS was generated by an earlier tool. The returned map traces through that intermediate CSS to its original source files, preserving available source content and unmapped segments.

```ts
const expanded = transformCssWithSourceMap(source, {
  mode: "expand", filename: "original.css", outputFilename: "expanded.css",
});
const collapsed = transformCssWithSourceMap(expanded.css, {
  mode: "collapse", inputSourceMap: expanded.map, outputFilename: "final.css",
});
```

The same option works with declaration fragments. The upstream map must describe the exact input text. Only flat encoded v3 maps are accepted; indexed sections are not supported. Diagnostics and optional provenance remain relative to the immediate input CSS, because an upstream map does not necessarily encode complete original declaration ranges. JavaScript build maps remain disabled.

Transformation diagnostics include parser positions when CSSTree provides them. Map collapse identifies invalid or unresolved constituent values using the standalone validator; missing required constituents use `reason: "missing-longhands"`. Diagnostics describe attempted candidates, not an exhaustive browser cascade trace.

## Emerging shorthand support

| Property | Transformation status | Reason |
| --- | --- | --- |
| `white-space` | Supported subset | CSS Text 4 reset semantics; nondefault trim syntax is preserved unchanged. |
| `line-clamp`, `-webkit-line-clamp` | Recognized, not transformed | Overflow 4 constituent support and legacy display/orientation behavior differ. |
| `text-spacing` | Recognized, not transformed | Text 4 shorthand and constituent grammar are evolving; cross-browser equivalence not verified. |
| `background-repeat` | Recognized, not transformed | Backgrounds 4 defines physical axis longhands, but emitting them without verified support is unsafe. |
| `timeline-trigger` | Recognized, not transformed | Emerging animation trigger shorthand; constituent support not verified. |
| `animation-trigger` | Deferred | Current animation-trigger syntax is not treated as a shorthand; do not invent constituent properties. |

Recognized-only entries return false from `supportsTransform` and preserve authored declarations. They intentionally expose no transformable longhands. See [CSS Text 4](https://www.w3.org/TR/css-text-4/), [CSS Overflow 4](https://drafts.csswg.org/css-overflow-4/), [CSS Backgrounds 4](https://drafts.csswg.org/css-backgrounds-4/), and [animation trigger guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animation_triggers).
