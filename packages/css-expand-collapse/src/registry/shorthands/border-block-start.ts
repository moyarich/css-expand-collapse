import { expandTriple } from "../expanders.js";
import { logicalBorderSide } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalBorderSide("block-start");
const expand = expandTriple(longhands);

export default { longhands, strategy: "triple", expand } satisfies ShorthandModule;
