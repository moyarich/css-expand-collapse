import { expandTriple } from "../expanders.js";
import { sideBorder } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = sideBorder("bottom");
const expand = expandTriple(longhands);

export default { longhands, strategy: "triple", expand } satisfies ShorthandModule;
