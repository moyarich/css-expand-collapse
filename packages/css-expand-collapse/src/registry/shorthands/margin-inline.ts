import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("margin-inline", { longhands: logicalPair("margin", "inline"), strategy: "pair" });

export default shorthand;
