import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import { sideBorder } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = sideBorder("bottom");
const expand = expandTriple(longhands);

const collapse = collapseTriple(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
