import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("column-rule", { longhands: ["column-rule-width", "column-rule-style", "column-rule-color"], strategy: "triple" });

export default shorthand;
