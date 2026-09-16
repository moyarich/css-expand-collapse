import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("scroll-padding-block", { longhands: logicalPair("scroll-padding", "block"), strategy: "pair" });

export default shorthand;
