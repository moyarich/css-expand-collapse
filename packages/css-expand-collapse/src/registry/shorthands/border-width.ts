import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("border-width", { longhands: quad("border").map((p) => `${p}-width`), strategy: "quad" });

export default shorthand;
