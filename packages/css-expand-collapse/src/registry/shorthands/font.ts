import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("font", cssom(["font-family", "font-size", "font-width", "font-style", "font-variant", "font-weight", "line-height"]));

export default shorthand;
