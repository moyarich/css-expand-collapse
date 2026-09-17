import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["column-rule-width", "column-rule-style", "column-rule-color"] as const;
const expand = expandTriple(longhands);

export default { longhands, strategy: "triple", expand } satisfies ShorthandModule;
