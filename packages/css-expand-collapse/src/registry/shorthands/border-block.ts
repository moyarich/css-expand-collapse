import {
  collapseLogicalBorderAxis,
  expandLogicalBorderAxis,
} from "../families/logical-border-axis.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-block-start-width", "medium"],
  ["border-block-start-style", "none"],
  ["border-block-start-color", "currentcolor"],
  ["border-block-end-width", "medium"],
  ["border-block-end-style", "none"],
  ["border-block-end-color", "currentcolor"],
] as const);
const expand = expandLogicalBorderAxis(longhands);
const collapse = collapseLogicalBorderAxis(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
