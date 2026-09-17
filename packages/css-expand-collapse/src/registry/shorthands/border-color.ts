import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-top-color", "currentcolor"],
  ["border-right-color", "currentcolor"],
  ["border-bottom-color", "currentcolor"],
  ["border-left-color", "currentcolor"],
] as const);
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
