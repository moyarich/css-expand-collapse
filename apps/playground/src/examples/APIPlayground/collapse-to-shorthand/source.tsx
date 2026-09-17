import { collapseToShorthand } from "@moyarich/css-expand-collapse";

const result = collapseToShorthand("margin", {
  "margin-right": "24px",
  "margin-bottom": "12px",
  "margin-left": "67px",
});

console.log(result);
