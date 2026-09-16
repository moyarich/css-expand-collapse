import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalPair("scroll-padding", "inline"), strategy: "pair" } satisfies ShorthandDefinition;
