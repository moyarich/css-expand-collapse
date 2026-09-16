import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("border-radius", { longhands: ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"], strategy: "quad" });

export default shorthand;
