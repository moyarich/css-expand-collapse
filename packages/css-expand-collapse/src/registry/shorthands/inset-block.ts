import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["inset-block-start", "inset-block-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
