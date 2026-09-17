import { collapseComponents } from "../collapsers.js";
import { expandComponents } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["-webkit-text-stroke-width", "0"],
  ["-webkit-text-stroke-color", "currentcolor"],
] as const);
const expand = expandComponents(longhands);

const collapse = collapseComponents(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
