import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("border-block", { longhands: ["border-block-start-width", "border-block-start-style", "border-block-start-color", "border-block-end-width", "border-block-end-style", "border-block-end-color"], strategy: "logical-border-axis" });

export default shorthand;
