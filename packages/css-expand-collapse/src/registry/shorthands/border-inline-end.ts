import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import { logicalBorderSide } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalBorderSide("inline-end");
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
