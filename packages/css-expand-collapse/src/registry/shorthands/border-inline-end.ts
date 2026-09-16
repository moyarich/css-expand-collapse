import { defineShorthand } from "../define.js";
import { logicalBorderSide } from "../helpers.js";

const shorthand = defineShorthand("border-inline-end", { longhands: logicalBorderSide("inline-end"), strategy: "triple" });

export default shorthand;
