import { defineShorthand } from "../define.js";
import { slashPair } from "../helpers.js";

const shorthand = defineShorthand("container", slashPair(["container-name", "container-type"], ["none", "normal"]));

export default shorthand;
