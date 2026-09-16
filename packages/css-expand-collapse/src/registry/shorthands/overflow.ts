import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("overflow", { longhands: ["overflow-x", "overflow-y"], strategy: "pair" });

export default shorthand;
