import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("padding-inline", { longhands: logicalPair("padding", "inline"), strategy: "pair" });

export default shorthand;
