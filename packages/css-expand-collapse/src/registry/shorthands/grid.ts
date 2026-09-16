import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
