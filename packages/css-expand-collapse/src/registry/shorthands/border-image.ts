import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("border-image", cssom(["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"]));

export default shorthand;
