import { defineShorthand } from "../define.js";
import { logicalPair } from "../helpers.js";

const shorthand = defineShorthand("scroll-padding-inline", { longhands: logicalPair("scroll-padding", "inline"), strategy: "pair" });

export default shorthand;
