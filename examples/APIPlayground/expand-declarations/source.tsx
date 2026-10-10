import { expandDeclarations } from "@moyarich/css-expand-collapse";

// Use expandDeclarations() when the input is declaration text rather than a
// complete stylesheet. Each supported shorthand expands in declaration order.
const css = expandDeclarations(`
  margin: 12px 24px;
  text-decoration: underline wavy purple;
`);

console.log(css);
