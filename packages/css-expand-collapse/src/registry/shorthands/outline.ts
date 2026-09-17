import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["outline-width", "outline-style", "outline-color"] as const;
const expand = expandTriple(longhands, ["medium", "none", "auto"]);

export default { longhands, strategy: "triple", expand } satisfies ShorthandModule;
