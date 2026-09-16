import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["list-style-position", "list-style-image", "list-style-type"] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
