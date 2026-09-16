import { defineShorthand } from "../define.js";
import { quad } from "../helpers.js";

const shorthand = defineShorthand("padding", { longhands: quad("padding"), strategy: "quad" });

export default shorthand;
