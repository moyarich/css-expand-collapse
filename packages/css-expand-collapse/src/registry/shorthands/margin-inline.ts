import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalPair("margin", "inline"), strategy: "pair" } satisfies ShorthandDefinition;
