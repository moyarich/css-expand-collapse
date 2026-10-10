import { expandCss } from "@moyarich/css-expand-collapse";

// expandCss() parses a complete stylesheet and expands supported shorthands
// without removing the surrounding selector/rule structure.
const css = expandCss(`
  .card {
    margin: 12px 24px;
    text-decoration: underline wavy purple;
  }
`);

// margin and text-decoration are emitted as their registered longhands.
console.log(css);
