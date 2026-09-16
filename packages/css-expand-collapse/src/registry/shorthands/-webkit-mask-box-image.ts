import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("-webkit-mask-box-image", cssom(["-webkit-mask-box-image-source", "-webkit-mask-box-image-slice", "-webkit-mask-box-image-width", "-webkit-mask-box-image-outset", "-webkit-mask-box-image-repeat"]));

export default shorthand;
