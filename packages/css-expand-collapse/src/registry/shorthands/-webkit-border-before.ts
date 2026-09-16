import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("-webkit-border-before", { longhands: ["-webkit-border-before-width", "-webkit-border-before-style", "-webkit-border-before-color"], strategy: "triple" });

export default shorthand;
