export interface FunctionExample {
  id: string;
  label: string;
  description: string;
  source: string;
}

export const FUNCTION_EXAMPLES: readonly FunctionExample[] = [
  {
    id: "expand-shorthand",
    label: "expandShorthand()",
    description: "Expand one shorthand value into its registered longhands.",
    source: `import { expandShorthand } from "@moyarich/css-expand-collapse";

const result = expandShorthand("text-decoration", "underline wavy purple");
console.log(result);`,
  },
  {
    id: "collapse-shorthand",
    label: "collapseToShorthand()",
    description: "Collapse a declaration map into one requested shorthand.",
    source: `import { collapseToShorthand } from "@moyarich/css-expand-collapse";

const result = collapseToShorthand("margin", {
  "margin-top": "12px",
  "margin-right": "24px",
  "margin-bottom": "12px",
  "margin-left": "24px",
});

console.log(result);`,
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
    id: "collapse-computed-export",
    label: "fillMissingLonghands",
    description: "Use registered initial values when compacting computed/export CSS.",
    source: `import { collapseToShorthand } from "@moyarich/css-expand-collapse";

const result = collapseToShorthand(
  "background",
  {
    "background-image": "none",
    "background-color": "rgba(0, 0, 0, 0)",
  },
  { fillMissingLonghands: "initial" },
);

console.log(result);`,
  },
  {
    id: "inspect-support",
    label: "Inspect shorthand support",
    description: "Query the registry and inspect a shorthand's longhands.",
    source: `import {
  getLonghands,
  isShorthand,
  supportsTransform,
} from "@moyarich/css-expand-collapse";

console.log("background is shorthand:", isShorthand("background"));
console.log("background transforms:", supportsTransform("background"));
console.log("background longhands:", getLonghands("background"));`,
  },
];

export const DEFAULT_FUNCTION_EXAMPLE = FUNCTION_EXAMPLES[0]!;

export function getFunctionExample(id: string): FunctionExample | undefined {
  return FUNCTION_EXAMPLES.find((example) => example.id === id);
}
