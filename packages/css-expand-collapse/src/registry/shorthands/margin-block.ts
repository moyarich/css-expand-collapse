import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("margin-block", { longhands: logicalPair("margin", "block"), strategy: "pair" });

export default shorthand;
