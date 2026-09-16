import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("place-content", { longhands: ["align-content", "justify-content"], strategy: "pair" });

export default shorthand;
