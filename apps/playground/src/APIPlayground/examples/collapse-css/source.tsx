import { collapseCss } from "@moyarich/css-expand-collapse";

const css = collapseCss(`
  .card {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
  }
`);

console.log(css);
