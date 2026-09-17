import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-left-width", "medium"],
  ["border-left-style", "none"],
  ["border-left-color", "currentcolor"],
] as const);
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
