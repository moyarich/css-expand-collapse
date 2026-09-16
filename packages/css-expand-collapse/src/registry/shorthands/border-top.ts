import { defineShorthand } from "../define.js";
import { sideBorder } from "../helpers.js";

const shorthand = defineShorthand("border-top", { longhands: sideBorder("top"), strategy: "triple" });

export default shorthand;
