import { collapseDeclarations } from "@moyarich/css-expand-collapse";

// collapseDeclarations() accepts declaration text without a selector or braces.
// Compatible longhand groups are replaced by their shortest safe shorthand.
const css = collapseDeclarations(`
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
`);

// Expected shorthand value: padding: 8px 16px.
console.log(css);
