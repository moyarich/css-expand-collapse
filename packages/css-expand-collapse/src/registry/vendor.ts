import { unsupported } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const VENDOR_SHORTHANDS: ShorthandDefinitionMap = {
  "-webkit-text-stroke": unsupported([
    "-webkit-text-stroke-width",
    "-webkit-text-stroke-color",
  ]),
  "-webkit-border-before": unsupported([
    "-webkit-border-before-width",
    "-webkit-border-before-style",
    "-webkit-border-before-color",
  ]),
  "-webkit-mask-box-image": unsupported([
    "-webkit-mask-box-image-source",
    "-webkit-mask-box-image-slice",
    "-webkit-mask-box-image-width",
    "-webkit-mask-box-image-outset",
    "-webkit-mask-box-image-repeat",
  ]),
};
