import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("animation-range", cssom(["animation-range-start", "animation-range-end"]));

export default shorthand;
