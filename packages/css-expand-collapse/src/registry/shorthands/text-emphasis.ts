import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("text-emphasis", cssom(["text-emphasis-style", "text-emphasis-color"]));

export default shorthand;
