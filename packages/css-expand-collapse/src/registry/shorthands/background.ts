import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("background", cssom(["background-image", "background-position", "background-size", "background-repeat", "background-origin", "background-clip", "background-attachment", "background-color"]));

export default shorthand;
