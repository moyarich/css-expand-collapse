import { findCollapsibleShorthands } from "@moyarich/css-expand-collapse";

const results = findCollapsibleShorthands({
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  "padding-top": "8px",
  "padding-right": "16px",
  "padding-bottom": "8px",
  "padding-left": "16px",
});

console.log(results);
