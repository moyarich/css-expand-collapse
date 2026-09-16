import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "font-family",
  "font-size",
  "font-width",
  "font-style",
  "font-variant",
  "font-weight",
  "line-height",
] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
