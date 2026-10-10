import {
  collapseStyleDeclarations,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

// This style contains enough longhands to build both margin and padding.
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

// Pass a shorthand list when you only want selected collapse candidates.
console.table(collapseStyleDeclarations(style, ["margin", "padding"]));
