import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("grid", cssom(["grid-auto-columns", "grid-auto-flow", "grid-auto-rows", "grid-template-areas", "grid-template-columns", "grid-template-rows"]));

export default shorthand;
