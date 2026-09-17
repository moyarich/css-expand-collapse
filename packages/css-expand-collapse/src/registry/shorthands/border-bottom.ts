import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import { sideBorder } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = sideBorder("bottom");
const initialValues = ["medium", "none", "currentcolor"] as const;
const expand = expandTriple(longhands, initialValues);

const collapse = collapseTriple(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
