import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("place-self", { longhands: ["align-self", "justify-self"], strategy: "pair" });

export default shorthand;
