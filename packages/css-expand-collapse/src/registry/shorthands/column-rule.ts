import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["column-rule-width", "column-rule-style", "column-rule-color"] as const;
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
