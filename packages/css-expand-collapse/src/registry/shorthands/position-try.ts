import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("position-try", cssom(["position-try-order", "position-try-fallbacks"]));

export default shorthand;
