import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-top-width", "medium"],
  ["border-right-width", "medium"],
  ["border-bottom-width", "medium"],
  ["border-left-width", "medium"],
] as const);
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
