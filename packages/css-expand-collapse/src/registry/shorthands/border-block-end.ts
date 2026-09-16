import { defineShorthand } from "../define.js";
import { logicalBorderSide } from "../helpers.js";

const shorthand = defineShorthand("border-block-end", { longhands: logicalBorderSide("block-end"), strategy: "triple" });

export default shorthand;
