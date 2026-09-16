import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("place-items", { longhands: ["align-items", "justify-items"], strategy: "pair" });

export default shorthand;
