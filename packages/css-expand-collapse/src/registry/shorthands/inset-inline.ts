import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["inset-inline-start", "inset-inline-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", initialValues, expand } satisfies ShorthandModule;
