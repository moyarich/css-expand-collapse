import { expandCss } from "@moyarich/css-expand-collapse";

const css = expandCss(`
  .card {
    margin: 12px 24px;
    text-decoration: underline wavy purple;
  }
`);

console.log(css);
