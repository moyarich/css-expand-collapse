import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalPair("padding", "block"), strategy: "pair" } satisfies ShorthandDefinition;
