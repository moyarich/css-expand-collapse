import {
  collapseStyleDeclaration,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

// ReadonlyStyleDeclaration is the minimal style interface used by the package.
// A real CSSStyleDeclaration from element.style or getComputedStyle() also fits.
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

// Collapse only the requested shorthand and return its value plus metadata.
console.log(collapseStyleDeclaration(style, "margin"));
