import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-block-start-width", "medium"],
  ["border-block-start-style", "none"],
  ["border-block-start-color", "currentcolor"],
] as const);
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
