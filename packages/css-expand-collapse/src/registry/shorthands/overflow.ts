import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["overflow-x", "overflow-y"] as const;
const initialValues = ["visible", "visible"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
