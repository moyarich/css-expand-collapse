import { findCollapsibleShorthands } from "@moyarich/css-expand-collapse";

// This function discovers every registered shorthand that can be represented by
// the supplied longhands. It does not mutate or replace the input declarations.
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

// Each result describes the shorthand value and which inputs it would consume.
console.table(results);
