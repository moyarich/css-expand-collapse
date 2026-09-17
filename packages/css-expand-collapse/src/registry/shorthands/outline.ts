import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["outline-width", "outline-style", "outline-color"] as const;
const initialValues = ["medium", "none", "auto"] as const;
const expand = expandTriple(longhands, ["medium", "none", "auto"]);

const collapse = collapseTriple(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
