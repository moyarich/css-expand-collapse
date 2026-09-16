import { defineShorthand } from "../define.js";
import { logicalBorderSide } from "../helpers.js";

const shorthand = defineShorthand("border-block-start", { longhands: logicalBorderSide("block-start"), strategy: "triple" });

export default shorthand;
