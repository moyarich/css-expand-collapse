import {
  styleToDeclarations,
  type ReadonlyStyleDeclaration,
} from "@moyarich/css-expand-collapse";

// styleToDeclarations() converts a CSSStyleDeclaration-compatible object into
// the package's plain DeclarationMap representation.
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

console.log(styleToDeclarations(style));
