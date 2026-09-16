import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("grid-template", cssom(["grid-template-rows", "grid-template-columns", "grid-template-areas"]));

export default shorthand;
