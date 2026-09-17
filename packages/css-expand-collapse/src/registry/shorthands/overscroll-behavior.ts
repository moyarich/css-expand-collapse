import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["overscroll-behavior-x", "overscroll-behavior-y"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
