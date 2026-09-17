import { collapseLogicalBorderAxis } from "../collapsers.js";
import { expandLogicalBorderAxis } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = [
  "border-block-start-width", "border-block-start-style", "border-block-start-color",
  "border-block-end-width", "border-block-end-style", "border-block-end-color",
] as const;
const initialValues = ["medium", "none", "currentcolor", "medium", "none", "currentcolor"] as const;
const expand = expandLogicalBorderAxis(longhands, initialValues);

const collapse = collapseLogicalBorderAxis(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
