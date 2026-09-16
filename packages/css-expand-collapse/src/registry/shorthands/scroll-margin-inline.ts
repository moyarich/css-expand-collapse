import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("scroll-margin-inline", { longhands: logicalPair("scroll-margin", "inline"), strategy: "pair" });

export default shorthand;
