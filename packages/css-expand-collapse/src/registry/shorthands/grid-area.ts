import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("grid-area", cssom(["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"]));

export default shorthand;
