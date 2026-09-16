import { defineShorthand } from "../define.js";
import { sideBorder } from "../helpers.js";

const shorthand = defineShorthand("border-bottom", { longhands: sideBorder("bottom"), strategy: "triple" });

export default shorthand;
