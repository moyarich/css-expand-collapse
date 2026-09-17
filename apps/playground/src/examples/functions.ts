export interface FunctionExample {
  id: string;
  label: string;
  description: string;
  source: string;
}

export const FUNCTION_EXAMPLES: readonly FunctionExample[] = [
  {
    id: "is-shorthand",
    label: "isShorthand()",
    description: "Check whether a property is a registered CSS shorthand.",
    source: `import { isShorthand } from "@moyarich/css-expand-collapse";

console.log(isShorthand("margin"));
console.log(isShorthand("margin-top"));`,
  },
  {
    id: "is-longhand",
    label: "isLonghand()",
    description: "Check whether a property is registered as a shorthand constituent.",
    source: `import { isLonghand } from "@moyarich/css-expand-collapse";

console.log(isLonghand("margin-top"));
console.log(isLonghand("margin"));`,
  },
  {
    id: "get-longhands",
    label: "getLonghands()",
    description: "Get the longhand properties owned by a shorthand.",
    source: `import { getLonghands } from "@moyarich/css-expand-collapse";

console.log(getLonghands("margin"));`,
  },
  {
    id: "get-shorthands",
    label: "getShorthands()",
    description: "Get the shorthands that can include a longhand property.",
    source: `import { getShorthands } from "@moyarich/css-expand-collapse";

console.log(getShorthands("margin-top"));`,
  },
  {
    id: "supports-transform",
    label: "supportsTransform()",
    description: "Check whether the package implements a shorthand transform.",
    source: `import { supportsTransform } from "@moyarich/css-expand-collapse";

console.log("background:", supportsTransform("background"));
console.log("animation:", supportsTransform("animation"));
console.log("margin-top:", supportsTransform("margin-top"));`,
  },
  {
    id: "expand-shorthand",
    label: "expandShorthand()",
    description: "Expand one shorthand value into its registered longhands.",
    source: `import { expandShorthand } from "@moyarich/css-expand-collapse";

const result = expandShorthand("text-decoration", "underline wavy purple");
console.log(result);`,
  },
  {
    id: "collapse-to-shorthand",
    label: "collapseToShorthand()",
    description: "Collapse a declaration map into one requested shorthand.",
    source: `import { collapseToShorthand } from "@moyarich/css-expand-collapse";

const result = collapseToShorthand("margin", {
  "margin-right": "24px",
  "margin-bottom": "12px",
  "margin-left": "67px",
});

console.log(result);`,
  },
  {
    id: "find-collapsible-shorthands",
    label: "findCollapsibleShorthands()",
    description: "Find every shorthand that can be reconstructed from a declaration map.",
    source: `import { findCollapsibleShorthands } from "@moyarich/css-expand-collapse";

const results = findCollapsibleShorthands({
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  "padding-top": "8px",
  "padding-right": "16px",
  "padding-bottom": "8px",
  "padding-left": "16px",
});

console.log(results);`,
  },
  {
    id: "collapse-longhands",
    label: "collapseLonghands()",
    description: "Collapse every safe longhand group in a declaration object.",
    source: `import { collapseLonghands } from "@moyarich/css-expand-collapse";

const result = collapseLonghands({
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "red",
});

console.log(result);`,
  },
  {
    id: "expand-css",
    label: "expandCss()",
    description: "Expand shorthand declarations in a complete stylesheet.",
    source: `import { expandCss } from "@moyarich/css-expand-collapse";

const css = expandCss(\`
  .card {
    margin: 12px 24px;
    text-decoration: underline wavy purple;
  }
\`);

console.log(css);`,
  },
  {
    id: "collapse-css",
    label: "collapseCss()",
    description: "Collapse compatible longhands in a complete stylesheet.",
    source: `import { collapseCss } from "@moyarich/css-expand-collapse";

const css = collapseCss(\`
  .card {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
  }
\`);

console.log(css);`,
  },
  {
    id: "transform-css",
    label: "transformCss()",
    description: "Use the generic stylesheet transformer with an explicit mode.",
    source: `import { transformCss } from "@moyarich/css-expand-collapse";

const source = \`.card { margin: 10px 20px; }\`;

console.log(transformCss(source, { mode: "expand" }));
console.log(transformCss(source, { mode: "collapse" }));`,
  },
  {
    id: "expand-declarations",
    label: "expandDeclarations()",
    description: "Expand shorthand declarations without wrapping them in a selector.",
    source: `import { expandDeclarations } from "@moyarich/css-expand-collapse";

const css = expandDeclarations(\`
  margin: 12px 24px;
  text-decoration: underline wavy purple;
\`);

console.log(css);`,
  },
  {
    id: "collapse-declarations",
    label: "collapseDeclarations()",
    description: "Collapse a longhand declaration fragment to compact shorthands.",
    source: `import { collapseDeclarations } from "@moyarich/css-expand-collapse";

const css = collapseDeclarations(\`
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
\`);

console.log(css);`,
  },
  {
    id: "style-to-declarations",
    label: "styleToDeclarations()",
    description: "Convert a read-only computed-style shape to a plain declaration map.",
    source: `import {
  styleToDeclarations,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

const values: Record<string, string> = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "rgb(255, 0, 0)",
};
const properties = Object.keys(values);
const style: ReadonlyStyleDeclaration = {
  length: properties.length,
  item: (index) => properties[index] ?? "",
  getPropertyValue: (property) => values[property] ?? "",
};

console.log(styleToDeclarations(style));`,
  },
  {
    id: "get-computed-longhands",
    label: "getComputedLonghands()",
    description: "Read only the computed longhands registered for one shorthand.",
    source: `import {
  getComputedLonghands,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

const values: Record<string, string> = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};
const properties = Object.keys(values);
const style: ReadonlyStyleDeclaration = {
  length: properties.length,
  item: (index) => properties[index] ?? "",
  getPropertyValue: (property) => values[property] ?? "",
};

console.log(getComputedLonghands(style, "margin"));`,
  },
  {
    id: "collapse-computed-style",
    label: "collapseComputedStyle()",
    description: "Collapse one shorthand from a read-only computed-style shape.",
    source: `import {
  collapseComputedStyle,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

const values: Record<string, string> = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};
const properties = Object.keys(values);
const style: ReadonlyStyleDeclaration = {
  length: properties.length,
  item: (index) => properties[index] ?? "",
  getPropertyValue: (property) => values[property] ?? "",
};

console.log(collapseComputedStyle(style, "margin"));`,
  },
  {
    id: "collapse-computed-styles",
    label: "collapseComputedStyles()",
    description: "Collapse multiple requested shorthands from one computed-style shape.",
    source: `import {
  collapseComputedStyles,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

const values: Record<string, string> = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  "padding-top": "8px",
  "padding-right": "16px",
  "padding-bottom": "8px",
  "padding-left": "16px",
};
const properties = Object.keys(values);
const style: ReadonlyStyleDeclaration = {
  length: properties.length,
  item: (index) => properties[index] ?? "",
  getPropertyValue: (property) => values[property] ?? "",
};

console.log(collapseComputedStyles(style, ["margin", "padding"]));`,
  },
  {
    id: "split-top-level-whitespace",
    label: "splitTopLevelWhitespace()",
    description: "Split a CSS value on top-level whitespace while preserving nested functions and strings.",
    source: `import { splitTopLevelWhitespace } from "@moyarich/css-expand-collapse";

console.log(
  splitTopLevelWhitespace('calc(100% - 2rem) "hello world" center'),
);`,
  },
];

export const DEFAULT_FUNCTION_EXAMPLE = FUNCTION_EXAMPLES.find(
  (example) => example.id === "expand-shorthand",
)!;

export function getFunctionExample(id: string): FunctionExample | undefined {
  return FUNCTION_EXAMPLES.find((example) => example.id === id);
}
