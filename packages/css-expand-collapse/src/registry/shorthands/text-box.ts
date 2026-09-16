import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("text-box", cssom(["text-box-trim", "text-box-edge"]));

export default shorthand;
