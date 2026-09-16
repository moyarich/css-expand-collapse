# css-expand-collapse

Bidirectional CSS shorthand/longhand utilities for property values, declaration objects, full stylesheets, and browser computed styles.

Built on [CSSTree](https://github.com/csstree/csstree) for CSS parsing, generation, and grammar matching.

## Install

```bash
npm install @moyarich/css-expand-collapse
```

## Goals

- Recognize CSS shorthand properties.
- Expand shorthand declarations into longhands.
- Collapse compatible longhands back into a shorthand.
- Accept real CSS, not only property/value objects.
- Work directly with the `CSSStyleDeclaration` returned by `getComputedStyle()`.
- Preserve CSS cascade semantics when transforming stylesheets.
- Use browser CSSOM as an optional fallback for complex browser-supported shorthands.

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

### Collapse

```ts
collapseToShorthand("margin", {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
});
```

```ts
{
  property: "margin",
  value: "10px 20px",
  consumed: [
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left"
  ],
  declarations: {
    "margin-top": "10px",
    "margin-right": "20px",
    "margin-bottom": "10px",
    "margin-left": "20px"
  }
}
```

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

Produces semantically equivalent CSS with supported shorthands expanded to longhands.

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

The generated formatting is controlled by CSSTree, so whitespace may be normalized.

The collapse pass is intentionally conservative. Longhands are collapsed only when they are contiguous and have the same `!important` priority. This prevents a transformation from changing cascade behavior.

### Declaration fragments

```ts
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

### Generic transformer

```ts
import { transformCss } from "@moyarich/css-expand-collapse";

transformCss(css, { mode: "expand" });
transformCss(css, { mode: "collapse" });
```

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
// { property: "margin", value: "10px 20px", ... }

styleToDeclarations(computed);
// Record<string, string>
```

This is useful for inspectors and visual CSS editors where browser-computed longhand values need to be grouped back into editable shorthand controls.

## Browser CSSOM fallback

Some CSS shorthands have complex grammars (`background`, `animation`, `transition`, and others). In a browser, the library can use a mutable `CSSStyleDeclaration` as a standards-aware fallback.

By default it creates a detached element when `document` is available. You can also provide your own mutable style object:

```ts
const scratch = document.createElement("div").style;

expandShorthand("transition", "opacity 200ms ease", {
  style: scratch,
});
```

The pure JavaScript strategies do not require a DOM and currently cover the common shorthand families used by CSS inspectors, including:

- `margin`, `padding`, `inset`
- logical block/inline margin, padding, inset, scroll-margin, and scroll-padding
- `border`, border sides, `border-width`, `border-style`, `border-color`, `border-radius`
- `outline`, `column-rule`
- `gap`, `overflow`, `overscroll-behavior`
- `place-content`, `place-items`, `place-self`
- `flex-flow`
- `text-decoration`
- `-webkit-text-stroke`

The shorthand registry recognizes the shorthand names listed by MDN even when a shorthand currently relies on browser CSSOM for transformation.

## API

```ts
isShorthand(property)
isLonghand(property)
getLonghands(shorthand)
getShorthands(longhand)
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

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

## License

MIT
