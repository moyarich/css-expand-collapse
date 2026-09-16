import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("gap", { longhands: ["row-gap", "column-gap"], strategy: "pair" });

export default shorthand;
