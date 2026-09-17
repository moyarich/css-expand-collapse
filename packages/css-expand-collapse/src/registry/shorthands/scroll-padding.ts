import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["scroll-padding-top", "auto"],
  ["scroll-padding-right", "auto"],
  ["scroll-padding-bottom", "auto"],
  ["scroll-padding-left", "auto"],
] as const);
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
