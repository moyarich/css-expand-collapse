import { expandCssom } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "-webkit-mask-box-image-source",
  "-webkit-mask-box-image-slice",
  "-webkit-mask-box-image-width",
  "-webkit-mask-box-image-outset",
  "-webkit-mask-box-image-repeat",
] as const;
const expand = expandCssom;

export default { longhands, strategy: "cssom", expand } satisfies ShorthandDefinition;
