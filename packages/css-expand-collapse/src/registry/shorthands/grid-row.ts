import { defineShorthand } from "../define.js";
import { slashPair } from "../helpers.js";

const shorthand = defineShorthand("grid-row", slashPair(["grid-row-start", "grid-row-end"], ["auto", "auto"]));

export default shorthand;
