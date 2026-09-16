# @moyarich/css-expand-collapse

Expand CSS shorthands into longhands and safely collapse compatible longhands back into shorthands.

The package works with individual CSS properties, declaration maps, declaration fragments, full stylesheets, browser computed styles, and Chrome extension contexts. It uses [CSSTree](https://github.com/csstree/csstree) for parsing, generation, and CSS grammar matching.

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

Pure-JavaScript shorthand implementations work directly in Node. Shorthands whose strategy is `cssom` require browser CSSOM for fallback parsing.

You can inspect support before transforming:

```js
import {
  supportsTransform,
  supportsPureTransform,
  getShorthandStrategy,
} from "@moyarich/css-expand-collapse";

supportsTransform("background");
// true

supportsPureTransform("margin");
// true

getShorthandStrategy("background");
// "cssom"
```

## Chrome extensions / Manifest V3

The package can be bundled into Chrome extension content scripts, DevTools pages, side panels, popups, and other DOM-capable extension pages. It exposes a browser ESM entry so bundlers such as Vite can consume it normally:

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

This matches the computed-style export workflow used by inspector extensions such as `element-inspector`: collect the selected element's `CSSStyleDeclaration`, convert it to declarations, then compact compatible longhands before serializing the CSS.

Manifest V3 background service workers do not have `document`, so CSSOM-only shorthand strategies are unavailable there unless a mutable `CSSStyleDeclaration` is explicitly supplied. Use the runtime helpers when code may run in either a DOM page or a service worker:

```ts
import {
  hasCssomSupport,
  supportsRuntimeTransform,
} from "@moyarich/css-expand-collapse";

hasCssomSupport();
// true in content scripts / DevTools pages, false in a service worker

supportsRuntimeTransform("margin");
// true everywhere because margin has a pure-JS strategy

supportsRuntimeTransform("background");
// true in DOM-capable extension pages, false in a service worker
```

If a DOM-less context already has access to a mutable style declaration, it can be supplied explicitly:

```ts
supportsRuntimeTransform("background", { style: scratchStyle });
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

In the browser, the package can work directly with the read-only shape returned by `getComputedStyle()`:

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

This is useful for inspectors, visual CSS editors, and exported computed CSS.

## Property helpers

```js
import {
  isShorthand,
  isLonghand,
  getLonghands,
  getShorthands,
} from "@moyarich/css-expand-collapse";

isShorthand("margin");
// true

isLonghand("margin-top");
// true

getLonghands("margin");
// ["margin-top", "margin-right", "margin-bottom", "margin-left"]

getShorthands("margin-top");
// includes "margin"
```

## API

```text
isShorthand(property)
isLonghand(property)
getLonghands(shorthand)
getShorthands(longhand)
supportsTransform(property)
supportsPureTransform(property)
supportsRuntimeTransform(property, options?)
hasCssomSupport(options?)
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

Try the package in the live playground:

https://moyarich.github.io/css-expand-collapse/

## More documentation

- [Package API and examples](./packages/css-expand-collapse/README.md)

## License

MIT
