import { transformCss } from "@moyarich/css-expand-collapse";

const source = `.card { margin: 10px 20px; }`;

// transformCss() provides one entry point when the mode is selected at runtime.
// Expanding the shorthand produces margin longhands.
console.group("Expand");
console.log(transformCss(source, { mode: "expand" }));
console.groupEnd();

// Collapse mode is safe on the same input; there are no margin longhands to
// replace, so the existing shorthand remains intact.
console.group("Collapse");
console.log(transformCss(source, { mode: "collapse" }));
console.groupEnd();
