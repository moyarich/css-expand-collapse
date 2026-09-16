import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("border-inline", { longhands: ["border-inline-start-width", "border-inline-start-style", "border-inline-start-color", "border-inline-end-width", "border-inline-end-style", "border-inline-end-color"], strategy: "logical-border-axis" });

export default shorthand;
