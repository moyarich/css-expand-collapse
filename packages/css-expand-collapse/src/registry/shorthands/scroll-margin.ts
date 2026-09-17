import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["scroll-margin-top", "0"],
  ["scroll-margin-right", "0"],
  ["scroll-margin-bottom", "0"],
  ["scroll-margin-left", "0"],
] as const);
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
