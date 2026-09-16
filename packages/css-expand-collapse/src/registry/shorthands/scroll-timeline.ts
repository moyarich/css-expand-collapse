import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("scroll-timeline", cssom(["scroll-timeline-name", "scroll-timeline-axis"]));

export default shorthand;
