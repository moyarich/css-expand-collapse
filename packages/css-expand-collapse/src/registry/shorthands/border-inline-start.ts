import { logicalBorderSide } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: logicalBorderSide("inline-start"), strategy: "triple" } satisfies ShorthandDefinition;
