import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalPair("scroll-padding", "block"), strategy: "pair" } satisfies ShorthandDefinition;
