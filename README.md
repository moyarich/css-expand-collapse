# @moyarich/css-expand-collapse

Expand CSS shorthands into longhands and safely collapse compatible longhands back into shorthands.

The package works with individual CSS properties, declaration maps, declaration fragments, full stylesheets, browser computed styles, Node.js, and Chrome extension contexts. It uses [CSSTree](https://github.com/csstree/csstree) for parsing, generation, and CSS grammar matching; shorthand transforms do not require browser CSSOM.

## Install

```bash
npm install @moyarich/css-expand-collapse
```

## Quick start

```js
import {
  expandShorthand,
  collapseToShorthand,
} from "@moyarich/css-expand-collapse";

expandShorthand("margin", "10px 20px");
// {
//   "margin-top": "10px",
//   "margin-right": "20px",
//   "margin-bottom": "10px",
//   "margin-left": "20px"
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
//   ...
// }
```

## Node.js

ES modules:

```js
import {
  expandShorthand,
  collapseCss,
} from "@moyarich/css-expand-collapse";

console.log(expandShorthand("padding", "8px 16px"));
```

CommonJS is also supported:

```js
const {
  expandShorthand,
  collapseCss,
} = require("@moyarich/css-expand-collapse");
```

All registered transformable shorthands use runtime-neutral JavaScript + CSSTree. Complex properties such as `background`, `mask`, `animation`, `transition`, `font`, and `grid` no longer require `document` or a `CSSStyleDeclaration`.

```js
import {
  supportsPureTransform,
  getShorthandStrategy,
} from "@moyarich/css-expand-collapse";

supportsPureTransform("background");
// true

getShorthandStrategy("background");
// "csstree"
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
  supportsRuntimeTransform,
} from "@moyarich/css-expand-collapse";

supportsRuntimeTransform("background");
// true

expandShorthand("transition", "opacity 200ms ease");
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

## Partial longhands

Raw stylesheet collapse is conservative by default. Missing longhands are not invented because that could override values supplied by another matching rule.

For computed/export CSS, missing constituents can explicitly use registered initial values:

```js
import { collapseCss } from "@moyarich/css-expand-collapse";

collapseCss(`
.box {
  top: 0;
  right: 0;
  bottom: 0;
}
`, {
  fillMissingLonghands: "initial",
});

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

## Computed styles

In a browser, the package can work directly with the read-only shape returned by `getComputedStyle()`:

```js
import {
  collapseComputedStyle,
  getComputedLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

const computed = getComputedStyle(element);

getComputedLonghands(computed, "margin");
collapseComputedStyle(computed, "margin");
styleToDeclarations(computed);
```

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

## Notes

System-font keywords such as `font: menu` are user-agent dependent and cannot be deterministically decomposed in a runtime-neutral way. Explicit `font` shorthand values are supported.

## API

```text
isShorthand(property)
isLonghand(property)
getLonghands(shorthand)
getShorthands(longhand)
supportsTransform(property)
supportsPureTransform(property)
supportsRuntimeTransform(property)
getShorthandStrategy(property)

expandShorthand(property, value, options?)
collapseToShorthand(shorthand, declarations, options?)
findCollapsibleShorthands(declarations, options?)
collapseLonghands(declarations, options?)

expandCss(css, options?)
collapseCss(css, options?)
transformCss(css, { mode, ...options })

expandDeclarations(css, options?)
collapseDeclarations(css, options?)

styleToDeclarations(style, properties?)
getComputedLonghands(style, shorthand)
collapseComputedStyle(style, shorthand, options?)
collapseComputedStyles(style, shorthands?, options?)
```

## Playground

https://moyarich.github.io/css-expand-collapse/

## More documentation

- [Package API and examples](./packages/css-expand-collapse/README.md)

## License

MIT
