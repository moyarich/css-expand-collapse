import { expandDeclarations } from "@moyarich/css-expand-collapse";

const css = expandDeclarations(`
  margin: 12px 24px;
  text-decoration: underline wavy purple;
`);

console.log(css);
