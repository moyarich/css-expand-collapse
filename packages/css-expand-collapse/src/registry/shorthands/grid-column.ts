import { defineShorthand } from "../define.js";
import { slashPair } from "../helpers.js";

const shorthand = defineShorthand("grid-column", slashPair(["grid-column-start", "grid-column-end"], ["auto", "auto"]));

export default shorthand;
