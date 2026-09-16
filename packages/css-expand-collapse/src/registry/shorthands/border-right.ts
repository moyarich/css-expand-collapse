import { defineShorthand } from "../define.js";
import { sideBorder } from "../helpers.js";

const shorthand = defineShorthand("border-right", { longhands: sideBorder("right"), strategy: "triple" });

export default shorthand;
