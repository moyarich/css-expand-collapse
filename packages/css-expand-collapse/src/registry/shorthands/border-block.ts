import { expandLogicalBorderAxis } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = [
  "border-block-start-width", "border-block-start-style", "border-block-start-color",
  "border-block-end-width", "border-block-end-style", "border-block-end-color",
] as const;
const expand = expandLogicalBorderAxis(longhands);

export default { longhands, strategy: "logical-border-axis", expand } satisfies ShorthandModule;
