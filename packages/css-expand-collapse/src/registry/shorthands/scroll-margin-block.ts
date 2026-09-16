import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("scroll-margin-block", { longhands: logicalPair("scroll-margin", "block"), strategy: "pair" });

export default shorthand;
