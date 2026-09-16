import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("offset", cssom(["offset-anchor", "offset-distance", "offset-path", "offset-position", "offset-rotate"]));

export default shorthand;
