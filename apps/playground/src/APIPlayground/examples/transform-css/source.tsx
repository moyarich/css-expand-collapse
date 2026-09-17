import { transformCss } from "@moyarich/css-expand-collapse";

const source = `.card { margin: 10px 20px; }`;

console.log(transformCss(source, { mode: "expand" }));
console.log(transformCss(source, { mode: "collapse" }));
