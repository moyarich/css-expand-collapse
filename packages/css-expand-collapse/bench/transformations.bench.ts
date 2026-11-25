import { bench, describe } from "vitest";
import {
  collapseCss,
  collapseDeclarations,
  collapseLonghands,
  collapseToShorthand,
  expandCss,
  expandDeclarations,
  expandShorthand,
  expandShorthands,
} from "../src/index.js";

const declarations = {
  margin: "8px 16px",
  padding: "4px",
  background: "linear-gradient(red, blue) center / cover, white",
  transition: "opacity 1s, color 2s",
};
const expanded = expandShorthands(declarations);
const fragment = Object.entries(declarations)
  .map(([property, value]) => property + ":" + value)
  .join(";");
const expandedFragment = expandDeclarations(fragment);
const stylesheet = Array.from({ length: 40 }, (_, index) =>
  `.item-${index} { ${fragment}; margin-top: ${index}px; }`,
).join("\n");
const expandedStylesheet = expandCss(stylesheet);
const uniqueValues = Array.from({ length: 256 }, (_, index) => `${index}px ${index + 1}px`);
let cursor = 0;
const options = { customProperties: { "--space": "8px" } };

describe("property transformations", () => {
  bench("expand repeated margin", () => { expandShorthand("margin", "8px 16px"); });
  bench("expand rotating margin inputs", () => {
    expandShorthand("margin", uniqueValues[cursor++ % uniqueValues.length]!);
  });
  bench("collapse margin", () => { collapseToShorthand("margin", expanded); });
  bench("resolve scoped variable", () => { expandShorthand("margin", "var(--space)", options); });
  bench("invalid shorthand", () => { expandShorthand("margin", "red"); });
  bench("unsupported property", () => { expandShorthand("unknown-property", "0"); });
});

describe("declaration transformations", () => {
  bench("expand map", () => { expandShorthands(declarations); });
  bench("collapse map", () => { collapseLonghands(expanded); });
  bench("expand fragment", () => { expandDeclarations(fragment); });
  bench("collapse fragment", () => { collapseDeclarations(expandedFragment); });
});

describe("stylesheet transformations", () => {
  bench("expand 40 rules", () => { expandCss(stylesheet); });
  bench("collapse 40 rules", () => { collapseCss(expandedStylesheet); });
});
