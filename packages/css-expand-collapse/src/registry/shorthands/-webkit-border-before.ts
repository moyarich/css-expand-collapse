import { expandTriple } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = [
  "-webkit-border-before-width",
  "-webkit-border-before-style",
  "-webkit-border-before-color",
] as const;
const expand = expandTriple(longhands);

export default { longhands, strategy: "triple", expand } satisfies ShorthandModule;
