import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-block-end-width", "medium"],
  ["border-block-end-style", "none"],
  ["border-block-end-color", "currentcolor"],
] as const);
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
