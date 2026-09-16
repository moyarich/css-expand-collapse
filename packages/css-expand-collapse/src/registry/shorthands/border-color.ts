import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("border-color", { longhands: quad("border").map((p) => `${p}-color`), strategy: "quad" });

export default shorthand;
