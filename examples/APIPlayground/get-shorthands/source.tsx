import { getShorthands } from "@moyarich/css-expand-collapse";

// A longhand may participate in more than one shorthand. getShorthands()
// returns every registered shorthand that can represent the supplied property.
console.log(getShorthands("margin-top"));
