import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("padding-block", { longhands: logicalPair("padding", "block"), strategy: "pair" });

export default shorthand;
