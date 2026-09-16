import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("font-synthesis", cssom(["font-synthesis-weight", "font-synthesis-style", "font-synthesis-small-caps", "font-synthesis-position"]));

export default shorthand;
