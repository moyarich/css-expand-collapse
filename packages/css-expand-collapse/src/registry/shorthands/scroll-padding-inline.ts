import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalPair("scroll-padding", "inline");
const initialValues = ["auto", "auto"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
