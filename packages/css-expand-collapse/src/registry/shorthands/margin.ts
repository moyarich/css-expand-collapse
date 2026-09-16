import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("margin", { longhands: quad("margin"), strategy: "quad" });

export default shorthand;
