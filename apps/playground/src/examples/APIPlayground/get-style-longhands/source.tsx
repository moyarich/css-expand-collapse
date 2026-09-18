import {
  getStyleLonghands,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

// getStyleLonghands() reads only the registered longhands for one shorthand
// from a CSSStyleDeclaration-compatible object.
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

// Only margin-* declarations are returned.
console.log(getStyleLonghands(style, "margin"));
