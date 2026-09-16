import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("border-style", { longhands: quad("border").map((p) => `${p}-style`), strategy: "quad" });

export default shorthand;
