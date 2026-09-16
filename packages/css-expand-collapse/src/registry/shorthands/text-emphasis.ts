import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["text-emphasis-style", "text-emphasis-color"] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
