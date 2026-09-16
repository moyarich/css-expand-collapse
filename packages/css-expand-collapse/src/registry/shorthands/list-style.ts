import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("list-style", cssom(["list-style-position", "list-style-image", "list-style-type"]));

export default shorthand;
