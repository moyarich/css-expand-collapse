import { defineShorthand } from "../define.js";
import { components } from "../helpers.js";

const shorthand = defineShorthand("-webkit-text-stroke", components(["-webkit-text-stroke-width", "-webkit-text-stroke-color"], ["0", "currentcolor"]));

export default shorthand;
