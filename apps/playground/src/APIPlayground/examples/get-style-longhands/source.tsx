import {
  getStyleLonghands,
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

console.log(getStyleLonghands(style, "margin"));
