import { defineShorthand } from "../define.js";
import { components } from "../helpers.js";

const shorthand = defineShorthand("columns", components(["column-width", "column-count"], ["auto", "auto"]));

export default shorthand;
