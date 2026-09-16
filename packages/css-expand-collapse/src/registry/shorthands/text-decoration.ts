import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("text-decoration", { longhands: ["text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-thickness"], strategy: "text-decoration" });

export default shorthand;
