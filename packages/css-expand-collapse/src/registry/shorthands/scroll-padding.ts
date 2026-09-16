import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("scroll-padding", { longhands: quad("scroll-padding"), strategy: "quad" });

export default shorthand;
