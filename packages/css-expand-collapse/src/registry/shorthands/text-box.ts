import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["text-box-trim", "text-box-edge"] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
