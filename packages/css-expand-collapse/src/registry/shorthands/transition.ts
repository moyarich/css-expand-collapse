import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("transition", cssom(["transition-property", "transition-duration", "transition-timing-function", "transition-delay", "transition-behavior"]));

export default shorthand;
