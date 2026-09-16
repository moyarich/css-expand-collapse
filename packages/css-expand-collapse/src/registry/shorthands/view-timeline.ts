import { defineShorthand } from "../define.js";
import { cssom } from "../helpers.js";

const shorthand = defineShorthand("view-timeline", cssom(["view-timeline-name", "view-timeline-axis", "view-timeline-inset"]));

export default shorthand;
