import { collapseLogicalBorderAxis } from "../collapsers.js";
import { expandLogicalBorderAxis } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-inline-start-width", "medium"],
  ["border-inline-start-style", "none"],
  ["border-inline-start-color", "currentcolor"],
  ["border-inline-end-width", "medium"],
  ["border-inline-end-style", "none"],
  ["border-inline-end-color", "currentcolor"],
] as const);
const expand = expandLogicalBorderAxis(longhands);

const collapse = collapseLogicalBorderAxis(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
