import { logicalBorderSide } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalBorderSide("block-start"), strategy: "triple" } satisfies ShorthandDefinition;
