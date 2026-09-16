import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("outline", { longhands: ["outline-width", "outline-style", "outline-color"], strategy: "triple" });

export default shorthand;
