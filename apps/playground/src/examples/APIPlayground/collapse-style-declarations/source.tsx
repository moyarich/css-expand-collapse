import {
  collapseStyleDeclarations,
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

console.log(collapseStyleDeclarations(style, ["margin", "padding"]));
