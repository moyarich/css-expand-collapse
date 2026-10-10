import { collapseToShorthand } from "@moyarich/css-expand-collapse";

// collapseToShorthand() targets one shorthand. Missing registered longhands use
// their module-owned initial values unless fillMissingLonghands is false.
const result = collapseToShorthand("margin", {
  "margin-right": "24px",
  "margin-bottom": "12px",
  "margin-left": "67px",
});

// The result includes the shorthand, represented longhands, and consumed input.
console.log(result);
