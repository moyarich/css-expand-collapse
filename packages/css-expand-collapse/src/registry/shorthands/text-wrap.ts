import { defineShorthand } from "../define.js";
import { components } from "../helpers.js";

const shorthand = defineShorthand("text-wrap", components(["text-wrap-mode", "text-wrap-style"], ["wrap", "auto"]));

export default shorthand;
