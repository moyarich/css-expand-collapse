import { defineShorthand } from "../define.js";
import { sideBorder } from "../helpers.js";

const shorthand = defineShorthand("border-left", { longhands: sideBorder("left"), strategy: "triple" });

export default shorthand;
