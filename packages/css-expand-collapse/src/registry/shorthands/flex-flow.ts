import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("flex-flow", { longhands: ["flex-direction", "flex-wrap"], strategy: "flex-flow" });

export default shorthand;
