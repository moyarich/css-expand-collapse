import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("overscroll-behavior", { longhands: ["overscroll-behavior-x", "overscroll-behavior-y"], strategy: "pair" });

export default shorthand;
