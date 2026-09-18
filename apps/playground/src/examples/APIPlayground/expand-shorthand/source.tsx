import { expandShorthand } from "@moyarich/css-expand-collapse";

// expandShorthand() targets one shorthand/value pair and returns a structured
// result containing the normalized property, original value, and longhands.
const result = expandShorthand(
  "text-decoration",
  "underline wavy purple",
);

console.log(result);
