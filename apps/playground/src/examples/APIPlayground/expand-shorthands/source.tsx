import { expandShorthands } from "@moyarich/css-expand-collapse";

const result = expandShorthands({
  margin: "10px 20px",
  color: "red",
});

console.log(result);
