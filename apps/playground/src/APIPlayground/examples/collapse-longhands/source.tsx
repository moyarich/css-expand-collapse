import { collapseLonghands } from "@moyarich/css-expand-collapse";

const result = collapseLonghands({
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "red",
});

console.log(result);
