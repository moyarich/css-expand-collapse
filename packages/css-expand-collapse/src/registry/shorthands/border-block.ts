import { collapseLogicalBorderAxis } from "../collapsers.js";
import { expandLogicalBorderAxis } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = [
  "border-block-start-width", "border-block-start-style", "border-block-start-color",
  "border-block-end-width", "border-block-end-style", "border-block-end-color",
] as const;
const expand = expandLogicalBorderAxis(longhands);

const collapse = collapseLogicalBorderAxis(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
