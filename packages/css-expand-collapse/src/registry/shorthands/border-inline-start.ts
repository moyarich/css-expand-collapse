import { defineShorthand } from "../define.js";
import { logicalBorderSide } from "../helpers.js";

const shorthand = defineShorthand("border-inline-start", { longhands: logicalBorderSide("inline-start"), strategy: "triple" });

export default shorthand;
