import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["overscroll-behavior-x", "overscroll-behavior-y"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
