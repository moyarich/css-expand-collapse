import { collapseCss } from "@moyarich/css-expand-collapse";

// collapseCss() transforms a complete stylesheet, so selectors and rule
// structure are preserved while compatible longhands become shorthands.
const css = collapseCss(`
  .card {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
  }
`);

// The four margin longhands can be represented as: margin: 10px 20px.
console.log(css);
