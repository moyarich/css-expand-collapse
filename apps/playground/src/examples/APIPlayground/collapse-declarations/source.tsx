import { collapseDeclarations } from "@moyarich/css-expand-collapse";

const css = collapseDeclarations(`
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
`);

console.log(css);
