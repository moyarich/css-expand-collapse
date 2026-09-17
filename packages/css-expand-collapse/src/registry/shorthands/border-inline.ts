import { collapseLogicalBorderAxis } from "../collapsers.js";
import { expandLogicalBorderAxis } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = [
  "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
  "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",
] as const;
const expand = expandLogicalBorderAxis(longhands);

const collapse = collapseLogicalBorderAxis(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
