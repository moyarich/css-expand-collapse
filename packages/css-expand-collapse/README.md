# css-expand-collapse

Bidirectional CSS shorthand/longhand utilities for property values, declaration objects, full stylesheets, browser computed styles, Node.js, and extension runtimes.

Built on [CSSTree](https://github.com/csstree/csstree) for CSS parsing, generation, and grammar matching. Shorthand transforms are runtime-neutral and do not require browser CSSOM.

## Install

```bash
npm install @moyarich/css-expand-collapse
```

## Goals

- Recognize CSS shorthand properties.
- Expand shorthand declarations into longhands.
- Collapse compatible longhands back into a shorthand.
- Accept real CSS, not only property/value objects.
- Work directly with the `CSSStyleDeclaration` returned by `getComputedStyle()` when one is available.
- Preserve CSS cascade semantics when transforming stylesheets.
- Work in Node.js, browser pages, Chrome extension service workers, content scripts, and extension pages.
- Use CSSTree grammar matching for complex shorthand syntax rather than depending on browser CSSOM.

## Property API

```ts
import {
  isShorthand,
  isLonghand,
  getLonghands,
  getShorthands,
  expandShorthand,
  collapseToShorthand,
} from "@moyarich/css-expand-collapse";

isShorthand("margin"); // true
isLonghand("margin-top"); // true

getLonghands("margin");
// ["margin-top", "margin-right", "margin-bottom", "margin-left"]

getShorthands("margin-top");
// includes "margin"
```

### Expand

```ts
expandShorthand("margin", "10px 20px");
```

```ts
{
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px"
}
```

Complex component order is handled using CSS grammar matching:

```ts
expandShorthand("text-decoration", "wavy underline purple 25%");
```

```ts
{
  "text-decoration-line": "underline",
  "text-decoration-style": "wavy",
  "text-decoration-color": "purple",
  "text-decoration-thickness": "25%"
}
```

Complex and multi-layer shorthands work without a DOM:

```ts
expandShorthand(
  "background",
  "url(a.png) center / cover no-repeat, red",
);

expandShorthand(
  "transition",
  "opacity 200ms ease 50ms",
);
```

### Collapse

Object-level collapse APIs use module-owned CSS initial values for omitted longhands when those values are registered by the shorthand module.

```ts
collapseToShorthand("margin", {
  "margin-right": "24px",
  "margin-bottom": "12px",
  "margin-left": "67px",
});
```

```ts
{
  property: "margin",
  value: "0 24px 12px 67px",
  consumed: [
    "margin-right",
    "margin-bottom",
    "margin-left"
  ],
  declarations: {
    "margin-top": "0",
    "margin-right": "24px",
    "margin-bottom": "12px",
    "margin-left": "67px"
  }
}
```

Pass `{ fillMissingLonghands: false }` when a complete declaration map is required.

To collapse every safe group in a plain object:

```ts
import { collapseLonghands } from "@moyarich/css-expand-collapse";

collapseLonghands({
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "red",
});

// { color: "red", margin: "10px 20px" }
```

### Partial longhands with initial values

Raw stylesheet collapse is conservative by default. Missing longhands are not invented because doing so could override values supplied by another matching rule.

For object-level APIs such as `collapseToShorthand()`, registered initial values are used by default. For example, this fills the omitted `left` value with the CSS initial value `auto`:

```ts
collapseToShorthand("inset", {
  top: "0",
  right: "0",
  bottom: "0",
});
```

Returns:

```ts
{
  property: "inset",
  value: "0 0 0 auto",
  consumed: ["top", "right", "bottom"],
  declarations: {
    top: "0",
    right: "0",
    bottom: "0",
    left: "auto"
  }
}
```

For stylesheet/declaration-text transforms, opt in explicitly when omitted longhands should use their registered initial values:

```ts
collapseCss(css, { fillMissingLonghands: "initial" });
collapseDeclarations(css, { fillMissingLonghands: "initial" });
```

## Real CSS

### Expand a stylesheet

```ts
import { expandCss } from "@moyarich/css-expand-collapse";

expandCss(`
  @media (min-width: 40rem) {
    .example {
      margin: 10px 20px;
      text-decoration: wavy underline purple 25%;
    }
  }
`);
```

### Collapse a stylesheet

```ts
import { collapseCss } from "@moyarich/css-expand-collapse";

collapseCss(`
  .example {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
  }
`);
```

Produces:

```css
.example {
  margin: 10px 20px;
}
```

The generated formatting is controlled by CSSTree, so whitespace may be normalized. The collapse pass is cascade-aware: source order, overlapping shorthands, duplicate constituents, and `!important` are considered before a replacement is emitted.

### Declaration fragments

Declaration-only input is supported directly, which is useful for inline styles and element inspectors:

```ts
import {
  expandDeclarations,
  collapseDeclarations,
} from "@moyarich/css-expand-collapse";

expandDeclarations("text-decoration: underline;");

expandDeclarations(`margin: 10px 20px; padding: 1rem;`);

collapseDeclarations(`
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
`);
```

### Generic transformer

```ts
import { transformCss } from "@moyarich/css-expand-collapse";

transformCss(css, { mode: "expand" });
transformCss(css, { mode: "collapse" });
```

## Node.js

The transform APIs do not use `document` or `CSSStyleDeclaration`:

```ts
import {
  expandShorthand,
  supportsPureTransform,
} from "@moyarich/css-expand-collapse";

supportsPureTransform("background"); // true
supportsPureTransform("animation");  // true
supportsPureTransform("font");       // true
supportsPureTransform("grid");       // true

expandShorthand("transition", "opacity 200ms ease");
```

Both ESM and CommonJS package entries are provided.

## `getComputedStyle()`

The package accepts the same read-only shape returned by `window.getComputedStyle()`:

```ts
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

This is useful for inspectors and visual CSS editors where browser-computed longhand values need to be grouped back into editable shorthand controls.

## Chrome extensions / Manifest V3

The package can be bundled into Chrome extension content scripts, DevTools pages, popups, side panels, and background service workers.

For an inspector such as `element-inspector`:

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

A Manifest V3 service worker can transform CSS strings or declaration objects without `document`:

```ts
import {
  expandDeclarations,
  supportsTransform,
} from "@moyarich/css-expand-collapse";

supportsTransform("background"); // true

expandDeclarations("text-decoration: underline;");
```

`supportsTransform()` reports whether the package implements a shorthand transform.

## Runtime-neutral complex shorthands

CSSTree-backed property modules handle complex grammar such as multi-layer and slash-separated values. Examples include:

- `background` and `mask`
- `animation` and `transition`
- `border-image` and `mask-border`
- `font`, `font-variant`, and `font-synthesis`
- `grid`, `grid-template`, and `grid-area`
- `offset`
- `list-style`
- `text-emphasis`
- scroll/view timelines

System-font keywords such as `font: menu` are user-agent dependent and cannot be deterministically decomposed outside a browser. Explicit `font` shorthand values are supported.

## API

```ts
isShorthand(property)
isLonghand(property)
getLonghands(shorthand)
getShorthands(longhand)
supportsTransform(property)
supportsPureTransform(property)

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

## License

MIT
