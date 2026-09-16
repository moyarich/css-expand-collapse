import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("scroll-margin", { longhands: quad("scroll-margin"), strategy: "quad" });

export default shorthand;
